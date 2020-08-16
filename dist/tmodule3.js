"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNum = void 0;
console.log("Run tmodule3.");
var a = 1;
a += Math.floor(Math.random() * 10);
function getNum() {
    return a;
}
exports.getNum = getNum;
