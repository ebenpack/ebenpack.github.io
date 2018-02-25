/// <reference path="../cons.d.ts" />

import cons from "../cons/cons";
import args from "../helpers/args";
import nil from "../cons/nil";

/**
 * Returns a cons list constructed from the given parameters.
 * @return {Cons}
 */
export default (...outerArgs: any[]): Cons => {
    const helper = (args: any[]): Cons =>
        args.length === 0
            ? nil
            : Array.isArray(args[0])
              ? cons(helper(args[0]), helper(args.slice(1)))
              : cons(args[0], helper(args.slice(1)));

    return outerArgs.length === 1 && Array.isArray(outerArgs[0])
        ? helper(outerArgs[0])
        : helper(args(outerArgs));
};
