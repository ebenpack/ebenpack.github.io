"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var args_1 = require("../helpers/args");
var nil_1 = require("../cons/nil");
/**
 * Returns a cons list constructed from the given parameters.
 * @return {Cons}
 */
exports["default"] = (function () {
    var outerArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        outerArgs[_i] = arguments[_i];
    }
    var helper = function (args) {
        return args.length === 0
            ? nil_1["default"]
            : Array.isArray(args[0])
                ? cons_1["default"](helper(args[0]), helper(args.slice(1)))
                : cons_1["default"](args[0], helper(args.slice(1)));
    };
    return outerArgs.length === 1 && Array.isArray(outerArgs[0])
        ? helper(outerArgs[0])
        : helper(args_1["default"](outerArgs));
});
