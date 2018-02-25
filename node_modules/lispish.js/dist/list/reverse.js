"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new list, which is a
 * reversed copy of the list passed in.
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (L) {
    var helper = function (L, rev) {
        return isempty_1["default"](L) ? rev : helper(cdr_1["default"](L), cons_1["default"](car_1["default"](L), rev));
    };
    return helper(L, nil_1["default"]);
});
