"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var apply_1 = require("./apply");
var nil_1 = require("../cons/nil");
/**
 * Curry the given function. If the number of expected parameters
 * is passed explicitly, this will be used. Otherwise, the arity of the
 * function passed in will be used.
 * @param  {Function} fn
 * @param  {integer}  arity
 * @return {Function}
 */
exports["default"] = (function (fn, arity) {
    var helper = function (fn, arity, args) {
        return arity === 0
            ? apply_1["default"](fn, args)
            : function (arg) { return helper(fn, arity - 1, cons_1["default"](arg, args)); };
    };
    return typeof arity === "undefined"
        ? helper(fn, fn.length, nil_1["default"])
        : helper(fn, arity, nil_1["default"]);
});
