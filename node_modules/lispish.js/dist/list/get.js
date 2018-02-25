"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns the value at the given index, or nil if the index exceeds the
 * length of the list.
 * @param  {number} idx
 * @param  {Cons} L
 * @return {boolean}
 */
var get = function (idx, L) {
    return isempty_1["default"](L) ? L : idx === 0 ? car_1["default"](L) : get(idx - 1, cdr_1["default"](L));
};
exports["default"] = get;
