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
const loader = {
    isReady: false,
    readys: [],
    dir: '',
    config: {},
    loaded: {},
    run: function () {
        let runFun = () => {
            if (window.location.href.endsWith('/')) {
                this.dir = window.location.href.slice(0, -1);
            }
            else {
                let lio = window.location.href.lastIndexOf('/');
                this.dir = window.location.href.slice(0, lio);
            }
            let hasPromise = true;
            let res = /Version\/([0-9.]+) Safari/.exec(navigator.userAgent);
            if (res) {
                let ver = parseFloat(res[1]);
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
            let next = () => __awaiter(this, void 0, void 0, function* () {
                if (typeof fetch !== 'function') {
                    yield this.loadScript(document.getElementsByTagName('head')[0], 'https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js');
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
            });
            if (!hasPromise) {
                let script = document.createElement('script');
                script.addEventListener('load', function () {
                    const rtn = next();
                    if (rtn instanceof Promise) {
                        rtn.catch((e) => {
                            throw e;
                        });
                    }
                });
                script.addEventListener('error', function () {
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
            document.addEventListener('DOMContentLoaded', runFun);
        }
    },
    ready: function (callback) {
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
    setConfig: function (config) {
        if (config.after !== undefined) {
            this.config.after = config.after;
        }
        if (config.paths !== undefined) {
            this.config.paths = config.paths;
        }
    },
    setAfter: function (after) {
        this.config.after = after;
    },
    setPaths: function (paths) {
        this.config.paths = paths;
    },
    addPath: function (name, path) {
        if (this.config.paths) {
            this.config.paths[name] = path;
        }
        else {
            this.config.paths = {
                [name]: path
            };
        }
    },
    getLoadedPaths: function () {
        let paths = [];
        for (let path in this.loaded) {
            paths.push(path);
        }
        return paths;
    },
    require: function (paths, callback, error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof paths === 'string') {
                paths = [paths];
            }
            let input = [];
            for (let path of paths) {
                let module = yield this.loadModule(path, this.dir, {}, {});
                if (!module) {
                    error === null || error === void 0 ? void 0 : error(path);
                    return null;
                }
                if (!module.first) {
                    module.first = true;
                    module.object = (new Function('__filesLoaded', module.func))({});
                }
                input.push(module.object);
            }
            callback === null || callback === void 0 ? void 0 : callback(...input);
            return input;
        });
    },
    requireMemory: function (paths, files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof paths === 'string') {
                paths = [paths];
            }
            let input = [];
            let filesLoaded = {};
            for (let path of paths) {
                let module = yield this.loadModule(path, '', files, filesLoaded);
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
        });
    },
    fetchGet: function (url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve) {
                fetch(url, init).then(function (res) {
                    if (res.status === 200 || res.status === 304) {
                        return res.text();
                    }
                    else {
                        resolve(null);
                        return '';
                    }
                }).then(function (text) {
                    resolve(text);
                }).catch(function () {
                    resolve(null);
                });
            });
        });
    },
    loadScript: function (el, path) {
        return new Promise(function (resolve) {
            let script = document.createElement('script');
            script.addEventListener('load', function () {
                resolve(true);
            });
            script.addEventListener('error', function () {
                resolve(false);
            });
            script.src = path;
            el.appendChild(script);
        });
    },
    getModule: function (path, dir, filesLoaded) {
        path = this.moduleName2Path(path, dir);
        let module;
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
    loadModule: function (path, dir, files, filesLoaded) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let inFiles = false;
            path = this.moduleName2Path(path, dir);
            if (filesLoaded[path]) {
                return filesLoaded[path];
            }
            else if (this.loaded[path]) {
                return this.loaded[path];
            }
            let code;
            if (files[path]) {
                inFiles = true;
                let blob = files[path];
                if (typeof blob === 'string') {
                    code = blob;
                }
                else {
                    code = yield this.blob2Text(blob);
                }
            }
            else {
                let text = yield this.fetchGet(path + ((_a = this.config.after) !== null && _a !== void 0 ? _a : ''));
                if (!text) {
                    return null;
                }
                code = text;
            }
            code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            if (code.startsWith('{') && code.endsWith('}')) {
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
                catch (_b) {
                    return null;
                }
            }
            else {
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
                let strict = '';
                if (code.indexOf('"use strict"') !== -1) {
                    strict = '"use strict"\n';
                    code = code.replace(/"use strict"\n?/, '');
                }
                let fdirname = '';
                let plio = path.lastIndexOf('/');
                if (plio !== -1) {
                    fdirname = path.slice(0, plio);
                }
                code = code.replace(/sourceMappingURL=([\S]+)/, `sourceMappingURL=${fdirname}/$1`);
                code = code.replace(/import *\* *as +(\S+) +from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2)');
                code = code.replace(/(import|export) *{(.+?)} *from *(["'])(\S+)["']/g, function (t, t1, t2, t3, t4) {
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
                code = code.replace(/export *{(.+?)}/g, function (t, t1) {
                    let txt = '';
                    let list = t1.split(',');
                    for (let i = 0; i < list.length; ++i) {
                        list[i] = list[i].trim();
                        txt += `exports.${list[i]} = ${list[i]};`;
                    }
                    return txt.slice(0, -1);
                });
                code = code.replace(/export +(\w+ +)*(\w+) *=/g, 'exports.$2 =');
                code = code.replace(/export +function +(\w+)/g, 'exports.$1 = function');
                let match;
                let reg = /require\s*?\( *?["'`](.+?)["'`] *?\)/g;
                let list = [];
                while ((match = reg.exec(code))) {
                    list.push(match[1]);
                }
                if (list.length > 0) {
                    yield new Promise((resolve) => {
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
        });
    },
    moduleName2Path: function (path, dirname) {
        let paths = this.config.paths;
        if (paths === null || paths === void 0 ? void 0 : paths[path]) {
            path = paths[path];
        }
        if (path.slice(0, 8).indexOf('//') === -1 && !path.startsWith('/')) {
            path = dirname + '/' + path;
        }
        if (path.endsWith('/')) {
            path += 'index';
        }
        path = path.replace(/\/\.\//g, '/');
        while (/\/(?!\.\.)[^/]+\/\.\.\//.test(path)) {
            path = path.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
        }
        if (!path.endsWith('.json') && !path.endsWith('.js')) {
            path += '.js';
        }
        return path;
    },
    blob2Text: function (blob) {
        return new Promise(function (resove) {
            let fr = new FileReader();
            fr.addEventListener('load', function (e) {
                if (e.target) {
                    resove(e.target.result);
                }
                else {
                    resove('');
                }
            });
            fr.readAsText(blob);
        });
    }
};
loader.run();
