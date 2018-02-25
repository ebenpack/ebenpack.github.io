"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var pair_1 = require("../cons/pair");
var concat_1 = require("./concat");
var isempty_1 = require("../cons/isempty");
/**
 * Flatten a list.
 * @return {Cons}
 */
var flatten = function (L) {
    return isempty_1["default"](L)
        ? L
        : !pair_1["default"](car_1["default"](L))
            ? cons_1["default"](car_1["default"](L), flatten(cdr_1["default"](L)))
            : concat_1["default"](flatten(car_1["default"](L)), flatten(cdr_1["default"](L)));
};
exports["default"] = flatten;
