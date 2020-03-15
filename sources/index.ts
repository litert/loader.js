/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31
 * Last: 2020-3-15 11:37:30
 */

// npm publish --access=public

interface IModulePaths {
    [name: string]: string;
}

interface IModule {
    "first": boolean;
    "func": Function;
    "object": any;
}

namespace loader {

    /** --- 是否已加载完成 --- */
    let _loaded: boolean = false;
    /** --- 注册的 ready 事件 --- */
    let _readyList: (() => void)[] = [];
    /** --- 模块地址映射 --- */
    let _modulePaths: IModulePaths = {};
    /** --- 已加载的模块列表 --- */
    let _loadedModule: {
        [name: string]: IModule;
    } = {};
    // --- 当前 js 作用域网址路径 ---
    let _dirname: string;

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
            for (let func of _readyList) {
                func();
            }
        });
    }

    /**
     * --- 注册页面装载成功回调 ---
     * @param callback 回调函数
     */
    export function ready(callback: () => void) {
        if (_loaded) {
            callback();
        } else {
            _readyList.push(callback);
        }
    }

    /**
     * --- 设置模块地址映射 ---
     * @param list 模型映射列表
     */
    export function setModulePaths(list: IModulePaths) {
        _modulePaths = list;
    }

    /**
     * --- 添加一个模块映射 ---
     * @param name 模块名
     * @param path 映射地址
     */
    export function addModulePath(name: string, path: string) {
        _modulePaths[name] = path;
    }

    /**
     * --- 用户调用通过网络加载一个模块 ---
     * @param path 路径或模型映射名，如 ./abc，echarts，../xx/xx
     * @param callback 成功回调
     * @param error 失败回调
     */
    export async function require(paths: string | string[], callback: (...o: any[]) => void = function() {}, error: (path: string) => void = function() {}): Promise<any[] | null> {
        if (typeof paths === "string") {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let o: any[] = [];
        for (let path of paths) {
            let module = await _loadModule(path, _dirname);
            if (!module) {
                error(path);
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = module.func();
            }
            o.push(module.object);
        }
        callback(...o);
        return o;
    }

    /**
     * --- 获取并执行 module，仅会执行一次，以后只返回执行结果 ---
     * @param path 
     * @param dirname 
     */
    export function getModule(path: string, dirname: string): any {
        path = _moduleName2Path(path, dirname);
        if (!_loadedModule[path]) {
            return null;
        }
        if (!_loadedModule[path].first) {
            _loadedModule[path].object = _loadedModule[path].func();
            _loadedModule[path].first = true;
        }
        return _loadedModule[path].object;
    }

    // --- 内部 ---

    /**
     * --- 通过网络加载 module 但不自动执行 ---
     * @param path 模块
     * @param dirname 当前目录地址
     */
    async function _loadModule(path: string, dirname: string): Promise<IModule | null> {
        path = _moduleName2Path(path, dirname);
        // --- 判断是否加载过 ---
        if (_loadedModule[path]) {
            return _loadedModule[path];
        }
        // --- 加载文件 ---
        let text = await _fetch(path);
        if (!text) {
            return null;
        }
        // --- 处理文件内容 ---
        text = text.replace(/^\s+|\s+$/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (text[0] === "{" && text[text.length - 1] === "}") {
            // --- json 文件 ---
            let data = JSON.parse(text);
            _loadedModule[path] = {
                "first": true,
                "func": () => {},
                "object": data
            };
        } else {
            // --- js 文件 ---
            // --- 先去除严格模式 ---
            let strict = ``;
            if (text.indexOf(`"use strict"`) !== -1) {
                strict = `"use strict"\n`;
                text = text.replace(/"use strict"\n?/, "");
            }
            // --- 提取本文件的所有 require 并加载 ---
            let fdirname = path.slice(0, path.lastIndexOf("/"));
            let match;
            let reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
            while (match = reg.exec(text)) {
                if (!await _loadModule(match[1], fdirname)) {
                    return null;
                }
            }
            text = `${strict}${(function require(path: string) {
                return loader.getModule(path, __dirname);
            }).toString()}var __dirname = "${fdirname}";var exports = {};${text}\n\nreturn exports;`;
            let func = new Function(text);
            _loadedModule[path] = {
                "first": false,
                "func": func,
                "object": null
            };
        }
        return _loadedModule[path];
    }

    /**
     * --- fetch 获取数据 ---
     * @param path 获取地址
     */
    function _fetch(path: string): Promise<string | null> {
        return new Promise(function(resolve) {
            fetch(path, {
                method: "GET",
                credentials: "include"
            }).then(function(res: Response) {
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
        if (_modulePaths[path]) {
            path = _modulePaths[path];
        }
        // --- 是否是相对路径 ---
        if (path.slice(0, 8).indexOf("//") === -1) {
            // --- 根据当前 _dirname 的相对路径 ---
            path = dirname + "/" + path;
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

