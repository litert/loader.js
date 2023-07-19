loader.ready(async function(): Promise<void> {
    /** --- 输入框 --- */
    const keyInput = document.getElementById('key') as HTMLInputElement;
    /** --- 控制台框 --- */
    const consoleDiv = document.getElementById('console') as HTMLDivElement;
    /** --- 遮罩 --- */
    const mask = document.getElementById('mask') as HTMLDivElement;
    mask.style.display = 'none';

    /** --- 重写 log --- */
    const parseConsoleData = function(val: any, level: number = 0): string {
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
            str += (val as string).replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
            catch {
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
    console.log = function(...msg: any[]) {
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

    /** --- 已执行过的文件列表 --- */
    const cache: Record<string, any> = {};
    /** --- tmodule 对象 --- */
    const files: Record<string, Blob | string> = await loader.fetchFiles([
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
            'invokeFunction': function() {
                alert('The invoke function.');
            },
            'location': 'The override var.'
        },
        'preprocess': function(code: string, path: string): string {
            console.log(`Replace file "${path}" content.`);
            return code.replace('nothing', 'none');
        }
    })[0];

    document.getElementById('clear')?.addEventListener('click', function() {
        consoleDiv.innerHTML = '';
    });

    // --- 第一行 ---
    document.getElementById('getData')?.addEventListener('click', function() {
        alert(tmodule.getData(keyInput.value));
    });
    document.getElementById('getJson')?.addEventListener('click', function() {
        alert(tmodule.getJson(keyInput.value));
    });
    document.getElementById('requireModule3')?.addEventListener('click', function(): void {
        (async function() {
            alert(await tmodule.requireModule3());
        })().catch(function(e) {
            console.log(e);
        });
    });
    document.getElementById('runInvokeFunction')?.addEventListener('click', function() {
        tmodule.runInvokeFunction();
    });
    document.getElementById('loadES6Module')?.addEventListener('click', function() {
        (async function() {
            if (loader.arrayTest(Object.keys(files), /es6-module\.js/) === null) {
                mask.style.display = 'flex';
                mask.innerHTML = 'Loading...';
                await loader.fetchFiles([
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
        })() as unknown;
    });
    document.getElementById('loadSeedrandom')?.addEventListener('click', function() {
        (async function() {
            if (!Object.keys(files).includes('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/index.js')) {
                mask.style.display = 'flex';
                await loader.sniffFiles([
                    'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/index.js'
                ], {
                    'files': files,
                    'load': function(url: string) {
                        mask.innerHTML = url + '<br>Loading...';
                    },
                    'loaded': function(url: string) {
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
        })() as unknown;
    });

    const valFiles = {
        '/main.js':
            `var sub = require('./sub');
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
        '/sub.js':
            `var count = 0;
            exports.str = "substr";
            
            function getCount() {
                return ++count;
            }
            exports.getCount = getCount;`
    };
    document.getElementById('loadValFiles')?.addEventListener('click', function() {
        (async function() {
            if (!Object.keys(files).includes('/main.js')) {
                Object.assign(files, valFiles);
            }
            mask.style.display = 'flex';
            mask.innerHTML = 'Loading...';
            await loader.fetchFiles([
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
        })() as unknown;
    });
    document.getElementById('loadDefault')?.addEventListener('click', function() {
        const m = loader.require('../dist/tmodule4.js', files, {
            'cache': cache
        });
        console.log(m);
    });
    document.getElementById('alias')?.addEventListener('click', function() {
        const m = loader.require('../dist/tfolder/test.js', files, {
            'cache': cache,
            'map': {
                '~/': '../dist/'
            }
        });
        console.log(m);
    });
    document.getElementById('getFiles')?.addEventListener('click', function() {
        console.log(Object.keys(files));
    });
    document.getElementById('getCache')?.addEventListener('click', function() {
        console.log(cache);
    });

    document.getElementById('runTestOnNode')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            mask.innerHTML = 'Loading...';
            await loader.fetchFiles([
                '../dist/test-on-node.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            loader.require('../dist/test-on-node', files, {
                'cache': cache
            });
        })() as unknown;
    });

    document.getElementById('runTestOnNodeLoop')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            mask.innerHTML = 'Loading...';
            await loader.sniffFiles([
                '../dist/test-on-node-loop.js',
            ], {
                'files': files
            });
            mask.style.display = 'none';
            loader.require('../dist/test-on-node-loop.js', files, {
                'cache': cache
            });
        })() as unknown;
    });

    document.getElementById('runThe1ToThe4')?.addEventListener('click', function() {
        const cache1 = {};
        const m = loader.require('../dist/tmodule.js', files, {
            'cache': cache1,
            'preprocess': (code) => {
                return code.replace(/'the1'/g, '\'the4\'');
            }
        });
        console.log('filename:', m[0].tm2fn, 'd1:', m[0].getData('d1'));
    });

    document.getElementById('runTypeGuard')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            await loader.fetchFiles([
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
                load: function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                loaded: function(url: string) {
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
        })() as unknown;
    });

    document.getElementById('runResizeObserverESM')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            mask.innerHTML = 'Loading...';
            await loader.sniffFiles([
                'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer', files, {
                'cache': cache
            })[0];
            console.log(r);
        })() as unknown;
    });
    document.getElementById('runResizeObserverUMD')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            mask.innerHTML = 'Loading...';
            await loader.fetchFiles([
                'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js', files, {
                'cache': cache
            })[0];
            console.log(r);
        })() as unknown;
    });

    document.getElementById('runMonacoEditor')?.addEventListener('click', function() {
        (async function() {
            const monacoDiv = document.getElementById('monacoDiv') as HTMLDivElement;
            if (monacoDiv.getAttribute('loaded') === 'loaded') {
                alert('Cannot be loaded repeatedly.');
                return;
            }
            monacoDiv.setAttribute('loaded', 'loaded');
            monacoDiv.innerHTML = 'Loading...';
            // --- 开始加载 ---
            mask.style.display = 'flex';
            await loader.sniffFiles([
                'https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/esm/vs/editor/editor.main.js'
            ], {
                'files': files,
                load: function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                loaded: function(url: string) {
                    mask.innerHTML = url + '<br>Loaded.';
                }
            });
            mask.style.display = 'none';
            monacoDiv.innerHTML = '';
            // --- 初始化 Monaco ---
            const proxy = URL.createObjectURL(new Blob([`
                self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/min/'
                };
                importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.25.0/min/vs/base/worker/workerMain.js');
            `], { type: 'text/javascript' }));
            (window as any).MonacoEnvironment = { getWorkerUrl: () => proxy };
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
            window.addEventListener('resize', function() {
                monacoInstance.layout();
            });
            console.log(monacoInstance);
        })() as unknown;
    });

    document.getElementById('runXterm')?.addEventListener('click', function() {
        (async function() {
            const xtermDiv = document.getElementById('xtermDiv') as HTMLDivElement;
            if (xtermDiv.getAttribute('loaded') === 'loaded') {
                alert('Cannot be loaded repeatedly.');
                return;
            }
            xtermDiv.setAttribute('loaded', 'loaded');
            xtermDiv.innerHTML = 'Loading...';
            // --- 开始加载 ---
            mask.style.display = 'flex';
            await loader.loadLinks([
                'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.min.css'
            ], {
                'loaded': function(url, state) {
                    mask.innerHTML = url + '<br>Loaded(' + state.toString() + ').';
                }
            });
            await loader.loadScripts([
                'https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js',
                'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js',
                'https://cdn.jsdelivr.net/npm/xterm-addon-webgl@0.14.0/lib/xterm-addon-webgl.js'
            ], {
                'loaded': function(url, state) {
                    mask.innerHTML = url + '<br>Loaded(' + state.toString() + ').';
                }
            });
            loader.loadStyle('.xterm-viewport::-webkit-scrollbar{display:none;}');
            mask.style.display = 'none';
            xtermDiv.innerHTML = '';
            xtermDiv.style.background = '#000';
            xtermDiv.style.display = 'block';
            const term = new (window as any).Terminal();
            let command = '';
            function prompt(): void {
                command = '';
                term.write('\r\n$ ');
            }
            function runCommand(text: string): void {
                const command = text.trim().split(' ')[0];
                if (command.length > 0) {
                    term.writeln('');
                    term.writeln(`${command}: command not found`);
                }
                prompt();
            }
            term.onData(function(e: string) {
                switch (e) {
                    case '\u0003': // Ctrl+C
                        term.write('^C');
                        prompt();
                        break;
                    case '\r': // Enter
                        runCommand(command);
                        command = '';
                        break;
                    case '\u007F': // Backspace (DEL)
                        // Do not delete the prompt
                        console.log('x', term._core.buffer.x);
                        if (term._core.buffer.x > 2) {
                            term.write('\b \b');
                            if (command.length > 0) {
                                command = command.slice(0, command.length - 1);
                            }
                        }
                        break;
                    default: // Print all other characters for demo
                        if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                            command += e;
                            term.write(e);
                        }
                }
            });
            const fitAddon = new (window as any).FitAddon.FitAddon();
            term.loadAddon(fitAddon);
            const webgl = new (window as any).WebglAddon.WebglAddon();
            term.loadAddon(webgl);
            term.open(xtermDiv);
            fitAddon.fit();
            window.addEventListener('resize', () => {
                fitAddon.fit();
            });
            term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        })() as unknown;
    });

    document.getElementById('AddFetchFilesAdapter')?.addEventListener('click', function() {
        (async function() {
            const tmpFiles: Record<string, string | Blob> = {};
            mask.style.display = 'flex';
            await loader.fetchFiles([
                '/current/lib/langs/JavaScript.js',
                '/current/lib/BuiltInTypeCompiler.js',
                '/current/BuiltInTypes.js',
                '/current/lib/Common.js'
            ], {
                'files': tmpFiles,
                'after': '?' + Math.random().toString(),
                'dir': '/',
                load: function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                loaded: function(url: string) {
                    mask.innerHTML = url + '<br>Loaded.';
                },
                adapter: async (url: string): Promise<string | Blob | null> => {
                    url = url.replace('/current/', 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/');
                    return loader.fetch(url);
                }
            });
            mask.style.display = 'none';
            console.log('tmpFiles', Object.keys(tmpFiles));
        })() as unknown;
    });

    document.getElementById('AddSniffFilesAdapter')?.addEventListener('click', function() {
        (async function() {
            const tmpFiles: Record<string, string | Blob> = {};
            mask.style.display = 'flex';
            await loader.sniffFiles('/test/abc/lib/exports/resize-observer.js', {
                'files': tmpFiles,
                'after': '?' + Math.random().toString(),
                'dir': '/',
                load: function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                loaded: function(url: string) {
                    mask.innerHTML = url + '<br>Loaded.';
                },
                adapter: async (url: string): Promise<string | Blob | null> => {
                    url = url.replace('/test/abc/', 'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/');
                    return loader.fetch(url);
                }
            });
            mask.style.display = 'none';
            console.log('tmpFiles', Object.keys(tmpFiles));
        })() as unknown;
    });

    document.getElementById('runRemoveComment')?.addEventListener('click', function() {
        (document.getElementById('removeComment2') as HTMLTextAreaElement).value = loader.removeComment((document.getElementById('removeComment1') as HTMLTextAreaElement).value);
    });

    document.getElementById('runParseUrl')?.addEventListener('click', function() {
        (document.getElementById('runParseUrl2') as HTMLTextAreaElement).value = JSON.stringify(loader.parseUrl((document.getElementById('runParseUrl1') as HTMLInputElement).value), null, 4);
    });

    const urlResolve1 = document.getElementById('urlResolve1') as HTMLInputElement;
    const urlResolve2 = document.getElementById('urlResolve2') as HTMLInputElement;
    const urlResolveSelect = document.getElementById('urlResolveSelect') as HTMLSelectElement;
    urlResolveSelect.addEventListener('change', function() {
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
    document.getElementById('urlResolve')?.addEventListener('click', function() {
        document.getElementById('urlResolve3')!.innerText = loader.urlResolve(urlResolve1.value, urlResolve2.value);
    });

    // --- testPost ---

    document.getElementById('testPost')?.addEventListener('click', function() {
        (async function() {
            console.log('Post start...');
            mask.style.display = 'flex';
            const r = await loader.post('./index2.html', {
                'param': 'test1'
            });
            mask.style.display = 'none';
            console.log('Post done: ' + typeof r);
        })() as unknown;
    });

    // --- testSniffNpm ---

    document.getElementById('testSniffNpm')?.addEventListener('click', function() {
        (async function() {
            const tmpFiles: Record<string, string | Blob> = {};
            const map = {};
            mask.style.display = 'flex';
            await loader.sniffNpm({
                'clickgo': '3.3.5',
                'compressorjs': '1.2.1'
            }, {
                'files': tmpFiles,
                'after': '?' + Math.random().toString(),
                'dir': '/',
                'map': map,
                load: function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                loaded: function(url: string) {
                    mask.innerHTML = url + '<br>Loaded.';
                }
            });
            mask.style.display = 'none';
            console.log('tmpFiles', Object.keys(tmpFiles));
            console.log('map', map);
        })() as unknown;
    });
});
