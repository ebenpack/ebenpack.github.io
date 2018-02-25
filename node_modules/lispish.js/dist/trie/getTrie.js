"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var flatten_1 = require("../list/flatten");
var get_1 = require("../alist/get");
var map_1 = require("../alist/map");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
exports["default"] = (function (T, str) {
    var getLeaves = function (T, list) {
        return isempty_1["default"](T)
            ? list
            : map_1["default"](function (key, val) { return (key === "_value" ? val : getLeaves(val, list)); }, T);
    };
    var descendToNode = function (T, word) {
        return isempty_1["default"](T)
            ? nil_1["default"]
            : isempty_1["default"](word)
                ? nil_1["default"]
                : isempty_1["default"](cdr_1["default"](word))
                    ? get_1["default"](car_1["default"](word), T)
                    : descendToNode(get_1["default"](car_1["default"](word), T), cdr_1["default"](word));
    };
    return flatten_1["default"](getLeaves(descendToNode(T, str), nil_1["default"]));
});
