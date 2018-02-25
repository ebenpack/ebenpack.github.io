var Colour = require('../src/colour.js');
var named = require('./data/colors.js');
var nearlyEqual = require('./helpers.js')['nearlyEqual'];
var assert = require("assert");

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