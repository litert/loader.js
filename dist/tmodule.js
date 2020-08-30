"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule3 = exports.getRequire = exports.getJson = exports.getData = void 0;
const tmodule2 = require("./tmodule2");
let tjson = require('./tjson.json');
function getData(key) {
    var _a;
    return (_a = tmodule2.data[key]) !== null && _a !== void 0 ? _a : 'nothing';
}
exports.getData = getData;
function getJson(key) {
    var _a;
    return (_a = tjson[key]) !== null && _a !== void 0 ? _a : 'know';
}
exports.getJson = getJson;
function getRequire(key) {
    return require('./tmodule2').data[key];
}
exports.getRequire = getRequire;
function requireModule3() {
    let t3 = require('./tmodule3');
    return t3.getNum();
}
exports.requireModule3 = requireModule3;
