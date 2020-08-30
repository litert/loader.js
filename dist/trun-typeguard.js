"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeGuard = require("@litert/typeguard");
const tgc = TypeGuard.createInlineCompiler();
const check1 = tgc.compile({
    "rule": ["$.equal", "$.dict", ["a", "b"], "string"]
});
console.log(check1({
    "a": "123",
    "b": "321"
}));
const check2 = tgc.compile({
    "rule": "==hello",
    "name": "isHello"
});
console.log(check2("hello"));
console.log(check2("world"));
console.log(check2.toString());
const check3 = tgc.compile({
    "rule": "@isHello"
});
console.log(check3("hello"));
console.log(check3("world"));
console.log(check3.toString());
console.log(tgc.compile({
    rule: {
        "test": "any"
    }
}).toString());
