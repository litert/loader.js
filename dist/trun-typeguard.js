"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeGuard = require("@litert/typeguard");
var tgc = TypeGuard.createInlineCompiler();
var check1 = tgc.compile({
    "rule": ["$.equal", "$.dict", ["a", "b"], "string"]
});
console.log(check1({
    "a": "123",
    "b": "321"
}));
var check2 = tgc.compile({
    "rule": "==hello",
    "name": "isHello"
});
console.log(check2("hello"));
console.log(check2("world"));
console.log(check2.toString());
var check3 = tgc.compile({
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
