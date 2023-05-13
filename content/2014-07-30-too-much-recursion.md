+++
title = "Too Much Recursion!"
date = 2014-07-30 21:00:00
slug = "posts/too-much-recursion.html"

[taxonomies]
tags = ["JavaScript", "JS1K", "Lattice Boltzmann"]

# description: "In which the author addresses the claim, made in the new O'Reilly book 'Data Structures and Algorithms in 
# JavaScript', that 'it is not possible to [implement Mergesort as a recursive algorithm] in JavaScript, as the recursion 
# goes too deep for the language to handle'."

[extra]
summary = "_In which the author addresses the claim, made in the new O'Reilly book 'Data Structures and Algorithms in JavaScript', that 'it is not possible to [implement Mergesort as a recursive algorithm] in JavaScript, as the recursion goes too deep for the language to handle'._"
author = "ebenpack"
+++

I was reading 'Data Structures and Algorithms in JavaScript' by Michael McMillan the other day. While the book as a
whole is absolutely riddled with errors, this passage struck me as being particularly egregious.

> It is customary, though not necessary, to implement Mergesort as a recursive algorithm. However, **it is not possible
> to do so in JavaScript, as the recursion goes too deep for the language to handle**. [emphasis mine]

<!--more-->

It is not possible to implement recursive mergesort in JavaScript! Because the recursion goes too deep! What utter
nonsense.

To see why this is such a patently absurd claim, we must first establish a few facts. First, what is the stack depth for
JavaScript? This isn't something that is defined by the specification, so it's going to be implementation dependent.
User josh3736 reported the stack depths of several browsers in his StackOverflow answer
[here](http://stackoverflow.com/questions/7826992/browser-javascript-stack-size-limit#7828803). A quick check of the
browsers easily available to hand suggests his assessment to be more or less in the right neighborhood. At worst, we
have a stack depth of ~1,000 (insert IE6 joke here), and at best it could be as high as ~65,000. The mean seems to be
somewhere around ~20,000-30,000.

The next fact we need to establish is how large can a JavaScript array be? This is a lot more straightforward than the
stack depth. The ECMA standard clearly defines the maximum length of an array to be 2<sup>32</sup>-1, or 4,294,967,295.
Which is just a hair north of 4 billion. That's a very large array.

So, now that we've sorted out our facts, why is McMillan's claim so absurd? To understand that, we need to take a closer
look at mergesort. Mergesort is a textbook divide-and-conquer algorithm. It works by splitting an array in half, then
calling mergesort recursively on each half until it reaches the base case. Then it merges each half back together such
that the result is sorted. For any given array of sufficient size, mergesort will be called twice, once on the lower
half, and once on the upper half. For each of those halves, mergesort will then potentially be called twice again, and
so on.

It should be evident that the number of times an array can be divided in this fashion will be log<sub>2</sub>(n). Not
coincidentally, this is the maximum recursive depth mergesort will reach. Put another way, mergesort will reach a
recursive depth of n when called on an array of length 2<sup>n</sup>. It follows from this that, given our maximum array
length, the maximum recursive depth that mergesort can possibly reach is 32 calls deep (maybe 33 if you count the
original call). This is nowhere close to reaching even the shallowest possible stack depth.

I quickly knocked up a recursive mergesort implementation (which I am including below) and set it to work sorting ever
larger arrays. My implementation (which I'm sure leaves much room for improvement) crapped out after trying to sort an
array of 2<sup>25</sup> items. Not because of what Firefox rather endearingly refers to as "too much recursion", but
rather because it takes a heck of a lot of work to sort an array with tens of millions of items. Heck, forget sorting,
Chrome wouldn't even let me push more than 2<sup>26</sup> items into an array. So, while it's true that mergesort in
JavaScript might have some trouble with arrays of 2<sup>25</sup> items, this has nought to do with the depth of
recursion or the call stack. I'll repeat that: any problems mergesort might have with very large arrays are wholly
unrelated to the depth of recursion or the call stack, and any claims otherwise suggest a fundamental misunderstanding
of either how the algorithm works, the basic fundamentals of JavaScript, or both.

Just as a thought experiment, though, how large would an array actually need to be to reach or exceed the stack depth
of, say, IE6? If you recall, IE6 has a stack depth of ~1,000. Let's just call it 1,000 even. As we demonstrated, in
order to reach this recursive depth with mergesort, the array would have to have a length of 2<sup>1,000</sup>. In
base-10 this is ~10<sup>301</sup>. This translates to a one followed by 301 other numbers. It looks exactly like this:

<code style="display:block;white-space: pre-wrap;line-break: anywhere;">10715086071862673209484250490600018105614048117055336074437503883703510511249361224931983788156958581275946729175531468251871452856923140435984577574698574803934567774824230985421074605062371141877954182153046474983581941267398767559165543946077062914571196477686542167660429831652624386837205668069376
</code>

It's a pretty big number. To give an idea of the scale of this number, it's greater than the number of atoms in the
observable universe, which, in case you were wondering, there are approx. 10<sup>80</sup> of, give or take a few orders
of magnitude. So to be a bit technical for a moment, it's actually much, much, much greater than the number of atoms in
the universe. In fact, any description I could attempt to give w/r/t just how much greater than the number of atoms in
the universe this number really is, would just be such a colossal understatement that it would only be an affront to
large numbers, and indeed to the very concept of largeness in general. Just believe me when I say that it's wowie big.

The point is, there's a good chance you're not going to be reaching the maximum call stack depth with mergesort, even
if you really, really believe your array is well above average size. I would actually go so far as to say it is
completely impossible to exceed the stack depth with mergesort in JavaScript, assuming you're sorting a standard
JavaScript array and you're using a well implemented mergesort function. So there's a good chance that anyone who
claims that

> It is not possible to [implement Mergesort as a recursive algorithm] in JavaScript, as the recursion goes too deep for
> the language to handle.

might not know what they're talking about. Like, at all.

While this certainly is one of the more flagrant errors in the book, it is just one of many. If you're on the fence
about getting this book, I would recommend you give it a pass.

Anyway, here's some code:

```js,linenos
// The number of stack traces that will be logged in the console.
// We call console.log() when we reach the base case in our
// mergesort function, which will be the maximum recursive depth.
// We're only going to call this the first few times, as
// it can really bog things down otherwise.
var stacktraces = 0;

// The array we will be sorting.
var big_array = [];

// Build our array with numbers going in descending order.
// The array size, max, can be larger, but things slow down
// and start to get wonky at about 2^25.
var max = Math.pow(2, 20);
for (var i = 0; i < max; i++){
    big_array.push(max - i);
}

big_array = mergesort(big_array);

// Standard merge
function merge(a,b){
    var result = [];
    var alen = a.length;
    var blen = b.length;
    while (alen > 0 || blen > 0){
        if (alen > 0 && blen > 0){
            if (a[0] < b[0]){
                result.push(a.shift());
                alen -= 1;
            }
            else if (b[0] <= a[0]){
                result.push(b.shift());
                blen -= 1;
            }
        }
        else if (alen > 0){
            result.push(a.shift());
            alen -= 1;
        }
        else if (blen > 0){
            result.push(b.shift());
            blen -= 1;
        }
    }
    return result;
}

// Standard recursive mergesort
function mergesort(lst){
    var length = lst.length;
    if (length <= 1){
        if (stacktraces < 10){
            // This will print a call stack to the console the
            // first ten times our mergesort reaches the base case.
            // It should be clear that the maximum recursive depth
            // of our mergesort function is n+1, where our array
            // has on the order of 2^n items.
            console.trace()
            stacktraces++;
        }
        return lst;
    }
    var q = Math.floor(length/2)
    var left = mergesort(lst.slice(0,q));
    var right = mergesort(lst.slice(q));
    return merge(left, right);
}
```

Addendum: I was curious about the relative performance of the iterative and recursive mergesort implementations.
As you can see, the iterative approach is much faster, and I believe it uses quite a bit less memory as well.

<div id="graph">
<style scoped>
    path {
        stroke-width: 3;
        fill: none;
    }

    .iter{
        stroke: steelblue;
    }

    .recurse{
        stroke: rgb(223, 94, 98);
    }

    .axis {
      shape-rendering: crispEdges;
    }

    .x.axis line {
      stroke: lightgrey;
    }

    .x.axis .minor {
      stroke-opacity: .5;
    }

    .x.axis path {
      display: none;
    }

    .y.axis line, .y.axis path {
      fill: none;
      stroke: #000;
    }
</style>
<svg viewBox="0 0 1000 400">
    <g transform="translate(80,80)">
        <g class="x axis" transform="translate(0,240)">
            <g class="tick" transform="translate(0,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2⁹</text>
            </g>
            <g class="tick" transform="translate(120,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹⁰</text>
            </g>
            <g class="tick" transform="translate(240,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹¹</text>
            </g>
            <g class="tick" transform="translate(360,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹²</text>
            </g>
            <g class="tick" transform="translate(480,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹³</text>
            </g>
            <g class="tick" transform="translate(599.9999999999999,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹⁴</text>
            </g>
            <g class="tick" transform="translate(720,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹⁵</text>
            </g>
            <g class="tick" transform="translate(840,0)">
                <line y2="-240" x2="0"></line>
                <text y="10" x="0" dy=".71em" style="text-anchor: middle;">2¹⁶</text>
            </g>
            <path class="domain" d="M0,-240V0H840V-240"></path>
        </g>
        <text class="y label" text-anchor="end" y="6" dy=".75em" transform="rotate(-90)">execution time (milliseconds)</text>
        <text class="x label" text-anchor="end" x="200" y="280" dx=".75em">array length</text>
        <rect x="140" y="55" width="10" height="10" style="fill: steelblue;"></rect>
        <rect x="140" y="25" width="10" height="10" style="fill: rgb(223, 94, 98);"></rect>
        <text text-anchor="start" x="160" y="65">Iterative</text>
        <text text-anchor="start" x="160" y="35">Recursive</text>
        <g class="y axis" transform="translate(-25,0)">
            <g class="tick" transform="translate(0,240)">
                <line x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" style="text-anchor: end;">0</text>
            </g>
            <g class="tick" transform="translate(0,188.4978540772532)">
                <line x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" style="text-anchor: end;">100</text>
            </g>
            <g class="tick" transform="translate(0,136.99570815450642)">
                <line x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" style="text-anchor: end;">200</text>
            </g>
            <g class="tick" transform="translate(0,85.49356223175965)">
                <line x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" style="text-anchor: end;">300</text>
            </g>
            <g class="tick" transform="translate(0,33.99141630901286)">
                <line x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" style="text-anchor: end;">400</text>
            </g>
            <path class="domain" d="M-6,0H0V240H-6"></path>
        </g>
        <path class="iter" d="M0,240L0,240L0,240L0,240L0,240L0,240L0,240L0,240L0,240L0,239.48497854077254L120,238.96995708154506L240,236.90987124463518L360,233.8197424892704L480,228.6695278969957L599.9999999999999,215.27896995708156L720,195.1931330472103L840,146.78111587982832"></path>
        <path class="recurse" d="M0,240L0,240L0,240L0,240L0,240L0,239.48497854077254L0,240L0,240L0,239.48497854077254L0,238.4549356223176L120,237.42489270386267L240,233.3047210300429L360,225.57939914163092L480,214.24892703862662L599.9999999999999,185.40772532188842L720,121.54506437768241L840,0"></path>
    </g>
</svg>
</div>
