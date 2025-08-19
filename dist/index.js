import * as tool from './tool.js';
function getLocation() {
    let location = window.location.href;
    const lio = location.indexOf('?');
    if (lio > -1) {
        location = location.slice(0, lio);
    }
    if (!location.endsWith('/')) {
        const lio = location.lastIndexOf('/');
        location = location.slice(0, lio + 1);
    }
    return location;
}
const location = getLocation();
function getQueryString() {
    const uri = tool.parseUrl(import.meta.url);
    const rtn = (uri.query ? tool.queryParse(uri.query) : {});
    if (!rtn.cdn) {
        rtn.cdn = 'https://cdn.jsdelivr.net';
    }
    else if (rtn.cdn.endsWith('/')) {
        rtn.cdn = rtn.cdn.slice(0, -1);
    }
    rtn.map ??= '{}';
    rtn.map = JSON.parse(rtn.map);
    return rtn;
}
export const config = getQueryString();
export function addMap(key, value) {
    config.map[key] = value;
}
export function removeMap(key) {
    delete config.map[key];
}
function getHeadElement() {
    const heads = document.querySelectorAll('head');
    return heads[heads.length - 1];
}
const headElement = getHeadElement();
export async function loadScript(url, el) {
    return new Promise((resolve) => {
        el ??= headElement;
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
}
export async function loadScripts(urls, opt = {}) {
    return new Promise((resolve) => {
        let count = 0;
        for (const url of urls) {
            loadScript(url, opt.el).then(res => {
                ++count;
                if (res) {
                    opt.loaded?.(url, 1);
                }
                else {
                    opt.loaded?.(url, 0);
                }
                if (count === urls.length) {
                    resolve();
                }
            }).catch(() => {
                ++count;
                opt.loaded?.(url, -1);
                if (count === urls.length) {
                    resolve();
                }
            });
        }
    });
}
export async function loadLink(url, el, pos = 'after') {
    return new Promise((resolve) => {
        el ??= headElement;
        const link = document.createElement('link');
        link.addEventListener('load', function () {
            resolve(true);
        });
        link.addEventListener('error', function () {
            resolve(false);
        });
        link.href = url;
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
}
export async function loadLinks(urls, opt = {}) {
    return new Promise((resolve) => {
        let count = 0;
        for (const url of urls) {
            loadLink(url, opt.el).then(res => {
                ++count;
                if (res) {
                    opt.loaded?.(url, 1);
                }
                else {
                    opt.loaded?.(url, 0);
                }
                if (count === urls.length) {
                    resolve();
                }
            }).catch(() => {
                ++count;
                opt.loaded?.(url, -1);
                if (count === urls.length) {
                    resolve();
                }
            });
        }
    });
}
export function loadStyle(style, el) {
    el ??= headElement;
    const sel = document.createElement('style');
    sel.innerHTML = style;
    el.appendChild(sel);
}
const cache = {};
function transformUrl(url, opt = {}) {
    const map = opt.map ?? config.map;
    let base = opt.base ?? location;
    let furl = '';
    if (/^\w+:\/\//.test(url)) {
        furl = url;
    }
    else {
        if (!url.startsWith('./') && !url.startsWith('../')) {
            let libName = '';
            let libPath = '';
            if (url.startsWith('@')) {
                const match = /^(@\w+\/\w+)(.*)$/.exec(url);
                if (!match) {
                    return '';
                }
                libName = match[1];
                libPath = match[2];
            }
            else {
                const io = url.indexOf('/');
                if (io === -1) {
                    return '';
                }
                libName = url.substring(0, io);
                libPath = url.substring(io);
            }
            let mapUrl = map[libName];
            if (!mapUrl) {
                return '';
            }
            if (mapUrl.startsWith('#')) {
                mapUrl = `${config.cdn}/npm/${libName}/${mapUrl.slice(1)}`;
            }
            url = libPath ? tool.urlResolve(mapUrl, libPath) : mapUrl;
        }
        furl = tool.urlResolve(base, url);
    }
    const fname = furl.slice(furl.lastIndexOf('/') + 1);
    if (!fname.endsWith('.css') && !fname.endsWith('.json') && !fname.endsWith('.js') && !fname.endsWith('+esm')) {
        furl += '.js';
    }
    return furl;
}
function transformCode(code, opt = {}) {
    const mode = opt.mode ?? 'extract';
    const extracts = [];
    const headerCode = [];
    let reg = /import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            if (match[2] === '@litert/loader') {
                continue;
            }
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (match, alias, importUrl) => {
            if (importUrl === '@litert/loader') {
                return `const ${alias} = litertLoader ?? {};`;
            }
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            headerCode.push(`const ${alias} = await litertLoader.internalImport('${furl}', _ll_opt);`);
            return '';
        });
    }
    reg = /import\s+\{([^}]*)\}\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (match, imports, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            const list = imports.split(',').map(item => item.trim().replace(' as ', ': '));
            headerCode.push(`const { ${list.join(', ')} } = await litertLoader.internalImport('${furl}', _ll_opt);`);
            return '';
        });
    }
    reg = /import\s+(\w+)\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (match, name, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            headerCode.push(`const ${name} = (await litertLoader.internalImport('${furl}', _ll_opt)).default;`);
            return '';
        });
    }
    reg = /import\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[1]);
        }
    }
    else {
        code = code.replace(reg, (match, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            return `await litertLoader.internalImport('${furl}', _ll_opt);`;
        });
    }
    reg = /export\s+\*\s+from\s+['"](.+?)['"]/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[1]);
        }
    }
    else {
        code = code.replace(reg, (match, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            return `Object.assign(_ll_exports, await litertLoader.internalImport('${furl}', _ll_opt))`;
        });
    }
    let tmpCounter = 0;
    reg = /export\s+\{([^}]*)\}\s+from\s+['"](.+?)['"]/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (match, exports, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            const ltmp = `_ltmp_${++tmpCounter}`;
            let rtn = `const ${ltmp} = await litertLoader.internalImport('${furl}', _ll_opt);`;
            const list = exports.split(',').map(item => item.trim());
            for (const item of list) {
                const [name, alias] = item.split(' as ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${ltmp}.${name};\n`;
            }
            return rtn.slice(0, -1);
        });
    }
    reg = /(await)?\s+import\(['"](.+?)['"]\)/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (match, awaitKeyword, importUrl) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                });
            }
            return `${awaitKeyword ?? ''} litertLoader.internalImport('${furl}', _ll_opt)`;
        });
    }
    if (mode === 'replace') {
        reg = /export\s*\{([^}]*)\} *;?/g;
        code = code.replace(reg, (match, exports) => {
            let rtn = '';
            const list = exports.split(',').map(item => item.trim());
            for (const item of list) {
                const [name, alias] = item.split(' as ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${name};`;
            }
            return rtn;
        });
        reg = /export\s+(const|let|var|async +function|function|function\*|class)\s+([$\w]+)/g;
        let rtn = '';
        code = code.replace(reg, (match, method, name) => {
            rtn += `\n_ll_exports.${name} = ${name};`;
            return `${method} ${name}`;
        });
        code += rtn;
        reg = /export\s+(const|let|var)\s+{([\w, ]+)}/g;
        rtn = '';
        code = code.replace(reg, (match, method, names) => {
            const list = names.split(',').map(item => item.trim().replace(' as ', ': '));
            for (const item of list) {
                const [name, alias] = item.split(': ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${name};`;
            }
            return `${method} { ${list.join(', ')} }`;
        });
        code += rtn;
        reg = /export\s+default\s+/g;
        code = code.replace(reg, () => {
            return `_ll_exports.default = `;
        });
    }
    if (mode === 'replace') {
        let filename = opt.base ?? location;
        if (filename.endsWith('/')) {
            filename += 'index.html';
        }
        let dirname = '';
        const flio = filename.lastIndexOf('/');
        if (flio !== -1) {
            dirname = filename.slice(0, flio);
        }
        let invokeCode = '';
        if (opt.invoke) {
            for (const ikey in opt.invoke) {
                invokeCode += `const ${ikey} = _ll_opt.invoke.${ikey};\n`;
            }
        }
        code = `const _ll_exports = {};

const __dirname = '${dirname}';
const __filename = '${filename}';

${invokeCode}

${headerCode.join('\n')}

${code}

return _ll_exports;
`;
    }
    return mode === 'extract' ? extracts : [code];
}
async function loadESMFile(urls, opt = {}) {
    let success = await new Promise(resolve => {
        let count = 0;
        let successCount = 0;
        let successUrls = [];
        for (const url of urls) {
            const furl = transformUrl(url, opt);
            if (cache[furl]) {
                ++successCount;
                successUrls.push(furl);
                if (++count === urls.length) {
                    resolve(successCount < urls.length ? false : successUrls);
                }
                continue;
            }
            cache[furl] = {
                'name': opt.name ?? '',
                'code': '',
                'transform': '',
                'nostring': '',
                'object': null,
            };
            opt.load?.(url, furl);
            tool.get(furl + ((!furl.startsWith(config.cdn) && !furl.startsWith('memory://')) ? (opt.after ?? '') : '')).then(code => {
                if (typeof code !== 'string') {
                    opt.loaded?.(url, furl, false);
                    if (++count === urls.length) {
                        resolve(successCount < urls.length ? false : successUrls);
                    }
                    return;
                }
                ++successCount;
                successUrls.push(furl);
                opt.loaded?.(url, furl, true);
                cache[furl].code = tool.removeComment(code);
                if (++count === urls.length) {
                    resolve(successCount < urls.length ? false : successUrls);
                }
            }).catch(() => {
                opt.loaded?.(url, furl, false);
                if (++count === urls.length) {
                    resolve(successCount < urls.length ? false : successUrls);
                }
            });
        }
    });
    if (!success) {
        return false;
    }
    const furls = [];
    for (const furl of success) {
        if (!cache[furl]) {
            return [];
        }
        if (cache[furl].transform) {
            continue;
        }
        cache[furl].transform = 'waiting...';
        if (furl.endsWith('.css')) {
            cache[furl].transform = cache[furl].code.replace(/url\(['"]?([/\w.]+)['"]?\)/g, (match, url) => {
                return `url(${tool.urlResolve(furl, url)})`;
            });
            cache[furl].nostring = cache[furl].transform;
            continue;
        }
        const exString = tool.extractString(cache[furl].code);
        const files = transformCode(exString.code, {
            'base': furl,
            'error': opt.error,
        });
        if (files.length) {
            const objUrls = await loadESMFile(files, {
                'base': furl,
                'name': opt.name,
                'after': opt.after,
                'map': opt.map,
                'invoke': opt.invoke,
                preprocess: opt.preprocess,
                load: opt.load,
                loaded: opt.loaded,
                error: opt.error,
            });
            if (!objUrls) {
                return false;
            }
        }
        const [transform] = transformCode(exString.code, {
            'base': furl,
            'mode': 'replace',
            'invoke': opt.invoke,
            error: opt.error,
        });
        cache[furl].nostring = transform;
        cache[furl].transform = tool.restoreString(transform, exString.strings);
        if (opt.preprocess) {
            cache[furl].transform = opt.preprocess(furl, cache[furl].transform, cache[furl].nostring);
        }
        furls.push(furl);
    }
    return furls;
}
export async function loadESM(url, opt = {}) {
    const furls = await loadESMFile([url], opt);
    if (!furls) {
        return false;
    }
    try {
        const rtn = await internalImport(furls[0], {
            'invoke': opt.invoke,
            'error': opt.error,
        });
        return rtn;
    }
    catch (e) {
        opt.error?.(furls[0], {
            'result': -1,
            'msg': 'Wrap error',
        });
        console.error('[LOADER]', e);
        return false;
    }
}
export async function loadESMWorker(url, opt = {}) {
    const furls = await loadESMFile([url], opt);
    if (!furls) {
        return {
            'create': () => false,
        };
    }
    return {
        create: () => {
            const ourl = URL.createObjectURL(new Blob([`

const _ll_message = {};
const _ll_cache = {};
const _ll_asyncFunction = Object.getPrototypeOf(async function() {}).constructor;

const litertLoader = {
    'internalImport': async (url, opt) => {
        return new Promise(resolve => {
            if (!url) {
                resolve({});
                return;
            }
            if (_ll_cache[url]) {
                resolve(_ll_cache[url]);
                return;
            }
            _ll_cache[url] = {};
            const index = Object.keys(_ll_message).length;
            _ll_message[index] = async object => {
                const rtn = await (new _ll_asyncFunction('_ll_opt', object.transform))(opt);
                Object.assign(_ll_cache[furl], rtn);
                resolve(rtn);
            };
            self.postMessage({
                'origin': '@litert/loader',
                'type': 'internalImport',
                'index': index,
                'url': url,
            });
        });
    },
};

self.addEventListener('message', e => {
    if (e.data.origin !== '@litert/loader') {
        return;
    }
    e.stopImmediatePropagation();
    if (!_ll_message[e.data.index]) {
        return;
    }
    _ll_message[e.data.index](e.data.object);
    delete _ll_message[e.data.index];
});

(async (_ll_opt) => {

    ${cache[furls[0]].transform}

})({});`
            ], {
                'type': 'text/javascript',
            }));
            const worker = new Worker(ourl);
            worker.addEventListener('message', (e) => {
                if (e.data.origin !== '@litert/loader') {
                    return;
                }
                switch (e.data.type) {
                    case 'internalImport': {
                        const furl = e.data.url;
                        worker.postMessage({
                            'origin': '@litert/loader',
                            'index': e.data.index,
                            'object': {
                                'transform': cache[furl].transform,
                            },
                        });
                        break;
                    }
                }
            });
            return worker;
        },
    };
}
const asyncFunction = Object.getPrototypeOf(async function () {
}).constructor;
export async function internalImport(furl, opt = {}) {
    if (furl === '@litert/loader') {
        return window['@litert/loader'];
    }
    if (!cache[furl]) {
        return {};
    }
    if (cache[furl].object) {
        return cache[furl].object;
    }
    cache[furl].object = {};
    if (furl.endsWith('.css')) {
        loadStyle(cache[furl].transform);
        return cache[furl].object;
    }
    try {
        const rtn = await (new asyncFunction('_ll_opt', cache[furl].transform))(opt);
        Object.assign(cache[furl].object, rtn);
        return rtn;
    }
    catch (e) {
        opt.error?.(furl, {
            'result': -2,
            'msg': e.message,
        });
        return {};
    }
}
export function clearCacheByName(name) {
    let count = 0;
    for (const key in cache) {
        if (cache[key].name !== name) {
            continue;
        }
        delete cache[key];
        ++count;
    }
    return count;
}
export function clearCacheByKeyPrefix(start) {
    let count = 0;
    for (const key in cache) {
        if (!key.startsWith(start)) {
            continue;
        }
        delete cache[key];
        ++count;
    }
    return count;
}
export function insertCache(files, name) {
    const memoryName = tool.random(48, tool.RANDOM_LN);
    for (let key in files) {
        const code = tool.removeComment(files[key]);
        if (!key.startsWith('/')) {
            key = '/' + key;
        }
        cache['memory://' + memoryName + key] = {
            'name': name ?? '',
            'code': code,
            'transform': '',
            'nostring': '',
            'object': null,
        };
    }
    return 'memory://' + memoryName;
}
export function getCacheTransform(furl) {
    return cache[furl]?.transform ?? '';
}
export { tool };
window.litertLoader = {
    config,
    addMap,
    removeMap,
    loadScript,
    loadScripts,
    loadLink,
    loadLinks,
    loadStyle,
    loadESM,
    loadESMWorker,
    internalImport,
    clearCacheByName,
    clearCacheByKeyPrefix,
    insertCache,
    getCacheTransform,
    tool,
};
document.addEventListener('DOMContentLoaded', () => {
    if (!config.path) {
        return;
    }
    loadESM(config.path, {
        'after': config.after,
    }).catch(e => {
        console.log('loader init', e);
    });
});
