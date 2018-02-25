import cons from "../src/cons/cons";
import car from "../src/cons/car";
import cdr from "../src/cons/cdr";
import print from "../src/cons/print";
import equal from "../src/cons/equal";
import list from "../src/list/list";
import range from "../src/list/range";
import foldl from "../src/list/foldl";
import compose from "../src/fun/compose";
import apply from "../src/fun/apply";
import curry from "../src/fun/curry";
import Y from "../src/fun/Y";
import argsHelper from "../src/helpers/args";
import { assert } from "chai";
import * as jsc from "jsverify";

suite("fun", () => {
    let addOne = a => a + 1;
    let mulTwo = a => a * 2;
    let fiveAdd = (a, b, c, d, e) => a + b + c + d + e;
    var sixAdd, fourMul, sixMin, variadicAdd, fact, fib;
    setup(() => {
        variadicAdd = (...args) =>
            foldl((acc, val) => acc + val, 0, list(argsHelper(args)));
        fact = Y(fac => n => (n <= 2 ? n : n * fac(n - 1)));
        fib = Y(fibo => n => (n <= 1 ? n : fibo(n - 1) + fibo(n - 2)));
    });
    suite("fun", () => {
        test("curry", () => {
            var c1 = curry(fiveAdd);
            var c12 = c1(1)(2)(3)(4);
            var c5 = curry(variadicAdd, 4);
            var c52 = c5(1)(2)(3);

            assert.equal(c12(5), 15);
            assert.equal(c12(10), 20);
            assert.equal(c12(20), 30);

            assert.equal(c52(4), 10);
            assert.equal(c52(14), 20);
            assert.equal(c52(29), 35);
        });
        test("compose", () => {
            var c = compose(addOne, mulTwo);
            assert.equal(c(2), 5);
            assert.equal(c(3), 7);
            assert.equal(c(4), 9);
        });
        test("apply", () => {
            assert.equal(apply(variadicAdd, range(0, 6)), 15);
            assert.equal(apply(variadicAdd, range(-10, 11)), 0);
            assert.equal(apply(variadicAdd, range(0, 21, 2)), 110);
        });
        test("Y", () => {
            assert.equal(fact(5), 120);
            assert.equal(fact(4), 24);
            assert.equal(fact(3), 6);
            assert.equal(fib(4), 3);
            assert.equal(fib(5), 5);
            assert.equal(fib(6), 8);
            assert.equal(fib(7), 13);
            assert.equal(fib(8), 21);
            assert.equal(fib(9), 34);
        });
    });
});
