/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31, 2022-3-31 00:38:08, 2022-4-10 01:45:38
 */

// git config core.ignorecase false 大小写敏感
// npm publish --access=public

// --- 使用 loader 库则会自动支持 fetch 无需再做相关兼容性支持 ---

(function() {
    /** --- 获取当前 js 基路径 --- */
    const temp = document.querySelectorAll('script');
    const scriptEle = temp[temp.length - 1];
    const loader: ILoader = {
        isReady: false,
        readys: [],
        head: undefined,

        init: function() {
            /** --- 文档装载完毕后需要执行的函数 --- */
            const run = async (): Promise<void> => {
                this.head = document.getElementsByTagName('head')[0];
                // --- 判断 fetch 是否存在 ---
                if (typeof fetch !== 'function') {
                    await this.loadScript('https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js');
                }
                this.isReady = true;
                for (const func of this.readys) {
                    const rtn = func();
                    if (rtn instanceof Promise) {
                        rtn.catch((e) => {
                            throw e;
                        });
                    }
                }
                // --- 检查有没有要自动执行的 js ---
                const srcSplit = scriptEle.src.lastIndexOf('?');
                if (srcSplit !== -1) {
                    const match = /[?&]path=([/-\w.]+)/.exec(scriptEle.src.slice(srcSplit));
                    if (match) {
                        let path = match[1];
                        if (!path.endsWith('.js')) {
                            path += '.js';
                        }
                        loader.sniffFiles([path]).then(function(files) {
                            loader.require(path, files);
                        }).catch(function(e) {
                            throw e;
                        });
                    }
                }
            };
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                run().catch(function(e) {
                    throw e;
                });
            }
            else {
                // --- 先等待文档装载完毕 ---
                document.addEventListener('DOMContentLoaded', run as () => void);
            }
        },

        ready: function(callback: () => void | Promise<void>): void {
            if (this.isReady) {
                const rtn = callback();
                if (rtn instanceof Promise) {
                    rtn.catch((e) => {
                        throw e;
                    });
                }
            }
            else {
                this.readys.push(callback);
            }
        },

        require: function(paths: string | string[], files: Record<string, Blob | string>, opt: {
            'cache'?: Record<string, any>;
            'map'?: Record<string, string>;
            'dir'?: string;
            'style'?: string;
            'invoke'?: Record<string, any>;
            'preprocess'?: (code: string, path: string) => string;
        } = {}): any[] {
            if (typeof paths === 'string') {
                paths = [paths];
            }
            if (opt.cache === undefined) {
                opt.cache = {};
            }
            if (opt.dir === undefined) {
                opt.dir = location.href;
            }
            if (opt.invoke === undefined) {
                opt.invoke = {};
            }
            let styleElement: HTMLStyleElement | null = null;
            if (opt.style) {
                styleElement = document.querySelector('style[name="' + opt.style + '"]');
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.setAttribute('name', opt.style);
                    const headElement = document.getElementsByTagName('head')[0];
                    if (headElement) {
                        headElement.append(styleElement);
                    }
                    else {
                        document.append(styleElement);
                    }
                }
            }
            // --- 返回的模块对象 ---
            const output: any[] = [];
            for (let path of paths) {
                path = this.moduleNameResolve(path, opt.dir, opt.map);
                // --- 文件压根不存在 ---
                if (!files[path] || typeof files[path] !== 'string') {
                    output.push(null);
                    continue;
                }
                // --- 判断是否执行过 ---
                if (opt.cache[path]) {
                    output.push(opt.cache[path]);
                    continue;
                }
                // --- 获取文本内容 string ---
                let code: string = files[path] as string;
                if (path.endsWith('.css')) {
                    if (styleElement) {
                        (async () => {
                            const reg = /url\(["']{0,1}(.+?)["']{0,1}\)/ig;
                            let match: RegExpExecArray | null = null;
                            while ((match = reg.exec(code))) {
                                const realPath: string = this.urlResolve(path, match[1]);
                                const file: Blob | null = (files[realPath] && files[realPath] instanceof Blob)
                                    ? files[realPath] as Blob : null;
                                if (file) {
                                    code = code.replace(match[0], `url('${await this.blob2DataUrl(file)}')`);
                                }
                            }
                            styleElement.append(code);
                        })().catch((e) => { throw e; });
                    }
                    output.push(code);
                }
                else if (code.startsWith('{') && code.endsWith('}')) {
                    // --- json 文件 ---
                    try {
                        const data = JSON.parse(code);
                        opt.cache[path] = data;
                        output.push(data);
                    }
                    catch {
                        output.push(null);
                    }
                }
                else {
                    /** --- 代码末尾需增加 exports.xxx = --- */
                    const needExports: string[] = [];
                    // --- 预处理代码 ---
                    if (opt.preprocess) {
                        code = opt.preprocess(code, path);
                    }
                    // --- 去除 // 注释、/* 注释 ---
                    code = this.removeComment(code);
                    // --- 先去除严格模式字符串 ---
                    let strict = '';
                    if (code.includes('"use strict"')) {
                        strict = '"use strict"\n';
                        code = code.replace(/"use strict"[\n;]{0,2}/, '');
                    }
                    /** --- 定义当前模块的 __dirname --- */
                    let dirname: string = '';
                    const plio = path.lastIndexOf('/');
                    if (plio !== -1) {
                        dirname = path.slice(0, plio);
                    }
                    // --- 处理 sourceMap ---
                    code = code.replace(/sourceMappingURL=([\S]+)/, `sourceMappingURL=${dirname}/$1`);
                    // --- 将 es6 module 语法转换为 require 模式 ---
                    // --- import * as x ---
                    code = code.replace(/import *\* *as *(\S+) +from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2)');
                    // --- import x from 'x' ---
                    code = code.replace(/import *(\S+) *from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2).default');
                    // --- ( import { x, x as y } / export { x, x as y } ) from 'x' ---
                    code = code.replace(/(import|export) *{(.+?)} *from *(["'])(\S+)["']/g
                        , function(t, t1: string, t2: string, t3: string, t4: string): string {
                            const tmpVar = `t${t4.replace(/[^a-zA-Z]/g, '')}_${Math.round(Math.random() * 10000)}`;
                            let txt = `const ${tmpVar} = require(${t3}${t4}${t3});`;
                            const list = t2.split(',');
                            for (let i = 0; i < list.length; ++i) {
                                list[i] = list[i].trim();
                                txt += t1 === 'import' ? 'const ' : 'exports.';
                                const reg: RegExpExecArray | null = /^(.+) +as +(.+)$/.exec(list[i]);
                                if (reg) {
                                    txt += `${reg[2]} = ${tmpVar}.${reg[1]};`;
                                }
                                else {
                                    txt += `${list[i]} = ${tmpVar}.${list[i]};`;
                                }
                            }
                            return txt.slice(0, -1);
                        }
                    );
                    // --- import x ---
                    code = code.replace(/import *(['"].+?['"])/g, function(t: string, t1: string): string {
                        return `require(${t1})`;
                    });
                    // --- import(x) ---
                    code = code.replace(/import\((.+?)\)/g, function(t: string, t1: string): string {
                        return `importOverride(${t1})`;
                    });
                    // --- export { a, b, c } ---
                    code = code.replace(/export *{(.+?)}/g, function(t, t1: string): string {
                        let txt = '';
                        const list = t1.split(',');
                        for (let i = 0; i < list.length; ++i) {
                            list[i] = list[i].trim();
                            txt += `exports.${list[i]} = ${list[i]};`;
                        }
                        return txt.slice(0, -1);
                    });
                    // --- expoer * from x ---
                    code = code.replace(/export *\* *from *(["'])(\S+)["']/g,
                        function(t: string, t1: string, t2: string): string {
                            return `var lrTmpList=require(${t1}${t2}${t1});var lrTmpKey;for(lrTmpKey in lrTmpList){exports[lrTmpKey]=lrTmpList[lrTmpKey];}`;
                        }
                    );
                    // --- export class xxx {}, export function a() {} ---
                    while (true) {
                        const match = /(export +)(class|function) +([\w$]+)[\s\S]+$/.exec(code);
                        if (!match) {
                            break;
                        }
                        let overCode: string = '';
                        /** --- 大括号，-1 代表还没有进入函数 / 类主体 --- */
                        let bigCount: number = -1;
                        /** --- 小括号，-1 代表进入了函数 / 类主体 --- */
                        let smallCount: number = 0;
                        /** --- 当前是否是字符串、正则 --- */
                        let isString: string = '';
                        let i: number = 0;
                        for (i = 0; i < match[0].length; ++i) {
                            const char = match[0][i];
                            if (isString !== '') {
                                // --- 字符串模式 ---
                                if ((char === isString) && (match[0][i - 1] !== '\\')) {
                                    isString = '';
                                }
                                overCode += char;
                            }
                            else {
                                switch (char) {
                                    case '"':
                                    case '`':
                                    case '\'': {
                                        isString = char;
                                        overCode += char;
                                        break;
                                    }
                                    case '{': {
                                        if (smallCount <= 0) {
                                            if (smallCount === 0) {
                                                smallCount = -1;
                                            }
                                            if (bigCount === -1) {
                                                bigCount = 1;
                                            }
                                            else {
                                                ++bigCount;
                                            }
                                        }
                                        overCode += char;
                                        break;
                                    }
                                    case '}': {
                                        if (smallCount <= 0) {
                                            --bigCount;
                                        }
                                        overCode += char;
                                        break;
                                    }
                                    case '(': {
                                        if (smallCount >= 0) {
                                            ++smallCount;
                                        }
                                        overCode += char;
                                        break;
                                    }
                                    case ')': {
                                        if (smallCount >= 0) {
                                            --smallCount;
                                        }
                                        overCode += char;
                                        break;
                                    }
                                    case '/': {
                                        // --- 判断是 reg 还是 / 除号 ---
                                        // --- 如果是 / 号前面必定有变量或数字，否则就是 reg ---
                                        for (let j = i - 1; j >= 0; --j) {
                                            if (match[0][j] === ' ' || match[0][j] === '\t') {
                                                continue;
                                            }
                                            if (match[0][j] === ')') {
                                                break;
                                            }
                                            if ((match[0][j] === '\n') || (!/\w/.test(match[0][j]))) {
                                                isString = char;
                                                break;
                                            }
                                            // --- 是除号 ---
                                            break;
                                        }
                                        overCode += char;
                                        break;
                                    }
                                    default: {
                                        overCode += char;
                                    }
                                }
                            }
                            if (bigCount === 0) {
                                // --- 函数 / class 体结束 ---
                                break;
                            }
                        }
                        code = code.slice(0, match.index) + overCode.slice(match[1].length) +
                            `exports.${match[3]} = ${match[3]};` + code.slice(match.index + i + 1);
                    }
                    // --- export default aaa ---
                    code = code.replace(/export default ([\w$]+)/g, 'exports.default = $1');
                    // --- export const {a, b} = x;, export let [a, b]; 等 ---
                    code = code.replace(/export +(\w+) *([{[])(.+?)([}\]])/g,
                        function(t, t1: string, t2: string, t3: string, t4: string): string {
                            const list = t3.split(',');
                            for (let i = 0; i < list.length; ++i) {
                                list[i] = list[i].trim();
                                needExports.push('exports.' + list[i] + ' = ' + list[i] + ';');
                            }
                            return t1 + ' ' + t2 + t3 + t4;
                        }
                    );
                    // --- export let a = 'qq'; export let a; ---
                    code = code.replace(/export +(\w+) +(\w+)/g, function(t: string, t1: string, t2: string): string {
                        if (!['let', 'var', 'const'].includes(t1)) {
                            return t;
                        }
                        needExports.push('exports.' + t2 + ' = ' + t2 + ';');
                        return t1 + ' ' + t2;
                    });

                    // --- 查看注入的函数和变量 ---
                    for (const ikey in opt.invoke) {
                        code = 'let ' + ikey + ' = __invoke.' + ikey + ';' + code;
                    }
                    // --- 组合最终 function 的字符串 ---
                    /*
                    code = `${strict}
                    var __dirname = '${dirname}';
                    var __filename = '${path}';
                    var module = {
                        exports: __cache['${path}']
                    };
                    var exports = module.exports;

                    function importOverride(url) {
                        return loader.import(url, __files, {
                            'cache': __cache,
                            'map': __map,
                            'dir': __filename,
                            'style': ${opt.style ? '\'' + opt.style + '\'' : 'undefined'}
                        });
                    }

                    function require(path) {
                        var m = loader.require(path, __files, {
                            'cache': __cache,
                            'map': __map,
                            'dir': __filename,
                            'style': ${opt.style ? '\'' + opt.style + '\'' : 'undefined'},
                            'invoke': __invoke
                        });
                        if (m[0]) {
                            return m[0];
                        }
                        else {
                            throw 'Failed require "' + path + '" on "' + __filename + '" (Maybe file not found).';
                        }
                    }
                    require.cache = __cache;
                    require.resolve = function(name) {
                        return loader.moduleNameResolve(name, __dirname, __map);
                    };

                    ${code}

                    ${needExports.join('')}

                    return module.exports;`;
                    */
                    code = `${strict}
var __dirname='${dirname}';var __filename='${path}';var module={exports:__cache['${path}']};var exports = module.exports;function importOverride(url){return loader.import(url,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'}});}function require(path){var m=loader.require(path,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke});if(m[0]){return m[0];}else{throw 'Failed require "'+path+'" on "'+__filename+'" (Maybe file not found).';}}require.cache=__cache;
require.resolve=function(name){return loader.moduleNameResolve(name,__dirname,__map);};
${code}
${needExports.join('')}
return module.exports;`;
                    /** --- 先创建本文件的 cache 对象，以防止不断重复创建，模拟 node 创建流程 --- */
                    opt.cache[path] = {};
                    opt.cache[path] = (new Function('__files', '__cache', '__map', '__invoke', code))(files, opt.cache, opt.map, opt.invoke);
                    output.push(opt.cache[path]);
                }
            }
            return output;
        },

        fetch: function(url: string, init: RequestInit = {}): Promise<string | Blob | null> {
            const initClone: RequestInit = {};
            Object.assign(initClone, init);
            if (init.credentials === undefined) {
                if (url.slice(0, 4).toLowerCase() === 'http') {
                    const m = /^(ht.+?\/\/.+?\/)/.exec(window.location.href.toLowerCase());
                    if (m && url.toLowerCase().startsWith(m[0])) {
                        initClone.credentials = 'include';
                    }
                }
                else {
                    initClone.credentials = 'include';
                }
            }
            return new Promise(function(resolve) {
                fetch(url, init).then(function(res: Response): Promise<string | Blob> | string {
                    if (res.status === 200 || res.status === 304) {
                        if (res.headers.get('content-type')?.toLowerCase().includes('image/')) {
                            return res.blob();
                        }
                        const typeList = ['text/', 'javascript', 'json', 'plain', 'css', 'xml', 'html'];
                        for (const item of typeList) {
                            if (res.headers.get('content-type')?.toLowerCase().includes(item)) {
                                return res.text();
                            }
                        }
                        return res.blob();
                    }
                    else {
                        resolve(null);
                        return '';
                    }
                }).then(function(text: string | Blob): void {
                    resolve(text);
                }).catch(function() {
                    resolve(null);
                });
            });
        },

        fetchFiles: async function(urls: string[], opt: {
            'init'?: RequestInit;
            'load'?: (url: string) => void;
            'loaded'?: (url: string, state: number) => void;
            'dir'?: string;
            'files'?: Record<string, Blob | string>;
            'before'?: string;
            'after'?: string;
        } = {}): Promise<Record<string, Blob | string>> {
            return new Promise<Record<string, Blob | string>>((resolve) => {
                if (!opt.init) {
                    opt.init = {};
                }
                if (opt.dir === undefined) {
                    opt.dir = location.href;
                }
                if (opt.before === undefined) {
                    opt.before = '';
                }
                if (opt.after === undefined) {
                    opt.after = '';
                }
                const list: Record<string, Blob | string> = {};
                let count = 0;
                for (let url of urls) {
                    url = this.urlResolve(opt.dir, url);
                    if (opt.files?.[url]) {
                        ++count;
                        if (count === urls.length) {
                            resolve(list);
                            return;
                        }
                        continue;
                    }
                    opt.load?.(url);
                    this.fetch(opt.before + url + opt.after, opt.init).then(function(res) {
                        ++count;
                        if (res) {
                            list[url] = res;
                            opt.loaded?.(url, 1);
                            if (opt.files) {
                                opt.files[url] = res;
                            }
                        }
                        else {
                            opt.loaded?.(url, 0);
                        }
                        if (count === urls.length) {
                            resolve(list);
                        }
                    }).catch(function() {
                        ++count;
                        opt.loaded?.(url, -1);
                        if (count === urls.length) {
                            resolve(list);
                        }
                    });
                }
            });
        },

        sniffFiles: async function(urls: string | string[], opt: {
            'init'?: RequestInit;
            'load'?: (url: string) => void;
            'loaded'?: (url: string, state: number) => void;
            'dir'?: string;
            'files'?: Record<string, Blob | string>;
            'map'?: Record<string, string>;
            'before'?: string;
            'after'?: string;
        } = {}): Promise<Record<string, Blob | string>> {
            if (typeof urls === 'string') {
                urls = [urls];
            }
            if (!opt.files) {
                opt.files = {};
            }
            const list = await this.fetchFiles(urls, {
                'init': opt.init,
                'load': opt.load,
                'loaded': opt.loaded,
                'dir': opt.dir,
                'files': opt.files,
                'before': opt.before,
                'after': opt.after
            });
            /** --- 下一层的文件 --- */
            const nlayer: string[] = [];
            for (const path in list) {
                const item = list[path];
                if (typeof item !== 'string') {
                    continue;
                }
                let reg: RegExp;
                let match: RegExpExecArray | null;
                const tmp = [];
                if (path.endsWith('.css')) {
                    reg = /url\(["']{0,1}(.+?)["']{0,1}\)/ig;
                    while ((match = reg.exec(item))) {
                        if (match[1].startsWith('data:')) {
                            continue;
                        }
                        tmp.push(match[1]);
                    }
                }
                else {
                    reg = /(from|import) +['"](.+?)['"]/g;
                    while ((match = reg.exec(item))) {
                        tmp.push(match[2]);
                    }
                    reg = /require\(['"](.+?)['"]\)/g;
                    while ((match = reg.exec(item))) {
                        tmp.push(match[1]);
                    }
                }
                for (const t of tmp) {
                    if (/^[\w-_]+$/.test(t) && (!opt.map || !opt.map[t])) {
                        continue;
                    }
                    const mnr = this.moduleNameResolve(t, path, opt.map);
                    if (!nlayer.includes(mnr)) {
                        nlayer.push(mnr);
                    }
                }
            }
            if (nlayer.length > 0) {
                Object.assign(list, await this.sniffFiles(nlayer, opt));
            }
            return list;
        },

        loadScript: function(url: string, el?: HTMLElement): Promise<boolean> {
            return new Promise((resolve) => {
                if (!el) {
                    if (this.head) {
                        el = this.head;
                    }
                    else {
                        el = document.getElementsByTagName('head')[0];
                        this.head = el;
                    }
                }
                const script = document.createElement('script');
                script.addEventListener('load', function() {
                    resolve(true);
                });
                script.addEventListener('error', function() {
                    resolve(false);
                });
                script.src = url;
                el.appendChild(script);
            });
        },

        loadScripts: function(urls: string[], opt: {
            'loaded'?: (url: string, state: number) => void;
            'el'?: HTMLElement;
        } = {}): Promise<void> {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadScript(url, opt.el).then(function(res) {
                        ++count;
                        if (res) {
                            opt.loaded?.(url, 1);
                        }
                        else {
                            opt.loaded?.(url, 0);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(function() {
                        ++count;
                        opt.loaded?.(url, -1);
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },

        import: async function(url: string, files: Record<string, Blob | string>, opt: {
            'cache'?: Record<string, any>;
            'map'?: Record<string, string>;
            'dir'?: string;
            'style'?: string;
            'invoke'?: Record<string, any>;
            'preprocess'?: (code: string, path: string) => string;
        } = {}): Promise<any> {
            if (opt.dir === undefined) {
                opt.dir = location.href;
            }
            url = this.moduleNameResolve(url, opt.dir, opt.map);
            if (files[url]) {
                return this.require(url, files, opt)[0];
            }
            else {
                // --- 从网络上请求 ---
                await this.sniffFiles(url, {
                    'dir': opt.dir,
                    'files': files
                });
                return this.require(url, files, opt)[0];
            }
        },

        // --- 内部 ---

        moduleNameResolve: function(path: string, dir: string, map: Record<string, string> = {}): string {
            // --- 查询是否有映射 ---
            if (map[path]) {
                path = map[path];
            }
            path = this.urlResolve(dir, path);
            // --- 是否自动加 index ---
            if (path.endsWith('/')) {
                path += 'index';
            }
            // --- 看是否要增加 .js ---
            let lio = path.lastIndexOf('/');
            const fname = lio === -1 ? path : path.slice(lio + 1);
            lio = fname.lastIndexOf('.');
            const fext = lio === -1 ? '' : fname.slice(lio + 1);
            if (!['js', 'json', 'css', 'ttf', 'png', 'gif', 'jpg', 'jpeg', 'svg'].includes(fext)) {
                path += '.js';
            }
            return path;
        },

        /**
         * --- 传输 url 并解析为 IUrl 对象 ---
         * @param url url 字符串
         */
        parseUrl: function(url: string): ILoaderUrl {
            // --- test: https://ab-3dc:aak9()$@github.com:80/nodejs/node/blob/master/lib/url.js?mail=abc@def.com#223 ---
            const u: ILoaderUrl = {
                'auth': null,
                'hash': null,
                'host': null,
                'hostname': null,
                'pass': null,
                'path': null,
                'pathname': '/',
                'protocol': null,
                'port': null,
                'query': null,
                'user': null
            };
            // --- http:, https: ---
            const protocol = /^(.+?)\/\//.exec(url);
            if (protocol) {
                u.protocol = protocol[1].toLowerCase();
                url = url.slice(protocol[0].length);
            }
            // --- 获取 path 开头的 / 的位置 ---
            const hostSp = url.indexOf('/');
            let left = url;
            if (hostSp !== -1) {
                left = url.slice(0, hostSp);
                url = url.slice(hostSp);
            }
            // --- auth: abc:def, abc ---
            if (left) {
                const leftArray = left.split('@');
                let host = left;
                if (leftArray[1]) {
                    const auth = leftArray[0].split(':');
                    u.user = auth[0];
                    if (auth[1]) {
                        u.pass = auth[1];
                    }
                    u.auth = u.user + (u.pass ? ':' + u.pass : '');
                    host = leftArray[1];
                }
                // --- host: www.host.com, host.com ---
                const hostArray = host.split(':');
                u.hostname = hostArray[0].toLowerCase();
                if (hostArray[1]) {
                    u.port = hostArray[1];
                }
                u.host = u.hostname + (u.port ? ':' + u.port : '');
            }
            // --- 是否有后面 ---
            if (hostSp === -1) {
                return u;
            }
            // --- path and query ---
            const paqArray = url.split('?');
            u.pathname = paqArray[0];
            if (paqArray[1]) {
                // --- query and hash ---
                const qahArray = paqArray[1].split('#');
                u.query = qahArray[0];
                if (qahArray[1]) {
                    u.hash = qahArray[1];
                }
            }
            u.path = u.pathname + (u.query ? '?' + u.query : '');
            return u;
        },

        /**
         * --- 将相对路径根据基准路径进行转换 ---
         * @param from 基准路径
         * @param to 相对路径
         */
        urlResolve: function(from: string, to: string): string {
            from = from.replace(/\\/g, '/');
            to = to.replace(/\\/g, '/');
            // --- to 为空，直接返回 form ---
            if (to === '') {
                return from;
            }
            // --- 获取 from 的 scheme, host, path ---
            const f = this.parseUrl(from);
            // --- 以 // 开头的，加上 from 的 protocol 返回 ---
            if (to.startsWith('//')) {
                return f.protocol ? f.protocol + to : to;
            }
            if (f.protocol) {
                // --- 获取小写的 protocol ---
                from = f.protocol + from.slice(f.protocol.length);
            }
            // --- 获取 to 的 scheme, host, path ---
            const t = this.parseUrl(to);
            // --- 已经是绝对路径，直接返回 ---
            if (t.protocol) {
                // --- 获取小写的 protocol ---
                return t.protocol + to.slice(t.protocol.length);
            }
            // --- # 或 ? 替换后返回 ---
            if (to.startsWith('#') || to.startsWith('?')) {
                const sp = from.indexOf(to[0]);
                if (sp !== -1) {
                    return from.slice(0, sp) + to;
                }
                else {
                    return from + to;
                }
            }
            // --- 处理后面的尾随路径 ---
            let abs = (f.auth ? f.auth + '@' : '') + (f.host ? f.host : '');
            if (to.startsWith('/')) {
                // -- abs 类似是 /xx/xx ---
                abs += to;
            }
            else {
                // --- to 是 xx/xx 这样的 ---
                // --- 移除基准 path 不是路径的部分，如 /ab/c 变成了 /ab，/ab 变成了 空 ---
                const path = f.pathname.replace(/\/[^/]*$/g, '');
                // --- abs 是 /xx/xx 了，因为如果 path 是空，则跟上了 /，如果 path 不为空，也是 / 开头 ---
                abs += path + '/' + to;
            }
            // --- 删掉 ./ ---
            abs = abs.replace(/\/\.\//g, '/');
            // --- 删掉 ../ ---
            while (/\/(?!\.\.)[^/]+\/\.\.\//.test(abs)) {
                abs = abs.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
            }
            // --- 剩下的 ../ 就是无效的直接替换为空 ---
            abs = abs.replace(/\.\.\//g, '');
            // --- 返回最终结果 ---
            if (f.protocol && (f.protocol !== 'file:') && !f.host) {
                // --- 类似 c:/ ---
                return f.protocol + abs;
            }
            else {
                // --- 类似 http:// ---
                return (f.protocol ? f.protocol + '//' : '') + abs;
            }
        },

        isEscapeChar: function(index: number, code: string): boolean {
            let preChar = code[index - 1];
            let count = 0;
            while (preChar === '\\') {
                preChar = code[index - (++count) - 1];
            }
            return count % 2 === 0 ? false : true;
        },

        removeComment: function(code: string): string {
            /** --- 是否是 /* * / 注释 --- */
            let isComment: boolean = false;
            /** --- 是否是 ` 字符串 --- */
            let isLineString: boolean = false;
            code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            code = code.replace(/.*(\n|$)/g, (t: string): string => {
                if (isComment && !t.includes('*/')) {
                    // --- 当前在 /* */ 中，但是当前行没有 */，直接返回空 ---
                    return '';
                }
                if (!isComment && !t.includes('/*') && !t.includes('//') && !t.includes('`')) {
                    // --- 既没有在 /* */ 中，也不含 /* // 或者 `，则无视 ---
                    return t;
                }
                /** --- 单行最终 code --- */
                let overCode: string = '';
                /** --- 是否是字符串 --- */
                let isString: string = '';
                /** --- 是否是正则 --- */
                let isReg = '';
                for (let i = 0; i < t.length; ++i) {
                    const char = t[i];
                    if (isLineString) {
                        if ((char === '`') && !this.isEscapeChar(i, t)) {
                            isLineString = false;
                        }
                        overCode += char;
                    }
                    else if (isReg !== '') {
                        if (char === '[') {
                            if (!this.isEscapeChar(i, t)) {
                                isReg = '[';
                            }
                        }
                        else if (char === ']') {
                            if (!this.isEscapeChar(i, t) && (isReg === '[')) {
                                isReg = '/';
                            }
                        }
                        else if (char === '/') {
                            if (!this.isEscapeChar(i, t) && (isReg === '/')) {
                                isReg = '';
                            }
                        }
                        overCode += char;
                    }
                    else if (isString !== '') {
                        if ((char === isString) && !this.isEscapeChar(i, t)) {
                            isString = '';
                        }
                        overCode += char;
                    }
                    else if (isComment) {
                        if (char === '/' && (t[i - 1] === '*')) {
                            isComment = false;
                        }
                    }
                    else {
                        switch (char) {
                            case '"':
                            case '\'': {
                                isString = char;
                                overCode += char;
                                break;
                            }
                            case '`': {
                                isLineString = true;
                                overCode += char;
                                break;
                            }
                            case '/': {
                                if (t[i + 1] === '/') {
                                    return overCode + '\n';
                                }
                                else if (t[i + 1] === '*') {
                                    isComment = true;
                                }
                                else {
                                    // --- 判断是 reg 还是 / 除号 ---
                                    // --- 如果是 / 号前面必定有变量或数字，否则就是 reg ---
                                    for (let j = i - 1; j >= 0; --j) {
                                        if (t[j] === ' ' || t[j] === '\t') {
                                            continue;
                                        }
                                        if (t[j] === ')') {
                                            break;
                                        }
                                        if ((t[j] === '\n') || (!/[\w$]/.test(t[j]))) {
                                            isReg = char;
                                            break;
                                        }
                                        // --- 是除号 ---
                                        break;
                                    }
                                    overCode += char;
                                }
                                break;
                            }
                            default: {
                                overCode += char;
                            }
                        }
                    }
                }
                return overCode;
            });
            while (code.includes('\n\n')) {
                code = code.replace(/\n\n/, '\n');
            }
            return code;
        },

        /**
         * --- 将 blob 对象转换为 text ---
         * @param blob 对象
         */
        blob2Text: function(blob: Blob): Promise<string> {
            return new Promise(function(resove) {
                const fr = new FileReader();
                fr.addEventListener('load', function(e) {
                    if (e.target) {
                        resove(e.target.result as string);
                    }
                    else {
                        resove('');
                    }
                });
                fr.readAsText(blob);
            });
        },

        /**
         * --- 将 blob 对象转换为 base64 url ---
         * @param blob 对象
         */
        blob2DataUrl: function(blob: Blob): Promise<string> {
            return new Promise(function(resove) {
                const fr = new FileReader();
                fr.addEventListener('load', function(e) {
                    if (e.target) {
                        resove(e.target.result as string);
                    }
                    else {
                        resove('');
                    }
                });
                fr.readAsDataURL(blob);
            });
        },

        /**
         * --- 在数组中找有没有相应的匹配值 ---
         * @param arr 数组
         * @param reg 正则
         */
        arrayTest: function(arr: string[], reg: RegExp): string | null {
            for (const item of arr) {
                if (reg.test(item)) {
                    return item;
                }
            }
            return null;
        }
    };
    (window as any).loader = loader;
    // --- 运行初始化函数 ---
    loader.init();
})();
