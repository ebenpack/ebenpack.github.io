import {
    cons,
    car,
    cdr,
    caar,
    cadr,
    cdar,
    cddr,
    caaar,
    caadr,
    cadar,
    caddr,
    cdaar,
    cdadr,
    cddar,
    cdddr,
    caaaar,
    caaadr,
    caadar,
    caaddr,
    cadaar,
    cadadr,
    caddar,
    cadddr,
    cdaaar,
    cdaadr,
    cdadar,
    cdaddr,
    cddaar,
    cddadr,
    cdddar,
    cddddr,
    print,
    equal,
    pair,
    isEmpty,
    nil
} from "../src/cons/main";
import list from "../src/list/list";
import map from "../src/list/map";
import range from "../src/list/range";
import { assert } from "chai";
import * as jsc from "jsverify";

suite("cons", () => {
    var simpleCons, doubleCons, linkedList, tree, deepTree, makeTree;
    setup(() => {
        simpleCons = cons(1, 2);
        doubleCons = cons(cons(1, 2), cons(3, 4));
        linkedList = cons(1, cons(2, cons(3, cons(4, cons(5, nil)))));
        tree = cons(
            cons(cons(1, nil), cons(2, nil)),
            cons(cons(3, nil), cons(4, nil))
        );
        makeTree = depth =>
            depth === 0
                ? cons(Math.random(), Math.random())
                : cons(makeTree(depth - 1), makeTree(depth - 1));
        deepTree = makeTree(8);
    });
    suite("cons", () => {
        test("cons", () => {
            assert.ok(pair(simpleCons));
            assert.ok(pair(doubleCons));
            assert.equal(car(simpleCons), 1);
            assert.equal(cdr(simpleCons), 2);
            assert.ok(pair(car(doubleCons)));
            assert.ok(pair(cdr(doubleCons)));
            assert.equal(car(car(doubleCons)), 1);
            assert.equal(cdr(car(doubleCons)), 2);
            assert.equal(car(cdr(doubleCons)), 3);
            assert.equal(cdr(cdr(doubleCons)), 4);
        });
    });
    suite("pair", () => {
        test("pair", () => {
            assert.ok(pair(simpleCons));
            assert.ok(pair(doubleCons));
            assert.ok(pair(car(doubleCons)));
            assert.ok(pair(cdr(doubleCons)));
            assert.ok(pair(linkedList));
            assert.ok(pair(tree));
            assert.ok(!pair(1));
            assert.ok(!pair("foo"));
            assert.ok(!pair(car(simpleCons)));
        });
    });
    suite("equal", () => {
        test("equal", () => {
            assert.ok(equal(simpleCons, cons(1, 2)));
            assert.ok(equal(doubleCons, cons(cons(1, 2), cons(3, 4))));
            assert.ok(!equal(simpleCons, 2));
            assert.ok(!equal(cons(cons(1, 2), cons(1, 2)), cons(1, 2)));
            assert.ok(!equal(cons(1, cons(1, 2)), cons(1, 2)));
        });
    });
    suite("car/cdr", () => {
        test("car/cdr", () => {
            assert.equal(car(linkedList), 1);
            assert.equal(cadr(linkedList), 2);
            assert.equal(caddr(linkedList), 3);
            assert.equal(cadddr(linkedList), 4);
            assert.ok(pair(cdr(linkedList)));

            assert.equal(caaar(tree), 1);
            assert.equal(cadar(tree), 2);
            assert.equal(caadr(tree), 3);
            assert.equal(caddr(tree), 4);

            assert.equal(caaar(tree), car(car(car(tree))));
            assert.equal(cadar(tree), car(cdr(car(tree))));
            assert.equal(caadr(tree), car(car(cdr(tree))));
            assert.equal(caddr(tree), car(cdr(cdr(tree))));

            assert.ok(equal(caar(deepTree), car(car(deepTree))));
            assert.ok(equal(cadr(deepTree), car(cdr(deepTree))));
            assert.ok(equal(cdar(deepTree), cdr(car(deepTree))));
            assert.ok(equal(cddr(deepTree), cdr(cdr(deepTree))));
            assert.ok(equal(caaar(deepTree), car(car(car(deepTree)))));
            assert.ok(equal(caadr(deepTree), car(car(cdr(deepTree)))));
            assert.ok(equal(cadar(deepTree), car(cdr(car(deepTree)))));
            assert.ok(equal(caddr(deepTree), car(cdr(cdr(deepTree)))));
            assert.ok(equal(cdaar(deepTree), cdr(car(car(deepTree)))));
            assert.ok(equal(cdadr(deepTree), cdr(car(cdr(deepTree)))));
            assert.ok(equal(cddar(deepTree), cdr(cdr(car(deepTree)))));
            assert.ok(equal(cdddr(deepTree), cdr(cdr(cdr(deepTree)))));
            assert.ok(equal(caaaar(deepTree), car(car(car(car(deepTree))))));
            assert.ok(equal(caaadr(deepTree), car(car(car(cdr(deepTree))))));
            assert.ok(equal(caadar(deepTree), car(car(cdr(car(deepTree))))));
            assert.ok(equal(caaddr(deepTree), car(car(cdr(cdr(deepTree))))));
            assert.ok(equal(cadaar(deepTree), car(cdr(car(car(deepTree))))));
            assert.ok(equal(cadadr(deepTree), car(cdr(car(cdr(deepTree))))));
            assert.ok(equal(caddar(deepTree), car(cdr(cdr(car(deepTree))))));
            assert.ok(equal(cadddr(deepTree), car(cdr(cdr(cdr(deepTree))))));
            assert.ok(equal(cdaaar(deepTree), cdr(car(car(car(deepTree))))));
            assert.ok(equal(cdaadr(deepTree), cdr(car(car(cdr(deepTree))))));
            assert.ok(equal(cdadar(deepTree), cdr(car(cdr(car(deepTree))))));
            assert.ok(equal(cdaddr(deepTree), cdr(car(cdr(cdr(deepTree))))));
            assert.ok(equal(cddaar(deepTree), cdr(cdr(car(car(deepTree))))));
            assert.ok(equal(cddadr(deepTree), cdr(cdr(car(cdr(deepTree))))));
            assert.ok(equal(cdddar(deepTree), cdr(cdr(cdr(car(deepTree))))));
            assert.ok(equal(cddddr(deepTree), cdr(cdr(cdr(cdr(deepTree))))));
        });
    });

    suite("print", () => {
        test("print", () => {
            assert.equal(
                "<1!2>",
                print(simpleCons, {
                    separator: "!",
                    prefix: "<",
                    suffix: ">",
                    nil: ""
                })
            );
            assert.equal(
                "[[1~2]~[3~4]]",
                print(doubleCons, {
                    separator: "~",
                    prefix: "[",
                    suffix: "]",
                    nil: ""
                })
            );
            assert.equal(
                "1.2.3.4.5",
                print(linkedList, {
                    separator: ".",
                    prefix: "",
                    suffix: "",
                    nil: ""
                })
            );
            assert.equal("(1 . (2 . (3 . (4 . (5 . ())))))", print(linkedList));
            assert.equal(
                "(((1 . ()) . (2 . ())) . ((3 . ()) . (4 . ())))",
                print(tree)
            );
            assert.equal("(1 . ())", print(cons(1, nil)));
            assert.equal("(() . 1)", print(cons(nil, 1)));
            assert.equal("()", print(nil));
        });
    });
});
