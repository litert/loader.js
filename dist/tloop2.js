"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msg = void 0;
const loop = require("./tloop");
const loop1 = require("./tloop1");
exports.msg = 'loop2';
console.log('loop2 done', loop, loop1, loop.msg + ', ' + loop1.msg + '.');
