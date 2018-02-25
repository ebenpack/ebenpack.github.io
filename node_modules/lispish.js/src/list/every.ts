/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Returns true if every element in the list passes the
 * test implemented by the provided callback function.
 * The callback function is passed the current value
 * and the current index in the list.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {boolean}
 */
export default (
    fn: (currentValue: any, idx?: number) => boolean,
    L: Cons
): boolean => {
    const helper = (
        fn: (currentValue: any, idx?: number) => boolean,
        idx: number,
        L: Cons
    ): boolean =>
        isEmpty(L)
            ? true
            : !fn(car(L), idx) ? false : helper(fn, idx + 1, cdr(L));
    return helper(fn, 0, L);
};
