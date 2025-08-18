import * as loader from '@litert/loader';
import * as tool from './tool';
tool.onClick('btn-umd', async () => {
    tool.output(`ResizeObserver: ${window.ResizeObserver}`);
    tool.output(`const res = await loader.loadScript('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js');`);
    const res = await loader.loadScript('https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.umd.js');
    tool.output(`res: ${res}, ResizeObserver: ${window.ResizeObserver}`);
});
tool.onClick('btn-monaco-esm', async () => {
    tool.output(`const res = await loader.loadESM('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/editor/editor.main.js');`);
    let loaded = 0;
    const monaco = await loader.loadESM('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/editor/editor.main.js', {
        'loaded': (url, furl, fail) => {
            ++loaded;
            tool.output(`loaded: ${url}, ${furl}, ${fail}`);
        },
        'error': (furl, e) => {
            tool.output(`<span style="color: oklch(.85 .2 20)">error: ${furl}, ${JSON.stringify(e)}</span>`);
            console.log('error', e, furl, loader.getCacheTransform(furl));
        },
    });
    tool.output(`loaded count: ${loaded}`);
    if (!monaco) {
        return;
    }
    const editorWorker = await loader.loadESMWorker('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/editor/editor.worker');
    const cssWorker = await loader.loadESMWorker('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/language/css/css.worker');
    const htmlWorker = await loader.loadESMWorker('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/language/html/html.worker');
    const jsonWorker = await loader.loadESMWorker('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/language/json/json.worker');
    const tsWorker = await loader.loadESMWorker('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/esm/vs/language/typescript/ts.worker');
    self.MonacoEnvironment = {
        getWorker: function (moduleId, label) {
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
    const monacoInstance = monaco.editor.create(document.getElementById('monaco-div'), {
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
        'b.js': 'import { a } from "./a.js"; export const b = 2; console.log(a, b); export function f() { return "a: " + a; }',
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
});
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
        'loaded': function (url, state) {
            tool.output(`loaded: ${url}, ${state}`);
        }
    });
    loader.loadStyle('.xterm-viewport::-webkit-scrollbar{display:none;}');
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
    term.open(document.getElementById('xterm-div'));
    fitAddon.fit();
    window.addEventListener('resize', () => {
        fitAddon.fit();
    });
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
});
tool.onClick('btn-remove-comment', () => {
    document.getElementById('removeComment2').value = loader.tool.removeComment(document.getElementById('removeComment1').value);
});
tool.onClick('btn-parse-url', () => {
    document.getElementById('runParseUrl2').value = JSON.stringify(loader.tool.parseUrl(document.getElementById('runParseUrl1').value), null, 4);
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
tool.onClick('btn-url-resolve', () => {
    document.getElementById('urlResolve3').value = loader.tool.urlResolve(urlResolve1.value, urlResolve2.value);
});
