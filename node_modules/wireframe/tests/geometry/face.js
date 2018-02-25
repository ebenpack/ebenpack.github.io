var Face = require('../../src/geometry/face.js');
var assert = require("assert");

var face;

suite('Face', function(){
    var face;
    setup(function(){
        face = new Face(0, 1, 2, "red");
    });
    suite('properties', function(){
        test('vertices', function(){
            assert.equal(face.face[0], 0);
            assert.equal(face.face[1], 1);
            assert.equal(face.face[2], 2);
        });
        test('color', function(){
            assert.equal(face.color.rgb.r, 255);
        });
    });
});