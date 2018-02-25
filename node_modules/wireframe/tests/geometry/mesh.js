var Mesh = require('../../src/geometry/mesh.js');
var Face = require('../../src/geometry/face.js');
var Vector = require('linearalgea').Vector;
var assert = require("assert");

suite('Mesh', function(){
    var mesh;
    setup(function(){
        mesh = new Mesh('triangle',
            [
                new Vector(1,0,0),
                new Vector(0,1,0),
                new Vector(0,0,1)
            ],
            [
                new Face(0, 1, 2, 'red')
            ]);
    });
    suite('properties', function(){
        test('name', function(){
            assert.equal(mesh.name, 'triangle');
        });
        test('vertices', function(){
            assert.equal(mesh.vertices[0].x, 1);
            assert.equal(mesh.vertices[0].y, 0);
            assert.equal(mesh.vertices[0].z, 0);
            assert.equal(mesh.vertices[1].x, 0);
            assert.equal(mesh.vertices[1].y, 1);
            assert.equal(mesh.vertices[1].z, 0);
            assert.equal(mesh.vertices[2].x, 0);
            assert.equal(mesh.vertices[2].y, 0);
            assert.equal(mesh.vertices[2].z, 1);
        });
        test('faces', function(){
            assert.equal(mesh.faces[0].face[0], 0);
            assert.equal(mesh.faces[0].face[1], 1);
            assert.equal(mesh.faces[0].face[2], 2);
        });
        test('position', function(){
            assert.equal(mesh.position.x, 0);
            assert.equal(mesh.position.y, 0);
            assert.equal(mesh.position.z, 0);
        });
        test('rotation', function(){
            assert.equal(mesh.rotation.pitch, 0);
            assert.equal(mesh.rotation.yaw, 0);
            assert.equal(mesh.rotation.roll, 0);
        });
        test('scale', function(){
            assert.equal(mesh.scale.x, 1);
            assert.equal(mesh.scale.y, 1);
            assert.equal(mesh.scale.z, 1);
        });
    });
    suite('methods', function(){
        test('fromJSON', function(){
            var json = Mesh.fromJSON(
                {
                    'name': 'triangle',
                    'vertices':[
                        [1,0,0],
                        [0,1,0],
                        [0,0,1]
                    ],
                    'faces':[
                        {'face': [0, 1, 2], 'color': 'red'}
                    ]
                });
            assert.equal(mesh.vertices[0].x, json.vertices[0].x);
            assert.equal(mesh.vertices[0].y, json.vertices[0].y);
            assert.equal(mesh.vertices[0].z, json.vertices[0].z);
            assert.equal(mesh.vertices[1].x, json.vertices[1].x);
            assert.equal(mesh.vertices[1].y, json.vertices[1].y);
            assert.equal(mesh.vertices[1].z, json.vertices[1].z);
            assert.equal(mesh.vertices[2].x, json.vertices[2].x);
            assert.equal(mesh.vertices[2].y, json.vertices[2].y);
            assert.equal(mesh.vertices[2].z, json.vertices[2].z);

            assert.equal(mesh.faces[0].face[0], json.faces[0].face[0]);
            assert.equal(mesh.faces[0].face[1], json.faces[0].face[1]);
            assert.equal(mesh.faces[0].face[2], json.faces[0].face[2]);

            assert.equal(mesh.position.x, json.position.x);
            assert.equal(mesh.position.y, json.position.y);
            assert.equal(mesh.position.z, json.position.z);
     
            assert.equal(mesh.rotation.pitch, json.rotation.pitch);
            assert.equal(mesh.rotation.yaw, json.rotation.yaw);
            assert.equal(mesh.rotation.roll, json.rotation.roll);
        
            assert.equal(mesh.scale.x, mesh.scale.x);
            assert.equal(mesh.scale.y, mesh.scale.y);
            assert.equal(mesh.scale.z, mesh.scale.z);
        });
    });
});