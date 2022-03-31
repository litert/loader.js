import * as tmodule2 from './tmodule2';
import * as tjson from './tjson.json';

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
    return (tjson as any)[key] ?? 'know';
}

/**
 * --- 执行 tmodule3 的函数 ---
 */
export async function requireModule3(): Promise<number> {
    let t3 = await import('./tmodule3');
    return t3.getNum();
}

export function runInvokeFunction(): void {
    invokeFunction();
}

console.log('invokeVar:', invokeVar);
console.log('location:', location);
