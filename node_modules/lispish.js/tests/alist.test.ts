import alist from "../src/alist/alist";
import get from "../src/alist/get";
import map from "../src/alist/map";
import print from "../src/alist/print";
import put from "../src/alist/put";
import cons from "../src/cons/cons";
import consEqual from "../src/cons/equal";
import equal from "../src/alist/equal";
import consPrint from "../src/cons/print";
import isEmpty from "../src/cons/isempty";
import { assert } from "chai";
import * as jsc from "jsverify";

suite("alist", () => {
    let testAList, testAListUpper;
    setup(() => {
        const KVPs = [
            ["foo", "bar"],
            ["baz", "qux"],
            ["quux", "quuz"],
            ["corge", "grault"],
            ["waldo", "fred"],
            ["plugh", "xyzzy"],
            ["ping", "pong"]
        ];
        testAList = KVPs.reduce(
            (acc, val) => put(val[0], val[1], acc),
            alist("thunk", "thud")
        );
        testAListUpper = KVPs.reduce(
            (acc, val) => put(val[0], val[1].toUpperCase(), acc),
            alist("thunk", "THUD")
        );
    });
    suite("get", () => {
        test("get", () => {
            assert.ok(get("foo", alist("foo", "bar")) === "bar");
            assert.ok(
                get("foo", put("foo", "baz", alist("foo", "bar"))) === "baz"
            );
            assert.ok(
                get("foo", put("baz", "qux", alist("foo", "bar"))) === "bar"
            );
            assert.ok(
                get("baz", put("baz", "qux", alist("foo", "bar"))) === "qux"
            );
            assert.ok(
                isEmpty(get("quux", put("baz", "qux", alist("foo", "bar"))))
            );
        });
    });
    suite("put", () => {
        test("put", () => {
            assert.ok(
                get("waldo", put("waldo", "jeffries", testAList)) === "jeffries"
            );
        });
    });
    suite("map", () => {
        test("map", () => {
            assert.ok(
                consEqual(
                    map((k, v) => v.toUpperCase(), testAList),
                    testAListUpper
                )
            );
            assert.ok(
                equal(map((k, v) => v.toUpperCase(), testAList), testAListUpper)
            );
        });
    });
});
