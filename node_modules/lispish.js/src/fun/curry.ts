/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import apply from "./apply";
import nil from "../cons/nil";

/**
 * Curry the given function. If the number of expected parameters
 * is passed explicitly, this will be used. Otherwise, the arity of the
 * function passed in will be used.
 * @param  {Function} fn
 * @param  {integer}  arity
 * @return {Function}
 */
export default (fn: (...a: any[]) => any, arity?: number) => {
    const helper = (fn: (...a: any[]) => any, arity: number, args: Cons): any =>
        arity === 0
            ? apply(fn, args)
            : arg => helper(fn, arity - 1, cons(arg, args));
    return typeof arity === "undefined"
        ? helper(fn, fn.length, nil)
        : helper(fn, arity, nil);
};
