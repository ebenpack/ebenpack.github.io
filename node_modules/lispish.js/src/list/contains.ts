/// <reference path="../cons.d.ts" />

import equal from "../cons/equal";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";

/**
 * Returns true if the specified value is equal to at least one element of the given list.
 * @param  {*} a
 * @param  {Cons} L
 * @return {Boolean}
 */
const contains = (a: any, L: Cons): boolean =>
    isEmpty(L) ? false : equal(car(L), a) ? true : contains(a, cdr(L));

export default contains;
