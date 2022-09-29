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
loader.ready(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    return __awaiter(this, void 0, void 0, function* () {
        const keyInput = document.getElementById('key');
        const consoleDiv = document.getElementById('console');
        const mask = document.getElementById('mask');
        mask.style.display = 'none';
        const parseConsoleData = function (val, level = 0) {
            let str = '';
            const tp = typeof val;
            if (tp === 'undefined') {
                if (level > 0) {
                    str = '<span style="color:rgb(130,145,145);">';
                }
                str += 'undefined';
                if (level > 0) {
                    str += '</span>';
                }
            }
            else if (tp === 'string') {
                if (level > 0) {
                    str = '<span style="color:rgb(18,188,121);">\'';
                }
                str += val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (level > 0) {
                    str += '\'</span>';
                }
            }
            else if (tp === 'number') {
                str = val.toString();
            }
            else if (tp === 'boolean') {
                str = val ? 'true' : 'false';
            }
            else if (tp === 'function') {
                try {
                    str = val.toString();
                    const match = /function.*?\(.*?\)/.exec(str.toLowerCase().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                    str = match ? match[0] + ' { ... }' : '[function]';
                }
                catch (_a) {
                    str = '[function]';
                }
            }
            else if (tp === 'object') {
                if (Array.isArray(val)) {
                    if (level <= 2) {
                        str = '[ ';
                        for (const item of val) {
                            str += `${parseConsoleData(item, level + 1)}, `;
                        }
                        if (str !== '[ ') {
                            str = str.slice(0, -2);
                        }
                        str += ' ]';
                    }
                    else {
                        str = '[array]';
                    }
                }
                else {
                    if (level <= 2) {
                        str = '{ ';
                        for (const key in val) {
                            str += `${key.replace(/</g, '&lt;').replace(/>/g, '&gt;')}: ${parseConsoleData(val[key], level + 1)}, `;
                        }
                        if (str !== '{ ') {
                            str = str.slice(0, -2);
                        }
                        str += ' }';
                    }
                    else {
                        str = '[object]';
                    }
                }
            }
            else {
                str = `[${tp}]`;
            }
            return str;
        };
        const logx = console.log;
        console.log = function (...msg) {
            logx(...msg);
            let iHTML = '<div class="cl">';
            for (const item of msg) {
                iHTML += '<div style="padding-right:10px;">';
                iHTML += parseConsoleData(item);
                iHTML += '</div>';
            }
            consoleDiv.innerHTML += `${iHTML}</div>`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        };
        const cache = {};
        const files = yield loader.fetchFiles([
            '../dist/tjson.json',
            '../dist/tmodule.js',
            '../dist/tmodule2.js',
            '../dist/tmodule3.js'
        ]);
        const tmodule = loader.require('../dist/tmodule', files, {
            'cache': cache,
            'invoke': {
                'invokeVar': 'The invoke var.',
                'invokeFunction': function () {
                    alert('The invoke function.');
                },
                'location': 'The override var.'
            },
            'preprocess': function (code, path) {
                console.log(`Replace file "${path}" content.`);
                return code.replace('nothing', 'none');
            }
        })[0];
        (_a = document.getElementById('clear')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
            consoleDiv.innerHTML = '';
        });
        (_b = document.getElementById('getData')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            alert(tmodule.getData(keyInput.value));
        });
        (_c = document.getElementById('getJson')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            alert(tmodule.getJson(keyInput.value));
        });
        (_d = document.getElementById('requireModule3')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    alert(yield tmodule.requireModule3());
                });
            })().catch(function (e) {
                console.log(e);
            });
        });
        (_e = document.getElementById('runInvokeFunction')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
            tmodule.runInvokeFunction();
        });
        (_f = document.getElementById('loadES6Module')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (loader.arrayTest(Object.keys(files), /es6-module\.js/) === null) {
                        mask.style.display = 'flex';
                        mask.innerHTML = 'Loading...';
                        yield loader.fetchFiles([
                            './es6-module-sub.js',
                            './es6-module-sub2.js',
                            './es6-module-sub3.js',
                            './es6-module.js'
                        ], {
                            'files': files
                        });
                        mask.style.display = 'none';
                    }
                    const es6 = loader.require('./es6-module', files, {
                        'cache': cache
                    })[0];
                    console.log(`a: ${es6.a}, b: ${es6.b}, c: ${es6.c}, d: ${es6.d}, e: ${es6.e}`);
                    es6.xx();
                });
            })();
        });
        (_g = document.getElementById('loadSeedrandom')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!Object.keys(files).includes('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/index.js')) {
                        mask.style.display = 'flex';
                        yield loader.sniffFiles([
                            'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/index.js'
                        ], {
                            'files': files,
                            'load': function (url) {
                                mask.innerHTML = url + '<br>Loading...';
                            },
                            'loaded': function (url) {
                                mask.innerHTML = url + '<br>Loaded.';
                            }
                        });
                        mask.style.display = 'none';
                    }
                    const sr = loader.require('seedrandom', files, {
                        'cache': cache,
                        'map': {
                            'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/index'
                        }
                    })[0];
                    let rng = sr('hello');
                    console.log(rng());
                    rng = sr();
                    console.log(rng());
                });
            })();
        });
        const valFiles = {
            '/main.js': `var sub = require('./sub');
            var sr = require('seedrandom');
            function getData(key) {
                return 'key: ' + key + '.';
            }
            exports.getData = getData;
    
            function getSubStr() {
                return 'str: ' + sub.str + ', count: ' + sub.getCount() + '.';
            }
            exports.getSubStr = getSubStr;
            
            exports.getRand = function() {
                var rng = sr('abc');
                return rng();
            }`,
            '/sub.js': `var count = 0;
            exports.str = "substr";
            
            function getCount() {
                return ++count;
            }
            exports.getCount = getCount;`
        };
        (_h = document.getElementById('loadValFiles')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!Object.keys(files).includes('/main.js')) {
                        Object.assign(files, valFiles);
                    }
                    mask.style.display = 'flex';
                    mask.innerHTML = 'Loading...';
                    yield loader.fetchFiles([
                        'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
                    ], {
                        'files': files
                    });
                    mask.style.display = 'none';
                    const m = loader.require('/main.js', files, {
                        'cache': cache,
                        'dir': '/',
                        'map': {
                            'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
                        }
                    })[0];
                    console.log(`getData: ${m.getData(keyInput.value)}, getSubStr: ${m.getSubStr()}, getRand: ${m.getRand()}`);
                });
            })();
        });
        (_j = document.getElementById('getFiles')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', function () {
            console.log(Object.keys(files));
        });
        (_k = document.getElementById('getCache')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            console.log(cache);
        });
        (_l = document.getElementById('runTestOnNode')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    mask.style.display = 'flex';
                    mask.innerHTML = 'Loading...';
                    yield loader.fetchFiles([
                        '../dist/test-on-node.js'
                    ], {
                        'files': files
                    });
                    mask.style.display = 'none';
                    loader.require('../dist/test-on-node', files, {
                        'cache': cache
                    });
                });
            })();
        });
        (_m = document.getElementById('runTestOnNodeLoop')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    mask.style.display = 'flex';
                    mask.innerHTML = 'Loading...';
                    yield loader.sniffFiles([
                        '../dist/test-on-node-loop.js',
                    ], {
                        'files': files
                    });
                    mask.style.display = 'none';
                    loader.require('../dist/test-on-node-loop.js', files, {
                        'cache': cache
                    });
                });
            })();
        });
        (_o = document.getElementById('runTypeGuard')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    mask.style.display = 'flex';
                    yield loader.fetchFiles([
                        '../dist/trun-typeguard.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/langs/JavaScript.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/BuiltInTypeCompiler.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/BuiltInTypes.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/Common.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/Compiler.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/Context.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/FilterCompiler.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/index.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/InlineCompiler.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/Internal.js',
                        'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/Modifiers.js'
                    ], {
                        'files': files,
                        'after': '?' + Math.random().toString(),
                        'afterIgnore': /.+Built.+/,
                        load: function (url) {
                            mask.innerHTML = url + '<br>Loading...';
                        },
                        loaded: function (url) {
                            mask.innerHTML = url + '<br>Loaded.';
                        }
                    });
                    mask.style.display = 'none';
                    loader.require('../dist/trun-typeguard', files, {
                        'cache': cache,
                        'map': {
                            '@litert/typeguard': 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/'
                        }
                    });
                });
            })();
        });
        (_p = document.getElementById('runResizeObserverESM')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    mask.style.display = 'flex';
                    mask.innerHTML = 'Loading...';
                    yield loader.sniffFiles([
                        'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.js'
                    ], {
                        'files': files
                    });
                    mask.style.display = 'none';
                    const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer', files, {
                        'cache': cache
                    })[0];
                    console.log(r);
                });
            })();
        });
        (_q = document.getElementById('runResizeObserverUMD')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    mask.style.display = 'flex';
                    mask.innerHTML = 'Loading...';
                    yield loader.fetchFiles([
                        'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js'
                    ], {
                        'files': files
                    });
                    mask.style.display = 'none';
                    const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js', files, {
                        'cache': cache
                    })[0];
                    console.log(r);
                });
            })();
        });
        (_r = document.getElementById('runMonacoEditor')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const monacoDiv = document.getElementById('monacoDiv');
                    if (monacoDiv.getAttribute('loaded') === 'loaded') {
                        alert('Cannot be loaded repeatedly.');
                        return;
                    }
                    monacoDiv.setAttribute('loaded', 'loaded');
                    monacoDiv.innerHTML = 'Loading...';
                    mask.style.display = 'flex';
                    yield loader.sniffFiles([
                        'https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/esm/vs/editor/editor.main.js'
                    ], {
                        'files': files,
                        load: function (url) {
                            mask.innerHTML = url + '<br>Loading...';
                        },
                        loaded: function (url) {
                            mask.innerHTML = url + '<br>Loaded.';
                        }
                    });
                    mask.style.display = 'none';
                    monacoDiv.innerHTML = '';
                    const proxy = URL.createObjectURL(new Blob([`
                self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/min/'
                };
                importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/min/vs/base/worker/workerMain.js');
            `], { type: 'text/javascript' }));
                    window.MonacoEnvironment = { getWorkerUrl: () => proxy };
                    const monaco = loader.require('https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/esm/vs/editor/editor.main.js', files, {
                        'cache': cache,
                        'style': 'monaco-editor'
                    });
                    const monacoInstance = monaco[0].editor.create(monacoDiv, {
                        'value': `<html>
    <head>
        <title>Monaco</title>
    </head>
    <body>
        Hello Monaco Editor!
    </body>
</html>`,
                        'language': 'html'
                    });
                    window.addEventListener('resize', function () {
                        monacoInstance.layout();
                    });
                    console.log(monacoInstance);
                });
            })();
        });
        (_s = document.getElementById('runRemoveComment')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', function () {
            document.getElementById('removeComment2').value = loader.removeComment(document.getElementById('removeComment1').value);
        });
        (_t = document.getElementById('runParseUrl')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', function () {
            document.getElementById('runParseUrl2').value = JSON.stringify(loader.parseUrl(document.getElementById('runParseUrl1').value), null, 4);
        });
        const urlResolve1 = document.getElementById('urlResolve1');
        const urlResolve2 = document.getElementById('urlResolve2');
        const urlResolveSelect = document.getElementById('urlResolveSelect');
        urlResolveSelect.addEventListener('change', function () {
            switch (urlResolveSelect.value) {
                case '1': {
                    urlResolve1.value = 'https://www.url.com/view/path/oh';
                    urlResolve2.value = '../ok/./index.js';
                    break;
                }
                case '2': {
                    urlResolve1.value = 'C:\\Windows\\Misc';
                    urlResolve2.value = '/xxx/yyy';
                    break;
                }
                case '3': {
                    urlResolve1.value = 'file:///D:/sync/oh/ho/yeah/index.html';
                    urlResolve2.value = '../../abc.html';
                    break;
                }
            }
        });
        (_u = document.getElementById('urlResolve')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', function () {
            document.getElementById('urlResolve3').innerText = loader.urlResolve(urlResolve1.value, urlResolve2.value);
        });
    });
});
