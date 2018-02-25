/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import listMap from "../list/map";

/**
 * Map over an association list.
 * @param  {Function} fn
 * @param  {alist} L
 * @return {list}
 */
const map = (fn: (key: any, val: any) => any, L: Cons): Cons =>
    listMap(v => cons(car(v), fn(car(v), cdr(v))), L);

export default map;
