/// <reference path="../cons.d.ts" />

import nil from "./nil";

/**
 * Returns a boolean indicating whether the given parameter
 * is the empty list.
 * @param  {*} c
 * @return {boolean}
 */
export default (c: any): boolean => c === nil;
