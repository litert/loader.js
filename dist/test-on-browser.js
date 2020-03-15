"use strict";
var keyInput;
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
loader.ready(function () {
    keyInput = document.getElementById("key");
    loader.require("../dist/tmodule", function (t) {
        document.getElementsByTagName("body")[0].removeChild(document.getElementById("mask"));
        tmodule = t;
    });
});
//# sourceMappingURL=test-on-browser.js.map