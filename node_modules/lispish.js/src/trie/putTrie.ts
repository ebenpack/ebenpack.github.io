/// <reference path="../cons.d.ts" />

import print from "../cons/print";
import concat from "../list/concat";
import list from "../list/list";
import cdr from "../cons/cdr";
import alist from "../alist/alist";
import car from "../cons/car";
import get from "../alist/get";
import put from "../alist/put";
import push from "../list/push";
import isEmpty from "../cons/isempty";
import nil from "../cons/nil";

export default (T: Cons, name: Cons, namespace: Cons) => {
    const stringifyName = (name: Cons, namespace: Cons): string =>
        print(concat(concat(namespace, list(".")), name), {
            prefix: "",
            suffix: "",
            separator: ""
        });
    const helper = (
        T: Cons,
        name: Cons,
        namespace: Cons,
        fullName: Cons
    ): Cons =>
        isEmpty(cdr(name))
            ? isEmpty(T)
              ? alist(
                    car(name),
                    alist("_value", list(stringifyName(fullName, namespace)))
                )
              : isEmpty(get(car(name), T))
                ? put(
                      car(name),
                      alist("_value", list(stringifyName(fullName, namespace))),
                      T
                  )
                : put(
                      car(name),
                      put(
                          "_value",
                          push(
                              stringifyName(fullName, namespace),
                              get("_value", get(car(name), T))
                          ),
                          get(car(name), T)
                      ),
                      T
                  )
            : isEmpty(T)
              ? alist(car(name), helper(nil, cdr(name), namespace, fullName))
              : isEmpty(get(car(name), T))
                ? put(car(name), helper(nil, cdr(name), namespace, fullName), T)
                : put(
                      car(name),
                      helper(get(car(name), T), cdr(name), namespace, fullName),
                      T
                  );
    return isEmpty(name) ? T : helper(T, name, namespace, name);
};
