"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msg = void 0;
const loop = require("./tloop");
const loop2 = require("./tloop2");
exports.msg = 'loop1';
console.log('loop1 done', loop, loop2, loop.msg + ', ' + loop2.msg + '.');
