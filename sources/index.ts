/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31
 * Last: 2020-3-17 00:58:16, 2020-5-14 19:34:52, 2020-8-16 14:41:15
 */

// npm publish --access=public

// --- 使用 loader 库则会自动支持 fetch、Promise，无需再做相关兼容性支持 ---

const loader: ILoader = {
    isReady: false,
    readys: [],
    dir: '',

    config: {},

    loaded: {},

    run: function() {
        /** --- 文档装载完毕后需要执行的函数 --- */
        let runFun = (): void => {
            // --- 设置当前网址路径 ---
            if (window.location.href.endsWith('/')) {
                this.dir = window.location.href.slice(0, -1);
            }
            else {
                let lio = window.location.href.lastIndexOf('/');
                this.dir = window.location.href.slice(0, lio);
            }
            // --- 判断 Promise 是否存在 ---
            let hasPromise = true;
            let res = /Version\/([0-9.]+) Safari/.exec(navigator.userAgent);
            if (res) {
                let ver = parseFloat(res[1]);
                if (ver < 10) {
                    hasPromise = false;
                    (Promise as any) = undefined as any;
                }
            }
            else {
                if (!Promise) {
                    hasPromise = false;
                }
            }
            let next = async (): Promise<void> => {
                // --- 判断 fetch 是否存在 ---
                if (typeof fetch !== 'function') {
                    await this.loadScript(document.getElementsByTagName('head')[0], 'https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js');
                }
                this.isReady = true;
                for (let func of this.readys) {
                    const rtn = func();
                    if (rtn instanceof Promise) {
                        rtn.catch((e) => {
                            throw e;
                        });
                    }
                }
            };
            if (!hasPromise) {
                let script = document.createElement('script');
                script.addEventListener('load', function() {
                    const rtn = next();
                    if (rtn instanceof Promise) {
                        rtn.catch((e) => {
                            throw e;
                        });
                    }
                });
                script.addEventListener('error', function() {
                    alert('Network error.');
                });
                script.src = 'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js';
                document.getElementsByTagName('head')[0].appendChild(script);
            }
            else {
                const rtn = next();
                if (rtn instanceof Promise) {
                    rtn.catch((e) => {
                        throw e;
                    });
                }
            }
        };
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            runFun();
        }
        else {
            // --- 先等待文档装载完毕 ---
            document.addEventListener('DOMContentLoaded', runFun);
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

    setConfig: function(config: ILoaderConfig): void {
        if (config.after !== undefined) {
            this.config.after = config.after;
        }
        if (config.paths !== undefined) {
            this.config.paths = config.paths;
        }
    },

    setAfter: function(after: string): void {
        this.config.after = after;
    },

    setPaths: function(paths: ILoaderPaths): void {
        this.config.paths = paths;
    },

    addPath: function(name: string, path: string): void {
        if (this.config.paths) {
            this.config.paths[name] = path;
        }
        else {
            this.config.paths = {
                [name]: path
            };
        }
    },

    getLoadedPaths: function(): string[] {
        let paths: string[] = [];
        for (let path in this.loaded) {
            paths.push(path);
        }
        return paths;
    },

    require: async function(paths: string | string[], callback?: (...input: any[]) => void, error?: (path: string) => void): Promise<any[] | null> {
        if (typeof paths === 'string') {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let input: any[] = [];
        for (let path of paths) {
            let module = await this.loadModule(path, this.dir, {}, {});
            if (!module) {
                error?.(path);
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = (new Function('__filesLoaded', module.func))({});
            }
            input.push(module.object);
        }
        callback?.(...input);
        return input;
    },

    requireMemory: async function(paths: string | string[], files: Record<string, Blob | string>): Promise<any[] | null> {
        if (typeof paths === 'string') {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let input: any[] = [];
        let filesLoaded = {};
        for (let path of paths) {
            let module = await this.loadModule(path, '', files, filesLoaded);
            if (!module) {
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = (new Function('__filesLoaded', module.func))(filesLoaded);
            }
            input.push(module.object);
        }
        return input;
    },

    fetch: async function(url: string, init: RequestInit = {}): Promise<string | null> {
        if (init.credentials === undefined) {
            if (url.slice(0, 4).toLowerCase() === 'http') {
                let m = /^(ht.+?\/\/.+?\/)/.exec(window.location.href.toLowerCase());
                if (m && url.toLowerCase().startsWith(m[0])) {
                    init.credentials = 'include';
                }
            }
            else {
                init.credentials = 'include';
            }
        }
        return new Promise(function(resolve) {
            fetch(url, init).then(function(res: Response) {
                if (res.status === 200 || res.status === 304) {
                    return res.text();
                }
                else {
                    resolve(null);
                    return '';
                }
            }).then(function(text: string) {
                resolve(text);
            }).catch(function() {
                resolve(null);
            });
        });
    },

    loadScript: function(el: HTMLElement, path: string): Promise<boolean> {
        return new Promise(function(resolve) {
            let script = document.createElement('script');
            script.addEventListener('load', function() {
                resolve(true);
            });
            script.addEventListener('error', function() {
                resolve(false);
            });
            script.src = path;
            el.appendChild(script);
        });
    },

    getModule: function(path: string, dir: string, filesLoaded: {
        [path: string]: ILoaderModule;
    }): any {
        path = this.moduleName2Path(path, dir);
        let module!: ILoaderModule;
        if (filesLoaded[path]) {
            module = filesLoaded[path];
        }
        else if (this.loaded[path]) {
            module = this.loaded[path];
        }
        if (!module) {
            return null;
        }
        if (!module.first) {
            module.first = true;
            module.object = (new Function('__filesLoaded', module.func))(filesLoaded);
        }
        else {
            if (!module.object) {
                console.log('Loop containment is prohibited.');
                return {};
            }
        }
        return module.object;
    },

    // --- 内部 ---

    /**
     * --- 通过网络、内存加载 module 但不自动执行，已经加载过的不会重新加载 ---
     * @param path 模块地址、模块名或 code
     * @param dir 当前目录地址
     * @param files 内存中的文件列表
     * @param filesLoaded files 中的代替 _loaded 的作用
     */
    loadModule: async function(path: string, dir: string, files: Record<string, Blob | string>, filesLoaded: {
        [path: string]: ILoaderModule;
    }): Promise<ILoaderModule | null> {
        let inFiles: boolean = false;
        // --- parse module 的 path  ---
        path = this.moduleName2Path(path, dir);
        // --- 判断是否加载过 ---
        if (filesLoaded[path]) {
            return filesLoaded[path];
        }
        else if (this.loaded[path]) {
            return this.loaded[path];
        }
        // --- 加载文件 ---
        let code: string;
        if (files[path]) {
            inFiles = true;
            let blob = files[path];
            if (typeof blob === 'string') {
                code = blob;
            }
            else {
                code = await this.blob2Text(blob);
            }
        }
        else {
            let text = await this.fetch(path + (this.config.after ?? ''));
            if (!text) {
                return null;
            }
            code = text;
        }
        // --- 处理文件内容 ---
        code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        if (code.startsWith('{') && code.endsWith('}')) {
            // --- json 文件 ---
            try {
                let data = JSON.parse(code);
                if (inFiles) {
                    filesLoaded[path] = {
                        'first': true,
                        'func': '',
                        'object': data
                    };
                }
                else {
                    this.loaded[path] = {
                        'first': true,
                        'func': '',
                        'object': data
                    };
                }
            }
            catch {
                return null;
            }
        }
        else {
            // --- js 文件 ---
            if (inFiles) {
                filesLoaded[path] = {
                    'first': false,
                    'func': '',
                    'object': null
                };
            }
            else {
                this.loaded[path] = {
                    'first': false,
                    'func': '',
                    'object': null
                };
            }
            // --- 先去除严格模式字符串 ---
            let strict = '';
            if (code.indexOf('"use strict"') !== -1) {
                strict = '"use strict"\n';
                code = code.replace(/"use strict"\n?/, '');
            }
            /** --- 定义当前模块的 __dirname --- */
            let fdirname: string = '';
            let plio = path.lastIndexOf('/');
            if (plio !== -1) {
                fdirname = path.slice(0, plio);
            }
            // --- 处理 sourceMap ---
            code = code.replace(/sourceMappingURL=([\S]+)/, `sourceMappingURL=${fdirname}/$1`);
            // --- 将 es6 module 语法转换为 require 模式 ---
            // --- import * as x ---
            code = code.replace(/import *\* *as +(\S+) +from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2)');
            // --- ( import { x } / export { x } ) from 'x' ---
            code = code.replace(/(import|export) *{(.+?)} *from *(["'])(\S+)["']/g, function(t, t1: string, t2: string, t3: string, t4: string): string {
                let tmpVar = 't' + t4.replace(/[^a-zA-Z]/g, '') + '_' + Math.round(Math.random() * 10000);
                let txt = `const ${tmpVar} = require(${t3}${t4}${t3});`;
                let list = t2.split(',');
                for (let i = 0; i < list.length; ++i) {
                    list[i] = list[i].trim();
                    txt += t1 === 'import' ? 'const ' : 'exports.';
                    txt += `${list[i]} = ${tmpVar}.${list[i]};`;
                }
                return txt.slice(0, -1);
            });
            // --- export { a, b, c } ---
            code = code.replace(/export *{(.+?)}/g, function(t, t1: string): string {
                let txt = '';
                let list = t1.split(',');
                for (let i = 0; i < list.length; ++i) {
                    list[i] = list[i].trim();
                    txt += `exports.${list[i]} = ${list[i]};`;
                }
                return txt.slice(0, -1);
            });
            // --- export let a = 'qq' ---
            code = code.replace(/export +(\w+ +)*(\w+) *=/g, 'exports.$2 =');
            // --- export function a() {} ---
            code = code.replace(/export +function +(\w+)/g, 'exports.$1 = function');
            // --- 提取本文件的所有 require 同步函数并并行加载 ---
            let match;
            let reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
            let list: string[] = [];
            while ((match = reg.exec(code))) {
                list.push(match[1]);
            }
            if (list.length > 0) {
                await new Promise((resolve) => {
                    let now = 0;
                    for (let item of list) {
                        this.loadModule(item, fdirname, files, filesLoaded).then(() => {
                            ++now;
                            if (now === list.length) {
                                resolve();
                            }
                        }).catch(() => {
                            ++now;
                            if (now === list.length) {
                                resolve();
                            }
                        });
                    }
                });
            }

            // --- 组合最终 function 的字符串 ---
            code = `${strict}
            var __dirname = '${fdirname}';
            var __filename = '${path}';
            var module = {
                exports: {}
            };
            var exports = module.exports;

            function require(path) {
                var m = loader.getModule(path, __dirname, __filesLoaded);
                if (m) {
                    return m;
                } else {
                    throw 'Failed require.';
                }
            }

            ${code}

            return module.exports;`;
            if (inFiles) {
                filesLoaded[path].func = code;
            }
            else {
                this.loaded[path].func = code;
            }
        }
        if (inFiles) {
            return filesLoaded[path];
        }
        else {
            return this.loaded[path];
        }
    },

    /**
     * --- 相对路径、异常路径、模型名转换为最终实体 path ---
     * @param path 原 path
     * @param dirname 相对 __dirname
     */
    moduleName2Path: function(path: string, dirname: string): string {
        let paths = this.config.paths;
        // --- 查询是否有映射 ---
        if (paths?.[path]) {
            path = paths[path];
        }
        // --- 是否是相对路径 ---
        if (path.slice(0, 8).indexOf('//') === -1 && !path.startsWith('/')) {
            // --- 根据当前 dirname 的相对路径组合 ---
            path = dirname + '/' + path;
        }
        // --- 是否自动加 index ---
        if (path.endsWith('/')) {
            path += 'index';
        }
        // --- 去除 ./ ---
        path = path.replace(/\/\.\//g, '/');
        // --- 去除 ../ ---
        while (/\/(?!\.\.)[^/]+\/\.\.\//.test(path)) {
            path = path.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
        }
        // --- 看是否要增加 .js ---
        if (!path.endsWith('.json') && !path.endsWith('.js')) {
            path += '.js';
        }
        return path;
    },

    /**
     * --- 将 blob 对象转换为 text ---
     * @param blob 对象
     */
    blob2Text: function(blob: Blob): Promise<string> {
        return new Promise(function(resove) {
            let fr = new FileReader();
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
    }

};

// --- 运行初始化函数 ---
loader.run();
