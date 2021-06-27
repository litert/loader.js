export { a, b, c } from './es6-module-sub';
import * as abc from './es6-module-sub2';

let d = abc.d;
let e = abc.e;

export { d, e };
export * from './es6-module-sub3';
