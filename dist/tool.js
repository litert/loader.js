export function sleep(ms = 0) {
    return new Promise(function (resolve) {
        if (ms > 30_000) {
            resolve(false);
            return;
        }
        window.setTimeout(function () {
            resolve(true);
        }, ms);
    });
}
export async function fetch(url, init) {
    try {
        const res = await window.fetch(url, init);
        if (res.status === 200 || res.status === 304) {
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
const retryTimes = [300, 1_000, 2_000];
export async function get(url, init, opt = {}) {
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
export async function post(url, data, init) {
    init ??= {};
    init.method = 'POST';
    init.headers ??= {};
    if (!(data instanceof FormData)) {
        if (init.headers instanceof Headers) {
            init.headers.set('content-type', 'application/json');
        }
        else {
            init.headers['content-type'] = 'application/json';
        }
    }
    init.body = data instanceof FormData ? data : JSON.stringify(data);
    const res = await fetch(url, init);
    return res;
}
export async function getResponseJson(url, init) {
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
export async function postResponseJson(url, data, init) {
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
export function queryStringify(query, encode = true) {
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
export function queryParse(query) {
    const ret = {};
    const arrayKeys = {};
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
            ret[key].push(value);
        }
        else if (undefined === ret[key]) {
            ret[key] = value;
        }
        else {
            ret[key] = [ret[key], value];
            arrayKeys[key] = true;
        }
    }
    return ret;
}
export function parseUrl(url) {
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
}
export function urlResolve(from, to) {
    from = from.replace(/\\/g, '/');
    to = to.replace(/\\/g, '/');
    if (to === '') {
        return urlAtom(from);
    }
    const f = parseUrl(from);
    if (to.startsWith('//')) {
        return urlAtom(f.protocol ? f.protocol + to : to);
    }
    if (f.protocol) {
        from = f.protocol + from.slice(f.protocol.length);
    }
    const t = parseUrl(to);
    if (t.protocol) {
        return urlAtom(t.protocol + to.slice(t.protocol.length));
    }
    if (to.startsWith('#') || to.startsWith('?')) {
        const sp = from.indexOf(to[0]);
        if (sp !== -1) {
            return urlAtom(from.slice(0, sp) + to);
        }
        else {
            return urlAtom(from + to);
        }
    }
    let abs = (f.auth ? f.auth + '@' : '') + (f.host ?? '');
    if (to.startsWith('/')) {
        abs += to;
    }
    else {
        const path = f.pathname.replace(/\/[^/]*$/g, '');
        abs += path + '/' + to;
    }
    if (f.protocol && (f.protocol !== 'file:') && !f.host) {
        return urlAtom(f.protocol + abs);
    }
    else {
        return urlAtom((f.protocol ? f.protocol + '//' : '') + abs);
    }
}
export function urlAtom(url) {
    while (url.includes('/./')) {
        url = url.replace(/\/\.\//g, '/');
    }
    while (/\/(?!\.\.)[^/]+\/\.\.\//.test(url)) {
        url = url.replace(/\/(?!\.\.)[^/]+\/\.\.\//g, '/');
    }
    url = url.replace(/\.\.\//g, '');
    return url;
}
export function isEscapeChar(index, code) {
    let preChar = code[index - 1];
    let count = 0;
    while (preChar === '\\') {
        preChar = code[index - (++count) - 1];
    }
    return count % 2 === 0 ? false : true;
}
export function removeComment(code) {
    let isComment = '';
    let isLineString = false;
    code = code.replace(/^\s+|\s+$/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let line = -1;
    code = code.replace(/.*(\n|$)/g, (t) => {
        ++line;
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
}
export function extractString(code, opt = {}) {
    const strings = [];
    let overCode = '';
    let isString = '';
    let isReg = '';
    let tmpString = '';
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
                isString = '';
                if ((opt.harmless !== false) && /^['"`][/\w.@-]+?['"`]$/.test(tmpString)) {
                    overCode += tmpString;
                }
                else {
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
export function restoreString(code, strings) {
    return code.replace(/\[_LL_PLACEHOLDER_(\d+)\]/g, (match, index) => {
        const i = Number(index);
        return strings[i] ?? '';
    });
}
export function blob2Text(blob) {
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
}
export function blob2DataUrl(blob) {
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
}
export function arrayFind(arr, reg) {
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
export function random(length = 8, source = RANDOM_LN, block = '') {
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
export function rand(min, max) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return min + Math.round(Math.random() * (max - min));
}
