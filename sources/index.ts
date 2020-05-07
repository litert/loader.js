/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31
 * Last: 2020-3-17 00:58:16, 2020-5-7 17:26:24
 */

// terser dist/index.js -o dist/index.min.js
// npm publish --access=public

interface IConfig {
    "after"?: string;
    "paths"?: IPaths
}

interface IPaths {
    [key: string]: string;
};

interface IModule {
    "first": boolean;
    "func": string;
    "object": any;
}

namespace loader {

    /** --- 是否已加载完成 --- */
    let _ready: boolean = false;
    /** --- 注册的 ready 事件 --- */
    let _readyList: (() => void)[] = [];
    // --- 当前 js 作用域网址路径 ---
    let _dirname: string;

    /** --- 配置项 --- */
    let _config: IConfig = {};

    /** --- 已加载的模块列表 --- */
    let _loaded: {
        [path: string]: IModule;
    } = {};

    /**
     * --- 初始化函数 ---
     */
    function _run() {
        // --- 先等待文档装载完毕 ---
        document.addEventListener("DOMContentLoaded", async function() {
            // --- 设置当前网址路径 ---
            if (window.location.href[window.location.href.length - 1] === "/") {
                _dirname = window.location.href.slice(0, -1);
            } else {
                let lio = window.location.href.lastIndexOf("/");
                _dirname = window.location.href.slice(0, lio);
            }
            // --- 判断 fetch 是否存在 ---
            if (typeof fetch !== "function") {
                await _loadScript(document.getElementsByTagName("head")[0], "https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js");
            }
            _ready = true;
            for (let func of _readyList) {
                func();
            }
        });
    }

    /**
     * --- 注册页面装载成功回调 ---
     * @param callback 回调函数
     */
    export function ready(callback: () => void): void {
        if (_ready) {
            callback();
        } else {
            _readyList.push(callback);
        }
    }

    /**
     * --- 设置 config ---
     * @param config 配置项
     */
    export function config(config: IConfig): void {
        _config = config;
    }
    
    /**
     * --- 设置加载文件的尾随后缀 ---
     * @param after 尾随后缀，如 ?abc
     */
    export function setAfter(after: string): void {
        _config.after = after;
    }

    /**
     * --- 设置模块地址映射 ---
     * @param list 模型映射列表
     */
    export function setPaths(paths: IPaths): void {
        _config.paths = paths;
    }

    /**
     * --- 添加一个模块映射 ---
     * @param name 模块名
     * @param path 映射地址
     */
    export function addPath(name: string, path: string): void {
        if ( _config.paths) {
            _config.paths[name] = path;
        } else {
            _config.paths = {
                [name]: path
            };
        }
    }

    /**
     * --- 返回已经加载的模块地址列表 ---
     */
    export function getLoadedPaths(): string[] {
        let paths: string[] = [];
        for (let path in _loaded) {
            paths.push(path);
        }
        return paths;
    }

    /**
     * --- 用户调用通过网络加载一个模块，这是用户在 js 中主动调用的加载模块的函数 ---
     * @param path 路径或模型映射名，如 ./abc，echarts，../xx/xx
     * @param callback 成功回调
     * @param error 失败回调
     */
    export async function require(paths: string | string[], callback: (...input: any[]) => void = function() {}, error: (path: string) => void = function() {}): Promise<any[] | null> {
        if (typeof paths === "string") {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let input: any[] = [];
        for (let path of paths) {
            let module = await _loadModule(path, _dirname);
            if (!module) {
                error(path);
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = (new Function(module.func))();
            }
            input.push(module.object);
        }
        callback(...input);
        return input;
    }

    /**
     * --- 获取并执行 module，仅会执行一次，以后只返回执行结果 ---
     * @param path 
     * @param dirname 
     */
    export function __getModule(path: string, dirname: string): any {
        path = _moduleName2Path(path, dirname);
        if (!_loaded[path]) {
            return null;
        }
        if (!_loaded[path].first) {
            _loaded[path].first = true;
            _loaded[path].object = (new Function(_loaded[path].func))();
        }
        return _loaded[path].object;
    }

    // --- 内部 ---

    /**
     * --- 通过网络加载 module 但不自动执行，已经加载过的不会重新加载 ---
     * @param path 模块
     * @param dirname 当前目录地址
     */
    async function _loadModule(path: string, dirname: string): Promise<IModule | null> {
        path = _moduleName2Path(path, dirname);
        // --- 判断是否加载过 ---
        if (_loaded[path]) {
            return _loaded[path];
        }
        // --- 加载文件 ---
        let text = await _fetch(path + _config.after ?? "");
        if (!text) {
            return null;
        }
        // --- 处理文件内容 ---
        text = text.replace(/^\s+|\s+$/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (text[0] === "{" && text[text.length - 1] === "}") {
            // --- json 文件 ---
            let data = JSON.parse(text);
            _loaded[path] = {
                "first": true,
                "func": "",
                "object": data
            };
        } else {
            // --- js 文件 ---
            // --- 先去除严格模式字符串 ---
            let strict = ``;
            if (text.indexOf(`"use strict"`) !== -1) {
                strict = `"use strict"\n`;
                text = text.replace(/"use strict"\n?/, "");
            }
            /** --- 定义当前模块的 __dirname --- */
            let fdirname = path.slice(0, path.lastIndexOf("/"));

            // --- 提取本文件的所有 require 同步函数并加载 ---
            let match;
            let reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
            while (match = reg.exec(text)) {
                if (!await _loadModule(match[1], fdirname)) {
                    return null;
                }
            }
            // --- 提取 define 的 ---
            reg = /define.+?\[(.+?)\]/g;
            while (match = reg.exec(text)) {
                let match2;
                let reg2 = /["'](.+?)["']/g;
                while (match2 = reg2.exec(match[1])) {
                    if (match2[1] === "require" || match2[1] === "exports") {
                        continue;
                    }
                    if ((new RegExp(`define.+?["']${match2[1]}["']`)).test(text)) {
                        continue;
                    }
                    if (!await _loadModule(match2[1], fdirname)) {
                        return null;
                    }
                }
            }

            // --- 组成当前文件的执行 function 字符串 ---
            var __loaded_amd: {
                [key: string]: IModule;
            } = {};
            var __loadedLength_amd = 0;

            /** --- 模块内部使用的 require 同步方法，模块已经被提前异步加载过 --- */
            let requireFunc = (function require(path: string): any {
                // --- 判断是加别的模块，还是本文件的模块 ---
                if (__loaded_amd[path]) {
                    // --- 加载本文件的模块 ---
                    if (!__loaded_amd[path].first) {
                        __loaded_amd[path].first = true;
                        let ex = {};
                        __loaded_amd[path].object = (new Function("require", "exports", __loaded_amd[path].func))(require, ex);
                        if (!__loaded_amd[path].object) {
                            __loaded_amd[path].object = ex;
                        }
                    }
                    return __loaded_amd[path].object;
                } else {
                    return loader.__getModule(path, __dirname);
                }
            }).toString();

            /** --- AMD 模块异步加载器，name 可能还未加载 --- */
            let defineFunc = (function define(name: any, input?: any, callback?: any): void {
                // --- 这里面是定义阶段就会执行的 ---
                // --- define('xx', ['xxx'], (xxx) => {}); ---
                // --- callback 不一定立马执行 ---
                ++__loadedLength_amd;
                if (Array.isArray(name)) {
                    // --- ['xx'], (xx) => {} ---
                    callback = input;
                    input = name;
                    name = "";
                } else if (typeof name === "function") {
                    // --- () => {} ---
                    callback = name;
                    input = [];
                    name = "";
                } else if (typeof input === "function") {
                    // --- 'name', () => {} ---
                    callback = input;
                    input = [];
                }
                // --- 'name', ['xx'], (xx) => {} ---
                if (name === "") {
                    name = "#";
                }
                // --- 添加定义到列表 ---
                let param: string[] = [];
                let match = /\(([\s\S]*?)\)[\s\S]*?{([\s\S]*)}/.exec(callback.toString());
                let paramReg = /\w+/g;
                let paramMatch;
                while (paramMatch = paramReg.exec(match![1])) {
                    param.push(paramMatch[0]);
                }
                let func = match![2].replace(/^\s+|\s+$/g, "");
                for (let i = 0; i < input.length; ++i) {
                    if (input[i] === "require" || input[i] === "exports") {
                        continue;
                    }
                    func = "var " + param[i] + " = require('" + input[i] + "');\n" + func;
                }
                __loaded_amd[name] = {
                    "first": false,
                    "func": func,
                    "object": null
                };
            }).toString();

            /** --- 模块文件结束时执行的，只有 define 有定义才会做处理 --- */
            let runLastAmdFunc = (function __runLast_amd(): void {
                // --- 此函数在 amd 结尾时执行，仅执行
                if (__loadedLength_amd === 0) {
                    return;
                }
                // --- 判断是否有要执行的模块，顺序为无名模块，没有则执行 index 模块 ---
                let name = "";
                if (__loaded_amd["#"]) {
                    name = "#"
                } else if (__loaded_amd["index"]) {
                    name = "index";
                }
                if (name === "") {
                    return;
                }
                exports = require(name);
            }).toString();

            // --- 组合最终 function 的字符串 ---
            text = `${strict}
            var __dirname = "${fdirname}";
            var __filename = "${path}";
            var module = {
                exports: {}
            };
            var exports = module.exports;
            var __loaded_amd = {};
            var __loadedLength_amd = 0;

            ${requireFunc}
            ${defineFunc}
            ${runLastAmdFunc}

            ${text}
            
            __runLast_amd();
            return exports;`;
            _loaded[path] = {
                "first": false,
                "func": text,
                "object": null
            };
        }
        return _loaded[path];
    }

    /**
     * --- fetch 获取数据 ---
     * @param path 获取地址
     */
    function _fetch(path: string): Promise<string | null> {
        return new Promise(function(resolve) {
            fetch(path).then(function(res: Response) {
                return res.text();
            }).then(function(text: string) {
                resolve(text);
            }).catch(function(err) {
                resolve(null);
            });
        });
    }

    /**
     * --- 加载 script 标签 ---
     * @param el 在此标签中增加
     * @param path 增加的 js 文件地址
     */
    function _loadScript(el: HTMLElement, path: string): Promise<void> {
        return new Promise(function(resolve) {
            let script = document.createElement("script");
            script.addEventListener("load", () => {
                resolve();
            });
            script.src = path;
            el.appendChild(script);
        });
    }

    /**
     * --- 相对路径、异常路径、模型名转换为最终实体 path ---
     * @param path 原 path
     * @param dirname 相对 __dirname
     */
    function _moduleName2Path(path: string, dirname: string): string {
        // --- 查询是否有映射 ---
        if (_config.paths && _config.paths[path]) {
            path = _config.paths[path];
        }
        // --- 是否是相对路径 ---
        if (path.slice(0, 8).indexOf("//") === -1) {
            // --- 根据当前 dirname 的相对路径组合 ---
            path = dirname + "/" + path;
        }
        // --- 是否自动加 index ---
        if (path[path.length - 1] === "/") {
            path += "index";
        }
        // --- 去除 ./ ---
        path = path.replace(/\/\.\//g, "/");
        // --- 去除 ../ ---
        while (true) {
            let count = 0;
            path = path.replace(/\/(?!\.\.)[^\/]+\/\.\.\//, function(s: string): string {
                ++count;
                return "/";
            });
            if (count === 0) {
                break;
            }
        }
        // --- 看是否要增加 .js ---
        if (path.slice(-5) !== ".json" && path.slice(-3) !== ".js") {
            path += ".js";
        }
        return path;
    }

    // --- 运行初始化函数 ---

    _run();

}

