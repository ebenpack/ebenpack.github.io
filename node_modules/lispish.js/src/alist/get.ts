/// <reference path="../cons.d.ts" />

import car from "../cons/car";
import cdr from "../cons/cdr";
import equal from "../cons/equal";
import isEmpty from "../cons/isempty";

/**
 * Finds and returns the first key-value pair
 * which has a key matching that passed in.
 * Returns false if no match is found.
 * @param  {*} key
 * @param  {Cons} L
 * @return {Cons}
 */
const get = (key: any, L: Cons): any =>
    isEmpty(L) ? L : equal(car(car(L)), key) ? cdr(car(L)) : get(key, cdr(L));

export default get;
