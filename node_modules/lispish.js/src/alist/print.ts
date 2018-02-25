/// <reference path="../cons.d.ts" />

import car from "../cons/car";
import cdr from "../cons/cdr";
import pair from "../cons/pair";
import isEmpty from "../cons/isempty";

/**
 * Returns a string representation of the
 * given association list. Currently, some
 * assumptions are made about the given list.
 * Namely, that the values are either primitives or
 * nested association lists.
 * @param  {Cons} L
 * @return {string}
 */
export default (L: Cons): string => {
    const getIndent = (n: number): string => Array(n * 4).join(" ");

    const outerWrap = (L: Cons, indent: number): string =>
        "{\n" + helper(L, "", indent + 1) + "\n" + getIndent(indent) + "}";

    const helper = (L: Cons, spacer: string, indent: number): string =>
        isEmpty(L)
            ? ""
            : pair(cdr(car(L)))
              ? spacer +
                getIndent(indent) +
                car(car(L)) +
                ": " +
                outerWrap(cdr(car(L)), indent) +
                helper(cdr(L), ",\n", indent)
              : spacer +
                getIndent(indent) +
                car(car(L)) +
                ": " +
                cdr(car(L)) +
                helper(cdr(L), ",\n", indent);

    return outerWrap(L, 0);
};
