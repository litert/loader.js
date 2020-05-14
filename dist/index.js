"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
;
var loader;
(function (loader) {
    var _ready = false;
    var _readyList = [];
    var _dirname;
    var _config = {};
    var _loaded = {};
    function _run() {
        document.addEventListener("DOMContentLoaded", function () {
            return __awaiter(this, void 0, void 0, function () {
                var lio, hasPromise, res, ver, next, script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (window.location.href[window.location.href.length - 1] === "/") {
                                _dirname = window.location.href.slice(0, -1);
                            }
                            else {
                                lio = window.location.href.lastIndexOf("/");
                                _dirname = window.location.href.slice(0, lio);
                            }
                            hasPromise = true;
                            res = /Version\/([0-9.]+) Safari/.exec(navigator.userAgent);
                            if (res) {
                                ver = parseFloat(res[1]);
                                if (ver < 10) {
                                    hasPromise = false;
                                    Promise = undefined;
                                }
                            }
                            else {
                                if (!Promise) {
                                    hasPromise = false;
                                }
                            }
                            next = function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _i, _readyList_1, func;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(typeof fetch !== "function")) return [3, 2];
                                                return [4, _loadScript(document.getElementsByTagName("head")[0], "https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js")];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2:
                                                _ready = true;
                                                for (_i = 0, _readyList_1 = _readyList; _i < _readyList_1.length; _i++) {
                                                    func = _readyList_1[_i];
                                                    func();
                                                }
                                                return [2];
                                        }
                                    });
                                });
                            };
                            if (!!hasPromise) return [3, 1];
                            script = document.createElement("script");
                            script.addEventListener("load", function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, next()];
                                            case 1:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                });
                            });
                            script.addEventListener("error", function (e) {
                                alert("Network error.");
                            });
                            script.src = "https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js";
                            document.getElementsByTagName("head")[0].appendChild(script);
                            return [3, 3];
                        case 1: return [4, next()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        });
    }
    function ready(callback) {
        if (_ready) {
            callback();
        }
        else {
            _readyList.push(callback);
        }
    }
    loader.ready = ready;
    function config(config) {
        if (config.after) {
            _config.after = config.after;
        }
        if (config.paths) {
            _config.paths = config.paths;
        }
    }
    loader.config = config;
    function setAfter(after) {
        _config.after = after;
    }
    loader.setAfter = setAfter;
    function setPaths(paths) {
        _config.paths = paths;
    }
    loader.setPaths = setPaths;
    function addPath(name, path) {
        var _a;
        if (_config.paths) {
            _config.paths[name] = path;
        }
        else {
            _config.paths = (_a = {},
                _a[name] = path,
                _a);
        }
    }
    loader.addPath = addPath;
    function getLoadedPaths() {
        var paths = [];
        for (var path in _loaded) {
            paths.push(path);
        }
        return paths;
    }
    loader.getLoadedPaths = getLoadedPaths;
    function require(paths, callback, error) {
        if (callback === void 0) { callback = function () { }; }
        if (error === void 0) { error = function () { }; }
        return __awaiter(this, void 0, void 0, function () {
            var input, _i, paths_1, path, module_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof paths === "string") {
                            paths = [paths];
                        }
                        input = [];
                        _i = 0, paths_1 = paths;
                        _a.label = 1;
                    case 1:
                        if (!(_i < paths_1.length)) return [3, 4];
                        path = paths_1[_i];
                        return [4, _loadModule(path, _dirname)];
                    case 2:
                        module_1 = _a.sent();
                        if (!module_1) {
                            error(path);
                            return [2, null];
                        }
                        if (!module_1.first) {
                            module_1.first = true;
                            module_1.object = (new Function("__config", "__partLoaded", module_1.func))(module_1.param[0], module_1.param[1]);
                        }
                        input.push(module_1.object);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4:
                        callback.apply(void 0, input);
                        return [2, input];
                }
            });
        });
    }
    loader.require = require;
    function requireMemory(paths, files, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var input, _i, paths_2, path, module_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof paths === "string") {
                            paths = [paths];
                        }
                        input = [];
                        _i = 0, paths_2 = paths;
                        _a.label = 1;
                    case 1:
                        if (!(_i < paths_2.length)) return [3, 4];
                        path = paths_2[_i];
                        return [4, _loadModule(path, "", files, config)];
                    case 2:
                        module_2 = _a.sent();
                        if (!module_2) {
                            return [2, null];
                        }
                        if (!module_2.first) {
                            module_2.first = true;
                            module_2.object = (new Function("__config", "__partLoaded", module_2.func))(module_2.param[0], module_2.param[1]);
                        }
                        input.push(module_2.object);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2, input];
                }
            });
        });
    }
    loader.requireMemory = requireMemory;
    function __getModule(path, dirname, config, partLoaded) {
        if (partLoaded === void 0) { partLoaded = {}; }
        path = _moduleName2Path(path, dirname, config);
        var module;
        if (partLoaded[path]) {
            module = partLoaded[path];
        }
        else if (_loaded[path]) {
            module = _loaded[path];
        }
        if (!module) {
            return null;
        }
        if (!module.first) {
            module.first = true;
            module.object = (new Function("__config", "__partLoaded", module.func))(module.param[0], module.param[1]);
        }
        return module.object;
    }
    loader.__getModule = __getModule;
    function _loadModule(path, dirname, files, config, partLoaded) {
        if (config === void 0) { config = {}; }
        if (partLoaded === void 0) { partLoaded = {}; }
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var after, inFiles, code, blob, text, data, strict, fdirname, plio, match, reg, match2, reg2, __loaded_amd, __loadedLength_amd, __config, __partLoaded, requireFunc, defineFunc, runLastAmdFunc;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        after = config.after || _config.after;
                        inFiles = false;
                        path = _moduleName2Path(path, dirname, config);
                        if (partLoaded[path]) {
                            return [2, partLoaded[path]];
                        }
                        if (_loaded[path]) {
                            return [2, _loaded[path]];
                        }
                        if (!(files && files[path])) return [3, 4];
                        inFiles = true;
                        blob = files[path];
                        if (!(typeof blob === "string")) return [3, 1];
                        code = blob;
                        return [3, 3];
                    case 1: return [4, _blob2Text(blob)];
                    case 2:
                        code = _b.sent();
                        _b.label = 3;
                    case 3: return [3, 6];
                    case 4: return [4, _fetch((_a = path + after) !== null && _a !== void 0 ? _a : "")];
                    case 5:
                        text = _b.sent();
                        if (!text) {
                            return [2, null];
                        }
                        code = text;
                        _b.label = 6;
                    case 6:
                        code = code.replace(/^\s+|\s+$/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                        if (!(code[0] === "{" && code[code.length - 1] === "}")) return [3, 7];
                        data = JSON.parse(code);
                        if (inFiles) {
                            partLoaded[path] = {
                                "first": true,
                                "func": "",
                                "object": data,
                                "param": [config, partLoaded]
                            };
                        }
                        else {
                            _loaded[path] = {
                                "first": true,
                                "func": "",
                                "object": data,
                                "param": [config, partLoaded]
                            };
                        }
                        return [3, 16];
                    case 7:
                        strict = "";
                        if (code.indexOf("\"use strict\"") !== -1) {
                            strict = "\"use strict\"\n";
                            code = code.replace(/"use strict"\n?/, "");
                        }
                        fdirname = "";
                        plio = path.lastIndexOf("/");
                        if (plio !== -1) {
                            fdirname = path.slice(0, plio);
                        }
                        match = void 0;
                        reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
                        _b.label = 8;
                    case 8:
                        if (!(match = reg.exec(code))) return [3, 10];
                        return [4, _loadModule(match[1], fdirname, files, config, partLoaded)];
                    case 9:
                        if (!(_b.sent())) {
                            return [3, 8];
                        }
                        return [3, 8];
                    case 10:
                        reg = /define.+?\[(.+?)\]/g;
                        _b.label = 11;
                    case 11:
                        if (!(match = reg.exec(code))) return [3, 15];
                        match2 = void 0;
                        reg2 = /["'](.+?)["']/g;
                        _b.label = 12;
                    case 12:
                        if (!(match2 = reg2.exec(match[1]))) return [3, 14];
                        if (match2[1] === "require" || match2[1] === "exports") {
                            return [3, 12];
                        }
                        if ((new RegExp("define.+?[\"']" + match2[1] + "[\"']")).test(code)) {
                            return [3, 12];
                        }
                        return [4, _loadModule(match2[1], fdirname, files, config, partLoaded)];
                    case 13:
                        if (!(_b.sent())) {
                            return [3, 12];
                        }
                        return [3, 12];
                    case 14: return [3, 11];
                    case 15:
                        __loaded_amd = {};
                        __loadedLength_amd = 0;
                        __config = {};
                        __partLoaded = {};
                        requireFunc = (function require(path) {
                            if (__loaded_amd[path]) {
                                if (!__loaded_amd[path].first) {
                                    __loaded_amd[path].first = true;
                                    var ex = {};
                                    __loaded_amd[path].object = (new Function("require", "exports", __loaded_amd[path].func))(require, ex);
                                    if (!__loaded_amd[path].object) {
                                        __loaded_amd[path].object = ex;
                                    }
                                }
                                return __loaded_amd[path].object;
                            }
                            else {
                                var m = loader.__getModule(path, __dirname, __config, __partLoaded);
                                if (m) {
                                    return m;
                                }
                                else {
                                    throw "Failed require.";
                                }
                            }
                        }).toString();
                        defineFunc = (function define(name, input, callback) {
                            ++__loadedLength_amd;
                            if (Array.isArray(name)) {
                                callback = input;
                                input = name;
                                name = "";
                            }
                            else if (typeof name === "function") {
                                callback = name;
                                input = [];
                                name = "";
                            }
                            else if (typeof input === "function") {
                                callback = input;
                                input = [];
                            }
                            if (name === "") {
                                name = "#";
                            }
                            var param = [];
                            var match = /\(([\s\S]*?)\)[\s\S]*?{([\s\S]*)}/.exec(callback.toString());
                            var paramReg = /\w+/g;
                            var paramMatch;
                            while (paramMatch = paramReg.exec(match[1])) {
                                param.push(paramMatch[0]);
                            }
                            var func = match[2].replace(/^\s+|\s+$/g, "");
                            for (var i = 0; i < input.length; ++i) {
                                if (input[i] === "require" || input[i] === "exports") {
                                    continue;
                                }
                                func = "var " + param[i] + " = require('" + input[i] + "');\n" + func;
                            }
                            __loaded_amd[name] = {
                                "first": false,
                                "func": func,
                                "object": null,
                                "param": [__config, __partLoaded]
                            };
                        }).toString();
                        runLastAmdFunc = (function __runLast_amd() {
                            if (__loadedLength_amd === 0) {
                                return;
                            }
                            var name = "";
                            if (__loaded_amd["#"]) {
                                name = "#";
                            }
                            else if (__loaded_amd["index"]) {
                                name = "index";
                            }
                            if (name === "") {
                                return;
                            }
                            module.exports = require(name);
                        }).toString();
                        code = strict + "\n            var __dirname = \"" + fdirname + "\";\n            var __filename = \"" + path + "\";\n            var module = {\n                exports: {}\n            };\n            var exports = module.exports;\n            var __loaded_amd = {};\n            var __loadedLength_amd = 0;\n\n            " + requireFunc + "\n            " + defineFunc + "\n            " + runLastAmdFunc + "\n\n            " + code + "\n            \n            __runLast_amd();\n            return module.exports;";
                        if (inFiles) {
                            partLoaded[path] = {
                                "first": false,
                                "func": code,
                                "object": null,
                                "param": [config, partLoaded]
                            };
                        }
                        else {
                            _loaded[path] = {
                                "first": false,
                                "func": code,
                                "object": null,
                                "param": [config, partLoaded]
                            };
                        }
                        _b.label = 16;
                    case 16:
                        if (inFiles) {
                            return [2, partLoaded[path]];
                        }
                        else {
                            return [2, _loaded[path]];
                        }
                        return [2];
                }
            });
        });
    }
    function _fetch(path) {
        return new Promise(function (resolve) {
            fetch(path).then(function (res) {
                if (res.status === 200 || res.status === 304) {
                    return res.text();
                }
                else {
                    resolve(null);
                    return "";
                }
            }).then(function (text) {
                resolve(text);
            }).catch(function (err) {
                logx("z");
                resolve(null);
            });
        });
    }
    function _loadScript(el, path) {
        return new Promise(function (resolve) {
            var script = document.createElement("script");
            script.addEventListener("load", function () {
                resolve();
            });
            script.src = path;
            el.appendChild(script);
        });
    }
    function _moduleName2Path(path, dirname, config) {
        if (config === void 0) { config = {}; }
        var paths = config.paths || _config.paths;
        if (paths && paths[path]) {
            path = paths[path];
        }
        if (path.slice(0, 8).indexOf("//") === -1) {
            path = dirname + "/" + path;
        }
        if (path[path.length - 1] === "/") {
            path += "index";
        }
        path = path.replace(/\/\.\//g, "/");
        var _loop_1 = function () {
            var count = 0;
            path = path.replace(/\/(?!\.\.)[^\/]+\/\.\.\//, function (s) {
                ++count;
                return "/";
            });
            if (count === 0) {
                return "break";
            }
        };
        while (true) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
        if (path.slice(-5) !== ".json" && path.slice(-3) !== ".js") {
            path += ".js";
        }
        return path;
    }
    function _blob2Text(blob) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resove) {
                        var fr = new FileReader();
                        fr.addEventListener("load", function (e) {
                            if (e.target) {
                                resove(e.target.result);
                            }
                            else {
                                resove("");
                            }
                        });
                        fr.readAsText(blob);
                    })];
            });
        });
    }
    _run();
})(loader || (loader = {}));
//# sourceMappingURL=index.js.map