let keyInput: HTMLInputElement;
let consoleEl: HTMLDivElement;
let mask: HTMLDivElement;
let tmodule: any;

/** --- 重写 log --- */
let logx = console.log;
console.log = function(msg: any) {
    consoleEl.innerHTML += `<div class="cl">${typeof msg === "string" ? msg : JSON.stringify(msg, undefined, 4)}</div>`
}

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
    loader.require("../dist/test-on-node", function() {
        mask.style.display = "none";
    });
}

function runTypeGuard() {
    mask.style.display = "flex";
    loader.require("../dist/trun-typeguard", function() {
        mask.style.display = "none";
    });
}

function getLoadedPaths() {
    console.log(loader.getLoadedPaths());
}

function loadAmd() {
    mask.style.display = "flex";
    loader.require("./tamd", function(t) {
        mask.style.display = "none";
        console.log(t);
        alert("getTm2Num(): " + t.getTm2Num());
    });
}

loader.ready(function() {
    keyInput = <HTMLInputElement>document.getElementById("key");
    consoleEl = <HTMLDivElement>document.getElementById("console");
    mask = <HTMLDivElement>document.getElementById("mask");
    loader.setPaths({
        "@litert/typeguard": "https://cdn.jsdelivr.net/npm/@litert/typeguard@1.0.1/lib/"
    });
    loader.setAfter("?1");
    loader.require("../dist/tmodule", function(t: any) {
        mask.style.display = "none";
        tmodule = t;
    });
});

