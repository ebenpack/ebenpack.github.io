/**
 * @license
 * Copyright (c) 2014 Eben Packwood. All rights reserved.
 * MIT License
 *
 */

/** @ignore */
var Vector = require('./vector.js');
var Matrix = require('./matrix.js');

var math = Object.create(null);

math.Vector = Vector;
math.Matrix = Matrix;

module.exports = math;
