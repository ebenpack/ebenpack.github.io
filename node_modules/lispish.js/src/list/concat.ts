/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Returns a new list that is the result
 * of concatenating L2 onto the end of L1;
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
const concat = (L1: Cons, L2: Cons): Cons =>
    isEmpty(L1) ? L2 : cons(car(L1), concat(cdr(L1), L2));

export default concat;
