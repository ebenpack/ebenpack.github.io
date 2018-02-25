"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var equal_1 = require("../cons/equal");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns true if the specified value is equal to at least one element of the given list.
 * @param  {*} a
 * @param  {Cons} L
 * @return {Boolean}
 */
var contains = function (a, L) {
    return isempty_1["default"](L) ? false : equal_1["default"](car_1["default"](L), a) ? true : contains(a, cdr_1["default"](L));
};
exports["default"] = contains;
