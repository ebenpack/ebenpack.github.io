import ConsType from "./ConsType";

/**
 * Returns a boolean indicating whether the given parameter is a cons pair.
 * @param  {*} c
 * @return {boolean}
 */

export default (c: any): boolean =>
    typeof c === "function" && c(3) === ConsType;
