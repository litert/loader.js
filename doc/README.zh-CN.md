# LiteRT/Loader

[![npm version](https://img.shields.io/npm/v/@litert/loader.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/loader "Stable Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/dev.svg)](https://www.npmjs.com/package/@litert/loader "Development Version")
[![License](https://img.shields.io/github/license/litert/loader.js.svg)](https://github.com/litert/loader.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/loader.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v12.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/loader.js.svg)](https://github.com/litert/loader.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/loader.js.svg)](https://github.com/litert/loader.js/releases "Stable Release")
[![GitHub Pre-Releases](https://img.shields.io/github/release/litert/loader.js/all.svg)](https://github.com/litert/loader.js/releases "Pre-Release")

轻量易用的运行于浏览器的模块加载器。

## 语言

[English](../README.md) | [繁體中文](README.zh-TW.md)

## 特性

- [x] 库轻量，配置简单。  
- [x] 无侵入，不会对您的 script 引入的其他库造成任何影响。  
- [x] 支持 CommonJS 格式的 node 模块。  
- [x] 自动支持 fetch 函数，无需额外加载。  
- [x] 自动支持 Promise 对象，无需额外加载。  
- [x] 支持直接运行内存中的文件代码。

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

推荐引用地址：https://cdn.jsdelivr.net/npm/@litert/loader@0.1.1/dist/index.min.js，当然这不一定是最新版本，可以将版本号改为最新版本，或者在此处查找：https://cdn.jsdelivr.net/npm/@litert/loader/。

同样可使用 [unpkg](https://unpkg.com/@litert/loader@0.1.1/dist/index.min.js).

例子：

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@0.1.1/dist/index.min.js"></script>
```

## Usage

通常的使用方式：

```html
<script src="https://cdn.jsdelivr.net/npm/@litert/loader@0.1.1/dist/index.min.js"></script>
```

```javascript
// 添加的映射路径无需带“.js”后缀。
loader.setPaths({
    "module": "https://xxx/xxx/index",
    "module2": "../abc/in"
});
loader.addPath("module3", "./en");
// 可在文件后面追加字符串，例如可以用来防止缓存。
loader.setAfter("?" + Math.random());
// 所有操作请写在回调函数当中。
loader.ready(function() {
    loader.require(["../dist/tmodule", "module2"], function(t1, t2) {
        // 可以写一些内容，当然也可以不使用回调函数。
    });
});
```

## 测试

### Node

编译 TS 代码之后，可以直接执行 node dist/test-on-node 来观察在 node 环境中默认的运行结果。

### 浏览器

使用浏览器访问“test/”来查看比对结果是否和 node 环境中相同。

[你也可以直接点这里在线查看浏览器示例。](https://litert.github.io/loader.js/test/)

## 许可

这个库的许可为 [Apache-2.0](./LICENSE)。