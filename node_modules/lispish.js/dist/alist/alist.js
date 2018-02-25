"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var list_1 = require("../list/list");
var cons_1 = require("../cons/cons");
/**
 * Returns an association list with a single key-value pair.
 * @param  {*} key
 * @param  {*} value
 * @return {Cons}
 */
exports["default"] = (function (key, value) { return list_1["default"](cons_1["default"](key, value)); });
