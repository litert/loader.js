"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInvokeFunction = exports.requireModule3 = exports.getJson = exports.getData = exports.tm2fn = void 0;
const tmodule2 = require("./tmodule2");
const tjson = require("./tjson.json");
exports.tm2fn = tmodule2.fn;
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
function requireModule3() {
    return __awaiter(this, void 0, void 0, function* () {
        const t3 = yield Promise.resolve().then(() => require('./tmodule3'));
        return t3.getNum();
    });
}
exports.requireModule3 = requireModule3;
function runInvokeFunction() {
    invokeFunction();
}
exports.runInvokeFunction = runInvokeFunction;
try {
    console.log('invokeVar:', invokeVar);
    console.log('location:', location);
}
catch (_a) {
    console.log('invokeVar:', undefined);
    console.log('location:', undefined);
}
