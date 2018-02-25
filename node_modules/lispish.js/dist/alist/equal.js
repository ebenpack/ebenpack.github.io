"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("../cons/pair");
var equal_1 = require("../cons/equal");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var every_1 = require("../list/every");
var get_1 = require("./get");
/**
 * Compares two association lists for equality. Two association
 * lists are considered equal if all the key-value-pairs from the
 * first list are in the second, and vice-versa. The ordering and
 * relative positions of these KVPs are irrelevant for these purposes.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
exports["default"] = (function (L1, L2) {
    return every_1["default"](function (val) { return pair_1["default"](val) && equal_1["default"](get_1["default"](car_1["default"](val), L2), cdr_1["default"](val)); }, L1) &&
        every_1["default"](function (val) { return pair_1["default"](val) && equal_1["default"](get_1["default"](car_1["default"](val), L1), cdr_1["default"](val)); }, L2);
});
