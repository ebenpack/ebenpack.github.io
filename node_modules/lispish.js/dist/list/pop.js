"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a cons list, returns a new list with the last item removed.
 * @param  {Cons} L
 * @return {Cons}
 */
var pop = function (L) {
    return isempty_1["default"](L) || isempty_1["default"](cdr_1["default"](L)) ? nil_1["default"] : cons_1["default"](car_1["default"](L), pop(cdr_1["default"](L)));
};
exports["default"] = pop;
