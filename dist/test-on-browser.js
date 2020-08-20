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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var keyInput;
var consoleEl;
var mask;
var tmodule;
var logx = console.log;
console.log = function (msg) {
    consoleEl.innerHTML += "<div class='cl'>" + (typeof msg === 'string' ? msg : JSON.stringify(msg, undefined, 4)) + "</div>";
};
function getData() {
    alert(tmodule.getData(keyInput.value));
}
function getJson() {
    alert(tmodule.getJson(keyInput.value));
}
function getRequire() {
    alert(tmodule.getRequire(keyInput.value));
}
function requireModule3() {
    alert(tmodule.requireModule3());
}
function runTestOnNode() {
    mask.style.display = 'flex';
    loader.require('../dist/test-on-node', function () {
        mask.style.display = 'none';
    });
}
function runTypeGuard() {
    mask.style.display = 'flex';
    loader.require('../dist/trun-typeguard', function () {
        mask.style.display = 'none';
    });
}
function loadSeedrandom() {
    mask.style.display = 'flex';
    loader.require('seedrandom', function (sr) {
        mask.style.display = 'none';
        var rng = sr('hello');
        console.log(rng());
        rng = sr();
        console.log(rng());
    });
}
function loop() {
    mask.style.display = 'flex';
    loader.require('../dist/tloop', function () {
        mask.style.display = 'none';
    });
}
function loadMemoryFile() {
    return __awaiter(this, void 0, void 0, function () {
        var rtn, main;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mask.style.display = 'flex';
                    return [4, loader.requireMemory('/main', {
                            '/main.js': "var sub = require('./sub');\n        var sr = require('seedrandom');\n        function getData(key) {\n            return key + ', end.';\n        }\n        exports.getData = getData;\n\n        function getSubStr() {\n            return sub.str;\n        }\n        exports.getSubStr = getSubStr;\n        \n        exports.getRand = function() {\n            var rng = sr('abc');\n            return rng();\n        }",
                            '/sub.js': new Blob(['exports.str = "hehe";'])
                        })];
                case 1:
                    rtn = _a.sent();
                    mask.style.display = 'none';
                    if (!rtn) {
                        console.log('Load memory file failed.');
                        return [2];
                    }
                    main = rtn[0];
                    console.log(main.getData('rand: ' + Math.random()));
                    console.log(main.getSubStr());
                    console.log(main.getRand());
                    return [2];
            }
        });
    });
}
function getLoadedPaths() {
    console.log(loader.getLoadedPaths());
}
function setRandomAfter() {
    var rand = Math.random().toString();
    loader.setAfter('?' + rand);
    console.log('Set up to "?' + rand + '".');
}
loader.ready(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keyInput = document.getElementById('key');
                    consoleEl = document.getElementById('console');
                    mask = document.getElementById('mask');
                    loader.setPaths({
                        '@litert/typeguard': 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/',
                        'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
                    });
                    loader.setAfter('?' + Math.random());
                    return [4, loader.require('../dist/tmodule', function (t) {
                            mask.style.display = 'none';
                            tmodule = t;
                        })];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    });
});
