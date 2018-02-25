"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var equal_1 = require("../cons/equal");
var isempty_1 = require("../cons/isempty");
/**
 * Finds and returns the first key-value pair
 * which has a key matching that passed in.
 * Returns false if no match is found.
 * @param  {*} key
 * @param  {Cons} L
 * @return {Cons}
 */
var get = function (key, L) {
    return isempty_1["default"](L) ? L : equal_1["default"](car_1["default"](car_1["default"](L)), key) ? cdr_1["default"](car_1["default"](L)) : get(key, cdr_1["default"](L));
};
exports["default"] = get;
