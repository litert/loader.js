import * as tmodule2 from './tmodule2';
import * as tjson from './tjson.json';

/** --- 获取 tmodule2 的 filename --- */
export const tm2fn = tmodule2.fn;

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
    const t3 = await import('./tmodule3');
    return t3.getNum();
}

export function runInvokeFunction(): void {
    invokeFunction();
}

try {
    console.log('invokeVar:', invokeVar);
    console.log('location:', location);
}
catch {
    console.log('invokeVar:', undefined);
    console.log('location:', undefined);
}
console.log('__invoke:', __invoke);
console.log('__preprocess:', __preprocess);
