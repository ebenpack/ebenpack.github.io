/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Returns a new cons list with the results of calling the provided
 * function on every element.
 * @param  {Function} fn callback function
 * @param  {Cons} L  cons list to be mapped
 * @return {Cons}
 */
const map = (fn: (currentValue: any) => any, L: Cons): Cons =>
    isEmpty(L)
        ? L
        : isEmpty(cdr(L))
          ? cons(fn(car(L)), nil)
          : cons(fn(car(L)), map(fn, cdr(L)));

export default map;
