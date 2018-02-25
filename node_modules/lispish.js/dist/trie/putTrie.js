"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var print_1 = require("../cons/print");
var concat_1 = require("../list/concat");
var list_1 = require("../list/list");
var cdr_1 = require("../cons/cdr");
var alist_1 = require("../alist/alist");
var car_1 = require("../cons/car");
var get_1 = require("../alist/get");
var put_1 = require("../alist/put");
var push_1 = require("../list/push");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
exports["default"] = (function (T, name, namespace) {
    var stringifyName = function (name, namespace) {
        return print_1["default"](concat_1["default"](concat_1["default"](namespace, list_1["default"](".")), name), {
            prefix: "",
            suffix: "",
            separator: ""
        });
    };
    var helper = function (T, name, namespace, fullName) {
        return isempty_1["default"](cdr_1["default"](name))
            ? isempty_1["default"](T)
                ? alist_1["default"](car_1["default"](name), alist_1["default"]("_value", list_1["default"](stringifyName(fullName, namespace))))
                : isempty_1["default"](get_1["default"](car_1["default"](name), T))
                    ? put_1["default"](car_1["default"](name), alist_1["default"]("_value", list_1["default"](stringifyName(fullName, namespace))), T)
                    : put_1["default"](car_1["default"](name), put_1["default"]("_value", push_1["default"](stringifyName(fullName, namespace), get_1["default"]("_value", get_1["default"](car_1["default"](name), T))), get_1["default"](car_1["default"](name), T)), T)
            : isempty_1["default"](T)
                ? alist_1["default"](car_1["default"](name), helper(nil_1["default"], cdr_1["default"](name), namespace, fullName))
                : isempty_1["default"](get_1["default"](car_1["default"](name), T))
                    ? put_1["default"](car_1["default"](name), helper(nil_1["default"], cdr_1["default"](name), namespace, fullName), T)
                    : put_1["default"](car_1["default"](name), helper(get_1["default"](car_1["default"](name), T), cdr_1["default"](name), namespace, fullName), T);
    };
    return isempty_1["default"](name) ? T : helper(T, name, namespace, name);
});
