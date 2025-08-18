import * as loader from '@litert/loader';
import * as tool from './tool';

tool.onClick('btn-umd', async () => {
    tool.output(`ResizeObserver: ${(window as any).ResizeObserver}`);
    tool.output(`const res = await loader.loadScript('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js');`);
    const res = await loader.loadScript('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js');
    tool.output(`res: ${res}, ResizeObserver: ${(window as any).ResizeObserver}`);
});

tool.onClick('btn-monaco-esm', async () => {
    tool.output(`const res = await loader.loadESM('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/editor/editor.main.js');`);
    let loaded = 0;
    const monaco = await loader.loadESM('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/editor/editor.main.js', {
        load: (url, furl) => {
            tool.output(`load: ${url}, ${furl}`);
        },
        loaded: (url, furl, fail) => {
            ++loaded;
            tool.output(`loaded: ${url}, ${furl}, ${fail}`);
        },
        error: (furl, e) => {
            tool.output(`<span style="color: oklch(.85 .2 20)">error: ${furl}, ${JSON.stringify(e)}</span>`);
            console.log('error', e, furl, loader.getCacheTransform(furl));
        },
    });
    tool.output(`loaded count: ${loaded}`);
    if (!monaco) {
        return;
    }
    const opt = {
        'base': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/',
    };
    const editorWorker = await loader.loadESMWorker('./editor/editor.worker', opt);
    const cssWorker = await loader.loadESMWorker('./language/css/css.worker', opt);
    const htmlWorker = await loader.loadESMWorker('./language/html/html.worker', opt);
    const jsonWorker = await loader.loadESMWorker('./language/json/json.worker', opt);
    const tsWorker = await loader.loadESMWorker('./language/typescript/ts.worker', opt);
    // console.log('xxx', loader.internalImport('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/language/json/json.worker.js'));

    (self as any).MonacoEnvironment = {
        getWorker: function(moduleId: string, label: string): Worker | false {
            if (label === 'json') {
                return jsonWorker.create();
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return cssWorker.create();
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return htmlWorker.create();
            }
            if (label === 'typescript' || label === 'javascript') {
                return tsWorker.create();
            }
            return editorWorker.create();
        },
    };
    const monacoInstance = monaco.editor.create(document.getElementById('monaco-div')!, {
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
    console.log('monaco', monacoInstance);
});

tool.onClick('btn-novnc-esm', async () => {
    tool.output(`const res = await loader.loadESM('https://cdn.jsdelivr.net/npm/@novnc/novnc@1.6.0/+esm');`);
    const res = await loader.loadESM('https://cdn.jsdelivr.net/npm/@novnc/novnc@1.6.0/+esm');
    if (!res) {
        return;
    }
    const rfb = new res.default.default(document.getElementById('novnc-div'), 'ws://127.0.0.1:8080/rsocket', {
        'credentials': {
            'password': ''
        },
        'viewOnly': false,
        'clipViewport': false,
        'scaleViewport': true,
    });
    rfb.addEventListener('connect', () => {
        console.log('VNC OK', rfb);
        console.log('VNC SIZE', rfb._fbWidth, 'x', rfb._fbHeight);
    });
    console.log('novnc', res);
});

tool.onClick('btn-memory-esm', async () => {
    const files = {
        'a.js': 'import * as b from "./b.js"; export const a = 1 + b.b; export { b };',
        'b.js': 'import { a } from "./a.js"; export const b = 2; console.log(a, b, __dirname, __filename); export function f() { return "a: " + a; }',
    };
    tool.output(`const murl = loader.insertCache(${JSON.stringify(files)});`);
    const murl = loader.insertCache(files);
    tool.output(`murl: ${murl}`);
    tool.output(`const res = await loader.loadESM(\`${murl}/a.js\`);`);
    const res = await loader.loadESM(`${murl}/a.js`);
    if (!res) {
        return;
    }
    tool.output(`res: ${JSON.stringify(res)}`);
    tool.output(`res: ${JSON.stringify(res.b.f())}`);
    //*/
});

// --- xterm ---

tool.onClick('btn-xterm-umd', async () => {
    tool.output(`await loader.loadScripts([
        'https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js',
        'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js',
        'https://cdn.jsdelivr.net/npm/xterm-addon-webgl@0.14.0/lib/xterm-addon-webgl.js'
    ]);`);
    await loader.loadLinks([
        'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.min.css'
    ], {
        'loaded': (url, state) => {
            tool.output(`loaded: ${url}, ${state}`);
        },
    });
    await loader.loadScripts([
        'https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js',
        'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js',
        'https://cdn.jsdelivr.net/npm/xterm-addon-webgl@0.14.0/lib/xterm-addon-webgl.js'
    ], {
        'loaded': function(url, state) {
            tool.output(`loaded: ${url}, ${state}`);
        }
    });
    loader.loadStyle('.xterm-viewport::-webkit-scrollbar{display:none;}');
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
    term.open(document.getElementById('xterm-div'));
    fitAddon.fit();
    window.addEventListener('resize', () => {
        fitAddon.fit();
    });
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
});

tool.onClick('btn-remove-comment', () => {
    (document.getElementById('removeComment2') as HTMLTextAreaElement).value = loader.tool.removeComment((document.getElementById('removeComment1') as HTMLTextAreaElement).value);
});

tool.onClick('btn-extract-string', () => {
    const res = loader.tool.extractString(loader.tool.removeComment((document.getElementById('extractString1') as HTMLTextAreaElement).value));
    (document.getElementById('extractString2') as HTMLTextAreaElement).value = res.code;
    tool.output(`strings${res.strings.length}: ${JSON.stringify(res.strings)}`);
});

tool.onClick('btn-parse-url', () => {
    (document.getElementById('runParseUrl2') as HTMLTextAreaElement).value = JSON.stringify(loader.tool.parseUrl((document.getElementById('runParseUrl1') as HTMLInputElement).value), null, 4);
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
tool.onClick('btn-url-resolve', () => {
    (document.getElementById('urlResolve3') as HTMLInputElement).value = loader.tool.urlResolve(urlResolve1.value, urlResolve2.value);
});
