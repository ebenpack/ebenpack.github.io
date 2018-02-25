var Color = require('colour');

/**
 * A 3D triangle
 * @constructor
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {string} color
 */
function Face(a, b, c, color){
    this.face = [a, b, c];
    this.color = new Color(color);
}

module.exports = Face;