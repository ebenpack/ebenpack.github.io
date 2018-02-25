"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Given a cons list, returns a new cons list
 * with the first item removed
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (L) { return (isempty_1["default"](L) ? L : cdr_1["default"](L)); });
