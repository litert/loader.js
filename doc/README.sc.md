<p align="center"><img src="[2022-04-01]logo.png" width="260" height="80" alt="Loader"></p>

[![npm version](https://img.shields.io/npm/v/@litert/loader.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/loader "Stable Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/dev.svg)](https://www.npmjs.com/package/@litert/loader "Development Version")
[![License](https://img.shields.io/github/license/litert/loader.js.svg)](https://github.com/litert/loader.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/loader.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v12.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/loader.js.svg)](https://github.com/litert/loader.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/loader.js.svg)](https://github.com/litert/loader.js/releases "Stable Release")
[![GitHub Pre-Releases](https://img.shields.io/github/release/litert/loader.js/all.svg)](https://github.com/litert/loader.js/releases "Pre-Release")

轻量易用的运行于浏览器的模块加载器。

## 语言

[English](../README.md) | [繁體中文](README.tc.md)

## 特性

- [x] 支持直接运行内存中的文件代码。  
- [x] 库轻量，配置简单。  
- [x] 无侵入，不会对您的 script 引入的其他库造成任何影响。  
- [x] 支持 CommonJS、ES6 Module 格式。  
- [x] 自动支持 fetch 函数，无需额外加载。  
- [x] 支持 TypeScript。

## 安装

这是运行于浏览器的库，因此只需要使用 script 标签引用即可。

### NPM

可以直接使用 npm 下载库到本地：

```sh
$ npm i @litert/loader --save
```

可以安装最新的开发版到本地：

```sh
$ npm i @litert/loader@dev --save
```

### CDN（推荐）

推荐引用地址：https://cdn.jsdelivr.net/npm/@litert/loader@3.1.1/dist/index.min.js，也可以此处查找：https://cdn.jsdelivr.net/npm/@litert/loader/。

同样可使用 [unpkg](https://unpkg.com/@litert/loader@3.1.1/dist/index.min.js)。

## Usage

通常的使用方式：

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.1.1/dist/index.min.js"></script>
```

代码提示需要在“tsconfig.json”中添加：

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

所有操作请写在 ready 回调函数当中。

```typescript
loader.ready(function() {
    let files: Record<string, Blob | string> = { ... };
    let tmodule: any, module2: any;
    [tmodule, module2] = loader.require(['../dist/tmodule', './module2'], files);
});
```

或者使用 ?path= 直接加载入口 js 文件，js 后缀可省略。

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.1.1/dist/index.min.js?path=../lib/test"></script>
```

使用 ?cdn= 参数设置第三库加载的源地址，默认为：https://cdn.jsdelivr.net。

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@3.1.1/dist/index.min.js?cdn=https://cdn.xxx.xxx"></script>
```

你可以使用 fetchFiles 方法加载网络文件到内存。

```typescript
let files: Record<string, Blob | string> = await loader.fetchFiles([
    '../dist/tmodule.js',
    './module2.js',
    'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'
]);
```

使用 sniffFiles 加载网络文件到内存，会嗅探文件中的包含关系，例如 js 的 import、require 等，CSS 的 url 等。

```typescript
let files: Record<string, Blob | string> = {};
await loader.sniffFiles([
    'https://cdn.jsdelivr.net/npm/@juggle/resize-observer@3.2.0/lib/exports/resize-observer.js'
], {
    'files': files
});
```

使用 map 选项，可以指定库的别名，import 命令的别名也以此为依据。

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

## 测试

### Node

编译 TS 代码之后，可以直接执行 node dist/test-on-node 来观察在 node 环境中默认的运行结果。

### 浏览器

使用浏览器访问“test/”来查看比对结果与 node 环境中相同。

[你也可以直接点这里在线查看浏览器示例。](https://litert.github.io/loader.js/test/)

## 许可

这个库的许可为 [Apache-2.0](./LICENSE)。