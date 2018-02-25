/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import length from "./length";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Given a list, returns a new list 'slice'.
 * If n is not passed in, the slice will be from m to
 * the end of the original list. If n is passed in,
 * then the slice will be from m to n. Invalid slices 
 * (e.g. where m is larger than n) will return nil.
 * @param  {Cons} L
 * @param  {integer} m
 * @param  {(integer|undefined)} n
 * @return {Cons}
 */
export default (L: Cons, m: number, n?: number): Cons => {
    const sliceHelper = (L: Cons, m: number, n: number, current: number) =>
        current === n || m >= n
            ? nil
            : isEmpty(L)
              ? L
              : current >= m
                ? cons(car(L), sliceHelper(cdr(L), m, n, current + 1))
                : sliceHelper(cdr(L), m, n, current + 1);

    return typeof n === "undefined"
        ? sliceHelper(L, m, length(L), 0)
        : sliceHelper(L, m, n, 0);
};
