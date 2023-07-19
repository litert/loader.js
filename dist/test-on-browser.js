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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
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
            '../dist/tmodule3.js',
            '../dist/tmodule4.js',
            '../dist/tfolder/test.js'
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
        (_j = document.getElementById('loadDefault')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', function () {
            const m = loader.require('../dist/tmodule4.js', files, {
                'cache': cache
            });
            console.log(m);
        });
        (_k = document.getElementById('alias')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            const m = loader.require('../dist/tfolder/test.js', files, {
                'cache': cache,
                'map': {
                    '~/': '../dist/'
                }
            });
            console.log(m);
        });
        (_l = document.getElementById('getFiles')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
            console.log(Object.keys(files));
        });
        (_m = document.getElementById('getCache')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
            console.log(cache);
        });
        (_o = document.getElementById('runTestOnNode')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
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
        (_p = document.getElementById('runTestOnNodeLoop')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', function () {
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
        (_q = document.getElementById('runThe1ToThe4')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', function () {
            const cache1 = {};
            const m = loader.require('../dist/tmodule.js', files, {
                'cache': cache1,
                'preprocess': (code) => {
                    return code.replace(/'the1'/g, '\'the4\'');
                }
            });
            console.log('filename:', m[0].tm2fn, 'd1:', m[0].getData('d1'));
        });
        (_r = document.getElementById('runTypeGuard')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', function () {
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
        (_s = document.getElementById('runResizeObserverESM')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', function () {
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
        (_t = document.getElementById('runResizeObserverUMD')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', function () {
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
        (_u = document.getElementById('runMonacoEditor')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', function () {
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
        (_v = document.getElementById('runXterm')) === null || _v === void 0 ? void 0 : _v.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const xtermDiv = document.getElementById('xtermDiv');
                    if (xtermDiv.getAttribute('loaded') === 'loaded') {
                        alert('Cannot be loaded repeatedly.');
                        return;
                    }
                    xtermDiv.setAttribute('loaded', 'loaded');
                    xtermDiv.innerHTML = 'Loading...';
                    mask.style.display = 'flex';
                    yield loader.loadLinks([
                        'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.min.css'
                    ], {
                        'loaded': function (url, state) {
                            mask.innerHTML = url + '<br>Loaded(' + state.toString() + ').';
                        }
                    });
                    yield loader.loadScripts([
                        'https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js',
                        'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js',
                        'https://cdn.jsdelivr.net/npm/xterm-addon-webgl@0.14.0/lib/xterm-addon-webgl.js'
                    ], {
                        'loaded': function (url, state) {
                            mask.innerHTML = url + '<br>Loaded(' + state.toString() + ').';
                        }
                    });
                    loader.loadStyle('.xterm-viewport::-webkit-scrollbar{display:none;}');
                    mask.style.display = 'none';
                    xtermDiv.innerHTML = '';
                    xtermDiv.style.background = '#000';
                    xtermDiv.style.display = 'block';
                    const term = new window.Terminal();
                    let command = '';
                    function prompt() {
                        command = '';
                        term.write('\r\n$ ');
                    }
                    function runCommand(text) {
                        const command = text.trim().split(' ')[0];
                        if (command.length > 0) {
                            term.writeln('');
                            term.writeln(`${command}: command not found`);
                        }
                        prompt();
                    }
                    term.onData(function (e) {
                        switch (e) {
                            case '\u0003':
                                term.write('^C');
                                prompt();
                                break;
                            case '\r':
                                runCommand(command);
                                command = '';
                                break;
                            case '\u007F':
                                console.log('x', term._core.buffer.x);
                                if (term._core.buffer.x > 2) {
                                    term.write('\b \b');
                                    if (command.length > 0) {
                                        command = command.slice(0, command.length - 1);
                                    }
                                }
                                break;
                            default:
                                if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                                    command += e;
                                    term.write(e);
                                }
                        }
                    });
                    const fitAddon = new window.FitAddon.FitAddon();
                    term.loadAddon(fitAddon);
                    const webgl = new window.WebglAddon.WebglAddon();
                    term.loadAddon(webgl);
                    term.open(xtermDiv);
                    fitAddon.fit();
                    window.addEventListener('resize', () => {
                        fitAddon.fit();
                    });
                    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
                });
            })();
        });
        (_w = document.getElementById('AddFetchFilesAdapter')) === null || _w === void 0 ? void 0 : _w.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tmpFiles = {};
                    mask.style.display = 'flex';
                    yield loader.fetchFiles([
                        '/current/lib/langs/JavaScript.js',
                        '/current/lib/BuiltInTypeCompiler.js',
                        '/current/BuiltInTypes.js',
                        '/current/lib/Common.js'
                    ], {
                        'files': tmpFiles,
                        'after': '?' + Math.random().toString(),
                        'dir': '/',
                        load: function (url) {
                            mask.innerHTML = url + '<br>Loading...';
                        },
                        loaded: function (url) {
                            mask.innerHTML = url + '<br>Loaded.';
                        },
                        adapter: (url) => __awaiter(this, void 0, void 0, function* () {
                            url = url.replace('/current/', 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/');
                            return loader.fetch(url);
                        })
                    });
                    mask.style.display = 'none';
                    console.log('tmpFiles', Object.keys(tmpFiles));
                });
            })();
        });
        (_x = document.getElementById('AddSniffFilesAdapter')) === null || _x === void 0 ? void 0 : _x.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tmpFiles = {};
                    mask.style.display = 'flex';
                    yield loader.sniffFiles('/test/abc/lib/exports/resize-observer.js', {
                        'files': tmpFiles,
                        'after': '?' + Math.random().toString(),
                        'dir': '/',
                        load: function (url) {
                            mask.innerHTML = url + '<br>Loading...';
                        },
                        loaded: function (url) {
                            mask.innerHTML = url + '<br>Loaded.';
                        },
                        adapter: (url) => __awaiter(this, void 0, void 0, function* () {
                            url = url.replace('/test/abc/', 'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/');
                            return loader.fetch(url);
                        })
                    });
                    mask.style.display = 'none';
                    console.log('tmpFiles', Object.keys(tmpFiles));
                });
            })();
        });
        (_y = document.getElementById('runRemoveComment')) === null || _y === void 0 ? void 0 : _y.addEventListener('click', function () {
            document.getElementById('removeComment2').value = loader.removeComment(document.getElementById('removeComment1').value);
        });
        (_z = document.getElementById('runParseUrl')) === null || _z === void 0 ? void 0 : _z.addEventListener('click', function () {
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
        (_0 = document.getElementById('urlResolve')) === null || _0 === void 0 ? void 0 : _0.addEventListener('click', function () {
            document.getElementById('urlResolve3').innerText = loader.urlResolve(urlResolve1.value, urlResolve2.value);
        });
        (_1 = document.getElementById('testPost')) === null || _1 === void 0 ? void 0 : _1.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('Post start...');
                    mask.style.display = 'flex';
                    const r = yield loader.post('./index2.html', {
                        'param': 'test1'
                    });
                    mask.style.display = 'none';
                    console.log('Post done: ' + typeof r);
                });
            })();
        });
        (_2 = document.getElementById('testSniffNpm')) === null || _2 === void 0 ? void 0 : _2.addEventListener('click', function () {
            (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tmpFiles = {};
                    const map = {};
                    mask.style.display = 'flex';
                    yield loader.sniffNpm({
                        'clickgo': '3.3.5',
                        'compressorjs': '1.2.1'
                    }, {
                        'files': tmpFiles,
                        'after': '?' + Math.random().toString(),
                        'dir': '/',
                        'map': map,
                        load: function (url) {
                            mask.innerHTML = url + '<br>Loading...';
                        },
                        loaded: function (url) {
                            mask.innerHTML = url + '<br>Loaded.';
                        }
                    });
                    mask.style.display = 'none';
                    console.log('tmpFiles', Object.keys(tmpFiles));
                    console.log('map', map);
                });
            })();
        });
    });
});
