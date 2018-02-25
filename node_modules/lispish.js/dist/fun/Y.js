"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var apply_1 = require("./apply");
var args_1 = require("../helpers/args");
var list_1 = require("../list/list");
exports["default"] = (function (f) {
    return f((function (h) { return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return apply_1["default"](f(h(h)), list_1["default"](args_1["default"](rest)));
    }; })(function (h) { return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return apply_1["default"](f(h(h)), list_1["default"](args_1["default"](rest)));
    }; }));
});
