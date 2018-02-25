/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Given a cons list, returns a new cons list
 * with the first item removed
 * @param  {Cons} L
 * @return {Cons}
 */
export default (L: Cons): Cons => (isEmpty(L) ? L : cdr(L));
