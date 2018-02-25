"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new cons list with the results of calling the provided
 * function on every element.
 * @param  {Function} fn callback function
 * @param  {Cons} L  cons list to be mapped
 * @return {Cons}
 */
var map = function (fn, L) {
    return isempty_1["default"](L)
        ? L
        : isempty_1["default"](cdr_1["default"](L))
            ? cons_1["default"](fn(car_1["default"](L)), nil_1["default"])
            : cons_1["default"](fn(car_1["default"](L)), map(fn, cdr_1["default"](L)));
};
exports["default"] = map;
