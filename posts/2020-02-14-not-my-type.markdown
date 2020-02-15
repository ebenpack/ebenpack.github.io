---
title: "Not My Type: A Highly Opinionated and Incomplete Journey Through the Type Systems of Several Programming Languages"
tags: Type Theory, Idris, Python, JavaScript, Haskell
slug: not-my-type
published: 2020-02-14 14:39:00
author: ebenpack
description: A high-level overview of the type systems of several programming languages
---

*Wherein I will gently and briefly guide the reader through certain high-level aspects of the type systems of several programming languages, with the intent to demonstrate that a sufficiently strong and expressive type system can be a powerful tool not only for proving the correctness of our programs, but also for assisting and guiding us in the process of the design and implementation of the programs that we write.*

<!--more-->

## What even is a type system?

Informally, programming language type systems provide methods of categorizing values in programs, as well as methods for enforcing rules for how these values can, or cannot, be operated upon.

In our programs, we have values (terms). These can be simple, primitive values, like `1729`, or `True`, or they can be complex values composed of different compound, ad-hoc values of our own designs, such as a list of people, or a dictionary mapping the name of an author to the list of books that they have written. Our programs will also define operations on these values, such as integer addition, logical disjunction on boolean values, or sorting a list of people by their age.

Type systems allow us to group these values into categories, and to impose certain constraints on how these values can interact, and on how they may be used in our operations. The purpose of a type system is to help us identify certain kinds of issues (type errors) in our programs, in order to help us identify and eliminate errors that would have otherwise have arisen at runtime.

In very handwavy terms, we will call the groupings of these values into sets "types". E.g. `{"", "foo", "bar"}` is a subset of the set of all values that inhabit the type `String`, whereas `{True, False}` are the totality of the values that inhabit the type `Bool`.

Continuing on with the handwavy and incorrect analogy to set theory, we have operations, or functions, which we can perform on the values of our types. If we squint (and much more squinting is required for some languages than for others), we can think of the functions in our code in set-theoretic terms. A function will have a domain (the set of inputs), and a codomain (the set of outputs). 

```{=html}
<figure>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="799px"
    height="540px" viewBox="-0.5 -0.5 799 550">
    <defs />
    <g>
        <ellipse cx="165" cy="294" rx="165" ry="245" fill-opacity="0.5" fill="#D7ECFF" stroke="#A4B9CC"
            stroke-opacity="0.5" pointer-events="all" />
        <rect x="155" y="150" width="20" height="20" fill="#ff6666" stroke="#b85450" pointer-events="all" />
        <rect x="155" y="284" width="20" height="20" fill="#ff6666" stroke="#b85450" pointer-events="all" />
        <rect x="155" y="420" width="20" height="20" fill="#ff6666" stroke="#b85450" pointer-events="all" />
        <rect x="130" y="0" width="80" height="30" fill="none" stroke="none" pointer-events="all" />
        <g transform="translate(-0.5 -0.5)">
            <text x="170" y="21" fill="#000000" font-family="Helvetica" font-size="20px"
                    text-anchor="middle">Input</text>
        </g>
        <ellipse cx="633" cy="294" rx="165" ry="245" fill-opacity="0.5" fill="#D2FFD8" stroke="#82b366"
            stroke-opacity="0.5" pointer-events="all" />
        <rect x="623" y="150" width="20" height="20" fill="#ff6666" stroke="#b85450" pointer-events="all" />
        <rect x="623" y="420" width="20" height="20" fill="#ff6666" stroke="#b85450" pointer-events="all" />
        <rect x="598" y="0" width="80" height="30" fill="none" stroke="none" pointer-events="all" />
        <g transform="translate(-0.5 -0.5)"><text x="638" y="21" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">Output</text>
        </g>
        <path d="M 175 160 Q 448 110 616.88 158.25" fill="none" stroke="#000000" stroke-miterlimit="10"
            pointer-events="stroke" />
        <path d="M 621.93 159.69 L 614.23 161.14 L 616.88 158.25 L 616.16 154.4 Z" fill="#000000" stroke="#000000"
            stroke-miterlimit="10" pointer-events="all" />
        <path d="M 175 430 Q 398 640 628.15 444.13" fill="none" stroke="#000000" stroke-miterlimit="10"
            pointer-events="stroke" />
        <path d="M 632.15 440.72 L 629.09 447.93 L 628.15 444.13 L 624.55 442.6 Z" fill="#000000" stroke="#000000"
            stroke-miterlimit="10" pointer-events="all" />
        <path d="M 175 294 Q 388 160 628.63 415.37" fill="none" stroke="#000000" stroke-miterlimit="10"
            pointer-events="stroke" />
        <path d="M 632.23 419.19 L 624.89 416.49 L 628.63 415.37 L 629.98 411.69 Z" fill="#000000" stroke="#000000"
            stroke-miterlimit="10" pointer-events="all" />

        <text x="165" y="140" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">A</text>
        <text x="165" y="275" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">B</text>
        <text x="165" y="410" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">C</text>

        <text x="633" y="140" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">1</text>
        <text x="633" y="410" fill="#000000" font-family="Helvetica" font-size="20px"
                text-anchor="middle">3</text>
    </g>
</svg>
<figcaption>Diagram of a function, with domain Input={A, B, C} and codomain Output={1, 3}</figcaption>
</figure>
```

Take for example the function `add`, which is a binary function that accepts two numbers, and returns a number. Here the domain is the set of all 2-tuples of numbers, and the codomain is the set of all numbers.

## Dynamic typing

In many dynamically typed language, values will carry information about their type around with them, and operations will check these types at runtime.

```{.python .numberLines}
def not(b : bool) -> bool:
    if b == True:
        return False
    if b == False:
        return True
```

Here we have defined a unary function whose domain is `bool`, and whose codomain is also `bool`.

Using the example above, in a dynamically typed language the type hints imply that the function should be passed a boolean value, and the function will return a boolean value. We can think of this as a contract between the program and the programmer. If you as a programmer provide a boolean value, this function will provide you back with a boolean value.

However, in dynamically typed languages these contracts are often only very loosely binding, if at all. In some cases, it can be literally impossible to determine what type a function will return when called with a particular value. Even under less dire circumstances, it will still be the programmer's responsibility to ensure that any implied contract is not broken when calling a function.

For example, in the function shown above, it is the programmer's responsibility to pass a boolean, and to only use the returned value as a boolean (and not as if it's a string, or an integer). The language, however, will not prevent us from passing to this function a string, or an integer, or from trying to perform numerical or string operations on the result. In fact, the language won't even prevent us (until it is too late!) from calling this function without any arguments at all, even though a single argument is expected.

When the user breaks a contract for operations such as these, in a dynamically typed language this can lead to unexpected values propagating throughout your program (perhaps only to be discovered far from their true origin), or to runtime exceptions, or to other undesirable behavior. Many will be familiar with errors such as these:
    
```
AttributeError: 'Foo' object has no attribute 'bar'
```

or:

```
TypeError: foo.bar is not a function
```

These errors arise at runtime, because something of one type was used as if it were another type.

## Weak typing

Returning to the example of the `add` function, we can write this function in JavaScript like so:

```{.javascript .numberLines}
function add(m, n) {
    return m + n;
}
```

JavaScript does not place on us any restrictions whatsoever in terms of how we can call this function. Let's look at a few examples:

```{.javascript .numberLines}
add();
// NaN

add(1, true);
// 2


add({})
// "[object Object]undefined"

add(1, 'a');
// "1a"

add(1, 2, 3);
// 3
```

JavaScript has a dynamic type system, which—as we alluded to earlier—means it does not perform ahead of time any verification that the types in our programs are used correctly. For example, we are able to call `add` with nonsensical values, such as booleans and objects, and we're even able to pass the wrong number of parameters (either too few, in which case the arguments that we did not pass will be undefined, or too many, in which case the extraneous arguments will simply be ignored). 

Furthermore, JavaScript is weakly typed, meaning that, rather than balking at receiving such unexpected garbage and crashing with a runtime exception, JavaScript "helpfully" attempts to implicitly convert these nonsensical values that we passed into values of some other type that might make a bit more sense (for some value of "sense").

<aside>As a brief aside, weak and strong typing tend to be somewhat overloaded, colloquial terms, but in this context we'll use these terms strictly in relation to implicit type conversion, as seen in the previous examples.</aside>

JavaScript's addition operator `+` is overloaded to perform both mathematical addition, as well as string concatenation. It is not defined for objects, or booleans, or any other types. When you attempt to use this operator with values of these types, JavaScript invokes an arcane system of type conversions on your behalf in order to avoid throwing an exception. When we called `add(1, 'a')`, JavaScript converted `1` to the string `'1'`, prior to concatenating it with the second argument of the function `'a'`. Similar conversions are performed for other types, such as objects, booleans, etc., and other sorts of conversions take place in different contexts (the most notable example perhaps being when determining equality with the `==` operator).

Somewhat infamously, these type conversion rules can be leveraged such that any JavaScript program can be written using only the following six characters: `[]()!+`. This subset of the language has been affectionately dubbed "JSFuck". 

Here we see some examples of JSFuck in action:

```{.javascript .numberLines}
+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+
[+!+[]]+[+[]]+[+[]]+[+[]])
// Infinity

(![]+[])[+!+[]]
// 'a'

[][(![]+[])[+[]]+([![]]+[][[]])[+!+
[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+
[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+
(!![]+[])[+!+[]]][([][(![]+[])[+[]]+
([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+
[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+
!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+
!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+([![]]+
[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+
(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+
(!![]+[])[+!+[]]])[+!+[]+[+[]]]+([][[]]+
[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+
[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+
([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+
[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+
(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+
[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+
[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+
(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+
[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+
(!![]+[])[+!+[]]]((![]+[])[+!+[]]+(![]+[])[!+[]+
!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]+
(!![]+[])[+[]]+(![]+[][(![]+[])[+[]]+([![]]+
[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+
[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+
[]]])[!+[]+!+[]+[+[]]]+[+!+[]]+(!![]+[][(![]+[])[+
[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+
(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+
!+[]]])[!+[]+!+[]+[+[]]])()
// alert(1)
```

While at a glance this might appear quite baffling, nevertheless it is a consistent and inevitable outcome of the implicit type conversion rules of the language. This bizarre quirk of the language has notably been exploited to allow arbitrary JavaScript execution on eBay's listing pages (although the extreme verbosity of writing JavaScript in this way often limits the extent to which this can be exploited, e.g. when the number of characters that can be entered into an input field is limited).

## Strong typing

To some, the idea of the implicit conversions between different types that weak typing provides, as presented in the preceding section, may seem unpalatable. Fortunately for these people, there are type systems which do not perform such implicit conversions. In contrast to weak typing, this is called strong typing. In a strongly typed language, such as python, we might define our `add` function like this:

```{.python .numberLines}
def add(m, n):
    return m + n
```

Here again are some examples of how we might call this function, displayed along with the result of these calls:

```{.python .numberLines}
add();
# TypeError: add() missing 2 required positional arguments: 'm' and 'n'

add(1, True);
# 2

add({})
# TypeError: add() missing 1 required positional argument: 'n'

add(1, 'a');
# TypeError: unsupported operand type(s) for +: 'int' and 'str'

add(1, 2, 3)
# TypeError: add() takes 2 positional arguments but 3 were given
```

There are two things to note here. First, largely for historical reasons, `bool` in python is a subclass of `int`, which is why we were able to add `1` to `True` without issue. We will not dwell on this further. Second, python prevented us from calling `add` in many of the nonsensical ways that JavaScript did not, namely by throwing `TypeError` exceptions when we did not provide arguments of the correct type, or when we did not provide the correct number of arguments. The type system here has constrained our use of this function, in order to help us avoid incorrect programs.

While this is certainly a step in the right direction, it should be noted that these were runtime exceptions, which occurred only at the moment that the function was called incorrectly. If a call like this were to occur somewhere deep within your program, in some rarely used code path, you might not know about such a problem until it's too late and your code is already in production.

One implication we might draw from this is that the knowledge that a dynamic type system was able to provide to us, with respect to certain aspects of the correctness of our program, was in a sense derived a posteriori. I would argue, however, that if we were able to derive this same knowledge a priori, we could have prevented such an exception from ever occurring.

In virtually every programming language, the values that we're dealing with in our programs do have types. In dynamically typed languages, we're allowed to use values of the wrong type in ways that don't make sense, such that meaningless data will propagate throughout our systems—as in the case of weak typing—or our programs will crash at runtime—as we saw with strong typing.

## Static typing

In a statically typed language, the semantics of the language specify that terms have types, and the language's type checker will track these types throughout the program to ensure they are not used in ways that would break any contracts. If the type checker cannot determine that types are used in valid ways throughout the program, the program is rejected as invalid.

This is, as the name implies, a static anaylisis process. Meaning that this type checking is performed on some static representation of the program (e.g. the source code), and does not involve actually running the code being analyzed. In other words, the problems that were only found at runtime in our strongly, dynamically typed language, can be discovered at compile time in our statically typed language.

<aside>Statically typed languages can also be strongly or weakly typed, with the most notable example of the latter being C. For the pruposes of this discussion, however, this topic is not worth any further comment.</aside>

So, building on the example from above, in a statically typed language such as Java, the `not` function from earlier might look like this:

```{.java .numberLines}
import com.makeyev.sarmat.ICBM;

public class Main {
    public static void main(String []args){
        boolean a = true;
        System.out.println(not(a));
    }

    public static boolean not(boolean b) {
        if (b != false) { return true; }
        ICBM().launch();
        return false;
    }
}
```

It is not possible to break this contract in the ways that were possible with dynamically typed languages. Attempting to call this function with a string, or an integer, or any other value that is not a boolean will result in a compile time type error, and your code will not be compiled.

Here, the type system has further constrained us. We cannot write programs that call `not` with anything other than a boolean value, which will help to prevent an entire class of bugs which, as we saw, are possible with dynamically typed languages.

However, there is one small issue with this function. Can you spot it?

If you noted that `not` does not correctly return the negation of its input, then you are correct. While the type system here can prevent us from making egregious mistakes, like trying to calculate the logical complement of the textual content of Moby Dick, it was not able to prevent us from making a small logical error.

Of course there also one other minor flaw in this function. While the type signature was able to tell us much about the behavior of this function—about the types of values that it would accept as input, and the types of values that it could potentially return to us as output—the type signature did not quite tell us the entire story of this function. When passing `false` to this function, we can reasonably expect to get some boolean value back (and we might hope, unfortunately to little avail, that this value will be `true`). To this end, the function will perform serviceably. However, upon closer inspection of the function's implementation, we may begin to notice something untoward, perhaps even sinister. Before returning a value, the function also performs some other work, which is neither represented, nor constrained by the type system. In other words, it performed a side-effect.

## Side effects

The type system in the previous example was neither expressive nor powerful enough to either reflect these side-effects in the type, nor to otherwise prevent the free use of such side-effects. This, however, is a failing of this type system in particular, and not of type systems in general.

In a language such as Haskell, it is not only possible, but also mandatory that side-effects—such as those seen in the previous example—be reflected in a function's type. As an example:

```{.haskell .numberLines}
hello :: String -> IO ()
hello s = putStr $ "Hello " ++ s ++ "!\n"

add :: Num a => a -> a -> a
add m n = m + n
```

These functions demonstrate to us, via their signatures, whether they will be performing side effects. Put another way, `IO a` can perhaps be thought of as the type of values that perform side-effects. And furthermore, values of other types, by definition, cannot perform these side-effects (ignoring shenanigans like `unsafePerformIO`). At a glance, we can know that `hello` will be performing some kind of side-effects, whereas `add` will not (and in fact **cannot**).

Whereas in the earlier example there was rather a vast gulf of program behavior that the type system was unable to express to us (e.g. the call to `ICBM().launch()` went completely unremarked, as far as the type system was concerned), here the types are able to provide us with a richer, more complete description of our programs, which the compiler will enforce at compile time. This is beneficial to us, as programmers, if we wish to have guarantees about what our programs may or may not be doing (e.g. launching ICBM missiles).

<aside>`IO a` is not a particularly granular or descriptive type. It tells us only that side-effects will be performed, but it tells us nothing of the nature of those side-effects. Disk access, network access, FFI... all side-effects are lumped into a single type. There are type systems that are able to treat side-effects much more granularly (e.g. koka), but we will not be discussing these here.</aside>

While we have come a long way since the wild west of the weakly, dynamically typed languages where we began, we still have not yet reached the end of this journey. To see why, let us look at the example of appending together two lists.

In Haskell, we can define our own list type like this (I will use the GADT extension, as well as some others, for better syntactic consistency with some later examples that we'll be seeing in another language):

```{.haskell .numberLines}
{-# LANGUAGE KindSignatures, GADTs #-}

import Data.Kind
import Prelude (Char, Int)

infixr 7 :<

data List :: Type -> Type where
    Nil  :: List a
    (:<) :: a -> List a -> List a
```

Here we have defined a type constructor `List`. When `List` is provided with some type, it becomes an inhabited type (e.g. `List Int` or `List String`). There are two data constructors for this type: `Nil`, the empty list, and `:<` (which we will pronounce "cons"), which appends some value to an already constructed list.

Here are a few example of list values:

```{.haskell .numberLines}
emptyList :: List Int
emptyList = Nil

oneList :: List Int
oneList = 1 :< Nil

twoList :: List Char
twoList = '1' :< '2' :< Nil
```

Now, we can define a function to append two lists together.

```{.haskell .numberLines}
appendLists :: List a -> List a -> List a
appendLists Nil       ys = ys
appendLists (x :< xs) ys = x :< (appendLists xs ys)
```

We presented here the correct implementation, but it should be clear that the type of this function would also have allowed for any number of incorrect implementations, such as the following:

```{.haskell .numberLines}
appendLists :: List a -> List a -> List a
appendLists xs ys = Nil
```

While this is clearly not what we would like for our list-appending function to be doing, it's equally clear that it is nevertheless correct from the perspective of the type system, and this program will compile without issue.

## Expressivity

Beyond simply using the types that are provided to us by our languages, more advanced type systems can also allow programmers to build their own types, and to encode additional information into these types, providing greater expressivity, as well as stronger guarantees about the correctness of our programs.

E.g.:

```{.python .numberLines}
def add_100_feet_to_distance(dist: int) -> int:
    return dist + 100

distance_in_feet = 328
distance_in_meters = 100
add_100_feet_to_distance(distance_in_meters)
```

Here we have a value that is purportedly a distance in meters, but it's being passed to a function that claims to add 100 feet to the distance. In this example, however, we're using plain integers to represent both values, and from a type perspective the two values cannot be distinguished from each other. While this program as written is apparently well-typed, it's nevertheless clear that it is in some way incorrect, and will likely cause problems in our program which could be difficult to identify and locate.

In another language, such as Haskell, we might be able to do something like this:

```{.haskell .numberLines}
newtype Feet = MkFeet Int
newtype Meters = MkMeters Int

add100FeetToDistance :: Feet -> Feet
add100FeetToDistance (MkFeet n) = MkFeet (100 + n)

distanceInFeet :: Feet
distanceInFeet = MkFeet 328

distanceInMeters :: Meters
distanceInMeters = MkMeters 100
```

Here we have encoded additional information into our types (namely the unit of measure), the consistent use of which the type system will enforce for us. Any attempts to use a value of type `Meters` where a value of type `Feet` is expected will be rejected by the type checker, and the program will not compile.

## Dependent types

We've seen that much can be done with a sufficiently advanced type system. By encoding information about our programs at the type level, the type system can verify that the properties that we've encoded into our types hold, and if they do not the program will not compile.

So far, we've seen examples of static types being used to encode fairly straightforward properties of the domains that we've been working with. However, there are type systems which allow for even greater expressivity and power when encoding properties of our programs at the type level.

As a motivating example, we will again examine the concatenation of two lists, using a new language, Idris.

For reasons that should become clear later, we will begin by defining a type, `Nat`, representing the natural numbers, using an inductively defined representation (also known as Peano numbers).

```{.idris .numberLines}
data Nat : Type where
    Z : Nat
    S : Nat -> Nat
```

By definition, `Nat` can be either `Z` (representing zero), or `S n` (the successor of another `Nat`).

Some examples:

```{.idris .numberLines}
zero : Nat
zero = Z

one : Nat
one = S Z

two : Nat
two = S (S Z)

five : Nat
five = S (S (S (S (S Z))))
```

Here we have defined several values of type `Nat`, and assigned them to what seem to be fitting names (`zero`, `one`, `two`, etc.). The names here are arbitrary, however, and nothing would have prevented us from choosing different, less suitable names.

Using this type, we can now define addition:

```{.idris .numberLines}
(+) : Nat -> Nat -> Nat
Z     + n = n
(S m) + n = S (m + n)
```

So, as we defined in the pattern matches above, zero plus any `Nat` value `n` is simply `n`, whereas the successor of any value `m` plus any value `n` will be the successor of `m + n`. Very simple!

Now that we have natural numbers with which we can count and add, we can define an ordered collection type which is in some ways list-like, but whose type also encodes its length. We will call this type `Vect` (technically `Vect` is a type constructor, not a type itself, meaning that you must provide some additional information in order to produce an inhabited type).

```{.idris .numberLines}
data Vect : Nat -> Type -> Type where
    Nil  : Vect Zero a
    (::) : a -> Vect n a -> Vect (S n) a
```

To translate this definition: we define a type constructor `Vect`. When you pass `Vect` a `Nat` and any arbitrary type `a`, it will return to you a type, which in this case will be a `Vect` of some length and type, like `Vect (S Z) String`. Note that we are using here a `Nat` *value* at the type level.

The two data constructors for `Vect` are `Nil`, which is defined as a vector of length zero (an empty vector) of some type, and `::` (pronounced "cons"), which is a function that takes a value of type `a`, a vector of type `Vect n a`, and which returns a vector, of type `Vect (S n) a`.

Let's look at some examples:

```{.idris .numberLines}
emptyVect : Vect Z Int
emptyVect = Nil

oneVect : Vect (S Z) Int
oneVect = 1 :: Nil

twoVect : Vect (S (S Z)) Int
twoVect = 1 :: 2 :: Nil
```

We have now defined a type which, by its very definition, cannot be constructed in such a way that the length described in the type does not match the actual length of the data structure.

This, for example, will not compile:

```{.idris .numberLines}
threeOrFourVect : Vect (S (S (S Z))) Int
threeOrFourVect = 1 :: 2 :: 3 :: 4 :: Nil
```

This is a type error, and the type checker will not permit such an ill-typed program to be compiled. Instead, it will error with a message like the following:

```{.idris .numberLines}
Type mismatch between
        Vect (S len) elem (Type of x :: xs)
and
        Vect Z Int (Expected type)

Specifically:
        Type mismatch between
                S len
        and
                Z
```

What do we gain by having such a type? As was mentioned earlier, we have encoded more information about our data at the type level. Specifically in this case we have encoded the length of our list-like vector in its type. With this information, the type system can further assist us, by checking that the operations we write are correct with respect to the type signatures that we specify. As an example, if we wish to write an operation to append two vectors together it should be clear that the result will be a vector whose length is the sum of the lengths of the two input vectors. The signature for this function might look like this:

```{.idris .numberLines}
appendVec : Vect m a -> Vect n a -> Vect (m + n) a
```

With the length encoded at the type level, we can leverage the type system to reject incorrect implementations where the important properties of the operation do not hold. In this case, the important property of the append function is that the length of the resulting `Vect` is the sum of the lengths of the two input `Vect`s. The type checker can now determine for us that a naive implementation—say, one which simply always returns an empty vector—does not satisfy the length summing property that we have specified in our type signature.

But in fact beyond even just rejecting incorrect implementations, we can leverage the type system to write a complete implementation of this function for us. Through a series of fairly mechanical steps, we can ask the compiler to fill out aspects of our function for us, using the information it knows about our types, until we're left with a complete and correct implementation. This is what this looks like in action:

```{.appendVect .idris .numberLines}
appendVect : Vect m a -> Vect n a -> Vect (m + n) a



```

``` {.appendVect .idris .numberLines}
appendVect : Vect m a -> Vect n a -> Vect (m + n) a
appendVect x        y = ?appendVect_rhs


```

``` {.appendVect .idris .numberLines}
appendVect : Vect m a -> Vect n a -> Vect (m + n) a
appendVect Nil      y = ?appendVect_rhs_1
appendVect (x :: z) y = ?appendVect_rhs_2
```

``` {.appendVect .idris .numberLines}
appendVect : Vect m a -> Vect n a -> Vect (m + n) a
appendVect Nil      y = y
appendVect (x :: z) y = ?appendVect_rhs_2
```

``` {.appendVect .idris .numberLines}
appendVect : Vect m a -> Vect n a -> Vect (m + n) a
appendVect Nil      y = y
appendVect (x :: z) y = x :: appendVec z y
```

<button id="play-appendVect">Play</button>

Amazing! By providing the type checker with more information about our types, not only can our type checker do more for us to verify the correctness of our programs, but it can also write many of our programs for us!

Let's look at another brief example:

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)



```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect x        y         = ?zipVect_rhs


```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect Nil      y         = ?zipVect_rhs_1
zipVect (x :: z) y         = ?zipVect_rhs_2

```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect Nil      Nil       = ?zipVect_rhs_1
zipVect (x :: z) y         = ?zipVect_rhs_2

```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect Nil      Nil       = ?zipVect_rhs_1
zipVect (x :: z) (y :: ys) = ?zipVect_rhs_2

```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect Nil      Nil       = Nil
zipVect (x :: z) (y :: ys) = ?zipVect_rhs_2

```

``` {.zipVect .idris .numberLines}
zipVect : Vect n a -> Vect n b -> Vect n (a,b)
zipVect Nil      Nil       = Nil
zipVect (x :: z) (y :: ys) = (x, y) :: zipVect z w

```

<button id="play-zipVect">Play</button>

Here the compiler wrote for us the full implementation of a function that zips two vectors together. Note that the type signature specifies the two vectors passed to this function must be of the same length, `n`, and the vector returned must also be of length `n`. The compiler was able to determine that, when the first parameter is an empty vector, so too will be the second parameter (their lengths are, after all, equal), and was able to correctly pattern match and provide full, correct implementations for the two cases given the available information. Furthermore, the compiler will enforce these constraints whenever this function is called. It is impossible to call this function with two vectors that the compiler cannot determine to be of the same length. And with only a few more tools in our toolbelt (e.g. a `min` function for `Nat` values), we could have implemented a different, equally provably correct function that zips together any two arbitrary length `Vect`s, producing a new `Vect` of a length equal to the lesser of the lengths of the two input `Vect`s.

<aside>Remember that the length checks mentioned above are compile time checks. Since the compiler has already performed these checks, and has verified and proven the correctness of our programs, these checks need not incur any runtime cost. In fact, our types can often be erased entirely during compilation.</aside>

<script>
(function(){
    function registerPlayButton(selector, playButtonSelector){
        var TICK = 1100;
        var button = document.querySelector(playButtonSelector);
        var els = document.querySelectorAll(selector);
        var end = els.length;
        function showFrame(n, end) {
            for (var m = 0; m < end; m++) {
                el = els[m];
                if (m === n) {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            }
        }
        function play(n){
            // TODO - this is kinda bunk. firefox formats it weird, and it's a shitty function anyway
            n = n % end;
            showFrame(n, end);
            n = n + 1;
            if (n !== end) {
                setTimeout(function(){play(n)}, TICK);
            } else {
                button.disabled = false;
            }
        }
        button.addEventListener('click', function(){
            if (!button.disabled) {
                button.disabled = true;
                play(0);
            }
        });
        showFrame(0, end);
    }
    registerPlayButton('.appendVect', '#play-appendVect');
    registerPlayButton('.zipVect', '#play-zipVect');
})();
</script>

## Conclusion

We began by demonstrating some of the issues that a weak, dynamic type system will permit. We saw that these type systems, by performing implicit type conversions, can allow nonsensical values to propagate throughout our systems.

We then proceeded to introduce a constraint, in the form of strong typing, whereby our operations would enforce for us the types which they would permit us to operate on. However, we also saw that, while strong typing did much to help ensure the correctness of our programs that weak typing was unable to, when coupled with a dynamic type system, strong typing was unable to reveal to us the correctness (or incorrectness) of our systems without actually running our code. This opened the possibility of edge cases in rarely used code paths, or when unexected input somehow entered our systems.

Introducing further constraints, we examined static typing. We saw that static typing was able to reject incorrect programs at compile time, which would have only been discovered at runtime using a comparable dynamically typed language. But again, we found deficiencies in the static type system that we were examining; namely, the type system allowed for side-effects which were not represented, or constrained at the type level.

And yet again, we introduced another constraint. Next, we looked at a type system where side-effects were represented and constrained at the type level. We saw how this eliminated the possibility of certain kinds of undesirable behavior, namely the unrestricted use of side-effects in innocuous seeming functions. Exploring this  type system, though, we found further areas for improvement, as the types of our functions often provided too much latitude in our implementations, such as writing a list-appending function that simply always returned an empty list.

We then briefly explored some ways that encoding the important properties of our systems at the type level could allow us to leverage the type system to provide us with additional degrees of safety.

Finally, we introduced a type system that allowed us to define functions where the types of our functions (both the argument types, as well as the output type) could be dependent on values at the type level. This allowed us to define functions where the type precisely encoded some of the most important properties of our data types and functions. Building on the example of appending lists, we defined a list-like type, `Vect`, which encoded its length at the type level. This allowed us to leverage the newfound power of our dependent type system not only to prevent the sorts of issues we had seen with our earlier attempt at writing a list-appending function, but we also found that the type system was in fact powerful enough to entirely write this function for us.

The recurring motif has been that throughout our journey through different type systems, we have introduced new type systems, we have explored some of their features, and then we have focused on some of the implications—and especially the failings—of their designs, and how these failings would allow us to write incorrect or delinquent programs. Moving on to the next type system, we would then see how, by introducing further constraints on the programs the type system would allow us to write, and by increasing the expressivity and power of what we can encode at the type level, these more advanced type systems were able to help us to prevent entirely some of the undesirable and aberrant behaviour we had seen with the previous, less capable type systems.

In short, with a sufficiently powerful type system, we are often able to make the illegal states in our systems literally unrepresentable. And beyond even this, we've seen that, by encoding the important aspects of our programs at the type level, a sufficiently advanced compiler can in fact write many of our programs for us. By defining `Vect` as we did, we were able to encapsulate in the type the properties that were important to us (namely its length). With this, we needed only to write a specifications for `appendVect` and `zipVect` (i.e. the type signatures), at which point we had provided the compiler with enough information to write the implementation for us. 

While the type systems we explored gradually introduced further and further constraints on the programs we were allowed to write, these constraints were, in actuality, preventing us from writing incorrect, nonsensical, and otherwise undesirable programs. And perhaps paradoxically, the more constraints our type system imposed on us, the more powerful they became, and the more confidant we could be in the correctness of our programs.
