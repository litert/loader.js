# LiteRT/Loader

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

[简体中文](doc/README.zh-cn.md) | [繁體中文](doc/README.zh-tw.md)

## Features

- [x] Supports running code in memory.  
- [x] The configuration is simple and lightweight.  
- [x] No intrusion and does not affect the script label.  
- [x] Support the CommonJS / ES6 Module format.  
- [x] The fetch function is automatically supported without additional loading.

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

Recommended: https://cdn.jsdelivr.net/npm/@litert/loader@x.x.x/dist/index.min.js, of course x.x.x is just an example and needs to be changed to the official version number, you can also find it here https://cdn.jsdelivr.net/npm/@litert/loader/.

Also available on [unpkg](https://unpkg.com/@litert/loader@x.x.x/dist/index.min.js).

## Usage

Here's a general how to use it:

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@x.x.x/dist/index.min.js"></script>
```

```typescript
// All actions are written in the "ready" callback.
loader.ready(function() {
    let files: Record<string, Blob | string> = { ... };
    let tmodule: any, module2: any;
    [tmodule, module2] = loader.require(['../dist/tmodule', './module2'], files);
});
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
let executed: Record<string, any> = {};
let files: Record<string, Blob | string> = {};
if (!Object.keys(files).includes('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js')) {
    await loader.fetchFiles([
        'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
    ], {
        'files': files
    });
}
let sr = loader.require('seedrandom', files, {
    'executed': executed,
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