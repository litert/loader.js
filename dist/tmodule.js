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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.tm2fn = void 0;
exports.getData = getData;
exports.getJson = getJson;
exports.requireModule3 = requireModule3;
exports.runInvokeFunction = runInvokeFunction;
const tmodule2 = __importStar(require("./tmodule2"));
const tjson = __importStar(require("./tjson.json"));
exports.tm2fn = tmodule2.fn;
function getData(key) {
    var _a;
    return (_a = tmodule2.data[key]) !== null && _a !== void 0 ? _a : 'nothing';
}
function getJson(key) {
    var _a;
    return (_a = tjson[key]) !== null && _a !== void 0 ? _a : 'know';
}
function requireModule3() {
    return __awaiter(this, void 0, void 0, function* () {
        const t3 = yield Promise.resolve().then(() => __importStar(require('./tmodule3')));
        return t3.getNum();
    });
}
function runInvokeFunction() {
    invokeFunction();
}
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
