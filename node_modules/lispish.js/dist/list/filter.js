"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new cons list consisting of the values
 * of the given cons list for which the the callback function,
 * called passing the value of each item in the list in turn,
 * evaluated to true.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {Cons}
 */
var filter = function (fn, L) {
    return isempty_1["default"](L)
        ? L
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(car_1["default"](L)) ? cons_1["default"](car_1["default"](L), nil_1["default"]) : nil_1["default"]
            : fn(car_1["default"](L)) ? cons_1["default"](car_1["default"](L), filter(fn, cdr_1["default"](L))) : filter(fn, cdr_1["default"](L));
};
exports["default"] = filter;
