!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.tests=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":5}],2:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"1YiZ5S":3,"inherits":2}],6:[function(_dereq_,module,exports){
var hslToRgb, rgbToHsl, parseColor, cache;
/**
 * A color with both rgb and hsl representations.
 * @class Colour
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 */
function Colour(color, alpha){
    var hsl, rgb;
    var parsed_color = {};
    if (typeof color === 'string'){
        color = color.toLowerCase();
        if (color in cache){
            parsed_color = cache[color];
        } else {
            parsed_color = parseColor(color);
            cache[color] = parsed_color;
        }
        rgb = parsed_color;
        hsl = rgbToHsl(parsed_color.r, parsed_color.g, parsed_color.b);
        alpha = parsed_color.a || alpha || 1;
    } else if ('r' in color){
        rgb = color;
        hsl = rgbToHsl(color.r, color.g, color.b);
        alpha = hsl.a || alpha || 1;
    } else if ('h' in color){
        hsl = color;
        rgb = hslToRgb(color.h, color.s, color.l);
        alpha = rgb.a || alpha || 1;
    }
    this.rgb = {'r': rgb.r, 'g': rgb.g, 'b': rgb.b};
    this.hsl = {'h': hsl.h, 's': hsl.s, 'l': hsl.l};
    this.alpha = alpha;
    // Precompute and store string representation of color.
    this._color_string = this._toString();
}
/**
 * Lighten a color by the given percentage.

 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.lighten = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l + percent;
    if (lum > 100){
        lum = 100;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Darken a color by the given percentage.
 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.darken = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l - percent;
    if (lum < 0){
        lum = 0;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Return a string representation of color in #hex form.
 * @method
 * @return {string}
 */
Colour.prototype.toString = function() {
    return this._color_string;
};

Colour.prototype._toString = function(){
    var r = this.rgb.r.toString(16);
    var g = this.rgb.g.toString(16);
    var b = this.rgb.b.toString(16);
    // Zero fill
    if (r.length === 1){
        r = "0" + r;
    }
    if (g.length === 1){
        g = "0" + g;
    }
    if (b.length === 1){
        b = "0" + b;
    }
    return "#" + r + g + b;
};
/**
* @param {number} h Hue
* @param {number} s Saturation
* @param {number} l Luminance
* @return {{r: number, g: number, b: number}}
*/
hslToRgb = function(h, s, l){
    function _v(m1, m2, hue){
        hue = hue;
        if (hue < 0){hue+=1;}
        if (hue > 1){hue-=1;}
        if (hue < (1/6)){
            return m1 + (m2-m1)*hue*6;
        }
        if (hue < 0.5){
            return m2;
        }
        if (hue < (2/3)){
            return m1 + (m2-m1)*((2/3)-hue)*6;
        }
        return m1;
    }
    var m2;
    var fraction_l = (l/100);
    var fraction_s = (s/100);
    if (s === 0){
        var gray = fraction_l*255;
        return {'r': gray, 'g': gray, 'b': gray};
    }
    if (l <= 50){
        m2 = fraction_l * (1+fraction_s);
    }
    else{
        m2 = fraction_l+fraction_s-(fraction_l*fraction_s);
    }
    var m1 = 2*fraction_l - m2;
    h = h / 360;
    return {'r': Math.round(_v(m1, m2, h+(1/3))*255), 'g': Math.round(_v(m1, m2, h)*255), 'b': Math.round(_v(m1, m2, h-(1/3))*255)};
};
/**
 * @param  {number} r Red
 * @param  {number} g Green
 * @param  {number} b Blue
 * @return {{h: number, s: number, l: number}}
 */
rgbToHsl = function(r, g, b){
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var maxc = Math.max(r, g, b);
    var minc = Math.min(r, g, b);
    var l = Math.round(((minc+maxc)/2)*100);
    if (l > 100) {l = 100;}
    if (l < 0) {l = 0;}
    var h, s;
    if (minc === maxc){
        return {'h': 0, 's': 0, 'l': l};
    }
    if (l <= 50){
        s = (maxc-minc) / (maxc+minc);
    }
    else{
        s = (maxc-minc) / (2-maxc-minc);
    }
    var rc = (maxc-r) / (maxc-minc);
    var gc = (maxc-g) / (maxc-minc);
    var bc = (maxc-b) / (maxc-minc);
    if (r === maxc){
        h = bc-gc;
    }
    else if (g === maxc){
        h = 2+rc-bc;
    }
    else{
        h = 4+gc-rc;
    }
    h = (h/6) % 1;
    if (h < 0){h+=1;}
    h = Math.round(h*360);
    s = Math.round(s*100);
    if (h > 360) {h = 360;}
    if (h < 0) {h = 0;}
    if (s > 100) {s = 100;}
    if (s < 0) {s = 0;}
    return {'h': h, 's': s, 'l': l};
};
// Clamp x and y values to min and max
function clamp(x, min, max){
    if (x < min){x = min;}
    else if (x > max){x = max;}
    return x;
}
/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColourError} If illegal color value is passed.
 */
parseColor = function(color){
    var red, green, blue, hue, sat, lum;
    var alpha = 1;
    var match;
    var error = false;
    var pref = color.substr(0,3); // Three letter color prefix
    // HSL(a)
    if (pref === 'hsl'){
        var hsl_regex = /hsla?\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = hsl_regex.exec(color);
        if (match){
            hue = parseInt(match[1], 10);
            sat = parseInt(match[2], 10);
            lum = parseInt(match[3], 10);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
            hue = Math.abs(hue % 360);
            sat = clamp(sat, 0, 100);
            lum = clamp(lum, 0, 100);
            var parsed = hslToRgb(hue, sat, lum);
            red = parsed.r;
            green = parsed.g;
            blue = parsed.b;
        } else {
            error = true;
        }
    // RGB(a)
    } else if (pref === 'rgb'){
        var rgb_regex = /rgba?\((-?\d+%?)\s*,\s*(-?\d+%?)\s*,\s*(-?\d+%?)(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = rgb_regex.exec(color);
        if (match){
            var m1 = match[1];
            var m2 = match[2];
            var m3 = match[3];
            red = parseInt(match[1], 10);
            green = parseInt(match[2], 10);
            blue = parseInt(match[3], 10);
            // Check if using rgb(a) percentage values.
            if (m1[m1.length-1] === '%' ||
                m2[m2.length-1] === '%' ||
                m3[m3.length-1] === '%'){
                // All values must be percetage.
                if (m1[m1.length-1] === '%' &&
                    m2[m2.length-1] === '%' &&
                    m3[m3.length-1] === '%'){
                    // Convert to 255
                    red = Math.floor(red/100 * 255);
                    green = Math.floor(green/100 * 255);
                    blue = Math.floor(blue/100 * 255);
                } else {
                   error = true; 
                }
            }
            red = clamp(red, 0, 255);
            green = clamp(green, 0, 255);
            blue = clamp(blue, 0, 255);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
        } else {
            error = true;
        }
    // HEX
    } else if (color[0] === '#'){
        var hex = color.substr(1);
        if (hex.length === 3){
            red = parseInt(hex[0]+hex[0], 16);
            green = parseInt(hex[1]+hex[1], 16);
            blue = parseInt(hex[2]+hex[2], 16);
        } else if (hex.length === 6){
            red = parseInt(hex[0]+hex[1], 16);
            green = parseInt(hex[2]+hex[3], 16);
            blue = parseInt(hex[4]+hex[5], 16);
        } else {
            error = true;
        }
    } else {
        error = true;
    }

    alpha = clamp(alpha, 0, 1);

    if (error){
        throw "ColourError: Something went wrong. Perhaps " + color + " is not a legal CSS color value";
    }
    return {'r': red, 'g': green, 'b': blue, 'a': alpha};
};
// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
cache = {
    "black": {"r": 0, "g": 0, "b": 0, "h": 0, "s": 0, "l": 0},
    "silver": {"r": 192, "g": 192, "b": 192, "h": 0, "s": 0, "l": 75},
    "gray": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "white": {"r": 255, "g": 255, "b": 255, "h": 0, "s": 0, "l": 100},
    "maroon": {"r": 128, "g": 0, "b": 0, "h": 0, "s": 100, "l": 25},
    "red": {"r": 255, "g": 0, "b": 0, "h": 0, "s": 100, "l": 50},
    "purple": {"r": 128, "g": 0, "b": 128, "h": 300, "s": 100, "l": 25},
    "fuchsia": {"r": 255, "g": 0, "b": 255, "h": 300, "s": 100, "l": 50},
    "green": {"r": 0, "g": 128, "b": 0, "h": 120, "s": 100, "l": 25},
    "lime": {"r": 0, "g": 255, "b": 0, "h": 120, "s": 100, "l": 50},
    "olive": {"r": 128, "g": 128, "b": 0, "h": 60, "s": 100, "l": 25},
    "yellow": {"r": 255, "g": 255, "b": 0, "h": 60, "s": 100, "l": 50},
    "navy": {"r": 0, "g": 0, "b": 128, "h": 240, "s": 100, "l": 25},
    "blue": {"r": 0, "g": 0, "b": 255, "h": 240, "s": 100, "l": 50},
    "teal": {"r": 0, "g": 128, "b": 128, "h": 180, "s": 100, "l": 25},
    "aqua": {"r": 0, "g": 255, "b": 255, "h": 180, "s": 100, "l": 50},
    "orange": {"r": 255, "g": 165, "b": 0, "h": 39, "s": 100, "l": 50},
    "aliceblue": {"r": 240, "g": 248, "b": 255, "h": 208, "s": 100, "l": 97},
    "antiquewhite": {"r": 250, "g": 235, "b": 215, "h": 34, "s": 78, "l": 91},
    "aquamarine": {"r": 127, "g": 255, "b": 212, "h": 160, "s": 100, "l": 75},
    "azure": {"r": 240, "g": 255, "b": 255, "h": 180, "s": 100, "l": 97},
    "beige": {"r": 245, "g": 245, "b": 220, "h": 60, "s": 56, "l": 91},
    "bisque": {"r": 255, "g": 228, "b": 196, "h": 33, "s": 100, "l": 88},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205, "h": 36, "s": 100, "l": 90},
    "blueviolet": {"r": 138, "g": 43, "b": 226, "h": 271, "s": 76, "l": 53},
    "brown": {"r": 165, "g": 42, "b": 42, "h": 0, "s": 59, "l": 41},
    "burlywood": {"r": 222, "g": 184, "b": 135, "h": 34, "s": 57, "l": 70},
    "cadetblue": {"r": 95, "g": 158, "b": 160, "h": 182, "s": 25, "l": 50},
    "chartreuse": {"r": 127, "g": 255, "b": 0, "h": 90, "s": 100, "l": 50},
    "chocolate": {"r": 210, "g": 105, "b": 30, "h": 25, "s": 75, "l": 47},
    "coral": {"r": 255, "g": 127, "b": 80, "h": 16, "s": 100, "l": 66},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237, "h": 219, "s": 79, "l": 66},
    "cornsilk": {"r": 255, "g": 248, "b": 220, "h": 48, "s": 100, "l": 93},
    "cyan": {"r": 0,"g": 255,"b": 255, "h": 180,"s": 100,"l": 97},
    "crimson": {"r": 220, "g": 20, "b": 60, "h": 348, "s": 83, "l": 47},
    "darkblue": {"r": 0, "g": 0, "b": 139, "h": 240, "s": 100, "l": 27},
    "darkcyan": {"r": 0, "g": 139, "b": 139, "h": 180, "s": 100, "l": 27},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11, "h": 43, "s": 89, "l": 38},
    "darkgray": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkgreen": {"r": 0, "g": 100, "b": 0, "h": 120, "s": 100, "l": 20},
    "darkgrey": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkkhaki": {"r": 189, "g": 183, "b": 107, "h": 56, "s": 38, "l": 58},
    "darkmagenta": {"r": 139, "g": 0, "b": 139, "h": 300, "s": 100, "l": 27},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47, "h": 82, "s": 39, "l": 30},
    "darkorange": {"r": 255, "g": 140, "b": 0, "h": 33, "s": 100, "l": 50},
    "darkorchid": {"r": 153, "g": 50, "b": 204, "h": 280, "s": 61, "l": 50},
    "darkred": {"r": 139, "g": 0, "b": 0, "h": 0, "s": 100, "l": 27},
    "darksalmon": {"r": 233, "g": 150, "b": 122, "h": 15, "s": 72, "l": 70},
    "darkseagreen": {"r": 143, "g": 188, "b": 143, "h": 120, "s": 25, "l": 65},
    "darkslateblue": {"r": 72, "g": 61, "b": 139, "h": 248, "s": 39, "l": 39},
    "darkslategray": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkslategrey": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkturquoise": {"r": 0, "g": 206, "b": 209, "h": 181, "s": 100, "l": 41},
    "darkviolet": {"r": 148, "g": 0, "b": 211, "h": 282, "s": 100, "l": 41},
    "deeppink": {"r": 255, "g": 20, "b": 147, "h": 328, "s": 100, "l": 54},
    "deepskyblue": {"r": 0, "g": 191, "b": 255, "h": 195, "s": 100, "l": 50},
    "dimgray": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dimgrey": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dodgerblue": {"r": 30, "g": 144, "b": 255, "h": 210, "s": 100, "l": 56},
    "firebrick": {"r": 178, "g": 34, "b": 34, "h": 0, "s": 68, "l": 42},
    "floralwhite": {"r": 255, "g": 250, "b": 240, "h": 40, "s": 100, "l": 97},
    "forestgreen": {"r": 34, "g": 139, "b": 34, "h": 120, "s": 61, "l": 34},
    "gainsboro": {"r": 220, "g": 220, "b": 220, "h": 0, "s": 0, "l": 86},
    "ghostwhite": {"r": 248, "g": 248, "b": 255, "h": 240, "s": 100, "l": 99},
    "gold": {"r": 255, "g": 215, "b": 0, "h": 51, "s": 100, "l": 50},
    "goldenrod": {"r": 218, "g": 165, "b": 32, "h": 43, "s": 74, "l": 49},
    "greenyellow": {"r": 173, "g": 255, "b": 47, "h": 84, "s": 100, "l": 59},
    "grey": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "honeydew": {"r": 240, "g": 255, "b": 240, "h": 120, "s": 100, "l": 97},
    "hotpink": {"r": 255, "g": 105, "b": 180, "h": 330, "s": 100, "l": 71},
    "indianred": {"r": 205, "g": 92, "b": 92, "h": 0, "s": 53, "l": 58},
    "indigo": {"r": 75, "g": 0, "b": 130, "h": 275, "s": 100, "l": 25},
    "ivory": {"r": 255, "g": 255, "b": 240, "h": 60, "s": 100, "l": 97},
    "khaki": {"r": 240, "g": 230, "b": 140, "h": 54, "s": 77, "l": 75},
    "lavender": {"r": 230, "g": 230, "b": 250, "h": 240, "s": 67, "l": 94},
    "lavenderblush": {"r": 255, "g": 240, "b": 245, "h": 340, "s": 100, "l": 97},
    "lawngreen": {"r": 124, "g": 252, "b": 0, "h": 90, "s": 100, "l": 49},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205, "h": 54, "s": 100, "l": 90},
    "lightblue": {"r": 173, "g": 216, "b": 230, "h": 195, "s": 53, "l": 79},
    "lightcoral": {"r": 240, "g": 128, "b": 128, "h": 0, "s": 79, "l": 72},
    "lightcyan": {"r": 224, "g": 255, "b": 255, "h": 180, "s": 100, "l": 94},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210, "h": 60, "s": 80, "l": 90},
    "lightgray": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightgreen": {"r": 144, "g": 238, "b": 144, "h": 120, "s": 73, "l": 75},
    "lightgrey": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightpink": {"r": 255, "g": 182, "b": 193, "h": 351, "s": 100, "l": 86},
    "lightsalmon": {"r": 255, "g": 160, "b": 122, "h": 17, "s": 100, "l": 74},
    "lightseagreen": {"r": 32, "g": 178, "b": 170, "h": 177, "s": 70, "l": 41},
    "lightskyblue": {"r": 135, "g": 206, "b": 250, "h": 203, "s": 92, "l": 75},
    "lightslategray": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightslategrey": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222, "h": 214, "s": 41, "l": 78},
    "lightyellow": {"r": 255, "g": 255, "b": 224, "h": 60, "s": 100, "l": 94},
    "limegreen": {"r": 50, "g": 205, "b": 50, "h": 120, "s": 61, "l": 50},
    "linen": {"r": 250, "g": 240, "b": 230, "h": 30, "s": 67, "l": 94},
    "magenta": {"r": 255,"g": 0,"b": 255, "h": 17,"s": 100,"l": 74},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170, "h": 160, "s": 51, "l": 60},
    "mediumblue": {"r": 0, "g": 0, "b": 205, "h": 240, "s": 100, "l": 40},
    "mediumorchid": {"r": 186, "g": 85, "b": 211, "h": 288, "s": 59, "l": 58},
    "mediumpurple": {"r": 147, "g": 112, "b": 219, "h": 260, "s": 60, "l": 65},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113, "h": 147, "s": 50, "l": 47},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238, "h": 249, "s": 80, "l": 67},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154, "h": 157, "s": 100, "l": 49},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204, "h": 178, "s": 60, "l": 55},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133, "h": 322, "s": 81, "l": 43},
    "midnightblue": {"r": 25, "g": 25, "b": 112, "h": 240, "s": 64, "l": 27},
    "mintcream": {"r": 245, "g": 255, "b": 250, "h": 150, "s": 100, "l": 98},
    "mistyrose": {"r": 255, "g": 228, "b": 225, "h": 6, "s": 100, "l": 94},
    "moccasin": {"r": 255, "g": 228, "b": 181, "h": 38, "s": 100, "l": 85},
    "navajowhite": {"r": 255, "g": 222, "b": 173, "h": 36, "s": 100, "l": 84},
    "oldlace": {"r": 253, "g": 245, "b": 230, "h": 39, "s": 85, "l": 95},
    "olivedrab": {"r": 107, "g": 142, "b": 35, "h": 80, "s": 60, "l": 35},
    "orangered": {"r": 255, "g": 69, "b": 0, "h": 16, "s": 100, "l": 50},
    "orchid": {"r": 218, "g": 112, "b": 214, "h": 302, "s": 59, "l": 65},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170, "h": 55, "s": 67, "l": 80},
    "palegreen": {"r": 152, "g": 251, "b": 152, "h": 120, "s": 93, "l": 79},
    "paleturquoise": {"r": 175, "g": 238, "b": 238, "h": 180, "s": 65, "l": 81},
    "palevioletred": {"r": 219, "g": 112, "b": 147, "h": 340, "s": 60, "l": 65},
    "papayawhip": {"r": 255, "g": 239, "b": 213, "h": 37, "s": 100, "l": 92},
    "peachpuff": {"r": 255, "g": 218, "b": 185, "h": 28, "s": 100, "l": 86},
    "peru": {"r": 205, "g": 133, "b": 63, "h": 30, "s": 59, "l": 53},
    "pink": {"r": 255, "g": 192, "b": 203, "h": 350, "s": 100, "l": 88},
    "plum": {"r": 221, "g": 160, "b": 221, "h": 300, "s": 47, "l": 75},
    "powderblue": {"r": 176, "g": 224, "b": 230, "h": 187, "s": 52, "l": 80},
    "rosybrown": {"r": 188, "g": 143, "b": 143, "h": 0, "s": 25, "l": 65},
    "royalblue": {"r": 65, "g": 105, "b": 225, "h": 225, "s": 73, "l": 57},
    "saddlebrown": {"r": 139, "g": 69, "b": 19, "h": 25, "s": 76, "l": 31},
    "salmon": {"r": 250, "g": 128, "b": 114, "h": 6, "s": 93, "l": 71},
    "sandybrown": {"r": 244, "g": 164, "b": 96, "h": 28, "s": 87, "l": 67},
    "seagreen": {"r": 46, "g": 139, "b": 87, "h": 146, "s": 50, "l": 36},
    "seashell": {"r": 255, "g": 245, "b": 238, "h": 25, "s": 100, "l": 97},
    "sienna": {"r": 160, "g": 82, "b": 45, "h": 19, "s": 56, "l": 40},
    "skyblue": {"r": 135, "g": 206, "b": 235, "h": 197, "s": 71, "l": 73},
    "slateblue": {"r": 106, "g": 90, "b": 205, "h": 248, "s": 53, "l": 58},
    "slategray": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "slategrey": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "snow": {"r": 255, "g": 250, "b": 250, "h": 0, "s": 100, "l": 99},
    "springgreen": {"r": 0, "g": 255, "b": 127, "h": 150, "s": 100, "l": 50},
    "steelblue": {"r": 70, "g": 130, "b": 180, "h": 207, "s": 44, "l": 49},
    "tan": {"r": 210, "g": 180, "b": 140, "h": 34, "s": 44, "l": 69},
    "thistle": {"r": 216, "g": 191, "b": 216, "h": 300, "s": 24, "l": 80},
    "tomato": {"r": 255, "g": 99, "b": 71, "h": 9, "s": 100, "l": 64},
    "turquoise": {"r": 64, "g": 224, "b": 208, "h": 174, "s": 72, "l": 56},
    "violet": {"r": 238, "g": 130, "b": 238, "h": 300, "s": 76, "l": 72},
    "wheat": {"r": 245, "g": 222, "b": 179, "h": 39, "s": 77, "l": 83},
    "whitesmoke": {"r": 245, "g": 245, "b": 245, "h": 0, "s": 0, "l": 96},
    "yellowgreen": {"r": 154, "g": 205, "b": 50, "h": 80, "s": 61, "l": 50}
};

module.exports = Colour;

},{}],7:[function(_dereq_,module,exports){
_dereq_('./../tests/colour.js');
_dereq_('./../tests/helpers.js');
_dereq_('./../tests/data/colors.js');

},{"./../tests/colour.js":8,"./../tests/data/colors.js":9,"./../tests/helpers.js":10}],8:[function(_dereq_,module,exports){
var Colour = _dereq_('../src/colour.js');
var named = _dereq_('./data/colors.js');
var nearlyEqual = _dereq_('./helpers.js')['nearlyEqual'];
var assert = _dereq_("assert");

suite('Colour', function(){
    var red, green, blue, rgb, rgba, hsl, hsla, rgb_per, rgb_bad1, rgb_bad2, rgb_bad3, hsl_bad1, hsl_bad2;
    setup(function(){
        red = new Colour("red");
        green = new Colour("#0F0"); // Named color 'green' is rgb(0,128,0)
        blue = new Colour("blue");
        rgb = new Colour("rgb(1, 7, 29)");
        rgba = new Colour("rgba(1, 7, 29, 0.3)");
        rgb_per = new Colour("rgba(100%, 0%, 0%, 1)");
        hsl = new Colour("hsl(0, 100%, 50%)");
        hsla = new Colour("hsla(0, 100%, 50%, 0.3 )");

        // These are poorly formatted colors, but they should still work.
        rgb_bad1 = new Colour("rgb(300,0,0)");
        rgb_bad2 = new Colour("rgb(255,-10,0)");
        rgb_bad3 = new Colour("rgba(110%, 0%, 0%, 2)");
        hsl_bad1 = new Colour("hsl(720, 120%, 120%)");
        hsl_bad2 = new Colour("hsl(-720, -120%, -120%)");
    });
    suite('properties', function(){
        test('rgb', function(){
            assert.equal(red.rgb.r, 255);
            assert.equal(red.rgb.g, 0);
            assert.equal(red.rgb.b, 0);
            assert.equal(rgb.rgb.r, 1);
            assert.equal(rgb.rgb.g, 7);
            assert.equal(rgb.rgb.b, 29);
            assert.equal(rgb.alpha, 1);
            assert.equal(rgba.rgb.r, 1);
            assert.equal(rgba.rgb.g, 7);
            assert.equal(rgba.rgb.b, 29);
            assert.ok(nearlyEqual(rgba.alpha, 0.3));
            assert.equal(rgb_per.rgb.r, 255);
            assert.equal(rgb_per.rgb.g, 0);
            assert.equal(rgb_per.rgb.b, 0);
            assert.equal(rgb_bad1.rgb.r, 255);
            assert.equal(rgb_bad1.rgb.g, 0);
            assert.equal(rgb_bad1.rgb.b, 0);
            assert.equal(rgb_bad2.rgb.r, 255);
            assert.equal(rgb_bad2.rgb.g, 0);
            assert.equal(rgb_bad2.rgb.b, 0);
            assert.equal(rgb_bad3.rgb.r, 255);
            assert.equal(rgb_bad3.rgb.g, 0);
            assert.equal(rgb_bad3.rgb.b, 0);
            assert.equal(rgb_bad3.alpha, 1);
            
            for (var color in named){
                if (named.hasOwnProperty(color)){
                    var name = new Colour(color);
                    var hex = new Colour(named[color].hex);
                    var named_rgb = named[color].rgb;
                    assert.equal(name.rgb.r, hex.rgb.r);
                    assert.equal(name.rgb.g, hex.rgb.g);
                    assert.equal(name.rgb.b, hex.rgb.b);
                    assert.equal(name.rgb.r, named_rgb.r);
                    assert.equal(name.rgb.g, named_rgb.g);
                    assert.equal(name.rgb.b, named_rgb.b);
                } 
            }
        });
        test('hsl', function(){
            assert.equal(red.hsl.h, 0);
            assert.equal(red.hsl.s, 100);
            assert.equal(red.hsl.l, 50);

            assert.equal(hsl.hsl.h, 0);
            assert.equal(hsl.hsl.s, 100);
            assert.equal(hsl.hsl.l, 50);
            assert.ok(nearlyEqual(hsl.alpha, 1));

            assert.equal(hsla.hsl.h, 0);
            assert.equal(hsla.hsl.s, 100);
            assert.equal(hsla.hsl.l, 50);
            assert.ok(nearlyEqual(hsla.alpha, 0.3));

            // assert.equal(hsl_bad1.r, 255);
            // assert.equal(hsl_bad1.g, 255);
            // assert.equal(hsl_bad1.b, 255);
            // assert.equal(hsl_bad2.r, 255);
            // assert.equal(hsl_bad2.g, 255);
            // assert.equal(hsl_bad2.b, 255);
            
            for (var color in named){
                if (named.hasOwnProperty(color)){
                    var name = new Colour(color);
                    var hex = new Colour(named[color].hex);
                    var named_hsl = named[color].rgb;
                    assert.equal(name.rgb.h, hex.rgb.h);
                    assert.equal(name.rgb.s, hex.rgb.s);
                    assert.equal(name.rgb.l, hex.rgb.l);
                    assert.equal(name.rgb.h, named_hsl.h);
                    assert.equal(name.rgb.s, named_hsl.s);
                    assert.equal(name.rgb.l, named_hsl.l);
                }
            }
        });
        test('alpha', function(){
            assert.ok(nearlyEqual(red.alpha, 1));
            assert.ok(nearlyEqual(rgba.alpha, 0.3));
            assert.ok(nearlyEqual(hsla.alpha, 0.3));
        });
    });
    suite('methods', function(){
        test('lighten', function(){
            var r1 = red.lighten(10);
            var r2 = red.lighten(20);
            var r3 = red.lighten(50);
            var g1 = green.lighten(10);
            var g2 = green.lighten(20);
            var g3 = green.lighten(50);
            var b1 = blue.lighten(10);
            var b2 = blue.lighten(20);
            var b3 = blue.lighten(50);

            assert.equal(r1.rgb.r, 255);
            assert.equal(r1.rgb.g, 51);
            assert.equal(r1.rgb.b, 51);
            assert.equal(r2.rgb.r, 255);
            assert.equal(r2.rgb.g, 102);
            assert.equal(r2.rgb.b, 102);
            assert.equal(r3.rgb.r, 255);
            assert.equal(r3.rgb.g, 255);
            assert.equal(r3.rgb.b, 255);

            assert.equal(g1.rgb.r, 51);
            assert.equal(g1.rgb.g, 255);
            assert.equal(g1.rgb.b, 51);
            assert.equal(g2.rgb.r, 102);
            assert.equal(g2.rgb.g, 255);
            assert.equal(g2.rgb.b, 102);
            assert.equal(g3.rgb.r, 255);
            assert.equal(g3.rgb.g, 255);
            assert.equal(g3.rgb.b, 255);

            assert.equal(b1.rgb.r, 51);
            assert.equal(b1.rgb.g, 51);
            assert.equal(b1.rgb.b, 255);
            assert.equal(b2.rgb.r, 102);
            assert.equal(b2.rgb.g, 102);
            assert.equal(b2.rgb.b, 255);
            assert.equal(b3.rgb.r, 255);
            assert.equal(b3.rgb.g, 255);
            assert.equal(b3.rgb.b, 255);

        });
        test('darken', function(){
            var r1 = red.darken(10);
            var r2 = red.darken(20);
            var r3 = red.darken(50);
            var g1 = green.darken(10);
            var g2 = green.darken(20);
            var g3 = green.darken(50);
            var b1 = blue.darken(10);
            var b2 = blue.darken(20);
            var b3 = blue.darken(50);

            assert.equal(r1.rgb.r, 204);
            assert.equal(r1.rgb.g, 0);
            assert.equal(r1.rgb.b, 0);
            assert.equal(r2.rgb.r, 153);
            assert.equal(r2.rgb.g, 0);
            assert.equal(r2.rgb.b, 0);
            assert.equal(r3.rgb.r, 0);
            assert.equal(r3.rgb.g, 0);
            assert.equal(r3.rgb.b, 0);

            assert.equal(g1.rgb.r, 0);
            assert.equal(g1.rgb.g, 204);
            assert.equal(g1.rgb.b, 0);
            assert.equal(g2.rgb.r, 0);
            assert.equal(g2.rgb.g, 153);
            assert.equal(g2.rgb.b, 0);
            assert.equal(g3.rgb.r, 0);
            assert.equal(g3.rgb.g, 0);
            assert.equal(g3.rgb.b, 0);

            assert.equal(b1.rgb.r, 0);
            assert.equal(b1.rgb.g, 0);
            assert.equal(b1.rgb.b, 204);
            assert.equal(b2.rgb.r, 0);
            assert.equal(b2.rgb.g, 0);
            assert.equal(b2.rgb.b, 153);
            assert.equal(b3.rgb.r, 0);
            assert.equal(b3.rgb.g, 0);
            assert.equal(b3.rgb.b, 0);
        });
        test('toString', function(){
            var r1 = red.toString();
            var g1 = green.toString();
            var b1 = blue.toString();
            var rgb1 = rgb.toString();
            var rgba1 = rgba.toString();
            var hsl1 = hsl.toString();
            var hsla1 = hsl.toString();
            assert.equal(r1.toLowerCase(), "#ff0000");
            assert.equal(g1.toLowerCase(), "#00ff00");
            assert.equal(b1.toLowerCase(), "#0000ff");
            assert.equal(rgb1.toLowerCase(), "#01071d");
            assert.equal(rgba1.toLowerCase(), "#01071d");
            assert.equal(hsl1.toLowerCase(), "#ff0000");
            assert.equal(hsla1.toLowerCase(), "#ff0000");
        });
    });
});
},{"../src/colour.js":6,"./data/colors.js":9,"./helpers.js":10,"assert":1}],9:[function(_dereq_,module,exports){
var namedcolors = {
    "aliceblue": {"hsl": {"h": 0,"s": 0,"l": 0 }, "rgb": {"r": 240,"g": 248,"b": 255 }, "hex": "#f0f8ff"},
    "antiquewhite": {"hsl": {"h": 0,"s": 0,"l": 75 }, "rgb": {"r": 250,"g": 235,"b": 215 }, "hex": "#faebd7"},
    "aqua": {"hsl": {"h": 0,"s": 0,"l": 50 }, "rgb": {"r": 0,"g": 255,"b": 255 }, "hex": "#00ffff"},
    "aquamarine": {"hsl": {"h": 0,"s": 0,"l": 100 }, "rgb": {"r": 127,"g": 255,"b": 212 }, "hex": "#7fffd4"},
    "azure": {"hsl": {"h": 0,"s": 100,"l": 25 }, "rgb": {"r": 240,"g": 255,"b": 255 }, "hex": "#f0ffff"},
    "beige": {"hsl": {"h": 0,"s": 100,"l": 50 }, "rgb": {"r": 245,"g": 245,"b": 220 }, "hex": "#f5f5dc"},
    "bisque": {"hsl": {"h": 300,"s": 100,"l": 25 }, "rgb": {"r": 255,"g": 228,"b": 196 }, "hex": "#ffe4c4"},
    "black": {"hsl": {"h": 300,"s": 100,"l": 50 }, "rgb": {"r": 0,"g": 0,"b": 0 }, "hex": "#000000"},
    "blanchedalmond": {"hsl": {"h": 120,"s": 100,"l": 25 }, "rgb": {"r": 255,"g": 235,"b": 205 }, "hex": "#ffebcd"},
    "blue": {"hsl": {"h": 120,"s": 100,"l": 50 }, "rgb": {"r": 0,"g": 0,"b": 255 }, "hex": "#0000ff"},
    "blueviolet": {"hsl": {"h": 60,"s": 100,"l": 25 }, "rgb": {"r": 138,"g": 43,"b": 226 }, "hex": "#8a2be2"},
    "brown": {"hsl": {"h": 60,"s": 100,"l": 50 }, "rgb": {"r": 165,"g": 42,"b": 42 }, "hex": "#a52a2a"},
    "burlywood": {"hsl": {"h": 240,"s": 100,"l": 25 }, "rgb": {"r": 222,"g": 184,"b": 135 }, "hex": "#deb887"},
    "cadetblue": {"hsl": {"h": 240,"s": 100,"l": 50 }, "rgb": {"r": 95,"g": 158,"b": 160 }, "hex": "#5f9ea0"},
    "chartreuse": {"hsl": {"h": 180,"s": 100,"l": 25 }, "rgb": {"r": 127,"g": 255,"b": 0 }, "hex": "#7fff00"},
    "chocolate": {"hsl": {"h": 180,"s": 100,"l": 50 }, "rgb": {"r": 210,"g": 105,"b": 30 }, "hex": "#d2691e"},
    "coral": {"hsl": {"h": 39,"s": 100,"l": 50 }, "rgb": {"r": 255,"g": 127,"b": 80 }, "hex": "#ff7f50"},
    "cornflowerblue": {"hsl": {"h": 208,"s": 100,"l": 97 }, "rgb": {"r": 100,"g": 149,"b": 237 }, "hex": "#6495ed"},
    "cornsilk": {"hsl": {"h": 34,"s": 78,"l": 91 }, "rgb": {"r": 255,"g": 248,"b": 220 }, "hex": "#fff8dc"},
    "crimson": {"hsl": {"h": 160,"s": 100,"l": 75 }, "rgb": {"r": 220,"g": 20,"b": 60 }, "hex": "#dc143c"},
    "cyan": {"hsl": {"h": 180,"s": 100,"l": 97 }, "rgb": {"r": 0,"g": 255,"b": 255 }, "hex": "#00ffff"},
    "darkblue": {"hsl": {"h": 60,"s": 56,"l": 91 }, "rgb": {"r": 0,"g": 0,"b": 139 }, "hex": "#00008b"},
    "darkcyan": {"hsl": {"h": 33,"s": 100,"l": 88 }, "rgb": {"r": 0,"g": 139,"b": 139 }, "hex": "#008b8b"},
    "darkgoldenrod": {"hsl": {"h": 36,"s": 100,"l": 90 }, "rgb": {"r": 184,"g": 134,"b": 11 }, "hex": "#b8860b"},
    "darkgray": {"hsl": {"h": 271,"s": 76,"l": 53 }, "rgb": {"r": 169,"g": 169,"b": 169 }, "hex": "#a9a9a9"},
    "darkgreen": {"hsl": {"h": 0,"s": 59,"l": 41 }, "rgb": {"r": 0,"g": 100,"b": 0 }, "hex": "#006400"},
    "darkgrey": {"hsl": {"h": 34,"s": 57,"l": 70 }, "rgb": {"r": 169,"g": 169,"b": 169 }, "hex": "#a9a9a9"},
    "darkkhaki": {"hsl": {"h": 182,"s": 25,"l": 50 }, "rgb": {"r": 189,"g": 183,"b": 107 }, "hex": "#bdb76b"},
    "darkmagenta": {"hsl": {"h": 90,"s": 100,"l": 50 }, "rgb": {"r": 139,"g": 0,"b": 139 }, "hex": "#8b008b"},
    "darkolivegreen": {"hsl": {"h": 25,"s": 75,"l": 47 }, "rgb": {"r": 85,"g": 107,"b": 47 }, "hex": "#556b2f"},
    "darkorange": {"hsl": {"h": 16,"s": 100,"l": 66 }, "rgb": {"r": 255,"g": 140,"b": 0 }, "hex": "#ff8c00"},
    "darkorchid": {"hsl": {"h": 219,"s": 79,"l": 66 }, "rgb": {"r": 153,"g": 50,"b": 204 }, "hex": "#9932cc"},
    "darkred": {"hsl": {"h": 48,"s": 100,"l": 93 }, "rgb": {"r": 139,"g": 0,"b": 0 }, "hex": "#8b0000"},
    "darksalmon": {"hsl": {"h": 348,"s": 83,"l": 47 }, "rgb": {"r": 233,"g": 150,"b": 122 }, "hex": "#e9967a"},
    "darkseagreen": {"hsl": {"h": 240,"s": 100,"l": 27 }, "rgb": {"r": 143,"g": 188,"b": 143 }, "hex": "#8fbc8f"},
    "darkslateblue": {"hsl": {"h": 180,"s": 100,"l": 27 }, "rgb": {"r": 72,"g": 61,"b": 139 }, "hex": "#483d8b"},
    "darkslategray": {"hsl": {"h": 43,"s": 89,"l": 38 }, "rgb": {"r": 47,"g": 79,"b": 79 }, "hex": "#2f4f4f"},
    "darkslategrey": {"hsl": {"h": 0,"s": 0,"l": 66 }, "rgb": {"r": 47,"g": 79,"b": 79 }, "hex": "#2f4f4f"},
    "darkturquoise": {"hsl": {"h": 120,"s": 100,"l": 20 }, "rgb": {"r": 0,"g": 206,"b": 209 }, "hex": "#00ced1"},
    "darkviolet": {"hsl": {"h": 0,"s": 0,"l": 66 }, "rgb": {"r": 148,"g": 0,"b": 211 }, "hex": "#9400d3"},
    "deeppink": {"hsl": {"h": 56,"s": 38,"l": 58 }, "rgb": {"r": 255,"g": 20,"b": 147 }, "hex": "#ff1493"},
    "deepskyblue": {"hsl": {"h": 300,"s": 100,"l": 27 }, "rgb": {"r": 0,"g": 191,"b": 255 }, "hex": "#00bfff"},
    "dimgray": {"hsl": {"h": 82,"s": 39,"l": 30 }, "rgb": {"r": 105,"g": 105,"b": 105 }, "hex": "#696969"},
    "dimgrey": {"hsl": {"h": 33,"s": 100,"l": 50 }, "rgb": {"r": 105,"g": 105,"b": 105 }, "hex": "#696969"},
    "dodgerblue": {"hsl": {"h": 280,"s": 61,"l": 50 }, "rgb": {"r": 30,"g": 144,"b": 255 }, "hex": "#1e90ff"},
    "firebrick": {"hsl": {"h": 0,"s": 100,"l": 27 }, "rgb": {"r": 178,"g": 34,"b": 34 }, "hex": "#b22222"},
    "floralwhite": {"hsl": {"h": 15,"s": 72,"l": 70 }, "rgb": {"r": 255,"g": 250,"b": 240 }, "hex": "#fffaf0"},
    "forestgreen": {"hsl": {"h": 120,"s": 25,"l": 65 }, "rgb": {"r": 34,"g": 139,"b": 34 }, "hex": "#228b22"},
    "fuchsia": {"hsl": {"h": 248,"s": 39,"l": 39 }, "rgb": {"r": 255,"g": 0,"b": 255 }, "hex": "#ff00ff"},
    "gainsboro": {"hsl": {"h": 180,"s": 25,"l": 25 }, "rgb": {"r": 220,"g": 220,"b": 220 }, "hex": "#dcdcdc"},
    "ghostwhite": {"hsl": {"h": 180,"s": 25,"l": 25 }, "rgb": {"r": 248,"g": 248,"b": 255 }, "hex": "#f8f8ff"},
    "gold": {"hsl": {"h": 181,"s": 100,"l": 41 }, "rgb": {"r": 255,"g": 215,"b": 0 }, "hex": "#ffd700"},
    "goldenrod": {"hsl": {"h": 282,"s": 100,"l": 41 }, "rgb": {"r": 218,"g": 165,"b": 32 }, "hex": "#daa520"},
    "gray": {"hsl": {"h": 328,"s": 100,"l": 54 }, "rgb": {"r": 128,"g": 128,"b": 128 }, "hex": "#808080"},
    "green": {"hsl": {"h": 195,"s": 100,"l": 50 }, "rgb": {"r": 0,"g": 128,"b": 0 }, "hex": "#008000"},
    "greenyellow": {"hsl": {"h": 0,"s": 0,"l": 41 }, "rgb": {"r": 173,"g": 255,"b": 47 }, "hex": "#adff2f"},
    "grey": {"hsl": {"h": 0,"s": 0,"l": 41 }, "rgb": {"r": 128,"g": 128,"b": 128 }, "hex": "#808080"},
    "honeydew": {"hsl": {"h": 210,"s": 100,"l": 56 }, "rgb": {"r": 240,"g": 255,"b": 240 }, "hex": "#f0fff0"},
    "hotpink": {"hsl": {"h": 0,"s": 68,"l": 42 }, "rgb": {"r": 255,"g": 105,"b": 180 }, "hex": "#ff69b4"},
    "indianred": {"hsl": {"h": 40,"s": 100,"l": 97 }, "rgb": {"r": 205,"g": 92,"b": 92 }, "hex": "#cd5c5c"},
    "indigo": {"hsl": {"h": 120,"s": 61,"l": 34 }, "rgb": {"r": 75,"g": 0,"b": 130 }, "hex": "#4b0082"},
    "ivory": {"hsl": {"h": 0,"s": 0,"l": 86 }, "rgb": {"r": 255,"g": 255,"b": 240 }, "hex": "#fffff0"},
    "khaki": {"hsl": {"h": 240,"s": 100,"l": 99 }, "rgb": {"r": 240,"g": 230,"b": 140 }, "hex": "#f0e68c"},
    "lavender": {"hsl": {"h": 51,"s": 100,"l": 50 }, "rgb": {"r": 230,"g": 230,"b": 250 }, "hex": "#e6e6fa"},
    "lavenderblush": {"hsl": {"h": 43,"s": 74,"l": 49 }, "rgb": {"r": 255,"g": 240,"b": 245 }, "hex": "#fff0f5"},
    "lawngreen": {"hsl": {"h": 84,"s": 100,"l": 59 }, "rgb": {"r": 124,"g": 252,"b": 0 }, "hex": "#7cfc00"},
    "lemonchiffon": {"hsl": {"h": 0,"s": 0,"l": 50 }, "rgb": {"r": 255,"g": 250,"b": 205 }, "hex": "#fffacd"},
    "lightblue": {"hsl": {"h": 120,"s": 100,"l": 97 }, "rgb": {"r": 173,"g": 216,"b": 230 }, "hex": "#add8e6"},
    "lightcoral": {"hsl": {"h": 330,"s": 100,"l": 71 }, "rgb": {"r": 240,"g": 128,"b": 128 }, "hex": "#f08080"},
    "lightcyan": {"hsl": {"h": 0,"s": 53,"l": 58 }, "rgb": {"r": 224,"g": 255,"b": 255 }, "hex": "#e0ffff"},
    "lightgoldenrodyellow": {"hsl": {"h": 275,"s": 100,"l": 25 }, "rgb": {"r": 250,"g": 250,"b": 210 }, "hex": "#fafad2"},
    "lightgray": {"hsl": {"h": 60,"s": 100,"l": 97 }, "rgb": {"r": 211,"g": 211,"b": 211 }, "hex": "#d3d3d3"},
    "lightgreen": {"hsl": {"h": 54,"s": 77,"l": 75 }, "rgb": {"r": 144,"g": 238,"b": 144 }, "hex": "#90ee90"},
    "lightgrey": {"hsl": {"h": 240,"s": 67,"l": 94 }, "rgb": {"r": 211,"g": 211,"b": 211 }, "hex": "#d3d3d3"},
    "lightpink": {"hsl": {"h": 340,"s": 100,"l": 97 }, "rgb": {"r": 255,"g": 182,"b": 193 }, "hex": "#ffb6c1"},
    "lightsalmon": {"hsl": {"h": 90,"s": 100,"l": 49 }, "rgb": {"r": 255,"g": 160,"b": 122 }, "hex": "#ffa07a"},
    "lightseagreen": {"hsl": {"h": 54,"s": 100,"l": 90 }, "rgb": {"r": 32,"g": 178,"b": 170 }, "hex": "#20b2aa"},
    "lightskyblue": {"hsl": {"h": 195,"s": 53,"l": 79 }, "rgb": {"r": 135,"g": 206,"b": 250 }, "hex": "#87cefa"},
    "lightslategray": {"hsl": {"h": 0,"s": 79,"l": 72 }, "rgb": {"r": 119,"g": 136,"b": 153 }, "hex": "#778899"},
    "lightslategrey": {"hsl": {"h": 180,"s": 100,"l": 94 }, "rgb": {"r": 119,"g": 136,"b": 153 }, "hex": "#778899"},
    "lightsteelblue": {"hsl": {"h": 60,"s": 80,"l": 90 }, "rgb": {"r": 176,"g": 196,"b": 222 }, "hex": "#b0c4de"},
    "lightyellow": {"hsl": {"h": 0,"s": 0,"l": 83 }, "rgb": {"r": 255,"g": 255,"b": 224 }, "hex": "#ffffe0"},
    "lime": {"hsl": {"h": 120,"s": 73,"l": 75 }, "rgb": {"r": 0,"g": 255,"b": 0 }, "hex": "#00ff00"},
    "limegreen": {"hsl": {"h": 0,"s": 0,"l": 83 }, "rgb": {"r": 50,"g": 205,"b": 50 }, "hex": "#32cd32"},
    "linen": {"hsl": {"h": 351,"s": 100,"l": 86 }, "rgb": {"r": 250,"g": 240,"b": 230 }, "hex": "#faf0e6"},
    "magenta": {"hsl": {"h": 17,"s": 100,"l": 74 }, "rgb": {"r": 255,"g": 0,"b": 255 }, "hex": "#ff00ff"},
    "maroon": {"hsl": {"h": 177,"s": 70,"l": 41 }, "rgb": {"r": 128,"g": 0,"b": 0 }, "hex": "#800000"},
    "mediumaquamarine": {"hsl": {"h": 203,"s": 92,"l": 75 }, "rgb": {"r": 102,"g": 205,"b": 170 }, "hex": "#66cdaa"},
    "mediumblue": {"hsl": {"h": 210,"s": 14,"l": 53 }, "rgb": {"r": 0,"g": 0,"b": 205 }, "hex": "#0000cd"},
    "mediumorchid": {"hsl": {"h": 210,"s": 14,"l": 53 }, "rgb": {"r": 186,"g": 85,"b": 211 }, "hex": "#ba55d3"},
    "mediumpurple": {"hsl": {"h": 214,"s": 41,"l": 78 }, "rgb": {"r": 147,"g": 112,"b": 219 }, "hex": "#9370db"},
    "mediumseagreen": {"hsl": {"h": 60,"s": 100,"l": 94 }, "rgb": {"r": 60,"g": 179,"b": 113 }, "hex": "#3cb371"},
    "mediumslateblue": {"hsl": {"h": 120,"s": 61,"l": 50 }, "rgb": {"r": 123,"g": 104,"b": 238 }, "hex": "#7b68ee"},
    "mediumspringgreen": {"hsl": {"h": 30,"s": 67,"l": 94 }, "rgb": {"r": 0,"g": 250,"b": 154 }, "hex": "#00fa9a"},
    "mediumturquoise": {"hsl": {"h": 160,"s": 51,"l": 60 }, "rgb": {"r": 72,"g": 209,"b": 204 }, "hex": "#48d1cc"},
    "mediumvioletred": {"hsl": {"h": 240,"s": 100,"l": 40 }, "rgb": {"r": 199,"g": 21,"b": 133 }, "hex": "#c71585"},
    "midnightblue": {"hsl": {"h": 288,"s": 59,"l": 58 }, "rgb": {"r": 25,"g": 25,"b": 112 }, "hex": "#191970"},
    "mintcream": {"hsl": {"h": 260,"s": 60,"l": 65 }, "rgb": {"r": 245,"g": 255,"b": 250 }, "hex": "#f5fffa"},
    "mistyrose": {"hsl": {"h": 147,"s": 50,"l": 47 }, "rgb": {"r": 255,"g": 228,"b": 225 }, "hex": "#ffe4e1"},
    "moccasin": {"hsl": {"h": 249,"s": 80,"l": 67 }, "rgb": {"r": 255,"g": 228,"b": 181 }, "hex": "#ffe4b5"},
    "navajowhite": {"hsl": {"h": 157,"s": 100,"l": 49 }, "rgb": {"r": 255,"g": 222,"b": 173 }, "hex": "#ffdead"},
    "navy": {"hsl": {"h": 178,"s": 60,"l": 55 }, "rgb": {"r": 0,"g": 0,"b": 128 }, "hex": "#000080"},
    "oldlace": {"hsl": {"h": 322,"s": 81,"l": 43 }, "rgb": {"r": 253,"g": 245,"b": 230 }, "hex": "#fdf5e6"},
    "olive": {"hsl": {"h": 240,"s": 64,"l": 27 }, "rgb": {"r": 128,"g": 128,"b": 0 }, "hex": "#808000"},
    "olivedrab": {"hsl": {"h": 150,"s": 100,"l": 98 }, "rgb": {"r": 107,"g": 142,"b": 35 }, "hex": "#6b8e23"},
    "orange": {"hsl": {"h": 6,"s": 100,"l": 94 }, "rgb": {"r": 255,"g": 165,"b": 0 }, "hex": "#ffa500"},
    "orangered": {"hsl": {"h": 38,"s": 100,"l": 85 }, "rgb": {"r": 255,"g": 69,"b": 0 }, "hex": "#ff4500"},
    "orchid": {"hsl": {"h": 36,"s": 100,"l": 84 }, "rgb": {"r": 218,"g": 112,"b": 214 }, "hex": "#da70d6"},
    "palegoldenrod": {"hsl": {"h": 39,"s": 85,"l": 95 }, "rgb": {"r": 238,"g": 232,"b": 170 }, "hex": "#eee8aa"},
    "palegreen": {"hsl": {"h": 80,"s": 60,"l": 35 }, "rgb": {"r": 152,"g": 251,"b": 152 }, "hex": "#98fb98"},
    "paleturquoise": {"hsl": {"h": 16,"s": 100,"l": 50 }, "rgb": {"r": 175,"g": 238,"b": 238 }, "hex": "#afeeee"},
    "palevioletred": {"hsl": {"h": 302,"s": 59,"l": 65 }, "rgb": {"r": 219,"g": 112,"b": 147 }, "hex": "#db7093"},
    "papayawhip": {"hsl": {"h": 55,"s": 67,"l": 80 }, "rgb": {"r": 255,"g": 239,"b": 213 }, "hex": "#ffefd5"},
    "peachpuff": {"hsl": {"h": 120,"s": 93,"l": 79 }, "rgb": {"r": 255,"g": 218,"b": 185 }, "hex": "#ffdab9"},
    "peru": {"hsl": {"h": 180,"s": 65,"l": 81 }, "rgb": {"r": 205,"g": 133,"b": 63 }, "hex": "#cd853f"},
    "pink": {"hsl": {"h": 340,"s": 60,"l": 65 }, "rgb": {"r": 255,"g": 192,"b": 203 }, "hex": "#ffc0cb"},
    "plum": {"hsl": {"h": 37,"s": 100,"l": 92 }, "rgb": {"r": 221,"g": 160,"b": 221 }, "hex": "#dda0dd"},
    "powderblue": {"hsl": {"h": 28,"s": 100,"l": 86 }, "rgb": {"r": 176,"g": 224,"b": 230 }, "hex": "#b0e0e6"},
    "purple": {"hsl": {"h": 30,"s": 59,"l": 53 }, "rgb": {"r": 128,"g": 0,"b": 128 }, "hex": "#800080"},
    "red": {"hsl": {"h": 350,"s": 100,"l": 88 }, "rgb": {"r": 255,"g": 0,"b": 0 }, "hex": "#ff0000"},
    "rosybrown": {"hsl": {"h": 300,"s": 47,"l": 75 }, "rgb": {"r": 188,"g": 143,"b": 143 }, "hex": "#bc8f8f"},
    "royalblue": {"hsl": {"h": 187,"s": 52,"l": 80 }, "rgb": {"r": 65,"g": 105,"b": 225 }, "hex": "#4169e1"},
    "saddlebrown": {"hsl": {"h": 0,"s": 25,"l": 65 }, "rgb": {"r": 139,"g": 69,"b": 19 }, "hex": "#8b4513"},
    "salmon": {"hsl": {"h": 225,"s": 73,"l": 57 }, "rgb": {"r": 250,"g": 128,"b": 114 }, "hex": "#fa8072"},
    "sandybrown": {"hsl": {"h": 25,"s": 76,"l": 31 }, "rgb": {"r": 244,"g": 164,"b": 96 }, "hex": "#f4a460"},
    "seagreen": {"hsl": {"h": 6,"s": 93,"l": 71 }, "rgb": {"r": 46,"g": 139,"b": 87 }, "hex": "#2e8b57"},
    "seashell": {"hsl": {"h": 28,"s": 87,"l": 67 }, "rgb": {"r": 255,"g": 245,"b": 238 }, "hex": "#fff5ee"},
    "sienna": {"hsl": {"h": 146,"s": 50,"l": 36 }, "rgb": {"r": 160,"g": 82,"b": 45 }, "hex": "#a0522d"},
    "silver": {"hsl": {"h": 25,"s": 100,"l": 97 }, "rgb": {"r": 192,"g": 192,"b": 192 }, "hex": "#c0c0c0"},
    "skyblue": {"hsl": {"h": 19,"s": 56,"l": 40 }, "rgb": {"r": 135,"g": 206,"b": 235 }, "hex": "#87ceeb"},
    "slateblue": {"hsl": {"h": 197,"s": 71,"l": 73 }, "rgb": {"r": 106,"g": 90,"b": 205 }, "hex": "#6a5acd"},
    "slategray": {"hsl": {"h": 248,"s": 53,"l": 58 }, "rgb": {"r": 112,"g": 128,"b": 144 }, "hex": "#708090"},
    "slategrey": {"hsl": {"h": 210,"s": 13,"l": 50 }, "rgb": {"r": 112,"g": 128,"b": 144 }, "hex": "#708090"},
    "snow": {"hsl": {"h": 210,"s": 13,"l": 50 }, "rgb": {"r": 255,"g": 250,"b": 250 }, "hex": "#fffafa"},
    "springgreen": {"hsl": {"h": 0,"s": 100,"l": 99 }, "rgb": {"r": 0,"g": 255,"b": 127 }, "hex": "#00ff7f"},
    "steelblue": {"hsl": {"h": 150,"s": 100,"l": 50 }, "rgb": {"r": 70,"g": 130,"b": 180 }, "hex": "#4682b4"},
    "tan": {"hsl": {"h": 207,"s": 44,"l": 49 }, "rgb": {"r": 210,"g": 180,"b": 140 }, "hex": "#d2b48c"},
    "teal": {"hsl": {"h": 34,"s": 44,"l": 69 }, "rgb": {"r": 0,"g": 128,"b": 128 }, "hex": "#008080"},
    "thistle": {"hsl": {"h": 300,"s": 24,"l": 80 }, "rgb": {"r": 216,"g": 191,"b": 216 }, "hex": "#d8bfd8"},
    "tomato": {"hsl": {"h": 9,"s": 100,"l": 64 }, "rgb": {"r": 255,"g": 99,"b": 71 }, "hex": "#ff6347"},
    "turquoise": {"hsl": {"h": 174,"s": 72,"l": 56 }, "rgb": {"r": 64,"g": 224,"b": 208 }, "hex": "#40e0d0"},
    "violet": {"hsl": {"h": 300,"s": 76,"l": 72 }, "rgb": {"r": 238,"g": 130,"b": 238 }, "hex": "#ee82ee"},
    "wheat": {"hsl": {"h": 39,"s": 77,"l": 83 }, "rgb": {"r": 245,"g": 222,"b": 179 }, "hex": "#f5deb3"},
    "white": {"hsl": {"h": 0,"s": 0,"l": 96 }, "rgb": {"r": 255,"g": 255,"b": 255 }, "hex": "#ffffff"},
    "whitesmoke": {"hsl": {"h": 80,"s": 61,"l": 50 }, "rgb": {"r": 245,"g": 245,"b": 245 }, "hex": "#f5f5f5"},"yellow": { "rgb": {"r": 255,"g": 255,"b": 0 }, "hex": "#ffff00"},"yellowgreen": { "rgb": {"r": 154,"g": 205,"b": 50 }, "hex": "#9acd32"}
}

module.exports = namedcolors;
},{}],10:[function(_dereq_,module,exports){
function nearlyEqual(a, b, eps){
    if (typeof eps === "undefined") {eps = 0.01;}
    var diff = Math.abs(a - b);
    return (diff < eps);
}

var helpers = new Object(null);

helpers.nearlyEqual = nearlyEqual;

module.exports = helpers;
},{}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ViZW5wYWNrL0RvY3VtZW50cy93b3JrL2NvbG91ci5qcy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9lYmVucGFjay9Eb2N1bWVudHMvd29yay9jb2xvdXIuanMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIi9ob21lL2ViZW5wYWNrL0RvY3VtZW50cy93b3JrL2NvbG91ci5qcy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvZWJlbnBhY2svRG9jdW1lbnRzL3dvcmsvY29sb3VyLmpzL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9ob21lL2ViZW5wYWNrL0RvY3VtZW50cy93b3JrL2NvbG91ci5qcy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiL2hvbWUvZWJlbnBhY2svRG9jdW1lbnRzL3dvcmsvY29sb3VyLmpzL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIi9ob21lL2ViZW5wYWNrL0RvY3VtZW50cy93b3JrL2NvbG91ci5qcy9zcmMvY29sb3VyLmpzIiwiL2hvbWUvZWJlbnBhY2svRG9jdW1lbnRzL3dvcmsvY29sb3VyLmpzL3Rlc3QvZmFrZV9lOTE4NzlhZC5qcyIsIi9ob21lL2ViZW5wYWNrL0RvY3VtZW50cy93b3JrL2NvbG91ci5qcy90ZXN0cy9jb2xvdXIuanMiLCIvaG9tZS9lYmVucGFjay9Eb2N1bWVudHMvd29yay9jb2xvdXIuanMvdGVzdHMvZGF0YS9jb2xvcnMuanMiLCIvaG9tZS9lYmVucGFjay9Eb2N1bWVudHMvd29yay9jb2xvdXIuanMvdGVzdHMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWFBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHdoZW4gdXNlZCBpbiBub2RlLCB0aGlzIHdpbGwgYWN0dWFsbHkgbG9hZCB0aGUgdXRpbCBtb2R1bGUgd2UgZGVwZW5kIG9uXG4vLyB2ZXJzdXMgbG9hZGluZyB0aGUgYnVpbHRpbiB1dGlsIG1vZHVsZSBhcyBoYXBwZW5zIG90aGVyd2lzZVxuLy8gdGhpcyBpcyBhIGJ1ZyBpbiBub2RlIG1vZHVsZSBsb2FkaW5nIGFzIGZhciBhcyBJIGFtIGNvbmNlcm5lZFxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IHN0YWNrU3RhcnRGdW5jdGlvbi5uYW1lO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiBrZXlzO1xufTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgaHNsVG9SZ2IsIHJnYlRvSHNsLCBwYXJzZUNvbG9yLCBjYWNoZTtcbi8qKlxuICogQSBjb2xvciB3aXRoIGJvdGggcmdiIGFuZCBoc2wgcmVwcmVzZW50YXRpb25zLlxuICogQGNsYXNzIENvbG91clxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIEFueSBsZWdhbCBDU1MgY29sb3IgdmFsdWUgKGhleCwgY29sb3Iga2V5d29yZCwgcmdiW2FdLCBoc2xbYV0pLlxuICovXG5mdW5jdGlvbiBDb2xvdXIoY29sb3IsIGFscGhhKXtcbiAgICB2YXIgaHNsLCByZ2I7XG4gICAgdmFyIHBhcnNlZF9jb2xvciA9IHt9O1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgY29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoY29sb3IgaW4gY2FjaGUpe1xuICAgICAgICAgICAgcGFyc2VkX2NvbG9yID0gY2FjaGVbY29sb3JdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyc2VkX2NvbG9yID0gcGFyc2VDb2xvcihjb2xvcik7XG4gICAgICAgICAgICBjYWNoZVtjb2xvcl0gPSBwYXJzZWRfY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmdiID0gcGFyc2VkX2NvbG9yO1xuICAgICAgICBoc2wgPSByZ2JUb0hzbChwYXJzZWRfY29sb3IuciwgcGFyc2VkX2NvbG9yLmcsIHBhcnNlZF9jb2xvci5iKTtcbiAgICAgICAgYWxwaGEgPSBwYXJzZWRfY29sb3IuYSB8fCBhbHBoYSB8fCAxO1xuICAgIH0gZWxzZSBpZiAoJ3InIGluIGNvbG9yKXtcbiAgICAgICAgcmdiID0gY29sb3I7XG4gICAgICAgIGhzbCA9IHJnYlRvSHNsKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuICAgICAgICBhbHBoYSA9IGhzbC5hIHx8IGFscGhhIHx8IDE7XG4gICAgfSBlbHNlIGlmICgnaCcgaW4gY29sb3Ipe1xuICAgICAgICBoc2wgPSBjb2xvcjtcbiAgICAgICAgcmdiID0gaHNsVG9SZ2IoY29sb3IuaCwgY29sb3IucywgY29sb3IubCk7XG4gICAgICAgIGFscGhhID0gcmdiLmEgfHwgYWxwaGEgfHwgMTtcbiAgICB9XG4gICAgdGhpcy5yZ2IgPSB7J3InOiByZ2IuciwgJ2cnOiByZ2IuZywgJ2InOiByZ2IuYn07XG4gICAgdGhpcy5oc2wgPSB7J2gnOiBoc2wuaCwgJ3MnOiBoc2wucywgJ2wnOiBoc2wubH07XG4gICAgdGhpcy5hbHBoYSA9IGFscGhhO1xuICAgIC8vIFByZWNvbXB1dGUgYW5kIHN0b3JlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBjb2xvci5cbiAgICB0aGlzLl9jb2xvcl9zdHJpbmcgPSB0aGlzLl90b1N0cmluZygpO1xufVxuLyoqXG4gKiBMaWdodGVuIGEgY29sb3IgYnkgdGhlIGdpdmVuIHBlcmNlbnRhZ2UuXG5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSAge251bWJlcn0gcGVyY2VudFxuICogQHJldHVybiB7Q29sb3VyfVxuICovXG5Db2xvdXIucHJvdG90eXBlLmxpZ2h0ZW4gPSBmdW5jdGlvbihwZXJjZW50KXtcbiAgICB2YXIgaHNsID0gdGhpcy5oc2w7XG4gICAgdmFyIGx1bSA9IGhzbC5sICsgcGVyY2VudDtcbiAgICBpZiAobHVtID4gMTAwKXtcbiAgICAgICAgbHVtID0gMTAwO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG91cih7J2gnOmhzbC5oLCAncyc6aHNsLnMsICdsJzpsdW19LCB0aGlzLmFscGhhKTtcbn07XG4vKipcbiAqIERhcmtlbiBhIGNvbG9yIGJ5IHRoZSBnaXZlbiBwZXJjZW50YWdlLlxuICogQG1ldGhvZFxuICogQHBhcmFtICB7bnVtYmVyfSBwZXJjZW50XG4gKiBAcmV0dXJuIHtDb2xvdXJ9XG4gKi9cbkNvbG91ci5wcm90b3R5cGUuZGFya2VuID0gZnVuY3Rpb24ocGVyY2VudCl7XG4gICAgdmFyIGhzbCA9IHRoaXMuaHNsO1xuICAgIHZhciBsdW0gPSBoc2wubCAtIHBlcmNlbnQ7XG4gICAgaWYgKGx1bSA8IDApe1xuICAgICAgICBsdW0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG91cih7J2gnOmhzbC5oLCAncyc6aHNsLnMsICdsJzpsdW19LCB0aGlzLmFscGhhKTtcbn07XG4vKipcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBjb2xvciBpbiAjaGV4IGZvcm0uXG4gKiBAbWV0aG9kXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbkNvbG91ci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY29sb3Jfc3RyaW5nO1xufTtcblxuQ29sb3VyLnByb3RvdHlwZS5fdG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHZhciByID0gdGhpcy5yZ2Iuci50b1N0cmluZygxNik7XG4gICAgdmFyIGcgPSB0aGlzLnJnYi5nLnRvU3RyaW5nKDE2KTtcbiAgICB2YXIgYiA9IHRoaXMucmdiLmIudG9TdHJpbmcoMTYpO1xuICAgIC8vIFplcm8gZmlsbFxuICAgIGlmIChyLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIHIgPSBcIjBcIiArIHI7XG4gICAgfVxuICAgIGlmIChnLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGcgPSBcIjBcIiArIGc7XG4gICAgfVxuICAgIGlmIChiLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGIgPSBcIjBcIiArIGI7XG4gICAgfVxuICAgIHJldHVybiBcIiNcIiArIHIgKyBnICsgYjtcbn07XG4vKipcbiogQHBhcmFtIHtudW1iZXJ9IGggSHVlXG4qIEBwYXJhbSB7bnVtYmVyfSBzIFNhdHVyYXRpb25cbiogQHBhcmFtIHtudW1iZXJ9IGwgTHVtaW5hbmNlXG4qIEByZXR1cm4ge3tyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyfX1cbiovXG5oc2xUb1JnYiA9IGZ1bmN0aW9uKGgsIHMsIGwpe1xuICAgIGZ1bmN0aW9uIF92KG0xLCBtMiwgaHVlKXtcbiAgICAgICAgaHVlID0gaHVlO1xuICAgICAgICBpZiAoaHVlIDwgMCl7aHVlKz0xO31cbiAgICAgICAgaWYgKGh1ZSA+IDEpe2h1ZS09MTt9XG4gICAgICAgIGlmIChodWUgPCAoMS82KSl7XG4gICAgICAgICAgICByZXR1cm4gbTEgKyAobTItbTEpKmh1ZSo2O1xuICAgICAgICB9XG4gICAgICAgIGlmIChodWUgPCAwLjUpe1xuICAgICAgICAgICAgcmV0dXJuIG0yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChodWUgPCAoMi8zKSl7XG4gICAgICAgICAgICByZXR1cm4gbTEgKyAobTItbTEpKigoMi8zKS1odWUpKjY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0xO1xuICAgIH1cbiAgICB2YXIgbTI7XG4gICAgdmFyIGZyYWN0aW9uX2wgPSAobC8xMDApO1xuICAgIHZhciBmcmFjdGlvbl9zID0gKHMvMTAwKTtcbiAgICBpZiAocyA9PT0gMCl7XG4gICAgICAgIHZhciBncmF5ID0gZnJhY3Rpb25fbCoyNTU7XG4gICAgICAgIHJldHVybiB7J3InOiBncmF5LCAnZyc6IGdyYXksICdiJzogZ3JheX07XG4gICAgfVxuICAgIGlmIChsIDw9IDUwKXtcbiAgICAgICAgbTIgPSBmcmFjdGlvbl9sICogKDErZnJhY3Rpb25fcyk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICAgIG0yID0gZnJhY3Rpb25fbCtmcmFjdGlvbl9zLShmcmFjdGlvbl9sKmZyYWN0aW9uX3MpO1xuICAgIH1cbiAgICB2YXIgbTEgPSAyKmZyYWN0aW9uX2wgLSBtMjtcbiAgICBoID0gaCAvIDM2MDtcbiAgICByZXR1cm4geydyJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgrKDEvMykpKjI1NSksICdnJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgpKjI1NSksICdiJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgtKDEvMykpKjI1NSl9O1xufTtcbi8qKlxuICogQHBhcmFtICB7bnVtYmVyfSByIFJlZFxuICogQHBhcmFtICB7bnVtYmVyfSBnIEdyZWVuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGIgQmx1ZVxuICogQHJldHVybiB7e2g6IG51bWJlciwgczogbnVtYmVyLCBsOiBudW1iZXJ9fVxuICovXG5yZ2JUb0hzbCA9IGZ1bmN0aW9uKHIsIGcsIGIpe1xuICAgIHIgPSByIC8gMjU1O1xuICAgIGcgPSBnIC8gMjU1O1xuICAgIGIgPSBiIC8gMjU1O1xuICAgIHZhciBtYXhjID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgdmFyIG1pbmMgPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICB2YXIgbCA9IE1hdGgucm91bmQoKChtaW5jK21heGMpLzIpKjEwMCk7XG4gICAgaWYgKGwgPiAxMDApIHtsID0gMTAwO31cbiAgICBpZiAobCA8IDApIHtsID0gMDt9XG4gICAgdmFyIGgsIHM7XG4gICAgaWYgKG1pbmMgPT09IG1heGMpe1xuICAgICAgICByZXR1cm4geydoJzogMCwgJ3MnOiAwLCAnbCc6IGx9O1xuICAgIH1cbiAgICBpZiAobCA8PSA1MCl7XG4gICAgICAgIHMgPSAobWF4Yy1taW5jKSAvIChtYXhjK21pbmMpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBzID0gKG1heGMtbWluYykgLyAoMi1tYXhjLW1pbmMpO1xuICAgIH1cbiAgICB2YXIgcmMgPSAobWF4Yy1yKSAvIChtYXhjLW1pbmMpO1xuICAgIHZhciBnYyA9IChtYXhjLWcpIC8gKG1heGMtbWluYyk7XG4gICAgdmFyIGJjID0gKG1heGMtYikgLyAobWF4Yy1taW5jKTtcbiAgICBpZiAociA9PT0gbWF4Yyl7XG4gICAgICAgIGggPSBiYy1nYztcbiAgICB9XG4gICAgZWxzZSBpZiAoZyA9PT0gbWF4Yyl7XG4gICAgICAgIGggPSAyK3JjLWJjO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBoID0gNCtnYy1yYztcbiAgICB9XG4gICAgaCA9IChoLzYpICUgMTtcbiAgICBpZiAoaCA8IDApe2grPTE7fVxuICAgIGggPSBNYXRoLnJvdW5kKGgqMzYwKTtcbiAgICBzID0gTWF0aC5yb3VuZChzKjEwMCk7XG4gICAgaWYgKGggPiAzNjApIHtoID0gMzYwO31cbiAgICBpZiAoaCA8IDApIHtoID0gMDt9XG4gICAgaWYgKHMgPiAxMDApIHtzID0gMTAwO31cbiAgICBpZiAocyA8IDApIHtzID0gMDt9XG4gICAgcmV0dXJuIHsnaCc6IGgsICdzJzogcywgJ2wnOiBsfTtcbn07XG4vLyBDbGFtcCB4IGFuZCB5IHZhbHVlcyB0byBtaW4gYW5kIG1heFxuZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpe1xuICAgIGlmICh4IDwgbWluKXt4ID0gbWluO31cbiAgICBlbHNlIGlmICh4ID4gbWF4KXt4ID0gbWF4O31cbiAgICByZXR1cm4geDtcbn1cbi8qKlxuICogUGFyc2UgYSBDU1MgY29sb3IgdmFsdWUgYW5kIHJldHVybiBhbiByZ2JhIGNvbG9yIG9iamVjdC5cbiAqIEBwYXJhbSAge3N0cmluZ30gY29sb3IgQSBsZWdhbCBDU1MgY29sb3IgdmFsdWUgKGhleCwgY29sb3Iga2V5d29yZCwgcmdiW2FdLCBoc2xbYV0pLlxuICogQHJldHVybiB7e3I6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcn19ICAgcmdiYSBjb2xvciBvYmplY3QuXG4gKiBAdGhyb3dzIHtDb2xvdXJFcnJvcn0gSWYgaWxsZWdhbCBjb2xvciB2YWx1ZSBpcyBwYXNzZWQuXG4gKi9cbnBhcnNlQ29sb3IgPSBmdW5jdGlvbihjb2xvcil7XG4gICAgdmFyIHJlZCwgZ3JlZW4sIGJsdWUsIGh1ZSwgc2F0LCBsdW07XG4gICAgdmFyIGFscGhhID0gMTtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIGVycm9yID0gZmFsc2U7XG4gICAgdmFyIHByZWYgPSBjb2xvci5zdWJzdHIoMCwzKTsgLy8gVGhyZWUgbGV0dGVyIGNvbG9yIHByZWZpeFxuICAgIC8vIEhTTChhKVxuICAgIGlmIChwcmVmID09PSAnaHNsJyl7XG4gICAgICAgIHZhciBoc2xfcmVnZXggPSAvaHNsYT9cXChcXHMqKC0/XFxkKylcXHMqLFxccyooLT9cXGQrKSVcXHMqLFxccyooLT9cXGQrKSVcXHMqKCxcXHMqKC0/XFxkKyhcXC5cXGQrKT8pXFxzKik/XFwpL2c7XG4gICAgICAgIG1hdGNoID0gaHNsX3JlZ2V4LmV4ZWMoY29sb3IpO1xuICAgICAgICBpZiAobWF0Y2gpe1xuICAgICAgICAgICAgaHVlID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIHNhdCA9IHBhcnNlSW50KG1hdGNoWzJdLCAxMCk7XG4gICAgICAgICAgICBsdW0gPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICAgICAgaWYgKGNvbG9yWzNdID09PSAnYScpe1xuICAgICAgICAgICAgICAgIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs1XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodWUgPSBNYXRoLmFicyhodWUgJSAzNjApO1xuICAgICAgICAgICAgc2F0ID0gY2xhbXAoc2F0LCAwLCAxMDApO1xuICAgICAgICAgICAgbHVtID0gY2xhbXAobHVtLCAwLCAxMDApO1xuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IGhzbFRvUmdiKGh1ZSwgc2F0LCBsdW0pO1xuICAgICAgICAgICAgcmVkID0gcGFyc2VkLnI7XG4gICAgICAgICAgICBncmVlbiA9IHBhcnNlZC5nO1xuICAgICAgICAgICAgYmx1ZSA9IHBhcnNlZC5iO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgLy8gUkdCKGEpXG4gICAgfSBlbHNlIGlmIChwcmVmID09PSAncmdiJyl7XG4gICAgICAgIHZhciByZ2JfcmVnZXggPSAvcmdiYT9cXCgoLT9cXGQrJT8pXFxzKixcXHMqKC0/XFxkKyU/KVxccyosXFxzKigtP1xcZCslPykoLFxccyooLT9cXGQrKFxcLlxcZCspPylcXHMqKT9cXCkvZztcbiAgICAgICAgbWF0Y2ggPSByZ2JfcmVnZXguZXhlYyhjb2xvcik7XG4gICAgICAgIGlmIChtYXRjaCl7XG4gICAgICAgICAgICB2YXIgbTEgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIHZhciBtMiA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgdmFyIG0zID0gbWF0Y2hbM107XG4gICAgICAgICAgICByZWQgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChtYXRjaFsyXSwgMTApO1xuICAgICAgICAgICAgYmx1ZSA9IHBhcnNlSW50KG1hdGNoWzNdLCAxMCk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB1c2luZyByZ2IoYSkgcGVyY2VudGFnZSB2YWx1ZXMuXG4gICAgICAgICAgICBpZiAobTFbbTEubGVuZ3RoLTFdID09PSAnJScgfHxcbiAgICAgICAgICAgICAgICBtMlttMi5sZW5ndGgtMV0gPT09ICclJyB8fFxuICAgICAgICAgICAgICAgIG0zW20zLmxlbmd0aC0xXSA9PT0gJyUnKXtcbiAgICAgICAgICAgICAgICAvLyBBbGwgdmFsdWVzIG11c3QgYmUgcGVyY2V0YWdlLlxuICAgICAgICAgICAgICAgIGlmIChtMVttMS5sZW5ndGgtMV0gPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBtMlttMi5sZW5ndGgtMV0gPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBtM1ttMy5sZW5ndGgtMV0gPT09ICclJyl7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gMjU1XG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IE1hdGguZmxvb3IocmVkLzEwMCAqIDI1NSk7XG4gICAgICAgICAgICAgICAgICAgIGdyZWVuID0gTWF0aC5mbG9vcihncmVlbi8xMDAgKiAyNTUpO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gTWF0aC5mbG9vcihibHVlLzEwMCAqIDI1NSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZCA9IGNsYW1wKHJlZCwgMCwgMjU1KTtcbiAgICAgICAgICAgIGdyZWVuID0gY2xhbXAoZ3JlZW4sIDAsIDI1NSk7XG4gICAgICAgICAgICBibHVlID0gY2xhbXAoYmx1ZSwgMCwgMjU1KTtcbiAgICAgICAgICAgIGlmIChjb2xvclszXSA9PT0gJ2EnKXtcbiAgICAgICAgICAgICAgICBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgLy8gSEVYXG4gICAgfSBlbHNlIGlmIChjb2xvclswXSA9PT0gJyMnKXtcbiAgICAgICAgdmFyIGhleCA9IGNvbG9yLnN1YnN0cigxKTtcbiAgICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpe1xuICAgICAgICAgICAgcmVkID0gcGFyc2VJbnQoaGV4WzBdK2hleFswXSwgMTYpO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChoZXhbMV0raGV4WzFdLCAxNik7XG4gICAgICAgICAgICBibHVlID0gcGFyc2VJbnQoaGV4WzJdK2hleFsyXSwgMTYpO1xuICAgICAgICB9IGVsc2UgaWYgKGhleC5sZW5ndGggPT09IDYpe1xuICAgICAgICAgICAgcmVkID0gcGFyc2VJbnQoaGV4WzBdK2hleFsxXSwgMTYpO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChoZXhbMl0raGV4WzNdLCAxNik7XG4gICAgICAgICAgICBibHVlID0gcGFyc2VJbnQoaGV4WzRdK2hleFs1XSwgMTYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgIH1cblxuICAgIGFscGhhID0gY2xhbXAoYWxwaGEsIDAsIDEpO1xuXG4gICAgaWYgKGVycm9yKXtcbiAgICAgICAgdGhyb3cgXCJDb2xvdXJFcnJvcjogU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBlcmhhcHMgXCIgKyBjb2xvciArIFwiIGlzIG5vdCBhIGxlZ2FsIENTUyBjb2xvciB2YWx1ZVwiO1xuICAgIH1cbiAgICByZXR1cm4geydyJzogcmVkLCAnZyc6IGdyZWVuLCAnYic6IGJsdWUsICdhJzogYWxwaGF9O1xufTtcbi8vIFByZS13YXJtIHRoZSBjYWNoZSB3aXRoIG5hbWVkIGNvbG9ycywgYXMgdGhlc2UgYXJlIG5vdFxuLy8gY29udmVydGVkIHRvIHJnYiB2YWx1ZXMgYnkgdGhlIHBhcnNlQ29sb3IgZnVuY3Rpb24gYWJvdmUuXG5jYWNoZSA9IHtcbiAgICBcImJsYWNrXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAwLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiAwfSxcbiAgICBcInNpbHZlclwiOiB7XCJyXCI6IDE5MiwgXCJnXCI6IDE5MiwgXCJiXCI6IDE5MiwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogNzV9LFxuICAgIFwiZ3JheVwiOiB7XCJyXCI6IDEyOCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogNTB9LFxuICAgIFwid2hpdGVcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDEwMH0sXG4gICAgXCJtYXJvb25cIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAwLCBcImJcIjogMCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJyZWRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAwLCBcImJcIjogMCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJwdXJwbGVcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAwLCBcImJcIjogMTI4LCBcImhcIjogMzAwLCBcInNcIjogMTAwLCBcImxcIjogMjV9LFxuICAgIFwiZnVjaHNpYVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDAsIFwiYlwiOiAyNTUsIFwiaFwiOiAzMDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMjgsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogMjV9LFxuICAgIFwibGltZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyNTUsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwib2xpdmVcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAxMjgsIFwiYlwiOiAwLCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJ5ZWxsb3dcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAwLCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJuYXZ5XCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAxMjgsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAyNTUsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJ0ZWFsXCI6IHtcInJcIjogMCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDI1fSxcbiAgICBcImFxdWFcIjoge1wiclwiOiAwLCBcImdcIjogMjU1LCBcImJcIjogMjU1LCBcImhcIjogMTgwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwib3JhbmdlXCI6IHtcInJcIjogMjU1LCBcImdcIjogMTY1LCBcImJcIjogMCwgXCJoXCI6IDM5LCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwiYWxpY2VibHVlXCI6IHtcInJcIjogMjQwLCBcImdcIjogMjQ4LCBcImJcIjogMjU1LCBcImhcIjogMjA4LCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwiYW50aXF1ZXdoaXRlXCI6IHtcInJcIjogMjUwLCBcImdcIjogMjM1LCBcImJcIjogMjE1LCBcImhcIjogMzQsIFwic1wiOiA3OCwgXCJsXCI6IDkxfSxcbiAgICBcImFxdWFtYXJpbmVcIjoge1wiclwiOiAxMjcsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyMTIsIFwiaFwiOiAxNjAsIFwic1wiOiAxMDAsIFwibFwiOiA3NX0sXG4gICAgXCJhenVyZVwiOiB7XCJyXCI6IDI0MCwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk3fSxcbiAgICBcImJlaWdlXCI6IHtcInJcIjogMjQ1LCBcImdcIjogMjQ1LCBcImJcIjogMjIwLCBcImhcIjogNjAsIFwic1wiOiA1NiwgXCJsXCI6IDkxfSxcbiAgICBcImJpc3F1ZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIyOCwgXCJiXCI6IDE5NiwgXCJoXCI6IDMzLCBcInNcIjogMTAwLCBcImxcIjogODh9LFxuICAgIFwiYmxhbmNoZWRhbG1vbmRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyMzUsIFwiYlwiOiAyMDUsIFwiaFwiOiAzNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDkwfSxcbiAgICBcImJsdWV2aW9sZXRcIjoge1wiclwiOiAxMzgsIFwiZ1wiOiA0MywgXCJiXCI6IDIyNiwgXCJoXCI6IDI3MSwgXCJzXCI6IDc2LCBcImxcIjogNTN9LFxuICAgIFwiYnJvd25cIjoge1wiclwiOiAxNjUsIFwiZ1wiOiA0MiwgXCJiXCI6IDQyLCBcImhcIjogMCwgXCJzXCI6IDU5LCBcImxcIjogNDF9LFxuICAgIFwiYnVybHl3b29kXCI6IHtcInJcIjogMjIyLCBcImdcIjogMTg0LCBcImJcIjogMTM1LCBcImhcIjogMzQsIFwic1wiOiA1NywgXCJsXCI6IDcwfSxcbiAgICBcImNhZGV0Ymx1ZVwiOiB7XCJyXCI6IDk1LCBcImdcIjogMTU4LCBcImJcIjogMTYwLCBcImhcIjogMTgyLCBcInNcIjogMjUsIFwibFwiOiA1MH0sXG4gICAgXCJjaGFydHJldXNlXCI6IHtcInJcIjogMTI3LCBcImdcIjogMjU1LCBcImJcIjogMCwgXCJoXCI6IDkwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwiY2hvY29sYXRlXCI6IHtcInJcIjogMjEwLCBcImdcIjogMTA1LCBcImJcIjogMzAsIFwiaFwiOiAyNSwgXCJzXCI6IDc1LCBcImxcIjogNDd9LFxuICAgIFwiY29yYWxcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxMjcsIFwiYlwiOiA4MCwgXCJoXCI6IDE2LCBcInNcIjogMTAwLCBcImxcIjogNjZ9LFxuICAgIFwiY29ybmZsb3dlcmJsdWVcIjoge1wiclwiOiAxMDAsIFwiZ1wiOiAxNDksIFwiYlwiOiAyMzcsIFwiaFwiOiAyMTksIFwic1wiOiA3OSwgXCJsXCI6IDY2fSxcbiAgICBcImNvcm5zaWxrXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjQ4LCBcImJcIjogMjIwLCBcImhcIjogNDgsIFwic1wiOiAxMDAsIFwibFwiOiA5M30sXG4gICAgXCJjeWFuXCI6IHtcInJcIjogMCxcImdcIjogMjU1LFwiYlwiOiAyNTUsIFwiaFwiOiAxODAsXCJzXCI6IDEwMCxcImxcIjogOTd9LFxuICAgIFwiY3JpbXNvblwiOiB7XCJyXCI6IDIyMCwgXCJnXCI6IDIwLCBcImJcIjogNjAsIFwiaFwiOiAzNDgsIFwic1wiOiA4MywgXCJsXCI6IDQ3fSxcbiAgICBcImRhcmtibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAxMzksIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrY3lhblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMzksIFwiYlwiOiAxMzksIFwiaFwiOiAxODAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrZ29sZGVucm9kXCI6IHtcInJcIjogMTg0LCBcImdcIjogMTM0LCBcImJcIjogMTEsIFwiaFwiOiA0MywgXCJzXCI6IDg5LCBcImxcIjogMzh9LFxuICAgIFwiZGFya2dyYXlcIjoge1wiclwiOiAxNjksIFwiZ1wiOiAxNjksIFwiYlwiOiAxNjksIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDY2fSxcbiAgICBcImRhcmtncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMDAsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogMjB9LFxuICAgIFwiZGFya2dyZXlcIjoge1wiclwiOiAxNjksIFwiZ1wiOiAxNjksIFwiYlwiOiAxNjksIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDY2fSxcbiAgICBcImRhcmtraGFraVwiOiB7XCJyXCI6IDE4OSwgXCJnXCI6IDE4MywgXCJiXCI6IDEwNywgXCJoXCI6IDU2LCBcInNcIjogMzgsIFwibFwiOiA1OH0sXG4gICAgXCJkYXJrbWFnZW50YVwiOiB7XCJyXCI6IDEzOSwgXCJnXCI6IDAsIFwiYlwiOiAxMzksIFwiaFwiOiAzMDAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrb2xpdmVncmVlblwiOiB7XCJyXCI6IDg1LCBcImdcIjogMTA3LCBcImJcIjogNDcsIFwiaFwiOiA4MiwgXCJzXCI6IDM5LCBcImxcIjogMzB9LFxuICAgIFwiZGFya29yYW5nZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDE0MCwgXCJiXCI6IDAsIFwiaFwiOiAzMywgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcImRhcmtvcmNoaWRcIjoge1wiclwiOiAxNTMsIFwiZ1wiOiA1MCwgXCJiXCI6IDIwNCwgXCJoXCI6IDI4MCwgXCJzXCI6IDYxLCBcImxcIjogNTB9LFxuICAgIFwiZGFya3JlZFwiOiB7XCJyXCI6IDEzOSwgXCJnXCI6IDAsIFwiYlwiOiAwLCBcImhcIjogMCwgXCJzXCI6IDEwMCwgXCJsXCI6IDI3fSxcbiAgICBcImRhcmtzYWxtb25cIjoge1wiclwiOiAyMzMsIFwiZ1wiOiAxNTAsIFwiYlwiOiAxMjIsIFwiaFwiOiAxNSwgXCJzXCI6IDcyLCBcImxcIjogNzB9LFxuICAgIFwiZGFya3NlYWdyZWVuXCI6IHtcInJcIjogMTQzLCBcImdcIjogMTg4LCBcImJcIjogMTQzLCBcImhcIjogMTIwLCBcInNcIjogMjUsIFwibFwiOiA2NX0sXG4gICAgXCJkYXJrc2xhdGVibHVlXCI6IHtcInJcIjogNzIsIFwiZ1wiOiA2MSwgXCJiXCI6IDEzOSwgXCJoXCI6IDI0OCwgXCJzXCI6IDM5LCBcImxcIjogMzl9LFxuICAgIFwiZGFya3NsYXRlZ3JheVwiOiB7XCJyXCI6IDQ3LCBcImdcIjogNzksIFwiYlwiOiA3OSwgXCJoXCI6IDE4MCwgXCJzXCI6IDI1LCBcImxcIjogMjV9LFxuICAgIFwiZGFya3NsYXRlZ3JleVwiOiB7XCJyXCI6IDQ3LCBcImdcIjogNzksIFwiYlwiOiA3OSwgXCJoXCI6IDE4MCwgXCJzXCI6IDI1LCBcImxcIjogMjV9LFxuICAgIFwiZGFya3R1cnF1b2lzZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyMDksIFwiaFwiOiAxODEsIFwic1wiOiAxMDAsIFwibFwiOiA0MX0sXG4gICAgXCJkYXJrdmlvbGV0XCI6IHtcInJcIjogMTQ4LCBcImdcIjogMCwgXCJiXCI6IDIxMSwgXCJoXCI6IDI4MiwgXCJzXCI6IDEwMCwgXCJsXCI6IDQxfSxcbiAgICBcImRlZXBwaW5rXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjAsIFwiYlwiOiAxNDcsIFwiaFwiOiAzMjgsIFwic1wiOiAxMDAsIFwibFwiOiA1NH0sXG4gICAgXCJkZWVwc2t5Ymx1ZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxOTEsIFwiYlwiOiAyNTUsIFwiaFwiOiAxOTUsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJkaW1ncmF5XCI6IHtcInJcIjogMTA1LCBcImdcIjogMTA1LCBcImJcIjogMTA1LCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA0MX0sXG4gICAgXCJkaW1ncmV5XCI6IHtcInJcIjogMTA1LCBcImdcIjogMTA1LCBcImJcIjogMTA1LCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA0MX0sXG4gICAgXCJkb2RnZXJibHVlXCI6IHtcInJcIjogMzAsIFwiZ1wiOiAxNDQsIFwiYlwiOiAyNTUsIFwiaFwiOiAyMTAsIFwic1wiOiAxMDAsIFwibFwiOiA1Nn0sXG4gICAgXCJmaXJlYnJpY2tcIjoge1wiclwiOiAxNzgsIFwiZ1wiOiAzNCwgXCJiXCI6IDM0LCBcImhcIjogMCwgXCJzXCI6IDY4LCBcImxcIjogNDJ9LFxuICAgIFwiZmxvcmFsd2hpdGVcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTAsIFwiYlwiOiAyNDAsIFwiaFwiOiA0MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk3fSxcbiAgICBcImZvcmVzdGdyZWVuXCI6IHtcInJcIjogMzQsIFwiZ1wiOiAxMzksIFwiYlwiOiAzNCwgXCJoXCI6IDEyMCwgXCJzXCI6IDYxLCBcImxcIjogMzR9LFxuICAgIFwiZ2FpbnNib3JvXCI6IHtcInJcIjogMjIwLCBcImdcIjogMjIwLCBcImJcIjogMjIwLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA4Nn0sXG4gICAgXCJnaG9zdHdoaXRlXCI6IHtcInJcIjogMjQ4LCBcImdcIjogMjQ4LCBcImJcIjogMjU1LCBcImhcIjogMjQwLCBcInNcIjogMTAwLCBcImxcIjogOTl9LFxuICAgIFwiZ29sZFwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIxNSwgXCJiXCI6IDAsIFwiaFwiOiA1MSwgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcImdvbGRlbnJvZFwiOiB7XCJyXCI6IDIxOCwgXCJnXCI6IDE2NSwgXCJiXCI6IDMyLCBcImhcIjogNDMsIFwic1wiOiA3NCwgXCJsXCI6IDQ5fSxcbiAgICBcImdyZWVueWVsbG93XCI6IHtcInJcIjogMTczLCBcImdcIjogMjU1LCBcImJcIjogNDcsIFwiaFwiOiA4NCwgXCJzXCI6IDEwMCwgXCJsXCI6IDU5fSxcbiAgICBcImdyZXlcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAxMjgsIFwiYlwiOiAxMjgsIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDUwfSxcbiAgICBcImhvbmV5ZGV3XCI6IHtcInJcIjogMjQwLCBcImdcIjogMjU1LCBcImJcIjogMjQwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwiaG90cGlua1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDEwNSwgXCJiXCI6IDE4MCwgXCJoXCI6IDMzMCwgXCJzXCI6IDEwMCwgXCJsXCI6IDcxfSxcbiAgICBcImluZGlhbnJlZFwiOiB7XCJyXCI6IDIwNSwgXCJnXCI6IDkyLCBcImJcIjogOTIsIFwiaFwiOiAwLCBcInNcIjogNTMsIFwibFwiOiA1OH0sXG4gICAgXCJpbmRpZ29cIjoge1wiclwiOiA3NSwgXCJnXCI6IDAsIFwiYlwiOiAxMzAsIFwiaFwiOiAyNzUsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJpdm9yeVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI0MCwgXCJoXCI6IDYwLCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwia2hha2lcIjoge1wiclwiOiAyNDAsIFwiZ1wiOiAyMzAsIFwiYlwiOiAxNDAsIFwiaFwiOiA1NCwgXCJzXCI6IDc3LCBcImxcIjogNzV9LFxuICAgIFwibGF2ZW5kZXJcIjoge1wiclwiOiAyMzAsIFwiZ1wiOiAyMzAsIFwiYlwiOiAyNTAsIFwiaFwiOiAyNDAsIFwic1wiOiA2NywgXCJsXCI6IDk0fSxcbiAgICBcImxhdmVuZGVyYmx1c2hcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNDAsIFwiYlwiOiAyNDUsIFwiaFwiOiAzNDAsIFwic1wiOiAxMDAsIFwibFwiOiA5N30sXG4gICAgXCJsYXduZ3JlZW5cIjoge1wiclwiOiAxMjQsIFwiZ1wiOiAyNTIsIFwiYlwiOiAwLCBcImhcIjogOTAsIFwic1wiOiAxMDAsIFwibFwiOiA0OX0sXG4gICAgXCJsZW1vbmNoaWZmb25cIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTAsIFwiYlwiOiAyMDUsIFwiaFwiOiA1NCwgXCJzXCI6IDEwMCwgXCJsXCI6IDkwfSxcbiAgICBcImxpZ2h0Ymx1ZVwiOiB7XCJyXCI6IDE3MywgXCJnXCI6IDIxNiwgXCJiXCI6IDIzMCwgXCJoXCI6IDE5NSwgXCJzXCI6IDUzLCBcImxcIjogNzl9LFxuICAgIFwibGlnaHRjb3JhbFwiOiB7XCJyXCI6IDI0MCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDAsIFwic1wiOiA3OSwgXCJsXCI6IDcyfSxcbiAgICBcImxpZ2h0Y3lhblwiOiB7XCJyXCI6IDIyNCwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk0fSxcbiAgICBcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IHtcInJcIjogMjUwLCBcImdcIjogMjUwLCBcImJcIjogMjEwLCBcImhcIjogNjAsIFwic1wiOiA4MCwgXCJsXCI6IDkwfSxcbiAgICBcImxpZ2h0Z3JheVwiOiB7XCJyXCI6IDIxMSwgXCJnXCI6IDIxMSwgXCJiXCI6IDIxMSwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogODN9LFxuICAgIFwibGlnaHRncmVlblwiOiB7XCJyXCI6IDE0NCwgXCJnXCI6IDIzOCwgXCJiXCI6IDE0NCwgXCJoXCI6IDEyMCwgXCJzXCI6IDczLCBcImxcIjogNzV9LFxuICAgIFwibGlnaHRncmV5XCI6IHtcInJcIjogMjExLCBcImdcIjogMjExLCBcImJcIjogMjExLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA4M30sXG4gICAgXCJsaWdodHBpbmtcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxODIsIFwiYlwiOiAxOTMsIFwiaFwiOiAzNTEsIFwic1wiOiAxMDAsIFwibFwiOiA4Nn0sXG4gICAgXCJsaWdodHNhbG1vblwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDE2MCwgXCJiXCI6IDEyMiwgXCJoXCI6IDE3LCBcInNcIjogMTAwLCBcImxcIjogNzR9LFxuICAgIFwibGlnaHRzZWFncmVlblwiOiB7XCJyXCI6IDMyLCBcImdcIjogMTc4LCBcImJcIjogMTcwLCBcImhcIjogMTc3LCBcInNcIjogNzAsIFwibFwiOiA0MX0sXG4gICAgXCJsaWdodHNreWJsdWVcIjoge1wiclwiOiAxMzUsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyNTAsIFwiaFwiOiAyMDMsIFwic1wiOiA5MiwgXCJsXCI6IDc1fSxcbiAgICBcImxpZ2h0c2xhdGVncmF5XCI6IHtcInJcIjogMTE5LCBcImdcIjogMTM2LCBcImJcIjogMTUzLCBcImhcIjogMjEwLCBcInNcIjogMTQsIFwibFwiOiA1M30sXG4gICAgXCJsaWdodHNsYXRlZ3JleVwiOiB7XCJyXCI6IDExOSwgXCJnXCI6IDEzNiwgXCJiXCI6IDE1MywgXCJoXCI6IDIxMCwgXCJzXCI6IDE0LCBcImxcIjogNTN9LFxuICAgIFwibGlnaHRzdGVlbGJsdWVcIjoge1wiclwiOiAxNzYsIFwiZ1wiOiAxOTYsIFwiYlwiOiAyMjIsIFwiaFwiOiAyMTQsIFwic1wiOiA0MSwgXCJsXCI6IDc4fSxcbiAgICBcImxpZ2h0eWVsbG93XCI6IHtcInJcIjogMjU1LCBcImdcIjogMjU1LCBcImJcIjogMjI0LCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiA5NH0sXG4gICAgXCJsaW1lZ3JlZW5cIjoge1wiclwiOiA1MCwgXCJnXCI6IDIwNSwgXCJiXCI6IDUwLCBcImhcIjogMTIwLCBcInNcIjogNjEsIFwibFwiOiA1MH0sXG4gICAgXCJsaW5lblwiOiB7XCJyXCI6IDI1MCwgXCJnXCI6IDI0MCwgXCJiXCI6IDIzMCwgXCJoXCI6IDMwLCBcInNcIjogNjcsIFwibFwiOiA5NH0sXG4gICAgXCJtYWdlbnRhXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAwLFwiYlwiOiAyNTUsIFwiaFwiOiAxNyxcInNcIjogMTAwLFwibFwiOiA3NH0sXG4gICAgXCJtZWRpdW1hcXVhbWFyaW5lXCI6IHtcInJcIjogMTAyLCBcImdcIjogMjA1LCBcImJcIjogMTcwLCBcImhcIjogMTYwLCBcInNcIjogNTEsIFwibFwiOiA2MH0sXG4gICAgXCJtZWRpdW1ibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAyMDUsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiA0MH0sXG4gICAgXCJtZWRpdW1vcmNoaWRcIjoge1wiclwiOiAxODYsIFwiZ1wiOiA4NSwgXCJiXCI6IDIxMSwgXCJoXCI6IDI4OCwgXCJzXCI6IDU5LCBcImxcIjogNTh9LFxuICAgIFwibWVkaXVtcHVycGxlXCI6IHtcInJcIjogMTQ3LCBcImdcIjogMTEyLCBcImJcIjogMjE5LCBcImhcIjogMjYwLCBcInNcIjogNjAsIFwibFwiOiA2NX0sXG4gICAgXCJtZWRpdW1zZWFncmVlblwiOiB7XCJyXCI6IDYwLCBcImdcIjogMTc5LCBcImJcIjogMTEzLCBcImhcIjogMTQ3LCBcInNcIjogNTAsIFwibFwiOiA0N30sXG4gICAgXCJtZWRpdW1zbGF0ZWJsdWVcIjoge1wiclwiOiAxMjMsIFwiZ1wiOiAxMDQsIFwiYlwiOiAyMzgsIFwiaFwiOiAyNDksIFwic1wiOiA4MCwgXCJsXCI6IDY3fSxcbiAgICBcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IHtcInJcIjogMCwgXCJnXCI6IDI1MCwgXCJiXCI6IDE1NCwgXCJoXCI6IDE1NywgXCJzXCI6IDEwMCwgXCJsXCI6IDQ5fSxcbiAgICBcIm1lZGl1bXR1cnF1b2lzZVwiOiB7XCJyXCI6IDcyLCBcImdcIjogMjA5LCBcImJcIjogMjA0LCBcImhcIjogMTc4LCBcInNcIjogNjAsIFwibFwiOiA1NX0sXG4gICAgXCJtZWRpdW12aW9sZXRyZWRcIjoge1wiclwiOiAxOTksIFwiZ1wiOiAyMSwgXCJiXCI6IDEzMywgXCJoXCI6IDMyMiwgXCJzXCI6IDgxLCBcImxcIjogNDN9LFxuICAgIFwibWlkbmlnaHRibHVlXCI6IHtcInJcIjogMjUsIFwiZ1wiOiAyNSwgXCJiXCI6IDExMiwgXCJoXCI6IDI0MCwgXCJzXCI6IDY0LCBcImxcIjogMjd9LFxuICAgIFwibWludGNyZWFtXCI6IHtcInJcIjogMjQ1LCBcImdcIjogMjU1LCBcImJcIjogMjUwLCBcImhcIjogMTUwLCBcInNcIjogMTAwLCBcImxcIjogOTh9LFxuICAgIFwibWlzdHlyb3NlXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjI4LCBcImJcIjogMjI1LCBcImhcIjogNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDk0fSxcbiAgICBcIm1vY2Nhc2luXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjI4LCBcImJcIjogMTgxLCBcImhcIjogMzgsIFwic1wiOiAxMDAsIFwibFwiOiA4NX0sXG4gICAgXCJuYXZham93aGl0ZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIyMiwgXCJiXCI6IDE3MywgXCJoXCI6IDM2LCBcInNcIjogMTAwLCBcImxcIjogODR9LFxuICAgIFwib2xkbGFjZVwiOiB7XCJyXCI6IDI1MywgXCJnXCI6IDI0NSwgXCJiXCI6IDIzMCwgXCJoXCI6IDM5LCBcInNcIjogODUsIFwibFwiOiA5NX0sXG4gICAgXCJvbGl2ZWRyYWJcIjoge1wiclwiOiAxMDcsIFwiZ1wiOiAxNDIsIFwiYlwiOiAzNSwgXCJoXCI6IDgwLCBcInNcIjogNjAsIFwibFwiOiAzNX0sXG4gICAgXCJvcmFuZ2VyZWRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiA2OSwgXCJiXCI6IDAsIFwiaFwiOiAxNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcIm9yY2hpZFwiOiB7XCJyXCI6IDIxOCwgXCJnXCI6IDExMiwgXCJiXCI6IDIxNCwgXCJoXCI6IDMwMiwgXCJzXCI6IDU5LCBcImxcIjogNjV9LFxuICAgIFwicGFsZWdvbGRlbnJvZFwiOiB7XCJyXCI6IDIzOCwgXCJnXCI6IDIzMiwgXCJiXCI6IDE3MCwgXCJoXCI6IDU1LCBcInNcIjogNjcsIFwibFwiOiA4MH0sXG4gICAgXCJwYWxlZ3JlZW5cIjoge1wiclwiOiAxNTIsIFwiZ1wiOiAyNTEsIFwiYlwiOiAxNTIsIFwiaFwiOiAxMjAsIFwic1wiOiA5MywgXCJsXCI6IDc5fSxcbiAgICBcInBhbGV0dXJxdW9pc2VcIjoge1wiclwiOiAxNzUsIFwiZ1wiOiAyMzgsIFwiYlwiOiAyMzgsIFwiaFwiOiAxODAsIFwic1wiOiA2NSwgXCJsXCI6IDgxfSxcbiAgICBcInBhbGV2aW9sZXRyZWRcIjoge1wiclwiOiAyMTksIFwiZ1wiOiAxMTIsIFwiYlwiOiAxNDcsIFwiaFwiOiAzNDAsIFwic1wiOiA2MCwgXCJsXCI6IDY1fSxcbiAgICBcInBhcGF5YXdoaXBcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyMzksIFwiYlwiOiAyMTMsIFwiaFwiOiAzNywgXCJzXCI6IDEwMCwgXCJsXCI6IDkyfSxcbiAgICBcInBlYWNocHVmZlwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIxOCwgXCJiXCI6IDE4NSwgXCJoXCI6IDI4LCBcInNcIjogMTAwLCBcImxcIjogODZ9LFxuICAgIFwicGVydVwiOiB7XCJyXCI6IDIwNSwgXCJnXCI6IDEzMywgXCJiXCI6IDYzLCBcImhcIjogMzAsIFwic1wiOiA1OSwgXCJsXCI6IDUzfSxcbiAgICBcInBpbmtcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxOTIsIFwiYlwiOiAyMDMsIFwiaFwiOiAzNTAsIFwic1wiOiAxMDAsIFwibFwiOiA4OH0sXG4gICAgXCJwbHVtXCI6IHtcInJcIjogMjIxLCBcImdcIjogMTYwLCBcImJcIjogMjIxLCBcImhcIjogMzAwLCBcInNcIjogNDcsIFwibFwiOiA3NX0sXG4gICAgXCJwb3dkZXJibHVlXCI6IHtcInJcIjogMTc2LCBcImdcIjogMjI0LCBcImJcIjogMjMwLCBcImhcIjogMTg3LCBcInNcIjogNTIsIFwibFwiOiA4MH0sXG4gICAgXCJyb3N5YnJvd25cIjoge1wiclwiOiAxODgsIFwiZ1wiOiAxNDMsIFwiYlwiOiAxNDMsIFwiaFwiOiAwLCBcInNcIjogMjUsIFwibFwiOiA2NX0sXG4gICAgXCJyb3lhbGJsdWVcIjoge1wiclwiOiA2NSwgXCJnXCI6IDEwNSwgXCJiXCI6IDIyNSwgXCJoXCI6IDIyNSwgXCJzXCI6IDczLCBcImxcIjogNTd9LFxuICAgIFwic2FkZGxlYnJvd25cIjoge1wiclwiOiAxMzksIFwiZ1wiOiA2OSwgXCJiXCI6IDE5LCBcImhcIjogMjUsIFwic1wiOiA3NiwgXCJsXCI6IDMxfSxcbiAgICBcInNhbG1vblwiOiB7XCJyXCI6IDI1MCwgXCJnXCI6IDEyOCwgXCJiXCI6IDExNCwgXCJoXCI6IDYsIFwic1wiOiA5MywgXCJsXCI6IDcxfSxcbiAgICBcInNhbmR5YnJvd25cIjoge1wiclwiOiAyNDQsIFwiZ1wiOiAxNjQsIFwiYlwiOiA5NiwgXCJoXCI6IDI4LCBcInNcIjogODcsIFwibFwiOiA2N30sXG4gICAgXCJzZWFncmVlblwiOiB7XCJyXCI6IDQ2LCBcImdcIjogMTM5LCBcImJcIjogODcsIFwiaFwiOiAxNDYsIFwic1wiOiA1MCwgXCJsXCI6IDM2fSxcbiAgICBcInNlYXNoZWxsXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjQ1LCBcImJcIjogMjM4LCBcImhcIjogMjUsIFwic1wiOiAxMDAsIFwibFwiOiA5N30sXG4gICAgXCJzaWVubmFcIjoge1wiclwiOiAxNjAsIFwiZ1wiOiA4MiwgXCJiXCI6IDQ1LCBcImhcIjogMTksIFwic1wiOiA1NiwgXCJsXCI6IDQwfSxcbiAgICBcInNreWJsdWVcIjoge1wiclwiOiAxMzUsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyMzUsIFwiaFwiOiAxOTcsIFwic1wiOiA3MSwgXCJsXCI6IDczfSxcbiAgICBcInNsYXRlYmx1ZVwiOiB7XCJyXCI6IDEwNiwgXCJnXCI6IDkwLCBcImJcIjogMjA1LCBcImhcIjogMjQ4LCBcInNcIjogNTMsIFwibFwiOiA1OH0sXG4gICAgXCJzbGF0ZWdyYXlcIjoge1wiclwiOiAxMTIsIFwiZ1wiOiAxMjgsIFwiYlwiOiAxNDQsIFwiaFwiOiAyMTAsIFwic1wiOiAxMywgXCJsXCI6IDUwfSxcbiAgICBcInNsYXRlZ3JleVwiOiB7XCJyXCI6IDExMiwgXCJnXCI6IDEyOCwgXCJiXCI6IDE0NCwgXCJoXCI6IDIxMCwgXCJzXCI6IDEzLCBcImxcIjogNTB9LFxuICAgIFwic25vd1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDI1MCwgXCJiXCI6IDI1MCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiA5OX0sXG4gICAgXCJzcHJpbmdncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyNTUsIFwiYlwiOiAxMjcsIFwiaFwiOiAxNTAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJzdGVlbGJsdWVcIjoge1wiclwiOiA3MCwgXCJnXCI6IDEzMCwgXCJiXCI6IDE4MCwgXCJoXCI6IDIwNywgXCJzXCI6IDQ0LCBcImxcIjogNDl9LFxuICAgIFwidGFuXCI6IHtcInJcIjogMjEwLCBcImdcIjogMTgwLCBcImJcIjogMTQwLCBcImhcIjogMzQsIFwic1wiOiA0NCwgXCJsXCI6IDY5fSxcbiAgICBcInRoaXN0bGVcIjoge1wiclwiOiAyMTYsIFwiZ1wiOiAxOTEsIFwiYlwiOiAyMTYsIFwiaFwiOiAzMDAsIFwic1wiOiAyNCwgXCJsXCI6IDgwfSxcbiAgICBcInRvbWF0b1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDk5LCBcImJcIjogNzEsIFwiaFwiOiA5LCBcInNcIjogMTAwLCBcImxcIjogNjR9LFxuICAgIFwidHVycXVvaXNlXCI6IHtcInJcIjogNjQsIFwiZ1wiOiAyMjQsIFwiYlwiOiAyMDgsIFwiaFwiOiAxNzQsIFwic1wiOiA3MiwgXCJsXCI6IDU2fSxcbiAgICBcInZpb2xldFwiOiB7XCJyXCI6IDIzOCwgXCJnXCI6IDEzMCwgXCJiXCI6IDIzOCwgXCJoXCI6IDMwMCwgXCJzXCI6IDc2LCBcImxcIjogNzJ9LFxuICAgIFwid2hlYXRcIjoge1wiclwiOiAyNDUsIFwiZ1wiOiAyMjIsIFwiYlwiOiAxNzksIFwiaFwiOiAzOSwgXCJzXCI6IDc3LCBcImxcIjogODN9LFxuICAgIFwid2hpdGVzbW9rZVwiOiB7XCJyXCI6IDI0NSwgXCJnXCI6IDI0NSwgXCJiXCI6IDI0NSwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogOTZ9LFxuICAgIFwieWVsbG93Z3JlZW5cIjoge1wiclwiOiAxNTQsIFwiZ1wiOiAyMDUsIFwiYlwiOiA1MCwgXCJoXCI6IDgwLCBcInNcIjogNjEsIFwibFwiOiA1MH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3VyO1xuIiwicmVxdWlyZSgnLi8uLi90ZXN0cy9jb2xvdXIuanMnKTtcbnJlcXVpcmUoJy4vLi4vdGVzdHMvaGVscGVycy5qcycpO1xucmVxdWlyZSgnLi8uLi90ZXN0cy9kYXRhL2NvbG9ycy5qcycpO1xuIiwidmFyIENvbG91ciA9IHJlcXVpcmUoJy4uL3NyYy9jb2xvdXIuanMnKTtcbnZhciBuYW1lZCA9IHJlcXVpcmUoJy4vZGF0YS9jb2xvcnMuanMnKTtcbnZhciBuZWFybHlFcXVhbCA9IHJlcXVpcmUoJy4vaGVscGVycy5qcycpWyduZWFybHlFcXVhbCddO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5cbnN1aXRlKCdDb2xvdXInLCBmdW5jdGlvbigpe1xuICAgIHZhciByZWQsIGdyZWVuLCBibHVlLCByZ2IsIHJnYmEsIGhzbCwgaHNsYSwgcmdiX3BlciwgcmdiX2JhZDEsIHJnYl9iYWQyLCByZ2JfYmFkMywgaHNsX2JhZDEsIGhzbF9iYWQyO1xuICAgIHNldHVwKGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlZCA9IG5ldyBDb2xvdXIoXCJyZWRcIik7XG4gICAgICAgIGdyZWVuID0gbmV3IENvbG91cihcIiMwRjBcIik7IC8vIE5hbWVkIGNvbG9yICdncmVlbicgaXMgcmdiKDAsMTI4LDApXG4gICAgICAgIGJsdWUgPSBuZXcgQ29sb3VyKFwiYmx1ZVwiKTtcbiAgICAgICAgcmdiID0gbmV3IENvbG91cihcInJnYigxLCA3LCAyOSlcIik7XG4gICAgICAgIHJnYmEgPSBuZXcgQ29sb3VyKFwicmdiYSgxLCA3LCAyOSwgMC4zKVwiKTtcbiAgICAgICAgcmdiX3BlciA9IG5ldyBDb2xvdXIoXCJyZ2JhKDEwMCUsIDAlLCAwJSwgMSlcIik7XG4gICAgICAgIGhzbCA9IG5ldyBDb2xvdXIoXCJoc2woMCwgMTAwJSwgNTAlKVwiKTtcbiAgICAgICAgaHNsYSA9IG5ldyBDb2xvdXIoXCJoc2xhKDAsIDEwMCUsIDUwJSwgMC4zIClcIik7XG5cbiAgICAgICAgLy8gVGhlc2UgYXJlIHBvb3JseSBmb3JtYXR0ZWQgY29sb3JzLCBidXQgdGhleSBzaG91bGQgc3RpbGwgd29yay5cbiAgICAgICAgcmdiX2JhZDEgPSBuZXcgQ29sb3VyKFwicmdiKDMwMCwwLDApXCIpO1xuICAgICAgICByZ2JfYmFkMiA9IG5ldyBDb2xvdXIoXCJyZ2IoMjU1LC0xMCwwKVwiKTtcbiAgICAgICAgcmdiX2JhZDMgPSBuZXcgQ29sb3VyKFwicmdiYSgxMTAlLCAwJSwgMCUsIDIpXCIpO1xuICAgICAgICBoc2xfYmFkMSA9IG5ldyBDb2xvdXIoXCJoc2woNzIwLCAxMjAlLCAxMjAlKVwiKTtcbiAgICAgICAgaHNsX2JhZDIgPSBuZXcgQ29sb3VyKFwiaHNsKC03MjAsIC0xMjAlLCAtMTIwJSlcIik7XG4gICAgfSk7XG4gICAgc3VpdGUoJ3Byb3BlcnRpZXMnLCBmdW5jdGlvbigpe1xuICAgICAgICB0ZXN0KCdyZ2InLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlZC5yZ2IuciwgMjU1KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZWQucmdiLmcsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlZC5yZ2IuYiwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiLnJnYi5yLCAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2IucmdiLmcsIDcpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYi5yZ2IuYiwgMjkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYi5hbHBoYSwgMSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiYS5yZ2IuciwgMSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiYS5yZ2IuZywgNyk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiYS5yZ2IuYiwgMjkpO1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG5lYXJseUVxdWFsKHJnYmEuYWxwaGEsIDAuMykpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYl9wZXIucmdiLnIsIDI1NSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX3Blci5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX3Blci5yZ2IuYiwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX2JhZDEucmdiLnIsIDI1NSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX2JhZDEucmdiLmcsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYl9iYWQxLnJnYi5iLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2JfYmFkMi5yZ2IuciwgMjU1KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2JfYmFkMi5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX2JhZDIucmdiLmIsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYl9iYWQzLnJnYi5yLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJnYl9iYWQzLnJnYi5nLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2JfYmFkMy5yZ2IuYiwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmdiX2JhZDMuYWxwaGEsIDEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKHZhciBjb2xvciBpbiBuYW1lZCl7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWVkLmhhc093blByb3BlcnR5KGNvbG9yKSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gbmV3IENvbG91cihjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZXggPSBuZXcgQ29sb3VyKG5hbWVkW2NvbG9yXS5oZXgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZWRfcmdiID0gbmFtZWRbY29sb3JdLnJnYjtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG5hbWUucmdiLnIsIGhleC5yZ2Iucik7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChuYW1lLnJnYi5nLCBoZXgucmdiLmcpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwobmFtZS5yZ2IuYiwgaGV4LnJnYi5iKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG5hbWUucmdiLnIsIG5hbWVkX3JnYi5yKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG5hbWUucmdiLmcsIG5hbWVkX3JnYi5nKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG5hbWUucmdiLmIsIG5hbWVkX3JnYi5iKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGVzdCgnaHNsJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZWQuaHNsLmgsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlZC5oc2wucywgMTAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZWQuaHNsLmwsIDUwKTtcblxuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGhzbC5oc2wuaCwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoaHNsLmhzbC5zLCAxMDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGhzbC5oc2wubCwgNTApO1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG5lYXJseUVxdWFsKGhzbC5hbHBoYSwgMSkpO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoaHNsYS5oc2wuaCwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoaHNsYS5oc2wucywgMTAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChoc2xhLmhzbC5sLCA1MCk7XG4gICAgICAgICAgICBhc3NlcnQub2sobmVhcmx5RXF1YWwoaHNsYS5hbHBoYSwgMC4zKSk7XG5cbiAgICAgICAgICAgIC8vIGFzc2VydC5lcXVhbChoc2xfYmFkMS5yLCAyNTUpO1xuICAgICAgICAgICAgLy8gYXNzZXJ0LmVxdWFsKGhzbF9iYWQxLmcsIDI1NSk7XG4gICAgICAgICAgICAvLyBhc3NlcnQuZXF1YWwoaHNsX2JhZDEuYiwgMjU1KTtcbiAgICAgICAgICAgIC8vIGFzc2VydC5lcXVhbChoc2xfYmFkMi5yLCAyNTUpO1xuICAgICAgICAgICAgLy8gYXNzZXJ0LmVxdWFsKGhzbF9iYWQyLmcsIDI1NSk7XG4gICAgICAgICAgICAvLyBhc3NlcnQuZXF1YWwoaHNsX2JhZDIuYiwgMjU1KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgY29sb3IgaW4gbmFtZWQpe1xuICAgICAgICAgICAgICAgIGlmIChuYW1lZC5oYXNPd25Qcm9wZXJ0eShjb2xvcikpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG5ldyBDb2xvdXIoY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGV4ID0gbmV3IENvbG91cihuYW1lZFtjb2xvcl0uaGV4KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWVkX2hzbCA9IG5hbWVkW2NvbG9yXS5yZ2I7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChuYW1lLnJnYi5oLCBoZXgucmdiLmgpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwobmFtZS5yZ2IucywgaGV4LnJnYi5zKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG5hbWUucmdiLmwsIGhleC5yZ2IubCk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChuYW1lLnJnYi5oLCBuYW1lZF9oc2wuaCk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChuYW1lLnJnYi5zLCBuYW1lZF9oc2wucyk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChuYW1lLnJnYi5sLCBuYW1lZF9oc2wubCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGVzdCgnYWxwaGEnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG5lYXJseUVxdWFsKHJlZC5hbHBoYSwgMSkpO1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG5lYXJseUVxdWFsKHJnYmEuYWxwaGEsIDAuMykpO1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG5lYXJseUVxdWFsKGhzbGEuYWxwaGEsIDAuMykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBzdWl0ZSgnbWV0aG9kcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHRlc3QoJ2xpZ2h0ZW4nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHIxID0gcmVkLmxpZ2h0ZW4oMTApO1xuICAgICAgICAgICAgdmFyIHIyID0gcmVkLmxpZ2h0ZW4oMjApO1xuICAgICAgICAgICAgdmFyIHIzID0gcmVkLmxpZ2h0ZW4oNTApO1xuICAgICAgICAgICAgdmFyIGcxID0gZ3JlZW4ubGlnaHRlbigxMCk7XG4gICAgICAgICAgICB2YXIgZzIgPSBncmVlbi5saWdodGVuKDIwKTtcbiAgICAgICAgICAgIHZhciBnMyA9IGdyZWVuLmxpZ2h0ZW4oNTApO1xuICAgICAgICAgICAgdmFyIGIxID0gYmx1ZS5saWdodGVuKDEwKTtcbiAgICAgICAgICAgIHZhciBiMiA9IGJsdWUubGlnaHRlbigyMCk7XG4gICAgICAgICAgICB2YXIgYjMgPSBibHVlLmxpZ2h0ZW4oNTApO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjEucmdiLnIsIDI1NSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjEucmdiLmcsIDUxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyMS5yZ2IuYiwgNTEpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIyLnJnYi5yLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIyLnJnYi5nLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIyLnJnYi5iLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIzLnJnYi5yLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIzLnJnYi5nLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIzLnJnYi5iLCAyNTUpO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzEucmdiLnIsIDUxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChnMS5yZ2IuZywgMjU1KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChnMS5yZ2IuYiwgNTEpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGcyLnJnYi5yLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGcyLnJnYi5nLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGcyLnJnYi5iLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGczLnJnYi5yLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGczLnJnYi5nLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGczLnJnYi5iLCAyNTUpO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoYjEucmdiLnIsIDUxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChiMS5yZ2IuZywgNTEpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIxLnJnYi5iLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIyLnJnYi5yLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIyLnJnYi5nLCAxMDIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIyLnJnYi5iLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIzLnJnYi5yLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIzLnJnYi5nLCAyNTUpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIzLnJnYi5iLCAyNTUpO1xuXG4gICAgICAgIH0pO1xuICAgICAgICB0ZXN0KCdkYXJrZW4nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHIxID0gcmVkLmRhcmtlbigxMCk7XG4gICAgICAgICAgICB2YXIgcjIgPSByZWQuZGFya2VuKDIwKTtcbiAgICAgICAgICAgIHZhciByMyA9IHJlZC5kYXJrZW4oNTApO1xuICAgICAgICAgICAgdmFyIGcxID0gZ3JlZW4uZGFya2VuKDEwKTtcbiAgICAgICAgICAgIHZhciBnMiA9IGdyZWVuLmRhcmtlbigyMCk7XG4gICAgICAgICAgICB2YXIgZzMgPSBncmVlbi5kYXJrZW4oNTApO1xuICAgICAgICAgICAgdmFyIGIxID0gYmx1ZS5kYXJrZW4oMTApO1xuICAgICAgICAgICAgdmFyIGIyID0gYmx1ZS5kYXJrZW4oMjApO1xuICAgICAgICAgICAgdmFyIGIzID0gYmx1ZS5kYXJrZW4oNTApO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjEucmdiLnIsIDIwNCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjEucmdiLmcsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIxLnJnYi5iLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyMi5yZ2IuciwgMTUzKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyMi5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjIucmdiLmIsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHIzLnJnYi5yLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyMy5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocjMucmdiLmIsIDApO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzEucmdiLnIsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGcxLnJnYi5nLCAyMDQpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGcxLnJnYi5iLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChnMi5yZ2IuciwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzIucmdiLmcsIDE1Myk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzIucmdiLmIsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGczLnJnYi5yLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChnMy5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzMucmdiLmIsIDApO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoYjEucmdiLnIsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIxLnJnYi5nLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChiMS5yZ2IuYiwgMjA0KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChiMi5yZ2IuciwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoYjIucmdiLmcsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIyLnJnYi5iLCAxNTMpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIzLnJnYi5yLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChiMy5yZ2IuZywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoYjMucmdiLmIsIDApO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVzdCgndG9TdHJpbmcnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHIxID0gcmVkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB2YXIgZzEgPSBncmVlbi50b1N0cmluZygpO1xuICAgICAgICAgICAgdmFyIGIxID0gYmx1ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgdmFyIHJnYjEgPSByZ2IudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHZhciByZ2JhMSA9IHJnYmEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHZhciBoc2wxID0gaHNsLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB2YXIgaHNsYTEgPSBoc2wudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyMS50b0xvd2VyQ2FzZSgpLCBcIiNmZjAwMDBcIik7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZzEudG9Mb3dlckNhc2UoKSwgXCIjMDBmZjAwXCIpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGIxLnRvTG93ZXJDYXNlKCksIFwiIzAwMDBmZlwiKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2IxLnRvTG93ZXJDYXNlKCksIFwiIzAxMDcxZFwiKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZ2JhMS50b0xvd2VyQ2FzZSgpLCBcIiMwMTA3MWRcIik7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoaHNsMS50b0xvd2VyQ2FzZSgpLCBcIiNmZjAwMDBcIik7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoaHNsYTEudG9Mb3dlckNhc2UoKSwgXCIjZmYwMDAwXCIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyIsInZhciBuYW1lZGNvbG9ycyA9IHtcbiAgICBcImFsaWNlYmx1ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAwLFwibFwiOiAwIH0sIFwicmdiXCI6IHtcInJcIjogMjQwLFwiZ1wiOiAyNDgsXCJiXCI6IDI1NSB9LCBcImhleFwiOiBcIiNmMGY4ZmZcIn0sXG4gICAgXCJhbnRpcXVld2hpdGVcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMCxcImxcIjogNzUgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTAsXCJnXCI6IDIzNSxcImJcIjogMjE1IH0sIFwiaGV4XCI6IFwiI2ZhZWJkN1wifSxcbiAgICBcImFxdWFcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMCxcImxcIjogNTAgfSwgXCJyZ2JcIjoge1wiclwiOiAwLFwiZ1wiOiAyNTUsXCJiXCI6IDI1NSB9LCBcImhleFwiOiBcIiMwMGZmZmZcIn0sXG4gICAgXCJhcXVhbWFyaW5lXCI6IHtcImhzbFwiOiB7XCJoXCI6IDAsXCJzXCI6IDAsXCJsXCI6IDEwMCB9LCBcInJnYlwiOiB7XCJyXCI6IDEyNyxcImdcIjogMjU1LFwiYlwiOiAyMTIgfSwgXCJoZXhcIjogXCIjN2ZmZmQ0XCJ9LFxuICAgIFwiYXp1cmVcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMTAwLFwibFwiOiAyNSB9LCBcInJnYlwiOiB7XCJyXCI6IDI0MCxcImdcIjogMjU1LFwiYlwiOiAyNTUgfSwgXCJoZXhcIjogXCIjZjBmZmZmXCJ9LFxuICAgIFwiYmVpZ2VcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMTAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI0NSxcImdcIjogMjQ1LFwiYlwiOiAyMjAgfSwgXCJoZXhcIjogXCIjZjVmNWRjXCJ9LFxuICAgIFwiYmlzcXVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDMwMCxcInNcIjogMTAwLFwibFwiOiAyNSB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMjI4LFwiYlwiOiAxOTYgfSwgXCJoZXhcIjogXCIjZmZlNGM0XCJ9LFxuICAgIFwiYmxhY2tcIjoge1wiaHNsXCI6IHtcImhcIjogMzAwLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMCxcImJcIjogMCB9LCBcImhleFwiOiBcIiMwMDAwMDBcIn0sXG4gICAgXCJibGFuY2hlZGFsbW9uZFwiOiB7XCJoc2xcIjoge1wiaFwiOiAxMjAsXCJzXCI6IDEwMCxcImxcIjogMjUgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDIzNSxcImJcIjogMjA1IH0sIFwiaGV4XCI6IFwiI2ZmZWJjZFwifSxcbiAgICBcImJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMTIwLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMCxcImJcIjogMjU1IH0sIFwiaGV4XCI6IFwiIzAwMDBmZlwifSxcbiAgICBcImJsdWV2aW9sZXRcIjoge1wiaHNsXCI6IHtcImhcIjogNjAsXCJzXCI6IDEwMCxcImxcIjogMjUgfSwgXCJyZ2JcIjoge1wiclwiOiAxMzgsXCJnXCI6IDQzLFwiYlwiOiAyMjYgfSwgXCJoZXhcIjogXCIjOGEyYmUyXCJ9LFxuICAgIFwiYnJvd25cIjoge1wiaHNsXCI6IHtcImhcIjogNjAsXCJzXCI6IDEwMCxcImxcIjogNTAgfSwgXCJyZ2JcIjoge1wiclwiOiAxNjUsXCJnXCI6IDQyLFwiYlwiOiA0MiB9LCBcImhleFwiOiBcIiNhNTJhMmFcIn0sXG4gICAgXCJidXJseXdvb2RcIjoge1wiaHNsXCI6IHtcImhcIjogMjQwLFwic1wiOiAxMDAsXCJsXCI6IDI1IH0sIFwicmdiXCI6IHtcInJcIjogMjIyLFwiZ1wiOiAxODQsXCJiXCI6IDEzNSB9LCBcImhleFwiOiBcIiNkZWI4ODdcIn0sXG4gICAgXCJjYWRldGJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMjQwLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogOTUsXCJnXCI6IDE1OCxcImJcIjogMTYwIH0sIFwiaGV4XCI6IFwiIzVmOWVhMFwifSxcbiAgICBcImNoYXJ0cmV1c2VcIjoge1wiaHNsXCI6IHtcImhcIjogMTgwLFwic1wiOiAxMDAsXCJsXCI6IDI1IH0sIFwicmdiXCI6IHtcInJcIjogMTI3LFwiZ1wiOiAyNTUsXCJiXCI6IDAgfSwgXCJoZXhcIjogXCIjN2ZmZjAwXCJ9LFxuICAgIFwiY2hvY29sYXRlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MCxcInNcIjogMTAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDIxMCxcImdcIjogMTA1LFwiYlwiOiAzMCB9LCBcImhleFwiOiBcIiNkMjY5MWVcIn0sXG4gICAgXCJjb3JhbFwiOiB7XCJoc2xcIjoge1wiaFwiOiAzOSxcInNcIjogMTAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMTI3LFwiYlwiOiA4MCB9LCBcImhleFwiOiBcIiNmZjdmNTBcIn0sXG4gICAgXCJjb3JuZmxvd2VyYmx1ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyMDgsXCJzXCI6IDEwMCxcImxcIjogOTcgfSwgXCJyZ2JcIjoge1wiclwiOiAxMDAsXCJnXCI6IDE0OSxcImJcIjogMjM3IH0sIFwiaGV4XCI6IFwiIzY0OTVlZFwifSxcbiAgICBcImNvcm5zaWxrXCI6IHtcImhzbFwiOiB7XCJoXCI6IDM0LFwic1wiOiA3OCxcImxcIjogOTEgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDI0OCxcImJcIjogMjIwIH0sIFwiaGV4XCI6IFwiI2ZmZjhkY1wifSxcbiAgICBcImNyaW1zb25cIjoge1wiaHNsXCI6IHtcImhcIjogMTYwLFwic1wiOiAxMDAsXCJsXCI6IDc1IH0sIFwicmdiXCI6IHtcInJcIjogMjIwLFwiZ1wiOiAyMCxcImJcIjogNjAgfSwgXCJoZXhcIjogXCIjZGMxNDNjXCJ9LFxuICAgIFwiY3lhblwiOiB7XCJoc2xcIjoge1wiaFwiOiAxODAsXCJzXCI6IDEwMCxcImxcIjogOTcgfSwgXCJyZ2JcIjoge1wiclwiOiAwLFwiZ1wiOiAyNTUsXCJiXCI6IDI1NSB9LCBcImhleFwiOiBcIiMwMGZmZmZcIn0sXG4gICAgXCJkYXJrYmx1ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiA2MCxcInNcIjogNTYsXCJsXCI6IDkxIH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMCxcImJcIjogMTM5IH0sIFwiaGV4XCI6IFwiIzAwMDA4YlwifSxcbiAgICBcImRhcmtjeWFuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDMzLFwic1wiOiAxMDAsXCJsXCI6IDg4IH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMTM5LFwiYlwiOiAxMzkgfSwgXCJoZXhcIjogXCIjMDA4YjhiXCJ9LFxuICAgIFwiZGFya2dvbGRlbnJvZFwiOiB7XCJoc2xcIjoge1wiaFwiOiAzNixcInNcIjogMTAwLFwibFwiOiA5MCB9LCBcInJnYlwiOiB7XCJyXCI6IDE4NCxcImdcIjogMTM0LFwiYlwiOiAxMSB9LCBcImhleFwiOiBcIiNiODg2MGJcIn0sXG4gICAgXCJkYXJrZ3JheVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyNzEsXCJzXCI6IDc2LFwibFwiOiA1MyB9LCBcInJnYlwiOiB7XCJyXCI6IDE2OSxcImdcIjogMTY5LFwiYlwiOiAxNjkgfSwgXCJoZXhcIjogXCIjYTlhOWE5XCJ9LFxuICAgIFwiZGFya2dyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDAsXCJzXCI6IDU5LFwibFwiOiA0MSB9LCBcInJnYlwiOiB7XCJyXCI6IDAsXCJnXCI6IDEwMCxcImJcIjogMCB9LCBcImhleFwiOiBcIiMwMDY0MDBcIn0sXG4gICAgXCJkYXJrZ3JleVwiOiB7XCJoc2xcIjoge1wiaFwiOiAzNCxcInNcIjogNTcsXCJsXCI6IDcwIH0sIFwicmdiXCI6IHtcInJcIjogMTY5LFwiZ1wiOiAxNjksXCJiXCI6IDE2OSB9LCBcImhleFwiOiBcIiNhOWE5YTlcIn0sXG4gICAgXCJkYXJra2hha2lcIjoge1wiaHNsXCI6IHtcImhcIjogMTgyLFwic1wiOiAyNSxcImxcIjogNTAgfSwgXCJyZ2JcIjoge1wiclwiOiAxODksXCJnXCI6IDE4MyxcImJcIjogMTA3IH0sIFwiaGV4XCI6IFwiI2JkYjc2YlwifSxcbiAgICBcImRhcmttYWdlbnRhXCI6IHtcImhzbFwiOiB7XCJoXCI6IDkwLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMTM5LFwiZ1wiOiAwLFwiYlwiOiAxMzkgfSwgXCJoZXhcIjogXCIjOGIwMDhiXCJ9LFxuICAgIFwiZGFya29saXZlZ3JlZW5cIjoge1wiaHNsXCI6IHtcImhcIjogMjUsXCJzXCI6IDc1LFwibFwiOiA0NyB9LCBcInJnYlwiOiB7XCJyXCI6IDg1LFwiZ1wiOiAxMDcsXCJiXCI6IDQ3IH0sIFwiaGV4XCI6IFwiIzU1NmIyZlwifSxcbiAgICBcImRhcmtvcmFuZ2VcIjoge1wiaHNsXCI6IHtcImhcIjogMTYsXCJzXCI6IDEwMCxcImxcIjogNjYgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDE0MCxcImJcIjogMCB9LCBcImhleFwiOiBcIiNmZjhjMDBcIn0sXG4gICAgXCJkYXJrb3JjaGlkXCI6IHtcImhzbFwiOiB7XCJoXCI6IDIxOSxcInNcIjogNzksXCJsXCI6IDY2IH0sIFwicmdiXCI6IHtcInJcIjogMTUzLFwiZ1wiOiA1MCxcImJcIjogMjA0IH0sIFwiaGV4XCI6IFwiIzk5MzJjY1wifSxcbiAgICBcImRhcmtyZWRcIjoge1wiaHNsXCI6IHtcImhcIjogNDgsXCJzXCI6IDEwMCxcImxcIjogOTMgfSwgXCJyZ2JcIjoge1wiclwiOiAxMzksXCJnXCI6IDAsXCJiXCI6IDAgfSwgXCJoZXhcIjogXCIjOGIwMDAwXCJ9LFxuICAgIFwiZGFya3NhbG1vblwiOiB7XCJoc2xcIjoge1wiaFwiOiAzNDgsXCJzXCI6IDgzLFwibFwiOiA0NyB9LCBcInJnYlwiOiB7XCJyXCI6IDIzMyxcImdcIjogMTUwLFwiYlwiOiAxMjIgfSwgXCJoZXhcIjogXCIjZTk5NjdhXCJ9LFxuICAgIFwiZGFya3NlYWdyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI0MCxcInNcIjogMTAwLFwibFwiOiAyNyB9LCBcInJnYlwiOiB7XCJyXCI6IDE0MyxcImdcIjogMTg4LFwiYlwiOiAxNDMgfSwgXCJoZXhcIjogXCIjOGZiYzhmXCJ9LFxuICAgIFwiZGFya3NsYXRlYmx1ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAxODAsXCJzXCI6IDEwMCxcImxcIjogMjcgfSwgXCJyZ2JcIjoge1wiclwiOiA3MixcImdcIjogNjEsXCJiXCI6IDEzOSB9LCBcImhleFwiOiBcIiM0ODNkOGJcIn0sXG4gICAgXCJkYXJrc2xhdGVncmF5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDQzLFwic1wiOiA4OSxcImxcIjogMzggfSwgXCJyZ2JcIjoge1wiclwiOiA0NyxcImdcIjogNzksXCJiXCI6IDc5IH0sIFwiaGV4XCI6IFwiIzJmNGY0ZlwifSxcbiAgICBcImRhcmtzbGF0ZWdyZXlcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMCxcImxcIjogNjYgfSwgXCJyZ2JcIjoge1wiclwiOiA0NyxcImdcIjogNzksXCJiXCI6IDc5IH0sIFwiaGV4XCI6IFwiIzJmNGY0ZlwifSxcbiAgICBcImRhcmt0dXJxdW9pc2VcIjoge1wiaHNsXCI6IHtcImhcIjogMTIwLFwic1wiOiAxMDAsXCJsXCI6IDIwIH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMjA2LFwiYlwiOiAyMDkgfSwgXCJoZXhcIjogXCIjMDBjZWQxXCJ9LFxuICAgIFwiZGFya3Zpb2xldFwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAwLFwibFwiOiA2NiB9LCBcInJnYlwiOiB7XCJyXCI6IDE0OCxcImdcIjogMCxcImJcIjogMjExIH0sIFwiaGV4XCI6IFwiIzk0MDBkM1wifSxcbiAgICBcImRlZXBwaW5rXCI6IHtcImhzbFwiOiB7XCJoXCI6IDU2LFwic1wiOiAzOCxcImxcIjogNTggfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDIwLFwiYlwiOiAxNDcgfSwgXCJoZXhcIjogXCIjZmYxNDkzXCJ9LFxuICAgIFwiZGVlcHNreWJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMzAwLFwic1wiOiAxMDAsXCJsXCI6IDI3IH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMTkxLFwiYlwiOiAyNTUgfSwgXCJoZXhcIjogXCIjMDBiZmZmXCJ9LFxuICAgIFwiZGltZ3JheVwiOiB7XCJoc2xcIjoge1wiaFwiOiA4MixcInNcIjogMzksXCJsXCI6IDMwIH0sIFwicmdiXCI6IHtcInJcIjogMTA1LFwiZ1wiOiAxMDUsXCJiXCI6IDEwNSB9LCBcImhleFwiOiBcIiM2OTY5NjlcIn0sXG4gICAgXCJkaW1ncmV5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDMzLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMTA1LFwiZ1wiOiAxMDUsXCJiXCI6IDEwNSB9LCBcImhleFwiOiBcIiM2OTY5NjlcIn0sXG4gICAgXCJkb2RnZXJibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI4MCxcInNcIjogNjEsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMzAsXCJnXCI6IDE0NCxcImJcIjogMjU1IH0sIFwiaGV4XCI6IFwiIzFlOTBmZlwifSxcbiAgICBcImZpcmVicmlja1wiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAxMDAsXCJsXCI6IDI3IH0sIFwicmdiXCI6IHtcInJcIjogMTc4LFwiZ1wiOiAzNCxcImJcIjogMzQgfSwgXCJoZXhcIjogXCIjYjIyMjIyXCJ9LFxuICAgIFwiZmxvcmFsd2hpdGVcIjoge1wiaHNsXCI6IHtcImhcIjogMTUsXCJzXCI6IDcyLFwibFwiOiA3MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMjUwLFwiYlwiOiAyNDAgfSwgXCJoZXhcIjogXCIjZmZmYWYwXCJ9LFxuICAgIFwiZm9yZXN0Z3JlZW5cIjoge1wiaHNsXCI6IHtcImhcIjogMTIwLFwic1wiOiAyNSxcImxcIjogNjUgfSwgXCJyZ2JcIjoge1wiclwiOiAzNCxcImdcIjogMTM5LFwiYlwiOiAzNCB9LCBcImhleFwiOiBcIiMyMjhiMjJcIn0sXG4gICAgXCJmdWNoc2lhXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI0OCxcInNcIjogMzksXCJsXCI6IDM5IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAwLFwiYlwiOiAyNTUgfSwgXCJoZXhcIjogXCIjZmYwMGZmXCJ9LFxuICAgIFwiZ2FpbnNib3JvXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MCxcInNcIjogMjUsXCJsXCI6IDI1IH0sIFwicmdiXCI6IHtcInJcIjogMjIwLFwiZ1wiOiAyMjAsXCJiXCI6IDIyMCB9LCBcImhleFwiOiBcIiNkY2RjZGNcIn0sXG4gICAgXCJnaG9zdHdoaXRlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MCxcInNcIjogMjUsXCJsXCI6IDI1IH0sIFwicmdiXCI6IHtcInJcIjogMjQ4LFwiZ1wiOiAyNDgsXCJiXCI6IDI1NSB9LCBcImhleFwiOiBcIiNmOGY4ZmZcIn0sXG4gICAgXCJnb2xkXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MSxcInNcIjogMTAwLFwibFwiOiA0MSB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMjE1LFwiYlwiOiAwIH0sIFwiaGV4XCI6IFwiI2ZmZDcwMFwifSxcbiAgICBcImdvbGRlbnJvZFwiOiB7XCJoc2xcIjoge1wiaFwiOiAyODIsXCJzXCI6IDEwMCxcImxcIjogNDEgfSwgXCJyZ2JcIjoge1wiclwiOiAyMTgsXCJnXCI6IDE2NSxcImJcIjogMzIgfSwgXCJoZXhcIjogXCIjZGFhNTIwXCJ9LFxuICAgIFwiZ3JheVwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMjgsXCJzXCI6IDEwMCxcImxcIjogNTQgfSwgXCJyZ2JcIjoge1wiclwiOiAxMjgsXCJnXCI6IDEyOCxcImJcIjogMTI4IH0sIFwiaGV4XCI6IFwiIzgwODA4MFwifSxcbiAgICBcImdyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE5NSxcInNcIjogMTAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDAsXCJnXCI6IDEyOCxcImJcIjogMCB9LCBcImhleFwiOiBcIiMwMDgwMDBcIn0sXG4gICAgXCJncmVlbnllbGxvd1wiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAwLFwibFwiOiA0MSB9LCBcInJnYlwiOiB7XCJyXCI6IDE3MyxcImdcIjogMjU1LFwiYlwiOiA0NyB9LCBcImhleFwiOiBcIiNhZGZmMmZcIn0sXG4gICAgXCJncmV5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDAsXCJzXCI6IDAsXCJsXCI6IDQxIH0sIFwicmdiXCI6IHtcInJcIjogMTI4LFwiZ1wiOiAxMjgsXCJiXCI6IDEyOCB9LCBcImhleFwiOiBcIiM4MDgwODBcIn0sXG4gICAgXCJob25leWRld1wiOiB7XCJoc2xcIjoge1wiaFwiOiAyMTAsXCJzXCI6IDEwMCxcImxcIjogNTYgfSwgXCJyZ2JcIjoge1wiclwiOiAyNDAsXCJnXCI6IDI1NSxcImJcIjogMjQwIH0sIFwiaGV4XCI6IFwiI2YwZmZmMFwifSxcbiAgICBcImhvdHBpbmtcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogNjgsXCJsXCI6IDQyIH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAxMDUsXCJiXCI6IDE4MCB9LCBcImhleFwiOiBcIiNmZjY5YjRcIn0sXG4gICAgXCJpbmRpYW5yZWRcIjoge1wiaHNsXCI6IHtcImhcIjogNDAsXCJzXCI6IDEwMCxcImxcIjogOTcgfSwgXCJyZ2JcIjoge1wiclwiOiAyMDUsXCJnXCI6IDkyLFwiYlwiOiA5MiB9LCBcImhleFwiOiBcIiNjZDVjNWNcIn0sXG4gICAgXCJpbmRpZ29cIjoge1wiaHNsXCI6IHtcImhcIjogMTIwLFwic1wiOiA2MSxcImxcIjogMzQgfSwgXCJyZ2JcIjoge1wiclwiOiA3NSxcImdcIjogMCxcImJcIjogMTMwIH0sIFwiaGV4XCI6IFwiIzRiMDA4MlwifSxcbiAgICBcIml2b3J5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDAsXCJzXCI6IDAsXCJsXCI6IDg2IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAyNTUsXCJiXCI6IDI0MCB9LCBcImhleFwiOiBcIiNmZmZmZjBcIn0sXG4gICAgXCJraGFraVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyNDAsXCJzXCI6IDEwMCxcImxcIjogOTkgfSwgXCJyZ2JcIjoge1wiclwiOiAyNDAsXCJnXCI6IDIzMCxcImJcIjogMTQwIH0sIFwiaGV4XCI6IFwiI2YwZTY4Y1wifSxcbiAgICBcImxhdmVuZGVyXCI6IHtcImhzbFwiOiB7XCJoXCI6IDUxLFwic1wiOiAxMDAsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMjMwLFwiZ1wiOiAyMzAsXCJiXCI6IDI1MCB9LCBcImhleFwiOiBcIiNlNmU2ZmFcIn0sXG4gICAgXCJsYXZlbmRlcmJsdXNoXCI6IHtcImhzbFwiOiB7XCJoXCI6IDQzLFwic1wiOiA3NCxcImxcIjogNDkgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDI0MCxcImJcIjogMjQ1IH0sIFwiaGV4XCI6IFwiI2ZmZjBmNVwifSxcbiAgICBcImxhd25ncmVlblwiOiB7XCJoc2xcIjoge1wiaFwiOiA4NCxcInNcIjogMTAwLFwibFwiOiA1OSB9LCBcInJnYlwiOiB7XCJyXCI6IDEyNCxcImdcIjogMjUyLFwiYlwiOiAwIH0sIFwiaGV4XCI6IFwiIzdjZmMwMFwifSxcbiAgICBcImxlbW9uY2hpZmZvblwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMjUwLFwiYlwiOiAyMDUgfSwgXCJoZXhcIjogXCIjZmZmYWNkXCJ9LFxuICAgIFwibGlnaHRibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDEyMCxcInNcIjogMTAwLFwibFwiOiA5NyB9LCBcInJnYlwiOiB7XCJyXCI6IDE3MyxcImdcIjogMjE2LFwiYlwiOiAyMzAgfSwgXCJoZXhcIjogXCIjYWRkOGU2XCJ9LFxuICAgIFwibGlnaHRjb3JhbFwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMzAsXCJzXCI6IDEwMCxcImxcIjogNzEgfSwgXCJyZ2JcIjoge1wiclwiOiAyNDAsXCJnXCI6IDEyOCxcImJcIjogMTI4IH0sIFwiaGV4XCI6IFwiI2YwODA4MFwifSxcbiAgICBcImxpZ2h0Y3lhblwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiA1MyxcImxcIjogNTggfSwgXCJyZ2JcIjoge1wiclwiOiAyMjQsXCJnXCI6IDI1NSxcImJcIjogMjU1IH0sIFwiaGV4XCI6IFwiI2UwZmZmZlwifSxcbiAgICBcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IHtcImhzbFwiOiB7XCJoXCI6IDI3NSxcInNcIjogMTAwLFwibFwiOiAyNSB9LCBcInJnYlwiOiB7XCJyXCI6IDI1MCxcImdcIjogMjUwLFwiYlwiOiAyMTAgfSwgXCJoZXhcIjogXCIjZmFmYWQyXCJ9LFxuICAgIFwibGlnaHRncmF5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDYwLFwic1wiOiAxMDAsXCJsXCI6IDk3IH0sIFwicmdiXCI6IHtcInJcIjogMjExLFwiZ1wiOiAyMTEsXCJiXCI6IDIxMSB9LCBcImhleFwiOiBcIiNkM2QzZDNcIn0sXG4gICAgXCJsaWdodGdyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDU0LFwic1wiOiA3NyxcImxcIjogNzUgfSwgXCJyZ2JcIjoge1wiclwiOiAxNDQsXCJnXCI6IDIzOCxcImJcIjogMTQ0IH0sIFwiaGV4XCI6IFwiIzkwZWU5MFwifSxcbiAgICBcImxpZ2h0Z3JleVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyNDAsXCJzXCI6IDY3LFwibFwiOiA5NCB9LCBcInJnYlwiOiB7XCJyXCI6IDIxMSxcImdcIjogMjExLFwiYlwiOiAyMTEgfSwgXCJoZXhcIjogXCIjZDNkM2QzXCJ9LFxuICAgIFwibGlnaHRwaW5rXCI6IHtcImhzbFwiOiB7XCJoXCI6IDM0MCxcInNcIjogMTAwLFwibFwiOiA5NyB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMTgyLFwiYlwiOiAxOTMgfSwgXCJoZXhcIjogXCIjZmZiNmMxXCJ9LFxuICAgIFwibGlnaHRzYWxtb25cIjoge1wiaHNsXCI6IHtcImhcIjogOTAsXCJzXCI6IDEwMCxcImxcIjogNDkgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDE2MCxcImJcIjogMTIyIH0sIFwiaGV4XCI6IFwiI2ZmYTA3YVwifSxcbiAgICBcImxpZ2h0c2VhZ3JlZW5cIjoge1wiaHNsXCI6IHtcImhcIjogNTQsXCJzXCI6IDEwMCxcImxcIjogOTAgfSwgXCJyZ2JcIjoge1wiclwiOiAzMixcImdcIjogMTc4LFwiYlwiOiAxNzAgfSwgXCJoZXhcIjogXCIjMjBiMmFhXCJ9LFxuICAgIFwibGlnaHRza3libHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE5NSxcInNcIjogNTMsXCJsXCI6IDc5IH0sIFwicmdiXCI6IHtcInJcIjogMTM1LFwiZ1wiOiAyMDYsXCJiXCI6IDI1MCB9LCBcImhleFwiOiBcIiM4N2NlZmFcIn0sXG4gICAgXCJsaWdodHNsYXRlZ3JheVwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiA3OSxcImxcIjogNzIgfSwgXCJyZ2JcIjoge1wiclwiOiAxMTksXCJnXCI6IDEzNixcImJcIjogMTUzIH0sIFwiaGV4XCI6IFwiIzc3ODg5OVwifSxcbiAgICBcImxpZ2h0c2xhdGVncmV5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MCxcInNcIjogMTAwLFwibFwiOiA5NCB9LCBcInJnYlwiOiB7XCJyXCI6IDExOSxcImdcIjogMTM2LFwiYlwiOiAxNTMgfSwgXCJoZXhcIjogXCIjNzc4ODk5XCJ9LFxuICAgIFwibGlnaHRzdGVlbGJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogNjAsXCJzXCI6IDgwLFwibFwiOiA5MCB9LCBcInJnYlwiOiB7XCJyXCI6IDE3NixcImdcIjogMTk2LFwiYlwiOiAyMjIgfSwgXCJoZXhcIjogXCIjYjBjNGRlXCJ9LFxuICAgIFwibGlnaHR5ZWxsb3dcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMCxcImxcIjogODMgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDI1NSxcImJcIjogMjI0IH0sIFwiaGV4XCI6IFwiI2ZmZmZlMFwifSxcbiAgICBcImxpbWVcIjoge1wiaHNsXCI6IHtcImhcIjogMTIwLFwic1wiOiA3MyxcImxcIjogNzUgfSwgXCJyZ2JcIjoge1wiclwiOiAwLFwiZ1wiOiAyNTUsXCJiXCI6IDAgfSwgXCJoZXhcIjogXCIjMDBmZjAwXCJ9LFxuICAgIFwibGltZWdyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDAsXCJzXCI6IDAsXCJsXCI6IDgzIH0sIFwicmdiXCI6IHtcInJcIjogNTAsXCJnXCI6IDIwNSxcImJcIjogNTAgfSwgXCJoZXhcIjogXCIjMzJjZDMyXCJ9LFxuICAgIFwibGluZW5cIjoge1wiaHNsXCI6IHtcImhcIjogMzUxLFwic1wiOiAxMDAsXCJsXCI6IDg2IH0sIFwicmdiXCI6IHtcInJcIjogMjUwLFwiZ1wiOiAyNDAsXCJiXCI6IDIzMCB9LCBcImhleFwiOiBcIiNmYWYwZTZcIn0sXG4gICAgXCJtYWdlbnRhXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE3LFwic1wiOiAxMDAsXCJsXCI6IDc0IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAwLFwiYlwiOiAyNTUgfSwgXCJoZXhcIjogXCIjZmYwMGZmXCJ9LFxuICAgIFwibWFyb29uXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE3NyxcInNcIjogNzAsXCJsXCI6IDQxIH0sIFwicmdiXCI6IHtcInJcIjogMTI4LFwiZ1wiOiAwLFwiYlwiOiAwIH0sIFwiaGV4XCI6IFwiIzgwMDAwMFwifSxcbiAgICBcIm1lZGl1bWFxdWFtYXJpbmVcIjoge1wiaHNsXCI6IHtcImhcIjogMjAzLFwic1wiOiA5MixcImxcIjogNzUgfSwgXCJyZ2JcIjoge1wiclwiOiAxMDIsXCJnXCI6IDIwNSxcImJcIjogMTcwIH0sIFwiaGV4XCI6IFwiIzY2Y2RhYVwifSxcbiAgICBcIm1lZGl1bWJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMjEwLFwic1wiOiAxNCxcImxcIjogNTMgfSwgXCJyZ2JcIjoge1wiclwiOiAwLFwiZ1wiOiAwLFwiYlwiOiAyMDUgfSwgXCJoZXhcIjogXCIjMDAwMGNkXCJ9LFxuICAgIFwibWVkaXVtb3JjaGlkXCI6IHtcImhzbFwiOiB7XCJoXCI6IDIxMCxcInNcIjogMTQsXCJsXCI6IDUzIH0sIFwicmdiXCI6IHtcInJcIjogMTg2LFwiZ1wiOiA4NSxcImJcIjogMjExIH0sIFwiaGV4XCI6IFwiI2JhNTVkM1wifSxcbiAgICBcIm1lZGl1bXB1cnBsZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyMTQsXCJzXCI6IDQxLFwibFwiOiA3OCB9LCBcInJnYlwiOiB7XCJyXCI6IDE0NyxcImdcIjogMTEyLFwiYlwiOiAyMTkgfSwgXCJoZXhcIjogXCIjOTM3MGRiXCJ9LFxuICAgIFwibWVkaXVtc2VhZ3JlZW5cIjoge1wiaHNsXCI6IHtcImhcIjogNjAsXCJzXCI6IDEwMCxcImxcIjogOTQgfSwgXCJyZ2JcIjoge1wiclwiOiA2MCxcImdcIjogMTc5LFwiYlwiOiAxMTMgfSwgXCJoZXhcIjogXCIjM2NiMzcxXCJ9LFxuICAgIFwibWVkaXVtc2xhdGVibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDEyMCxcInNcIjogNjEsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMTIzLFwiZ1wiOiAxMDQsXCJiXCI6IDIzOCB9LCBcImhleFwiOiBcIiM3YjY4ZWVcIn0sXG4gICAgXCJtZWRpdW1zcHJpbmdncmVlblwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMCxcInNcIjogNjcsXCJsXCI6IDk0IH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMjUwLFwiYlwiOiAxNTQgfSwgXCJoZXhcIjogXCIjMDBmYTlhXCJ9LFxuICAgIFwibWVkaXVtdHVycXVvaXNlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE2MCxcInNcIjogNTEsXCJsXCI6IDYwIH0sIFwicmdiXCI6IHtcInJcIjogNzIsXCJnXCI6IDIwOSxcImJcIjogMjA0IH0sIFwiaGV4XCI6IFwiIzQ4ZDFjY1wifSxcbiAgICBcIm1lZGl1bXZpb2xldHJlZFwiOiB7XCJoc2xcIjoge1wiaFwiOiAyNDAsXCJzXCI6IDEwMCxcImxcIjogNDAgfSwgXCJyZ2JcIjoge1wiclwiOiAxOTksXCJnXCI6IDIxLFwiYlwiOiAxMzMgfSwgXCJoZXhcIjogXCIjYzcxNTg1XCJ9LFxuICAgIFwibWlkbmlnaHRibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI4OCxcInNcIjogNTksXCJsXCI6IDU4IH0sIFwicmdiXCI6IHtcInJcIjogMjUsXCJnXCI6IDI1LFwiYlwiOiAxMTIgfSwgXCJoZXhcIjogXCIjMTkxOTcwXCJ9LFxuICAgIFwibWludGNyZWFtXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI2MCxcInNcIjogNjAsXCJsXCI6IDY1IH0sIFwicmdiXCI6IHtcInJcIjogMjQ1LFwiZ1wiOiAyNTUsXCJiXCI6IDI1MCB9LCBcImhleFwiOiBcIiNmNWZmZmFcIn0sXG4gICAgXCJtaXN0eXJvc2VcIjoge1wiaHNsXCI6IHtcImhcIjogMTQ3LFwic1wiOiA1MCxcImxcIjogNDcgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDIyOCxcImJcIjogMjI1IH0sIFwiaGV4XCI6IFwiI2ZmZTRlMVwifSxcbiAgICBcIm1vY2Nhc2luXCI6IHtcImhzbFwiOiB7XCJoXCI6IDI0OSxcInNcIjogODAsXCJsXCI6IDY3IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAyMjgsXCJiXCI6IDE4MSB9LCBcImhleFwiOiBcIiNmZmU0YjVcIn0sXG4gICAgXCJuYXZham93aGl0ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAxNTcsXCJzXCI6IDEwMCxcImxcIjogNDkgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDIyMixcImJcIjogMTczIH0sIFwiaGV4XCI6IFwiI2ZmZGVhZFwifSxcbiAgICBcIm5hdnlcIjoge1wiaHNsXCI6IHtcImhcIjogMTc4LFwic1wiOiA2MCxcImxcIjogNTUgfSwgXCJyZ2JcIjoge1wiclwiOiAwLFwiZ1wiOiAwLFwiYlwiOiAxMjggfSwgXCJoZXhcIjogXCIjMDAwMDgwXCJ9LFxuICAgIFwib2xkbGFjZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMjIsXCJzXCI6IDgxLFwibFwiOiA0MyB9LCBcInJnYlwiOiB7XCJyXCI6IDI1MyxcImdcIjogMjQ1LFwiYlwiOiAyMzAgfSwgXCJoZXhcIjogXCIjZmRmNWU2XCJ9LFxuICAgIFwib2xpdmVcIjoge1wiaHNsXCI6IHtcImhcIjogMjQwLFwic1wiOiA2NCxcImxcIjogMjcgfSwgXCJyZ2JcIjoge1wiclwiOiAxMjgsXCJnXCI6IDEyOCxcImJcIjogMCB9LCBcImhleFwiOiBcIiM4MDgwMDBcIn0sXG4gICAgXCJvbGl2ZWRyYWJcIjoge1wiaHNsXCI6IHtcImhcIjogMTUwLFwic1wiOiAxMDAsXCJsXCI6IDk4IH0sIFwicmdiXCI6IHtcInJcIjogMTA3LFwiZ1wiOiAxNDIsXCJiXCI6IDM1IH0sIFwiaGV4XCI6IFwiIzZiOGUyM1wifSxcbiAgICBcIm9yYW5nZVwiOiB7XCJoc2xcIjoge1wiaFwiOiA2LFwic1wiOiAxMDAsXCJsXCI6IDk0IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAxNjUsXCJiXCI6IDAgfSwgXCJoZXhcIjogXCIjZmZhNTAwXCJ9LFxuICAgIFwib3JhbmdlcmVkXCI6IHtcImhzbFwiOiB7XCJoXCI6IDM4LFwic1wiOiAxMDAsXCJsXCI6IDg1IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiA2OSxcImJcIjogMCB9LCBcImhleFwiOiBcIiNmZjQ1MDBcIn0sXG4gICAgXCJvcmNoaWRcIjoge1wiaHNsXCI6IHtcImhcIjogMzYsXCJzXCI6IDEwMCxcImxcIjogODQgfSwgXCJyZ2JcIjoge1wiclwiOiAyMTgsXCJnXCI6IDExMixcImJcIjogMjE0IH0sIFwiaGV4XCI6IFwiI2RhNzBkNlwifSxcbiAgICBcInBhbGVnb2xkZW5yb2RcIjoge1wiaHNsXCI6IHtcImhcIjogMzksXCJzXCI6IDg1LFwibFwiOiA5NSB9LCBcInJnYlwiOiB7XCJyXCI6IDIzOCxcImdcIjogMjMyLFwiYlwiOiAxNzAgfSwgXCJoZXhcIjogXCIjZWVlOGFhXCJ9LFxuICAgIFwicGFsZWdyZWVuXCI6IHtcImhzbFwiOiB7XCJoXCI6IDgwLFwic1wiOiA2MCxcImxcIjogMzUgfSwgXCJyZ2JcIjoge1wiclwiOiAxNTIsXCJnXCI6IDI1MSxcImJcIjogMTUyIH0sIFwiaGV4XCI6IFwiIzk4ZmI5OFwifSxcbiAgICBcInBhbGV0dXJxdW9pc2VcIjoge1wiaHNsXCI6IHtcImhcIjogMTYsXCJzXCI6IDEwMCxcImxcIjogNTAgfSwgXCJyZ2JcIjoge1wiclwiOiAxNzUsXCJnXCI6IDIzOCxcImJcIjogMjM4IH0sIFwiaGV4XCI6IFwiI2FmZWVlZVwifSxcbiAgICBcInBhbGV2aW9sZXRyZWRcIjoge1wiaHNsXCI6IHtcImhcIjogMzAyLFwic1wiOiA1OSxcImxcIjogNjUgfSwgXCJyZ2JcIjoge1wiclwiOiAyMTksXCJnXCI6IDExMixcImJcIjogMTQ3IH0sIFwiaGV4XCI6IFwiI2RiNzA5M1wifSxcbiAgICBcInBhcGF5YXdoaXBcIjoge1wiaHNsXCI6IHtcImhcIjogNTUsXCJzXCI6IDY3LFwibFwiOiA4MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMjM5LFwiYlwiOiAyMTMgfSwgXCJoZXhcIjogXCIjZmZlZmQ1XCJ9LFxuICAgIFwicGVhY2hwdWZmXCI6IHtcImhzbFwiOiB7XCJoXCI6IDEyMCxcInNcIjogOTMsXCJsXCI6IDc5IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAyMTgsXCJiXCI6IDE4NSB9LCBcImhleFwiOiBcIiNmZmRhYjlcIn0sXG4gICAgXCJwZXJ1XCI6IHtcImhzbFwiOiB7XCJoXCI6IDE4MCxcInNcIjogNjUsXCJsXCI6IDgxIH0sIFwicmdiXCI6IHtcInJcIjogMjA1LFwiZ1wiOiAxMzMsXCJiXCI6IDYzIH0sIFwiaGV4XCI6IFwiI2NkODUzZlwifSxcbiAgICBcInBpbmtcIjoge1wiaHNsXCI6IHtcImhcIjogMzQwLFwic1wiOiA2MCxcImxcIjogNjUgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDE5MixcImJcIjogMjAzIH0sIFwiaGV4XCI6IFwiI2ZmYzBjYlwifSxcbiAgICBcInBsdW1cIjoge1wiaHNsXCI6IHtcImhcIjogMzcsXCJzXCI6IDEwMCxcImxcIjogOTIgfSwgXCJyZ2JcIjoge1wiclwiOiAyMjEsXCJnXCI6IDE2MCxcImJcIjogMjIxIH0sIFwiaGV4XCI6IFwiI2RkYTBkZFwifSxcbiAgICBcInBvd2RlcmJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMjgsXCJzXCI6IDEwMCxcImxcIjogODYgfSwgXCJyZ2JcIjoge1wiclwiOiAxNzYsXCJnXCI6IDIyNCxcImJcIjogMjMwIH0sIFwiaGV4XCI6IFwiI2IwZTBlNlwifSxcbiAgICBcInB1cnBsZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMCxcInNcIjogNTksXCJsXCI6IDUzIH0sIFwicmdiXCI6IHtcInJcIjogMTI4LFwiZ1wiOiAwLFwiYlwiOiAxMjggfSwgXCJoZXhcIjogXCIjODAwMDgwXCJ9LFxuICAgIFwicmVkXCI6IHtcImhzbFwiOiB7XCJoXCI6IDM1MCxcInNcIjogMTAwLFwibFwiOiA4OCB9LCBcInJnYlwiOiB7XCJyXCI6IDI1NSxcImdcIjogMCxcImJcIjogMCB9LCBcImhleFwiOiBcIiNmZjAwMDBcIn0sXG4gICAgXCJyb3N5YnJvd25cIjoge1wiaHNsXCI6IHtcImhcIjogMzAwLFwic1wiOiA0NyxcImxcIjogNzUgfSwgXCJyZ2JcIjoge1wiclwiOiAxODgsXCJnXCI6IDE0MyxcImJcIjogMTQzIH0sIFwiaGV4XCI6IFwiI2JjOGY4ZlwifSxcbiAgICBcInJveWFsYmx1ZVwiOiB7XCJoc2xcIjoge1wiaFwiOiAxODcsXCJzXCI6IDUyLFwibFwiOiA4MCB9LCBcInJnYlwiOiB7XCJyXCI6IDY1LFwiZ1wiOiAxMDUsXCJiXCI6IDIyNSB9LCBcImhleFwiOiBcIiM0MTY5ZTFcIn0sXG4gICAgXCJzYWRkbGVicm93blwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAyNSxcImxcIjogNjUgfSwgXCJyZ2JcIjoge1wiclwiOiAxMzksXCJnXCI6IDY5LFwiYlwiOiAxOSB9LCBcImhleFwiOiBcIiM4YjQ1MTNcIn0sXG4gICAgXCJzYWxtb25cIjoge1wiaHNsXCI6IHtcImhcIjogMjI1LFwic1wiOiA3MyxcImxcIjogNTcgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTAsXCJnXCI6IDEyOCxcImJcIjogMTE0IH0sIFwiaGV4XCI6IFwiI2ZhODA3MlwifSxcbiAgICBcInNhbmR5YnJvd25cIjoge1wiaHNsXCI6IHtcImhcIjogMjUsXCJzXCI6IDc2LFwibFwiOiAzMSB9LCBcInJnYlwiOiB7XCJyXCI6IDI0NCxcImdcIjogMTY0LFwiYlwiOiA5NiB9LCBcImhleFwiOiBcIiNmNGE0NjBcIn0sXG4gICAgXCJzZWFncmVlblwiOiB7XCJoc2xcIjoge1wiaFwiOiA2LFwic1wiOiA5MyxcImxcIjogNzEgfSwgXCJyZ2JcIjoge1wiclwiOiA0NixcImdcIjogMTM5LFwiYlwiOiA4NyB9LCBcImhleFwiOiBcIiMyZThiNTdcIn0sXG4gICAgXCJzZWFzaGVsbFwiOiB7XCJoc2xcIjoge1wiaFwiOiAyOCxcInNcIjogODcsXCJsXCI6IDY3IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAyNDUsXCJiXCI6IDIzOCB9LCBcImhleFwiOiBcIiNmZmY1ZWVcIn0sXG4gICAgXCJzaWVubmFcIjoge1wiaHNsXCI6IHtcImhcIjogMTQ2LFwic1wiOiA1MCxcImxcIjogMzYgfSwgXCJyZ2JcIjoge1wiclwiOiAxNjAsXCJnXCI6IDgyLFwiYlwiOiA0NSB9LCBcImhleFwiOiBcIiNhMDUyMmRcIn0sXG4gICAgXCJzaWx2ZXJcIjoge1wiaHNsXCI6IHtcImhcIjogMjUsXCJzXCI6IDEwMCxcImxcIjogOTcgfSwgXCJyZ2JcIjoge1wiclwiOiAxOTIsXCJnXCI6IDE5MixcImJcIjogMTkyIH0sIFwiaGV4XCI6IFwiI2MwYzBjMFwifSxcbiAgICBcInNreWJsdWVcIjoge1wiaHNsXCI6IHtcImhcIjogMTksXCJzXCI6IDU2LFwibFwiOiA0MCB9LCBcInJnYlwiOiB7XCJyXCI6IDEzNSxcImdcIjogMjA2LFwiYlwiOiAyMzUgfSwgXCJoZXhcIjogXCIjODdjZWViXCJ9LFxuICAgIFwic2xhdGVibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE5NyxcInNcIjogNzEsXCJsXCI6IDczIH0sIFwicmdiXCI6IHtcInJcIjogMTA2LFwiZ1wiOiA5MCxcImJcIjogMjA1IH0sIFwiaGV4XCI6IFwiIzZhNWFjZFwifSxcbiAgICBcInNsYXRlZ3JheVwiOiB7XCJoc2xcIjoge1wiaFwiOiAyNDgsXCJzXCI6IDUzLFwibFwiOiA1OCB9LCBcInJnYlwiOiB7XCJyXCI6IDExMixcImdcIjogMTI4LFwiYlwiOiAxNDQgfSwgXCJoZXhcIjogXCIjNzA4MDkwXCJ9LFxuICAgIFwic2xhdGVncmV5XCI6IHtcImhzbFwiOiB7XCJoXCI6IDIxMCxcInNcIjogMTMsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMTEyLFwiZ1wiOiAxMjgsXCJiXCI6IDE0NCB9LCBcImhleFwiOiBcIiM3MDgwOTBcIn0sXG4gICAgXCJzbm93XCI6IHtcImhzbFwiOiB7XCJoXCI6IDIxMCxcInNcIjogMTMsXCJsXCI6IDUwIH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAyNTAsXCJiXCI6IDI1MCB9LCBcImhleFwiOiBcIiNmZmZhZmFcIn0sXG4gICAgXCJzcHJpbmdncmVlblwiOiB7XCJoc2xcIjoge1wiaFwiOiAwLFwic1wiOiAxMDAsXCJsXCI6IDk5IH0sIFwicmdiXCI6IHtcInJcIjogMCxcImdcIjogMjU1LFwiYlwiOiAxMjcgfSwgXCJoZXhcIjogXCIjMDBmZjdmXCJ9LFxuICAgIFwic3RlZWxibHVlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE1MCxcInNcIjogMTAwLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDcwLFwiZ1wiOiAxMzAsXCJiXCI6IDE4MCB9LCBcImhleFwiOiBcIiM0NjgyYjRcIn0sXG4gICAgXCJ0YW5cIjoge1wiaHNsXCI6IHtcImhcIjogMjA3LFwic1wiOiA0NCxcImxcIjogNDkgfSwgXCJyZ2JcIjoge1wiclwiOiAyMTAsXCJnXCI6IDE4MCxcImJcIjogMTQwIH0sIFwiaGV4XCI6IFwiI2QyYjQ4Y1wifSxcbiAgICBcInRlYWxcIjoge1wiaHNsXCI6IHtcImhcIjogMzQsXCJzXCI6IDQ0LFwibFwiOiA2OSB9LCBcInJnYlwiOiB7XCJyXCI6IDAsXCJnXCI6IDEyOCxcImJcIjogMTI4IH0sIFwiaGV4XCI6IFwiIzAwODA4MFwifSxcbiAgICBcInRoaXN0bGVcIjoge1wiaHNsXCI6IHtcImhcIjogMzAwLFwic1wiOiAyNCxcImxcIjogODAgfSwgXCJyZ2JcIjoge1wiclwiOiAyMTYsXCJnXCI6IDE5MSxcImJcIjogMjE2IH0sIFwiaGV4XCI6IFwiI2Q4YmZkOFwifSxcbiAgICBcInRvbWF0b1wiOiB7XCJoc2xcIjoge1wiaFwiOiA5LFwic1wiOiAxMDAsXCJsXCI6IDY0IH0sIFwicmdiXCI6IHtcInJcIjogMjU1LFwiZ1wiOiA5OSxcImJcIjogNzEgfSwgXCJoZXhcIjogXCIjZmY2MzQ3XCJ9LFxuICAgIFwidHVycXVvaXNlXCI6IHtcImhzbFwiOiB7XCJoXCI6IDE3NCxcInNcIjogNzIsXCJsXCI6IDU2IH0sIFwicmdiXCI6IHtcInJcIjogNjQsXCJnXCI6IDIyNCxcImJcIjogMjA4IH0sIFwiaGV4XCI6IFwiIzQwZTBkMFwifSxcbiAgICBcInZpb2xldFwiOiB7XCJoc2xcIjoge1wiaFwiOiAzMDAsXCJzXCI6IDc2LFwibFwiOiA3MiB9LCBcInJnYlwiOiB7XCJyXCI6IDIzOCxcImdcIjogMTMwLFwiYlwiOiAyMzggfSwgXCJoZXhcIjogXCIjZWU4MmVlXCJ9LFxuICAgIFwid2hlYXRcIjoge1wiaHNsXCI6IHtcImhcIjogMzksXCJzXCI6IDc3LFwibFwiOiA4MyB9LCBcInJnYlwiOiB7XCJyXCI6IDI0NSxcImdcIjogMjIyLFwiYlwiOiAxNzkgfSwgXCJoZXhcIjogXCIjZjVkZWIzXCJ9LFxuICAgIFwid2hpdGVcIjoge1wiaHNsXCI6IHtcImhcIjogMCxcInNcIjogMCxcImxcIjogOTYgfSwgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDI1NSxcImJcIjogMjU1IH0sIFwiaGV4XCI6IFwiI2ZmZmZmZlwifSxcbiAgICBcIndoaXRlc21va2VcIjoge1wiaHNsXCI6IHtcImhcIjogODAsXCJzXCI6IDYxLFwibFwiOiA1MCB9LCBcInJnYlwiOiB7XCJyXCI6IDI0NSxcImdcIjogMjQ1LFwiYlwiOiAyNDUgfSwgXCJoZXhcIjogXCIjZjVmNWY1XCJ9LFwieWVsbG93XCI6IHsgXCJyZ2JcIjoge1wiclwiOiAyNTUsXCJnXCI6IDI1NSxcImJcIjogMCB9LCBcImhleFwiOiBcIiNmZmZmMDBcIn0sXCJ5ZWxsb3dncmVlblwiOiB7IFwicmdiXCI6IHtcInJcIjogMTU0LFwiZ1wiOiAyMDUsXCJiXCI6IDUwIH0sIFwiaGV4XCI6IFwiIzlhY2QzMlwifVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hbWVkY29sb3JzOyIsImZ1bmN0aW9uIG5lYXJseUVxdWFsKGEsIGIsIGVwcyl7XG4gICAgaWYgKHR5cGVvZiBlcHMgPT09IFwidW5kZWZpbmVkXCIpIHtlcHMgPSAwLjAxO31cbiAgICB2YXIgZGlmZiA9IE1hdGguYWJzKGEgLSBiKTtcbiAgICByZXR1cm4gKGRpZmYgPCBlcHMpO1xufVxuXG52YXIgaGVscGVycyA9IG5ldyBPYmplY3QobnVsbCk7XG5cbmhlbHBlcnMubmVhcmx5RXF1YWwgPSBuZWFybHlFcXVhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBoZWxwZXJzOyJdfQ==
(7)
});
