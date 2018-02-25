/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import nil from "../cons/nil";

/**
 * Returns a range list from n to m.
 * @param  {integer} n If m in not passed, the end of the range (exlusive),
 * otherwise the start of the range (inclusive).
 * @param  {integer} m If passed, the end of the range (exlusive).
 * @param  {(integer|undefined)} step steps to take between each item in the range. Defaults to 1.
 * @return {Cons} List from n to m.
 */
export default (m: number, n?: number, step?: number): Cons => {
    const abs = (n: number): number => (n < 0 ? -n : n);
    const rangeHelper = (m: number, n: number, step: number): Cons =>
        m === n
            ? nil
            : goodStep(m, n, step)
              ? cons(m, rangeHelper(m + step, n, step))
              : cons(m, nil);

    const goodStep = (start: number, stop: number, step: number): boolean =>
        abs(stop - start) > abs(stop - (start + step));

    const stepHelper = (m: number, step: number, n?: number): Cons =>
        typeof n === "undefined"
            ? goodStep(0, m, step) ? rangeHelper(0, m, step) : nil
            : goodStep(m, n, step) ? rangeHelper(m, n, step) : nil;

    return typeof step === "undefined"
        ? stepHelper(m, 1, n)
        : stepHelper(m, step, n);
};
