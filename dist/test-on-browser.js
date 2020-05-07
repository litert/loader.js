"use strict";
var keyInput;
var consoleEl;
var mask;
var tmodule;
var logx = console.log;
console.log = function (msg) {
    consoleEl.innerHTML += "<div class=\"cl\">" + (typeof msg === "string" ? msg : JSON.stringify(msg, undefined, 4)) + "</div>";
};
function getData() {
    alert(tmodule.getData(keyInput.value));
}
function getJson() {
    alert(tmodule.getJson(keyInput.value));
}
function getRequire() {
    alert(tmodule.getRequire(keyInput.value));
}
function requireModule3() {
    alert(tmodule.requireModule3());
}
function runTestOnNode() {
    mask.style.display = "flex";
    loader.require("../dist/test-on-node", function () {
        mask.style.display = "none";
    });
}
function runTypeGuard() {
    mask.style.display = "flex";
    loader.require("../dist/trun-typeguard", function () {
        mask.style.display = "none";
    });
}
function loadAmd() {
    mask.style.display = "flex";
    loader.require("./tamd", function (t) {
        mask.style.display = "none";
        console.log(t);
        alert("getTm2Num(): " + t.getTm2Num());
    });
}
function getLoadedPaths() {
    console.log(loader.getLoadedPaths());
}
function setRandomAfter() {
    loader.config({
        "after": "?" + Math.random().toString()
    });
    console.log("Set up.");
}
loader.ready(function () {
    keyInput = document.getElementById("key");
    consoleEl = document.getElementById("console");
    mask = document.getElementById("mask");
    loader.setPaths({
        "@litert/typeguard": "https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/"
    });
    loader.setAfter("?1");
    loader.require("../dist/tmodule", function (t) {
        mask.style.display = "none";
        tmodule = t;
    });
});
//# sourceMappingURL=test-on-browser.js.map