"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("./pair");
var cdr_1 = require("./cdr");
var car_1 = require("./car");
/**
 * Returns a boolean indicating whether to two given parameters
 * are equal. If the paramters are cons pairs, equality is determined
 * by the equality of their members.
 * @param  {*} a
 * @param  {*} b
 * @return {boolean}
 */
var equal = function (a, b) {
    // If a is a pair and b is not (or vice versa),
    // these cannot be equal.
    return pair_1["default"](a) !== pair_1["default"](b)
        ? false
        : // If car(a) is a pair and car(b) is not (or vice versa),
            // these cannot be equal.
            (pair_1["default"](a) && pair_1["default"](car_1["default"](a))) !== (pair_1["default"](b) && pair_1["default"](car_1["default"](b)))
                ? false
                : // If cdr(a) is a pair and cdr(b) is not (or vice versa),
                    // these cannot be equal.
                    (pair_1["default"](a) && pair_1["default"](cdr_1["default"](a))) !== (pair_1["default"](b) && pair_1["default"](cdr_1["default"](b)))
                        ? false
                        : // If a is a pair (which, if we have reached this point,
                            // means that b must also be a pair), recurse.
                            // Otherwise, test the equality of a and b directly.
                            pair_1["default"](a)
                                ? equal(car_1["default"](a), car_1["default"](b)) && equal(cdr_1["default"](a), cdr_1["default"](b))
                                : a === b;
};
exports["default"] = equal;
