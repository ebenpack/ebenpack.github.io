/// <reference path="../cons.d.ts" />

import apply from "./apply";
import args from "../helpers/args";
import list from "../list/list";

export default (f: (h: any) => any): any =>
    f(
        (h => (...rest: any[]) =>
            apply(f(h(h)), list(args(rest))))(h => (...rest: any[]) =>
            apply(f(h(h)), list(args(rest)))
        )
    );
