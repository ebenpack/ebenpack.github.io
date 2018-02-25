/// <reference path="../cons.d.ts" />

import car from "../cons/car";
import cdr from "../cons/cdr";
import flatten from "../list/flatten";
import get from "../alist/get";
import map from "../alist/map";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

export default (T: Cons, str: Cons): Cons => {
    const getLeaves = (T: Cons, list: Cons): Cons =>
        isEmpty(T)
            ? list
            : map(
                  (key, val) => (key === "_value" ? val : getLeaves(val, list)),
                  T
              );

    const descendToNode = (T: Cons, word: Cons) =>
        isEmpty(T)
            ? nil
            : isEmpty(word)
              ? nil
              : isEmpty(cdr(word))
                ? get(car(word), T)
                : descendToNode(get(car(word), T), cdr(word));

    return flatten(getLeaves(descendToNode(T, str), nil));
};
