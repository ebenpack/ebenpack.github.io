/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import list from "./list";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the end.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
const push = (val: any, L: Cons): Cons =>
    isEmpty(L)
        ? cons(val, nil)
        : isEmpty(cdr(L))
          ? cons(car(L), cons(val, nil))
          : cons(car(L), push(val, cdr(L)));

export default push;
