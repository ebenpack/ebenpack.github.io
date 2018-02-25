/// <reference path="../cons.d.ts" />

/**
 * Returns the car of a cons
 * @param  {Cons} cons cons to be car'd
 * @return {*}      car value of the given cons
 */
export default (cons: Cons): any => cons(0);
