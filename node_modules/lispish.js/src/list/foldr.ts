/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Applies the given callback function against an accumulator
 * and each value of the cons list (from right-to-left) in order
 * to reduce it to a single value.
 * @param  {Function} fn
 * @param  {*}   acc
 * @param  {Cons} L
 * @return {Cons}
 */
// TODO: make foldl and folr
const foldr = (fn: (val: any, acc: any) => any, acc: any, L: Cons) =>
    isEmpty(L)
        ? acc
        : isEmpty(cdr(L))
          ? fn(car(L), acc)
          : fn(car(L), foldr(fn, acc, cdr(L)));

export default foldr;
