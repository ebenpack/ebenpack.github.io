/// <reference path="../cons.d.ts" />

import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Returns the value at the given index, or nil if the index exceeds the
 * length of the list.
 * @param  {number} idx
 * @param  {Cons} L
 * @return {boolean}
 */
const get = (idx: number, L: Cons): any =>
    isEmpty(L) ? L : idx === 0 ? car(L) : get(idx - 1, cdr(L));

export default get;
