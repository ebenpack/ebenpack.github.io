/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";

/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the front of the list.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
export default (val: any, L: Cons): Cons => cons(val, L);
