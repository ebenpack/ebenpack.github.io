"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var get_1 = require("./get");
/**
 * Returns a new alist. If the given key
 * pair existed in the original list, the
 * value will be replaced with the one privded. Otherwise
 * the key-value pair will be added.
 * @param  {*} key
 * @param  {*} value
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (key, value, L) {
    var helper = function (L, key, value) {
        return car_1["default"](car_1["default"](L)) === key
            ? cons_1["default"](cons_1["default"](key, value), cdr_1["default"](L))
            : cons_1["default"](car_1["default"](L), helper(cdr_1["default"](L), key, value));
    };
    return isempty_1["default"](get_1["default"](key, L))
        ? cons_1["default"](cons_1["default"](key, value), L)
        : helper(L, key, value);
});
