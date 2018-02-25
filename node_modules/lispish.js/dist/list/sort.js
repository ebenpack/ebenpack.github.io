"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var length_1 = require("./length");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a list, returns a new, sorted list.
 * Optionally, a custom comparison function can be passed.
 * By default, ascending sort if performed.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (fn, L) {
    var merge = function (L1, L2, fn) {
        return isempty_1["default"](L1)
            ? L2
            : isempty_1["default"](L2)
                ? L1
                : fn(car_1["default"](L1), car_1["default"](L2))
                    ? cons_1["default"](car_1["default"](L1), merge(cdr_1["default"](L1), L2, fn))
                    : cons_1["default"](car_1["default"](L2), merge(L1, cdr_1["default"](L2), fn));
    };
    var split = function (L, lo, hi) {
        var splitHelper = function (L, lo, hi, curr) {
            return curr < lo
                ? splitHelper(cdr_1["default"](L), lo, hi, curr + 1)
                : curr === hi
                    ? nil_1["default"]
                    : cons_1["default"](car_1["default"](L), splitHelper(cdr_1["default"](L), lo, hi, curr + 1));
        };
        return splitHelper(L, lo, hi, 0);
    };
    var msort = function (L, fn, len) {
        return isempty_1["default"](L) || isempty_1["default"](cdr_1["default"](L))
            ? L
            : merge(msort(split(L, 0, Math.floor(len / 2)), fn, Math.floor(len / 2)), msort(split(L, Math.floor(len / 2), len), fn, len - Math.floor(len / 2)), fn);
    };
    return msort(L, fn, length_1["default"](L));
});
