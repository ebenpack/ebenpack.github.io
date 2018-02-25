import * as _cons from "./cons/main";

export const cons = _cons;

// helpers
import args from "./helpers/args";
export const helpers = { args };

// list
import _list from "./list/list";
import concat from "./list/concat";
import contains from "./list/contains";
import dequeue from "./list/dequeue";
import enqueue from "./list/enqueue";
import every from "./list/every";
import filter from "./list/filter";
import flatten from "./list/flatten";
import foldl from "./list/foldl";
import foldr from "./list/foldr";
import get from "./list/get";
import length from "./list/length";
import map from "./list/map";
import peek from "./list/peek";
import pop from "./list/pop";
import push from "./list/push";
import range from "./list/range";
import reverse from "./list/reverse";
import slice from "./list/slice";
import some from "./list/some";
import sort from "./list/sort";
import zip from "./list/zip";

export const list = {
    concat,
    contains,
    dequeue,
    enqueue,
    every,
    filter,
    flatten,
    foldl,
    foldr,
    get,
    length,
    list: _list,
    map,
    peek,
    pop,
    push,
    range,
    reverse,
    slice,
    some,
    sort,
    zip
};
// alist
import _alist from "./alist/alist";
import alistEqual from "./alist/equal";
import alistGet from "./alist/get";
import alistMap from "./alist/map";
import alistPrint from "./alist/print";
import put from "./alist/put";

export const alist = {
    alist: _alist,
    alistMap,
    alistPrint,
    equal: alistEqual,
    get: alistGet,
    put
};

// fun
import apply from "./fun/apply";
import compose from "./fun/compose";
import curry from "./fun/curry";
import Y from "./fun/Y";

export const fun = {
    apply,
    compose,
    curry,
    Y
};

import getTrie from "./trie/getTrie";
import putTrie from "./trie/putTrie";

export const trie = {
    getTrie,
    putTrie
};
