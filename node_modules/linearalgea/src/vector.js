/**
 * 3D vector.
 * @constructor
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {number} z z coordinate
 */
function Vector(x, y, z) {
    if (typeof x === 'undefined' ||
        typeof y === 'undefined' ||
        typeof z === 'undefined') {
        throw new Error('Insufficient arguments.');
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

var temp_vector1 = new Vector(0, 0, 0);
var temp_vector2 = new Vector(0, 0, 0);

/**
 * Add vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.add = function(vector) {
    return new Vector(
        this.x + vector.x,
        this.y + vector.y,
        this.z + vector.z
    );
};
/**
 * Add vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.addLG = function(vector, result) {
    result.x = this.x + vector.x;
    result.y = this.y + vector.y;
    result.z = this.z + vector.z;
    return result;
};
/**
 * Subtract vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.subtract = function(vector) {
    return new Vector(
        this.x - vector.x,
        this.y - vector.y,
        this.z - vector.z
    );
};
/**
 * Subtract vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.subtractLG = function(vector, result) {
    result.x = this.x - vector.x;
    result.y = this.y - vector.y;
    result.z = this.z - vector.z;
    return result;
};
/**
 * Compare vectors for equality
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Vector.prototype.equal = function(vector) {
    return (
        this.x === vector.x &&
        this.y === vector.y &&
        this.z === vector.z
    );
};
/**
 * Calculate angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angle = function(vector) {
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0) {
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag);
    if (theta < -1) {
        theta = -1;
    } else if (theta > 1) {
        theta = 1;
    }
    return Math.acos(theta);
};
/**
 * Calculate angle between two vectors.
 * Low garbage (doesn't create any intermediate Vectors).
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angleLG = function(vector) {
    this.normalizeLG(temp_vector1);
    vector.normalizeLG(temp_vector2);
    var amag = temp_vector1.magnitude();
    var bmag = temp_vector2.magnitude();
    if (amag === 0 || bmag === 0) {
        return 0;
    }
    var theta = temp_vector1.dot(temp_vector2) / (amag * bmag);
    if (theta < -1) {
        theta = -1;
    } else if (theta > 1) {
        theta = 1;
    }
    return Math.acos(theta);
};
/**
 * Calculate the cosine of the angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngle = function(vector) {
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0) {
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag);
    if (theta < -1) {
        theta = -1;
    } else if (theta > 1) {
        theta = 1;
    }
    return theta;
};
/**
 * Calculate the cosine of the angle between two vectors. Low garbage (doesn't create any intermediate Vectors).
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngleLG = function(vector) {
    this.normalizeLG(temp_vector1);
    vector.normalizeLG(temp_vector2);
    var amag = temp_vector1.magnitude();
    var bmag = temp_vector2.magnitude();
    if (amag === 0 || bmag === 0) {
        return 0;
    }
    var theta = temp_vector1.dot(temp_vector2) / (amag * bmag);
    if (theta < -1) {
        theta = -1;
    } else if (theta > 1) {
        theta = 1;
    }
    return theta;
};
/**
 * Calculate magnitude of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitude = function() {
    return Math.sqrt(
        (this.x * this.x) +
        (this.y * this.y) +
        (this.z * this.z)
    );
};
/**
 * Calculate magnitude squared of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitudeSquared = function() {
    return (
        (this.x * this.x) +
        (this.y * this.y) +
        (this.z * this.z)
    );
};
/**
 * Calculate dot product of two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.dot = function(vector) {
    return (
        (this.x * vector.x) +
        (this.y * vector.y) +
        (this.z * vector.z)
    );
};
/**
 * Calculate cross product of two vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.cross = function(vector) {
    return new Vector(
        (this.y * vector.z) - (this.z * vector.y), (this.z * vector.x) - (this.x * vector.z), (this.x * vector.y) - (this.y * vector.x)
    );
};
/**
 * Calculate cross product of two vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.crossLG = function(vector, result) {
    result.x = (this.y * vector.z) - (this.z * vector.y);
    result.y = (this.z * vector.x) - (this.x * vector.z);
    result.z = (this.x * vector.y) - (this.y * vector.x);
    return result;
};
/**
 * Normalize vector. Returns a new Vector.
 * @method
 * @return {Vector}
 */
Vector.prototype.normalize = function() {
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        return new Vector(this.x, this.y, this.z);
    }
    return new Vector(
        this.x / magnitude,
        this.y / magnitude,
        this.z / magnitude
    );
};
/**
 * Normalize vector. Result is assigned to result parameter.
 * @method
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.normalizeLG = function(result) {
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        result.x = this.x;
        result.y = this.y;
        result.z = this.z;
    }
    result.x = this.x / magnitude;
    result.y = this.y / magnitude;
    result.z = this.z / magnitude;
    return result;
};
/**
 * Scale vector by scaling factor. Returns a new Vector.
 * @method
 * @param {number} scale
 * @return {Vector}
 */
Vector.prototype.scale = function(scale) {
    return new Vector(
        this.x * scale,
        this.y * scale,
        this.z * scale
    );
};
/**
 * Scale vector by scaling factor. Result is assigned to result parameter.
 * @method
 * @param {number} scale
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.scaleLG = function(scale, result) {
    result.x = this.x * scale;
    result.y = this.y * scale;
    result.z = this.z * scale;
    return result;
};
/**
 * Negate vector. Returns a new Vector.
 * @method
 * @return {Vector}
 */
Vector.prototype.negate = function() {
    return new Vector(-this.x, -this.y, -this.z);
};
/**
 * Negate vector. Result is assigned to result parameter.
 * @method
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.negateLG = function(result) {
    result.x = -this.x;
    result.y = -this.y;
    result.z = -this.z;
    return result;
};
/**
 * Calculate vector projection of two vectors.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.vectorProjection = function(vector) {
    var mag = vector.magnitude();
    return vector.scale(this.dot(vector) / (mag * mag));
};
/**
 * Calculate vector projection of two vectors. Does not construct any new Vectors in the course of its operation.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.vectorProjectionLG = function(vector, result) {
    var mag = vector.magnitude();
    vector.scaleLG(this.dot(vector) / (mag * mag), result);
    return result;
};
/**
 * Calculate scalar projection of two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.scalarProjection = function(vector) {
    return this.dot(vector) / vector.magnitude();
};
/**
 * Perform linear tranformation on a vector. Returns a new Vector.
 * @method
 * @param {Matrix} transform_matrix
 * @return {Vector}
 */
Vector.prototype.transform = function(transform_matrix) {
    var x = (
        (this.x * transform_matrix[0]) +
        (this.y * transform_matrix[4]) +
        (this.z * transform_matrix[8]) +
        transform_matrix[12]
    );
    var y = (
        (this.x * transform_matrix[1]) +
        (this.y * transform_matrix[5]) +
        (this.z * transform_matrix[9]) +
        transform_matrix[13]
    );
    var z = (
        (this.x * transform_matrix[2]) +
        (this.y * transform_matrix[6]) +
        (this.z * transform_matrix[10]) +
        transform_matrix[14]
    );
    var w = (
        (this.x * transform_matrix[3]) +
        (this.y * transform_matrix[7]) +
        (this.z * transform_matrix[11]) +
        transform_matrix[15]
    );
    return new Vector(x / w, y / w, z / w);
};
/**
 * Perform linear tranformation on a vector.  Result is assigned to result parameter.
 * @method
 * @param {Matrix} transform_matrix
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.transformLG = function(transform_matrix, result) {
    var x = (
        (this.x * transform_matrix[0]) +
        (this.y * transform_matrix[4]) +
        (this.z * transform_matrix[8]) +
        transform_matrix[12]
    );
    var y = (
        (this.x * transform_matrix[1]) +
        (this.y * transform_matrix[5]) +
        (this.z * transform_matrix[9]) +
        transform_matrix[13]
    );
    var z = (
        (this.x * transform_matrix[2]) +
        (this.y * transform_matrix[6]) +
        (this.z * transform_matrix[10]) +
        transform_matrix[14]
    );
    var w = (
        (this.x * transform_matrix[3]) +
        (this.y * transform_matrix[7]) +
        (this.z * transform_matrix[11]) +
        transform_matrix[15]
    );
    result.x = x / w;
    result.y = y / w;
    result.z = z / w;
    return result;
};
/**
 * Rotate vector by theta around axis. Returns a new Vector.
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotate = function(axis, theta) {
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1 - cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = u.x * u.y;
    var xz = u.x * u.z;
    var yz = u.y * u.z;
    var x = (
        ((cos + ((ux * ux) * cos1)) * this.x) +
        (((xy * cos1) - (uz * sin)) * this.y) +
        (((xz * cos1) + (uy * sin)) * this.z)
    );
    var y = (
        (((xy * cos1) + (uz * sin)) * this.x) +
        ((cos + ((uy * uy) * cos1)) * this.y) +
        (((yz * cos1) - (ux * sin)) * this.z)
    );
    var z = (
        (((xz * cos1) - (uy * sin)) * this.x) +
        (((yz * cos1) + (ux * sin)) * this.y) +
        ((cos + ((ux * ux) * cos1)) * this.z)
    );
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around axis. Result is assigned to result parameter.
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateLG = function(axis, theta, result) {
    axis.normalizeLG(result);
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1 - cos;
    var ux = result.x;
    var uy = result.y;
    var uz = result.z;
    var xy = result.x * result.y;
    var xz = result.x * result.z;
    var yz = result.y * result.z;
    var x = (
        ((cos + ((ux * ux) * cos1)) * this.x) +
        (((xy * cos1) - (uz * sin)) * this.y) +
        (((xz * cos1) + (uy * sin)) * this.z)
    );
    var y = (
        (((xy * cos1) + (uz * sin)) * this.x) +
        ((cos + ((uy * uy) * cos1)) * this.y) +
        (((yz * cos1) - (ux * sin)) * this.z)
    );
    var z = (
        (((xz * cos1) - (uy * sin)) * this.x) +
        (((yz * cos1) + (ux * sin)) * this.y) +
        ((cos + ((ux * ux) * cos1)) * this.z)
    );
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around x-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateX = function(theta) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around x-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateXLG = function(theta, result) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around y-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateY = function(theta) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around y-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateYLG = function(theta, result) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around z-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateZ = function(theta) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around z-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateZLG = function(theta, result) {
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by pitch, yaw, and roll. Returns a new Vector.
 * @method
 * @param {number} pitch_amnt
 * @param {number} yaw_amnt
 * @param {number} roll_amnt
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRoll = function(pitch_amnt, yaw_amnt, roll_amnt) {
    return (
        this.rotateX(roll_amnt)
        .rotateY(pitch_amnt)
        .rotateZ(yaw_amnt)
    );
};
/** 
 * Rotate vector by pitch, yaw, and roll. Result is assigned to result parameter.
 * @method
 * @param {number} pitch_amnt
 * @param {number} yaw_amnt
 * @param {number} roll_amnt
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRollLG = function(pitch_amnt, yaw_amnt, roll_amnt, result) {
    this.rotateXLG(roll_amnt, result);
    result.rotateYLG(pitch_amnt, result);
    result.rotateZLG(yaw_amnt, result);
    return result;
};

module.exports = Vector;