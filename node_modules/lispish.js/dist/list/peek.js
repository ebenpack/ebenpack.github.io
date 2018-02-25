"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns the value of the last item in a cons list.
 * @param  {Cons} L
 * @return {*}
 */
var peek = function (L) {
    return isempty_1["default"](L) ? L : isempty_1["default"](cdr_1["default"](L)) ? car_1["default"](L) : peek(cdr_1["default"](L));
};
exports["default"] = peek;
