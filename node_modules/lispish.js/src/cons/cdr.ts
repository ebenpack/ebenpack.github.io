/// <reference path="../cons.d.ts" />

/**
 * Returns the cdr of a cons
 * @param  {Cons} cons cons to be cdr'd
 * @return {*}      cdr value of the given cons
 */
export default (cons: Cons): any => cons(1);
