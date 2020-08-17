/**
 * Project: @litert/loader.js, User: JianSuoQiYue
 * Date: 2020-3-14 22:00:31
 * Last: 2020-3-17 00:58:16, 2020-5-14 19:34:52, 2020-8-16 14:41:15
 */

// npm publish --access=public

// --- 使用 loader 库则会自动支持 fetch、Promise，无需再做相关兼容性支持 ---

/** --- 配置项 --- */
interface IConfig {
    "after"?: string;
    "paths"?: IPaths;
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
    let _isReady: boolean = false;
    /** --- 注册的 ready 事件 --- */
    let _readys: (() => void)[] = [];
    /** --- 当前 js 运行的作用域网址路径（非 JS 的文件路径），末尾不以 / 结尾 --- */
    let _dir: string;

    /** --- 全局配置项 --- */
    let _config: IConfig = {};

    /** --- 网络上已加载的模块列表 --- */
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
                _dir = window.location.href.slice(0, -1);
            } else {
                let lio = window.location.href.lastIndexOf("/");
                _dir = window.location.href.slice(0, lio);
            }
            // --- 判断 Promise 是否存在 ---
            let hasPromise = true;
            let res = /Version\/([0-9.]+) Safari/.exec(navigator.userAgent);
            if (res) {
                let ver = parseFloat(res[1]);
                if (ver < 10) {
                    hasPromise = false;
                    Promise = undefined as any;
                }
            } else {
                if (!Promise) {
                    hasPromise = false;
                }
            }
            let next = async function() {
                // --- 判断 fetch 是否存在 ---
                if (typeof fetch !== "function") {
                    await loadScript(document.getElementsByTagName("head")[0], "https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js");
                }
                _isReady = true;
                for (let func of _readys) {
                    func();
                }
            };
            if (!hasPromise) {
                let script = document.createElement("script");
                script.addEventListener("load", async function() {
                    await next();
                });
                script.addEventListener("error", function(e: ErrorEvent) {
                    alert("Network error.");
                });
                script.src = "https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js";
                document.getElementsByTagName("head")[0].appendChild(script);
            } else {
                await next();
            }
        });
    }

    /**
     * --- 注册页面装载成功回调 ---
     * @param callback 回调函数
     */
    export function ready(callback: () => void): void {
        if (_isReady) {
            callback();
        } else {
            _readys.push(callback);
        }
    }

    /**
     * --- 设置 config ---
     * @param config 配置项
     */
    export function config(config: IConfig): void {
        if (config.after !== undefined) {
            _config.after = config.after;
        }
        if (config.paths !== undefined) {
            _config.paths = config.paths;
        }
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
     * --- 返回已经加载的网络模块地址列表 ---
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
     * @param opt 选项
     */
    export async function require(paths: string | string[], callback: (...input: any[]) => void = function() {}, error?: (path: string) => void): Promise<any[] | null> {
        if (typeof paths === "string") {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let input: any[] = [];
        for (let path of paths) {
            let module = await _loadModule(path, _dir, {}, {});
            if (!module) {
                error && error(path);
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = (new Function("__filesLoaded", module.func))({});
            }
            input.push(module.object);
        }
        callback(...input);
        return input;
    }

    /**
     * --- 通过运行时文件加载模型 ---
     * @param path 路径或模型映射名，如 ./abc，echarts，../xx/xx
     * @param files 基准路径或文件序列，用以加载子模型
     */
    export async function requireMemory(paths: string | string[], files: Record<string, Blob | string>): Promise<any[] | null> {
        if (typeof paths === "string") {
            paths = [paths];
        }
        // --- callback 时返回的模块对象列表 ---
        let input: any[] = [];
        let filesLoaded = {};
        for (let path of paths) {
            let module = await _loadModule(path, "", files, filesLoaded);
            if (!module) {
                return null;
            }
            if (!module.first) {
                module.first = true;
                module.object = (new Function("__filesLoaded", module.func))(filesLoaded);
            }
            input.push(module.object);
        }
        return input;
    }

    /**
     * --- 简单 fetch 获取网络数据 ---
     * @param url 网络地址
     */
    export function fetchGet(url: string, init?: RequestInit): Promise<string | null> {
        return new Promise(function(resolve) {
            fetch(url, init).then(function(res: Response) {
                if (res.status === 200 || res.status === 304) {
                    return res.text();
                } else {
                    resolve(null);
                    return "";
                }
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
    export function loadScript(el: HTMLElement, path: string): Promise<boolean> {
        return new Promise(function(resolve) {
            let script = document.createElement("script");
            script.addEventListener("load", function() {
                resolve(true);
            });
            script.addEventListener("error", function() {
                resolve(false);
            })
            script.src = path;
            el.appendChild(script);
        });
    }

    /**
     * --- 获取并执行 module，仅会执行一次，以后只返回执行结果 ---
     * @param path 
     * @param dirname 
     */
    export function __getModule(path: string, dirname: string, filesLoaded: {
        [path: string]: IModule;
    }): any {
        path = _moduleName2Path(path, dirname);
        let module!: IModule;
        if (filesLoaded[path]) {
            module = filesLoaded[path];
        } else if (_loaded[path]) {
            module = _loaded[path];
        }
        if (!module) {
            return null;
        }
        if (!module.first) {
            module.first = true;
            module.object = (new Function("__filesLoaded", module.func))(filesLoaded);
        } else {
            if (!module.object) {
                console.log("Loop containment is prohibited.");
                return {};
            }
        }
        return module.object;
    }

    // --- 内部 ---

    /**
     * --- 通过网络、内存加载 module 但不自动执行，已经加载过的不会重新加载 ---
     * @param path 模块地址、模块名或 code
     * @param dir 当前目录地址
     * @param files 内存中的文件列表
     * @param filesLoaded files 中的代替 _loaded 的作用
     */
    async function _loadModule(path: string, dir: string, files: Record<string, Blob | string> = {}, filesLoaded: {
        [path: string]: IModule;
    }): Promise<IModule | null> {
        let inFiles: boolean = false;
        // --- parse module 的 path  ---
        path = _moduleName2Path(path, dir);
        // --- 判断是否加载过 ---
        if (filesLoaded[path]) {
            return filesLoaded[path];
        } else if (_loaded[path]) {
            return _loaded[path];
        }
        // --- 加载文件 ---
        let code: string;
        if (files && files[path]) {
            inFiles = true;
            let blob = files[path];
            if (typeof blob === "string") {
                code = blob;
            } else {
                code = await _blob2Text(blob);
            }
        } else {
            let text = await fetchGet(path + _config.after ?? "");
            if (!text) {
                return null;
            }
            code = text;
        }
        // --- 处理文件内容 ---
        code = code.replace(/^\s+|\s+$/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (code[0] === "{" && code[code.length - 1] === "}") {
            // --- json 文件 ---
            try {
                let data = JSON.parse(code);
                if (inFiles) {
                    filesLoaded[path] = {
                        "first": true,
                        "func": "",
                        "object": data
                    };
                } else {
                    _loaded[path] = {
                        "first": true,
                        "func": "",
                        "object": data
                    };
                }
            } catch {
                return null;
            }
        } else {
            // --- js 文件 ---
            if (inFiles) {
                filesLoaded[path] = {
                    "first": false,
                    "func": "",
                    "object": null
                };
            } else {
                _loaded[path] = {
                    "first": false,
                    "func": "",
                    "object": null
                };
            }
            // --- 先去除严格模式字符串 ---
            let strict = ``;
            if (code.indexOf(`"use strict"`) !== -1) {
                strict = `"use strict"\n`;
                code = code.replace(/"use strict"\n?/, "");
            }
            /** --- 定义当前模块的 __dirname --- */
            let fdirname: string = "";
            let plio = path.lastIndexOf("/");
            if (plio !== -1) {
                fdirname = path.slice(0, plio);
            }
            // --- 处理 sourceMap ---
            code = code.replace(/sourceMappingURL=([\S]+)/, `sourceMappingURL=${fdirname}/$1`);
            // --- 提取本文件的所有 require 同步函数并并行加载 ---
            let match;
            let reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
            let list: string[] = [];
            while (match = reg.exec(code)) {
                list.push(match[1]);
            }
            if (list.length > 0) {
                await new Promise(function(resolve) {
                    let now = 0;
                    for (let item of list) {
                        _loadModule(item, fdirname, files, filesLoaded).then(() => {
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
            var __dirname = "${fdirname}";
            var __filename = "${path}";
            var module = {
                exports: {}
            };
            var exports = module.exports;

            function require(path) {
                var m = loader.__getModule(path, __dirname, __filesLoaded);
                if (m) {
                    return m;
                } else {
                    throw "Failed require.";
                }
            }

            ${code}

            return module.exports;`;
            if (inFiles) {
                filesLoaded[path].func = code;
            } else {
                _loaded[path].func = code;
            }
        }
        if (inFiles) {
            return filesLoaded[path];
        } else {
            return _loaded[path];
        }
    }

    /**
     * --- 相对路径、异常路径、模型名转换为最终实体 path ---
     * @param path 原 path
     * @param dirname 相对 __dirname
     */
    function _moduleName2Path(path: string, dirname: string): string {
        let paths = _config.paths;
        // --- 查询是否有映射 ---
        if (paths && paths[path]) {
            path = paths[path];
        }
        // --- 是否是相对路径 ---
        if (path.slice(0, 8).indexOf("//") === -1 && path[0] !== "/") {
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
        while (/\/(?!\.\.)[^/]+\/\.\.\//.test(path)) {
            path = path.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
        }
        // --- 看是否要增加 .js ---
        if (path.slice(-5) !== ".json" && path.slice(-3) !== ".js") {
            path += ".js";
        }
        return path;
    }

    /**
     * --- 将 blob 对象转换为 text ---
     * @param blob 对象
     */
    async function _blob2Text(blob: Blob): Promise<string> {
        return new Promise(function(resove) {
            let fr = new FileReader();
            fr.addEventListener("load", function(e) {
                if (e.target) {
                    resove(e.target.result as string);
                } else {
                    resove("");
                }
            });
            fr.readAsText(blob);
        });
    }

    // --- 运行初始化函数 ---

    _run();

}

