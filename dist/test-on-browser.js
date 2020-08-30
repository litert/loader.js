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
let keyInput;
let consoleEl;
let mask;
let tmodule;
let logx = console.log;
console.log = function (...msg) {
    let iHTML = '<div class="cl">';
    for (let i = 0; i < msg.length; ++i) {
        let item = msg[i];
        if (typeof item === 'string') {
            iHTML += item;
        }
        else {
            let v = JSON.stringify(item, undefined, 4);
            if (v) {
                iHTML += v;
            }
            else {
                iHTML += item.toString();
            }
        }
        iHTML += '	';
    }
    consoleEl.innerHTML += `${iHTML}</div>`;
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
function loadSeedrandom() {
    mask.style.display = 'flex';
    loader.require('seedrandom', function (sr) {
        mask.style.display = 'none';
        let rng = sr('hello');
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
function loadES6Module() {
    mask.style.display = 'flex';
    loader.require('./es6-module', function (e) {
        mask.style.display = 'none';
        console.log('a:', e.a, 'b:', e.b, 'c:', e.c, 'd:', e.d, 'e:', e.e);
    });
}
function loadMemoryFile() {
    return __awaiter(this, void 0, void 0, function* () {
        mask.style.display = 'flex';
        let rtn = yield loader.requireMemory('/main', {
            '/main.js': `var sub = require('./sub');
        var sr = require('seedrandom');
        function getData(key) {
            return key + ', end.';
        }
        exports.getData = getData;

        function getSubStr() {
            return sub.str;
        }
        exports.getSubStr = getSubStr;
        
        exports.getRand = function() {
            var rng = sr('abc');
            return rng();
        }`,
            '/sub.js': new Blob(['exports.str = "hehe";'])
        });
        mask.style.display = 'none';
        if (!rtn) {
            console.log('Load memory file failed.');
            return;
        }
        let [main] = rtn;
        console.log(main.getData('rand: ' + Math.random()));
        console.log(main.getSubStr());
        console.log(main.getRand());
    });
}
function getLoadedPaths() {
    console.log(loader.getLoadedPaths());
}
function setRandomAfter() {
    let rand = Math.random().toString();
    loader.setAfter('?' + rand);
    console.log('Set up to "?' + rand + '".');
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
function runResizeObserver() {
    mask.style.display = 'flex';
    loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer', function (ro) {
        mask.style.display = 'none';
        logx(ro.ResizeObserver, ro.ResizeObserverEntry);
        console.log(ro.ResizeObserver, ro.ResizeObserverEntry);
    });
}
loader.ready(function () {
    return __awaiter(this, void 0, void 0, function* () {
        keyInput = document.getElementById('key');
        consoleEl = document.getElementById('console');
        mask = document.getElementById('mask');
        loader.setPaths({
            '@litert/typeguard': 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/',
            'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
        });
        loader.setAfter('?' + Math.random());
        yield loader.require('../dist/tmodule', function (t) {
            mask.style.display = 'none';
            tmodule = t;
        });
    });
});
