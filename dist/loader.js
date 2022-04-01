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
    const loader = {
        isReady: false,
        readys: [],
        scriptPath: scriptEle.src.slice(0, scriptEle.src.lastIndexOf('/') + 1),
        head: undefined,
        init: function () {
            const run = () => __awaiter(this, void 0, void 0, function* () {
                this.head = document.getElementsByTagName('head')[0];
                if (typeof fetch !== 'function') {
                    yield this.loadScript('https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/fetch.min.js');
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
            });
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                run().catch((e) => {
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
            if (typeof paths === 'string') {
                paths = [paths];
            }
            if (opt.executed === undefined) {
                opt.executed = {};
            }
            if (opt.dir === undefined) {
                opt.dir = location.href;
            }
            if (opt.invoke === undefined) {
                opt.invoke = {};
            }
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
                if (opt.executed[path]) {
                    output.push(opt.executed[path]);
                    continue;
                }
                if (!files[path]) {
                    output.push(null);
                    continue;
                }
                if (typeof files[path] !== 'string') {
                    output.push(null);
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
                        opt.executed[path] = data;
                        output.push(data);
                    }
                    catch (_a) {
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
                    code = code.replace(/sourceMappingURL=([\S]+)/, `sourceMappingURL=${dirname}/$1`);
                    code = code.replace(/import *\* *as *(\S+) +from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2)');
                    code = code.replace(/import *(\S+) *from *(["'])(\S+)["']/g, 'const $1 = require($2$3$2).default');
                    code = code.replace(/(import|export) *{(.+?)} *from *(["'])(\S+)["']/g, function (t, t1, t2, t3, t4) {
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
                    code = code.replace(/import *(['"].+?['"])/g, function (t, t1) {
                        return `require(${t1})`;
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
                    code = code.replace(/export *\* *from *(["'])(\S+)["']/g, function (t, t1, t2) {
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
var __dirname='${dirname}';var __filename='${path}';var module={exports:{}};var exports = module.exports;function importOverride(url){return loader.import(url,__files,{'executed':__executed,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'}});}function require(path){var m=loader.require(path,__files,{'executed':__executed,'map':__map,'dir':__filename,'style':${opt.style ? '\'' + opt.style + '\'' : 'undefined'},'invoke':__invoke});if(m[0]){return m[0];}else{throw 'Failed require "'+path+'" on "'+__filename+'" (Maybe file not found).';}}
${code}
${needExports.join('')}
return module.exports;`;
                    opt.executed[path] = (new Function('__files', '__executed', '__map', '__invoke', code))(files, opt.executed, opt.map, opt.invoke);
                    output.push(opt.executed[path]);
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
                        const typeList = ['text/', 'javascript', 'json', 'plain', 'css', 'xml', 'html'];
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
        fetchFiles: function (urls, opt = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    var _a, _b;
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
                    const list = {};
                    let count = 0;
                    for (let url of urls) {
                        url = this.urlResolve(opt.dir, url);
                        if ((_a = opt.files) === null || _a === void 0 ? void 0 : _a[url]) {
                            ++count;
                            if (count === urls.length) {
                                resolve(list);
                                return;
                            }
                            continue;
                        }
                        (_b = opt.load) === null || _b === void 0 ? void 0 : _b.call(opt, url);
                        this.fetch(opt.before + url + opt.after, opt.init).then(function (res) {
                            var _a, _b;
                            ++count;
                            if (res) {
                                list[url] = res;
                                (_a = opt.loaded) === null || _a === void 0 ? void 0 : _a.call(opt, url, 1);
                                if (opt.files) {
                                    opt.files[url] = res;
                                }
                            }
                            else {
                                (_b = opt.loaded) === null || _b === void 0 ? void 0 : _b.call(opt, url, 0);
                            }
                            if (count === urls.length) {
                                resolve(list);
                            }
                        }).catch(function () {
                            var _a;
                            ++count;
                            (_a = opt.loaded) === null || _a === void 0 ? void 0 : _a.call(opt, url, -1);
                            if (count === urls.length) {
                                resolve(list);
                            }
                        });
                    }
                });
            });
        },
        sniffFiles: function (urls, opt = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof urls === 'string') {
                    urls = [urls];
                }
                const list = yield this.fetchFiles(urls, {
                    'init': opt.init,
                    'load': opt.load,
                    'loaded': opt.loaded,
                    'dir': opt.dir,
                    'files': opt.files,
                    'before': opt.before,
                    'after': opt.after
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
        loadScript: function (url, el) {
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
                script.addEventListener('load', function () {
                    resolve(true);
                });
                script.addEventListener('error', function () {
                    resolve(false);
                });
                script.src = url;
                el.appendChild(script);
            });
        },
        loadScripts: function (urls, opt = {}) {
            return new Promise((resolve) => {
                let count = 0;
                for (const url of urls) {
                    this.loadScript(url, opt.el).then(function (res) {
                        var _a, _b;
                        ++count;
                        if (res) {
                            (_a = opt.loaded) === null || _a === void 0 ? void 0 : _a.call(opt, url, 1);
                        }
                        else {
                            (_b = opt.loaded) === null || _b === void 0 ? void 0 : _b.call(opt, url, 0);
                        }
                        if (count === urls.length) {
                            resolve();
                        }
                    }).catch(function () {
                        var _a;
                        ++count;
                        (_a = opt.loaded) === null || _a === void 0 ? void 0 : _a.call(opt, url, -1);
                        if (count === urls.length) {
                            resolve();
                        }
                    });
                }
            });
        },
        import: function (url, files, opt = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (opt.dir === undefined) {
                    opt.dir = location.href;
                }
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
            if (map[path]) {
                path = map[path];
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
            const u = {
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
            const protocol = /^(.+?)\/\//.exec(url);
            if (protocol) {
                u.protocol = protocol[1].toLowerCase();
                url = url.slice(protocol[0].length);
            }
            const hostSp = url.indexOf('/');
            let left = url;
            if (hostSp !== -1) {
                left = url.slice(0, hostSp);
                url = url.slice(hostSp);
            }
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
                const hostArray = host.split(':');
                u.hostname = hostArray[0].toLowerCase();
                if (hostArray[1]) {
                    u.port = hostArray[1];
                }
                u.host = u.hostname + (u.port ? ':' + u.port : '');
            }
            if (hostSp === -1) {
                return u;
            }
            const paqArray = url.split('?');
            u.pathname = paqArray[0];
            if (paqArray[1]) {
                const qahArray = paqArray[1].split('#');
                u.query = qahArray[0];
                if (qahArray[1]) {
                    u.hash = qahArray[1];
                }
            }
            u.path = u.pathname + (u.query ? '?' + u.query : '');
            return u;
        },
        urlResolve: function (from, to) {
            from = from.replace(/\\/g, '/');
            to = to.replace(/\\/g, '/');
            if (to === '') {
                return from;
            }
            const f = this.parseUrl(from);
            if (to.startsWith('//')) {
                return f.protocol ? f.protocol + to : to;
            }
            if (f.protocol) {
                from = f.protocol + from.slice(f.protocol.length);
            }
            const t = this.parseUrl(to);
            if (t.protocol) {
                return t.protocol + to.slice(t.protocol.length);
            }
            if (to.startsWith('#') || to.startsWith('?')) {
                const sp = from.indexOf(to[0]);
                if (sp !== -1) {
                    return from.slice(0, sp) + to;
                }
                else {
                    return from + to;
                }
            }
            let abs = (f.auth ? f.auth + '@' : '') + (f.host ? f.host : '');
            if (to.startsWith('/')) {
                abs += to;
            }
            else {
                const path = f.pathname.replace(/\/[^/]*$/g, '');
                abs += path + '/' + to;
            }
            abs = abs.replace(/\/\.\//g, '/');
            while (/\/(?!\.\.)[^/]+\/\.\.\//.test(abs)) {
                abs = abs.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
            }
            abs = abs.replace(/\.\.\//g, '');
            if (f.protocol && !f.host) {
                return f.protocol + abs;
            }
            else {
                return (f.protocol ? f.protocol + '//' : '') + abs;
            }
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
            while (code.includes('\n\n')) {
                code = code.replace(/\n\n/, '\n');
            }
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
        }
    };
    window.loader = loader;
    loader.init();
})();
