/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import isEmpty from "../cons/isempty";
import get from "./get";

/**
 * Returns a new alist. If the given key
 * pair existed in the original list, the
 * value will be replaced with the one privded. Otherwise
 * the key-value pair will be added.
 * @param  {*} key
 * @param  {*} value
 * @param  {Cons} L
 * @return {Cons}
 */
export default (key: any, value: any, L: Cons): Cons => {
    const helper = (L: Cons, key: any, value: any): Cons =>
        car(car(L)) === key
            ? cons(cons(key, value), cdr(L))
            : cons(car(L), helper(cdr(L), key, value));
    return isEmpty(get(key, L))
        ? cons(cons(key, value), L)
        : helper(L, key, value);
};
