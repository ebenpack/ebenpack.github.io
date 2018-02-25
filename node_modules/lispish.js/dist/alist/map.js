"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var map_1 = require("../list/map");
/**
 * Map over an association list.
 * @param  {Function} fn
 * @param  {alist} L
 * @return {list}
 */
var map = function (fn, L) {
    return map_1["default"](function (v) { return cons_1["default"](car_1["default"](v), fn(car_1["default"](v), cdr_1["default"](v))); }, L);
};
exports["default"] = map;
