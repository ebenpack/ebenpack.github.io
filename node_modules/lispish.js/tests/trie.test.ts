import getTrie from "../src/trie/getTrie";
import putTrie from "../src/trie/putTrie";
import list from "../src/list/list";
import contains from "../src/list/contains";
import isEmpty from "../src/cons/isempty";
import nil from "../src/cons/nil";
import { assert } from "chai";
import * as jsc from "jsverify";

suite("trie", () => {
    suite("getTrie", () => {
        test("dequeue", () => {
            assert.ok(isEmpty(getTrie(nil, list("foo".split(""), list()))));
        });
        jsc.property("getTrie", "array string", arr => {
            const T = arr.reduce(
                (acc, val) => putTrie(acc, list(val.split("")), list()),
                nil
            );
            return arr.every(word =>
                word
                    .split("")
                    .every(
                        (char, idx, word) =>
                            idx === 0
                                ? isEmpty(getTrie(T, list(word.slice(0, idx))))
                                : !isEmpty(getTrie(T, list(word.slice(0, idx))))
                    )
            );
        });
        jsc.property("getTrie", "array string", arr => {
            const T = arr.reduce(
                (acc, val) =>
                    val
                        .split("")
                        .reduce(
                            (acc, val, idx, arr) =>
                                putTrie(acc, list(arr.slice(-idx)), list()),
                            acc
                        ),
                nil
            );
            return arr.every(word =>
                word
                    .split("")
                    .every(
                        (char, idx, word) =>
                            idx === 0
                                ? isEmpty(getTrie(T, list(word.slice(0, idx))))
                                : !isEmpty(getTrie(T, list(word.slice(0, idx))))
                    )
            );
        });
    });
});
