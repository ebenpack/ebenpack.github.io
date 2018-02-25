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
 * Given a list, returns a new list 'slice'.
 * If n is not passed in, the slice will be from m to
 * the end of the original list. If n is passed in,
 * then the slice will be from m to n. Invalid slices
 * (e.g. where m is larger than n) will return nil.
 * @param  {Cons} L
 * @param  {integer} m
 * @param  {(integer|undefined)} n
 * @return {Cons}
 */
exports["default"] = (function (L, m, n) {
    var sliceHelper = function (L, m, n, current) {
        return current === n || m >= n
            ? nil_1["default"]
            : isempty_1["default"](L)
                ? L
                : current >= m
                    ? cons_1["default"](car_1["default"](L), sliceHelper(cdr_1["default"](L), m, n, current + 1))
                    : sliceHelper(cdr_1["default"](L), m, n, current + 1);
    };
    return typeof n === "undefined"
        ? sliceHelper(L, m, length_1["default"](L), 0)
        : sliceHelper(L, m, n, 0);
});
