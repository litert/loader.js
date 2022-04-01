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
        if (tp === 'string') {
            str = `"${val}"`;
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
                const match = /function.*?\(.*?\)/.exec(str.toLowerCase());
                str = match ? match[0] + ' { ... }' : '[function]';
            }
            catch {
                str = '[function]';
            }
        }
        else if (tp === 'object') {
            if (Array.isArray(val)) {
                if (level <= 2) {
                    str = '[\n';
                    for (const item of val) {
                        str += '    '.repeat(level + 1) + `${parseConsoleData(item, level + 1)},\n`;
                    }
                    if (str !== '[\n') {
                        str = str.slice(0, -2);
                    }
                    str += '\n' + '    '.repeat(level) + ']';
                }
                else {
                    str = '[array]';
                }
            }
            else {
                if (level <= 2) {
                    str = '{\n';
                    for (const key in val) {
                        str += '    '.repeat(level + 1) + `"${key}": ${parseConsoleData(val[key], level + 1)},\n`;
                    }
                    if (str !== '{\n') {
                        str = str.slice(0, -2);
                    }
                    str += '\n' + '    '.repeat(level) + '}';
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
        logx(msg);
        let iHTML = '<div class="cl">';
        for (const item of msg) {
            iHTML += '<div style="padding-right:10px;">';
            iHTML += parseConsoleData(item).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            iHTML += '</div>';
        }
        consoleDiv.innerHTML += `${iHTML}</div>`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    };

    /** --- 已执行过的文件列表 --- */
    const executed: Record<string, any> = {};
    /** --- tmodule 对象 --- */
    const files: Record<string, Blob | string> = await loader.fetchFiles([
        '../dist/tjson.json',
        '../dist/tloop.js',
        '../dist/tloop2.js',
        '../dist/tmodule.js',
        '../dist/tmodule2.js',
        '../dist/tmodule3.js'
    ]);
    const tmodule = loader.require('../dist/tmodule', files, {
        'executed': executed,
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
                'executed': executed
            })[0];
            console.log(`a: ${es6.a}, b: ${es6.b}, c: ${es6.c}, d: ${es6.d}, e: ${es6.e}`);
            es6.xx();
        })() as unknown;
    });
    document.getElementById('loadSeedrandom')?.addEventListener('click', function() {
        (async function() {
            if (!Object.keys(files).includes('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js')) {
                mask.style.display = 'flex';
                await loader.fetchFiles([
                    'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
                ], {
                    'files': files
                });
                mask.style.display = 'none';
            }
            const sr = loader.require('seedrandom', files, {
                'executed': executed,
                'map': {
                    'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
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
            await loader.fetchFiles([
                'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            const m = loader.require('/main.js', files, {
                'executed': executed,
                'dir': '/',
                'map': {
                    'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
                }
            })[0];
            console.log(`getData: ${m.getData(keyInput.value)}, getSubStr: ${m.getSubStr()}, getRand: ${m.getRand()}`);
        })() as unknown;
    });

    document.getElementById('getFiles')?.addEventListener('click', function() {
        console.log(Object.keys(files));
    });
    document.getElementById('getExecuted')?.addEventListener('click', function() {
        console.log(executed);
    });

    document.getElementById('runTestOnNode')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            await loader.fetchFiles([
                '../dist/test-on-node.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            loader.require('../dist/test-on-node', files, {
                'executed': executed
            });
        })() as unknown;
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
                'files': files
            });
            mask.style.display = 'none';
            loader.require('../dist/trun-typeguard', files, {
                'executed': executed,
                'map': {
                    '@litert/typeguard': 'https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/'
                }
            });
        })() as unknown;
    });

    document.getElementById('runResizeObserverESM')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            await loader.sniffFiles([
                'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            mask.innerHTML = 'Loading...';
            const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer', files, {
                'executed': executed
            })[0];
            console.log(r);
        })() as unknown;
    });
    document.getElementById('runResizeObserverUMD')?.addEventListener('click', function() {
        (async function() {
            mask.style.display = 'flex';
            await loader.fetchFiles([
                'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js'
            ], {
                'files': files
            });
            mask.style.display = 'none';
            const r = loader.require('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js', files, {
                'executed': executed
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
                'load': function(url: string) {
                    mask.innerHTML = url + '<br>Loading...';
                },
                'loaded': function(url: string) {
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
                'executed': executed,
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

    document.getElementById('runRemoveComment')?.addEventListener('click', function() {
        (document.getElementById('removeComment2') as HTMLTextAreaElement).value = loader.removeComment((document.getElementById('removeComment1') as HTMLTextAreaElement).value);
    });
});
