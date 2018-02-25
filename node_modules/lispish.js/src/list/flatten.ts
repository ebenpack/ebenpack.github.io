/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import pair from "../cons/pair";
import concat from "./concat";
import isEmpty from "../cons/isempty";

/**
 * Flatten a list.
 * @return {Cons}
 */
const flatten = (L: Cons): Cons =>
    isEmpty(L)
        ? L
        : !pair(car(L))
          ? cons(car(L), flatten(cdr(L)))
          : concat(flatten(car(L)), flatten(cdr(L)));

export default flatten;
