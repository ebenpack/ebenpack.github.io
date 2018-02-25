"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Applies the given callback function against an accumulator
 * and each value of the cons list (from right-to-left) in order
 * to reduce it to a single value.
 * @param  {Function} fn
 * @param  {*}   acc
 * @param  {Cons} L
 * @return {Cons}
 */
// TODO: make foldl and folr
var foldr = function (fn, acc, L) {
    return isempty_1["default"](L)
        ? acc
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(car_1["default"](L), acc)
            : fn(car_1["default"](L), foldr(fn, acc, cdr_1["default"](L)));
};
exports["default"] = foldr;
