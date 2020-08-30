export { a, b, c } from './es6-module-sub';
import * as abc from './es6-module-sub2';

let d = abc.q;
let e = abc.x;

export { d, e };
