/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import list from "../list/list";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Given two cons lists, returns a new cons list composed of
 * cons pairs consisting of positionally determined elements
 * from each of the given lists. The resulting list will only contain
 * as many elements as contained in the shorter of the two lists.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
const zip = (L1: Cons, L2: Cons): Cons =>
    isEmpty(L1) || isEmpty(L2)
        ? nil
        : isEmpty(cdr(L1)) || isEmpty(cdr(L2))
          ? cons(cons(car(L1), car(L2)), nil)
          : cons(cons(car(L1), car(L2)), zip(cdr(L1), cdr(L2)));

export default zip;
