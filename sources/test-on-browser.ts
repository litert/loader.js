let keyInput: HTMLInputElement;
let consoleEl: HTMLDivElement;
let mask: HTMLDivElement;
let tmodule: any;

/** --- 重写 log --- */
let logx = console.log;
console.log = function(...msg: any[]) {
    let iHTML = '<div class="cl">';
    for (let item of msg) {
        iHTML += '<div style="padding-right:10px;">';
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
        iHTML += '</div>';
    }
    consoleEl.innerHTML += `${iHTML}</div>`;
    consoleEl.scrollTop = consoleEl.scrollHeight;
};

function getData(): void {
    alert(tmodule.getData(keyInput.value));
}

function getJson(): void {
    alert(tmodule.getJson(keyInput.value));
}

function getRequire(): void {
    alert(tmodule.getRequire(keyInput.value));
}

function requireModule3(): void {
    alert(tmodule.requireModule3());
}

function loadSeedrandom(): void {
    mask.style.display = 'flex';
    loader.require('seedrandom', function(sr) {
        mask.style.display = 'none';
        let rng = sr('hello');
        console.log(rng());
        rng = sr();
        console.log(rng());
    }) as unknown;
}

// --- 两个文件循环包含，不会陷入死循环 ---
function loop(): void {
    mask.style.display = 'flex';
    loader.require('../dist/tloop', function() {
        mask.style.display = 'none';
    }) as unknown;
}

// --- 加载 es6 module ---
function loadES6Module(): void {
    mask.style.display = 'flex';
    loader.require('./es6-module', function(e) {
        mask.style.display = 'none';
        console.log('a:', e.a, 'b:', e.b, 'c:', e.c, 'd:', e.d, 'e:', e.e);
    }) as unknown;
}

let memoryFiles = {
    '/main.js':
        `var sub = require('./sub');
        var sr = require('seedrandom');
        function getData(key) {
            return key + ', end.';
        }
        exports.getData = getData;

        function getSubStr() {
            return sub.str + '(count:' + sub.getCount() + ')';
        }
        exports.getSubStr = getSubStr;
        
        exports.getRand = function() {
            var rng = sr('abc');
            return rng();
        }`,

    '/sub.js': new Blob([
        `var count = 0;
        exports.str = "hehe";
        
        function getCount() {
            return ++count;
        }
        exports.getCount = getCount;`
    ])
};
let filesLoaded = {};
async function loadMemoryFile(save: boolean = false) {
    mask.style.display = 'flex';
    let rtn = await loader.requireMemory('/main', memoryFiles, save ? filesLoaded : undefined);
    mask.style.display = 'none';
    if (!rtn) {
        console.log('Load memory file failed.');
        return;
    }
    let [main] = rtn;
    console.log(main.getData('"rand: ' + Math.random() + '"'));
    console.log('getSubStr:', main.getSubStr(), 'getRand:', main.getRand());
}

function getLoadedPaths(): void {
    console.log(loader.getLoadedPaths());
}

function setRandomAfter(): void {
    let rand = Math.random().toString();
    loader.setAfter('?' + rand);
    console.log('Set up to "?' + rand + '".');
}

function runTestOnNode(): void {
    mask.style.display = 'flex';
    loader.require('../dist/test-on-node', function() {
        mask.style.display = 'none';
    }) as unknown;
}

function runTypeGuard(): void {
    mask.style.display = 'flex';
    loader.require('../dist/trun-typeguard', function() {
        mask.style.display = 'none';
    }) as unknown;
}

function runResizeObserver(): void {
    mask.style.display = 'flex';
    loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer', function(ro) {
        mask.style.display = 'none';
        logx(ro.ResizeObserver, ro.ResizeObserverEntry);
        console.log(ro.ResizeObserver, ro.ResizeObserverEntry);
    }) as unknown;
}

loader.ready(async function(): Promise<void> {
    keyInput = document.getElementById('key') as HTMLInputElement;
    consoleEl = document.getElementById('console') as HTMLDivElement;
    mask = document.getElementById('mask') as HTMLDivElement;
    loader.setPaths({
        '@litert/typeguard': 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/',
        'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
    });
    loader.setAfter('?' + Math.random());
    await loader.require('../dist/tmodule', function(t: any) {
        mask.style.display = 'none';
        tmodule = t;
    });
});
