/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Returns the value of the last item in a cons list.
 * @param  {Cons} L
 * @return {*}
 */
const peek = (L: Cons): any =>
    isEmpty(L) ? L : isEmpty(cdr(L)) ? car(L) : peek(cdr(L));

export default peek;
