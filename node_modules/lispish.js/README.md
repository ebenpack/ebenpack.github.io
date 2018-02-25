# lisp-ish.js

lisp-ish is a pure-JS implementation of a number of concepts I think I once heard someone say were associated with lisp, maybe, as well as some other concepts that might not even have anything to do with lisp, perhaps. The only compound type in lisp-ish (at least currently), is the immutable cons pair, and these are used as the foundation to build other, more complex data structures. The intention is that all functions in lisp-ish will be 100% pure. The primary method of name binding will be via argument passing, but this constraint may not be rigorously enforced for the sake of simplicity, especially w/r/t recursion and helper functions.

## *warning!*

If you are seriously considering using this library for anything even remotely important, please just don't. Since it entirely eschews looping in favor of recursion, it will be very possible to exceed the call stack depth, and will likely just generally have poor memory and time performance.

## cons
The basis of lisp-ish is the cons pair, which here is completely immutable. The `cons(a,b)` function returns a new cons pair composed of the `a` and `b` arguments in the car and cdr positions, respectively. car and cdr elements can be accessed with the `car(cons)` and `cdr(cons)` functions, and nested cons can be deeply accessed via a number of convenience functions (e.g. `caaar(cons)`, `cadadr(cons)`, etc.). conses can be deeply compared with the `equals(cons1, cons2)` function, and they can be converted to a formatted string with the `print(cons)` function. Also, the `pair(cons)` function can be used to determine if a given argument is a cons pair.

## list
Lists are just nested cons pairs with the constraint that every cons's car element is a value (which can itself be a cons pair), and its cdr element is either a cons, or nil (for the final element of the list). In other words, this is a simple linked list. Lists have a number of helper functions, namely:
* `concat(L1, L2)` - Returns a new list composed of the concatenation of L1 and L2.
* `dequeue(L)` - Returns a new cons list with the first item removed.
* `enqueue(val, L)` - Returns a new cons list with the given value appended to the front of the list.
* `every(fn, L)` - Returns `true` if the given function evaluates to `true` for every item in the list.
* `filter(fn, L)` - Returns a new list composed only of the list items for which the predicate function returns `true`
* `length(L)` - Returns the length of a given list.
* `list(args...)` - Returns a list based on the arguments array, or an explicitly passed array.
* `map(fn, L)` - Returns a new cons list with the results of calling the provided function on every element.
* `peek(L)` - Returns the value of the last item in a list.
* `pop(L)` - Returns a new list with the last item removed.
* `push(val, L)` - Returns a new cons list with the value appended to the end.
* `range(m, n, step)` - Returns a range list from m to n, with each item incremented by step.
* `foldl(fn, acc, L)` - Applies the given callback function against an accumulator and each value of the list (from left-to-right) in order to reduce it to a single value.
* `reverse(L)` - Returns a reversed list.
* `slice(m, n, L)` - Returns a new list 'slice' from m to n.
* `some(fn, L)` - Returns `true` if the callback function return `true` for any item in the list.
* `sort(fn, L)` - Returns a sorted list. A custom comparison function can be passed.
* `zip(L1, L2)` - Returns a list where each element at a given index is a cons pair composed of the elements from each list at that index. The list returned will be the length of the shorted of the two lists passed in.

## fun
Some functional functions designed to help work with functions.
* `apply(fn, args)` - Call the given function with the list of arguments supplied.
* `compose(a, b)` - Returns a function which is the composition of `a` and `b`.
* `curry(fn, arity)` - Returns a fully curried function. Also known as Schönfinkelisation.
