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
Object.defineProperty(exports, "__esModule", { value: true });
const tmodule = __importStar(require("./tmodule"));
const tmodule4 = __importStar(require("./tmodule4"));
console.log(`getData('d1'): ${tmodule.getData('d1')}`);
console.log(`getData('d2'): ${tmodule.getData('d2')}`);
console.log(`getData('d3'): ${tmodule.getData('d3')}`);
console.log(`getData('d4'): ${tmodule.getData('d4')}`);
console.log(`getJson('d4'): ${tmodule.getJson('d4')}`);
console.log(`getJson('d5'): ${tmodule.getJson('d5')}`);
console.log(`getJson('hello'): ${tmodule.getJson('hello')}`);
console.log(`getJson('goodbye'): ${tmodule.getJson('goodbye')}`);
console.log('tmodule4:', tmodule4);
tmodule.requireModule3().then(function (n) {
    console.log(`requireModule3(): ${n}`);
}).catch(function (e) {
    throw e;
});
