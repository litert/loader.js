# LiteRT/Loader

[![npm version](https://img.shields.io/npm/v/@litert/loader.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/loader "Stable Version")
[![npm version](https://img.shields.io/npm/v/@litert/loader/dev.svg)](https://www.npmjs.com/package/@litert/loader "Development Version")
[![License](https://img.shields.io/github/license/litert/loader.js.svg)](https://github.com/litert/loader.js/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/loader.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v12.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/loader.js.svg)](https://github.com/litert/loader.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/loader.js.svg)](https://github.com/litert/loader.js/releases "Stable Release")
[![GitHub Pre-Releases](https://img.shields.io/github/release/litert/loader.js/all.svg)](https://github.com/litert/loader.js/releases "Pre-Release")

輕量易用的運行于瀏覽器的模組載入器。

## 語言

[English](../README.md) | [简体中文](README.zh-CN.md)

## 特性

- [x] 庫輕量，配置簡單。  
- [x] 無侵入，不會對您的 script 引入的其他庫造成任何影響。  
- [x] 支援 CommonJS 格式的 node 模組。  
- [x] 支援 AMD 格式的模組。  
- [x] 自動支援 fetch 函數，無需額外載入。
- [x] The Promise object is automatically supported if not in the browser.  
- [x] Supports running code in memory.

## 安裝

這是運行于瀏覽器的庫，因此只需要使用 script 標籤引用即可。

### NPM

可以直接使用 npm 下載庫到本地：

```sh
$ npm i @litert/loader --save
```

可以安裝最新的開發版到本地：

```sh
$ npm i @litert/loader@dev --save
```

### CDN（推薦）

推薦引用位址：https://cdn.jsdelivr.net/npm/@litert/loader@0.1.1/dist/index.min.js，當然這不一定是最新版本，可以將版本號改為最新版本，或者在此處查找：HTTPs://cdn.jsdelivr.net/npm/@litert/loader/。

同樣可使用 [unpkg](https://unpkg.com/@litert/loader@0.1.1/dist/index.min.js).

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
// 添加的映射路徑無需帶「.js」尾碼。
loader.setPaths({
    "module": "https://xxx/xxx/index",
    "module2": "../abc/in"
});
loader.addPath("module3", "./en");
// 可在檔後面追加字串，例如可以用來防止緩存。
loader.setAfter("?" + Math.random());
// 所有操作請寫在回呼函數當中。
loader.ready(function() {
    loader.require(["../dist/tmodule", "module2"], function(t1, t2) {
        // 可以寫一些內容，當然也可以不使用回呼函數。
    });
});
```

## 測試

### Node

編譯 TS 代碼之後，可以直接執行 node dist/test-on-node 來觀察在 node 環境中預設的運行結果。

### 瀏覽器

使用瀏覽器訪問「test/」來查看比對結果是否和 node 環境中相同。

[你也可以直接點這裡線上查看瀏覽器示例。](https://litert.github.io/loader.js/test/)

## 許可

這個庫的許可為 [Apache-2.0](./LICENSE)。