var Camera = require('../../src/engine/camera.js');
var assert = require("assert");

suite('Camera', function(){
    var camera;
    setup(function(){
        camera = new Camera(600, 400);
    })
    suite('properties', function(){
        test('height', function(){
            assert.ok(camera.height);
            assert.equal(camera.height, 400);
        });
    });
    suite('methods', function(){

    });
});