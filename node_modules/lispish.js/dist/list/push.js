"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the end.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
var push = function (val, L) {
    return isempty_1["default"](L)
        ? cons_1["default"](val, nil_1["default"])
        : isempty_1["default"](cdr_1["default"](L))
            ? cons_1["default"](car_1["default"](L), cons_1["default"](val, nil_1["default"]))
            : cons_1["default"](car_1["default"](L), push(val, cdr_1["default"](L)));
};
exports["default"] = push;
