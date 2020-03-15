# LiteRT/Loader

[![npm version](https://img.shields.io/npm/v/@litert/loader.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/loader "Stable Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/dev.svg)](https://www.npmjs.com/package/@litert/loader "Development Version")
[![License](https://img.shields.io/github/license/litert/loader.js.svg)](https://github.com/litert/loader.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/loader.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v12.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/loader.js.svg)](https://github.com/litert/loader.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/loader.js.svg)](https://github.com/litert/loader.js/releases "Stable Release")
[![GitHub Pre-Releases](https://img.shields.io/github/release/litert/loader.js/all.svg)](https://github.com/litert/loader.js/releases "Pre-Release")

Simple browser module loader.

## Languages

[简体中文](doc/README.zh-CN.md) | [繁體中文](doc/README.zh-TW.md)

## Features

[x] No intrusion and does not affect the script label.  
[x] Node modules that support the CommandJS format.  
[x] The configuration is simple and lightweight.

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

Recommended: https://cdn.jsdelivr.net/npm/@litert/loader@0.0.1/dist/index.min.js, which will reflect the latest version as soon as it is published to npm. You can also browse the source of the npm package at https://cdn.jsdelivr.net/npm/@litert/loader.

Also available on [unpkg](https://unpkg.com/@litert/loader@0.0.1/dist/index.min.js).

For example:

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@0.0.1/dist/index.min.js"></script>
```

## Usage

Here's a general how to use it:

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@0.0.1/dist/index.min.js"></script>
```

```javascript
// Adding a map does not require a "js" extension.
loader.setModulePaths({
    "module": "https://xxx/xxx/index",
    "module2": "../abc/in"
});
loader.addModulePath("module3", "./en");
// All actions are written in the "ready" callback.
loader.ready(function() {
    loader.require(["../dist/tmodule", "module2"], function(t1, t2) {
        // Do something, you can also not write callbacks.
    });
});
```

## Test

### Node

After compiling the TS code, execute: node dist/test-on-node to observe the execution results of the test code under node.

### Browser

Use your browser to access "test/" to see if the results are consistent with the node environment.

[You can also click here to access the example online.](https://litert.github.io/loader.js/test/)

## License

This library is published under [Apache-2.0](./LICENSE) license.