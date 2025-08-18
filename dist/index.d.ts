import * as tool from './tool.js';
export declare function addMap(key: string, value: string): void;
export declare function removeMap(key: string): void;
export declare function loadScript(url: string, el?: HTMLElement): Promise<boolean>;
export declare function loadScripts(urls: string[], opt?: {
    'loaded'?: (url: string, state: number) => void;
    'el'?: HTMLElement;
}): Promise<void>;
export declare function loadLink(url: string, el?: HTMLElement, pos?: 'before' | 'after'): Promise<boolean>;
export declare function loadLinks(urls: string[], opt?: {
    'loaded'?: (url: string, state: number) => void;
    'el'?: HTMLElement;
}): Promise<void>;
export declare function loadStyle(style: string, el?: HTMLElement): void;
export declare function loadESM(url: string, opt?: {
    'base'?: string;
    'name'?: string;
    'after'?: string;
    'loaded'?: (url: string, furl: string, fail: boolean) => void | Promise<void>;
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
}): Promise<Record<string, any> | false>;
export declare function loadESMWorker(url: string, opt?: {
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
}): Promise<{
    create: () => Worker | false;
}>;
export declare function internalImport(furl: string, opt?: {
    'error'?: (furl: string, e: {
        'result': number;
        'msg': string;
    }) => void | Promise<void>;
}): Promise<Record<string, any>>;
export declare function clearCacheByName(name: string): number;
export declare function clearCacheByKeyPrefix(start: string): number;
export declare function insertCache(files: Record<string, string>, name?: string): string;
export declare function getCacheTransform(furl: string): string;
export { tool };
