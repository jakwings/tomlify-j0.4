/*!
 * This is a modified version of https://github.com/thlorenz/deep-is
 *
 * Copyright (c) 2012, 2013 Thorsten Lorenz <thlorenz@gmx.de>
 * Copyright (c) 2012 James Halliday <mail@substack.net>
 * Copyright (c) 2009 Thomas Robinson <280north.com>
 *
 * This software is released under the MIT license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
(function () {
  var pSlice = Array.prototype.slice;
  var Object_keys = typeof Object.keys === 'function'
      ? Object.keys
      : function (obj) {
          var keys = [];
          for (var key in obj) keys.push(key);
          return keys;
      }
  ;

  var deepEqual = function (actual, expected) {
    // enforce Object.is +0 !== -0
    if (actual === 0 && expected === 0) {
      return areZerosEqual(actual, expected);

    // 7.1. All identical values are equivalent, as determined by ===.
    } else if (actual === expected) {
      return true;

    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();

    } else if (isNumberNaN(actual)) {
      return isNumberNaN(expected);

    // 7.3. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
      return actual == expected;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
      return objEquiv(actual, expected);
    }
  };

  function isUndefinedOrNull(value) {
    return value === null || value === undefined;
  }

  function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }

  function isNumberNaN(value) {
    // NaN === NaN -> false
    return typeof value == 'number' && value !== value;
  }

  function areZerosEqual(zeroA, zeroB) {
    // (1 / +0|0) -> Infinity, but (1 / -0) -> -Infinity and (Infinity !== -Infinity)
    return (1 / zeroA) === (1 / zeroB);
  }

  function objEquiv(a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
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
      return deepEqual(a, b);
    }
    try {
      var ka = Object_keys(a),
          kb = Object_keys(b),
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
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  this.eql = deepEqual;
}).call(this);
