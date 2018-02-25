/// <reference path="../cons.d.ts" />

import pair from "./pair";
import cdr from "./cdr";
import car from "./car";

/**
 * Returns a boolean indicating whether to two given parameters
 * are equal. If the paramters are cons pairs, equality is determined
 * by the equality of their members.
 * @param  {*} a
 * @param  {*} b
 * @return {boolean}
 */
const equal = (a: any, b: any): boolean =>
    // If a is a pair and b is not (or vice versa),
    // these cannot be equal.
    pair(a) !== pair(b)
        ? false
        : // If car(a) is a pair and car(b) is not (or vice versa),
          // these cannot be equal.
          (pair(a) && pair(car(a))) !== (pair(b) && pair(car(b)))
          ? false
          : // If cdr(a) is a pair and cdr(b) is not (or vice versa),
            // these cannot be equal.
            (pair(a) && pair(cdr(a))) !== (pair(b) && pair(cdr(b)))
            ? false
            : // If a is a pair (which, if we have reached this point,
              // means that b must also be a pair), recurse.
              // Otherwise, test the equality of a and b directly.
              pair(a)
              ? equal(car(a), car(b)) && equal(cdr(a), cdr(b))
              : a === b;

export default equal;
