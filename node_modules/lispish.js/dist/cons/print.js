"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("./pair");
var cdr_1 = require("./cdr");
var car_1 = require("./car");
var isempty_1 = require("./isempty");
/**
 * Returns a string representation of a cons.
 * cons prefix, suffix, and separator can all
 * optionally be defined by the user.
 * @param  {Cons} c    cons to be printed
 * @param  {(Object|undefined)} options Optional options object
 * @return {string}      String representation of the given cons
 */
var print = function (c, options) {
    var opts = options || {};
    var printHelper = function (c, separator, nil) {
        var carResult = pair_1["default"](c)
            ? pair_1["default"](car_1["default"](c))
                ? printHelper(car_1["default"](c), separator, nil)
                : !isempty_1["default"](car_1["default"](c)) ? car_1["default"](c).toString() : nil
            : "";
        var cdrResult = pair_1["default"](c)
            ? pair_1["default"](cdr_1["default"](c))
                ? printHelper(cdr_1["default"](c), separator, nil)
                : !isempty_1["default"](cdr_1["default"](c)) ? cdr_1["default"](c).toString() : nil
            : "";
        var newSeparator = carResult === "" || cdrResult === "" ? "" : separator;
        return ((typeof opts.prefix !== "undefined" ? opts.prefix : "(") +
            carResult +
            newSeparator +
            cdrResult +
            (typeof opts.suffix !== "undefined" ? opts.suffix : ")"));
    };
    return printHelper(c, typeof opts.separator !== "undefined" ? opts.separator : " . ", typeof opts.nil !== "undefined" ? opts.nil : "()");
};
exports["default"] = print;
