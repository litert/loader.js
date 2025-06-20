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
(function () {
    const temp = document.querySelectorAll('script');
    const scriptEle = temp[temp.length - 1];
    let location = window.location.href;
    const qio = location.indexOf('?');
    if (qio > -1) {
        location = location.slice(0, qio);
    }
    if (!location.endsWith('/')) {
        const lio = location.lastIndexOf('/');
        location = location.slice(0, lio + 1);
    }
    const loader = {
        'isReady': false,
        'readys': [],
        'head': undefined,
        'cdn': 'https://cdn.jsdelivr.net',
        init: function () {
            const srcSplit = scriptEle.src.indexOf('?');
            const srcSearch = decodeURIComponent(scriptEle.src.slice(srcSplit));
            let path = '';
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
            const run = () => __awaiter(this, void 0, void 0, function* () {
                this.head = document.getElementsByTagName('head')[0];
                if (typeof fetch !== 'function') {
                    yield this.loadScript(this.cdn + '/npm/whatwg-fetch@3.0.0/fetch.min.js');
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
                if (path) {
                    const map = {};
                    const files = {};
                    let match = /[?&]npm=([\w./"'@:{}\-?=, ]+)/.exec(srcSearch);
                    if (match) {
                        try {
                            match[1] = match[1].replace(/'/g, '"');
                            const npms = JSON.parse(match[1]);
                            yield this.sniffNpm(npms, {
                                'files': files,
                                'map': map
                            });
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
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
                    match = /[?&]after=([\w./"'@:{}\-?=]+)/.exec(srcSearch);
                    let after = undefined;
                    if (match) {
                        after = match[1];
                    }
                    yield loader.sniffFiles([path], {
                        'files': files,
                        'map': map,
                        'after': after
                    });
                    loader.require(path, files, {
                        'map': map
                    });
                }
            });
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                run().catch(function (e) {
                    throw e;
                });
            }
            else {
                document.addEventListener('DOMContentLoaded', run);
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
        require: function (paths, files, opt = {}) {
            var _a, _b, _c;
            if (typeof paths === 'string') {
                paths = [paths];
            }
            (_a = opt.cache) !== null && _a !== void 0 ? _a : (opt.cache = {});
            (_b = opt.dir) !== null && _b !== void 0 ? _b : (opt.dir = location);
            (_c = opt.invoke) !== null && _c !== void 0 ? _c : (opt.invoke = {});
            let styleElement = null;
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
            const output = [];
            for (let path of paths) {
                path = this.moduleNameResolve(path, opt.dir, opt.map);
                if (!files[path] || typeof files[path] !== 'string') {
                    output.push(null);
                    continue;
                }
                if (opt.cache[path]) {
                    output.push(opt.cache[path]);
                    continue;
                }
                let code = files[path];
                if (path.endsWith('.css')) {
                    if (styleElement) {
                        (() => __awaiter(this, void 0, void 0, function* () {
                            const reg = /url\(["']{0,1}(.+?)["']{0,1}\)/ig;
                            let match = null;
                            while ((match = reg.exec(code))) {
                                const realPath = this.urlResolve(path, match[1]);
                                const file = (files[realPath] && files[realPath] instanceof Blob)
                                    ? files[realPath] : null;
                                if (file) {
                                    code = code.replace(match[0], `url('${yield this.blob2DataUrl(file)}')`);
                                }
                            }
                            styleElement.append(code);
                        }))().catch((e) => { throw e; });
                    }
                    output.push(code);
                }
                else if (code.startsWith('{') && code.endsWith('}')) {
                    try {
                        const data = JSON.parse(code);
                        opt.cache[path] = data;
                        output.push(data);
                    }
                    catch (_d) {
                        output.push(null);
                    }
                }
                else {
                    const needExports = [];
                    if (opt.preprocess) {
                        code = opt.preprocess(code, path);
                    }
                    code = this.removeComment(code);
                    let strict = '';
                    if (code.includes('"use strict"')) {
                        strict = '"use strict"\n';
                        code = code.replace(/"use strict"[\n;]{0,2}/, '');
                    }
                    let dirname = '';
                    const plio = path.lastIndexOf('/');
                    if (plio !== -1) {
                        dirname = path.slice(0, plio);
                    }
                    code = code.replace(/sourceMappingURL=([\w/.\-"'`]+)/, `sourceMappingURL=${dirname}/$1`);
                    code = code.replace(/import *\* *as *(\w+) +from *(["'`])([\w/.-]+)["'`]/g, 'const $1 = require($2$3$2)');
                    code = code.replace(/import *(\w+) *from *(["'`])([\w/.-]+)["'`]/g, 'const $1 = require($2$3$2).default');
                    code = code.replace(/(import|export) *{(.+?)} *from *(["'`])([\w/.-]+)["'`]/g, function (t, t1, t2, t3, t4) {
                        const tmpVar = `t${t4.replace(/[^a-zA-Z]/g, '')}_${Math.round(Math.random() * 10000)}`;
                        let txt = `const ${tmpVar} = require(${t3}${t4}${t3});`;
                        const list = t2.split(',');
                        for (let i = 0; i < list.length; ++i) {
                            list[i] = list[i].trim();
                            txt += t1 === 'import' ? 'const ' : 'exports.';
                            const reg = /^(.+) +as +(.+)$/.exec(list[i]);
                            if (reg) {
                                txt += `${reg[2]} = ${tmpVar}.${reg[1]};`;
                            }
                            else {
                                txt += `${list[i]} = ${tmpVar}.${list[i]};`;
                            }
                        }
                        return txt.slice(0, -1);
                    });
                    code = code.replace(/(^|[\n; ])import *(['"].+?['"])/g, function (t, t1, t2) {
                        return `${t1}require(${t2})`;
                    });
                    code = code.replace(/import\((.+?)\)/g, function (t, t1) {
                        return `importOverride(${t1})`;
                    });
                    code = code.replace(/export *{(.+?)}/g, function (t, t1) {
                        let txt = '';
                        const list = t1.split(',');
                        for (let i = 0; i < list.length; ++i) {
                            list[i] = list[i].trim();
                            txt += `exports.${list[i]} = ${list[i]};`;
                        }
                        return txt.slice(0, -1);
                    });
                    code = code.replace(/export *\* *from *(["'`])([\w/.-]+)["'`]/g, function (t, t1, t2) {
                        return `var lrTmpList=require(${t1}${t2}${t1});var lrTmpKey;for(lrTmpKey in lrTmpList){exports[lrTmpKey]=lrTmpList[lrTmpKey];}`;
                    });
                    while (true) {
                        const match = /(export +)(class|function) +([\w$]+)[\s\S]+$/.exec(code);
                        if (!match) {
                            break;
                        }
                        let overCode = '';
                        let bigCount = -1;
                        let smallCount = 0;
                        let isString = '';
                        let i = 0;
                        for (i = 0; i < match[0].length; ++i) {
                            const char = match[0][i];
                            if (isString !== '') {
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
                                break;
                            }
                        }
                        code = code.slice(0, match.index) + overCode.slice(match[1].length) +
                            `exports.${match[3]} = ${match[3]};` + code.slice(match.index + i + 1);
                    }
                    code = code.replace(/export default ([\w$]+)/g, 'exports.default = $1');
                    code = code.replace(/export +(\w+) *([{[])(.+?)([}\]])/g, function (t, t1, t2, t3, t4) {
                        const list = t3.split(',');
                        for (let i = 0; i < list.length; ++i) {
                            list[i] = list[i].trim();
                            needExports.push('exports.' + list[i] + ' = ' + list[i] + ';');
                        }
                        return t1 + ' ' + t2 + t3 + t4;
                    });
                    code = code.replace(/export +(\w+) +(\w+)/g, function (t, t1, t2) {
                        if (!['let', 'var', 'const'].includes(t1)) {
                            return t;
                        }
                        needExports.push('exports.' + t2 + ' = ' + t2 + ';');
                        return t1 + ' ' + t2;
                    });
                    for (const ikey in opt.invoke) {
                        code = 'let ' + ikey + ' = __invoke.' + ikey + ';' + code;
                    }
                    code = `${strict}
var __dirname='${dirname}';var __filename='${path}';var module={exports:__cache['${path}']};var exports = module.exports;function importOverride(url){return loader.import(url,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke,'preprocess':__preprocess});}function require(path){var m=loader.require(path,__files,{'cache':__cache,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke,'preprocess':__preprocess});if(m[0]){return m[0];}else{throw 'Failed require "'+path+'" on "'+__filename+'" (Maybe file not found).';}}require.cache=__cache;
require.resolve=function(name){return loader.moduleNameResolve(name,__dirname,__map);};
${code}
${needExports.join('')}
return module.exports;`;
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
        fetch: function (url, init = {}) {
            const initClone = {};
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
            return new Promise(function (resolve) {
                fetch(url, init).then(function (res) {
                    var _a, _b;
                    if (res.status === 200 || res.status === 304) {
                        if ((_a = res.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('image/')) {
                            return res.blob();
                        }
                        const typeList = ['text/', 'javascript', 'json', 'css', 'xml', 'html'];
                        for (const item of typeList) {
                            if ((_b = res.headers.get('content-type')) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(item)) {
                                return res.text();
                            }
                        }
                        return res.blob();
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
        },
        get: function (url_1) {
            return __awaiter(this, arguments, void 0, function* (url, opt = {}) {
                var _a;
                try {
                    const headers = {};
                    if (opt.headers) {
                        Object.assign(headers, opt.headers);
                    }
                    const res = yield fetch(url, {
                        'method': 'GET',
                        'headers': headers,
                        'credentials': (_a = opt.credentials) !== null && _a !== void 0 ? _a : 'include'
                    });
                    return res;
                }
                catch (_b) {
                    return null;
                }
            });
        },
        post: function (url_1, data_1) {
            return __awaiter(this, arguments, void 0, function* (url, data, opt = {}) {
                var _a;
                try {
                    const headers = {};
                    if (!(data instanceof FormData)) {
                        headers['content-type'] = 'application/json';
                    }
                    if (opt.headers) {
                        Object.assign(headers, opt.headers);
                    }
                    const res = yield fetch(url, {
                        'method': 'POST',
                        'headers': headers,
                        'body': data instanceof FormData ? data : JSON.stringify(data),
                        'credentials': (_a = opt.credentials) !== null && _a !== void 0 ? _a : 'include'
                    });
                    return res;
                }
                catch (_b) {
                    return null;
                }
            });
        },
        getResponseJson: function (url_1) {
            return __awaiter(this, arguments, void 0, function* (url, opt = {}) {
                const res = yield this.get(url, opt);
                if (!res) {
                    return null;
                }
                try {
                    return yield res.json();
                }
                catch (_a) {
                    return null;
                }
            });
        },
        postResponseJson: function (url_1, data_1) {
            return __awaiter(this, arguments, void 0, function* (url, data, opt = {}) {
                const res = yield this.post(url, data, opt);
                if (!res) {
                    return null;
                }
                try {
                    return yield res.json();
                }
                catch (_a) {
                    return null;
                }
            });
        },
        fetchFiles: function (urls_1) {
            return __awaiter(this, arguments, void 0, function* (urls, opt = {}) {
                return new Promise((resolve) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    (_a = opt.init) !== null && _a !== void 0 ? _a : (opt.init = {});
                    (_b = opt.dir) !== null && _b !== void 0 ? _b : (opt.dir = location);
                    (_c = opt.before) !== null && _c !== void 0 ? _c : (opt.before = '');
                    (_d = opt.after) !== null && _d !== void 0 ? _d : (opt.after = '');
                    const list = {};
                    let count = 0;
                    for (let url of urls) {
                        url = this.urlResolve(opt.dir, url);
                        if ((_e = opt.files) === null || _e === void 0 ? void 0 : _e[url]) {
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
                            (_f = this.load) === null || _f === void 0 ? void 0 : _f.call(this, url);
                        }
                        let ourl = this.compressUrl(url);
                        if (opt.before) {
                            ourl = opt.before + ourl;
                        }
                        if (!((_g = opt.afterIgnore) === null || _g === void 0 ? void 0 : _g.test(url)) && !ourl.startsWith(this.cdn)) {
                            ourl += opt.after;
                        }
                        const success = (res) => {
                            var _a, _b;
                            ++count;
                            if (res) {
                                list[url] = res;
                                if (opt.loaded) {
                                    opt.loaded(url, 1);
                                }
                                else {
                                    (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, 1);
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
                                    (_b = this.loaded) === null || _b === void 0 ? void 0 : _b.call(this, url, 0);
                                }
                            }
                            if (count === urls.length) {
                                resolve(list);
                            }
                        };
                        const fail = () => {
                            var _a;
                            ++count;
                            if (opt.loaded) {
                                opt.loaded(url, -1);
                            }
                            else {
                                (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, -1);
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
            });
        },
        sniffNpm: function (npms_1) {
            return __awaiter(this, arguments, void 0, function* (npms, opt = {}) {
                var _a, _b;
                (_a = opt.map) !== null && _a !== void 0 ? _a : (opt.map = {});
                (_b = opt.files) !== null && _b !== void 0 ? _b : (opt.files = {});
                const packages = [];
                for (const name in npms) {
                    packages.push(`${this.cdn}/npm/${name}@${npms[name]}/package.json`);
                }
                const npmFiles = yield this.fetchFiles(packages, {
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
                const sniffFiles = [];
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
                yield this.sniffFiles(sniffFiles, {
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
            });
        },
        sniffFiles: function (urls_1) {
            return __awaiter(this, arguments, void 0, function* (urls, opt = {}) {
                var _a, _b;
                if (typeof urls === 'string') {
                    urls = [urls];
                }
                (_a = opt.files) !== null && _a !== void 0 ? _a : (opt.files = {});
                const list = yield this.fetchFiles(urls, {
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
                const nlayer = [];
                for (const path in list) {
                    const item = list[path];
                    if (typeof item !== 'string') {
                        continue;
                    }
                    let reg;
                    let match;
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
                        if (/^[\w-]+$/.test(t) && (!((_b = opt.map) === null || _b === void 0 ? void 0 : _b[t]))) {
                            continue;
                        }
                        const mnr = this.moduleNameResolve(t, path, opt.map);
                        if (!nlayer.includes(mnr)) {
                            nlayer.push(mnr);
                        }
                    }
                }
                if (nlayer.length > 0) {
                    Object.assign(list, yield this.sniffFiles(nlayer, opt));
                }
                return list;
            });
        },
        loadScript: function (url, el, module = false) {
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
                script.addEventListener('load', function () {
                    resolve(true);
                });
                script.addEventListener('error', function () {
                    resolve(false);
                });
                script.src = this.compressUrl(url);
                el.appendChild(script);
            });
        },
        loadScripts: function (urls, opt = {}) {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadScript(url, opt.el, opt.module).then((res) => {
                        var _a, _b;
                        ++count;
                        if (res) {
                            if (opt.loaded) {
                                opt.loaded(url, 1);
                            }
                            else {
                                (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, 1);
                            }
                        }
                        else {
                            if (opt.loaded) {
                                opt.loaded(url, 0);
                            }
                            else {
                                (_b = this.loaded) === null || _b === void 0 ? void 0 : _b.call(this, url, 0);
                            }
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(() => {
                        var _a;
                        ++count;
                        if (opt.loaded) {
                            opt.loaded(url, -1);
                        }
                        else {
                            (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, -1);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },
        loadLink: function (url, el, pos = 'after') {
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
                link.addEventListener('load', function () {
                    resolve(true);
                });
                link.addEventListener('error', function () {
                    resolve(false);
                });
                link.href = this.compressUrl(url);
                link.rel = 'stylesheet';
                if (pos === 'after') {
                    el.appendChild(link);
                }
                else {
                    if (el.firstChild) {
                        el.insertBefore(link, el.firstChild);
                    }
                    else {
                        el.appendChild(link);
                    }
                }
            });
        },
        loadLinks: function (urls, opt = {}) {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadLink(url, opt.el).then((res) => {
                        var _a, _b;
                        ++count;
                        if (res) {
                            if (opt.loaded) {
                                opt.loaded(url, 1);
                            }
                            else {
                                (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, 1);
                            }
                        }
                        else {
                            if (opt.loaded) {
                                opt.loaded(url, 0);
                            }
                            else {
                                (_b = this.loaded) === null || _b === void 0 ? void 0 : _b.call(this, url, 0);
                            }
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(() => {
                        var _a;
                        ++count;
                        if (opt.loaded) {
                            opt.loaded(url, -1);
                        }
                        else {
                            (_a = this.loaded) === null || _a === void 0 ? void 0 : _a.call(this, url, -1);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },
        loadStyle: function (style, el) {
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
        import: function (url_1, files_1) {
            return __awaiter(this, arguments, void 0, function* (url, files, opt = {}) {
                var _a;
                (_a = opt.dir) !== null && _a !== void 0 ? _a : (opt.dir = location);
                url = this.moduleNameResolve(url, opt.dir, opt.map);
                if (files[url]) {
                    return this.require(url, files, opt)[0];
                }
                else {
                    yield this.sniffFiles(url, {
                        'dir': opt.dir,
                        'files': files
                    });
                    return this.require(url, files, opt)[0];
                }
            });
        },
        moduleNameResolve: function (path, dir, map = {}) {
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
            if (path.endsWith('/')) {
                path += 'index';
            }
            let lio = path.lastIndexOf('/');
            const fname = lio === -1 ? path : path.slice(lio + 1);
            lio = fname.lastIndexOf('.');
            const fext = lio === -1 ? '' : fname.slice(lio + 1);
            if (!['js', 'json', 'css', 'ttf', 'png', 'gif', 'jpg', 'jpeg', 'svg'].includes(fext)) {
                path += '.js';
            }
            return path;
        },
        parseUrl: function (url) {
            const rtn = {
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
                rtn['pathname'] = url;
            }
            rtn['path'] = rtn['pathname'] + (rtn['query'] ? '?' + rtn['query'] : '');
            return rtn;
        },
        urlResolve: function (from, to) {
            var _a;
            from = from.replace(/\\/g, '/');
            to = to.replace(/\\/g, '/');
            if (to === '') {
                return this.urlAtom(from);
            }
            const f = this.parseUrl(from);
            if (to.startsWith('//')) {
                return this.urlAtom(f.protocol ? f.protocol + to : to);
            }
            if (f.protocol) {
                from = f.protocol + from.slice(f.protocol.length);
            }
            const t = this.parseUrl(to);
            if (t.protocol) {
                return this.urlAtom(t.protocol + to.slice(t.protocol.length));
            }
            if (to.startsWith('#') || to.startsWith('?')) {
                const sp = from.indexOf(to[0]);
                if (sp !== -1) {
                    return this.urlAtom(from.slice(0, sp) + to);
                }
                else {
                    return this.urlAtom(from + to);
                }
            }
            let abs = (f.auth ? f.auth + '@' : '') + ((_a = f.host) !== null && _a !== void 0 ? _a : '');
            if (to.startsWith('/')) {
                abs += to;
            }
            else {
                const path = f.pathname.replace(/\/[^/]*$/g, '');
                abs += path + '/' + to;
            }
            if (f.protocol && (f.protocol !== 'file:') && !f.host) {
                return this.urlAtom(f.protocol + abs);
            }
            else {
                return this.urlAtom((f.protocol ? f.protocol + '//' : '') + abs);
            }
        },
        urlAtom: function (url) {
            while (url.includes('/./')) {
                url = url.replace(/\/\.\//g, '/');
            }
            while (/\/(?!\.\.)[^/]+\/\.\.\//.test(url)) {
                url = url.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
            }
            url = url.replace(/\.\.\//g, '');
            return url;
        },
        isEscapeChar: function (index, code) {
            let preChar = code[index - 1];
            let count = 0;
            while (preChar === '\\') {
                preChar = code[index - (++count) - 1];
            }
            return count % 2 === 0 ? false : true;
        },
        removeComment: function (code) {
            let isComment = false;
            let isLineString = false;
            code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            code = code.replace(/.*(\n|$)/g, (t) => {
                if (isComment && !t.includes('*/')) {
                    return '';
                }
                if (!isComment && !t.includes('/*') && !t.includes('//') && !t.includes('`')) {
                    return t;
                }
                let overCode = '';
                let isString = '';
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
            return code;
        },
        blob2Text: function (blob) {
            return new Promise(function (resove) {
                const fr = new FileReader();
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
        },
        blob2DataUrl: function (blob) {
            return new Promise(function (resove) {
                const fr = new FileReader();
                fr.addEventListener('load', function (e) {
                    if (e.target) {
                        resove(e.target.result);
                    }
                    else {
                        resove('');
                    }
                });
                fr.readAsDataURL(blob);
            });
        },
        arrayTest: function (arr, reg) {
            for (const item of arr) {
                if (reg.test(item)) {
                    return item;
                }
            }
            return null;
        },
        compressUrl: function (ourl) {
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
    window.loader = loader;
    loader.init();
})();
