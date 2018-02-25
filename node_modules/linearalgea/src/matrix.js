var Vector = require('./vector.js');

/** 
 * 4x4 matrix.
 * @constructor
 */
function Matrix() {
    for (var i = 0; i < 16; i++) {
        this[i] = 0;
    }
    this.length = 16;
}

var temp_matrix1 = new Matrix();
var temp_matrix2 = new Matrix();
var temp_matrix3 = new Matrix();
var temp_vector = new Vector(0, 0, 0);

/**
 * Compare matrices for equality.
 * @method
 * @param {Matrix} matrix
 * @return {boolean}
 */
Matrix.prototype.equal = function(matrix) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] !== matrix[i]) {
            return false;
        }
    }
    return true;
};
/**
 * Add matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.add = function(matrix) {
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++) {
        new_matrix[i] = this[i] + matrix[i];
    }
    return new_matrix;
};
/**
 * Add matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.addLG = function(matrix, result) {
    result[0] = this[0] + matrix[0];
    result[1] = this[1] + matrix[1];
    result[2] = this[2] + matrix[2];
    result[3] = this[3] + matrix[3];
    result[4] = this[4] + matrix[4];
    result[5] = this[5] + matrix[5];
    result[6] = this[6] + matrix[6];
    result[7] = this[7] + matrix[7];
    result[8] = this[8] + matrix[8];
    result[9] = this[9] + matrix[9];
    result[10] = this[10] + matrix[10];
    result[11] = this[11] + matrix[11];
    result[12] = this[12] + matrix[12];
    result[13] = this[13] + matrix[13];
    result[14] = this[14] + matrix[14];
    result[15] = this[15] + matrix[15];
    return result;
};
/**
 * Subtract matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.subtract = function(matrix) {
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++) {
        new_matrix[i] = this[i] - matrix[i];
    }
    return new_matrix;
};
/**
 * Subtract matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.subtractLG = function(matrix, result) {
    result[0] = this[0] - matrix[0];
    result[1] = this[1] - matrix[1];
    result[2] = this[2] - matrix[2];
    result[3] = this[3] - matrix[3];
    result[4] = this[4] - matrix[4];
    result[5] = this[5] - matrix[5];
    result[6] = this[6] - matrix[6];
    result[7] = this[7] - matrix[7];
    result[8] = this[8] - matrix[8];
    result[9] = this[9] - matrix[9];
    result[10] = this[10] - matrix[10];
    result[11] = this[11] - matrix[11];
    result[12] = this[12] - matrix[12];
    result[13] = this[13] - matrix[13];
    result[14] = this[14] - matrix[14];
    result[15] = this[15] - matrix[15];
    return result;
};
/**
 * Multiply matrix by scalar. Returns a new Matrix.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalar = function(scalar) {
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++) {
        new_matrix[i] = this[i] * scalar;
    }
    return new_matrix;
};
/**
 * Multiply matrix by scalar. Result is assigned to result parameter.
 * @method
 * @param {number} scalar
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalarLG = function(scalar, result) {
    result[0] = this[0] * scalar;
    result[1] = this[1] * scalar;
    result[2] = this[2] * scalar;
    result[3] = this[3] * scalar;
    result[4] = this[4] * scalar;
    result[5] = this[5] * scalar;
    result[6] = this[6] * scalar;
    result[7] = this[7] * scalar;
    result[8] = this[8] * scalar;
    result[9] = this[9] * scalar;
    result[10] = this[10] * scalar;
    result[11] = this[11] * scalar;
    result[12] = this[12] * scalar;
    result[13] = this[13] * scalar;
    result[14] = this[14] * scalar;
    result[15] = this[15] * scalar;
    return result;
};
/**
 * Multiply matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.multiply = function(matrix) {
    var new_matrix = new Matrix();
    new_matrix[0] = (
        (this[0] * matrix[0]) +
        (this[1] * matrix[4]) +
        (this[2] * matrix[8]) +
        (this[3] * matrix[12])
    );
    new_matrix[1] = (
        (this[0] * matrix[1]) +
        (this[1] * matrix[5]) +
        (this[2] * matrix[9]) +
        (this[3] * matrix[13])
    );
    new_matrix[2] = (
        (this[0] * matrix[2]) +
        (this[1] * matrix[6]) +
        (this[2] * matrix[10]) +
        (this[3] * matrix[14])
    );
    new_matrix[3] = (
        (this[0] * matrix[3]) +
        (this[1] * matrix[7]) +
        (this[2] * matrix[11]) +
        (this[3] * matrix[15])
    );
    new_matrix[4] = (
        (this[4] * matrix[0]) +
        (this[5] * matrix[4]) +
        (this[6] * matrix[8]) +
        (this[7] * matrix[12])
    );
    new_matrix[5] = (
        (this[4] * matrix[1]) +
        (this[5] * matrix[5]) +
        (this[6] * matrix[9]) +
        (this[7] * matrix[13])
    );
    new_matrix[6] = (
        (this[4] * matrix[2]) +
        (this[5] * matrix[6]) +
        (this[6] * matrix[10]) +
        (this[7] * matrix[14])
    );
    new_matrix[7] = (
        (this[4] * matrix[3]) +
        (this[5] * matrix[7]) +
        (this[6] * matrix[11]) +
        (this[7] * matrix[15])
    );
    new_matrix[8] = (
        (this[8] * matrix[0]) +
        (this[9] * matrix[4]) +
        (this[10] * matrix[8]) +
        (this[11] * matrix[12])
    );
    new_matrix[9] = (
        (this[8] * matrix[1]) +
        (this[9] * matrix[5]) +
        (this[10] * matrix[9]) +
        (this[11] * matrix[13])
    );
    new_matrix[10] = (
        (this[8] * matrix[2]) +
        (this[9] * matrix[6]) +
        (this[10] * matrix[10]) +
        (this[11] * matrix[14])
    );
    new_matrix[11] = (
        (this[8] * matrix[3]) +
        (this[9] * matrix[7]) +
        (this[10] * matrix[11]) +
        (this[11] * matrix[15])
    );
    new_matrix[12] = (
        (this[12] * matrix[0]) +
        (this[13] * matrix[4]) +
        (this[14] * matrix[8]) +
        (this[15] * matrix[12])
    );
    new_matrix[13] = (
        (this[12] * matrix[1]) +
        (this[13] * matrix[5]) +
        (this[14] * matrix[9]) +
        (this[15] * matrix[13])
    );
    new_matrix[14] = (
        (this[12] * matrix[2]) +
        (this[13] * matrix[6]) +
        (this[14] * matrix[10]) +
        (this[15] * matrix[14])
    );
    new_matrix[15] = (
        (this[12] * matrix[3]) +
        (this[13] * matrix[7]) +
        (this[14] * matrix[11]) +
        (this[15] * matrix[15])
    );
    return new_matrix;
};
/**
 * Multiply matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.multiplyLG = function(matrix, result) {
    result[0] = (
        (this[0] * matrix[0]) +
        (this[1] * matrix[4]) +
        (this[2] * matrix[8]) +
        (this[3] * matrix[12])
    );
    result[1] = (
        (this[0] * matrix[1]) +
        (this[1] * matrix[5]) +
        (this[2] * matrix[9]) +
        (this[3] * matrix[13])
    );
    result[2] = (
        (this[0] * matrix[2]) +
        (this[1] * matrix[6]) +
        (this[2] * matrix[10]) +
        (this[3] * matrix[14])
    );
    result[3] = (
        (this[0] * matrix[3]) +
        (this[1] * matrix[7]) +
        (this[2] * matrix[11]) +
        (this[3] * matrix[15])
    );
    result[4] = (
        (this[4] * matrix[0]) +
        (this[5] * matrix[4]) +
        (this[6] * matrix[8]) +
        (this[7] * matrix[12])
    );
    result[5] = (
        (this[4] * matrix[1]) +
        (this[5] * matrix[5]) +
        (this[6] * matrix[9]) +
        (this[7] * matrix[13])
    );
    result[6] = (
        (this[4] * matrix[2]) +
        (this[5] * matrix[6]) +
        (this[6] * matrix[10]) +
        (this[7] * matrix[14])
    );
    result[7] = (
        (this[4] * matrix[3]) +
        (this[5] * matrix[7]) +
        (this[6] * matrix[11]) +
        (this[7] * matrix[15])
    );
    result[8] = (
        (this[8] * matrix[0]) +
        (this[9] * matrix[4]) +
        (this[10] * matrix[8]) +
        (this[11] * matrix[12])
    );
    result[9] = (
        (this[8] * matrix[1]) +
        (this[9] * matrix[5]) +
        (this[10] * matrix[9]) +
        (this[11] * matrix[13])
    );
    result[10] = (
        (this[8] * matrix[2]) +
        (this[9] * matrix[6]) +
        (this[10] * matrix[10]) +
        (this[11] * matrix[14])
    );
    result[11] = (
        (this[8] * matrix[3]) +
        (this[9] * matrix[7]) +
        (this[10] * matrix[11]) +
        (this[11] * matrix[15])
    );
    result[12] = (
        (this[12] * matrix[0]) +
        (this[13] * matrix[4]) +
        (this[14] * matrix[8]) +
        (this[15] * matrix[12])
    );
    result[13] = (
        (this[12] * matrix[1]) +
        (this[13] * matrix[5]) +
        (this[14] * matrix[9]) +
        (this[15] * matrix[13])
    );
    result[14] = (
        (this[12] * matrix[2]) +
        (this[13] * matrix[6]) +
        (this[14] * matrix[10]) +
        (this[15] * matrix[14])
    );
    result[15] = (
        (this[12] * matrix[3]) +
        (this[13] * matrix[7]) +
        (this[14] * matrix[11]) +
        (this[15] * matrix[15])
    );
    return result;
};
/**
 * Negate matrix. Returns a new Matrix.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.negate = function() {
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++) {
        new_matrix[i] = -this[i];
    }
    return new_matrix;
};
/**
 * Negate matrix. Result is assigned to result parameter.
 * @method
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.negateLG = function(result) {
    result[0] = -this[0];
    result[1] = -this[1];
    result[2] = -this[2];
    result[3] = -this[3];
    result[4] = -this[4];
    result[5] = -this[5];
    result[6] = -this[6];
    result[7] = -this[7];
    result[8] = -this[8];
    result[9] = -this[9];
    result[10] = -this[10];
    result[11] = -this[11];
    result[12] = -this[12];
    result[13] = -this[13];
    result[14] = -this[14];
    result[15] = -this[15];
    return result;
};
/**
 * Transpose matrix. Returns a new Matrix.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.transpose = function() {
    var new_matrix = new Matrix();
    new_matrix[0] = this[0];
    new_matrix[1] = this[4];
    new_matrix[2] = this[8];
    new_matrix[3] = this[12];
    new_matrix[4] = this[1];
    new_matrix[5] = this[5];
    new_matrix[6] = this[9];
    new_matrix[7] = this[13];
    new_matrix[8] = this[2];
    new_matrix[9] = this[6];
    new_matrix[10] = this[10];
    new_matrix[11] = this[14];
    new_matrix[12] = this[3];
    new_matrix[13] = this[7];
    new_matrix[14] = this[11];
    new_matrix[15] = this[15];
    return new_matrix;
};
/**
 * Transpose matrix. Result is assigned to result parameter.
 * @method
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.transposeLG = function(result) {
    result[0] = this[0];
    result[1] = this[4];
    result[2] = this[8];
    result[3] = this[12];
    result[4] = this[1];
    result[5] = this[5];
    result[6] = this[9];
    result[7] = this[13];
    result[8] = this[2];
    result[9] = this[6];
    result[10] = this[10];
    result[11] = this[14];
    result[12] = this[3];
    result[13] = this[7];
    result[14] = this[11];
    result[15] = this[15];
    return result;
};
/**
 * Write zeros to all elements of the matrix.
 * @method
 */
Matrix.prototype.empty = function() {
    for (var i = 0, len = this.length; i < len; i++) {
        this[i] = 0;
    }
};
/**
 * Copy matrix values to another matrix.
 * @method
 * @param result
 *
 */
Matrix.prototype.copy = function(result) {
    for (var i = 0; i < 16; i++) {
        result[i] = this[i];
    }
    return result;
};


/**
 * Constructs a rotation matrix, rotating by theta around the x-axis.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationX = function(theta) {
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = 1;
    rotation_matrix[5] = cos;
    rotation_matrix[6] = -sin;
    rotation_matrix[9] = sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the x-axis.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationXLG = function(theta, result) {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = cos;
    result[6] = -sin;
    result[7] = 0;
    result[8] = 0;
    result[9] = sin;
    result[10] = cos;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the y-axis.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationY = function(theta) {
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = cos;
    rotation_matrix[2] = sin;
    rotation_matrix[5] = 1;
    rotation_matrix[8] = -sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the y-axis.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationYLG = function(theta, result) {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = cos;
    result[1] = 0;
    result[2] = sin;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = -sin;
    result[9] = 0;
    result[10] = cos;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the z-axis.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationZ = function(theta) {
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = cos;
    rotation_matrix[1] = -sin;
    rotation_matrix[4] = sin;
    rotation_matrix[5] = cos;
    rotation_matrix[10] = 1;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the z-axis.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationZLG = function(theta, result) {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = cos;
    result[1] = -sin;
    result[2] = 0;
    result[3] = 0;
    result[4] = sin;
    result[5] = cos;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the axis.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationAxis = function(axis, theta) {
    var rotation_matrix = new Matrix();
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1 - cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    rotation_matrix[0] = cos + ((ux * ux) * cos1);
    rotation_matrix[1] = (xy * cos1) - (uz * sin);
    rotation_matrix[2] = (xz * cos1) + (uy * sin);
    rotation_matrix[4] = (xy * cos1) + (uz * sin);
    rotation_matrix[5] = cos + ((uy * uy) * cos1);
    rotation_matrix[6] = (yz * cos1) - (ux * sin);
    rotation_matrix[8] = (xz * cos1) - (uy * sin);
    rotation_matrix[9] = (yz * cos1) + (ux * sin);
    rotation_matrix[10] = cos + ((uz * uz) * cos1);
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the axis.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationAxisLG = function(axis, theta, result) {
    axis.normalizeLG(temp_vector);
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1 - cos;
    var ux = temp_vector.x;
    var uy = temp_vector.y;
    var uz = temp_vector.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    result[0] = cos + ((ux * ux) * cos1);
    result[1] = (xy * cos1) - (uz * sin);
    result[2] = (xz * cos1) + (uy * sin);
    result[3] = 0;
    result[4] = (xy * cos1) + (uz * sin);
    result[5] = cos + ((uy * uy) * cos1);
    result[6] = (yz * cos1) - (ux * sin);
    result[7] = 0;
    result[8] = (xz * cos1) - (uy * sin);
    result[9] = (yz * cos1) + (ux * sin);
    result[10] = cos + ((uz * uz) * cos1);
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Matrix}
 */
Matrix.rotation = function(pitch, yaw, roll) {
    return (
        Matrix.rotationX(roll)
        .multiply(Matrix.rotationZ(yaw))
        .multiply(Matrix.rotationY(pitch))
    );
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationLG = function(pitch, yaw, roll, result) {
    Matrix.rotationXLG(roll, temp_matrix1);
    Matrix.rotationZLG(yaw, temp_matrix2);
    temp_matrix1.multiplyLG(temp_matrix2, temp_matrix3);
    Matrix.rotationYLG(pitch, temp_matrix2);
    temp_matrix3.multiplyLG(temp_matrix2, result);
    return result;
};
/**
 * Constructs a translation matrix from x, y, and z distances.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.translation = function(xtrans, ytrans, ztrans) {
    var translation_matrix = Matrix.identity();
    translation_matrix[12] = xtrans;
    translation_matrix[13] = ytrans;
    translation_matrix[14] = ztrans;
    return translation_matrix;
};
/**
 * Constructs a translation matrix from x, y, and z distances.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.translationLG = function(xtrans, ytrans, ztrans, result) {
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[12] = xtrans;
    result[13] = ytrans;
    result[14] = ztrans;
    result[15] = 1;
    return result;
};
/**
 * Constructs a scaling matrix from x, y, and z scale.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {number} xscale
 * @param {number} yscale
 * @param {number} zscale
 * @return {Matrix}
 */
Matrix.scale = function(xscale, yscale, zscale) {
    var scaling_matrix = new Matrix();
    scaling_matrix[0] = xscale;
    scaling_matrix[5] = yscale;
    scaling_matrix[10] = zscale;
    scaling_matrix[15] = 1;
    return scaling_matrix;
};
/**
 * Constructs a scaling matrix from x, y, and z scale.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} xscale
 * @param {number} yscale
 * @param {number} zscale
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.scaleLG = function(xscale, yscale, zscale, result) {
    result[0] = xscale;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = yscale;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = zscale;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs an identity matrix. Returns a new Matrix.
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.identity = function() {
    var identity = new Matrix();
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    return identity;
};
/**
 * Constructs an identity matrix.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.identityLG = function(result) {
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a zero matrix. Returns a new Matrix.
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.zero = function() {
    return new Matrix();
};
/**
 * Constructs a zero matrix.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.zeroLG = function(result) {
    result[0] = 0;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 0;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 0;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 0;
    return result;
};
/**
 * Constructs a new matrix from an array.
 * Returns a new Matrix.
 * @method
 * @static
 * @param {Array.<number>} arr
 * @return {Matrix}
 */
Matrix.fromArray = function(arr) {
    var new_matrix = new Matrix();
    for (var i = 0; i < 16; i++) {
        new_matrix[i] = arr[i];
    }
    return new_matrix;
};
/**
 * Constructs a new matrix from an array.
 * Result is assigned to result parameter.
 * @method
 * @static
 * @param {Array.<number>} arr
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.fromArrayLG = function(arr, result) {
    result[0] = arr[0];
    result[1] = arr[1];
    result[2] = arr[2];
    result[3] = arr[3];
    result[4] = arr[4];
    result[5] = arr[5];
    result[6] = arr[6];
    result[7] = arr[7];
    result[8] = arr[8];
    result[9] = arr[9];
    result[10] = arr[10];
    result[11] = arr[11];
    result[12] = arr[12];
    result[13] = arr[13];
    result[14] = arr[14];
    result[15] = arr[15];
    return result;
};
/**
 * Copy values from one matrix to another.
 * @param {Matrix} matrix1
 * @param {Matrix} matrix2
 * @return {Matrix}
 */
Matrix.copy = function(matrix1, matrix2) {
    for (var i = 0; i < 16; i++) {
        matrix2[i] = matrix1[i];
    }
    return matrix2;
};

module.exports = Matrix;