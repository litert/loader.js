let keyInput: HTMLInputElement;
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

loader.ready(function() {
    keyInput = <HTMLInputElement>document.getElementById("key");
    loader.require("../dist/tmodule", function(t: any) {
        document.getElementsByTagName("body")[0].removeChild(<HTMLDivElement>document.getElementById("mask"));
        tmodule = t;
    });
});

