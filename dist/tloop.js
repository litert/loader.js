"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msg = void 0;
const loop1 = require("./tloop1");
const loop2 = require("./tloop2");
exports.msg = 'loop';
console.log('loop done', loop1, loop2, loop1.msg + ', ' + loop2.msg + '.');
