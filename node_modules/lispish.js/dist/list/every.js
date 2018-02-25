"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns true if every element in the list passes the
 * test implemented by the provided callback function.
 * The callback function is passed the current value
 * and the current index in the list.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {boolean}
 */
exports["default"] = (function (fn, L) {
    var helper = function (fn, idx, L) {
        return isempty_1["default"](L)
            ? true
            : !fn(car_1["default"](L), idx) ? false : helper(fn, idx + 1, cdr_1["default"](L));
    };
    return helper(fn, 0, L);
});
