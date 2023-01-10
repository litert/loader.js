"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const tmodule2 = __importStar(require("./tmodule2"));
const tjson = __importStar(require("./tjson.json"));
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
        const t3 = yield Promise.resolve().then(() => __importStar(require('./tmodule3')));
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
console.log('__invoke:', __invoke);
console.log('__preprocess:', __preprocess);
