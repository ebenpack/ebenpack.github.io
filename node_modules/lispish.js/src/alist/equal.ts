/// <reference path="../cons.d.ts" />

import pair from "../cons/pair";
import consEqual from "../cons/equal";
import car from "../cons/car";
import cdr from "../cons/cdr";
import every from "../list/every";
import get from "./get";

/**
 * Compares two association lists for equality. Two association
 * lists are considered equal if all the key-value-pairs from the
 * first list are in the second, and vice-versa. The ordering and
 * relative positions of these KVPs are irrelevant for these purposes.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
export default (L1: Cons, L2: Cons): boolean =>
    every(val => pair(val) && consEqual(get(car(val), L2), cdr(val)), L1) &&
    every(val => pair(val) && consEqual(get(car(val), L1), cdr(val)), L2);
