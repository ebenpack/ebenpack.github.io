/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import car from "../cons/car";
import cdr from "../cons/cdr";
import list from "./list";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

/**
 * Given a cons list, returns a new list with the last item removed.
 * @param  {Cons} L
 * @return {Cons}
 */
const pop = (L: Cons): Cons =>
    isEmpty(L) || isEmpty(cdr(L)) ? nil : cons(car(L), pop(cdr(L)));

export default pop;
