import * as tool from './tool.js';

// --- 预处理 URL ---

function getScriptElement(): HTMLScriptElement {
    const scripts = document.querySelectorAll('script');
    return scripts[scripts.length - 1];
}
/** --- 加载当前文件的 script 元素 --- */
const scriptElement = getScriptElement();

function getLocation(): string {
    /** --- 浏览器 location 的网址目录，以 / 结尾 --- */
    let location = window.location.href;
    const lio = location.indexOf('?');
    // --- 把 querystring 分离掉 ---
    if (lio > -1) {
        location = location.slice(0, lio);
    }
    // --- 如果不是 / 结尾则要变成 / 结尾 ---
    if (!location.endsWith('/')) {
        const lio = location.lastIndexOf('/');
        location = location.slice(0, lio + 1);
    }
    return location;
}
/** --- 当前执行文件的网址，以 / 结尾 --- */
const location = getLocation();

function getQueryString(): {
    'path'?: string;
    'map': Record<string, string>;
    /** --- 如 ?123，cdn 不会加后缀 --- */
    'after'?: string;
    /** --- cdn 不以 / 结尾 --- */
    'cdn': string;
} {
    /** --- uri --- */
    const uri = tool.parseUrl(scriptElement.src);
    const rtn = (uri.query ? tool.queryParse(uri.query) : {}) as Record<string, any>;
    if (!rtn.cdn) {
        rtn.cdn = 'https://cdn.jsdelivr.net';
    }
    else if (rtn.cdn.endsWith('/')) {
        rtn.cdn = rtn.cdn.slice(0, -1);
    }
    rtn.map ??= '{}';
    rtn.map = JSON.parse(rtn.map);
    // rtn.map['@litert/loader'] = tool.urlResolve(location, uri.pathname);
    return rtn as any;
}
/** --- 当前 js 查询字符串 --- */
export const config = getQueryString();

/**
 * --- 添加映射 ---
 * @param key 键
 * @param value 值
 */
export function addMap(key: string, value: string): void {
    config.map[key] = value;
}

/**
 * --- 移除映射 ---
 * @param key 映射的键
 */
export function removeMap(key: string): void {
    delete config.map[key];
}

function getHeadElement(): HTMLHeadElement {
    const heads = document.querySelectorAll('head');
    return heads[heads.length - 1];
}
/** --- 页面的 head 元素 --- */
const headElement = getHeadElement();

/**
 * --- 加载脚本 ---
 * @param url 脚本网址
 * @param el 加载到的元素，默认是 head 元素
 */
export async function loadScript(url: string, el?: HTMLElement): Promise<boolean> {
    return new Promise((resolve) => {
        el ??= headElement;
        const script = document.createElement('script');
        script.addEventListener('load', function() {
            resolve(true);
        });
        script.addEventListener('error', function() {
            resolve(false);
        });
        script.src = url;
        el.appendChild(script);
    });
}

/**
 * --- 批量加载 js 文件 ---
 * @param urls js 文件列表
 * @param opt 选项
 */
export async function loadScripts(urls: string[], opt: {
    'loaded'?: (url: string, state: number) => void;
    'el'?: HTMLElement;
} = {}): Promise<void> {
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

/**
 * --- 加载 css 文件 ---
 * @param url css 文件网址
 * @param el 加载到的元素，默认是 head 元素
 * @param pos 位置，默认是 after
 * @returns 加载是否成功
 */
export async function loadLink(url: string, el?: HTMLElement, pos: 'before' | 'after' = 'after'): Promise<boolean> {
    return new Promise((resolve) => {
        el ??= headElement;
        const link = document.createElement('link');
        link.addEventListener('load', function() {
            resolve(true);
        });
        link.addEventListener('error', function() {
            resolve(false);
        });
        link.href = url;
        link.rel = 'stylesheet';
        if (pos === 'after') {
            el.appendChild(link);
        }
        else {
            // --- 之前 ---
            if (el.firstChild) {
                el.insertBefore(link, el.firstChild);
            }
            else {
                el.appendChild(link);
            }
        }
    });
}

/**
 * --- 批量加载 css 文件 ---
 * @param urls css 文件列表
 * @param opt 选项
 */
export async function loadLinks(urls: string[], opt: {
    'loaded'?: (url: string, state: number) => void;
    'el'?: HTMLElement;
} = {}): Promise<void> {
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

/**
 * --- 加载 css 字符串 ---
 * @param style css 字符串
 * @param el 加载到的元素，默认是 head 元素
 */
export function loadStyle(style: string, el?: HTMLElement): void {
    el ??= headElement;
    const sel = document.createElement('style');
    sel.innerHTML = style;
    el.appendChild(sel);
}

/** --- 缓存 --- */
const cache: Record<string, {
    /** --- 标识，可为空字符串 --- */
    'name': string;
    /** --- 原始代码 --- */
    'code': string;
    /** --- 转换后的代码 --- */
    'transform': string;
    /** --- 对象 --- */
    'object': Record<string, any> | null;
}> = {};

/**
 * --- 转换 URL ---
 * @param url 原始 URL
 * @param opt 选项
 * @returns 转换后的 URL
 */
function transformUrl(url: string, opt: {
    /** --- 基础 URL，用于解析相对路径，可以是文件路径，如果不以 / 结尾，就成文件路径了 --- */
    'base'?: string;
} = {}): string {
    /** --- 相对路径 --- */
    let base = opt.base ?? location;
    /** --- 最终请求的文件地址 --- */
    let furl = '';
    if (/^\w+:\/\//.test(url)) {
        // --- 是个网址 ---
        furl = url;
    }
    else {
        // --- 路径 ---
        if (!url.startsWith('./') && !url.startsWith('../')) {
            // --- 加载的是库 ---
            /** --- 库名 --- */
            let libName = '';
            /** --- 余下的项 --- */
            let libPath = '';
            if (url.startsWith('@')) {
                // --- 处理 @ 开头的库 ---
                const match = /^(@\w+\/\w+)(.*)$/.exec(url);
                if (!match) {
                    // --- 库名格式错误 ---
                    return '';
                }
                libName = match[1];
                libPath = match[2];
            }
            else {
                // --- 正常的 ---
                const io = url.indexOf('/');
                if (io === -1) {
                    // --- 库名格式错误 ---
                    return '';
                }
                libName = url.substring(0, io);
                libPath = url.substring(io);
            }
            // --- 去 map 里面找 ---
            /** --- http://xxx/abc/index, #index --- */
            let mapUrl = config.map[libName];
            if (!mapUrl) {
                // --- 没有找到 ---
                return '';
            }

            if (mapUrl.startsWith('#')) {
                mapUrl = `${config.cdn}/npm/${libName}/${mapUrl.slice(1)}`;
            }
            url = libPath ? tool.urlResolve(mapUrl, libPath) : mapUrl;
        }
        furl = tool.urlResolve(base, url);
    }
    // --- furl 就是要加载的 js 文件 ---
    const fname = furl.slice(furl.lastIndexOf('/') + 1);
    if (!fname.endsWith('.css') && !fname.endsWith('.json') && !fname.endsWith('.js') && !fname.endsWith('+esm')) {
        furl += '.js';
    }
    return furl;
}

/**
 * --- 转换代码 ---
 * @param code 原始代码
 * @param opt 选项
 * @returns 转换后的代码
 */
function transformCode(code: string, opt: {
    /** --- 基础 URL，用于解析相对路径，可以是文件路径，如果不以 / 结尾，就成文件路径了 --- */
    'base'?: string;
    /** --- 模式，提取或替换，默认提取 --- */
    'mode'?: 'extract' | 'replace';
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
} = {}): string[] {
    const mode = opt.mode ?? 'extract';

    /** --- 要嗅探的文件 --- */
    const extracts: string[] = [];
    /** --- 最后追加到头部的代码 --- */
    const headerCode: string[] = [];
    // --- 处理 import * as xx from 'xx' ---
    let reg = /import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match: RegExpExecArray | null;
        while ((match = reg.exec(code)) !== null) {
            if (match[2] === '@litert/loader') {
                // --- 特殊情况 ---
                continue;
            }
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (
            match: string, alias: string, importUrl: string
        ) => {
            if (importUrl === '@litert/loader') {
                // --- 特殊情况 ---
                return `const ${alias} = litertLoader ?? {};`;
            }
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            headerCode.push(`const ${alias} = await litertLoader.internalImport('${furl}', _ll_opt);`);
            return '';
        });
    }

    // --- 处理 import { xx } from 'xx' ---
    reg = /import\s+\{([^}]*)\}\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (
            match: string, imports: string, importUrl: string
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            const list = imports.split(',').map(item => item.trim().replace(' as ', ': '));
            headerCode.push(`const { ${list.join(', ')} } = await litertLoader.internalImport('${furl}', _ll_opt);`);
            return '';
        });
    }

    // --- 处理 import xx from 'xx' ---
    reg = /import\s+(\w+)\s+from\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (
            match, name, importUrl
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            headerCode.push(`const ${name} = (await litertLoader.internalImport('${furl}', _ll_opt)).default;`);
            return '';
        });
    }

    // --- 处理 import 'xx' ---
    reg = /import\s+['"](.+?)['"] *;?/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[1]);
        }
    }
    else {
        code = code.replace(reg, (
            match, importUrl
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            return `await litertLoader.internalImport('${furl}', _ll_opt);`;
        });
    }

    // --- 处理 export * from 'xx' ---
    reg = /export\s+\*\s+from\s+['"](.+?)['"]/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[1]);
        }
    }
    else {
        code = code.replace(reg, (
            match, importUrl
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            return `Object.assign(_ll_exports, await litertLoader.internalImport('${furl}', _ll_opt))`;
        });
    }

    // --- 处理 export { xx } from 'xx' ---
    let tmpCounter = 0;
    reg = /export\s+\{([^}]*)\}\s+from\s+['"](.+?)['"]/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (
            match: string, exports: string, importUrl: string
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            const ltmp = `_ltmp_${++tmpCounter}`;
            let rtn = `const ${ltmp} = await litertLoader.internalImport('${furl}', _ll_opt);`;
            const list = exports.split(',').map(item => item.trim());
            for (const item of list) {
                const [name, alias] = item.split(' as ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${ltmp}.${name};`;
            }
            return rtn.slice(0, -1);
        });
    }

    // --- 处理 await import('xx') ---
    reg = /(await)?\s+import\(['"](.+?)['"]\)/g;
    if (mode === 'extract') {
        let match;
        while ((match = reg.exec(code)) !== null) {
            extracts.push(match[2]);
        }
    }
    else {
        code = code.replace(reg, (
            match: string, awaitKeyword: string, importUrl: string
        ) => {
            const furl = transformUrl(importUrl, opt);
            if (!cache[furl]) {
                // --- 报错 ---
                opt.error?.(furl, {
                    'result': 0,
                    'msg': 'Cache not found',
                }) as any;
            }
            return `${awaitKeyword ?? ''} litertLoader.internalImport('${furl}', _ll_opt)`;
        });
    }

    // --- 以下纯粹替换，不提取 ---
    if (mode === 'replace') {

        // --- 处理 export { a, b as c } ---
        reg = /export\s*\{([^}]*)\} *;?/g;
        code = code.replace(reg, (
            match: string, exports: string
        ) => {
            let rtn = '';
            const list = exports.split(',').map(item => item.trim());
            for (const item of list) {
                const [name, alias] = item.split(' as ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${name};`;
            }
            return rtn;
        });

        // --- 处理 export const/let/var/async function/function/class ---
        reg = /export\s+(const|let|var|async +function|function|function\*|class)\s+([$\w]+)/g;
        let rtn = '';
        code = code.replace(reg, (
            match: string, method: string, name: string
        ) => {
            rtn += `\n_ll_exports.${name} = ${name};`;
            return `${method} ${name}`;
        });
        code += rtn;

        // --- 处理 export const/let/var { xxx, yyy as zzz } ---
        reg = /export\s+(const|let|var)\s+{([\w, ]+)}/g;
        rtn = '';
        code = code.replace(reg, (
            match: string, method: string, names: string
        ) => {
            const list = names.split(',').map(item => item.trim().replace(' as ', ': '));
            for (const item of list) {
                const [name, alias] = item.split(': ').map(part => part.trim());
                rtn += `_ll_exports.${alias ?? name} = ${name};`;
            }
            return `${method} { ${list.join(', ')} }`;
        });
        code += rtn;

        // --- 处理 export default ---
        reg = /export\s+default\s+/g;
        code = code.replace(reg, () => {
            return `_ll_exports.default = `;
        });

    }

    // --- 前缀 ---
    if (mode === 'replace') {
        code = `const _ll_exports = {};

${headerCode.join('\n')}

${code}

return _ll_exports;
`;
    }

    return mode === 'extract' ? extracts : [code];
}

/**
 * --- fetch esm 文件 ---
 * @param urls 相对路径列表
 * @param opt 参数
 * @returns 加载成功的 objurl 列表，失败返回 false
 */
async function loadESMFile(urls: string[], opt: {
    /** --- 基础 URL --- */
    'base'?: string;
    /** --- 标记名，可在清除时使用 --- */
    'name'?: string;
    /** --- 网址后缀，如 ?123，仅会加载到非 cdn/memory 网址 --- */
    'after'?: string;
    /** --- 加载完成 --- */
    'loaded'?: (url: string, furl: string, fail: boolean) => void | Promise<void>;
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
} = {}): Promise<string[] | false> {
    let success = await new Promise<string[] | false>(resolve => {
        /** --- 当前加载数 --- */
        let count = 0;
        /** --- 加载成功数 --- */
        let successCount = 0;
        /** --- 加载成功的 furl --- */
        let successUrls: string[] = [];
        for (const url of urls) {
            const furl = transformUrl(url, opt);
            if (cache[furl]) {
                // --- 缓存里有 ---
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
                'object': null,
            };
            tool.get(furl + ((!furl.startsWith(config.cdn) && !furl.startsWith('memory://')) ? (opt.after ?? '') : '')).then(code => {
                if (typeof code !== 'string') {
                    opt.loaded?.(url, furl, false) as any;
                    if (++count === urls.length) {
                        resolve(successCount < urls.length ? false : successUrls);
                    }
                    return;
                }
                ++successCount;
                successUrls.push(furl);
                opt.loaded?.(url, furl, true) as any;
                cache[furl].code = tool.removeComment(code);
                if (++count === urls.length) {
                    resolve(successCount < urls.length ? false : successUrls);
                }
            }).catch(() => {
                opt.loaded?.(url, furl, false) as any;
                if (++count === urls.length) {
                    resolve(successCount < urls.length ? false : successUrls);
                }
            });
        }
    });
    if (!success) {
        return false;
    }

    const furls: string[] = [];
    for (const furl of success) {
        if (!cache[furl]) {
            return [];
        }
        if (cache[furl].transform) {
            // --- 转换过了 ---
            continue;
        }
        cache[furl].transform = 'waiting...';
        if (furl.endsWith('.css')) {
            // --- css 不做处理 ---
            cache[furl].transform = cache[furl].code.replace(/url\(['"]?([/\w.]+)['"]?\)/g, (match, url) => {
                return `url(${tool.urlResolve(furl, url)})`;
            });
            continue;
        }
        /** --- 提取的字符串 --- */
        const exString = tool.extractString(cache[furl].code);
        /** --- 提取子文件 --- */
        const files = transformCode(exString.code, {
            'base': furl,
            'error': opt.error,
        });
        if (files.length) {
            const objUrls = await loadESMFile(files, {
                'base': furl,
                'name': opt.name,
                'after': opt.after,
                'loaded': opt.loaded,
                'error': opt.error,
            });
            if (!objUrls) {
                return false;
            }
        }
        // --- 开始转换 ---
        const [transform] = transformCode(exString.code, {
            'base': furl,
            'mode': 'replace',
            'error': opt.error,
        });
        cache[furl].transform = tool.restoreString(transform, exString.strings);
        furls.push(furl);
    }

    return furls;
}

/**
 * --- 加载 ESM 模块 ---
 * @param url 模块 URL 或内存模块键名
 * @param opt 选项
 * @returns 模块导出对象
 */
export async function loadESM(url: string, opt: {
    /** --- 基础 URL，用于解析相对路径，可以是文件路径，如果不以 / 结尾，就成文件路径了 --- */
    'base'?: string;
    /** --- 标记名，可在清除时使用 --- */
    'name'?: string;
    /** --- 网址后缀，如 ?123，仅会加载到非 cdn/memory 网址 --- */
    'after'?: string;
    /** --- 加载完成 --- */
    'loaded'?: (url: string, furl: string, fail: boolean) => void | Promise<void>;
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
} = {}): Promise<Record<string, any> | false> {
    const furls = await loadESMFile([url], opt);
    if (!furls) {
        return false;
    }
    try {
        return await internalImport(furls[0], {
            'error': opt.error,
        });
    }
    catch (e: any) {
        opt.error?.(furls[0], {
            'result': -1,
            'msg': 'Wrap error',
        }) as any;
        console.error('[LOADER]', e);
        return false;
    }
}

/**
 * --- 加载 ESM 模块到 Worker ---
 * @param url 模块 URL
 * @param opt 选项
 * @returns 供创建 Worker 的对象
 */
export async function loadESMWorker(url: string, opt: {
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
} = {}): Promise<{
        create: () => Worker | false;
    }> {
    const furls = await loadESMFile([url], opt);
    if (!furls) {
        return {
            'create': () => false,
        };
    }
    return {
        create: (): Worker => {
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
            worker.addEventListener('message', (e: MessageEvent) => {
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

/** --- AsyncFunction 构造函数，类似 Function --- */
const asyncFunction = Object.getPrototypeOf(async function() {
    // --- AsyncFunction ---
}).constructor;

/**
 * --- 内部导入 ---
 * @param furl 文件 URL
 * @returns 模块导出对象
 */
export async function internalImport(furl: string, opt: {
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
} = {}): Promise<Record<string, any>> {
    if (furl === '@litert/loader') {
        return (window as any)['@litert/loader'];
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
    catch (e: any) {
        opt.error?.(furl, {
            'result': -2,
            'msg': e.message,
        }) as any;
        return {};
    }
}

/**
 * --- 清除缓存根据名称 ---
 * @param name 名称
 * @returns 清除的数量
 */
export function clearCacheByName(name: string): number {
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

/**
 * --- 清除缓存根据前缀 ---
 * @param start 前缀
 * @returns 清除的数量
 */
export function clearCacheByKeyPrefix(start: string): number {
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

/**
 * --- 插入缓存 ---
 * @param files 文件，key 为文件地址（可 / 或不 / 开头），value 为代码内容
 * @param name 名称
 * @returns 内存地址前缀
 */
export function insertCache(files: Record<string, string>, name?: string): string {
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
            'object': null,
        };
    }
    return 'memory://' + memoryName;
}

/**
 * --- 获取缓存转换代码 ---
 * @param furl 文件 URL
 * @returns 转换代码
 */
export function getCacheTransform(furl: string): string {
    return cache[furl]?.transform ?? '';
}

export { tool };

(window as any).litertLoader = {
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

// --- 业务代码 ---

document.addEventListener('DOMContentLoaded', () => {
    if (!config.path) {
        return;
    }
    // --- 只能是 ESM 模块 ---
    loadESM(config.path, {
        'after': config.after,
    }).catch(e => {
        // eslint-disable-next-line no-console
        console.log('loader init', e);
    });
});
