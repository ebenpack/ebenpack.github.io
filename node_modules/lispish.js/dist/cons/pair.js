"use strict";
exports.__esModule = true;
var ConsType_1 = require("./ConsType");
/**
 * Returns a boolean indicating whether the given parameter is a cons pair.
 * @param  {*} c
 * @return {boolean}
 */
exports["default"] = (function (c) {
    return typeof c === "function" && c(3) === ConsType_1["default"];
});
