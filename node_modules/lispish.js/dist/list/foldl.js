"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Applies the given callback function against an accumulator
 * and each value of the cons list (from left-to-right) in order
 * to reduce it to a single value.
 * @param  {Function} fn
 * @param  {*}   acc
 * @param  {Cons} L
 * @return {Cons}
 */
var foldl = function (fn, acc, L) {
    return isempty_1["default"](L)
        ? acc
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(acc, car_1["default"](L))
            : foldl(fn, fn(acc, car_1["default"](L)), cdr_1["default"](L));
};
exports["default"] = foldl;
