"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given two cons lists, returns a new cons list composed of
 * cons pairs consisting of positionally determined elements
 * from each of the given lists. The resulting list will only contain
 * as many elements as contained in the shorter of the two lists.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
var zip = function (L1, L2) {
    return isempty_1["default"](L1) || isempty_1["default"](L2)
        ? nil_1["default"]
        : isempty_1["default"](cdr_1["default"](L1)) || isempty_1["default"](cdr_1["default"](L2))
            ? cons_1["default"](cons_1["default"](car_1["default"](L1), car_1["default"](L2)), nil_1["default"])
            : cons_1["default"](cons_1["default"](car_1["default"](L1), car_1["default"](L2)), zip(cdr_1["default"](L1), cdr_1["default"](L2)));
};
exports["default"] = zip;
