/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import length from "./length";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Given a list, returns a new, sorted list.
 * Optionally, a custom comparison function can be passed.
 * By default, ascending sort if performed.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {Cons}
 */
export default (fn: (a: any, b: any) => boolean, L: Cons): Cons => {
    const merge = (L1: Cons, L2: Cons, fn: (a: any, b: any) => boolean): Cons =>
        isEmpty(L1)
            ? L2
            : isEmpty(L2)
              ? L1
              : fn(car(L1), car(L2))
                ? cons(car(L1), merge(cdr(L1), L2, fn))
                : cons(car(L2), merge(L1, cdr(L2), fn));

    const split = (L: Cons, lo: number, hi: number): Cons => {
        const splitHelper = (
            L: Cons,
            lo: number,
            hi: number,
            curr: number
        ): Cons =>
            curr < lo
                ? splitHelper(cdr(L), lo, hi, curr + 1)
                : curr === hi
                  ? nil
                  : cons(car(L), splitHelper(cdr(L), lo, hi, curr + 1));
        return splitHelper(L, lo, hi, 0);
    };
    const msort = (
        L: Cons,
        fn: (a: any, b: any) => boolean,
        len: number
    ): Cons =>
        isEmpty(L) || isEmpty(cdr(L))
            ? L
            : merge(
                  msort(
                      split(L, 0, Math.floor(len / 2)),
                      fn,
                      Math.floor(len / 2)
                  ),
                  msort(
                      split(L, Math.floor(len / 2), len),
                      fn,
                      len - Math.floor(len / 2)
                  ),
                  fn
              );
    return msort(L, fn, length(L));
};
