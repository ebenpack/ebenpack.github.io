"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var pair_1 = require("../cons/pair");
var isempty_1 = require("../cons/isempty");
/**
 * Returns a string representation of the
 * given association list. Currently, some
 * assumptions are made about the given list.
 * Namely, that the values are either primitives or
 * nested association lists.
 * @param  {Cons} L
 * @return {string}
 */
exports["default"] = (function (L) {
    var getIndent = function (n) { return Array(n * 4).join(" "); };
    var outerWrap = function (L, indent) {
        return "{\n" + helper(L, "", indent + 1) + "\n" + getIndent(indent) + "}";
    };
    var helper = function (L, spacer, indent) {
        return isempty_1["default"](L)
            ? ""
            : pair_1["default"](cdr_1["default"](car_1["default"](L)))
                ? spacer +
                    getIndent(indent) +
                    car_1["default"](car_1["default"](L)) +
                    ": " +
                    outerWrap(cdr_1["default"](car_1["default"](L)), indent) +
                    helper(cdr_1["default"](L), ",\n", indent)
                : spacer +
                    getIndent(indent) +
                    car_1["default"](car_1["default"](L)) +
                    ": " +
                    cdr_1["default"](car_1["default"](L)) +
                    helper(cdr_1["default"](L), ",\n", indent);
    };
    return outerWrap(L, 0);
});
