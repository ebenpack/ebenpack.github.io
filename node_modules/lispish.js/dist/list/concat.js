"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns a new list that is the result
 * of concatenating L2 onto the end of L1;
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
var concat = function (L1, L2) {
    return isempty_1["default"](L1) ? L2 : cons_1["default"](car_1["default"](L1), concat(cdr_1["default"](L1), L2));
};
exports["default"] = concat;
