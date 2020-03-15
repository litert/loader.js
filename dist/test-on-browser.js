"use strict";
var keyInput;
var mask;
var tmodule;
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
loader.ready(function () {
    keyInput = document.getElementById("key");
    mask = document.getElementById("mask");
    loader.require("../dist/tmodule", function (t) {
        mask.style.display = "none";
        tmodule = t;
    });
});
//# sourceMappingURL=test-on-browser.js.map