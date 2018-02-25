"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Call the given function with the list of arguments supplied.
 * @param  {Function} fn
 * @param  {Cons}   args
 * @return {*}
 */
// TODO: Remove bind?
var apply = function (fn, args) {
    var helper = function (fn, args) {
        return isempty_1["default"](cdr_1["default"](args))
            ? fn(car_1["default"](args))
            : apply(fn.bind(null, car_1["default"](args)), cdr_1["default"](args));
    };
    return helper(fn, args);
};
exports["default"] = apply;
