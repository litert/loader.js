"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seedrandom_1 = __importDefault(require("seedrandom"));
const html = [];
let rng = (0, seedrandom_1.default)('hello');
html.push(rng().toString());
html.push('<br>');
rng = (0, seedrandom_1.default)();
html.push(rng().toString());
document.getElementById('result').innerHTML += '<br>' + html.join('');
