let keyInput: HTMLInputElement;
let mask: HTMLDivElement;
let tmodule: any;

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

loader.ready(function() {
    keyInput = <HTMLInputElement>document.getElementById("key");
    mask = <HTMLDivElement>document.getElementById("mask");
    loader.require("../dist/tmodule", function(t: any) {
        mask.style.display = "none";
        tmodule = t;
    });
});

