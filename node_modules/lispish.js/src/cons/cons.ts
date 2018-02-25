/// <reference path="../cons.d.ts" />
import ConsType from "./ConsType";

/**
 * Returns an immutable cons pair consisting
 * of a and b
 * @param  {*} car
 * @param  {*} cdr
 * @return {Cons}
 */
export default (car: any, cdr: any): Cons => (pick: number) =>
    pick === 0 ? car : pick === 1 ? cdr : ConsType;
