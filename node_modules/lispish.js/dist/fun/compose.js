"use strict";
exports.__esModule = true;
/**
 * Compose functions a and b
 * @param  {Function} a Outer function
 * @param  {Function} b Inner function
 * @return {Function}   Composed function
 */
exports["default"] = (function (a, b) { return function (c) { return a(b(c)); }; });
