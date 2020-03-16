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
    var _config = {
        "after": "",
        "paths": {}
    };
    var _loaded = {};
    function _run() {
        document.addEventListener("DOMContentLoaded", function () {
            return __awaiter(this, void 0, void 0, function () {
                var lio, _i, _readyList_1, func;
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
        _config = config;
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
        _config.paths[name] = path;
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
            var o, _i, paths_1, path, module_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof paths === "string") {
                            paths = [paths];
                        }
                        o = [];
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
                            module_1.object = module_1.func();
                        }
                        o.push(module_1.object);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4:
                        callback.apply(void 0, o);
                        return [2, o];
                }
            });
        });
    }
    loader.require = require;
    function __getModule(path, dirname) {
        path = _moduleName2Path(path, dirname);
        if (!_loaded[path]) {
            return null;
        }
        if (!_loaded[path].first) {
            _loaded[path].object = _loaded[path].func();
            _loaded[path].first = true;
        }
        return _loaded[path].object;
    }
    loader.__getModule = __getModule;
    function _loadModule(path, dirname) {
        return __awaiter(this, void 0, void 0, function () {
            var text, data, strict, fdirname, match, reg, __loaded_1, __loadedLength_1, func;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = _moduleName2Path(path, dirname);
                        if (_loaded[path]) {
                            return [2, _loaded[path]];
                        }
                        return [4, _fetch(path + _config.after)];
                    case 1:
                        text = _a.sent();
                        if (!text) {
                            return [2, null];
                        }
                        text = text.replace(/^\s+|\s+$/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                        if (!(text[0] === "{" && text[text.length - 1] === "}")) return [3, 2];
                        data = JSON.parse(text);
                        _loaded[path] = {
                            "first": true,
                            "func": function () { },
                            "object": data
                        };
                        return [3, 6];
                    case 2:
                        strict = "";
                        if (text.indexOf("\"use strict\"") !== -1) {
                            strict = "\"use strict\"\n";
                            text = text.replace(/"use strict"\n?/, "");
                        }
                        fdirname = path.slice(0, path.lastIndexOf("/"));
                        match = void 0;
                        reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
                        _a.label = 3;
                    case 3:
                        if (!(match = reg.exec(text))) return [3, 5];
                        return [4, _loadModule(match[1], fdirname)];
                    case 4:
                        if (!(_a.sent())) {
                            return [2, null];
                        }
                        return [3, 3];
                    case 5:
                        __loaded_1 = {};
                        __loadedLength_1 = 0;
                        text = strict + "\n            " + (function require(path) {
                            return loader.__getModule(path, __dirname);
                        }).toString() + "\n            " + (function define(name, input, callback) {
                            if (Array.isArray(name)) {
                                callback = input;
                                input = name;
                                name = "";
                            }
                            if (name === "") {
                                name = "__module_" + __loadedLength_1;
                            }
                            __loaded_1[name] = {
                                "input": input,
                                "func": callback,
                                "object": null
                            };
                        }).toString() + "\n            var __dirname = \"" + fdirname + "\";\n            var __filename = \"" + path + "\";\n            var exports = {};" + text + "\n            var __loaded = {};\n            var __loadedLength = 0;\n            \n            return exports;";
                        func = new Function(text);
                        _loaded[path] = {
                            "first": false,
                            "func": func,
                            "object": null
                        };
                        _a.label = 6;
                    case 6: return [2, _loaded[path]];
                }
            });
        });
    }
    function _fetch(path) {
        return new Promise(function (resolve) {
            fetch(path).then(function (res) {
                return res.text();
            }).then(function (text) {
                resolve(text);
            }).catch(function (err) {
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
    function _moduleName2Path(path, dirname) {
        if (_config.paths[path]) {
            path = _config.paths[path];
        }
        if (path.slice(0, 8).indexOf("//") === -1) {
            path = dirname + "/" + path;
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
    _run();
})(loader || (loader = {}));
//# sourceMappingURL=index.js.map