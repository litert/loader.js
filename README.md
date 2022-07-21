<p align="center"><img src="doc/icon.png" width="100" height="100" alt="Loader"></p>

[![npm version](https://img.shields.io/npm/v/@litert/loader?colorB=brightgreen)](https://www.npmjs.com/package/@litert/loader "Stable Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/dev)](https://www.npmjs.com/package/@litert/loader "Development Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/beta)](https://www.npmjs.com/package/@litert/loader "Beta Version")
[![License](https://img.shields.io/github/license/litert/loader.js)](https://github.com/litert/loader.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/loader?colorB=brightgreen)](https://nodejs.org/dist/latest-v12.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/loader.js)](https://github.com/litert/loader.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/loader.js)](https://github.com/litert/loader.js/releases "Stable Release")
[![GitHub including pre-releases](https://img.shields.io/github/v/release/litert/loader.js?include_prereleases)](https://github.com/litert/loader.js/releases "Pre-Release")

Simple browser module loader.

## Languages

[简体中文](doc/README.sc.md) | [繁體中文](doc/README.tc.md)

## Features

- [x] Supports running code in memory.  
- [x] The configuration is simple and lightweight.  
- [x] No intrusion and does not affect the script label.  
- [x] Support the CommonJS / ES6 Module format.  
- [x] The fetch function is automatically supported without additional loading.  
- [x] Support TypeScript.

## Installation

This is a module for browsers and eventually needs to be referenced by the script tag.

### NPM

You can install directly using NPM:

```sh
$ npm i @litert/loader --save
```

Or install the developing (unstable) version for newest features:

```sh
$ npm i @litert/loader@dev --save
```

### CDN (recommend)

Recommended: https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/loader.min.js, you can also find it here https://cdn.jsdelivr.net/npm/@litert/loader/.

Also available on [unpkg](https://unpkg.com/@litert/loader@3.3.0/dist/loader.min.js).

## Usage

Here's a general how to use it:

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/loader.min.js"></script>
```

The code hint needs to be added in "tsconfig.json":

```json
{
    "compilerOptions": {
        ...
        "typeRoots": [
            "./node_modules/@types",
            "./node_modules/@litert/loader"
        ]
    }
}
```

All actions are written in the "ready" callback.

```typescript
loader.ready(function() {
    let files: Record<string, Blob | string> = { ... };
    let tmodule: any, module2: any;
    [tmodule, module2] = loader.require(['../dist/tmodule', './module2'], files);
});
```

Alternatively, use ?path= to load the ingress file directly, the js file extension can be omitted.

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/index.min.js?path=../lib/test"></script>
```

Use the ?cdn= parameter to set the source address of the third library load, default is: https://cdn.jsdelivr.net.

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/index.min.js?cdn=https://cdn.xxx.xxx"></script>
```

Use the ?map= parameter to set the path to the third-party library, a JSON string, that is valid only with the path parameter.

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/index.min.js?&path=xxx&map={'xxx':'https://xx/npm/index'}"></script>
```

Using the ?npm= parameter loader will automatically go to npm to find the relevant library for sniffing loading, JSON string, module name and version number, only valid with the path parameter.

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.3.0/dist/index.min.js?&path=xxx&npm={'xxx':'1.0.0'}"></script>
```

You can use the fetchFiles method to load network files into memory.

```typescript
let files: Record<string, Blob | string> = await loader.fetchFiles([
    '../dist/tmodule.js',
    './module2.js',
    'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
]);
```

Use sniffFiles to load network files into the memory, and sniff the inclusion relationship in the file, such as js import, require, etc., CSS url, etc.

```typescript
let files: Record<string, Blob | string> = {};
await loader.sniffFiles([
    'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.js'
], {
    'files': files
});
```

Using the map option, you can specify the alias of the library, the alias of the import command is also based on this.

```typescript
let cache: Record<string, any> = {};
let files: Record<string, Blob | string> = {};
if (!Object.keys(files).includes('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js')) {
    await loader.fetchFiles([
        'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
    ], {
        'files': files
    });
}
let sr = loader.require('seedrandom', files, {
    'cache': cache,
    'map': {
        'seedrandom': 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min'
    }
})[0];
```

## Test

### Node

After compiling the TS code, execute: node dist/test-on-node to observe the execution results of the test code under node.

### Browser

Use the browser to visit "test/" to view the comparison results are the same as in the node environment.

[You can also click here to access the example online.](https://litert.github.io/loader.js/test/)

## License

This library is published under [Apache-2.0](./LICENSE) license.