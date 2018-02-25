"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the front of the list.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (val, L) { return cons_1["default"](val, L); });
