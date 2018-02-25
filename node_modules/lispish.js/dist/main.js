"use strict";
exports.__esModule = true;
var _cons = require("./cons/main");
exports.cons = _cons;
// helpers
var args_1 = require("./helpers/args");
exports.helpers = { args: args_1["default"] };
// list
var list_1 = require("./list/list");
var concat_1 = require("./list/concat");
var contains_1 = require("./list/contains");
var dequeue_1 = require("./list/dequeue");
var enqueue_1 = require("./list/enqueue");
var every_1 = require("./list/every");
var filter_1 = require("./list/filter");
var flatten_1 = require("./list/flatten");
var foldl_1 = require("./list/foldl");
var foldr_1 = require("./list/foldr");
var get_1 = require("./list/get");
var length_1 = require("./list/length");
var map_1 = require("./list/map");
var peek_1 = require("./list/peek");
var pop_1 = require("./list/pop");
var push_1 = require("./list/push");
var range_1 = require("./list/range");
var reverse_1 = require("./list/reverse");
var slice_1 = require("./list/slice");
var some_1 = require("./list/some");
var sort_1 = require("./list/sort");
var zip_1 = require("./list/zip");
exports.list = {
    concat: concat_1["default"],
    contains: contains_1["default"],
    dequeue: dequeue_1["default"],
    enqueue: enqueue_1["default"],
    every: every_1["default"],
    filter: filter_1["default"],
    flatten: flatten_1["default"],
    foldl: foldl_1["default"],
    foldr: foldr_1["default"],
    get: get_1["default"],
    length: length_1["default"],
    list: list_1["default"],
    map: map_1["default"],
    peek: peek_1["default"],
    pop: pop_1["default"],
    push: push_1["default"],
    range: range_1["default"],
    reverse: reverse_1["default"],
    slice: slice_1["default"],
    some: some_1["default"],
    sort: sort_1["default"],
    zip: zip_1["default"]
};
// alist
var alist_1 = require("./alist/alist");
var equal_1 = require("./alist/equal");
var get_2 = require("./alist/get");
var map_2 = require("./alist/map");
var print_1 = require("./alist/print");
var put_1 = require("./alist/put");
exports.alist = {
    alist: alist_1["default"],
    alistMap: map_2["default"],
    alistPrint: print_1["default"],
    equal: equal_1["default"],
    get: get_2["default"],
    put: put_1["default"]
};
// fun
var apply_1 = require("./fun/apply");
var compose_1 = require("./fun/compose");
var curry_1 = require("./fun/curry");
var Y_1 = require("./fun/Y");
exports.fun = {
    apply: apply_1["default"],
    compose: compose_1["default"],
    curry: curry_1["default"],
    Y: Y_1["default"]
};
var getTrie_1 = require("./trie/getTrie");
var putTrie_1 = require("./trie/putTrie");
exports.trie = {
    getTrie: getTrie_1["default"],
    putTrie: putTrie_1["default"]
};
