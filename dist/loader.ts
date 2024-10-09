/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31, 2022-3-31 00:38:08, 2022-4-10 01:45:38, 2024-3-25 21:55:29
 */

// git config core.ignorecase false 大小写敏感
// npm publish --access=public

// --- 使用 loader 库则会自动支持 fetch 无需再做相关兼容性支持 ---

(function() {
    /** --- 获取当前 js 基路径 --- */
    const temp = document.querySelectorAll('script');
    const scriptEle = temp[temp.length - 1];
    /** --- 浏览器 location 的网址目录，以 / 结尾 --- */
    let location = window.location.href;
    const qio = location.indexOf('?');
    // --- 把 querystring 分离掉 ---
    if (qio > -1) {
        location = location.slice(0, qio);
    }
    // --- 如果不是 / 结尾则要变成 / 结尾 ---
    if (!location.endsWith('/')) {
        const lio = location.lastIndexOf('/');
        location = location.slice(0, lio + 1);
    }
    const loader: ILoader = {
        'isReady': false,
        'readys': [],
        'head': undefined,
        'cdn': 'https://cdn.jsdelivr.net',

        init: function() {
            const srcSplit = scriptEle.src.indexOf('?');
            const srcSearch = decodeURIComponent(scriptEle.src.slice(srcSplit));
            let path: string = '';
            if (srcSplit !== -1) {
                let match = /[?&]path=([\w./"'@:{}\-?=]+)/.exec(srcSearch);
                if (match) {
                    path = match[1];
                    if (!path.endsWith('.js')) {
                        path += '.js';
                    }
                }
                match = /[?&]cdn=([\w./"'@:{}\-?=]+)/.exec(srcSearch);
                if (match) {
                    this.cdn = this.urlResolve(window.location.href, match[1]);
                }
            }
            /** --- 文档装载完毕后需要执行的函数 --- */
            const run = async (): Promise<void> => {
                this.head = document.getElementsByTagName('head')[0];
                // --- 判断 fetch 是否存在 ---
                if (typeof fetch !== 'function') {
                    await this.loadScript(this.cdn + '/npm/whatwg-fetch@3.0.0/fetch.min.js');
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
                if (path) {
                    const map: Record<string, string> = {};
                    const files: Record<string, any> = {};
                    // --- URL 传入的 npm 版本号 ---
                    let match = /[?&]npm=([\w./"'@:{}\-?=, ]+)/.exec(srcSearch);
                    if (match) {
                        try {
                            match[1] = match[1].replace(/'/g, '"');
                            const npms = JSON.parse(match[1]);
                            await this.sniffNpm(npms, {
                                'files': files,
                                'map': map
                            });
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    // --- URL 传入的 map 参数 ---
                    match = /[?&]map=([\w./"'@:{}\-?=]+)/.exec(srcSearch);
                    if (match) {
                        match[1] = match[1].replace(/'/g, '"');
                        try {
                            const m = JSON.parse(match[1]);
                            for (const name in m) {
                                map[name] = m[name];
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    // --- 检查是否有 after ---
                    match = /[?&]after=([\w./"'@:{}\-?=]+)/.exec(srcSearch);
                    let after: undefined | string = undefined;
                    if (match) {
                        after = match[1];
                    }
                    await loader.sniffFiles([path], {
                        'files': files,
                        'map': map,
                        'after': after
                    });
                    loader.require(path, files, {
                        'map': map
                    });
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
                opt.dir = location;
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
                    // --- 去除 // 注释、/* 注释，换行统一为 \n ---
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
                    code = code.replace(/sourceMappingURL=([\w/.\-"'`]+)/, `sourceMappingURL=${dirname}/$1`);
                    // --- 将 es6 module 语法转换为 require 模式 ---
                    // --- import * as x from 'x' ---
                    code = code.replace(/import *\* *as *(\w+) +from *(["'`])([\w/.-]+)["'`]/g, 'const $1 = require($2$3$2)');
                    // --- import x from 'x' ---
                    code = code.replace(/import *(\w+) *from *(["'`])([\w/.-]+)["'`]/g, 'const $1 = require($2$3$2).default');
                    // --- ( import { x, x as y } / export { x, x as y } ) from 'x' ---
                    code = code.replace(/(import|export) *{(.+?)} *from *(["'`])([\w/.-]+)["'`]/g
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
                    code = code.replace(/(^|[\n; ])import *(['"].+?['"])/g,
                        function(t: string, t1: string, t2: string): string {
                            return `${t1}require(${t2})`;
                        }
                    );
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
                    code = code.replace(/export *\* *from *(["'`])([\w/.-]+)["'`]/g,
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
                            'style': ${opt.style ? '\'' + opt.style + '\'' : 'undefined'},
                            'invoke': __invoke,
                            'preprocess': __preprocess
                        });
                    }

                    function require(path) {
                        var m = loader.require(path, __files, {
                            'cache': __cache,
                            'map': __map,
                            'dir': __filename,
                            'style': ${opt.style ? '\'' + opt.style + '\'' : 'undefined'},
                            'invoke': __invoke,
                            'preprocess': __preprocess
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
var __dirname='${dirname}';var __filename='${path}';var module={exports:__cache['${path}']};var exports = module.exports;function importOverride(url){return loader.import(url,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke,'preprocess':__preprocess});}function require(path){var m=loader.require(path,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke,'preprocess':__preprocess});if(m[0]){return m[0];}else{throw 'Failed require "'+path+'" on "'+__filename+'" (Maybe file not found).';}}require.cache=__cache;
require.resolve=function(name){return loader.moduleNameResolve(name,__dirname,__map);};
${code}
${needExports.join('')}
return module.exports;`;
                    /** --- 先创建本文件的 cache 对象，以防止不断重复创建，模拟 node 创建流程 --- */
                    opt.cache[path] = {};
                    const rtn = (new Function('__files', '__cache', '__map', '__invoke', '__preprocess', code))(files, opt.cache, opt.map, opt.invoke, opt.preprocess);
                    if (rtn !== opt.cache[path]) {
                        opt.cache[path] = rtn;
                    }
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
                        const typeList = ['text/', 'javascript', 'json', 'css', 'xml', 'html'];
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

        get: async function(url: string, opt: {
            'credentials'?: 'include' | 'same-origin' | 'omit';
            'headers'?: HeadersInit;
        } = {}): Promise<Response | null> {
            try {
                const headers: HeadersInit = {};
                if (opt.headers) {
                    Object.assign(headers, opt.headers);
                }
                const res = await fetch(url, {
                    'method': 'GET',
                    'headers': headers,
                    'credentials': opt.credentials ?? 'include'
                });
                return res;
            }
            catch {
                return null;
            }
        },

        post: async function(url: string, data: Record<string, any> | FormData, opt: {
            'credentials'?: 'include' | 'same-origin' | 'omit';
            'headers'?: HeadersInit;
        } = {}): Promise<Response | null> {
            try {
                const headers: HeadersInit = {};
                if (!(data instanceof FormData)) {
                    headers['content-type'] = 'application/json';
                }
                if (opt.headers) {
                    Object.assign(headers, opt.headers);
                }
                const res = await fetch(url, {
                    'method': 'POST',
                    'headers': headers,
                    'body': data instanceof FormData ? data : JSON.stringify(data),
                    'credentials': opt.credentials ?? 'include'
                });
                return res;
            }
            catch {
                return null;
            }
        },

        getResponseJson: async function(url: string, opt: {
            'credentials'?: 'include' | 'same-origin' | 'omit';
            'headers'?: HeadersInit;
        } = {}) {
            const res = await this.get(url, opt);
            if (!res) {
                return null;
            }
            try {
                return await res.json();
            }
            catch {
                return null;
            }
        },

        postResponseJson: async function(url: string, data: Record<string, any> | FormData, opt: {
            'credentials'?: 'include' | 'same-origin' | 'omit';
            'headers'?: HeadersInit;
        } = {}): Promise<any | null> {
            const res = await this.post(url, data, opt);
            if (!res) {
                return null;
            }
            try {
                return await res.json();
            }
            catch {
                return null;
            }
        },

        fetchFiles: async function(urls: string[], opt: {
            'init'?: RequestInit;
            'load'?: (url: string) => void;
            'loaded'?: (url: string, state: number) => void;
            'dir'?: string;
            'files'?: Record<string, Blob | string>;
            'before'?: string;
            'after'?: string;
            'afterIgnore'?: RegExp;
            'adapter'?: (url: string) => string | Blob | null | Promise<string | Blob | null>;
        } = {}): Promise<Record<string, Blob | string>> {
            return new Promise<Record<string, Blob | string>>((resolve) => {
                if (!opt.init) {
                    opt.init = {};
                }
                if (opt.dir === undefined) {
                    opt.dir = location;
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
                    if (opt.load) {
                        opt.load(url);
                    }
                    else {
                        this.load?.(url);
                    }
                    let ourl = this.compressUrl(url);
                    if (opt.before) {
                        ourl = opt.before + ourl;
                    }
                    if (!opt.afterIgnore?.test(url) && !ourl.startsWith(this.cdn)) {
                        ourl += opt.after;
                    }
                    const success = (res: string | Blob | null): void => {
                        ++count;
                        if (res) {
                            list[url] = res;
                            if (opt.loaded) {
                                opt.loaded(url, 1);
                            }
                            else {
                                this.loaded?.(url, 1);
                            }
                            if (opt.files) {
                                opt.files[url] = res;
                            }
                        }
                        else {
                            if (opt.loaded) {
                                opt.loaded(url, 0);
                            }
                            else {
                                this.loaded?.(url, 0);
                            }
                        }
                        if (count === urls.length) {
                            resolve(list);
                        }
                    };
                    const fail = (): void => {
                        ++count;
                        if (opt.loaded) {
                            opt.loaded(url, -1);
                        }
                        else {
                            this.loaded?.(url, -1);
                        }
                        if (count === urls.length) {
                            resolve(list);
                        }
                    };
                    if (opt.adapter) {
                        const r = opt.adapter(ourl);
                        if (r instanceof Promise) {
                            r.then((res) => {
                                success(res);
                            }).catch(() => {
                                fail();
                            });
                        }
                        else {
                            success(r);
                        }
                    }
                    else {
                        this.fetch(opt.before + ourl, opt.init).then((res) => {
                            success(res);
                        }).catch(() => {
                            fail();
                        });
                    }
                }
            });
        },

        sniffNpm: async function(npms: Record<string, string>, opt: {
            'init'?: RequestInit;
            'load'?: (url: string) => void;
            'loaded'?: (url: string, state: number) => void;
            'dir'?: string;
            'files'?: Record<string, Blob | string>;
            'map'?: Record<string, string>;
            'before'?: string;
            'after'?: string;
            'afterIgnore'?: RegExp;
            'adapter'?: (url: string) => string | Blob | null | Promise<string | Blob | null>;
        } = {}): Promise<Record<string, Blob | string>> {
            if (!opt.map) {
                opt.map = {};
            }
            if (!opt.files) {
                opt.files = {};
            }
            const packages: string[] = [];
            for (const name in npms) {
                packages.push(`${this.cdn}/npm/${name}@${npms[name]}/package.json`);
            }
            const npmFiles = await this.fetchFiles(packages, {
                'init': opt.init,
                'load': opt.load,
                'loaded': opt.loaded,
                'dir': opt.dir,
                'files': opt.files,
                'before': opt.before,
                'after': opt.after,
                'afterIgnore': opt.afterIgnore,
                'adapter': opt.adapter
            });
            /** --- 将要嗅探的文件 --- */
            const sniffFiles: string[] = [];
            for (const name in npms) {
                const file = npmFiles[`${this.cdn}/npm/${name}@${npms[name]}/package.json`];
                if (typeof file !== 'string') {
                    continue;
                }
                try {
                    const json = JSON.parse(file);
                    const main = json.jsdelivr ? `${this.cdn}/npm/${name}@${npms[name]}/${json.jsdelivr}` : `${this.cdn}/npm/${name}@${npms[name]}/${json.main}`;
                    sniffFiles.push(main);
                    opt.map[name] = main;
                }
                catch (e) {
                    console.log(e);
                }
            }
            await this.sniffFiles(sniffFiles, {
                'init': opt.init,
                'load': opt.load,
                'loaded': opt.loaded,
                'dir': opt.dir,
                'files': opt.files,
                'before': opt.before,
                'after': opt.after,
                'afterIgnore': opt.afterIgnore,
                'adapter': opt.adapter
            });
            return opt.files;
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
            'afterIgnore'?: RegExp;
            'adapter'?: (url: string) => string | Blob | null | Promise<string | Blob | null>;
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
                'after': opt.after,
                'afterIgnore': opt.afterIgnore,
                'adapter': opt.adapter
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
                    reg = /(^|[ *}\n;])(from|import) *['"`]([\w/.-]+?)['"`]/g;
                    while ((match = reg.exec(item))) {
                        tmp.push(match[3]);
                    }
                    reg = /(^|[ *}\n;=(])require\(['"](.+?)['"]\)/g;
                    while ((match = reg.exec(item))) {
                        tmp.push(match[2]);
                    }
                }
                for (const t of tmp) {
                    if (/^[\w-]+$/.test(t) && (!opt.map?.[t])) {
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

        loadScript: function(url: string, el?: HTMLElement, module = false): Promise<boolean> {
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
                if (module) {
                    script.setAttribute('type', 'module');
                }
                script.addEventListener('load', function() {
                    resolve(true);
                });
                script.addEventListener('error', function() {
                    resolve(false);
                });
                script.src = this.compressUrl(url);
                el.appendChild(script);
            });
        },

        loadScripts: function(urls: string[], opt: {
            'loaded'?: (url: string, state: number) => void;
            'el'?: HTMLElement;
            'module'?: boolean;
        } = {}): Promise<void> {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadScript(url, opt.el, opt.module).then((res) => {
                        ++count;
                        if (res) {
                            if (opt.loaded) {
                                opt.loaded(url, 1);
                            }
                            else {
                                this.loaded?.(url, 1);
                            }
                        }
                        else {
                            if (opt.loaded) {
                                opt.loaded(url, 0);
                            }
                            else {
                                this.loaded?.(url, 0);
                            }
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(() => {
                        ++count;
                        if (opt.loaded) {
                            opt.loaded(url, -1);
                        }
                        else {
                            this.loaded?.(url, -1);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },

        loadLink: function(url: string, el?: HTMLElement, pos: 'before' | 'after' = 'after'): Promise<boolean> {
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
                const link = document.createElement('link');
                link.addEventListener('load', function() {
                    resolve(true);
                });
                link.addEventListener('error', function() {
                    resolve(false);
                });
                link.href = this.compressUrl(url);
                link.rel = 'stylesheet';
                if (pos === 'after') {
                    el.appendChild(link);
                }
                else {
                    // --- 之前 ---
                    if (el.firstChild) {
                        el.insertBefore(link, el.firstChild);
                    }
                    else {
                        el.appendChild(link);
                    }
                }
            });
        },

        loadLinks: function(urls: string[], opt: {
            'loaded'?: (url: string, state: number) => void;
            'el'?: HTMLElement;
        } = {}): Promise<void> {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadLink(url, opt.el).then((res) => {
                        ++count;
                        if (res) {
                            if (opt.loaded) {
                                opt.loaded(url, 1);
                            }
                            else {
                                this.loaded?.(url, 1);
                            }
                        }
                        else {
                            if (opt.loaded) {
                                opt.loaded(url, 0);
                            }
                            else {
                                this.loaded?.(url, 0);
                            }
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(() => {
                        ++count;
                        if (opt.loaded) {
                            opt.loaded(url, -1);
                        }
                        else {
                            this.loaded?.(url, -1);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },

        loadStyle: function(style: string, el?: HTMLElement): void {
            if (!el) {
                if (this.head) {
                    el = this.head;
                }
                else {
                    el = document.getElementsByTagName('head')[0];
                    this.head = el;
                }
            }
            const sel = document.createElement('style');
            sel.innerHTML = style;
            el.appendChild(sel);
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
                opt.dir = location;
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
            for (const key in map) {
                if (!path.startsWith(key)) {
                    continue;
                }
                let val = map[key];
                if (val.startsWith('.')) {
                    val = location + val;
                }
                path = val + path.slice(key.length);
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
            const rtn: ILoaderUrl = {
                'protocol': null,
                'auth': null,
                'user': null,
                'pass': null,
                'host': null,
                'hostname': null,
                'port': null,
                'pathname': '/',
                'path': null,
                'query': null,
                'hash': null
            };
            const hash = url.indexOf('#');
            if (hash > -1) {
                rtn['hash'] = url.slice(hash + 1);
                url = url.slice(0, hash);
            }
            const query = url.indexOf('?');
            if (query > -1) {
                rtn['query'] = url.slice(query + 1);
                url = url.slice(0, query);
            }
            const protocol = url.indexOf(':');
            if (protocol > -1) {
                rtn['protocol'] = url.slice(0, protocol + 1).toLowerCase();
                url = url.slice(protocol + 1);
                if (url.startsWith('//')) {
                    url = url.slice(2);
                }
                let path = url.indexOf('/');
                if (path === -1) {
                    path = url.indexOf('\\');
                }
                if (path > -1) {
                    rtn['pathname'] = url.slice(path);
                    url = url.slice(0, path);
                }
                const auth = url.indexOf('@');
                if (auth > -1) {
                    const authStr = url.slice(0, auth);
                    const authSplit = authStr.indexOf(':');
                    if (authSplit > -1) {
                        // --- 有密码 ---
                        rtn['user'] = authStr.slice(0, authSplit);
                        rtn['pass'] = authStr.slice(authSplit + 1);
                        rtn['auth'] = rtn['user'] + ':' + rtn['pass'];
                    }
                    else {
                        rtn['user'] = authStr;
                        rtn['auth'] = authStr;
                    }
                    url = url.slice(auth + 1);
                }
                if (url) {
                    const port = url.indexOf(':');
                    if (port > -1) {
                        rtn['hostname'] = url.slice(0, port).toLowerCase();
                        rtn['port'] = url.slice(port + 1);
                        rtn['host'] = rtn['hostname'] + (rtn['port'] ? ':' + rtn['port'] : '');
                    }
                    else {
                        rtn['hostname'] = url.toLowerCase();
                        rtn['host'] = rtn['hostname'];
                    }
                }
            }
            else {
                // --- 没有 protocol ---
                rtn['pathname'] = url;
            }
            // --- 组合 ---
            rtn['path'] = rtn['pathname'] + (rtn['query'] ? '?' + rtn['query'] : '');
            return rtn;
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
                return this.urlAtom(from);
            }
            // --- 获取 from 的 scheme, host, path ---
            const f = this.parseUrl(from);
            // --- 以 // 开头的，加上 from 的 protocol 返回 ---
            if (to.startsWith('//')) {
                return this.urlAtom(f.protocol ? f.protocol + to : to);
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
                return this.urlAtom(t.protocol + to.slice(t.protocol.length));
            }
            // --- # 或 ? 替换后返回 ---
            if (to.startsWith('#') || to.startsWith('?')) {
                const sp = from.indexOf(to[0]);
                if (sp !== -1) {
                    return this.urlAtom(from.slice(0, sp) + to);
                }
                else {
                    return this.urlAtom(from + to);
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
            // --- 返回最终结果 ---
            if (f.protocol && (f.protocol !== 'file:') && !f.host) {
                // --- 类似 c:/ ---
                return this.urlAtom(f.protocol + abs);
            }
            else {
                // --- 类似 http:// ---
                return this.urlAtom((f.protocol ? f.protocol + '//' : '') + abs);
            }
        },

        urlAtom: function(url: string): string {
            // --- 删掉 ./ ---
            while (url.includes('/./')) {
                url = url.replace(/\/\.\//g, '/');
            }
            // --- 删掉 ../ ---
            while (/\/(?!\.\.)[^/]+\/\.\.\//.test(url)) {
                url = url.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
            }
            url = url.replace(/\.\.\//g, '');
            return url;
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
            /*
            while (code.includes('\n\n')) {
                code = code.replace(/\n\n/, '\n');
            }
            */
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

        arrayTest: function(arr: string[], reg: RegExp): string | null {
            for (const item of arr) {
                if (reg.test(item)) {
                    return item;
                }
            }
            return null;
        },

        compressUrl: function(ourl: string): string {
            if (ourl.startsWith(this.cdn)) {
                if (ourl.endsWith('.js') && !ourl.endsWith('.min.js')) {
                    ourl = ourl.slice(0, -3) + '.min.js';
                }
                else if (ourl.endsWith('.css') && !ourl.endsWith('.min.css')) {
                    ourl = ourl.slice(0, -4) + '.min.css';
                }
            }
            return ourl;
        }
    };
    (window as any).loader = loader;
    // --- 运行初始化函数 ---
    loader.init();
})();
