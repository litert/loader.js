import * as tmodule from './tmodule';

console.log(`getData('d1'): ${tmodule.getData('d1')}`);

console.log(`getData('d2'): ${tmodule.getData('d2')}`);

console.log(`getData('d3'): ${tmodule.getData('d3')}`);

console.log(`getData('d4'): ${tmodule.getData('d4')}`);

console.log(`getJson('d4'): ${tmodule.getJson('d4')}`);

console.log(`getJson('d5'): ${tmodule.getJson('d5')}`);

console.log(`getJson('hello'): ${tmodule.getJson('hello')}`);

console.log(`getJson('goodbye'): ${tmodule.getJson('goodbye')}`);

tmodule.requireModule3().then(function(n) {
    console.log(`requireModule3(): ${n}`);
}).catch(function(e) {
    throw e;
});
