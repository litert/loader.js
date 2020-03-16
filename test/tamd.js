define("tm1", function() {
    var qq = "bb";
    return {
        "num": 1,
        "ok": "kkk",
        "qq": "bb"
    };
});

define("tm2", ["exports", "tm1"], function(exports, t1) {
    exports.getNum = function() {
        return t1.num;
    };
});

define(["exports", "tm1", "tm2"], function(exports, t1, t2) {
    exports.getOk = t1.ok;
    exports.getTm2Num = t2.getNum;
});