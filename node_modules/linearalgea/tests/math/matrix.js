var Matrix = require('../../src/matrix.js');
var Vector = require('../../src/vector.js');
var assert = require("assert");

suite('Matrix', function(){
    var zero, zero2, zero3, identity, identity2, identity3, ones, m0, m1, m2, m3, m4, m5, m6, m7, angles;
    var result, result2, temp_mat, temp_vector;
    setup(function(){
        result = new Matrix();
        result2 = new Matrix();
        temp_mat = new Matrix();
        temp_vector = new Vector(0,0,0);
        angles = [0, Math.PI / 2, Math.PI, 3*Math.PI / 2, Math.PI / 2];
        zero = Matrix.zero();
        zero2 = new Matrix();
        zero3 = Matrix.fromArray([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        identity = Matrix.identity();
        identity2 = new Matrix();
        identity3 = Matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
        identity2[0] = 1;
        identity2[5] = 1;
        identity2[10] = 1;
        identity2[15] = 1;
        ones = new Matrix();
        m0 = new Matrix();
        m1 = new Matrix();
        m2 = new Matrix();
        m3 = new Matrix();
        m4 = new Matrix();
        m4[0] = 0;
        m4[1] = 1;
        m4[2] = 1;
        m4[3] = 2;
        m4[4] = 3;
        m4[5] = 5;
        m4[6] = 8;
        m4[7] = 13;
        m4[8] = 21;
        m4[9] = 34;
        m4[10] = 55;
        m4[11] = 89;
        m4[12] = 144;
        m4[13] = 233;
        m4[14] = 377;
        m4[15] = 610;
        m5 = Matrix.fromArray([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]);
        m6 = Matrix.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
        m7 = Matrix.fromArray([34, 44, 54, 64, 82, 108, 134, 160, 34, 44, 54, 64, 82, 108, 134, 160]);
        for (var i = 0; i < 16; i++){
            ones[i] = 1;
            m0[i] = i;
            m1[i] = i+1;
            m2[i] = i+2;
            m3[i] = i*2;
        }
    });
    suite('properties', function(){
        test('length', function(){
            assert.equal(zero.length, 16);
            assert.equal(zero2.length, 16);
            assert.equal(zero3.length, 16);
            assert.equal(identity.length, 16);
            assert.equal(identity2.length, 16);
            assert.equal(m1.length, 16);
            assert.equal(m2.length, 16);
            assert.equal(m3.length, 16);
            assert.equal(m4.length, 16);
            assert.equal(m5.length, 16);
        });
    });
    suite('methods', function(){
        test('equal', function(){
            assert.ok(identity.equal(identity2));
            assert.ok(zero.equal(zero2));
            assert.ok(zero.equal(zero3));
            assert.ok(zero2.equal(zero3));
            assert.ok(!identity.equal(zero));
            assert.ok(m4.equal(m5));
            assert.ok(!m0.equal(m1));
            assert.ok(!m0.equal(m2));
            assert.ok(!m0.equal(m3));
        });
        test('add', function(){
            var t1 = zero.add(m1);
            var t2 = m0.add(ones);
            var t3 = m0.add(ones).add(ones);
            assert.ok(t1.equal(m1));
            assert.ok(t2.equal(m1));
            assert.ok(t3.equal(m2));
        });
        test('addLG', function(){
            result2 = zero.addLG(m1, result);
            assert.ok(result.equal(m1));
            m0.addLG(ones, result);
            assert.ok(result.equal(m1));
            assert.ok(result2.equal(result));
            
            m0.addLG(ones, result)
            result.addLG(ones, result);
            assert.ok(result.equal(m2));
        });
        test('subtract', function(){
            var t1 = m4.subtract(m5);
            var t2 = m1.subtract(ones);
            var t3 = m2.subtract(m1);
            assert.ok(t1.equal(zero));
            assert.ok(t2.equal(m0));
            assert.ok(t3.equal(ones));
        });
        test('subtractLG', function(){
            result2 = m4.subtractLG(m5, result);
            assert.ok(result.equal(zero));
            m1.subtractLG(ones, result);
            assert.ok(result.equal(m0));
            m2.subtractLG(m1, result);
            assert.ok(result.equal(ones));
            assert.ok(result2.equal(result));
        });
        test('multiplyScalar', function(){
            var t1 = m0.multiplyScalar(2);
            var t2 = zero.multiplyScalar(20);
            var t3 = m0.multiplyScalar(1);
            assert.ok(t1.equal(m3));
            assert.ok(t2.equal(zero));
            assert.ok(t3.equal(m0));
        });
        test('multiplyScalarLG', function(){
            result2 = m0.multiplyScalarLG(2, result);
            assert.ok(result.equal(m3));
            zero.multiplyScalarLG(20, result);
            assert.ok(result.equal(zero));
            m0.multiplyScalarLG(1, result);
            assert.ok(result.equal(m0));
            assert.ok(result2.equal(result));
        });
        test('multiply', function(){
            var t1 = m6.multiply(m6);
            var t2 = identity.multiply(identity);
            var t3 = identity.multiply(zero);
            var t4 = identity.multiply(m0);
            var t5 = zero.multiply(m0);
            assert.ok(t1.equal(m7));
            assert.ok(t2.equal(identity));
            assert.ok(t3.equal(zero));
            assert.ok(t4.equal(m0));
            assert.ok(t5.equal(zero));
        });
        test('multiplyLG', function(){
            result2 = m6.multiplyLG(m6, result);
            assert.ok(result.equal(m7));
            identity.multiplyLG(identity, result);
            assert.ok(result.equal(identity));
            identity.multiplyLG(zero, result);
            assert.ok(result.equal(zero));
            identity.multiplyLG(m0, result);
            assert.ok(result.equal(m0));
            zero.multiplyLG(m0, result);
            assert.ok(result.equal(zero));
            assert.ok(result2.equal(result));
        });
        test('negate', function(){
            var t1 = m0.negate();
            var t2 = m1.negate();
            var t3 = m2.negate();
            var t4 = m3.negate();
            var t5 = zero.negate();
            var t6 = ones.negate();

            assert.ok(zero.equal(t5));
            for (var i = 0; i < 16; i++){
                assert.equal(t1[i], -m0[i]);
                assert.equal(t2[i], -m1[i]);
                assert.equal(t3[i], -m2[i]);
                assert.equal(t4[i], -m3[i]);
            }
            for (var j = 0; j < 16; j++){
                assert.equal(t1[j], -j);
                assert.equal(t6[j], -1);
            }
        });
        test('negateLG', function(){
            result2 = zero.negateLG(result);
            assert.ok(result.equal(zero));
            for (var i = 0; i < 16; i++){
                m0.negateLG(result);
                assert.equal(result[i], -m0[i]);
                m1.negateLG(result);
                assert.equal(result[i], -m1[i]);
                m2.negateLG(result);
                assert.equal(result[i], -m2[i]);
                m3.negateLG(result);
                assert.equal(result[i], -m3[i]);
            }
            for (var j = 0; j < 16; j++){
                m0.negateLG(result);
                assert.equal(result[j], -j);
                ones.negateLG(result);
                assert.equal(result[j], -1);
            }
            result2 = m2.negateLG(result);
            assert.ok(result2.equal(result));
        });
        test('transpose', function(){
            var transpose_map = {
                0:0, 1:4, 2:8, 3:12, 4:1, 5:5, 6:9, 7:13,
                8:2, 9:6, 10:10, 11:14, 12:3, 13:7, 14:11, 15:15
            }
            var t1 = identity.transpose();
            var t2 = ones.transpose();
            var t3 = zero.transpose();
            var t4 = m0.transpose();
            var t5 = m1.transpose();
            var t6 = m2.transpose();
            var t7 = m3.transpose();

            assert.ok(t1.equal(identity));
            assert.ok(t2.equal(ones));
            assert.ok(t3.equal(zero));
            var t4 = m0.transpose();
            for (var i = 0; i < 16; i++){
                assert.equal(t4[i], m0[transpose_map[i]]);
                assert.equal(t5[i], m1[transpose_map[i]]);
                assert.equal(t6[i], m2[transpose_map[i]]);
                assert.equal(t7[i], m3[transpose_map[i]]);
            }
        });
        test('transposeLG', function(){
            var transpose_map = {
                0:0, 1:4, 2:8, 3:12, 4:1, 5:5, 6:9, 7:13,
                8:2, 9:6, 10:10, 11:14, 12:3, 13:7, 14:11, 15:15
            }

            identity.transposeLG(result);
            assert.ok(result.equal(identity));
            ones.transposeLG(result);
            assert.ok(result.equal(ones));
            zero.transposeLG(result);
            assert.ok(result.equal(zero));
            var t4 = m0.transpose();
            for (var i = 0; i < 16; i++){
                m0.transposeLG(result);
                assert.equal(result[i], m0[transpose_map[i]]);
                m1.transposeLG(result);
                assert.equal(result[i], m1[transpose_map[i]]);
                m2.transposeLG(result);
                assert.equal(result[i], m2[transpose_map[i]]);
                m3.transposeLG(result);
                assert.equal(result[i], m3[transpose_map[i]]);
            }
            result2 = m3.transposeLG(result);
            assert.ok(result2.equal(result));
        });
        test('empty', function(){
                m0.transposeLG(result);
                result.empty();
                assert.ok(result.equal(zero));
                m1.transposeLG(result);
                result.empty();
                assert.ok(result.equal(zero));
                m2.transposeLG(result);
                result.empty();
                assert.ok(result.equal(zero));
                m3.transposeLG(result);
                result.empty();
                assert.ok(result.equal(zero));
        });
        test('copy', function(){
            m0.copy(result);
            assert.ok(result.equal(m0));
            m1.copy(result);
            assert.ok(result.equal(m1));
            m2.copy(result);
            assert.ok(result.equal(m2));
            m3.copy(result);
            assert.ok(result.equal(m3));
        });
        test('rotationX', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                var t1 = Matrix.rotationX(theta);
                var t2 = Matrix.identity();
                t2[5] = Math.cos(theta)
                t2[6] = -Math.sin(theta)
                t2[9] = Math.sin(theta)
                t2[10] = Math.cos(theta)
                assert.ok(t1.equal(t2));
            }
        });
        test('rotationXLG', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                result2 = Matrix.rotationXLG(theta, result);
                var t2 = Matrix.identity();
                t2[5] = Math.cos(theta)
                t2[6] = -Math.sin(theta)
                t2[9] = Math.sin(theta)
                t2[10] = Math.cos(theta)
                assert.ok(result.equal(t2));
                assert.ok(result2.equal(result));
            }
        });
        test('rotationY', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                var t1 = Matrix.rotationY(theta);
                var t2 = Matrix.identity();
                t2[0] = Math.cos(theta)
                t2[2] = Math.sin(theta)
                t2[8] = -Math.sin(theta)
                t2[10] = Math.cos(theta)
                assert.ok(t1.equal(t2));
            }
        });
        test('rotationYLG', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                result2 = Matrix.rotationYLG(theta, result);
                var t2 = Matrix.identity();
                t2[0] = Math.cos(theta)
                t2[2] = Math.sin(theta)
                t2[8] = -Math.sin(theta)
                t2[10] = Math.cos(theta)
                assert.ok(result.equal(t2));
                assert.ok(result2.equal(result));
            }
        });
        test('rotationZ', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                var t1 = Matrix.rotationZ(theta);
                var t2 = Matrix.identity();
                t2[0] = Math.cos(theta)
                t2[1] = -Math.sin(theta)
                t2[4] = Math.sin(theta)
                t2[5] = Math.cos(theta)
                assert.ok(t1.equal(t2));
            }
        });
        test('rotationZLG', function(){
            // TODO: Add more tests
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                result2 = Matrix.rotationZLG(theta, result);
                var t2 = Matrix.identity();
                t2[0] = Math.cos(theta)
                t2[1] = -Math.sin(theta)
                t2[4] = Math.sin(theta)
                t2[5] = Math.cos(theta)
                assert.ok(result.equal(t2));
                assert.ok(result2.equal(result));
            }
        });
        test('rotationAxis', function(){
            // TODO: Add multi-axis tests?
            var xaxis = new Vector(1, 0, 0);
            var yaxis = new Vector(0, 1, 0);
            var zaxis = new Vector(0, 0, 1);
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                var t1 = Matrix.rotationAxis(xaxis, theta);
                var t2 = Matrix.rotationAxis(yaxis, theta);
                var t3 = Matrix.rotationAxis(zaxis, theta);
                var t4 = Matrix.rotationAxis(xaxis, theta);
                var t5 = Matrix.rotationAxis(yaxis, theta);
                var t6 = Matrix.rotationAxis(zaxis, theta);
                assert.ok(t1.equal(Matrix.rotationX(theta)));
                assert.ok(t2.equal(Matrix.rotationY(theta)));
                assert.ok(t3.equal(Matrix.rotationZ(theta)));
                assert.ok(t4.equal(Matrix.rotationX(theta)));
                assert.ok(t5.equal(Matrix.rotationY(theta)));
                assert.ok(t6.equal(Matrix.rotationZ(theta)));
            }
        });
        test('rotationAxisLG', function(){
            // TODO: Add multi-axis tests?
            var xaxis = new Vector(1, 0, 0);
            var yaxis = new Vector(0, 1, 0);
            var zaxis = new Vector(0, 0, 1);
            for (var i = 0; i < angles.length; i++){
                var theta = angles[i];
                Matrix.rotationAxisLG(xaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationX(theta)));
                Matrix.rotationAxisLG(yaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationY(theta)));
                Matrix.rotationAxisLG(zaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationZ(theta)));
                Matrix.rotationAxisLG(xaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationX(theta)));
                Matrix.rotationAxisLG(yaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationY(theta)));
                result2 = Matrix.rotationAxisLG(zaxis, theta, result);
                assert.ok(result.equal(Matrix.rotationZ(theta)));
                assert.ok(result2.equal(result));
            }
        });
        test('rotation', function(){
            // TODO: Add better tests, this is basically just recreating the method
            for (var i = 0; i < angles.length; i++){
                var pitch = angles[i];
                for (var j = 0; j < angles.length; j++){
                    var yaw = angles[j];
                    for (var k = 0; k < angles.length; k++){
                        var roll = angles[k];
                        var t1 = Matrix.rotation(pitch, yaw, roll);
                        var t2 = Matrix.rotationX(roll).
                            multiply(Matrix.rotationZ(yaw)).
                            multiply(Matrix.rotationY(pitch));
                        assert.ok(t1.equal(t2));
                    }
                }
            }
        });
        test('rotationLG', function(){
            // TODO: Add better tests, this is basically just recreating the method
            for (var i = 0; i < angles.length; i++){
                var pitch = angles[i];
                for (var j = 0; j < angles.length; j++){
                    var yaw = angles[j];
                    for (var k = 0; k < angles.length; k++){
                        var roll = angles[k];
                        result2 = Matrix.rotationLG(pitch, yaw, roll, result);
                        var t1 = Matrix.rotationX(roll).
                            multiply(Matrix.rotationZ(yaw)).
                            multiply(Matrix.rotationY(pitch));
                        assert.ok(result.equal(t1));
                        assert.ok(result2.equal(result));
                    }
                }
            }
        });
        test('translation', function(){
            var trans = [1, 2, 3, 5, 10, 20, 30, 40];
            for (var i = 0; i < trans.length; i++){
                var xtrans = trans[i];
                for (var j = 0; j < trans.length; j++){
                    var ytrans = trans[j];
                    for (var k = 0; k < trans.length; k++){
                        var ztrans = trans[k];
                        var t1 = Matrix.translation(xtrans, ytrans, ztrans);
                        for (var m = 0; m < 16; m++){
                            var result;
                            if (m === 12){
                                result = xtrans;
                            } else if (m === 13){
                                result = ytrans;
                            } else if (m === 14){
                                result = ztrans;
                            } else if (m === 0 || m === 5 || m === 10 || m === 15) {
                                result = 1;
                            } else {
                                result = 0;
                            }
                            assert.equal(t1[m], result);
                        }
                    }
                }
            }
        });
        test('translationLG', function(){
            var trans = [1, 2, 3, 5, 10, 20, 30, 40];
            for (var i = 0; i < trans.length; i++){
                var xtrans = trans[i];
                for (var j = 0; j < trans.length; j++){
                    var ytrans = trans[j];
                    for (var k = 0; k < trans.length; k++){
                        var ztrans = trans[k];
                        result2 = Matrix.translationLG(xtrans, ytrans, ztrans, result);
                        for (var m = 0; m < 16; m++){
                            var res;
                            if (m === 12){
                                res = xtrans;
                            } else if (m === 13){
                                res = ytrans;
                            } else if (m === 14){
                                res = ztrans;
                            } else if (m === 0 || m === 5 || m === 10 || m === 15) {
                                res = 1;
                            } else {
                                res = 0;
                            }
                            assert.equal(res, result[m]);
                            assert.ok(result2.equal(result));
                        }
                    }
                }
            }
        });
        test('scale', function(){
            var scale = [1, 2, 3, 5, 10, 20, 30, 40];
            for (var i = 0; i < scale.length; i++){
                var xscale = scale[i];
                for (var j = 0; j < scale.length; j++){
                    var yscale = scale[j];
                    for (var k = 0; k < scale.length; k++){
                        var zscale = scale[k];
                        var t1 = Matrix.scale(xscale, yscale, zscale);
                        for (var m = 0; m < 16; m++){
                            var result;
                            if (m === 0){
                                result = xscale;
                            } else if (m === 5){
                                result = yscale;
                            } else if (m === 10){
                                result = zscale;
                            } else if (m === 15) {
                                result = 1;
                            } else {
                                result = 0;
                            }
                            assert.equal(t1[m], result);
                        }
                    }
                }
            }
        });
        test('scaleLG', function(){
            var scale = [1, 2, 3, 5, 10, 20, 30, 40];
            for (var i = 0; i < scale.length; i++){
                var xscale = scale[i];
                for (var j = 0; j < scale.length; j++){
                    var yscale = scale[j];
                    for (var k = 0; k < scale.length; k++){
                        var zscale = scale[k];
                        result2 = Matrix.scaleLG(xscale, yscale, zscale, result);
                        for (var m = 0; m < 16; m++){
                            var res;
                            if (m === 0){
                                res = xscale;
                            } else if (m === 5){
                                res = yscale;
                            } else if (m === 10){
                                res = zscale;
                            } else if (m === 15) {
                                res = 1;
                            } else {
                                res = 0;
                            }
                            assert.equal(result[m], res);
                            assert.ok(result2.equal(result));
                        }
                    }
                }
            }
        });
        test('identity', function(){
            assert.ok(identity.equal(identity2));
            assert.ok(identity.equal(identity3));
            for (var i = 0; i < 16; i++){
                if (i % 5 === 0){
                    assert.equal(identity[i], 1);
                } else {
                    assert.equal(identity[i], 0);
                }
            }
        });
        test('identityLG', function(){
            result2 = Matrix.identityLG(result);
            assert.ok(result.equal(identity2));
            assert.ok(result.equal(identity3));
            for (var i = 0; i < 16; i++){
                if (i % 5 === 0){
                    assert.equal(result[i], 1);
                } else {
                    assert.equal(result[i], 0);
                }
            }
            assert.ok(result2.equal(result));
        });
        test('zero', function(){
            assert.ok(zero.equal(zero2));
            assert.ok(zero.equal(zero3));
            for (var i = 0; i < 16; i++){
                assert.equal(zero[i], 0);
            }
        });
        test('zeroLG', function(){
            result2 = Matrix.zeroLG(result);
            assert.ok(result.equal(zero2));
            assert.ok(result.equal(zero3));
            for (var i = 0; i < 16; i++){
                assert.equal(result[i], 0);
            }
            assert.ok(result2.equal(result));
        });
        test('fromArray', function(){
            assert.ok(m5.equal(m4));
            assert.ok(zero.equal(zero3));
            assert.ok(zero2.equal(zero3));
            assert.ok(identity.equal(identity3));
            assert.ok(identity2.equal(identity3));
        });
        test('fromArrayLG', function(){
            Matrix.fromArrayLG([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], result);
            assert.ok(result.equal(zero3));
            assert.ok(result.equal(zero2));
            Matrix.fromArrayLG([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], result);
            assert.ok(result.equal(identity2));
            result2 = Matrix.fromArrayLG([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], result);
            assert.ok(result.equal(m4));
            assert.ok(result2.equal(result));
        });
        test('Matrix.copy', function(){
            Matrix.copy(m0, result);
            assert.ok(result.equal(m0));
            Matrix.copy(m1, result);
            assert.ok(result.equal(m1));
            Matrix.copy(m2, result);
            assert.ok(result.equal(m2));
            Matrix.copy(m3, result);
            assert.ok(result.equal(m3));
        });
    });
});
