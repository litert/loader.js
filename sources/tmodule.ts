import * as tmodule2 from './tmodule2';
let tjson = require('./tjson.json');

/**
 * --- 根据 key 获取 tmodule2 的值 ---
 * @param key 键
 */
export function getData(key: string): string {
    return tmodule2.data[key] ?? 'nothing';
}
/**
 * --- 根据 key 获取 tjson.json 的值 ---
 * @param key 键
 */
export function getJson(key: string): string {
    return tjson[key] ?? 'know';
}

/**
 * --- 执行 tmodule3 的函数 ---
 */
export function requireModule3(): string {
    let t3 = require('./tmodule3');
    return t3.getNum();
}
