"use strict";
exports.__esModule = true;
/// <reference path="../cons.d.ts" />
var ConsType_1 = require("./ConsType");
/**
 * Returns an immutable cons pair consisting
 * of a and b
 * @param  {*} car
 * @param  {*} cdr
 * @return {Cons}
 */
exports["default"] = (function (car, cdr) { return function (pick) {
    return pick === 0 ? car : pick === 1 ? cdr : ConsType_1["default"];
}; });
