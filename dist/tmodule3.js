"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNum = getNum;
console.log('Run tmodule3.');
let a = 1;
a += Math.floor(Math.random() * 10);
function getNum() {
    return a;
}
