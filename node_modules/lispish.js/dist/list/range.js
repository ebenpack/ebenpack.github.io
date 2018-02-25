"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var nil_1 = require("../cons/nil");
/**
 * Returns a range list from n to m.
 * @param  {integer} n If m in not passed, the end of the range (exlusive),
 * otherwise the start of the range (inclusive).
 * @param  {integer} m If passed, the end of the range (exlusive).
 * @param  {(integer|undefined)} step steps to take between each item in the range. Defaults to 1.
 * @return {Cons} List from n to m.
 */
exports["default"] = (function (m, n, step) {
    var abs = function (n) { return (n < 0 ? -n : n); };
    var rangeHelper = function (m, n, step) {
        return m === n
            ? nil_1["default"]
            : goodStep(m, n, step)
                ? cons_1["default"](m, rangeHelper(m + step, n, step))
                : cons_1["default"](m, nil_1["default"]);
    };
    var goodStep = function (start, stop, step) {
        return abs(stop - start) > abs(stop - (start + step));
    };
    var stepHelper = function (m, step, n) {
        return typeof n === "undefined"
            ? goodStep(0, m, step) ? rangeHelper(0, m, step) : nil_1["default"]
            : goodStep(m, n, step) ? rangeHelper(m, n, step) : nil_1["default"];
    };
    return typeof step === "undefined"
        ? stepHelper(m, 1, n)
        : stepHelper(m, step, n);
});
