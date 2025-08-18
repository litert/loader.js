/**
 * --- 等待毫秒 ---
 * @param ms 等待的毫秒，默认 0，最大 30 秒
 */
export function sleep(ms: number = 0): Promise<boolean> {
    return new Promise(function(resolve) {
        if (ms > 30_000) {
            resolve(false);
            return;
        }
        window.setTimeout(function() {
            resolve(true);
        }, ms);
    });
}

/** --- 网址对象 --- */
export interface IUrl {
    'auth': string | null;
    'hash': string | null;
    'host': string | null;
    'hostname': string | null;
    'pass': string | null;
    'path': string | null;
    'pathname': string;
    'protocol': string | null;
    'port': string | null;
    'query': string | null;
    'user': string | null;
}

/**
 * --- 发起 fetch 请求 ---
 * @param url 网址
 * @param init 选项
 * @returns 文本或二进制数据，失败时返回 null
 */
export async function fetch(url: string, init?: RequestInit): Promise<string | Blob | null> {
    try {
        const res = await window.fetch(url, init);
        if (res.status === 200 || res.status === 304) {
            /** --- 内容类型 --- */
            const ct = res.headers.get('content-type')?.toLowerCase() ?? '';
            const types = ['text/', 'javascript', 'json', 'css', 'xml', 'html'];
            return types.some(item => ct.includes(item)) ? await res.text() : await res.blob();
        }
        return null;
    }
    catch {
        return null;
    }
}

/** --- 重试间隔 --- */
const retryTimes = [300, 1_000, 2_000];

/**
 * --- 发起 GET 请求 ---
 * @param url 网址
 * @param init 选项
 * @param opt 选项
 * @returns 文本或二进制数据，失败时返回 null
 */
export async function get(url: string, init?: RequestInit, opt: {
    /** --- 重试次数，默认 3 次 --- */
    'retry'?: number;
} = {}): Promise<string | Blob | null> {
    init ??= {};
    init.method = 'GET';
    const retry = opt.retry ?? 3;
    for (let i = 0; i <= retry; ++i) {
        const res = await fetch(url, init);
        if (res !== null) {
            return res;
        }
        if (i === retry) {
            return null;
        }
        await sleep(retryTimes[i]);
    }
    return null;
}

/**
 * --- 发起 POST 请求 ---
 * @param url 网址
 * @param data 数据
 * @param init 选项
 * @returns 文本或二进制数据，失败时返回 null
 */
export async function post(
    url: string, data: Record<string, any> | FormData, init?: RequestInit
): Promise<string | Blob | null> {
    init ??= {};
    init.method = 'POST';
    init.headers ??= {};
    if (!(data instanceof FormData)) {
        if (init.headers instanceof Headers) {
            init.headers.set('content-type', 'application/json');
        }
        else {
            (init.headers as Record<string, string>)['content-type'] = 'application/json';
        }
    }
    init.body = data instanceof FormData ? data : JSON.stringify(data);
    const res = await fetch(url, init);
    return res;
}

/**
 * --- 发起 GET 请求并解析 JSON 响应 ---
 * @param url 网址
 * @param init 选项
 * @returns JSON 数据，失败时返回 null
 */
export async function getResponseJson(url: string, init?: RequestInit): Promise<any | null> {
    const res = await get(url, init);
    if (!res) {
        return null;
    }
    if (typeof res !== 'string') {
        return null;
    }
    try {
        return JSON.parse(res);
    }
    catch {
        return null;
    }
}

/**
 * --- 发起 POST 请求并解析 JSON 响应 ---
 * @param url 网址
 * @param data 数据
 * @param init 选项
 * @returns JSON 数据，失败时返回 null
 */
export async function postResponseJson(
    url: string, data: Record<string, any> | FormData, init?: RequestInit
): Promise<any | null> {
    const res = await post(url, data, init);
    if (!res) {
        return null;
    }
    if (typeof res !== 'string') {
        return null;
    }
    try {
        return JSON.parse(res);
    }
    catch {
        return null;
    }
}

/**
 * --- 将对象转换为 query string ---
 * @param query 要转换的对象
 * @param encode 是否转义
 */
export function queryStringify(query: Record<string, any>, encode: boolean = true): string {
    if (encode) {
        return Object.entries(query).map(([k, v]) => {
            if (Array.isArray(v)) {
                return v.map((i) => `${encodeURIComponent(k)}=${encodeURIComponent(i)}`).join('&');
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }).join('&');
    }
    return Object.entries(query).map(([k, v]) => {
        if (Array.isArray(v)) {
            return v.map((i) => `${k}=${i}}`).join('&');
        }
        return `${k}=${v}`;
    }).join('&');
}

/**
 * --- 将 query string 转换为对象 ---
 * @param query 要转换的字符串
 */
export function queryParse(query: string): Record<string, string | string[]> {
    const ret: Record<string, string | string[]> = {};
    const arrayKeys: Record<string, boolean> = {};
    const arr = query.split('&');
    for (const i of arr) {
        if (!i.length) {
            continue;
        }
        const pos = i.indexOf('=');

        const key = decodeURIComponent(pos === -1 ? i : i.slice(0, pos));
        let value = '';
        try {
            value = pos === -1 ? '' : decodeURIComponent(i.slice(pos + 1));
        }
        catch {
            value = pos === -1 ? '' : i.slice(pos + 1);
        }

        if (arrayKeys[key]) {
            (ret[key] as string[]).push(value);
        }
        else if (undefined === ret[key]) {
            ret[key] = value;
        }
        else {
            ret[key] = [ret[key] as string, value];
            arrayKeys[key] = true;
        }
    }
    return ret;
}

/**
 * --- 传输 url 并解析为 IUrl 对象 ---
 * @param url url 字符串
 */
export function parseUrl(url: string): IUrl {
    // --- test: https://ab-3dc:aak9()$@github.com:80/nodejs/node/blob/master/lib/url.js?mail=abc@def.com#223 ---
    const rtn: IUrl = {
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
                // --- 有密码 ---
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
        // --- 没有 protocol ---
        rtn['pathname'] = url;
    }
    // --- 组合 ---
    rtn['path'] = rtn['pathname'] + (rtn['query'] ? '?' + rtn['query'] : '');
    return rtn;
}

/**
 * --- 将相对路径根据基准路径进行转换 ---
 * @param from 基准路径
 * @param to 相对路径
 */
export function urlResolve(from: string, to: string): string {
    from = from.replace(/\\/g, '/');
    to = to.replace(/\\/g, '/');
    // --- to 为空，直接返回 form ---
    if (to === '') {
        return urlAtom(from);
    }
    // --- 获取 from 的 scheme, host, path ---
    const f = parseUrl(from);
    // --- 以 // 开头的，加上 from 的 protocol 返回 ---
    if (to.startsWith('//')) {
        return urlAtom(f.protocol ? f.protocol + to : to);
    }
    if (f.protocol) {
        // --- 获取小写的 protocol ---
        from = f.protocol + from.slice(f.protocol.length);
    }
    // --- 获取 to 的 scheme, host, path ---
    const t = parseUrl(to);
    // --- 已经是绝对路径，直接返回 ---
    if (t.protocol) {
        // --- 获取小写的 protocol ---
        return urlAtom(t.protocol + to.slice(t.protocol.length));
    }
    // --- # 或 ? 替换后返回 ---
    if (to.startsWith('#') || to.startsWith('?')) {
        const sp = from.indexOf(to[0]);
        if (sp !== -1) {
            return urlAtom(from.slice(0, sp) + to);
        }
        else {
            return urlAtom(from + to);
        }
    }
    // --- 处理后面的尾随路径 ---
    let abs = (f.auth ? f.auth + '@' : '') + (f.host ?? '');
    if (to.startsWith('/')) {
        // -- abs 类似是 /xx/xx ---
        abs += to;
    }
    else {
        // --- to 是 xx/xx 这样的 ---
        // --- 移除基准 path 不是路径的部分，如 /ab/c 变成了 /ab，/ab 变成了 空 ---
        const path = f.pathname.replace(/\/[^/]*$/g, '');
        // --- abs 是 /xx/xx 了，因为如果 path 是空，则跟上了 /，如果 path 不为空，也是 / 开头 ---
        abs += path + '/' + to;
    }
    // --- 返回最终结果 ---
    if (f.protocol && (f.protocol !== 'file:') && !f.host) {
        // --- 类似 c:/ ---
        return urlAtom(f.protocol + abs);
    }
    else {
        // --- 类似 http:// ---
        return urlAtom((f.protocol ? f.protocol + '//' : '') + abs);
    }
}

/** --- 处理 URL 中的 .. / . 等 --- */
export function urlAtom(url: string): string {
    // --- 删掉 ./ ---
    while (url.includes('/./')) {
        url = url.replace(/\/\.\//g, '/');
    }
    // --- 删掉 ../ ---
    while (/\/(?!\.\.)[^/]+\/\.\.\//.test(url)) {
        url = url.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
    }
    url = url.replace(/\.\.\//g, '');
    return url;
}

/**
 * --- 判断字符是否是转义字符 ---
 * @param index 字符在字符串中的位置
 * @param code 字符串
 * @returns 是否是转义字符
 */
export function isEscapeChar(index: number, code: string): boolean {
    let preChar = code[index - 1];
    let count = 0;
    while (preChar === '\\') {
        preChar = code[index - (++count) - 1];
    }
    return count % 2 === 0 ? false : true;
}

/**
 * --- 移除注释 ---
 * @param code 字符串
 * @returns 移除注释后的字符串
 */
export function removeComment(code: string): string {
    /** --- 是否是 /* * / 注释，line-char --- */
    let isComment: string = '';
    /** --- 是否是 ` 字符串 --- */
    let isLineString: boolean = false;
    code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    /** --- 当前行数 --- */
    let line = -1;
    code = code.replace(/.*(\n|$)/g, (t: string): string => {
        ++line;
        if (isComment && !t.includes('*/')) {
            // --- 当前在 /* */ 中，但是当前行没有 */，直接返回空 ---
            return '';
        }
        if (!isComment && !t.includes('/*') && !t.includes('//') && !t.includes('`')) {
            // --- 既没有在 /* */ 中，也不含 /* // 或者 `，则无视 ---
            return t;
        }
        /** --- 单行最终 code --- */
        let overCode: string = '';
        /** --- 是否是字符串 --- */
        let isString: string = '';
        /** --- 是否是正则 --- */
        let isReg = '';
        for (let i = 0; i < t.length; ++i) {
            const char = t[i];
            if (isLineString) {
                if ((char === '`') && !isEscapeChar(i, t)) {
                    isLineString = false;
                }
                overCode += char;
            }
            else if (isReg) {
                if (char === '[') {
                    if (!isEscapeChar(i, t)) {
                        isReg = '[';
                    }
                }
                else if (char === ']') {
                    if (!isEscapeChar(i, t) && (isReg === '[')) {
                        isReg = '/';
                    }
                }
                else if (char === '/') {
                    if (!isEscapeChar(i, t) && (isReg === '/')) {
                        isReg = '';
                    }
                }
                overCode += char;
            }
            else if (isString) {
                if ((char === isString) && !isEscapeChar(i, t)) {
                    isString = '';
                }
                overCode += char;
            }
            else if (isComment) {
                if (char === '/' && (t[i - 1] === '*') && (isComment !== `${line}-${i - 2}`)) {
                    isComment = '';
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
                            isComment = `${line}-${i}`;
                        }
                        else {
                            // --- 判断是 reg 还是 / 除号 ---
                            // --- 如果是 / 号前面必定有变量或数字，否则就是 reg ---
                            for (let j = i - 1; j >= 0; --j) {
                                if (t[j] === ' ' || t[j] === '\t') {
                                    continue;
                                }
                                if (t[j] === ')' || t[j] === ']') {
                                    break;
                                }
                                if ((t[j] === '\n') || (!/[\w$]/.test(t[j]))) {
                                    isReg = char;
                                    break;
                                }
                                // --- 是除号 ---
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
    /*
    while (code.includes('\n\n')) {
        code = code.replace(/\n\n/, '\n');
    }
    */
    return code;
}

/**
 * --- 提取字符串 ---
 * @param code 代码
 * @param opt 选项
 * @returns 提取的字符串
 */
export function extractString(code: string, opt: {
    /** --- 无害的 string 不提取，默认为 true --- */
    'harmless'?: boolean;
    /** --- 是否替换为占位符，默认为 true --- */
    'placeholder'?: boolean;
} = {}): {
        /** --- 处理后的代码 --- */
        'code': string;
        /** --- 提取的 string --- */
        'strings': string[];
    } {
    /** --- 提取的 string --- */
    const strings: string[] = [];
    /** --- 最终字符 --- */
    let overCode: string = '';
    /** --- 当前在字符串内 --- */
    let isString: string = '';
    /** --- 是否是正则 --- */
    let isReg: string = '';
    /** --- 临时字符串保留待审查 --- */
    let tmpString: string = '';
    for (let i = 0; i < code.length; ++i) {
        const char = code[i];
        if (isReg) {
            if (char === '[') {
                if (!isEscapeChar(i, code)) {
                    isReg = '[';
                }
            }
            else if (char === ']') {
                if (!isEscapeChar(i, code) && (isReg === '[')) {
                    isReg = '/';
                }
            }
            else if (char === '/') {
                if (!isEscapeChar(i, code) && (isReg === '/')) {
                    isReg = '';
                }
            }
            overCode += char;
        }
        else if (isString) {
            if (tmpString) {
                tmpString += char;
            }
            if ((char === isString) && !isEscapeChar(i, code)) {
                // --- 结束 ---
                isString = '';
                if ((opt.harmless !== false) && /^['"`][/\w.@-]+?['"`]$/.test(tmpString)) {
                    // --- 无害 ---
                    overCode += tmpString;
                }
                else {
                    // --- 有害 ---
                    strings.push(tmpString);
                    if (opt.placeholder !== false) {
                        overCode += `[_LL_PLACEHOLDER_${strings.length - 1}]`;
                    }
                }
                tmpString = '';
            }
        }
        else {
            switch (char) {
                case '"':
                case '\'':
                case '`': {
                    isString = char;
                    tmpString = char;
                    break;
                }
                case '/': {
                    // --- 判断是 reg 还是 / 除号 ---
                    // --- 如果是 / 号前面必定有变量或数字，否则就是 reg ---
                    for (let j = i - 1; j >= 0; --j) {
                        if (code[j] === ' ' || code[j] === '\t') {
                            continue;
                        }
                        if (code[j] === ')' || code[j] === ']') {
                            break;
                        }
                        if ((code[j] === '\n') || (!/[\w$]/.test(code[j]))) {
                            isReg = char;
                            break;
                        }
                        // --- 是除号 ---
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
    }
    return {
        'code': overCode,
        'strings': strings,
    };
}

/**
 * --- 恢复字符串占位符 ---
 * @param code 代码
 * @param strings 字符串数组
 * @returns 恢复后的字符串
 */
export function restoreString(code: string, strings: string[]): string {
    return code.replace(/\[_LL_PLACEHOLDER_(\d+)\]/g, (
        match: string, index: string
    ) => {
        const i = Number(index);
        return strings[i] ?? '';
    });
}

/**
 * --- 将 blob 对象转换为 text ---
 * @param blob 对象
 */
export function blob2Text(blob: Blob): Promise<string> {
    return new Promise(function(resove) {
        const fr = new FileReader();
        fr.addEventListener('load', function(e) {
            if (e.target) {
                resove(e.target.result as string);
            }
            else {
                resove('');
            }
        });
        fr.readAsText(blob);
    });
}

/**
 * --- 将 blob 对象转换为 base64 url ---
 * @param blob 对象
 */
export function blob2DataUrl(blob: Blob): Promise<string> {
    return new Promise(function(resove) {
        const fr = new FileReader();
        fr.addEventListener('load', function(e) {
            if (e.target) {
                resove(e.target.result as string);
            }
            else {
                resove('');
            }
        });
        fr.readAsDataURL(blob);
    });
}

/**
 * --- 数组查找符合条件的项 ---
 * @param arr 数组
 * @param reg 正则
 * @returns 匹配的项
 */
export function arrayFind(arr: string[], reg: RegExp): string | null {
    const item = arr.find((item) => {
        return reg.test(item);
    });
    return item ?? null;
}

export const RANDOM_N = '0123456789';
export const RANDOM_U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const RANDOM_L = 'abcdefghijklmnopqrstuvwxyz';

export const RANDOM_UN = RANDOM_U + RANDOM_N;
export const RANDOM_LN = RANDOM_L + RANDOM_N;
export const RANDOM_LU = RANDOM_L + RANDOM_U;
export const RANDOM_LUN = RANDOM_L + RANDOM_U + RANDOM_N;
export const RANDOM_V = 'ACEFGHJKLMNPRSTWXY34567';
export const RANDOM_LUNS = RANDOM_LUN + '()`~!@#$%^&*-+=_|{}[]:;\'<>,.?/]"';

/**
 * --- 生成随机字符串 ---
 * @param length 长度
 * @param source 字符源
 * @param block 剔除字符
 * @returns 随机字符串
 */
export function random(length: number = 8, source: string = RANDOM_LN, block: string = ''): string {
    // --- 剔除 block 字符 ---
    let len = block.length;
    if (len > 0) {
        for (let i = 0; i < len; ++i) {
            source = source.replace(block[i], '');
        }
    }
    len = source.length;
    if (len === 0) {
        return '';
    }
    let temp = '';
    for (let i = 0; i < length; ++i) {
        temp += source[rand(0, len - 1)];
    }
    return temp;
}

/**
 * --- 生成范围内的随机数 ---
 * @param min 最新范围
 * @param max 最大范围
 */
export function rand(min: number, max: number): number {
    if (min > max) {
        [min, max] = [max, min];
    }
    return min + Math.round(Math.random() * (max - min));
}
