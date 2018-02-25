!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.tests=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.Colour=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var hslToRgb, rgbToHsl, parseColor, cache;
/**
 * A color with both rgb and hsl representations.
 * @class Colour
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 */
function Colour(color, alpha){
    var hsl, rgb;
    var parsed_color = {};
    if (typeof color === 'string'){
        color = color.toLowerCase();
        if (color in cache){
            parsed_color = cache[color];
        } else {
            parsed_color = parseColor(color);
            cache[color] = parsed_color;
        }
        rgb = parsed_color;
        hsl = rgbToHsl(parsed_color.r, parsed_color.g, parsed_color.b);
        alpha = parsed_color.a || alpha || 1;
    } else if ('r' in color){
        rgb = color;
        hsl = rgbToHsl(color.r, color.g, color.b);
        alpha = hsl.a || alpha || 1;
    } else if ('h' in color){
        hsl = color;
        rgb = hslToRgb(color.h, color.s, color.l);
        alpha = rgb.a || alpha || 1;
    }
    this.rgb = {'r': rgb.r, 'g': rgb.g, 'b': rgb.b};
    this.hsl = {'h': hsl.h, 's': hsl.s, 'l': hsl.l};
    this.alpha = alpha;
}
/**
 * Lighten a color by the given percentage.

 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.lighten = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l + percent;
    if (lum > 100){
        lum = 100;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Darken a color by the given percentage.
 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.darken = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l - percent;
    if (lum < 0){
        lum = 0;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Return a string representation of color in #hex form.
 * @method
 * @return {string}
 */
Colour.prototype.toString = function(){
    var r = this.rgb.r.toString(16);
    var g = this.rgb.g.toString(16);
    var b = this.rgb.b.toString(16);
    // Zero fill
    if (r.length === 1){
        r = "0" + r;
    }
    if (g.length === 1){
        g = "0" + g;
    }
    if (b.length === 1){
        b = "0" + b;
    }
    return "#" + r + g + b;
};
/**
* @param {number} h Hue
* @param {number} s Saturation
* @param {number} l Luminance
* @return {{r: number, g: number, b: number}}
*/
hslToRgb = function(h, s, l){
    function _v(m1, m2, hue){
        hue = hue;
        if (hue < 0){hue+=1;}
        if (hue > 1){hue-=1;}
        if (hue < (1/6)){
            return m1 + (m2-m1)*hue*6;
        }
        if (hue < 0.5){
            return m2;
        }
        if (hue < (2/3)){
            return m1 + (m2-m1)*((2/3)-hue)*6;
        }
        return m1;
    }
    var m2;
    var fraction_l = (l/100);
    var fraction_s = (s/100);
    if (s === 0){
        var gray = fraction_l*255;
        return {'r': gray, 'g': gray, 'b': gray};
    }
    if (l <= 50){
        m2 = fraction_l * (1+fraction_s);
    }
    else{
        m2 = fraction_l+fraction_s-(fraction_l*fraction_s);
    }
    var m1 = 2*fraction_l - m2;
    h = h / 360;
    return {'r': Math.round(_v(m1, m2, h+(1/3))*255), 'g': Math.round(_v(m1, m2, h)*255), 'b': Math.round(_v(m1, m2, h-(1/3))*255)};
};
/**
 * @param  {number} r Red
 * @param  {number} g Green
 * @param  {number} b Blue
 * @return {{h: number, s: number, l: number}}
 */
rgbToHsl = function(r, g, b){
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var maxc = Math.max(r, g, b);
    var minc = Math.min(r, g, b);
    var l = Math.round(((minc+maxc)/2)*100);
    if (l > 100) {l = 100;}
    if (l < 0) {l = 0;}
    var h, s;
    if (minc === maxc){
        return {'h': 0, 's': 0, 'l': l};
    }
    if (l <= 50){
        s = (maxc-minc) / (maxc+minc);
    }
    else{
        s = (maxc-minc) / (2-maxc-minc);
    }
    var rc = (maxc-r) / (maxc-minc);
    var gc = (maxc-g) / (maxc-minc);
    var bc = (maxc-b) / (maxc-minc);
    if (r === maxc){
        h = bc-gc;
    }
    else if (g === maxc){
        h = 2+rc-bc;
    }
    else{
        h = 4+gc-rc;
    }
    h = (h/6) % 1;
    if (h < 0){h+=1;}
    h = Math.round(h*360);
    s = Math.round(s*100);
    if (h > 360) {h = 360;}
    if (h < 0) {h = 0;}
    if (s > 100) {s = 100;}
    if (s < 0) {s = 0;}
    return {'h': h, 's': s, 'l': l};
};
// Clamp x and y values to min and max
function clamp(x, min, max){
    if (x < min){x = min;}
    else if (x > max){x = max;}
    return x;
}
/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColourError} If illegal color value is passed.
 */
parseColor = function(color){
    var red, green, blue, hue, sat, lum;
    var alpha = 1;
    var match;
    var error = false;
    var pref = color.substr(0,3); // Three letter color prefix
    // HSL(a)
    if (pref === 'hsl'){
        var hsl_regex = /hsla?\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = hsl_regex.exec(color);
        if (match){
            hue = parseInt(match[1], 10);
            sat = parseInt(match[2], 10);
            lum = parseInt(match[3], 10);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
            hue = Math.abs(hue % 360);
            sat = clamp(sat, 0, 100);
            lum = clamp(lum, 0, 100);
            var parsed = hslToRgb(hue, sat, lum);
            red = parsed.r;
            green = parsed.g;
            blue = parsed.b;
        } else {
            error = true;
        }
    // RGB(a)
    } else if (pref === 'rgb'){
        var rgb_regex = /rgba?\((-?\d+%?)\s*,\s*(-?\d+%?)\s*,\s*(-?\d+%?)(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = rgb_regex.exec(color);
        if (match){
            var m1 = match[1];
            var m2 = match[2];
            var m3 = match[3];
            red = parseInt(match[1], 10);
            green = parseInt(match[2], 10);
            blue = parseInt(match[3], 10);
            // Check if using rgb(a) percentage values.
            if (m1[m1.length-1] === '%' ||
                m2[m2.length-1] === '%' ||
                m3[m3.length-1] === '%'){
                // All values must be percetage.
                if (m1[m1.length-1] === '%' &&
                    m2[m2.length-1] === '%' &&
                    m3[m3.length-1] === '%'){
                    // Convert to 255
                    red = Math.floor(red/100 * 255);
                    green = Math.floor(green/100 * 255);
                    blue = Math.floor(blue/100 * 255);
                } else {
                   error = true; 
                }
            }
            red = clamp(red, 0, 255);
            green = clamp(green, 0, 255);
            blue = clamp(blue, 0, 255);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
        } else {
            error = true;
        }
    // HEX
    } else if (color[0] === '#'){
        var hex = color.substr(1);
        if (hex.length === 3){
            red = parseInt(hex[0]+hex[0], 16);
            green = parseInt(hex[1]+hex[1], 16);
            blue = parseInt(hex[2]+hex[2], 16);
        } else if (hex.length === 6){
            red = parseInt(hex[0]+hex[1], 16);
            green = parseInt(hex[2]+hex[3], 16);
            blue = parseInt(hex[4]+hex[5], 16);
        } else {
            error = true;
        }
    } else {
        error = true;
    }

    alpha = clamp(alpha, 0, 1);

    if (error){
        throw "ColourError: Something went wrong. Perhaps " + color + " is not a legal CSS color value";
    }
    return {'r': red, 'g': green, 'b': blue, 'a': alpha};
};
// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
cache = {
    "black": {"r": 0, "g": 0, "b": 0, "h": 0, "s": 0, "l": 0},
    "silver": {"r": 192, "g": 192, "b": 192, "h": 0, "s": 0, "l": 75},
    "gray": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "white": {"r": 255, "g": 255, "b": 255, "h": 0, "s": 0, "l": 100},
    "maroon": {"r": 128, "g": 0, "b": 0, "h": 0, "s": 100, "l": 25},
    "red": {"r": 255, "g": 0, "b": 0, "h": 0, "s": 100, "l": 50},
    "purple": {"r": 128, "g": 0, "b": 128, "h": 300, "s": 100, "l": 25},
    "fuchsia": {"r": 255, "g": 0, "b": 255, "h": 300, "s": 100, "l": 50},
    "green": {"r": 0, "g": 128, "b": 0, "h": 120, "s": 100, "l": 25},
    "lime": {"r": 0, "g": 255, "b": 0, "h": 120, "s": 100, "l": 50},
    "olive": {"r": 128, "g": 128, "b": 0, "h": 60, "s": 100, "l": 25},
    "yellow": {"r": 255, "g": 255, "b": 0, "h": 60, "s": 100, "l": 50},
    "navy": {"r": 0, "g": 0, "b": 128, "h": 240, "s": 100, "l": 25},
    "blue": {"r": 0, "g": 0, "b": 255, "h": 240, "s": 100, "l": 50},
    "teal": {"r": 0, "g": 128, "b": 128, "h": 180, "s": 100, "l": 25},
    "aqua": {"r": 0, "g": 255, "b": 255, "h": 180, "s": 100, "l": 50},
    "orange": {"r": 255, "g": 165, "b": 0, "h": 39, "s": 100, "l": 50},
    "aliceblue": {"r": 240, "g": 248, "b": 255, "h": 208, "s": 100, "l": 97},
    "antiquewhite": {"r": 250, "g": 235, "b": 215, "h": 34, "s": 78, "l": 91},
    "aquamarine": {"r": 127, "g": 255, "b": 212, "h": 160, "s": 100, "l": 75},
    "azure": {"r": 240, "g": 255, "b": 255, "h": 180, "s": 100, "l": 97},
    "beige": {"r": 245, "g": 245, "b": 220, "h": 60, "s": 56, "l": 91},
    "bisque": {"r": 255, "g": 228, "b": 196, "h": 33, "s": 100, "l": 88},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205, "h": 36, "s": 100, "l": 90},
    "blueviolet": {"r": 138, "g": 43, "b": 226, "h": 271, "s": 76, "l": 53},
    "brown": {"r": 165, "g": 42, "b": 42, "h": 0, "s": 59, "l": 41},
    "burlywood": {"r": 222, "g": 184, "b": 135, "h": 34, "s": 57, "l": 70},
    "cadetblue": {"r": 95, "g": 158, "b": 160, "h": 182, "s": 25, "l": 50},
    "chartreuse": {"r": 127, "g": 255, "b": 0, "h": 90, "s": 100, "l": 50},
    "chocolate": {"r": 210, "g": 105, "b": 30, "h": 25, "s": 75, "l": 47},
    "coral": {"r": 255, "g": 127, "b": 80, "h": 16, "s": 100, "l": 66},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237, "h": 219, "s": 79, "l": 66},
    "cornsilk": {"r": 255, "g": 248, "b": 220, "h": 48, "s": 100, "l": 93},
    "cyan": {"r": 0,"g": 255,"b": 255, "h": 180,"s": 100,"l": 97},
    "crimson": {"r": 220, "g": 20, "b": 60, "h": 348, "s": 83, "l": 47},
    "darkblue": {"r": 0, "g": 0, "b": 139, "h": 240, "s": 100, "l": 27},
    "darkcyan": {"r": 0, "g": 139, "b": 139, "h": 180, "s": 100, "l": 27},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11, "h": 43, "s": 89, "l": 38},
    "darkgray": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkgreen": {"r": 0, "g": 100, "b": 0, "h": 120, "s": 100, "l": 20},
    "darkgrey": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkkhaki": {"r": 189, "g": 183, "b": 107, "h": 56, "s": 38, "l": 58},
    "darkmagenta": {"r": 139, "g": 0, "b": 139, "h": 300, "s": 100, "l": 27},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47, "h": 82, "s": 39, "l": 30},
    "darkorange": {"r": 255, "g": 140, "b": 0, "h": 33, "s": 100, "l": 50},
    "darkorchid": {"r": 153, "g": 50, "b": 204, "h": 280, "s": 61, "l": 50},
    "darkred": {"r": 139, "g": 0, "b": 0, "h": 0, "s": 100, "l": 27},
    "darksalmon": {"r": 233, "g": 150, "b": 122, "h": 15, "s": 72, "l": 70},
    "darkseagreen": {"r": 143, "g": 188, "b": 143, "h": 120, "s": 25, "l": 65},
    "darkslateblue": {"r": 72, "g": 61, "b": 139, "h": 248, "s": 39, "l": 39},
    "darkslategray": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkslategrey": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkturquoise": {"r": 0, "g": 206, "b": 209, "h": 181, "s": 100, "l": 41},
    "darkviolet": {"r": 148, "g": 0, "b": 211, "h": 282, "s": 100, "l": 41},
    "deeppink": {"r": 255, "g": 20, "b": 147, "h": 328, "s": 100, "l": 54},
    "deepskyblue": {"r": 0, "g": 191, "b": 255, "h": 195, "s": 100, "l": 50},
    "dimgray": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dimgrey": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dodgerblue": {"r": 30, "g": 144, "b": 255, "h": 210, "s": 100, "l": 56},
    "firebrick": {"r": 178, "g": 34, "b": 34, "h": 0, "s": 68, "l": 42},
    "floralwhite": {"r": 255, "g": 250, "b": 240, "h": 40, "s": 100, "l": 97},
    "forestgreen": {"r": 34, "g": 139, "b": 34, "h": 120, "s": 61, "l": 34},
    "gainsboro": {"r": 220, "g": 220, "b": 220, "h": 0, "s": 0, "l": 86},
    "ghostwhite": {"r": 248, "g": 248, "b": 255, "h": 240, "s": 100, "l": 99},
    "gold": {"r": 255, "g": 215, "b": 0, "h": 51, "s": 100, "l": 50},
    "goldenrod": {"r": 218, "g": 165, "b": 32, "h": 43, "s": 74, "l": 49},
    "greenyellow": {"r": 173, "g": 255, "b": 47, "h": 84, "s": 100, "l": 59},
    "grey": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "honeydew": {"r": 240, "g": 255, "b": 240, "h": 120, "s": 100, "l": 97},
    "hotpink": {"r": 255, "g": 105, "b": 180, "h": 330, "s": 100, "l": 71},
    "indianred": {"r": 205, "g": 92, "b": 92, "h": 0, "s": 53, "l": 58},
    "indigo": {"r": 75, "g": 0, "b": 130, "h": 275, "s": 100, "l": 25},
    "ivory": {"r": 255, "g": 255, "b": 240, "h": 60, "s": 100, "l": 97},
    "khaki": {"r": 240, "g": 230, "b": 140, "h": 54, "s": 77, "l": 75},
    "lavender": {"r": 230, "g": 230, "b": 250, "h": 240, "s": 67, "l": 94},
    "lavenderblush": {"r": 255, "g": 240, "b": 245, "h": 340, "s": 100, "l": 97},
    "lawngreen": {"r": 124, "g": 252, "b": 0, "h": 90, "s": 100, "l": 49},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205, "h": 54, "s": 100, "l": 90},
    "lightblue": {"r": 173, "g": 216, "b": 230, "h": 195, "s": 53, "l": 79},
    "lightcoral": {"r": 240, "g": 128, "b": 128, "h": 0, "s": 79, "l": 72},
    "lightcyan": {"r": 224, "g": 255, "b": 255, "h": 180, "s": 100, "l": 94},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210, "h": 60, "s": 80, "l": 90},
    "lightgray": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightgreen": {"r": 144, "g": 238, "b": 144, "h": 120, "s": 73, "l": 75},
    "lightgrey": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightpink": {"r": 255, "g": 182, "b": 193, "h": 351, "s": 100, "l": 86},
    "lightsalmon": {"r": 255, "g": 160, "b": 122, "h": 17, "s": 100, "l": 74},
    "lightseagreen": {"r": 32, "g": 178, "b": 170, "h": 177, "s": 70, "l": 41},
    "lightskyblue": {"r": 135, "g": 206, "b": 250, "h": 203, "s": 92, "l": 75},
    "lightslategray": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightslategrey": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222, "h": 214, "s": 41, "l": 78},
    "lightyellow": {"r": 255, "g": 255, "b": 224, "h": 60, "s": 100, "l": 94},
    "limegreen": {"r": 50, "g": 205, "b": 50, "h": 120, "s": 61, "l": 50},
    "linen": {"r": 250, "g": 240, "b": 230, "h": 30, "s": 67, "l": 94},
    "magenta": {"r": 255,"g": 0,"b": 255, "h": 17,"s": 100,"l": 74},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170, "h": 160, "s": 51, "l": 60},
    "mediumblue": {"r": 0, "g": 0, "b": 205, "h": 240, "s": 100, "l": 40},
    "mediumorchid": {"r": 186, "g": 85, "b": 211, "h": 288, "s": 59, "l": 58},
    "mediumpurple": {"r": 147, "g": 112, "b": 219, "h": 260, "s": 60, "l": 65},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113, "h": 147, "s": 50, "l": 47},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238, "h": 249, "s": 80, "l": 67},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154, "h": 157, "s": 100, "l": 49},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204, "h": 178, "s": 60, "l": 55},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133, "h": 322, "s": 81, "l": 43},
    "midnightblue": {"r": 25, "g": 25, "b": 112, "h": 240, "s": 64, "l": 27},
    "mintcream": {"r": 245, "g": 255, "b": 250, "h": 150, "s": 100, "l": 98},
    "mistyrose": {"r": 255, "g": 228, "b": 225, "h": 6, "s": 100, "l": 94},
    "moccasin": {"r": 255, "g": 228, "b": 181, "h": 38, "s": 100, "l": 85},
    "navajowhite": {"r": 255, "g": 222, "b": 173, "h": 36, "s": 100, "l": 84},
    "oldlace": {"r": 253, "g": 245, "b": 230, "h": 39, "s": 85, "l": 95},
    "olivedrab": {"r": 107, "g": 142, "b": 35, "h": 80, "s": 60, "l": 35},
    "orangered": {"r": 255, "g": 69, "b": 0, "h": 16, "s": 100, "l": 50},
    "orchid": {"r": 218, "g": 112, "b": 214, "h": 302, "s": 59, "l": 65},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170, "h": 55, "s": 67, "l": 80},
    "palegreen": {"r": 152, "g": 251, "b": 152, "h": 120, "s": 93, "l": 79},
    "paleturquoise": {"r": 175, "g": 238, "b": 238, "h": 180, "s": 65, "l": 81},
    "palevioletred": {"r": 219, "g": 112, "b": 147, "h": 340, "s": 60, "l": 65},
    "papayawhip": {"r": 255, "g": 239, "b": 213, "h": 37, "s": 100, "l": 92},
    "peachpuff": {"r": 255, "g": 218, "b": 185, "h": 28, "s": 100, "l": 86},
    "peru": {"r": 205, "g": 133, "b": 63, "h": 30, "s": 59, "l": 53},
    "pink": {"r": 255, "g": 192, "b": 203, "h": 350, "s": 100, "l": 88},
    "plum": {"r": 221, "g": 160, "b": 221, "h": 300, "s": 47, "l": 75},
    "powderblue": {"r": 176, "g": 224, "b": 230, "h": 187, "s": 52, "l": 80},
    "rosybrown": {"r": 188, "g": 143, "b": 143, "h": 0, "s": 25, "l": 65},
    "royalblue": {"r": 65, "g": 105, "b": 225, "h": 225, "s": 73, "l": 57},
    "saddlebrown": {"r": 139, "g": 69, "b": 19, "h": 25, "s": 76, "l": 31},
    "salmon": {"r": 250, "g": 128, "b": 114, "h": 6, "s": 93, "l": 71},
    "sandybrown": {"r": 244, "g": 164, "b": 96, "h": 28, "s": 87, "l": 67},
    "seagreen": {"r": 46, "g": 139, "b": 87, "h": 146, "s": 50, "l": 36},
    "seashell": {"r": 255, "g": 245, "b": 238, "h": 25, "s": 100, "l": 97},
    "sienna": {"r": 160, "g": 82, "b": 45, "h": 19, "s": 56, "l": 40},
    "skyblue": {"r": 135, "g": 206, "b": 235, "h": 197, "s": 71, "l": 73},
    "slateblue": {"r": 106, "g": 90, "b": 205, "h": 248, "s": 53, "l": 58},
    "slategray": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "slategrey": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "snow": {"r": 255, "g": 250, "b": 250, "h": 0, "s": 100, "l": 99},
    "springgreen": {"r": 0, "g": 255, "b": 127, "h": 150, "s": 100, "l": 50},
    "steelblue": {"r": 70, "g": 130, "b": 180, "h": 207, "s": 44, "l": 49},
    "tan": {"r": 210, "g": 180, "b": 140, "h": 34, "s": 44, "l": 69},
    "thistle": {"r": 216, "g": 191, "b": 216, "h": 300, "s": 24, "l": 80},
    "tomato": {"r": 255, "g": 99, "b": 71, "h": 9, "s": 100, "l": 64},
    "turquoise": {"r": 64, "g": 224, "b": 208, "h": 174, "s": 72, "l": 56},
    "violet": {"r": 238, "g": 130, "b": 238, "h": 300, "s": 76, "l": 72},
    "wheat": {"r": 245, "g": 222, "b": 179, "h": 39, "s": 77, "l": 83},
    "whitesmoke": {"r": 245, "g": 245, "b": 245, "h": 0, "s": 0, "l": 96},
    "yellowgreen": {"r": 154, "g": 205, "b": 50, "h": 80, "s": 61, "l": 50}
};

module.exports = Colour;

},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
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
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
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
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":4}],3:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"1YiZ5S":6,"inherits":5}],5:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],7:[function(_dereq_,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.linearalgea=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @license
 * Copyright (c) 2014 Eben Packwood. All rights reserved.
 * MIT License
 *
 */

var Vector = _dereq_('./vector.js');
var Matrix = _dereq_('./matrix.js');

var math = Object.create(null);

math.Vector = Vector;
math.Matrix = Matrix;

module.exports = math;

},{"./matrix.js":2,"./vector.js":3}],2:[function(_dereq_,module,exports){
/** 
 * 4x4 matrix.
 * @constructor
 */
function Matrix(){
    for (var i=0; i<16; i++){
        this[i] = 0;
    }
    this.length = 16;
}
/**
 * Compare matrix with self for equality.
 * @method
 * @param {Matrix} matrix
 * @return {boolean}
 */
Matrix.prototype.equal = function(matrix){
    for (var i = 0, len = this.length; i < len; i++){
        if (this[i] !== matrix[i]){
            return false;
        }
    }
    return true;
};
/**
 * Add matrix to self.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.add = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] + matrix[i];
    }
    return new_matrix;
};
/**
 * Subtract matrix from self.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.subtract = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] - matrix[i];
    }
    return new_matrix;
};
/**
 * Multiply self by scalar.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalar = function(scalar){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] * scalar;
    }
    return new_matrix;
};
/**
 * Multiply self by matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.multiply = function(matrix){
    var new_matrix = new Matrix();
    new_matrix[0] = (this[0] * matrix[0]) + (this[1] * matrix[4]) + (this[2] * matrix[8]) + (this[3] * matrix[12]);
    new_matrix[1] = (this[0] * matrix[1]) + (this[1] * matrix[5]) + (this[2] * matrix[9]) + (this[3] * matrix[13]);
    new_matrix[2] = (this[0] * matrix[2]) + (this[1] * matrix[6]) + (this[2] * matrix[10]) + (this[3] * matrix[14]);
    new_matrix[3] = (this[0] * matrix[3]) + (this[1] * matrix[7]) + (this[2] * matrix[11]) + (this[3] * matrix[15]);
    new_matrix[4] = (this[4] * matrix[0]) + (this[5] * matrix[4]) + (this[6] * matrix[8]) + (this[7] * matrix[12]);
    new_matrix[5] = (this[4] * matrix[1]) + (this[5] * matrix[5]) + (this[6] * matrix[9]) + (this[7] * matrix[13]);
    new_matrix[6] = (this[4] * matrix[2]) + (this[5] * matrix[6]) + (this[6] * matrix[10]) + (this[7] * matrix[14]);
    new_matrix[7] = (this[4] * matrix[3]) + (this[5] * matrix[7]) + (this[6] * matrix[11]) + (this[7] * matrix[15]);
    new_matrix[8] = (this[8] * matrix[0]) + (this[9] * matrix[4]) + (this[10] * matrix[8]) + (this[11] * matrix[12]);
    new_matrix[9] = (this[8] * matrix[1]) + (this[9] * matrix[5]) + (this[10] * matrix[9]) + (this[11] * matrix[13]);
    new_matrix[10] = (this[8] * matrix[2]) + (this[9] * matrix[6]) + (this[10] * matrix[10]) + (this[11] * matrix[14]);
    new_matrix[11] = (this[8] * matrix[3]) + (this[9] * matrix[7]) + (this[10] * matrix[11]) + (this[11] * matrix[15]);
    new_matrix[12] = (this[12] * matrix[0]) + (this[13] * matrix[4]) + (this[14] * matrix[8]) + (this[15] * matrix[12]);
    new_matrix[13] = (this[12] * matrix[1]) + (this[13] * matrix[5]) + (this[14] * matrix[9]) + (this[15] * matrix[13]);
    new_matrix[14] = (this[12] * matrix[2]) + (this[13] * matrix[6]) + (this[14] * matrix[10]) + (this[15] * matrix[14]);
    new_matrix[15] = (this[12] * matrix[3]) + (this[13] * matrix[7]) + (this[14] * matrix[11]) + (this[15] * matrix[15]);
    return new_matrix;
};
/**
 * Negate self.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.negate = function(){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = -this[i];
    }
    return new_matrix;
};
/**
 * Transpose self.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.transpose = function(){
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
 * Constructs a rotation matrix, rotating by theta around the x-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationX = function(theta){
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
 * Constructs a rotation matrix, rotating by theta around the y-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationY = function(theta){
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
 * Constructs a rotation matrix, rotating by theta around the z-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationZ = function(theta){
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
 * Constructs a rotation matrix, rotating by theta around the axis
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationAxis = function(axis, theta){
    var rotation_matrix = new Matrix();
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    rotation_matrix[0] = cos + ((ux*ux)*cos1);
    rotation_matrix[1] = (xy*cos1) - (uz*sin);
    rotation_matrix[2] = (xz*cos1)+(uy*sin);
    rotation_matrix[4] = (xy*cos1)+(uz*sin);
    rotation_matrix[5] = cos+((uy*uy)*cos1);
    rotation_matrix[6] = (yz*cos1)-(ux*sin);
    rotation_matrix[8] = (xz*cos1)-(uy*sin);
    rotation_matrix[9] = (yz*cos1)+(ux*sin);
    rotation_matrix[10] = cos + ((uz*uz)*cos1);
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Matrix}
 */
Matrix.rotation = function(pitch, yaw, roll){
    return Matrix.rotationX(roll).multiply(Matrix.rotationZ(yaw)).multiply(Matrix.rotationY(pitch));
};
/**
 * Constructs a translation matrix from x, y, and z distances
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.translation = function(xtrans, ytrans, ztrans){
    var translation_matrix = Matrix.identity();
    translation_matrix[12] = xtrans;
    translation_matrix[13] = ytrans;
    translation_matrix[14] = ztrans;
    return translation_matrix;
};
/**
 * Constructs a scaling matrix from x, y, and z scale
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.scale = function(xscale, yscale, zscale){
    var scaling_matrix = new Matrix();
    scaling_matrix[0] = xscale;
    scaling_matrix[5] = yscale;
    scaling_matrix[10] = zscale;
    scaling_matrix[15] = 1;
    return scaling_matrix;
};
/**
 * Constructs an identity matrix
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.identity = function(){
    var identity = new Matrix();
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    return identity;
};
/**
 * Constructs a zero matrix
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.zero = function(){
    return new Matrix();
};
/**
 * Constructs a new matrix from an array
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.fromArray = function(arr){
    var new_matrix = new Matrix();
    for (var i = 0; i < 16; i++){
        new_matrix[i] = arr[i];
    }
    return new_matrix;
};

module.exports = Matrix;
},{}],3:[function(_dereq_,module,exports){
/**
 * 3D vector.
 * @constructor
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {number} z z coordinate
 */
function Vector(x, y, z){
    if (typeof x === 'undefined' ||
        typeof y === 'undefined' ||
        typeof z === 'undefined'){
        throw new Error('Insufficient arguments.');
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
/**
 * Add vector to self.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.add = function(vector){
    return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
};
/**
 * Subtract vector from self.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.subtract = function(vector){
    return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
};
/**
 * Compare vector with self for equality
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Vector.prototype.equal = function(vector){
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
};
/**
 * Find angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return Math.acos(theta);
};
/**
 * Find the cos of the angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return theta;
};
/**
 * Find magnitude of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitude = function(){
    return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};
/**
 * Find magnitude squared of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitudeSquared = function(){
    return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
};
/**
 * Find dot product of self and vector.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.dot = function(vector){
    return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
};
/**
 * Find cross product of self and vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.cross = function(vector){
    return new Vector(
        (this.y * vector.z) - (this.z * vector.y),
        (this.z * vector.x) - (this.x * vector.z),
        (this.x * vector.y) - (this.y * vector.x)
    );
};
/**
 * Normalize self.
 * @method
 * @return {Vector}
 * @throws {ZeroDivisionError}
 */
Vector.prototype.normalize = function(){
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        return this;
    }
    return new Vector(this.x / magnitude, this.y / magnitude, this.z / magnitude);
};
/**
 * Scale self by scale.
 * @method
 * @param {number} scale
 * @return {Vector}
 */
Vector.prototype.scale = function(scale){
    return new Vector(this.x * scale, this.y * scale, this.z * scale);
};
/**
 * Negates self
 * @return {Vector} [description]
 */
Vector.prototype.negate = function(){
    return new Vector(-this.x, -this.y, -this.z);
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.vectorProjection = function(vector){
    var mag = vector.magnitude();
    return vector.scale(this.dot(vector) / (mag * mag));
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.scalarProjection = function(vector){
    return this.dot(vector) / vector.magnitude();
};
/**
 * Perform linear tranformation on self.
 * @method
 * @param {Matrix} transform_matrix
 * @return {Vector}
 */
Vector.prototype.transform = function(transform_matrix){
    var x = (this.x * transform_matrix[0]) + (this.y * transform_matrix[4]) + (this.z * transform_matrix[8]) + transform_matrix[12];
    var y = (this.x * transform_matrix[1]) + (this.y * transform_matrix[5]) + (this.z * transform_matrix[9]) + transform_matrix[13];
    var z = (this.x * transform_matrix[2]) + (this.y * transform_matrix[6]) + (this.z * transform_matrix[10]) + transform_matrix[14];
    var w = (this.x * transform_matrix[3]) + (this.y * transform_matrix[7]) + (this.z * transform_matrix[11]) + transform_matrix[15];
    return new Vector(x / w, y / w, z / w);
};
/**
 * Rotate self by theta around axis
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotate = function(axis, theta){
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = u.x * u.y;
    var xz = u.x * u.z;
    var yz = u.y * u.z;
    var x = ((cos + ((ux*ux)*cos1)) * this.x) + (((xy*cos1) - (uz*sin)) * this.y) + (((xz*cos1)+(uy*sin)) * this.z);
    var y = (((xy*cos1)+(uz*sin)) * this.x) + ((cos+((uy*uy)*cos1)) * this.y) + (((yz*cos1)-(ux*sin)) * this.z);
    var z = (((xz*cos1)-(uy*sin)) * this.x) + (((yz*cos1)+(ux*sin)) * this.y) + ((cos + ((ux*ux)*cos1)) * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate self by theta around x-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateX = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate self by theta around y-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateY = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos *this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate self by theta around z-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateZ = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    return new Vector(x, y, z);
};
/**
 * Rotate self by pitch, yaw, roll
 * @method
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRoll = function(pitch_amnt, yaw_amnt, roll_amnt) {
    return this.rotateX(roll_amnt).rotateY(pitch_amnt).rotateZ(yaw_amnt);
};

module.exports = Vector;
},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
var math = _dereq_('linearalgea');
var Vector = math.Vector;
var Matrix = math.Matrix;

var TWOPI = Math.PI*2;

/** 
 * @constructor
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
function Camera(width, height, position){
    this.position = position || new Vector(1,1,20);
    this.up = new Vector(0, 1, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.view_matrix = this.createViewMatrix();
    this.width = width;
    this.height = height;
    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;
    this.perspectiveFov = this.calculatePerspectiveFov();
}
/** @method */
Camera.prototype.direction = function() {
    var sin_pitch = Math.sin(this.rotation.pitch);
    var cos_pitch = Math.cos(this.rotation.pitch);
    var sin_yaw = Math.sin(this.rotation.yaw);
    var cos_yaw = Math.cos(this.rotation.yaw);

    return new Vector(-cos_pitch * sin_yaw, sin_pitch, -cos_pitch * cos_yaw);
};
/**
 * Builds a perspective projection matrix based on a field of view.
 * @method
 * @return {Matrix}
 */
Camera.prototype.calculatePerspectiveFov = function() {
    var fov = this.fov * (Math.PI / 180); // convert to radians
    var aspect = this.width / this.height;
    var near = this.near;
    var far = this.far;
    var matrix = Matrix.zero();
    var height = (1/Math.tan(fov/2)) * this.height;
    var width = height * aspect;

    matrix[0] = width;
    matrix[5] = height;
    matrix[10] = far/(near-far) ;
    matrix[11] = -1;
    matrix[14] = near*far/(near-far);

    return matrix;
};
/** @method */
Camera.prototype.createViewMatrix = function(){
    var eye = this.position;
    var pitch = this.rotation.pitch;
    var yaw = this.rotation.yaw;
    var cos_pitch = Math.cos(pitch);
    var sin_pitch = Math.sin(pitch);
    var cos_yaw = Math.cos(yaw);
    var sin_yaw = Math.sin(yaw);

    var xaxis = new Vector(cos_yaw, 0, -sin_yaw );
    var yaxis = new Vector(sin_yaw * sin_pitch, cos_pitch, cos_yaw * sin_pitch );
    var zaxis = new Vector(sin_yaw * cos_pitch, -sin_pitch, cos_pitch * cos_yaw );

    var view_matrix = Matrix.fromArray([
        xaxis.x, yaxis.x, zaxis.x, 0,
        xaxis.y, yaxis.y, zaxis.y, 0,
        xaxis.z, yaxis.z, zaxis.z, 0,
        -(xaxis.dot(eye) ), -( yaxis.dot(eye) ), -( zaxis.dot(eye) ), 1
    ]);
    return view_matrix;
};
/** @method */
Camera.prototype.moveTo = function(x, y, z){
    this.position = new Vector(x,y,z);
    this.view_matrix = this.createViewMatrix();
};
/**
 * Move camera position by the x, y, and z amounts passed.
 * @method
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
Camera.prototype.move = function(x, y, z){
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
    this.view_matrix = this.createViewMatrix();
};

/** @method */
Camera.prototype.moveRight = function(amount){
    var right = this.up.cross(this.direction()).normalize().scale(amount);
    this.position = this.position.subtract(right);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    var left = this.up.cross(this.direction()).normalize().scale(amount);
    this.position = this.position.add(left);
    this.view_matrix = this.createViewMatrix();
};
/**
 * Move camera rotation by the x and y amounts passed.
 * @method
 * @param {number} x
 * @param {number} y
 */
Camera.prototype.look = function(x, y){
    this.rotation.yaw -= x;
    if (this.rotation.yaw < 0){
        this.rotation.yaw = this.rotation.yaw + (TWOPI);
    }
    else if (this.rotation.yaw > (TWOPI)){
        this.rotation.yaw = this.rotation.yaw - (TWOPI);
    }
    this.rotation.pitch -= y;
    if (this.rotation.pitch < 0){
        this.rotation.pitch = this.rotation.pitch + (TWOPI);
    }
    else if (this.rotation.pitch > (TWOPI)){
        this.rotation.pitch = this.rotation.pitch - (TWOPI);
    }
    this.view_matrix = this.createViewMatrix();
};

Camera.prototype.turnRight = function(amount){
    this.rotation.yaw -= amount;
    if (this.rotation.yaw < 0){
        this.rotation.yaw = this.rotation.yaw + (TWOPI);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.turnLeft = function(amount){
    this.rotation.yaw += amount;
    if (this.rotation.yaw > (TWOPI)){
        this.rotation.yaw = this.rotation.yaw - (TWOPI);
    }
    this.view_matrix = this.createViewMatrix();
};
Camera.prototype.lookUp = function(amount){
    this.rotation.pitch -= amount;
    if (this.rotation.pitch > (TWOPI)){
        this.rotation.pitch = this.rotation.pitch - (TWOPI);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.lookDown = function(amount){
    this.rotation.pitch += amount;
    if (this.rotation.pitch < 0){
        this.rotation.pitch = this.rotation.pitch + (TWOPI);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveUp = function(amount){
    var up = this.up.normalize().scale(amount);
    this.position = this.position.subtract(up);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveDown = function(amount){
    var up = this.up.normalize().scale(amount);
    this.position = this.position.add(up);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveForward = function(amount){
    var forward = this.direction().scale(amount);
    this.position = this.position.add(forward);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveBackward = function(amount){
    var backward = this.direction().scale(amount);
    this.position = this.position.subtract(backward);
    this.view_matrix = this.createViewMatrix();
};

module.exports = Camera;

},{"linearalgea":7}],9:[function(_dereq_,module,exports){
/**
 * Event handler.
 * @mixin
 */
var EventTarget = {
    _listeners: {},
    /**
     * @method
     * @param {string} type Type of event to be added.
     * @param {function} listener Function to be called when event is fired.
     */
    addListener: function(type, listener){
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    },
    /**
     * @method
     * @param  {string} type Type of event to be fired.
     * @param  {Object} [event] Optional user-defined event object. This could contain, for example, mouse coordinates, or key codes.
     */
    fire: function(type, event){
        var e = {};
        if (typeof event !== 'undefined'){
            e = event;
        }
        e.event = type;
        e.target = this;
        var listeners = this._listeners[type];
        if (typeof listeners !== 'undefined'){
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(this, e);
            }
        }
    },
    /**
     * @method
     * @param  {string} type
     * @param  {function} listener
     */
    removeListener: function(type, listener){
        var listeners = this._listeners[type];
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
            }
        }
    }
};

module.exports = EventTarget;

},{}],10:[function(_dereq_,module,exports){
var math = _dereq_('linearalgea');
var Camera = _dereq_('./camera.js');
var EventTarget = _dereq_('./events.js');
var mixin = _dereq_('../utilities/mixin.js');
var KEYCODES = _dereq_('../utilities/keycodes.js');

var Vector = math.Vector;
var Matrix = math.Matrix;

/**
 * @constructor
 * @param {{canvas_id: string, width: number, height: number}} options
 */
function Scene(options){
    /** @type {number} */
    this.width = options.width;
    /** @type {number} */
    this.height = options.height;
    /** @type {HTMLElement} */
    this.canvas = document.getElementById(options.canvas_id);
    /** @type {CanvasContext} */
    this.ctx = this.canvas.getContext('2d');
    /** @type {Camera} */
    this.camera = new Camera(this.width, this.height);
    /** @type {Vector} */
    this.illumination = new Vector(90,0,0);
    /** @type {Object.<string, Mesh>} */
    this.meshes = {};
    this._x_offset = Math.round(this.width / 2);
    this._y_offset = Math.round(this.height / 2);
    this._back_buffer = document.createElement('canvas');
    this._back_buffer.width = this.width;
    this._back_buffer.height = this.height;
    this._back_buffer_ctx = this._back_buffer.getContext('2d');
    this._back_buffer_image = null;
    this._depth_buffer = [];
    this._backface_culling = true;
    this._keys = {}; // Keys currently pressed
    this._key_count = 0; // Number of keys being pressed... this feels kludgy
    this._anim_id = null;
    this._needs_update = true;
    this._draw_mode = 0;
    this.canvas.tabIndex = 1; // Set tab index to allow canvas to have focus to receive key events
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.canvas.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.canvas.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.canvas.addEventListener('blur', this.emptyKeys.bind(this), false);
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.initializeDepthBuffer();
    this.update();
}
mixin(Scene.prototype, EventTarget);
/**
 * Dump all pressed keys on blur.
 * @method
 */
Scene.prototype.emptyKeys = function(){
    this._key_count = 0;
    this._keys = {};
};
/** 
 * Check if key is pressed.
 * @method
 * @param {string} key Key to check. E.g. 'a', 'space', 'tab'.
 */
Scene.prototype.isKeyDown = function(key){
    var pressed = KEYCODES[key];
    return (pressed in this._keys && this._keys[pressed]);
};
/** 
 * Register key presses.
 * @method
 * @param {KeyEvent} e
 */
Scene.prototype.onKeyDown = function(e){
    // If there are one or more keys depressed, the keydown event will fire in the update
    // loop. This prevents a keydown delay that noramlly occurs.
    var pressed = e.keyCode || e.which;
    if (!this.isKeyDown(pressed)){
        this._key_count += 1;
        this._keys[pressed] = true;
    }
};
/** 
 * Unregister key presses on keyup.
 * @method
 * @param {KeyEvent} e
 */
Scene.prototype.onKeyUp = function(e){
    var pressed = e.keyCode || e.which;
    if (pressed in this._keys){
        this._key_count -= 1;
        this._keys[pressed] = false;
    }
};
Scene.prototype._getMousePos = function(e){
    var rect = this.canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
};
/** 
 * Register mousedown event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseDown = function(e){
    // Last mouse position. Used for calculating delta x and y for mousedrag.
    // Initially set to undefined. Also keep track of time of time of last
    // update, so that mouse speed calculation is not dependent on steady
    // frame rate.
    this._last_mouse_coords = void(0);
    this._last_mouse_update = void(0);
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mousedown', mouseCoord);
    // Setup mousedrag
    var mousedrag = this.onMouseDrag.bind(this);
    var mouseup = function(){
        // Unregister events on mouseup.
        this.removeEventListener('mousemove', mousedrag, false);
        this.removeEventListener('mouseup', mouseup, false);
        this._last_mouse_coords = void(0);
        this._last_mouse_update = void(0);
    };
    this.canvas.addEventListener('mousemove', mousedrag, false);
    this.canvas.addEventListener('mouseup', mouseup, false);
    this.canvas.addEventListener('mouseleave', mouseup, false);
};
/** 
 * Register mouseup event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseUp = function(e){
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mouseup', mouseCoord);
};
/** 
 * Register mousemove event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseMove = function(e){
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mousemove', mouseCoord);
};
/** 
 * Register mousedrag event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseDrag = function(e){
    var mouse_coords = this._getMousePos(e);
    // Calculate deltax and delta y, and mouse speed.
    if (typeof this._last_mouse_coords === 'undefined'){
        this._last_mouse_coords = mouse_coords;
    }
    if (typeof this._last_mouse_update === 'undefined'){
        this._last_mouse_update = new Date();
    }
    var time = new Date() - this._last_mouse_update;
    var deltax = mouse_coords.x - this._last_mouse_coords.x;
    var deltay = mouse_coords.y - this._last_mouse_coords.y;
    var xvel = 0;
    var yvel = 0;
    if (time > 0){
        xvel = deltax / time;
        yvel = deltay / time;
    }
    var mouseEvent = {'mouse': {
        'x': mouse_coords.x,
        'y': mouse_coords.y,
        'xvel': xvel,
        'yvel': yvel,
        'deltax': deltax,
        'deltay': deltay
    }};
    this._last_mouse_coords = mouse_coords;
    this._last_mouse_update = time;
    this.fire('mousedrag', mouseEvent);
};
/**
 * Initialize depth buffer with high z values.
 * @method
 */
Scene.prototype.initializeDepthBuffer = function(){
    for (var x = 0, len = this.width * this.height; x < len; x++){
        this._depth_buffer[x] = 9999999;
    }
};
/**
 * Determine id vector is offscreen.
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Scene.prototype.offscreen = function(vector){
    // TODO: Not totally certain that z>1 indicates vector is behind camera.
    var x = vector.x + this._x_offset;
    var y = vector.y + this._y_offset;
    var z = vector.z;
    return (z > 1 || x < 0 || x > this.width || y < 0 || y > this.height);
};
/**
 * Toggle drawing mode. Currently, available draw modes are wireframe mode, and
 * the experimental (and slow) fill mode.
 * @method
 */
Scene.prototype.toggleDrawMode = function(){
    this._draw_mode = (this._draw_mode + 1) % 2;
    this.renderScene();
};
/**
 * Toggle backface culling. 
 * @method
 */
Scene.prototype.toggleBackfaceCulling = function(){
    this._backface_culling = !this._backface_culling;
    this.renderScene();
};
/**
 * Draw a single pixel to the sceen and update the depth buffer. If there is already 
 * a closer pixel (i.e. one with a lower z value), then the pixel is not drawn.
 * @method
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {number} z Z coordinate
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawPixel = function(x, y, z, color){
    x = x + this._x_offset;
    y = y + this._y_offset;
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        var index = x + (y * this.width);
        if (z < this._depth_buffer[index]) {
            var image_data = this._back_buffer_image.data;
            var i = index * 4;
            image_data[i] = color.r;
            image_data[i+1] = color.g;
            image_data[i+2] = color.b;
            image_data[i+3] = 255;
            this._depth_buffer[index] = z;
        }
    }
};
/**
 * Draw a line segment between two points.
 * @method
 * @param {Vector} v1 First end point of line segment.
 * @param {Vector} v2 Second end point of line segment.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawEdge = function(v1, v2, color){
    var abs = Math.abs;
    if (v1.x >= v2.x){
        var temp = v1;
        v1 = v2;
        v2 = temp;
    }
    var current_x = v1.x;
    var current_y = v1.y;
    var current_z = v1.z;
    var longest_dist = Math.max(abs(v2.x - v1.x), abs(v2.y - v1.y), abs(v2.z - v1.z));
    var step_x = (v2.x - v1.x) / longest_dist;
    var step_y = (v2.y - v1.y) / longest_dist;
    var step_z = (v2.z - v1.z) / longest_dist;

    for (var i = 0; i < longest_dist; i++){
        this.drawPixel(Math.floor(current_x), Math.floor(current_y), current_z, color);
        current_x += step_x;
        current_y += step_y;
        current_z += step_z;
    }
};
/**
 * Draw the edges of a triangle.
 * @method
 * @param {Vector} v1 First vertex of triangle.
 * @param {Vector} v2 Second vertex of triangle.
 * @param {Vector} v3 Third vertex of triangle.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawTriangle = function(v1, v2, v3, color){
    this.drawEdge(v1, v2, color);
    this.drawEdge(v2, v3, color);
    this.drawEdge(v3, v1, color);
};
/**
 * Draw a filled triangle in a uniform color.
 * @method
 * @param {Vector} v1 First vertex of triangle.
 * @param {Vector} v2 Second vertex of triangle.
 * @param {Vector} v3 Third vertex of triangle.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.fillTriangle = function(v1, v2, v3, color){
    // TODO: This method chugs when close to a face. See if this can be fixed.
    // Is this just because it's looping over so many extraneous points?
    // Decomposing into smaller triangles may alleviate this somewhat.
    var x0 = v1.x;
    var x1 = v2.x;
    var x2 = v3.x;
    var y0 = v1.y;
    var y1 = v2.y;
    var y2 = v3.y;
    var z0 = v1.z;
    var z1 = v2.z;
    var z2 = v3.z;

    // Compute offsets. Used to avoid computing barycentric coords for offscreen pixels
    var xleft = 0 - this._x_offset;
    var xright = this.width - this._x_offset;
    var ytop = 0 - this._y_offset;
    var ybot = this.height - this._y_offset;

    // Compute bounding box
    var xmin = Math.floor(Math.min(x0, x1, x2));
    if (xmin < xleft){xmin=xleft;}
    var xmax = Math.ceil(Math.max(x0, x1, x2));
    if (xmax > xright){xmax=xright;}
    var ymin = Math.floor(Math.min(y0, y1, y2));
    if (ymin < ytop){ymin=ytop;}
    var ymax = Math.ceil(Math.max(y0, y1, y2));
    if (ymax > ybot){ymax=ybot;}

    // Precompute as much as possible
    var y2y0 = y2-y0;
    var x0x2 = x0-x2;
    var y0y1 = y0-y1;
    var x1x0 = x1-x0;
    var x2y0x0y2 = x2*y0 - x0*y2;
    var x0y1x1y0 = x0*y1 - x1*y0;
    var f20x1y1 = ((y2y0*x1) + (x0x2*y1) + x2y0x0y2);
    var f01x2y2 = ((y0y1*x2) + (x1x0*y2) + x0y1x1y0);

    var y2y0overf20x1y1 = y2y0/f20x1y1;
    var x0x2overf20x1y1 = x0x2/f20x1y1;
    var x2y0x0y21overf20x1y1 = x2y0x0y2/f20x1y1;

    var y0y1overf01x2y2 = y0y1/f01x2y2;
    var x0x2overf01x2y2 = x1x0/f01x2y2;
    var x2y0x0y2overf01x2y2 = x0y1x1y0/f01x2y2;

    // Loop over bounding box
    for (var x = xmin; x <= xmax; x++){
        for (var y = ymin; y <= ymax; y++){
            // Compute barycentric coordinates
            // If any of the coordinates are not in the range [0,1], then the
            // point is not inside the triangle. Rather than compute all the
            // coordinates straight away, we'll short-circuit as soon as a coordinate outside
            // of that range is encountered.
            var beta = y2y0overf20x1y1*x + x0x2overf20x1y1*y + x2y0x0y21overf20x1y1;
            if (beta >= 0 && beta <= 1){
                var gamma = y0y1overf01x2y2*x + x0x2overf01x2y2*y +x2y0x0y2overf01x2y2;
                if (gamma >= 0 && gamma <= 1){
                    var alpha = 1 - beta - gamma;
                    if (alpha >= 0 && alpha <= 1){
                        // If all barycentric coords within range [0,1], inside triangle
                        var z = alpha*z0 + beta*z1 + gamma*z2;
                        this.drawPixel(x, y, z, color);
                    }
                }
            }
        }
    }
};
/**
 * Render a single frame of the scene.
 * @method
 */
Scene.prototype.renderScene = function(){
    // TODO: Simplify this function.
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.initializeDepthBuffer();
    var camera_matrix = this.camera.view_matrix;
    var projection_matrix = this.camera.perspectiveFov;
    var light = this.illumination;
    for (var key in this.meshes){
        if (this.meshes.hasOwnProperty(key)){
            var mesh = this.meshes[key];
            var scale = mesh.scale;
            var rotation = mesh.rotation;
            var position = mesh.position;
            var world_matrix = Matrix.scale(scale.x, scale.y, scale.z).multiply(
                Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll).multiply(
                    Matrix.translation(position.x, position.y, position.z)));
            for (var k = 0; k < mesh.faces.length; k++){
                var face = mesh.faces[k].face;
                var color = mesh.faces[k].color;
                var v1 = mesh.vertices[face[0]];
                var v2 = mesh.vertices[face[1]];
                var v3 = mesh.vertices[face[2]];

                // Calculate the normal
                // TODO: Can this be calculated just once, and then transformed into
                // camera space?
                var cam_to_vert = this.camera.position.subtract(v1.transform(world_matrix));
                var side1 = v2.transform(world_matrix).subtract(v1.transform(world_matrix));
                var side2 = v3.transform(world_matrix).subtract(v1.transform(world_matrix));
                var norm = side1.cross(side2);
                if (norm.magnitude() <= 0.00000001){
                    norm = norm;
                } else {
                    norm = norm.normalize();
                }
                // Backface culling.
                if (!this._backface_culling || cam_to_vert.dot(norm) >= 0) {
                    var wvp_matrix = world_matrix.multiply(camera_matrix).multiply(projection_matrix);
                    var wv1 = v1.transform(wvp_matrix);
                    var wv2 = v2.transform(wvp_matrix);
                    var wv3 = v3.transform(wvp_matrix);
                    var draw = true;

                    // Draw surface normals
                    // var face_trans = Matrix.translation(wv1.x, wv1.y, v1.z);
                    // this.drawEdge(wv1, norm.scale(20).transform(face_trans), {'r':255,"g":255,"b":255})

                    // TODO: Fix frustum culling
                    // This is really stupid frustum culling... this can result in some faces not being
                    // drawn when they should, e.g. when a triangles vertices straddle the frustrum.
                    if (this.offscreen(wv1) && this.offscreen(wv2) && this.offscreen(wv3)){
                        draw = false;
                    }
                    if (draw){
                        if (this._draw_mode === 0){
                            this.drawTriangle(wv1, wv2, wv3, color.rgb);
                        } else if (this._draw_mode === 1){
                            var light_direction = light.subtract(v1.transform(world_matrix)).normalize();
                            var illumination_angle = norm.dot(light_direction);
                            color = color.lighten(illumination_angle*15);
                            this.fillTriangle(wv1, wv2, wv3, color.rgb);
                        }
                    }
                }
            }
        }
    }
    this._back_buffer_ctx.putImageData(this._back_buffer_image, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this._back_buffer, 0, 0, this.canvas.width, this.canvas.height);
};
/**
 * Add a mesh to the scene.
 * @method
 * @param {Mesh} mesh
 */
Scene.prototype.addMesh = function(mesh){
    this.meshes[mesh.name] = mesh;
};
/**
 * Remove a mesh to the scene.
 * @method
 * @param {Mesh} mesh
 */
Scene.prototype.removeMesh = function(mesh){
    delete this.meshes[mesh.name];
};
/**
 * Update the scene
 * @method
 */
Scene.prototype.update = function(){
    if (this._key_count > 0){
        this.fire('keydown');
    }
    // TODO: Add keyup, mousedown, mousedrag, mouseup, etc.
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};

module.exports = Scene;

},{"../utilities/keycodes.js":13,"../utilities/mixin.js":14,"./camera.js":8,"./events.js":9,"linearalgea":7}],11:[function(_dereq_,module,exports){
var Color = _dereq_('colour');

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
},{"colour":1}],12:[function(_dereq_,module,exports){
var Vector = _dereq_('linearalgea').Vector;
var Face = _dereq_('./face.js');

/**
 * @constructor
 * @param {string} name
 * @param {Array.<Vector>} vertices
 * @param {Array.<Face>} edges
 */
function Mesh(name, vertices, faces){
    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.position = new Vector(0, 0, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.scale = {'x': 1, 'y': 1, 'z': 1};
}

/**
 * Construct a Mesh from a JSON object.
 * @method
 * @static
 * @param  {{name: string, verticies: Array.<Array.<number>>, faces: {{face: Array.<number>, color: string}}}} json
 * @return {Mesh}
 */
Mesh.fromJSON = function(json){
    var vertices = [];
    var faces = [];
    for (var i = 0, len = json.vertices.length; i < len; i++){
        var vertex = json.vertices[i];
        vertices.push(new Vector(vertex[0], vertex[1], vertex[2]));
    }
    for (var j = 0, ln = json.faces.length; j < ln; j++){
        var face = json.faces[j];
        faces.push(new Face(face.face[0], face.face[1], face.face[2], face.color));
    }
    return new Mesh(json.name, vertices, faces);
};

module.exports = Mesh;

},{"./face.js":11,"linearalgea":7}],13:[function(_dereq_,module,exports){
/** 
 * @constant
 * @type {Object.<string, number>} 
 */
var KEYCODES = {
    'space': 32,
    'backspace' : 8,
    'tab' : 9,
    'enter' : 13,
    'shift' : 16,
    'ctrl' : 17,
    'alt' : 18,
    'pause_break' : 19,
    'caps_lock' : 20,
    'escape' : 27,
    'page_up' : 33,
    'page down' : 34,
    'end' : 35,
    'home' : 36,
    'left_arrow' : 37,
    'up_arrow' : 38,
    'right_arrow' : 39,
    'down_arrow' : 40,
    'insert' : 45,
    'delete' : 46,
    '0' : 48,
    '1' : 49,
    '2' : 50,
    '3' : 51,
    '4' : 52,
    '5' : 53,
    '6' : 54,
    '7' : 55,
    '8' : 56,
    '9' : 57,
    'a' : 65,
    'b' : 66,
    'c' : 67,
    'd' : 68,
    'e' : 69,
    'f' : 70,
    'g' : 71,
    'h' : 72,
    'i' : 73,
    'j' : 74,
    'k' : 75,
    'l' : 76,
    'm' : 77,
    'n' : 78,
    'o' : 79,
    'p' : 80,
    'q' : 81,
    'r' : 82,
    's' : 83,
    't' : 84,
    'u' : 85,
    'v' : 86,
    'w' : 87,
    'x' : 88,
    'y' : 89,
    'z' : 90,
    'left_window key' : 91,
    'right_window key' : 92,
    'select_key' : 93,
    'numpad 0' : 96,
    'numpad 1' : 97,
    'numpad 2' : 98,
    'numpad 3' : 99,
    'numpad 4' : 100,
    'numpad 5' : 101,
    'numpad 6' : 102,
    'numpad 7' : 103,
    'numpad 8' : 104,
    'numpad 9' : 105,
    'multiply' : 106,
    'add' : 107,
    'subtract' : 109,
    'decimal point' : 110,
    'divide' : 111,
    'f1' : 112,
    'f2' : 113,
    'f3' : 114,
    'f4' : 115,
    'f5' : 116,
    'f6' : 117,
    'f7' : 118,
    'f8' : 119,
    'f9' : 120,
    'f10' : 121,
    'f11' : 122,
    'f12' : 123,
    'num_lock' : 144,
    'scroll_lock' : 145,
    'semi_colon' : 186,
    'equal_sign' : 187,
    'comma' : 188,
    'dash' : 189,
    'period' : 190,
    'forward_slash' : 191,
    'grave_accent' : 192,
    'open_bracket' : 219,
    'backslash' : 220,
    'closebracket' : 221,
    'single_quote' : 222
};

module.exports = KEYCODES;
},{}],14:[function(_dereq_,module,exports){
function mixin(receiver, supplier) {
    for (var property in supplier) {
        if (supplier.hasOwnProperty(property)) {
            receiver[property] = supplier[property];
        }
    }
    return receiver;
}

module.exports = mixin;
},{}],15:[function(_dereq_,module,exports){
_dereq_('./../tests/helpers.js');
_dereq_('./../tests/engine/camera.js');
_dereq_('./../tests/engine/scene.js');
_dereq_('./../tests/geometry/face.js');
_dereq_('./../tests/geometry/mesh.js');

},{"./../tests/engine/camera.js":16,"./../tests/engine/scene.js":17,"./../tests/geometry/face.js":18,"./../tests/geometry/mesh.js":19,"./../tests/helpers.js":20}],16:[function(_dereq_,module,exports){
var Camera = _dereq_('../../src/engine/camera.js');
var assert = _dereq_("assert");

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
},{"../../src/engine/camera.js":8,"assert":2}],17:[function(_dereq_,module,exports){
var Scene = _dereq_('../../src/engine/scene.js');
var assert = _dereq_("assert");

suite('Scene', function(){
    setup(function(){
        //var scene = new Scene({canvas_id: 'wireframe', width:600, height:400});
    });
    suite('properties', function(){
        test('height', function(){
            // assert.equal(scene.height, 400);
        });
    });
    suite('methods', function(){
        
    })
});
},{"../../src/engine/scene.js":10,"assert":2}],18:[function(_dereq_,module,exports){
var Face = _dereq_('../../src/geometry/face.js');
var assert = _dereq_("assert");

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
},{"../../src/geometry/face.js":11,"assert":2}],19:[function(_dereq_,module,exports){
var Mesh = _dereq_('../../src/geometry/mesh.js');
var Face = _dereq_('../../src/geometry/face.js');
var Vector = _dereq_('linearalgea').Vector;
var assert = _dereq_("assert");

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
},{"../../src/geometry/face.js":11,"../../src/geometry/mesh.js":12,"assert":2,"linearalgea":7}],20:[function(_dereq_,module,exports){
function nearlyEqual(a, b, eps){
    if (typeof eps === "undefined") {eps = 0.01;}
    var diff = Math.abs(a - b);
    return (diff < eps);
}

var helpers = new Object(null);

helpers.nearlyEqual = nearlyEqual;

module.exports = helpers;
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9jb2xvdXIvYnVpbGQvY29sb3VyLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL25vZGVfbW9kdWxlcy9saW5lYXJhbGdlYS9idWlsZC9saW5lYXJhbGdlYS5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL3NyYy9lbmdpbmUvY2FtZXJhLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvc3JjL2VuZ2luZS9ldmVudHMuanMiLCIvaG9tZS9lYmVucGFjay9Ecm9wYm94L0hvbWV3b3JrL3dpcmVmcmFtZS9zcmMvZW5naW5lL3NjZW5lLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvc3JjL2dlb21ldHJ5L2ZhY2UuanMiLCIvaG9tZS9lYmVucGFjay9Ecm9wYm94L0hvbWV3b3JrL3dpcmVmcmFtZS9zcmMvZ2VvbWV0cnkvbWVzaC5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL3NyYy91dGlsaXRpZXMva2V5Y29kZXMuanMiLCIvaG9tZS9lYmVucGFjay9Ecm9wYm94L0hvbWV3b3JrL3dpcmVmcmFtZS9zcmMvdXRpbGl0aWVzL21peGluLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvdGVzdC9mYWtlX2NjODE3YmI3LmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvdGVzdHMvZW5naW5lL2NhbWVyYS5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL3Rlc3RzL2VuZ2luZS9zY2VuZS5qcyIsIi9ob21lL2ViZW5wYWNrL0Ryb3Bib3gvSG9tZXdvcmsvd2lyZWZyYW1lL3Rlc3RzL2dlb21ldHJ5L2ZhY2UuanMiLCIvaG9tZS9lYmVucGFjay9Ecm9wYm94L0hvbWV3b3JrL3dpcmVmcmFtZS90ZXN0cy9nZW9tZXRyeS9tZXNoLmpzIiwiL2hvbWUvZWJlbnBhY2svRHJvcGJveC9Ib21ld29yay93aXJlZnJhbWUvdGVzdHMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4hZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNle3ZhciBvO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/bz13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9vPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKG89c2VsZiksby5Db2xvdXI9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaHNsVG9SZ2IsIHJnYlRvSHNsLCBwYXJzZUNvbG9yLCBjYWNoZTtcbi8qKlxuICogQSBjb2xvciB3aXRoIGJvdGggcmdiIGFuZCBoc2wgcmVwcmVzZW50YXRpb25zLlxuICogQGNsYXNzIENvbG91clxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIEFueSBsZWdhbCBDU1MgY29sb3IgdmFsdWUgKGhleCwgY29sb3Iga2V5d29yZCwgcmdiW2FdLCBoc2xbYV0pLlxuICovXG5mdW5jdGlvbiBDb2xvdXIoY29sb3IsIGFscGhhKXtcbiAgICB2YXIgaHNsLCByZ2I7XG4gICAgdmFyIHBhcnNlZF9jb2xvciA9IHt9O1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgY29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoY29sb3IgaW4gY2FjaGUpe1xuICAgICAgICAgICAgcGFyc2VkX2NvbG9yID0gY2FjaGVbY29sb3JdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyc2VkX2NvbG9yID0gcGFyc2VDb2xvcihjb2xvcik7XG4gICAgICAgICAgICBjYWNoZVtjb2xvcl0gPSBwYXJzZWRfY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmdiID0gcGFyc2VkX2NvbG9yO1xuICAgICAgICBoc2wgPSByZ2JUb0hzbChwYXJzZWRfY29sb3IuciwgcGFyc2VkX2NvbG9yLmcsIHBhcnNlZF9jb2xvci5iKTtcbiAgICAgICAgYWxwaGEgPSBwYXJzZWRfY29sb3IuYSB8fCBhbHBoYSB8fCAxO1xuICAgIH0gZWxzZSBpZiAoJ3InIGluIGNvbG9yKXtcbiAgICAgICAgcmdiID0gY29sb3I7XG4gICAgICAgIGhzbCA9IHJnYlRvSHNsKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuICAgICAgICBhbHBoYSA9IGhzbC5hIHx8IGFscGhhIHx8IDE7XG4gICAgfSBlbHNlIGlmICgnaCcgaW4gY29sb3Ipe1xuICAgICAgICBoc2wgPSBjb2xvcjtcbiAgICAgICAgcmdiID0gaHNsVG9SZ2IoY29sb3IuaCwgY29sb3IucywgY29sb3IubCk7XG4gICAgICAgIGFscGhhID0gcmdiLmEgfHwgYWxwaGEgfHwgMTtcbiAgICB9XG4gICAgdGhpcy5yZ2IgPSB7J3InOiByZ2IuciwgJ2cnOiByZ2IuZywgJ2InOiByZ2IuYn07XG4gICAgdGhpcy5oc2wgPSB7J2gnOiBoc2wuaCwgJ3MnOiBoc2wucywgJ2wnOiBoc2wubH07XG4gICAgdGhpcy5hbHBoYSA9IGFscGhhO1xufVxuLyoqXG4gKiBMaWdodGVuIGEgY29sb3IgYnkgdGhlIGdpdmVuIHBlcmNlbnRhZ2UuXG5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSAge251bWJlcn0gcGVyY2VudFxuICogQHJldHVybiB7Q29sb3VyfVxuICovXG5Db2xvdXIucHJvdG90eXBlLmxpZ2h0ZW4gPSBmdW5jdGlvbihwZXJjZW50KXtcbiAgICB2YXIgaHNsID0gdGhpcy5oc2w7XG4gICAgdmFyIGx1bSA9IGhzbC5sICsgcGVyY2VudDtcbiAgICBpZiAobHVtID4gMTAwKXtcbiAgICAgICAgbHVtID0gMTAwO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG91cih7J2gnOmhzbC5oLCAncyc6aHNsLnMsICdsJzpsdW19LCB0aGlzLmFscGhhKTtcbn07XG4vKipcbiAqIERhcmtlbiBhIGNvbG9yIGJ5IHRoZSBnaXZlbiBwZXJjZW50YWdlLlxuICogQG1ldGhvZFxuICogQHBhcmFtICB7bnVtYmVyfSBwZXJjZW50XG4gKiBAcmV0dXJuIHtDb2xvdXJ9XG4gKi9cbkNvbG91ci5wcm90b3R5cGUuZGFya2VuID0gZnVuY3Rpb24ocGVyY2VudCl7XG4gICAgdmFyIGhzbCA9IHRoaXMuaHNsO1xuICAgIHZhciBsdW0gPSBoc2wubCAtIHBlcmNlbnQ7XG4gICAgaWYgKGx1bSA8IDApe1xuICAgICAgICBsdW0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG91cih7J2gnOmhzbC5oLCAncyc6aHNsLnMsICdsJzpsdW19LCB0aGlzLmFscGhhKTtcbn07XG4vKipcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBjb2xvciBpbiAjaGV4IGZvcm0uXG4gKiBAbWV0aG9kXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbkNvbG91ci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHZhciByID0gdGhpcy5yZ2Iuci50b1N0cmluZygxNik7XG4gICAgdmFyIGcgPSB0aGlzLnJnYi5nLnRvU3RyaW5nKDE2KTtcbiAgICB2YXIgYiA9IHRoaXMucmdiLmIudG9TdHJpbmcoMTYpO1xuICAgIC8vIFplcm8gZmlsbFxuICAgIGlmIChyLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIHIgPSBcIjBcIiArIHI7XG4gICAgfVxuICAgIGlmIChnLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGcgPSBcIjBcIiArIGc7XG4gICAgfVxuICAgIGlmIChiLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGIgPSBcIjBcIiArIGI7XG4gICAgfVxuICAgIHJldHVybiBcIiNcIiArIHIgKyBnICsgYjtcbn07XG4vKipcbiogQHBhcmFtIHtudW1iZXJ9IGggSHVlXG4qIEBwYXJhbSB7bnVtYmVyfSBzIFNhdHVyYXRpb25cbiogQHBhcmFtIHtudW1iZXJ9IGwgTHVtaW5hbmNlXG4qIEByZXR1cm4ge3tyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyfX1cbiovXG5oc2xUb1JnYiA9IGZ1bmN0aW9uKGgsIHMsIGwpe1xuICAgIGZ1bmN0aW9uIF92KG0xLCBtMiwgaHVlKXtcbiAgICAgICAgaHVlID0gaHVlO1xuICAgICAgICBpZiAoaHVlIDwgMCl7aHVlKz0xO31cbiAgICAgICAgaWYgKGh1ZSA+IDEpe2h1ZS09MTt9XG4gICAgICAgIGlmIChodWUgPCAoMS82KSl7XG4gICAgICAgICAgICByZXR1cm4gbTEgKyAobTItbTEpKmh1ZSo2O1xuICAgICAgICB9XG4gICAgICAgIGlmIChodWUgPCAwLjUpe1xuICAgICAgICAgICAgcmV0dXJuIG0yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChodWUgPCAoMi8zKSl7XG4gICAgICAgICAgICByZXR1cm4gbTEgKyAobTItbTEpKigoMi8zKS1odWUpKjY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0xO1xuICAgIH1cbiAgICB2YXIgbTI7XG4gICAgdmFyIGZyYWN0aW9uX2wgPSAobC8xMDApO1xuICAgIHZhciBmcmFjdGlvbl9zID0gKHMvMTAwKTtcbiAgICBpZiAocyA9PT0gMCl7XG4gICAgICAgIHZhciBncmF5ID0gZnJhY3Rpb25fbCoyNTU7XG4gICAgICAgIHJldHVybiB7J3InOiBncmF5LCAnZyc6IGdyYXksICdiJzogZ3JheX07XG4gICAgfVxuICAgIGlmIChsIDw9IDUwKXtcbiAgICAgICAgbTIgPSBmcmFjdGlvbl9sICogKDErZnJhY3Rpb25fcyk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICAgIG0yID0gZnJhY3Rpb25fbCtmcmFjdGlvbl9zLShmcmFjdGlvbl9sKmZyYWN0aW9uX3MpO1xuICAgIH1cbiAgICB2YXIgbTEgPSAyKmZyYWN0aW9uX2wgLSBtMjtcbiAgICBoID0gaCAvIDM2MDtcbiAgICByZXR1cm4geydyJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgrKDEvMykpKjI1NSksICdnJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgpKjI1NSksICdiJzogTWF0aC5yb3VuZChfdihtMSwgbTIsIGgtKDEvMykpKjI1NSl9O1xufTtcbi8qKlxuICogQHBhcmFtICB7bnVtYmVyfSByIFJlZFxuICogQHBhcmFtICB7bnVtYmVyfSBnIEdyZWVuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGIgQmx1ZVxuICogQHJldHVybiB7e2g6IG51bWJlciwgczogbnVtYmVyLCBsOiBudW1iZXJ9fVxuICovXG5yZ2JUb0hzbCA9IGZ1bmN0aW9uKHIsIGcsIGIpe1xuICAgIHIgPSByIC8gMjU1O1xuICAgIGcgPSBnIC8gMjU1O1xuICAgIGIgPSBiIC8gMjU1O1xuICAgIHZhciBtYXhjID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgdmFyIG1pbmMgPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICB2YXIgbCA9IE1hdGgucm91bmQoKChtaW5jK21heGMpLzIpKjEwMCk7XG4gICAgaWYgKGwgPiAxMDApIHtsID0gMTAwO31cbiAgICBpZiAobCA8IDApIHtsID0gMDt9XG4gICAgdmFyIGgsIHM7XG4gICAgaWYgKG1pbmMgPT09IG1heGMpe1xuICAgICAgICByZXR1cm4geydoJzogMCwgJ3MnOiAwLCAnbCc6IGx9O1xuICAgIH1cbiAgICBpZiAobCA8PSA1MCl7XG4gICAgICAgIHMgPSAobWF4Yy1taW5jKSAvIChtYXhjK21pbmMpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBzID0gKG1heGMtbWluYykgLyAoMi1tYXhjLW1pbmMpO1xuICAgIH1cbiAgICB2YXIgcmMgPSAobWF4Yy1yKSAvIChtYXhjLW1pbmMpO1xuICAgIHZhciBnYyA9IChtYXhjLWcpIC8gKG1heGMtbWluYyk7XG4gICAgdmFyIGJjID0gKG1heGMtYikgLyAobWF4Yy1taW5jKTtcbiAgICBpZiAociA9PT0gbWF4Yyl7XG4gICAgICAgIGggPSBiYy1nYztcbiAgICB9XG4gICAgZWxzZSBpZiAoZyA9PT0gbWF4Yyl7XG4gICAgICAgIGggPSAyK3JjLWJjO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBoID0gNCtnYy1yYztcbiAgICB9XG4gICAgaCA9IChoLzYpICUgMTtcbiAgICBpZiAoaCA8IDApe2grPTE7fVxuICAgIGggPSBNYXRoLnJvdW5kKGgqMzYwKTtcbiAgICBzID0gTWF0aC5yb3VuZChzKjEwMCk7XG4gICAgaWYgKGggPiAzNjApIHtoID0gMzYwO31cbiAgICBpZiAoaCA8IDApIHtoID0gMDt9XG4gICAgaWYgKHMgPiAxMDApIHtzID0gMTAwO31cbiAgICBpZiAocyA8IDApIHtzID0gMDt9XG4gICAgcmV0dXJuIHsnaCc6IGgsICdzJzogcywgJ2wnOiBsfTtcbn07XG4vLyBDbGFtcCB4IGFuZCB5IHZhbHVlcyB0byBtaW4gYW5kIG1heFxuZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpe1xuICAgIGlmICh4IDwgbWluKXt4ID0gbWluO31cbiAgICBlbHNlIGlmICh4ID4gbWF4KXt4ID0gbWF4O31cbiAgICByZXR1cm4geDtcbn1cbi8qKlxuICogUGFyc2UgYSBDU1MgY29sb3IgdmFsdWUgYW5kIHJldHVybiBhbiByZ2JhIGNvbG9yIG9iamVjdC5cbiAqIEBwYXJhbSAge3N0cmluZ30gY29sb3IgQSBsZWdhbCBDU1MgY29sb3IgdmFsdWUgKGhleCwgY29sb3Iga2V5d29yZCwgcmdiW2FdLCBoc2xbYV0pLlxuICogQHJldHVybiB7e3I6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcn19ICAgcmdiYSBjb2xvciBvYmplY3QuXG4gKiBAdGhyb3dzIHtDb2xvdXJFcnJvcn0gSWYgaWxsZWdhbCBjb2xvciB2YWx1ZSBpcyBwYXNzZWQuXG4gKi9cbnBhcnNlQ29sb3IgPSBmdW5jdGlvbihjb2xvcil7XG4gICAgdmFyIHJlZCwgZ3JlZW4sIGJsdWUsIGh1ZSwgc2F0LCBsdW07XG4gICAgdmFyIGFscGhhID0gMTtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIGVycm9yID0gZmFsc2U7XG4gICAgdmFyIHByZWYgPSBjb2xvci5zdWJzdHIoMCwzKTsgLy8gVGhyZWUgbGV0dGVyIGNvbG9yIHByZWZpeFxuICAgIC8vIEhTTChhKVxuICAgIGlmIChwcmVmID09PSAnaHNsJyl7XG4gICAgICAgIHZhciBoc2xfcmVnZXggPSAvaHNsYT9cXChcXHMqKC0/XFxkKylcXHMqLFxccyooLT9cXGQrKSVcXHMqLFxccyooLT9cXGQrKSVcXHMqKCxcXHMqKC0/XFxkKyhcXC5cXGQrKT8pXFxzKik/XFwpL2c7XG4gICAgICAgIG1hdGNoID0gaHNsX3JlZ2V4LmV4ZWMoY29sb3IpO1xuICAgICAgICBpZiAobWF0Y2gpe1xuICAgICAgICAgICAgaHVlID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIHNhdCA9IHBhcnNlSW50KG1hdGNoWzJdLCAxMCk7XG4gICAgICAgICAgICBsdW0gPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICAgICAgaWYgKGNvbG9yWzNdID09PSAnYScpe1xuICAgICAgICAgICAgICAgIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs1XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodWUgPSBNYXRoLmFicyhodWUgJSAzNjApO1xuICAgICAgICAgICAgc2F0ID0gY2xhbXAoc2F0LCAwLCAxMDApO1xuICAgICAgICAgICAgbHVtID0gY2xhbXAobHVtLCAwLCAxMDApO1xuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IGhzbFRvUmdiKGh1ZSwgc2F0LCBsdW0pO1xuICAgICAgICAgICAgcmVkID0gcGFyc2VkLnI7XG4gICAgICAgICAgICBncmVlbiA9IHBhcnNlZC5nO1xuICAgICAgICAgICAgYmx1ZSA9IHBhcnNlZC5iO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgLy8gUkdCKGEpXG4gICAgfSBlbHNlIGlmIChwcmVmID09PSAncmdiJyl7XG4gICAgICAgIHZhciByZ2JfcmVnZXggPSAvcmdiYT9cXCgoLT9cXGQrJT8pXFxzKixcXHMqKC0/XFxkKyU/KVxccyosXFxzKigtP1xcZCslPykoLFxccyooLT9cXGQrKFxcLlxcZCspPylcXHMqKT9cXCkvZztcbiAgICAgICAgbWF0Y2ggPSByZ2JfcmVnZXguZXhlYyhjb2xvcik7XG4gICAgICAgIGlmIChtYXRjaCl7XG4gICAgICAgICAgICB2YXIgbTEgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIHZhciBtMiA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgdmFyIG0zID0gbWF0Y2hbM107XG4gICAgICAgICAgICByZWQgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChtYXRjaFsyXSwgMTApO1xuICAgICAgICAgICAgYmx1ZSA9IHBhcnNlSW50KG1hdGNoWzNdLCAxMCk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB1c2luZyByZ2IoYSkgcGVyY2VudGFnZSB2YWx1ZXMuXG4gICAgICAgICAgICBpZiAobTFbbTEubGVuZ3RoLTFdID09PSAnJScgfHxcbiAgICAgICAgICAgICAgICBtMlttMi5sZW5ndGgtMV0gPT09ICclJyB8fFxuICAgICAgICAgICAgICAgIG0zW20zLmxlbmd0aC0xXSA9PT0gJyUnKXtcbiAgICAgICAgICAgICAgICAvLyBBbGwgdmFsdWVzIG11c3QgYmUgcGVyY2V0YWdlLlxuICAgICAgICAgICAgICAgIGlmIChtMVttMS5sZW5ndGgtMV0gPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBtMlttMi5sZW5ndGgtMV0gPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBtM1ttMy5sZW5ndGgtMV0gPT09ICclJyl7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gMjU1XG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IE1hdGguZmxvb3IocmVkLzEwMCAqIDI1NSk7XG4gICAgICAgICAgICAgICAgICAgIGdyZWVuID0gTWF0aC5mbG9vcihncmVlbi8xMDAgKiAyNTUpO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gTWF0aC5mbG9vcihibHVlLzEwMCAqIDI1NSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBlcnJvciA9IHRydWU7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZCA9IGNsYW1wKHJlZCwgMCwgMjU1KTtcbiAgICAgICAgICAgIGdyZWVuID0gY2xhbXAoZ3JlZW4sIDAsIDI1NSk7XG4gICAgICAgICAgICBibHVlID0gY2xhbXAoYmx1ZSwgMCwgMjU1KTtcbiAgICAgICAgICAgIGlmIChjb2xvclszXSA9PT0gJ2EnKXtcbiAgICAgICAgICAgICAgICBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgLy8gSEVYXG4gICAgfSBlbHNlIGlmIChjb2xvclswXSA9PT0gJyMnKXtcbiAgICAgICAgdmFyIGhleCA9IGNvbG9yLnN1YnN0cigxKTtcbiAgICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpe1xuICAgICAgICAgICAgcmVkID0gcGFyc2VJbnQoaGV4WzBdK2hleFswXSwgMTYpO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChoZXhbMV0raGV4WzFdLCAxNik7XG4gICAgICAgICAgICBibHVlID0gcGFyc2VJbnQoaGV4WzJdK2hleFsyXSwgMTYpO1xuICAgICAgICB9IGVsc2UgaWYgKGhleC5sZW5ndGggPT09IDYpe1xuICAgICAgICAgICAgcmVkID0gcGFyc2VJbnQoaGV4WzBdK2hleFsxXSwgMTYpO1xuICAgICAgICAgICAgZ3JlZW4gPSBwYXJzZUludChoZXhbMl0raGV4WzNdLCAxNik7XG4gICAgICAgICAgICBibHVlID0gcGFyc2VJbnQoaGV4WzRdK2hleFs1XSwgMTYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IgPSB0cnVlO1xuICAgIH1cblxuICAgIGFscGhhID0gY2xhbXAoYWxwaGEsIDAsIDEpO1xuXG4gICAgaWYgKGVycm9yKXtcbiAgICAgICAgdGhyb3cgXCJDb2xvdXJFcnJvcjogU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBlcmhhcHMgXCIgKyBjb2xvciArIFwiIGlzIG5vdCBhIGxlZ2FsIENTUyBjb2xvciB2YWx1ZVwiO1xuICAgIH1cbiAgICByZXR1cm4geydyJzogcmVkLCAnZyc6IGdyZWVuLCAnYic6IGJsdWUsICdhJzogYWxwaGF9O1xufTtcbi8vIFByZS13YXJtIHRoZSBjYWNoZSB3aXRoIG5hbWVkIGNvbG9ycywgYXMgdGhlc2UgYXJlIG5vdFxuLy8gY29udmVydGVkIHRvIHJnYiB2YWx1ZXMgYnkgdGhlIHBhcnNlQ29sb3IgZnVuY3Rpb24gYWJvdmUuXG5jYWNoZSA9IHtcbiAgICBcImJsYWNrXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAwLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiAwfSxcbiAgICBcInNpbHZlclwiOiB7XCJyXCI6IDE5MiwgXCJnXCI6IDE5MiwgXCJiXCI6IDE5MiwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogNzV9LFxuICAgIFwiZ3JheVwiOiB7XCJyXCI6IDEyOCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogNTB9LFxuICAgIFwid2hpdGVcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDEwMH0sXG4gICAgXCJtYXJvb25cIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAwLCBcImJcIjogMCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJyZWRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAwLCBcImJcIjogMCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJwdXJwbGVcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAwLCBcImJcIjogMTI4LCBcImhcIjogMzAwLCBcInNcIjogMTAwLCBcImxcIjogMjV9LFxuICAgIFwiZnVjaHNpYVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDAsIFwiYlwiOiAyNTUsIFwiaFwiOiAzMDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMjgsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogMjV9LFxuICAgIFwibGltZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyNTUsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwib2xpdmVcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAxMjgsIFwiYlwiOiAwLCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJ5ZWxsb3dcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAwLCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJuYXZ5XCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAxMjgsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAyNTUsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJ0ZWFsXCI6IHtcInJcIjogMCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDI1fSxcbiAgICBcImFxdWFcIjoge1wiclwiOiAwLCBcImdcIjogMjU1LCBcImJcIjogMjU1LCBcImhcIjogMTgwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwib3JhbmdlXCI6IHtcInJcIjogMjU1LCBcImdcIjogMTY1LCBcImJcIjogMCwgXCJoXCI6IDM5LCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwiYWxpY2VibHVlXCI6IHtcInJcIjogMjQwLCBcImdcIjogMjQ4LCBcImJcIjogMjU1LCBcImhcIjogMjA4LCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwiYW50aXF1ZXdoaXRlXCI6IHtcInJcIjogMjUwLCBcImdcIjogMjM1LCBcImJcIjogMjE1LCBcImhcIjogMzQsIFwic1wiOiA3OCwgXCJsXCI6IDkxfSxcbiAgICBcImFxdWFtYXJpbmVcIjoge1wiclwiOiAxMjcsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyMTIsIFwiaFwiOiAxNjAsIFwic1wiOiAxMDAsIFwibFwiOiA3NX0sXG4gICAgXCJhenVyZVwiOiB7XCJyXCI6IDI0MCwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk3fSxcbiAgICBcImJlaWdlXCI6IHtcInJcIjogMjQ1LCBcImdcIjogMjQ1LCBcImJcIjogMjIwLCBcImhcIjogNjAsIFwic1wiOiA1NiwgXCJsXCI6IDkxfSxcbiAgICBcImJpc3F1ZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIyOCwgXCJiXCI6IDE5NiwgXCJoXCI6IDMzLCBcInNcIjogMTAwLCBcImxcIjogODh9LFxuICAgIFwiYmxhbmNoZWRhbG1vbmRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyMzUsIFwiYlwiOiAyMDUsIFwiaFwiOiAzNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDkwfSxcbiAgICBcImJsdWV2aW9sZXRcIjoge1wiclwiOiAxMzgsIFwiZ1wiOiA0MywgXCJiXCI6IDIyNiwgXCJoXCI6IDI3MSwgXCJzXCI6IDc2LCBcImxcIjogNTN9LFxuICAgIFwiYnJvd25cIjoge1wiclwiOiAxNjUsIFwiZ1wiOiA0MiwgXCJiXCI6IDQyLCBcImhcIjogMCwgXCJzXCI6IDU5LCBcImxcIjogNDF9LFxuICAgIFwiYnVybHl3b29kXCI6IHtcInJcIjogMjIyLCBcImdcIjogMTg0LCBcImJcIjogMTM1LCBcImhcIjogMzQsIFwic1wiOiA1NywgXCJsXCI6IDcwfSxcbiAgICBcImNhZGV0Ymx1ZVwiOiB7XCJyXCI6IDk1LCBcImdcIjogMTU4LCBcImJcIjogMTYwLCBcImhcIjogMTgyLCBcInNcIjogMjUsIFwibFwiOiA1MH0sXG4gICAgXCJjaGFydHJldXNlXCI6IHtcInJcIjogMTI3LCBcImdcIjogMjU1LCBcImJcIjogMCwgXCJoXCI6IDkwLCBcInNcIjogMTAwLCBcImxcIjogNTB9LFxuICAgIFwiY2hvY29sYXRlXCI6IHtcInJcIjogMjEwLCBcImdcIjogMTA1LCBcImJcIjogMzAsIFwiaFwiOiAyNSwgXCJzXCI6IDc1LCBcImxcIjogNDd9LFxuICAgIFwiY29yYWxcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxMjcsIFwiYlwiOiA4MCwgXCJoXCI6IDE2LCBcInNcIjogMTAwLCBcImxcIjogNjZ9LFxuICAgIFwiY29ybmZsb3dlcmJsdWVcIjoge1wiclwiOiAxMDAsIFwiZ1wiOiAxNDksIFwiYlwiOiAyMzcsIFwiaFwiOiAyMTksIFwic1wiOiA3OSwgXCJsXCI6IDY2fSxcbiAgICBcImNvcm5zaWxrXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjQ4LCBcImJcIjogMjIwLCBcImhcIjogNDgsIFwic1wiOiAxMDAsIFwibFwiOiA5M30sXG4gICAgXCJjeWFuXCI6IHtcInJcIjogMCxcImdcIjogMjU1LFwiYlwiOiAyNTUsIFwiaFwiOiAxODAsXCJzXCI6IDEwMCxcImxcIjogOTd9LFxuICAgIFwiY3JpbXNvblwiOiB7XCJyXCI6IDIyMCwgXCJnXCI6IDIwLCBcImJcIjogNjAsIFwiaFwiOiAzNDgsIFwic1wiOiA4MywgXCJsXCI6IDQ3fSxcbiAgICBcImRhcmtibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAxMzksIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrY3lhblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMzksIFwiYlwiOiAxMzksIFwiaFwiOiAxODAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrZ29sZGVucm9kXCI6IHtcInJcIjogMTg0LCBcImdcIjogMTM0LCBcImJcIjogMTEsIFwiaFwiOiA0MywgXCJzXCI6IDg5LCBcImxcIjogMzh9LFxuICAgIFwiZGFya2dyYXlcIjoge1wiclwiOiAxNjksIFwiZ1wiOiAxNjksIFwiYlwiOiAxNjksIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDY2fSxcbiAgICBcImRhcmtncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxMDAsIFwiYlwiOiAwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogMjB9LFxuICAgIFwiZGFya2dyZXlcIjoge1wiclwiOiAxNjksIFwiZ1wiOiAxNjksIFwiYlwiOiAxNjksIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDY2fSxcbiAgICBcImRhcmtraGFraVwiOiB7XCJyXCI6IDE4OSwgXCJnXCI6IDE4MywgXCJiXCI6IDEwNywgXCJoXCI6IDU2LCBcInNcIjogMzgsIFwibFwiOiA1OH0sXG4gICAgXCJkYXJrbWFnZW50YVwiOiB7XCJyXCI6IDEzOSwgXCJnXCI6IDAsIFwiYlwiOiAxMzksIFwiaFwiOiAzMDAsIFwic1wiOiAxMDAsIFwibFwiOiAyN30sXG4gICAgXCJkYXJrb2xpdmVncmVlblwiOiB7XCJyXCI6IDg1LCBcImdcIjogMTA3LCBcImJcIjogNDcsIFwiaFwiOiA4MiwgXCJzXCI6IDM5LCBcImxcIjogMzB9LFxuICAgIFwiZGFya29yYW5nZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDE0MCwgXCJiXCI6IDAsIFwiaFwiOiAzMywgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcImRhcmtvcmNoaWRcIjoge1wiclwiOiAxNTMsIFwiZ1wiOiA1MCwgXCJiXCI6IDIwNCwgXCJoXCI6IDI4MCwgXCJzXCI6IDYxLCBcImxcIjogNTB9LFxuICAgIFwiZGFya3JlZFwiOiB7XCJyXCI6IDEzOSwgXCJnXCI6IDAsIFwiYlwiOiAwLCBcImhcIjogMCwgXCJzXCI6IDEwMCwgXCJsXCI6IDI3fSxcbiAgICBcImRhcmtzYWxtb25cIjoge1wiclwiOiAyMzMsIFwiZ1wiOiAxNTAsIFwiYlwiOiAxMjIsIFwiaFwiOiAxNSwgXCJzXCI6IDcyLCBcImxcIjogNzB9LFxuICAgIFwiZGFya3NlYWdyZWVuXCI6IHtcInJcIjogMTQzLCBcImdcIjogMTg4LCBcImJcIjogMTQzLCBcImhcIjogMTIwLCBcInNcIjogMjUsIFwibFwiOiA2NX0sXG4gICAgXCJkYXJrc2xhdGVibHVlXCI6IHtcInJcIjogNzIsIFwiZ1wiOiA2MSwgXCJiXCI6IDEzOSwgXCJoXCI6IDI0OCwgXCJzXCI6IDM5LCBcImxcIjogMzl9LFxuICAgIFwiZGFya3NsYXRlZ3JheVwiOiB7XCJyXCI6IDQ3LCBcImdcIjogNzksIFwiYlwiOiA3OSwgXCJoXCI6IDE4MCwgXCJzXCI6IDI1LCBcImxcIjogMjV9LFxuICAgIFwiZGFya3NsYXRlZ3JleVwiOiB7XCJyXCI6IDQ3LCBcImdcIjogNzksIFwiYlwiOiA3OSwgXCJoXCI6IDE4MCwgXCJzXCI6IDI1LCBcImxcIjogMjV9LFxuICAgIFwiZGFya3R1cnF1b2lzZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyMDksIFwiaFwiOiAxODEsIFwic1wiOiAxMDAsIFwibFwiOiA0MX0sXG4gICAgXCJkYXJrdmlvbGV0XCI6IHtcInJcIjogMTQ4LCBcImdcIjogMCwgXCJiXCI6IDIxMSwgXCJoXCI6IDI4MiwgXCJzXCI6IDEwMCwgXCJsXCI6IDQxfSxcbiAgICBcImRlZXBwaW5rXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjAsIFwiYlwiOiAxNDcsIFwiaFwiOiAzMjgsIFwic1wiOiAxMDAsIFwibFwiOiA1NH0sXG4gICAgXCJkZWVwc2t5Ymx1ZVwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAxOTEsIFwiYlwiOiAyNTUsIFwiaFwiOiAxOTUsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJkaW1ncmF5XCI6IHtcInJcIjogMTA1LCBcImdcIjogMTA1LCBcImJcIjogMTA1LCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA0MX0sXG4gICAgXCJkaW1ncmV5XCI6IHtcInJcIjogMTA1LCBcImdcIjogMTA1LCBcImJcIjogMTA1LCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA0MX0sXG4gICAgXCJkb2RnZXJibHVlXCI6IHtcInJcIjogMzAsIFwiZ1wiOiAxNDQsIFwiYlwiOiAyNTUsIFwiaFwiOiAyMTAsIFwic1wiOiAxMDAsIFwibFwiOiA1Nn0sXG4gICAgXCJmaXJlYnJpY2tcIjoge1wiclwiOiAxNzgsIFwiZ1wiOiAzNCwgXCJiXCI6IDM0LCBcImhcIjogMCwgXCJzXCI6IDY4LCBcImxcIjogNDJ9LFxuICAgIFwiZmxvcmFsd2hpdGVcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTAsIFwiYlwiOiAyNDAsIFwiaFwiOiA0MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk3fSxcbiAgICBcImZvcmVzdGdyZWVuXCI6IHtcInJcIjogMzQsIFwiZ1wiOiAxMzksIFwiYlwiOiAzNCwgXCJoXCI6IDEyMCwgXCJzXCI6IDYxLCBcImxcIjogMzR9LFxuICAgIFwiZ2FpbnNib3JvXCI6IHtcInJcIjogMjIwLCBcImdcIjogMjIwLCBcImJcIjogMjIwLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA4Nn0sXG4gICAgXCJnaG9zdHdoaXRlXCI6IHtcInJcIjogMjQ4LCBcImdcIjogMjQ4LCBcImJcIjogMjU1LCBcImhcIjogMjQwLCBcInNcIjogMTAwLCBcImxcIjogOTl9LFxuICAgIFwiZ29sZFwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIxNSwgXCJiXCI6IDAsIFwiaFwiOiA1MSwgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcImdvbGRlbnJvZFwiOiB7XCJyXCI6IDIxOCwgXCJnXCI6IDE2NSwgXCJiXCI6IDMyLCBcImhcIjogNDMsIFwic1wiOiA3NCwgXCJsXCI6IDQ5fSxcbiAgICBcImdyZWVueWVsbG93XCI6IHtcInJcIjogMTczLCBcImdcIjogMjU1LCBcImJcIjogNDcsIFwiaFwiOiA4NCwgXCJzXCI6IDEwMCwgXCJsXCI6IDU5fSxcbiAgICBcImdyZXlcIjoge1wiclwiOiAxMjgsIFwiZ1wiOiAxMjgsIFwiYlwiOiAxMjgsIFwiaFwiOiAwLCBcInNcIjogMCwgXCJsXCI6IDUwfSxcbiAgICBcImhvbmV5ZGV3XCI6IHtcInJcIjogMjQwLCBcImdcIjogMjU1LCBcImJcIjogMjQwLCBcImhcIjogMTIwLCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwiaG90cGlua1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDEwNSwgXCJiXCI6IDE4MCwgXCJoXCI6IDMzMCwgXCJzXCI6IDEwMCwgXCJsXCI6IDcxfSxcbiAgICBcImluZGlhbnJlZFwiOiB7XCJyXCI6IDIwNSwgXCJnXCI6IDkyLCBcImJcIjogOTIsIFwiaFwiOiAwLCBcInNcIjogNTMsIFwibFwiOiA1OH0sXG4gICAgXCJpbmRpZ29cIjoge1wiclwiOiA3NSwgXCJnXCI6IDAsIFwiYlwiOiAxMzAsIFwiaFwiOiAyNzUsIFwic1wiOiAxMDAsIFwibFwiOiAyNX0sXG4gICAgXCJpdm9yeVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI0MCwgXCJoXCI6IDYwLCBcInNcIjogMTAwLCBcImxcIjogOTd9LFxuICAgIFwia2hha2lcIjoge1wiclwiOiAyNDAsIFwiZ1wiOiAyMzAsIFwiYlwiOiAxNDAsIFwiaFwiOiA1NCwgXCJzXCI6IDc3LCBcImxcIjogNzV9LFxuICAgIFwibGF2ZW5kZXJcIjoge1wiclwiOiAyMzAsIFwiZ1wiOiAyMzAsIFwiYlwiOiAyNTAsIFwiaFwiOiAyNDAsIFwic1wiOiA2NywgXCJsXCI6IDk0fSxcbiAgICBcImxhdmVuZGVyYmx1c2hcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNDAsIFwiYlwiOiAyNDUsIFwiaFwiOiAzNDAsIFwic1wiOiAxMDAsIFwibFwiOiA5N30sXG4gICAgXCJsYXduZ3JlZW5cIjoge1wiclwiOiAxMjQsIFwiZ1wiOiAyNTIsIFwiYlwiOiAwLCBcImhcIjogOTAsIFwic1wiOiAxMDAsIFwibFwiOiA0OX0sXG4gICAgXCJsZW1vbmNoaWZmb25cIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyNTAsIFwiYlwiOiAyMDUsIFwiaFwiOiA1NCwgXCJzXCI6IDEwMCwgXCJsXCI6IDkwfSxcbiAgICBcImxpZ2h0Ymx1ZVwiOiB7XCJyXCI6IDE3MywgXCJnXCI6IDIxNiwgXCJiXCI6IDIzMCwgXCJoXCI6IDE5NSwgXCJzXCI6IDUzLCBcImxcIjogNzl9LFxuICAgIFwibGlnaHRjb3JhbFwiOiB7XCJyXCI6IDI0MCwgXCJnXCI6IDEyOCwgXCJiXCI6IDEyOCwgXCJoXCI6IDAsIFwic1wiOiA3OSwgXCJsXCI6IDcyfSxcbiAgICBcImxpZ2h0Y3lhblwiOiB7XCJyXCI6IDIyNCwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJoXCI6IDE4MCwgXCJzXCI6IDEwMCwgXCJsXCI6IDk0fSxcbiAgICBcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IHtcInJcIjogMjUwLCBcImdcIjogMjUwLCBcImJcIjogMjEwLCBcImhcIjogNjAsIFwic1wiOiA4MCwgXCJsXCI6IDkwfSxcbiAgICBcImxpZ2h0Z3JheVwiOiB7XCJyXCI6IDIxMSwgXCJnXCI6IDIxMSwgXCJiXCI6IDIxMSwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogODN9LFxuICAgIFwibGlnaHRncmVlblwiOiB7XCJyXCI6IDE0NCwgXCJnXCI6IDIzOCwgXCJiXCI6IDE0NCwgXCJoXCI6IDEyMCwgXCJzXCI6IDczLCBcImxcIjogNzV9LFxuICAgIFwibGlnaHRncmV5XCI6IHtcInJcIjogMjExLCBcImdcIjogMjExLCBcImJcIjogMjExLCBcImhcIjogMCwgXCJzXCI6IDAsIFwibFwiOiA4M30sXG4gICAgXCJsaWdodHBpbmtcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxODIsIFwiYlwiOiAxOTMsIFwiaFwiOiAzNTEsIFwic1wiOiAxMDAsIFwibFwiOiA4Nn0sXG4gICAgXCJsaWdodHNhbG1vblwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDE2MCwgXCJiXCI6IDEyMiwgXCJoXCI6IDE3LCBcInNcIjogMTAwLCBcImxcIjogNzR9LFxuICAgIFwibGlnaHRzZWFncmVlblwiOiB7XCJyXCI6IDMyLCBcImdcIjogMTc4LCBcImJcIjogMTcwLCBcImhcIjogMTc3LCBcInNcIjogNzAsIFwibFwiOiA0MX0sXG4gICAgXCJsaWdodHNreWJsdWVcIjoge1wiclwiOiAxMzUsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyNTAsIFwiaFwiOiAyMDMsIFwic1wiOiA5MiwgXCJsXCI6IDc1fSxcbiAgICBcImxpZ2h0c2xhdGVncmF5XCI6IHtcInJcIjogMTE5LCBcImdcIjogMTM2LCBcImJcIjogMTUzLCBcImhcIjogMjEwLCBcInNcIjogMTQsIFwibFwiOiA1M30sXG4gICAgXCJsaWdodHNsYXRlZ3JleVwiOiB7XCJyXCI6IDExOSwgXCJnXCI6IDEzNiwgXCJiXCI6IDE1MywgXCJoXCI6IDIxMCwgXCJzXCI6IDE0LCBcImxcIjogNTN9LFxuICAgIFwibGlnaHRzdGVlbGJsdWVcIjoge1wiclwiOiAxNzYsIFwiZ1wiOiAxOTYsIFwiYlwiOiAyMjIsIFwiaFwiOiAyMTQsIFwic1wiOiA0MSwgXCJsXCI6IDc4fSxcbiAgICBcImxpZ2h0eWVsbG93XCI6IHtcInJcIjogMjU1LCBcImdcIjogMjU1LCBcImJcIjogMjI0LCBcImhcIjogNjAsIFwic1wiOiAxMDAsIFwibFwiOiA5NH0sXG4gICAgXCJsaW1lZ3JlZW5cIjoge1wiclwiOiA1MCwgXCJnXCI6IDIwNSwgXCJiXCI6IDUwLCBcImhcIjogMTIwLCBcInNcIjogNjEsIFwibFwiOiA1MH0sXG4gICAgXCJsaW5lblwiOiB7XCJyXCI6IDI1MCwgXCJnXCI6IDI0MCwgXCJiXCI6IDIzMCwgXCJoXCI6IDMwLCBcInNcIjogNjcsIFwibFwiOiA5NH0sXG4gICAgXCJtYWdlbnRhXCI6IHtcInJcIjogMjU1LFwiZ1wiOiAwLFwiYlwiOiAyNTUsIFwiaFwiOiAxNyxcInNcIjogMTAwLFwibFwiOiA3NH0sXG4gICAgXCJtZWRpdW1hcXVhbWFyaW5lXCI6IHtcInJcIjogMTAyLCBcImdcIjogMjA1LCBcImJcIjogMTcwLCBcImhcIjogMTYwLCBcInNcIjogNTEsIFwibFwiOiA2MH0sXG4gICAgXCJtZWRpdW1ibHVlXCI6IHtcInJcIjogMCwgXCJnXCI6IDAsIFwiYlwiOiAyMDUsIFwiaFwiOiAyNDAsIFwic1wiOiAxMDAsIFwibFwiOiA0MH0sXG4gICAgXCJtZWRpdW1vcmNoaWRcIjoge1wiclwiOiAxODYsIFwiZ1wiOiA4NSwgXCJiXCI6IDIxMSwgXCJoXCI6IDI4OCwgXCJzXCI6IDU5LCBcImxcIjogNTh9LFxuICAgIFwibWVkaXVtcHVycGxlXCI6IHtcInJcIjogMTQ3LCBcImdcIjogMTEyLCBcImJcIjogMjE5LCBcImhcIjogMjYwLCBcInNcIjogNjAsIFwibFwiOiA2NX0sXG4gICAgXCJtZWRpdW1zZWFncmVlblwiOiB7XCJyXCI6IDYwLCBcImdcIjogMTc5LCBcImJcIjogMTEzLCBcImhcIjogMTQ3LCBcInNcIjogNTAsIFwibFwiOiA0N30sXG4gICAgXCJtZWRpdW1zbGF0ZWJsdWVcIjoge1wiclwiOiAxMjMsIFwiZ1wiOiAxMDQsIFwiYlwiOiAyMzgsIFwiaFwiOiAyNDksIFwic1wiOiA4MCwgXCJsXCI6IDY3fSxcbiAgICBcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IHtcInJcIjogMCwgXCJnXCI6IDI1MCwgXCJiXCI6IDE1NCwgXCJoXCI6IDE1NywgXCJzXCI6IDEwMCwgXCJsXCI6IDQ5fSxcbiAgICBcIm1lZGl1bXR1cnF1b2lzZVwiOiB7XCJyXCI6IDcyLCBcImdcIjogMjA5LCBcImJcIjogMjA0LCBcImhcIjogMTc4LCBcInNcIjogNjAsIFwibFwiOiA1NX0sXG4gICAgXCJtZWRpdW12aW9sZXRyZWRcIjoge1wiclwiOiAxOTksIFwiZ1wiOiAyMSwgXCJiXCI6IDEzMywgXCJoXCI6IDMyMiwgXCJzXCI6IDgxLCBcImxcIjogNDN9LFxuICAgIFwibWlkbmlnaHRibHVlXCI6IHtcInJcIjogMjUsIFwiZ1wiOiAyNSwgXCJiXCI6IDExMiwgXCJoXCI6IDI0MCwgXCJzXCI6IDY0LCBcImxcIjogMjd9LFxuICAgIFwibWludGNyZWFtXCI6IHtcInJcIjogMjQ1LCBcImdcIjogMjU1LCBcImJcIjogMjUwLCBcImhcIjogMTUwLCBcInNcIjogMTAwLCBcImxcIjogOTh9LFxuICAgIFwibWlzdHlyb3NlXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjI4LCBcImJcIjogMjI1LCBcImhcIjogNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDk0fSxcbiAgICBcIm1vY2Nhc2luXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjI4LCBcImJcIjogMTgxLCBcImhcIjogMzgsIFwic1wiOiAxMDAsIFwibFwiOiA4NX0sXG4gICAgXCJuYXZham93aGl0ZVwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIyMiwgXCJiXCI6IDE3MywgXCJoXCI6IDM2LCBcInNcIjogMTAwLCBcImxcIjogODR9LFxuICAgIFwib2xkbGFjZVwiOiB7XCJyXCI6IDI1MywgXCJnXCI6IDI0NSwgXCJiXCI6IDIzMCwgXCJoXCI6IDM5LCBcInNcIjogODUsIFwibFwiOiA5NX0sXG4gICAgXCJvbGl2ZWRyYWJcIjoge1wiclwiOiAxMDcsIFwiZ1wiOiAxNDIsIFwiYlwiOiAzNSwgXCJoXCI6IDgwLCBcInNcIjogNjAsIFwibFwiOiAzNX0sXG4gICAgXCJvcmFuZ2VyZWRcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiA2OSwgXCJiXCI6IDAsIFwiaFwiOiAxNiwgXCJzXCI6IDEwMCwgXCJsXCI6IDUwfSxcbiAgICBcIm9yY2hpZFwiOiB7XCJyXCI6IDIxOCwgXCJnXCI6IDExMiwgXCJiXCI6IDIxNCwgXCJoXCI6IDMwMiwgXCJzXCI6IDU5LCBcImxcIjogNjV9LFxuICAgIFwicGFsZWdvbGRlbnJvZFwiOiB7XCJyXCI6IDIzOCwgXCJnXCI6IDIzMiwgXCJiXCI6IDE3MCwgXCJoXCI6IDU1LCBcInNcIjogNjcsIFwibFwiOiA4MH0sXG4gICAgXCJwYWxlZ3JlZW5cIjoge1wiclwiOiAxNTIsIFwiZ1wiOiAyNTEsIFwiYlwiOiAxNTIsIFwiaFwiOiAxMjAsIFwic1wiOiA5MywgXCJsXCI6IDc5fSxcbiAgICBcInBhbGV0dXJxdW9pc2VcIjoge1wiclwiOiAxNzUsIFwiZ1wiOiAyMzgsIFwiYlwiOiAyMzgsIFwiaFwiOiAxODAsIFwic1wiOiA2NSwgXCJsXCI6IDgxfSxcbiAgICBcInBhbGV2aW9sZXRyZWRcIjoge1wiclwiOiAyMTksIFwiZ1wiOiAxMTIsIFwiYlwiOiAxNDcsIFwiaFwiOiAzNDAsIFwic1wiOiA2MCwgXCJsXCI6IDY1fSxcbiAgICBcInBhcGF5YXdoaXBcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAyMzksIFwiYlwiOiAyMTMsIFwiaFwiOiAzNywgXCJzXCI6IDEwMCwgXCJsXCI6IDkyfSxcbiAgICBcInBlYWNocHVmZlwiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDIxOCwgXCJiXCI6IDE4NSwgXCJoXCI6IDI4LCBcInNcIjogMTAwLCBcImxcIjogODZ9LFxuICAgIFwicGVydVwiOiB7XCJyXCI6IDIwNSwgXCJnXCI6IDEzMywgXCJiXCI6IDYzLCBcImhcIjogMzAsIFwic1wiOiA1OSwgXCJsXCI6IDUzfSxcbiAgICBcInBpbmtcIjoge1wiclwiOiAyNTUsIFwiZ1wiOiAxOTIsIFwiYlwiOiAyMDMsIFwiaFwiOiAzNTAsIFwic1wiOiAxMDAsIFwibFwiOiA4OH0sXG4gICAgXCJwbHVtXCI6IHtcInJcIjogMjIxLCBcImdcIjogMTYwLCBcImJcIjogMjIxLCBcImhcIjogMzAwLCBcInNcIjogNDcsIFwibFwiOiA3NX0sXG4gICAgXCJwb3dkZXJibHVlXCI6IHtcInJcIjogMTc2LCBcImdcIjogMjI0LCBcImJcIjogMjMwLCBcImhcIjogMTg3LCBcInNcIjogNTIsIFwibFwiOiA4MH0sXG4gICAgXCJyb3N5YnJvd25cIjoge1wiclwiOiAxODgsIFwiZ1wiOiAxNDMsIFwiYlwiOiAxNDMsIFwiaFwiOiAwLCBcInNcIjogMjUsIFwibFwiOiA2NX0sXG4gICAgXCJyb3lhbGJsdWVcIjoge1wiclwiOiA2NSwgXCJnXCI6IDEwNSwgXCJiXCI6IDIyNSwgXCJoXCI6IDIyNSwgXCJzXCI6IDczLCBcImxcIjogNTd9LFxuICAgIFwic2FkZGxlYnJvd25cIjoge1wiclwiOiAxMzksIFwiZ1wiOiA2OSwgXCJiXCI6IDE5LCBcImhcIjogMjUsIFwic1wiOiA3NiwgXCJsXCI6IDMxfSxcbiAgICBcInNhbG1vblwiOiB7XCJyXCI6IDI1MCwgXCJnXCI6IDEyOCwgXCJiXCI6IDExNCwgXCJoXCI6IDYsIFwic1wiOiA5MywgXCJsXCI6IDcxfSxcbiAgICBcInNhbmR5YnJvd25cIjoge1wiclwiOiAyNDQsIFwiZ1wiOiAxNjQsIFwiYlwiOiA5NiwgXCJoXCI6IDI4LCBcInNcIjogODcsIFwibFwiOiA2N30sXG4gICAgXCJzZWFncmVlblwiOiB7XCJyXCI6IDQ2LCBcImdcIjogMTM5LCBcImJcIjogODcsIFwiaFwiOiAxNDYsIFwic1wiOiA1MCwgXCJsXCI6IDM2fSxcbiAgICBcInNlYXNoZWxsXCI6IHtcInJcIjogMjU1LCBcImdcIjogMjQ1LCBcImJcIjogMjM4LCBcImhcIjogMjUsIFwic1wiOiAxMDAsIFwibFwiOiA5N30sXG4gICAgXCJzaWVubmFcIjoge1wiclwiOiAxNjAsIFwiZ1wiOiA4MiwgXCJiXCI6IDQ1LCBcImhcIjogMTksIFwic1wiOiA1NiwgXCJsXCI6IDQwfSxcbiAgICBcInNreWJsdWVcIjoge1wiclwiOiAxMzUsIFwiZ1wiOiAyMDYsIFwiYlwiOiAyMzUsIFwiaFwiOiAxOTcsIFwic1wiOiA3MSwgXCJsXCI6IDczfSxcbiAgICBcInNsYXRlYmx1ZVwiOiB7XCJyXCI6IDEwNiwgXCJnXCI6IDkwLCBcImJcIjogMjA1LCBcImhcIjogMjQ4LCBcInNcIjogNTMsIFwibFwiOiA1OH0sXG4gICAgXCJzbGF0ZWdyYXlcIjoge1wiclwiOiAxMTIsIFwiZ1wiOiAxMjgsIFwiYlwiOiAxNDQsIFwiaFwiOiAyMTAsIFwic1wiOiAxMywgXCJsXCI6IDUwfSxcbiAgICBcInNsYXRlZ3JleVwiOiB7XCJyXCI6IDExMiwgXCJnXCI6IDEyOCwgXCJiXCI6IDE0NCwgXCJoXCI6IDIxMCwgXCJzXCI6IDEzLCBcImxcIjogNTB9LFxuICAgIFwic25vd1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDI1MCwgXCJiXCI6IDI1MCwgXCJoXCI6IDAsIFwic1wiOiAxMDAsIFwibFwiOiA5OX0sXG4gICAgXCJzcHJpbmdncmVlblwiOiB7XCJyXCI6IDAsIFwiZ1wiOiAyNTUsIFwiYlwiOiAxMjcsIFwiaFwiOiAxNTAsIFwic1wiOiAxMDAsIFwibFwiOiA1MH0sXG4gICAgXCJzdGVlbGJsdWVcIjoge1wiclwiOiA3MCwgXCJnXCI6IDEzMCwgXCJiXCI6IDE4MCwgXCJoXCI6IDIwNywgXCJzXCI6IDQ0LCBcImxcIjogNDl9LFxuICAgIFwidGFuXCI6IHtcInJcIjogMjEwLCBcImdcIjogMTgwLCBcImJcIjogMTQwLCBcImhcIjogMzQsIFwic1wiOiA0NCwgXCJsXCI6IDY5fSxcbiAgICBcInRoaXN0bGVcIjoge1wiclwiOiAyMTYsIFwiZ1wiOiAxOTEsIFwiYlwiOiAyMTYsIFwiaFwiOiAzMDAsIFwic1wiOiAyNCwgXCJsXCI6IDgwfSxcbiAgICBcInRvbWF0b1wiOiB7XCJyXCI6IDI1NSwgXCJnXCI6IDk5LCBcImJcIjogNzEsIFwiaFwiOiA5LCBcInNcIjogMTAwLCBcImxcIjogNjR9LFxuICAgIFwidHVycXVvaXNlXCI6IHtcInJcIjogNjQsIFwiZ1wiOiAyMjQsIFwiYlwiOiAyMDgsIFwiaFwiOiAxNzQsIFwic1wiOiA3MiwgXCJsXCI6IDU2fSxcbiAgICBcInZpb2xldFwiOiB7XCJyXCI6IDIzOCwgXCJnXCI6IDEzMCwgXCJiXCI6IDIzOCwgXCJoXCI6IDMwMCwgXCJzXCI6IDc2LCBcImxcIjogNzJ9LFxuICAgIFwid2hlYXRcIjoge1wiclwiOiAyNDUsIFwiZ1wiOiAyMjIsIFwiYlwiOiAxNzksIFwiaFwiOiAzOSwgXCJzXCI6IDc3LCBcImxcIjogODN9LFxuICAgIFwid2hpdGVzbW9rZVwiOiB7XCJyXCI6IDI0NSwgXCJnXCI6IDI0NSwgXCJiXCI6IDI0NSwgXCJoXCI6IDAsIFwic1wiOiAwLCBcImxcIjogOTZ9LFxuICAgIFwieWVsbG93Z3JlZW5cIjoge1wiclwiOiAxNTQsIFwiZ1wiOiAyMDUsIFwiYlwiOiA1MCwgXCJoXCI6IDgwLCBcInNcIjogNjEsIFwibFwiOiA1MH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3VyO1xuXG59LHt9XX0se30sWzFdKVxuKDEpXG59KTtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHdoZW4gdXNlZCBpbiBub2RlLCB0aGlzIHdpbGwgYWN0dWFsbHkgbG9hZCB0aGUgdXRpbCBtb2R1bGUgd2UgZGVwZW5kIG9uXG4vLyB2ZXJzdXMgbG9hZGluZyB0aGUgYnVpbHRpbiB1dGlsIG1vZHVsZSBhcyBoYXBwZW5zIG90aGVyd2lzZVxuLy8gdGhpcyBpcyBhIGJ1ZyBpbiBub2RlIG1vZHVsZSBsb2FkaW5nIGFzIGZhciBhcyBJIGFtIGNvbmNlcm5lZFxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IHN0YWNrU3RhcnRGdW5jdGlvbi5uYW1lO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiBrZXlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4hZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5saW5lYXJhbGdlYT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNCBFYmVuIFBhY2t3b29kLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogTUlUIExpY2Vuc2VcbiAqXG4gKi9cblxudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4vdmVjdG9yLmpzJyk7XG52YXIgTWF0cml4ID0gX2RlcmVxXygnLi9tYXRyaXguanMnKTtcblxudmFyIG1hdGggPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5tYXRoLlZlY3RvciA9IFZlY3Rvcjtcbm1hdGguTWF0cml4ID0gTWF0cml4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hdGg7XG5cbn0se1wiLi9tYXRyaXguanNcIjoyLFwiLi92ZWN0b3IuanNcIjozfV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKiogXG4gKiA0eDQgbWF0cml4LlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIE1hdHJpeCgpe1xuICAgIGZvciAodmFyIGk9MDsgaTwxNjsgaSsrKXtcbiAgICAgICAgdGhpc1tpXSA9IDA7XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoID0gMTY7XG59XG4vKipcbiAqIENvbXBhcmUgbWF0cml4IHdpdGggc2VsZiBmb3IgZXF1YWxpdHkuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5NYXRyaXgucHJvdG90eXBlLmVxdWFsID0gZnVuY3Rpb24obWF0cml4KXtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIGlmICh0aGlzW2ldICE9PSBtYXRyaXhbaV0pe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcbi8qKlxuICogQWRkIG1hdHJpeCB0byBzZWxmLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG1hdHJpeCl7XG4gICAgdmFyIG5ld19tYXRyaXggPSBuZXcgTWF0cml4KCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgICBuZXdfbWF0cml4W2ldID0gdGhpc1tpXSArIG1hdHJpeFtpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld19tYXRyaXg7XG59O1xuLyoqXG4gKiBTdWJ0cmFjdCBtYXRyaXggZnJvbSBzZWxmLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24obWF0cml4KXtcbiAgICB2YXIgbmV3X21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIG5ld19tYXRyaXhbaV0gPSB0aGlzW2ldIC0gbWF0cml4W2ldO1xuICAgIH1cbiAgICByZXR1cm4gbmV3X21hdHJpeDtcbn07XG4vKipcbiAqIE11bHRpcGx5IHNlbGYgYnkgc2NhbGFyLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtudW1iZXJ9IHNjYWxhclxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucHJvdG90eXBlLm11bHRpcGx5U2NhbGFyID0gZnVuY3Rpb24oc2NhbGFyKXtcbiAgICB2YXIgbmV3X21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIG5ld19tYXRyaXhbaV0gPSB0aGlzW2ldICogc2NhbGFyO1xuICAgIH1cbiAgICByZXR1cm4gbmV3X21hdHJpeDtcbn07XG4vKipcbiAqIE11bHRpcGx5IHNlbGYgYnkgbWF0cml4LlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24obWF0cml4KXtcbiAgICB2YXIgbmV3X21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICBuZXdfbWF0cml4WzBdID0gKHRoaXNbMF0gKiBtYXRyaXhbMF0pICsgKHRoaXNbMV0gKiBtYXRyaXhbNF0pICsgKHRoaXNbMl0gKiBtYXRyaXhbOF0pICsgKHRoaXNbM10gKiBtYXRyaXhbMTJdKTtcbiAgICBuZXdfbWF0cml4WzFdID0gKHRoaXNbMF0gKiBtYXRyaXhbMV0pICsgKHRoaXNbMV0gKiBtYXRyaXhbNV0pICsgKHRoaXNbMl0gKiBtYXRyaXhbOV0pICsgKHRoaXNbM10gKiBtYXRyaXhbMTNdKTtcbiAgICBuZXdfbWF0cml4WzJdID0gKHRoaXNbMF0gKiBtYXRyaXhbMl0pICsgKHRoaXNbMV0gKiBtYXRyaXhbNl0pICsgKHRoaXNbMl0gKiBtYXRyaXhbMTBdKSArICh0aGlzWzNdICogbWF0cml4WzE0XSk7XG4gICAgbmV3X21hdHJpeFszXSA9ICh0aGlzWzBdICogbWF0cml4WzNdKSArICh0aGlzWzFdICogbWF0cml4WzddKSArICh0aGlzWzJdICogbWF0cml4WzExXSkgKyAodGhpc1szXSAqIG1hdHJpeFsxNV0pO1xuICAgIG5ld19tYXRyaXhbNF0gPSAodGhpc1s0XSAqIG1hdHJpeFswXSkgKyAodGhpc1s1XSAqIG1hdHJpeFs0XSkgKyAodGhpc1s2XSAqIG1hdHJpeFs4XSkgKyAodGhpc1s3XSAqIG1hdHJpeFsxMl0pO1xuICAgIG5ld19tYXRyaXhbNV0gPSAodGhpc1s0XSAqIG1hdHJpeFsxXSkgKyAodGhpc1s1XSAqIG1hdHJpeFs1XSkgKyAodGhpc1s2XSAqIG1hdHJpeFs5XSkgKyAodGhpc1s3XSAqIG1hdHJpeFsxM10pO1xuICAgIG5ld19tYXRyaXhbNl0gPSAodGhpc1s0XSAqIG1hdHJpeFsyXSkgKyAodGhpc1s1XSAqIG1hdHJpeFs2XSkgKyAodGhpc1s2XSAqIG1hdHJpeFsxMF0pICsgKHRoaXNbN10gKiBtYXRyaXhbMTRdKTtcbiAgICBuZXdfbWF0cml4WzddID0gKHRoaXNbNF0gKiBtYXRyaXhbM10pICsgKHRoaXNbNV0gKiBtYXRyaXhbN10pICsgKHRoaXNbNl0gKiBtYXRyaXhbMTFdKSArICh0aGlzWzddICogbWF0cml4WzE1XSk7XG4gICAgbmV3X21hdHJpeFs4XSA9ICh0aGlzWzhdICogbWF0cml4WzBdKSArICh0aGlzWzldICogbWF0cml4WzRdKSArICh0aGlzWzEwXSAqIG1hdHJpeFs4XSkgKyAodGhpc1sxMV0gKiBtYXRyaXhbMTJdKTtcbiAgICBuZXdfbWF0cml4WzldID0gKHRoaXNbOF0gKiBtYXRyaXhbMV0pICsgKHRoaXNbOV0gKiBtYXRyaXhbNV0pICsgKHRoaXNbMTBdICogbWF0cml4WzldKSArICh0aGlzWzExXSAqIG1hdHJpeFsxM10pO1xuICAgIG5ld19tYXRyaXhbMTBdID0gKHRoaXNbOF0gKiBtYXRyaXhbMl0pICsgKHRoaXNbOV0gKiBtYXRyaXhbNl0pICsgKHRoaXNbMTBdICogbWF0cml4WzEwXSkgKyAodGhpc1sxMV0gKiBtYXRyaXhbMTRdKTtcbiAgICBuZXdfbWF0cml4WzExXSA9ICh0aGlzWzhdICogbWF0cml4WzNdKSArICh0aGlzWzldICogbWF0cml4WzddKSArICh0aGlzWzEwXSAqIG1hdHJpeFsxMV0pICsgKHRoaXNbMTFdICogbWF0cml4WzE1XSk7XG4gICAgbmV3X21hdHJpeFsxMl0gPSAodGhpc1sxMl0gKiBtYXRyaXhbMF0pICsgKHRoaXNbMTNdICogbWF0cml4WzRdKSArICh0aGlzWzE0XSAqIG1hdHJpeFs4XSkgKyAodGhpc1sxNV0gKiBtYXRyaXhbMTJdKTtcbiAgICBuZXdfbWF0cml4WzEzXSA9ICh0aGlzWzEyXSAqIG1hdHJpeFsxXSkgKyAodGhpc1sxM10gKiBtYXRyaXhbNV0pICsgKHRoaXNbMTRdICogbWF0cml4WzldKSArICh0aGlzWzE1XSAqIG1hdHJpeFsxM10pO1xuICAgIG5ld19tYXRyaXhbMTRdID0gKHRoaXNbMTJdICogbWF0cml4WzJdKSArICh0aGlzWzEzXSAqIG1hdHJpeFs2XSkgKyAodGhpc1sxNF0gKiBtYXRyaXhbMTBdKSArICh0aGlzWzE1XSAqIG1hdHJpeFsxNF0pO1xuICAgIG5ld19tYXRyaXhbMTVdID0gKHRoaXNbMTJdICogbWF0cml4WzNdKSArICh0aGlzWzEzXSAqIG1hdHJpeFs3XSkgKyAodGhpc1sxNF0gKiBtYXRyaXhbMTFdKSArICh0aGlzWzE1XSAqIG1hdHJpeFsxNV0pO1xuICAgIHJldHVybiBuZXdfbWF0cml4O1xufTtcbi8qKlxuICogTmVnYXRlIHNlbGYuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge251bWJlcn0gc2NhbGFyXG4gKiBAcmV0dXJuIHtNYXRyaXh9XG4gKi9cbk1hdHJpeC5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbmV3X21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIG5ld19tYXRyaXhbaV0gPSAtdGhpc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld19tYXRyaXg7XG59O1xuLyoqXG4gKiBUcmFuc3Bvc2Ugc2VsZi5cbiAqIEBtZXRob2RcbiAqIEByZXR1cm4ge01hdHJpeH1cbiAqL1xuTWF0cml4LnByb3RvdHlwZS50cmFuc3Bvc2UgPSBmdW5jdGlvbigpe1xuICAgIHZhciBuZXdfbWF0cml4ID0gbmV3IE1hdHJpeCgpO1xuICAgIG5ld19tYXRyaXhbMF0gPSB0aGlzWzBdO1xuICAgIG5ld19tYXRyaXhbMV0gPSB0aGlzWzRdO1xuICAgIG5ld19tYXRyaXhbMl0gPSB0aGlzWzhdO1xuICAgIG5ld19tYXRyaXhbM10gPSB0aGlzWzEyXTtcbiAgICBuZXdfbWF0cml4WzRdID0gdGhpc1sxXTtcbiAgICBuZXdfbWF0cml4WzVdID0gdGhpc1s1XTtcbiAgICBuZXdfbWF0cml4WzZdID0gdGhpc1s5XTtcbiAgICBuZXdfbWF0cml4WzddID0gdGhpc1sxM107XG4gICAgbmV3X21hdHJpeFs4XSA9IHRoaXNbMl07XG4gICAgbmV3X21hdHJpeFs5XSA9IHRoaXNbNl07XG4gICAgbmV3X21hdHJpeFsxMF0gPSB0aGlzWzEwXTtcbiAgICBuZXdfbWF0cml4WzExXSA9IHRoaXNbMTRdO1xuICAgIG5ld19tYXRyaXhbMTJdID0gdGhpc1szXTtcbiAgICBuZXdfbWF0cml4WzEzXSA9IHRoaXNbN107XG4gICAgbmV3X21hdHJpeFsxNF0gPSB0aGlzWzExXTtcbiAgICBuZXdfbWF0cml4WzE1XSA9IHRoaXNbMTVdO1xuICAgIHJldHVybiBuZXdfbWF0cml4O1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcm90YXRpb24gbWF0cml4LCByb3RhdGluZyBieSB0aGV0YSBhcm91bmQgdGhlIHgtYXhpc1xuICogQG1ldGhvZFxuICogQHN0YXRpY1xuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhXG4gKiBAcmV0dXJuIHtNYXRyaXh9XG4gKi9cbk1hdHJpeC5yb3RhdGlvblggPSBmdW5jdGlvbih0aGV0YSl7XG4gICAgdmFyIHJvdGF0aW9uX21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICB2YXIgY29zID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW4gPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcm90YXRpb25fbWF0cml4WzBdID0gMTtcbiAgICByb3RhdGlvbl9tYXRyaXhbNV0gPSBjb3M7XG4gICAgcm90YXRpb25fbWF0cml4WzZdID0gLXNpbjtcbiAgICByb3RhdGlvbl9tYXRyaXhbOV0gPSBzaW47XG4gICAgcm90YXRpb25fbWF0cml4WzEwXSA9IGNvcztcbiAgICByb3RhdGlvbl9tYXRyaXhbMTVdID0gMTtcbiAgICByZXR1cm4gcm90YXRpb25fbWF0cml4O1xufTtcbi8qKlxuICogQ29uc3RydWN0cyBhIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRpbmcgYnkgdGhldGEgYXJvdW5kIHRoZSB5LWF4aXNcbiAqIEBtZXRob2RcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YVxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucm90YXRpb25ZID0gZnVuY3Rpb24odGhldGEpe1xuICAgIHZhciByb3RhdGlvbl9tYXRyaXggPSBuZXcgTWF0cml4KCk7XG4gICAgdmFyIGNvcyA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJvdGF0aW9uX21hdHJpeFswXSA9IGNvcztcbiAgICByb3RhdGlvbl9tYXRyaXhbMl0gPSBzaW47XG4gICAgcm90YXRpb25fbWF0cml4WzVdID0gMTtcbiAgICByb3RhdGlvbl9tYXRyaXhbOF0gPSAtc2luO1xuICAgIHJvdGF0aW9uX21hdHJpeFsxMF0gPSBjb3M7XG4gICAgcm90YXRpb25fbWF0cml4WzE1XSA9IDE7XG4gICAgcmV0dXJuIHJvdGF0aW9uX21hdHJpeDtcbn07XG4vKipcbiAqIENvbnN0cnVjdHMgYSByb3RhdGlvbiBtYXRyaXgsIHJvdGF0aW5nIGJ5IHRoZXRhIGFyb3VuZCB0aGUgei1heGlzXG4gKiBAbWV0aG9kXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGFcbiAqIEByZXR1cm4ge01hdHJpeH1cbiAqL1xuTWF0cml4LnJvdGF0aW9uWiA9IGZ1bmN0aW9uKHRoZXRhKXtcbiAgICB2YXIgcm90YXRpb25fbWF0cml4ID0gbmV3IE1hdHJpeCgpO1xuICAgIHZhciBjb3MgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpbiA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByb3RhdGlvbl9tYXRyaXhbMF0gPSBjb3M7XG4gICAgcm90YXRpb25fbWF0cml4WzFdID0gLXNpbjtcbiAgICByb3RhdGlvbl9tYXRyaXhbNF0gPSBzaW47XG4gICAgcm90YXRpb25fbWF0cml4WzVdID0gY29zO1xuICAgIHJvdGF0aW9uX21hdHJpeFsxMF0gPSAxO1xuICAgIHJvdGF0aW9uX21hdHJpeFsxNV0gPSAxO1xuICAgIHJldHVybiByb3RhdGlvbl9tYXRyaXg7XG59O1xuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcm90YXRpb24gbWF0cml4LCByb3RhdGluZyBieSB0aGV0YSBhcm91bmQgdGhlIGF4aXNcbiAqIEBtZXRob2RcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSB7VmVjdG9yfSBheGlzXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGFcbiAqIEByZXR1cm4ge01hdHJpeH1cbiAqL1xuTWF0cml4LnJvdGF0aW9uQXhpcyA9IGZ1bmN0aW9uKGF4aXMsIHRoZXRhKXtcbiAgICB2YXIgcm90YXRpb25fbWF0cml4ID0gbmV3IE1hdHJpeCgpO1xuICAgIHZhciB1ID0gYXhpcy5ub3JtYWxpemUoKTtcbiAgICB2YXIgc2luID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHZhciBjb3MgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIGNvczEgPSAxLWNvcztcbiAgICB2YXIgdXggPSB1Lng7XG4gICAgdmFyIHV5ID0gdS55O1xuICAgIHZhciB1eiA9IHUuejtcbiAgICB2YXIgeHkgPSB1eCAqIHV5O1xuICAgIHZhciB4eiA9IHV4ICogdXo7XG4gICAgdmFyIHl6ID0gdXkgKiB1ejtcbiAgICByb3RhdGlvbl9tYXRyaXhbMF0gPSBjb3MgKyAoKHV4KnV4KSpjb3MxKTtcbiAgICByb3RhdGlvbl9tYXRyaXhbMV0gPSAoeHkqY29zMSkgLSAodXoqc2luKTtcbiAgICByb3RhdGlvbl9tYXRyaXhbMl0gPSAoeHoqY29zMSkrKHV5KnNpbik7XG4gICAgcm90YXRpb25fbWF0cml4WzRdID0gKHh5KmNvczEpKyh1eipzaW4pO1xuICAgIHJvdGF0aW9uX21hdHJpeFs1XSA9IGNvcysoKHV5KnV5KSpjb3MxKTtcbiAgICByb3RhdGlvbl9tYXRyaXhbNl0gPSAoeXoqY29zMSktKHV4KnNpbik7XG4gICAgcm90YXRpb25fbWF0cml4WzhdID0gKHh6KmNvczEpLSh1eSpzaW4pO1xuICAgIHJvdGF0aW9uX21hdHJpeFs5XSA9ICh5eipjb3MxKSsodXgqc2luKTtcbiAgICByb3RhdGlvbl9tYXRyaXhbMTBdID0gY29zICsgKCh1eip1eikqY29zMSk7XG4gICAgcm90YXRpb25fbWF0cml4WzE1XSA9IDE7XG4gICAgcmV0dXJuIHJvdGF0aW9uX21hdHJpeDtcbn07XG4vKipcbiAqIENvbnN0cnVjdHMgYSByb3RhdGlvbiBtYXRyaXggZnJvbSBwaXRjaCwgeWF3LCBhbmQgcm9sbFxuICogQG1ldGhvZFxuICogQHN0YXRpY1xuICogQHBhcmFtIHtudW1iZXJ9IHBpdGNoXG4gKiBAcGFyYW0ge251bWJlcn0geWF3XG4gKiBAcGFyYW0ge251bWJlcn0gcm9sbFxuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXgucm90YXRpb24gPSBmdW5jdGlvbihwaXRjaCwgeWF3LCByb2xsKXtcbiAgICByZXR1cm4gTWF0cml4LnJvdGF0aW9uWChyb2xsKS5tdWx0aXBseShNYXRyaXgucm90YXRpb25aKHlhdykpLm11bHRpcGx5KE1hdHJpeC5yb3RhdGlvblkocGl0Y2gpKTtcbn07XG4vKipcbiAqIENvbnN0cnVjdHMgYSB0cmFuc2xhdGlvbiBtYXRyaXggZnJvbSB4LCB5LCBhbmQgeiBkaXN0YW5jZXNcbiAqIEBtZXRob2RcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSB7bnVtYmVyfSB4dHJhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSB5dHJhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSB6dHJhbnNcbiAqIEByZXR1cm4ge01hdHJpeH1cbiAqL1xuTWF0cml4LnRyYW5zbGF0aW9uID0gZnVuY3Rpb24oeHRyYW5zLCB5dHJhbnMsIHp0cmFucyl7XG4gICAgdmFyIHRyYW5zbGF0aW9uX21hdHJpeCA9IE1hdHJpeC5pZGVudGl0eSgpO1xuICAgIHRyYW5zbGF0aW9uX21hdHJpeFsxMl0gPSB4dHJhbnM7XG4gICAgdHJhbnNsYXRpb25fbWF0cml4WzEzXSA9IHl0cmFucztcbiAgICB0cmFuc2xhdGlvbl9tYXRyaXhbMTRdID0genRyYW5zO1xuICAgIHJldHVybiB0cmFuc2xhdGlvbl9tYXRyaXg7XG59O1xuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgc2NhbGluZyBtYXRyaXggZnJvbSB4LCB5LCBhbmQgeiBzY2FsZVxuICogQG1ldGhvZFxuICogQHN0YXRpY1xuICogQHBhcmFtIHtudW1iZXJ9IHh0cmFuc1xuICogQHBhcmFtIHtudW1iZXJ9IHl0cmFuc1xuICogQHBhcmFtIHtudW1iZXJ9IHp0cmFuc1xuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXguc2NhbGUgPSBmdW5jdGlvbih4c2NhbGUsIHlzY2FsZSwgenNjYWxlKXtcbiAgICB2YXIgc2NhbGluZ19tYXRyaXggPSBuZXcgTWF0cml4KCk7XG4gICAgc2NhbGluZ19tYXRyaXhbMF0gPSB4c2NhbGU7XG4gICAgc2NhbGluZ19tYXRyaXhbNV0gPSB5c2NhbGU7XG4gICAgc2NhbGluZ19tYXRyaXhbMTBdID0genNjYWxlO1xuICAgIHNjYWxpbmdfbWF0cml4WzE1XSA9IDE7XG4gICAgcmV0dXJuIHNjYWxpbmdfbWF0cml4O1xufTtcbi8qKlxuICogQ29uc3RydWN0cyBhbiBpZGVudGl0eSBtYXRyaXhcbiAqIEBtZXRob2RcbiAqIEBzdGF0aWNcbiAqIEByZXR1cm4ge01hdHJpeH1cbiAqL1xuTWF0cml4LmlkZW50aXR5ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaWRlbnRpdHkgPSBuZXcgTWF0cml4KCk7XG4gICAgaWRlbnRpdHlbMF0gPSAxO1xuICAgIGlkZW50aXR5WzVdID0gMTtcbiAgICBpZGVudGl0eVsxMF0gPSAxO1xuICAgIGlkZW50aXR5WzE1XSA9IDE7XG4gICAgcmV0dXJuIGlkZW50aXR5O1xufTtcbi8qKlxuICogQ29uc3RydWN0cyBhIHplcm8gbWF0cml4XG4gKiBAbWV0aG9kXG4gKiBAc3RhdGljXG4gKiBAcmV0dXJuIHtNYXRyaXh9XG4gKi9cbk1hdHJpeC56ZXJvID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gbmV3IE1hdHJpeCgpO1xufTtcbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBtYXRyaXggZnJvbSBhbiBhcnJheVxuICogQG1ldGhvZFxuICogQHN0YXRpY1xuICogQHJldHVybiB7TWF0cml4fVxuICovXG5NYXRyaXguZnJvbUFycmF5ID0gZnVuY3Rpb24oYXJyKXtcbiAgICB2YXIgbmV3X21hdHJpeCA9IG5ldyBNYXRyaXgoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspe1xuICAgICAgICBuZXdfbWF0cml4W2ldID0gYXJyW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbmV3X21hdHJpeDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWF0cml4O1xufSx7fV0sMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIDNEIHZlY3Rvci5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtudW1iZXJ9IHggeCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0geSB5IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSB6IHogY29vcmRpbmF0ZVxuICovXG5mdW5jdGlvbiBWZWN0b3IoeCwgeSwgeil7XG4gICAgaWYgKHR5cGVvZiB4ID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICB0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgdHlwZW9mIHogPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnN1ZmZpY2llbnQgYXJndW1lbnRzLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgfVxufVxuLyoqXG4gKiBBZGQgdmVjdG9yIHRvIHNlbGYuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge1ZlY3Rvcn0gdmVjdG9yXG4gKiBAcmV0dXJuIHtWZWN0b3J9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odmVjdG9yKXtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2ZWN0b3IueCwgdGhpcy55ICsgdmVjdG9yLnksIHRoaXMueiArIHZlY3Rvci56KTtcbn07XG4vKipcbiAqIFN1YnRyYWN0IHZlY3RvciBmcm9tIHNlbGYuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge1ZlY3Rvcn0gdmVjdG9yXG4gKiBAcmV0dXJuIHtWZWN0b3J9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2ZWN0b3Ipe1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAtIHZlY3Rvci54LCB0aGlzLnkgLSB2ZWN0b3IueSwgdGhpcy56IC0gdmVjdG9yLnopO1xufTtcbi8qKlxuICogQ29tcGFyZSB2ZWN0b3Igd2l0aCBzZWxmIGZvciBlcXVhbGl0eVxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHZlY3RvclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uKHZlY3Rvcil7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gdmVjdG9yLnggJiYgdGhpcy55ID09PSB2ZWN0b3IueSAmJiB0aGlzLnogPT09IHZlY3Rvci56O1xufTtcbi8qKlxuICogRmluZCBhbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHZlY3RvclxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5WZWN0b3IucHJvdG90eXBlLmFuZ2xlID0gZnVuY3Rpb24odmVjdG9yKXtcbiAgICB2YXIgYSA9IHRoaXMubm9ybWFsaXplKCk7XG4gICAgdmFyIGIgPSB2ZWN0b3Iubm9ybWFsaXplKCk7XG4gICAgdmFyIGFtYWcgPSBhLm1hZ25pdHVkZSgpO1xuICAgIHZhciBibWFnID0gYi5tYWduaXR1ZGUoKTtcbiAgICBpZiAoYW1hZyA9PT0gMCB8fCBibWFnID09PSAwKXtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHZhciB0aGV0YSA9IGEuZG90KGIpIC8gKGFtYWcgKiBibWFnICk7XG4gICAgaWYgKHRoZXRhIDwgLTEpIHt0aGV0YSA9IC0xO31cbiAgICBpZiAodGhldGEgPiAxKSB7dGhldGEgPSAxO31cbiAgICByZXR1cm4gTWF0aC5hY29zKHRoZXRhKTtcbn07XG4vKipcbiAqIEZpbmQgdGhlIGNvcyBvZiB0aGUgYW5nbGUgYmV0d2VlbiB0d28gdmVjdG9ycy5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7VmVjdG9yfSB2ZWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS5jb3NBbmdsZSA9IGZ1bmN0aW9uKHZlY3Rvcil7XG4gICAgdmFyIGEgPSB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIHZhciBiID0gdmVjdG9yLm5vcm1hbGl6ZSgpO1xuICAgIHZhciBhbWFnID0gYS5tYWduaXR1ZGUoKTtcbiAgICB2YXIgYm1hZyA9IGIubWFnbml0dWRlKCk7XG4gICAgaWYgKGFtYWcgPT09IDAgfHwgYm1hZyA9PT0gMCl7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICB2YXIgdGhldGEgPSBhLmRvdChiKSAvIChhbWFnICogYm1hZyApO1xuICAgIGlmICh0aGV0YSA8IC0xKSB7dGhldGEgPSAtMTt9XG4gICAgaWYgKHRoZXRhID4gMSkge3RoZXRhID0gMTt9XG4gICAgcmV0dXJuIHRoZXRhO1xufTtcbi8qKlxuICogRmluZCBtYWduaXR1ZGUgb2YgYSB2ZWN0b3IuXG4gKiBAbWV0aG9kXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUubWFnbml0dWRlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh0aGlzLnggKiB0aGlzLngpICsgKHRoaXMueSAqIHRoaXMueSkgKyAodGhpcy56ICogdGhpcy56KSk7XG59O1xuLyoqXG4gKiBGaW5kIG1hZ25pdHVkZSBzcXVhcmVkIG9mIGEgdmVjdG9yLlxuICogQG1ldGhvZFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5WZWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZVNxdWFyZWQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiAodGhpcy54ICogdGhpcy54KSArICh0aGlzLnkgKiB0aGlzLnkpICsgKHRoaXMueiAqIHRoaXMueik7XG59O1xuLyoqXG4gKiBGaW5kIGRvdCBwcm9kdWN0IG9mIHNlbGYgYW5kIHZlY3Rvci5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7VmVjdG9yfSB2ZWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbih2ZWN0b3Ipe1xuICAgIHJldHVybiAodGhpcy54ICogdmVjdG9yLngpICsgKHRoaXMueSAqIHZlY3Rvci55KSArICh0aGlzLnogKiB2ZWN0b3Iueik7XG59O1xuLyoqXG4gKiBGaW5kIGNyb3NzIHByb2R1Y3Qgb2Ygc2VsZiBhbmQgdmVjdG9yLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHZlY3RvclxuICogQHJldHVybiB7VmVjdG9yfVxuICovXG5WZWN0b3IucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24odmVjdG9yKXtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgKHRoaXMueSAqIHZlY3Rvci56KSAtICh0aGlzLnogKiB2ZWN0b3IueSksXG4gICAgICAgICh0aGlzLnogKiB2ZWN0b3IueCkgLSAodGhpcy54ICogdmVjdG9yLnopLFxuICAgICAgICAodGhpcy54ICogdmVjdG9yLnkpIC0gKHRoaXMueSAqIHZlY3Rvci54KVxuICAgICk7XG59O1xuLyoqXG4gKiBOb3JtYWxpemUgc2VsZi5cbiAqIEBtZXRob2RcbiAqIEByZXR1cm4ge1ZlY3Rvcn1cbiAqIEB0aHJvd3Mge1plcm9EaXZpc2lvbkVycm9yfVxuICovXG5WZWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG1hZ25pdHVkZSA9IHRoaXMubWFnbml0dWRlKCk7XG4gICAgaWYgKG1hZ25pdHVkZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gbWFnbml0dWRlLCB0aGlzLnkgLyBtYWduaXR1ZGUsIHRoaXMueiAvIG1hZ25pdHVkZSk7XG59O1xuLyoqXG4gKiBTY2FsZSBzZWxmIGJ5IHNjYWxlLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlXG4gKiBAcmV0dXJuIHtWZWN0b3J9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbihzY2FsZSl7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogc2NhbGUsIHRoaXMueSAqIHNjYWxlLCB0aGlzLnogKiBzY2FsZSk7XG59O1xuLyoqXG4gKiBOZWdhdGVzIHNlbGZcbiAqIEByZXR1cm4ge1ZlY3Rvcn0gW2Rlc2NyaXB0aW9uXVxuICovXG5WZWN0b3IucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueik7XG59O1xuLyoqXG4gKiBQcm9qZWN0IHNlbGYgb250byB2ZWN0b3JcbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7VmVjdG9yfSB2ZWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS52ZWN0b3JQcm9qZWN0aW9uID0gZnVuY3Rpb24odmVjdG9yKXtcbiAgICB2YXIgbWFnID0gdmVjdG9yLm1hZ25pdHVkZSgpO1xuICAgIHJldHVybiB2ZWN0b3Iuc2NhbGUodGhpcy5kb3QodmVjdG9yKSAvIChtYWcgKiBtYWcpKTtcbn07XG4vKipcbiAqIFByb2plY3Qgc2VsZiBvbnRvIHZlY3RvclxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHZlY3RvclxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5WZWN0b3IucHJvdG90eXBlLnNjYWxhclByb2plY3Rpb24gPSBmdW5jdGlvbih2ZWN0b3Ipe1xuICAgIHJldHVybiB0aGlzLmRvdCh2ZWN0b3IpIC8gdmVjdG9yLm1hZ25pdHVkZSgpO1xufTtcbi8qKlxuICogUGVyZm9ybSBsaW5lYXIgdHJhbmZvcm1hdGlvbiBvbiBzZWxmLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNYXRyaXh9IHRyYW5zZm9ybV9tYXRyaXhcbiAqIEByZXR1cm4ge1ZlY3Rvcn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbih0cmFuc2Zvcm1fbWF0cml4KXtcbiAgICB2YXIgeCA9ICh0aGlzLnggKiB0cmFuc2Zvcm1fbWF0cml4WzBdKSArICh0aGlzLnkgKiB0cmFuc2Zvcm1fbWF0cml4WzRdKSArICh0aGlzLnogKiB0cmFuc2Zvcm1fbWF0cml4WzhdKSArIHRyYW5zZm9ybV9tYXRyaXhbMTJdO1xuICAgIHZhciB5ID0gKHRoaXMueCAqIHRyYW5zZm9ybV9tYXRyaXhbMV0pICsgKHRoaXMueSAqIHRyYW5zZm9ybV9tYXRyaXhbNV0pICsgKHRoaXMueiAqIHRyYW5zZm9ybV9tYXRyaXhbOV0pICsgdHJhbnNmb3JtX21hdHJpeFsxM107XG4gICAgdmFyIHogPSAodGhpcy54ICogdHJhbnNmb3JtX21hdHJpeFsyXSkgKyAodGhpcy55ICogdHJhbnNmb3JtX21hdHJpeFs2XSkgKyAodGhpcy56ICogdHJhbnNmb3JtX21hdHJpeFsxMF0pICsgdHJhbnNmb3JtX21hdHJpeFsxNF07XG4gICAgdmFyIHcgPSAodGhpcy54ICogdHJhbnNmb3JtX21hdHJpeFszXSkgKyAodGhpcy55ICogdHJhbnNmb3JtX21hdHJpeFs3XSkgKyAodGhpcy56ICogdHJhbnNmb3JtX21hdHJpeFsxMV0pICsgdHJhbnNmb3JtX21hdHJpeFsxNV07XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoeCAvIHcsIHkgLyB3LCB6IC8gdyk7XG59O1xuLyoqXG4gKiBSb3RhdGUgc2VsZiBieSB0aGV0YSBhcm91bmQgYXhpc1xuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YVxuICogQHJldHVybiB7VmVjdG9yfVxuICovXG5WZWN0b3IucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uKGF4aXMsIHRoZXRhKXtcbiAgICB2YXIgdSA9IGF4aXMubm9ybWFsaXplKCk7XG4gICAgdmFyIHNpbiA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBjb3MxID0gMS1jb3M7XG4gICAgdmFyIHV4ID0gdS54O1xuICAgIHZhciB1eSA9IHUueTtcbiAgICB2YXIgdXogPSB1Lno7XG4gICAgdmFyIHh5ID0gdS54ICogdS55O1xuICAgIHZhciB4eiA9IHUueCAqIHUuejtcbiAgICB2YXIgeXogPSB1LnkgKiB1Lno7XG4gICAgdmFyIHggPSAoKGNvcyArICgodXgqdXgpKmNvczEpKSAqIHRoaXMueCkgKyAoKCh4eSpjb3MxKSAtICh1eipzaW4pKSAqIHRoaXMueSkgKyAoKCh4eipjb3MxKSsodXkqc2luKSkgKiB0aGlzLnopO1xuICAgIHZhciB5ID0gKCgoeHkqY29zMSkrKHV6KnNpbikpICogdGhpcy54KSArICgoY29zKygodXkqdXkpKmNvczEpKSAqIHRoaXMueSkgKyAoKCh5eipjb3MxKS0odXgqc2luKSkgKiB0aGlzLnopO1xuICAgIHZhciB6ID0gKCgoeHoqY29zMSktKHV5KnNpbikpICogdGhpcy54KSArICgoKHl6KmNvczEpKyh1eCpzaW4pKSAqIHRoaXMueSkgKyAoKGNvcyArICgodXgqdXgpKmNvczEpKSAqIHRoaXMueik7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoeCwgeSwgeik7XG59O1xuLyoqXG4gKiBSb3RhdGUgc2VsZiBieSB0aGV0YSBhcm91bmQgeC1heGlzXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGFcbiAqIEByZXR1cm4ge1ZlY3Rvcn1cbiAqL1xuVmVjdG9yLnByb3RvdHlwZS5yb3RhdGVYID0gZnVuY3Rpb24odGhldGEpe1xuICAgIHZhciBzaW4gPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvcyA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IChjb3MgKiB0aGlzLnkpIC0gKHNpbiAqIHRoaXMueik7XG4gICAgdmFyIHogPSAoc2luICogdGhpcy55KSArIChjb3MgKiB0aGlzLnopO1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHgsIHksIHopO1xufTtcbi8qKlxuICogUm90YXRlIHNlbGYgYnkgdGhldGEgYXJvdW5kIHktYXhpc1xuICogQG1ldGhvZFxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhXG4gKiBAcmV0dXJuIHtWZWN0b3J9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUucm90YXRlWSA9IGZ1bmN0aW9uKHRoZXRhKXtcbiAgICB2YXIgc2luID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHZhciBjb3MgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHggPSAoY29zICp0aGlzLngpICsgKHNpbiAqIHRoaXMueik7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSAtKHNpbiAqIHRoaXMueCkgKyAoY29zICogdGhpcy56KTtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih4LCB5LCB6KTtcbn07XG4vKipcbiAqIFJvdGF0ZSBzZWxmIGJ5IHRoZXRhIGFyb3VuZCB6LWF4aXNcbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YVxuICogQHJldHVybiB7VmVjdG9yfVxuICovXG5WZWN0b3IucHJvdG90eXBlLnJvdGF0ZVogPSBmdW5jdGlvbih0aGV0YSl7XG4gICAgdmFyIHNpbiA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB4ID0gKGNvcyAqIHRoaXMueCkgLSAoc2luICogdGhpcy55KTtcbiAgICB2YXIgeSA9IChzaW4gKiB0aGlzLngpICsgKGNvcyAqIHRoaXMueSk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoeCwgeSwgeik7XG59O1xuLyoqXG4gKiBSb3RhdGUgc2VsZiBieSBwaXRjaCwgeWF3LCByb2xsXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge251bWJlcn0gcGl0Y2hcbiAqIEBwYXJhbSB7bnVtYmVyfSB5YXdcbiAqIEBwYXJhbSB7bnVtYmVyfSByb2xsXG4gKiBAcmV0dXJuIHtWZWN0b3J9XG4gKi9cblZlY3Rvci5wcm90b3R5cGUucm90YXRlUGl0Y2hZYXdSb2xsID0gZnVuY3Rpb24ocGl0Y2hfYW1udCwgeWF3X2FtbnQsIHJvbGxfYW1udCkge1xuICAgIHJldHVybiB0aGlzLnJvdGF0ZVgocm9sbF9hbW50KS5yb3RhdGVZKHBpdGNoX2FtbnQpLnJvdGF0ZVooeWF3X2FtbnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG59LHt9XX0se30sWzFdKVxuKDEpXG59KTtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwidmFyIG1hdGggPSByZXF1aXJlKCdsaW5lYXJhbGdlYScpO1xudmFyIFZlY3RvciA9IG1hdGguVmVjdG9yO1xudmFyIE1hdHJpeCA9IG1hdGguTWF0cml4O1xuXG52YXIgVFdPUEkgPSBNYXRoLlBJKjI7XG5cbi8qKiBcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtWZWN0b3J9IHBvc2l0aW9uIENhbWVyYSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7VmVjdG9yfSB0YXJnZXQgICBDYW1lcmFcbiAqL1xuZnVuY3Rpb24gQ2FtZXJhKHdpZHRoLCBoZWlnaHQsIHBvc2l0aW9uKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb24gfHwgbmV3IFZlY3RvcigxLDEsMjApO1xuICAgIHRoaXMudXAgPSBuZXcgVmVjdG9yKDAsIDEsIDApO1xuICAgIHRoaXMucm90YXRpb24gPSB7J3lhdyc6IDAsICdwaXRjaCc6IDAsICdyb2xsJzogMH07XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLm5lYXIgPSAwLjE7XG4gICAgdGhpcy5mYXIgPSAxMDAwO1xuICAgIHRoaXMuZm92ID0gOTA7XG4gICAgdGhpcy5wZXJzcGVjdGl2ZUZvdiA9IHRoaXMuY2FsY3VsYXRlUGVyc3BlY3RpdmVGb3YoKTtcbn1cbi8qKiBAbWV0aG9kICovXG5DYW1lcmEucHJvdG90eXBlLmRpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaW5fcGl0Y2ggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLnBpdGNoKTtcbiAgICB2YXIgY29zX3BpdGNoID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5waXRjaCk7XG4gICAgdmFyIHNpbl95YXcgPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLnlhdyk7XG4gICAgdmFyIGNvc195YXcgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLnlhdyk7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcigtY29zX3BpdGNoICogc2luX3lhdywgc2luX3BpdGNoLCAtY29zX3BpdGNoICogY29zX3lhdyk7XG59O1xuLyoqXG4gKiBCdWlsZHMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCBiYXNlZCBvbiBhIGZpZWxkIG9mIHZpZXcuXG4gKiBAbWV0aG9kXG4gKiBAcmV0dXJuIHtNYXRyaXh9XG4gKi9cbkNhbWVyYS5wcm90b3R5cGUuY2FsY3VsYXRlUGVyc3BlY3RpdmVGb3YgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm92ID0gdGhpcy5mb3YgKiAoTWF0aC5QSSAvIDE4MCk7IC8vIGNvbnZlcnQgdG8gcmFkaWFuc1xuICAgIHZhciBhc3BlY3QgPSB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQ7XG4gICAgdmFyIG5lYXIgPSB0aGlzLm5lYXI7XG4gICAgdmFyIGZhciA9IHRoaXMuZmFyO1xuICAgIHZhciBtYXRyaXggPSBNYXRyaXguemVybygpO1xuICAgIHZhciBoZWlnaHQgPSAoMS9NYXRoLnRhbihmb3YvMikpICogdGhpcy5oZWlnaHQ7XG4gICAgdmFyIHdpZHRoID0gaGVpZ2h0ICogYXNwZWN0O1xuXG4gICAgbWF0cml4WzBdID0gd2lkdGg7XG4gICAgbWF0cml4WzVdID0gaGVpZ2h0O1xuICAgIG1hdHJpeFsxMF0gPSBmYXIvKG5lYXItZmFyKSA7XG4gICAgbWF0cml4WzExXSA9IC0xO1xuICAgIG1hdHJpeFsxNF0gPSBuZWFyKmZhci8obmVhci1mYXIpO1xuXG4gICAgcmV0dXJuIG1hdHJpeDtcbn07XG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS5jcmVhdGVWaWV3TWF0cml4ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXllID0gdGhpcy5wb3NpdGlvbjtcbiAgICB2YXIgcGl0Y2ggPSB0aGlzLnJvdGF0aW9uLnBpdGNoO1xuICAgIHZhciB5YXcgPSB0aGlzLnJvdGF0aW9uLnlhdztcbiAgICB2YXIgY29zX3BpdGNoID0gTWF0aC5jb3MocGl0Y2gpO1xuICAgIHZhciBzaW5fcGl0Y2ggPSBNYXRoLnNpbihwaXRjaCk7XG4gICAgdmFyIGNvc195YXcgPSBNYXRoLmNvcyh5YXcpO1xuICAgIHZhciBzaW5feWF3ID0gTWF0aC5zaW4oeWF3KTtcblxuICAgIHZhciB4YXhpcyA9IG5ldyBWZWN0b3IoY29zX3lhdywgMCwgLXNpbl95YXcgKTtcbiAgICB2YXIgeWF4aXMgPSBuZXcgVmVjdG9yKHNpbl95YXcgKiBzaW5fcGl0Y2gsIGNvc19waXRjaCwgY29zX3lhdyAqIHNpbl9waXRjaCApO1xuICAgIHZhciB6YXhpcyA9IG5ldyBWZWN0b3Ioc2luX3lhdyAqIGNvc19waXRjaCwgLXNpbl9waXRjaCwgY29zX3BpdGNoICogY29zX3lhdyApO1xuXG4gICAgdmFyIHZpZXdfbWF0cml4ID0gTWF0cml4LmZyb21BcnJheShbXG4gICAgICAgIHhheGlzLngsIHlheGlzLngsIHpheGlzLngsIDAsXG4gICAgICAgIHhheGlzLnksIHlheGlzLnksIHpheGlzLnksIDAsXG4gICAgICAgIHhheGlzLnosIHlheGlzLnosIHpheGlzLnosIDAsXG4gICAgICAgIC0oeGF4aXMuZG90KGV5ZSkgKSwgLSggeWF4aXMuZG90KGV5ZSkgKSwgLSggemF4aXMuZG90KGV5ZSkgKSwgMVxuICAgIF0pO1xuICAgIHJldHVybiB2aWV3X21hdHJpeDtcbn07XG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4LCB5LCB6KXtcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3Rvcih4LHkseik7XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbi8qKlxuICogTW92ZSBjYW1lcmEgcG9zaXRpb24gYnkgdGhlIHgsIHksIGFuZCB6IGFtb3VudHMgcGFzc2VkLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gKiBAcGFyYW0ge251bWJlcn0gelxuICovXG5DYW1lcmEucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbih4LCB5LCB6KXtcbiAgICB0aGlzLnBvc2l0aW9uLnggKz0geDtcbiAgICB0aGlzLnBvc2l0aW9uLnkgKz0geTtcbiAgICB0aGlzLnBvc2l0aW9uLnogKz0gejtcbiAgICB0aGlzLnZpZXdfbWF0cml4ID0gdGhpcy5jcmVhdGVWaWV3TWF0cml4KCk7XG59O1xuXG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS5tb3ZlUmlnaHQgPSBmdW5jdGlvbihhbW91bnQpe1xuICAgIHZhciByaWdodCA9IHRoaXMudXAuY3Jvc3ModGhpcy5kaXJlY3Rpb24oKSkubm9ybWFsaXplKCkuc2NhbGUoYW1vdW50KTtcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5zdWJ0cmFjdChyaWdodCk7XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbi8qKiBAbWV0aG9kICovXG5DYW1lcmEucHJvdG90eXBlLm1vdmVMZWZ0ID0gZnVuY3Rpb24oYW1vdW50KXtcbiAgICB2YXIgbGVmdCA9IHRoaXMudXAuY3Jvc3ModGhpcy5kaXJlY3Rpb24oKSkubm9ybWFsaXplKCkuc2NhbGUoYW1vdW50KTtcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5hZGQobGVmdCk7XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbi8qKlxuICogTW92ZSBjYW1lcmEgcm90YXRpb24gYnkgdGhlIHggYW5kIHkgYW1vdW50cyBwYXNzZWQuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqL1xuQ2FtZXJhLnByb3RvdHlwZS5sb29rID0gZnVuY3Rpb24oeCwgeSl7XG4gICAgdGhpcy5yb3RhdGlvbi55YXcgLT0geDtcbiAgICBpZiAodGhpcy5yb3RhdGlvbi55YXcgPCAwKXtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi55YXcgPSB0aGlzLnJvdGF0aW9uLnlhdyArIChUV09QSSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMucm90YXRpb24ueWF3ID4gKFRXT1BJKSl7XG4gICAgICAgIHRoaXMucm90YXRpb24ueWF3ID0gdGhpcy5yb3RhdGlvbi55YXcgLSAoVFdPUEkpO1xuICAgIH1cbiAgICB0aGlzLnJvdGF0aW9uLnBpdGNoIC09IHk7XG4gICAgaWYgKHRoaXMucm90YXRpb24ucGl0Y2ggPCAwKXtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5waXRjaCA9IHRoaXMucm90YXRpb24ucGl0Y2ggKyAoVFdPUEkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLnJvdGF0aW9uLnBpdGNoID4gKFRXT1BJKSl7XG4gICAgICAgIHRoaXMucm90YXRpb24ucGl0Y2ggPSB0aGlzLnJvdGF0aW9uLnBpdGNoIC0gKFRXT1BJKTtcbiAgICB9XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcblxuQ2FtZXJhLnByb3RvdHlwZS50dXJuUmlnaHQgPSBmdW5jdGlvbihhbW91bnQpe1xuICAgIHRoaXMucm90YXRpb24ueWF3IC09IGFtb3VudDtcbiAgICBpZiAodGhpcy5yb3RhdGlvbi55YXcgPCAwKXtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi55YXcgPSB0aGlzLnJvdGF0aW9uLnlhdyArIChUV09QSSk7XG4gICAgfVxuICAgIHRoaXMudmlld19tYXRyaXggPSB0aGlzLmNyZWF0ZVZpZXdNYXRyaXgoKTtcbn07XG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS50dXJuTGVmdCA9IGZ1bmN0aW9uKGFtb3VudCl7XG4gICAgdGhpcy5yb3RhdGlvbi55YXcgKz0gYW1vdW50O1xuICAgIGlmICh0aGlzLnJvdGF0aW9uLnlhdyA+IChUV09QSSkpe1xuICAgICAgICB0aGlzLnJvdGF0aW9uLnlhdyA9IHRoaXMucm90YXRpb24ueWF3IC0gKFRXT1BJKTtcbiAgICB9XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbkNhbWVyYS5wcm90b3R5cGUubG9va1VwID0gZnVuY3Rpb24oYW1vdW50KXtcbiAgICB0aGlzLnJvdGF0aW9uLnBpdGNoIC09IGFtb3VudDtcbiAgICBpZiAodGhpcy5yb3RhdGlvbi5waXRjaCA+IChUV09QSSkpe1xuICAgICAgICB0aGlzLnJvdGF0aW9uLnBpdGNoID0gdGhpcy5yb3RhdGlvbi5waXRjaCAtIChUV09QSSk7XG4gICAgfVxuICAgIHRoaXMudmlld19tYXRyaXggPSB0aGlzLmNyZWF0ZVZpZXdNYXRyaXgoKTtcbn07XG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS5sb29rRG93biA9IGZ1bmN0aW9uKGFtb3VudCl7XG4gICAgdGhpcy5yb3RhdGlvbi5waXRjaCArPSBhbW91bnQ7XG4gICAgaWYgKHRoaXMucm90YXRpb24ucGl0Y2ggPCAwKXtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5waXRjaCA9IHRoaXMucm90YXRpb24ucGl0Y2ggKyAoVFdPUEkpO1xuICAgIH1cbiAgICB0aGlzLnZpZXdfbWF0cml4ID0gdGhpcy5jcmVhdGVWaWV3TWF0cml4KCk7XG59O1xuLyoqIEBtZXRob2QgKi9cbkNhbWVyYS5wcm90b3R5cGUubW92ZVVwID0gZnVuY3Rpb24oYW1vdW50KXtcbiAgICB2YXIgdXAgPSB0aGlzLnVwLm5vcm1hbGl6ZSgpLnNjYWxlKGFtb3VudCk7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb24uc3VidHJhY3QodXApO1xuICAgIHRoaXMudmlld19tYXRyaXggPSB0aGlzLmNyZWF0ZVZpZXdNYXRyaXgoKTtcbn07XG4vKiogQG1ldGhvZCAqL1xuQ2FtZXJhLnByb3RvdHlwZS5tb3ZlRG93biA9IGZ1bmN0aW9uKGFtb3VudCl7XG4gICAgdmFyIHVwID0gdGhpcy51cC5ub3JtYWxpemUoKS5zY2FsZShhbW91bnQpO1xuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmFkZCh1cCk7XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbi8qKiBAbWV0aG9kICovXG5DYW1lcmEucHJvdG90eXBlLm1vdmVGb3J3YXJkID0gZnVuY3Rpb24oYW1vdW50KXtcbiAgICB2YXIgZm9yd2FyZCA9IHRoaXMuZGlyZWN0aW9uKCkuc2NhbGUoYW1vdW50KTtcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5hZGQoZm9yd2FyZCk7XG4gICAgdGhpcy52aWV3X21hdHJpeCA9IHRoaXMuY3JlYXRlVmlld01hdHJpeCgpO1xufTtcbi8qKiBAbWV0aG9kICovXG5DYW1lcmEucHJvdG90eXBlLm1vdmVCYWNrd2FyZCA9IGZ1bmN0aW9uKGFtb3VudCl7XG4gICAgdmFyIGJhY2t3YXJkID0gdGhpcy5kaXJlY3Rpb24oKS5zY2FsZShhbW91bnQpO1xuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLnN1YnRyYWN0KGJhY2t3YXJkKTtcbiAgICB0aGlzLnZpZXdfbWF0cml4ID0gdGhpcy5jcmVhdGVWaWV3TWF0cml4KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTtcbiIsIi8qKlxuICogRXZlbnQgaGFuZGxlci5cbiAqIEBtaXhpblxuICovXG52YXIgRXZlbnRUYXJnZXQgPSB7XG4gICAgX2xpc3RlbmVyczoge30sXG4gICAgLyoqXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFR5cGUgb2YgZXZlbnQgdG8gYmUgYWRkZWQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gZXZlbnQgaXMgZmlyZWQuXG4gICAgICovXG4gICAgYWRkTGlzdGVuZXI6IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKXtcbiAgICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLl9saXN0ZW5lcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIFR5cGUgb2YgZXZlbnQgdG8gYmUgZmlyZWQuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBbZXZlbnRdIE9wdGlvbmFsIHVzZXItZGVmaW5lZCBldmVudCBvYmplY3QuIFRoaXMgY291bGQgY29udGFpbiwgZm9yIGV4YW1wbGUsIG1vdXNlIGNvb3JkaW5hdGVzLCBvciBrZXkgY29kZXMuXG4gICAgICovXG4gICAgZmlyZTogZnVuY3Rpb24odHlwZSwgZXZlbnQpe1xuICAgICAgICB2YXIgZSA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIGV2ZW50ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBlID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZS5ldmVudCA9IHR5cGU7XG4gICAgICAgIGUudGFyZ2V0ID0gdGhpcztcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1t0eXBlXTtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICAgICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVyOiBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcil7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbdHlwZV07XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRUYXJnZXQ7XG4iLCJ2YXIgbWF0aCA9IHJlcXVpcmUoJ2xpbmVhcmFsZ2VhJyk7XG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEuanMnKTtcbnZhciBFdmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnRzLmpzJyk7XG52YXIgbWl4aW4gPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvbWl4aW4uanMnKTtcbnZhciBLRVlDT0RFUyA9IHJlcXVpcmUoJy4uL3V0aWxpdGllcy9rZXljb2Rlcy5qcycpO1xuXG52YXIgVmVjdG9yID0gbWF0aC5WZWN0b3I7XG52YXIgTWF0cml4ID0gbWF0aC5NYXRyaXg7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge3tjYW52YXNfaWQ6IHN0cmluZywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBvcHRpb25zXG4gKi9cbmZ1bmN0aW9uIFNjZW5lKG9wdGlvbnMpe1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgLyoqIEB0eXBlIHtIVE1MRWxlbWVudH0gKi9cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbnMuY2FudmFzX2lkKTtcbiAgICAvKiogQHR5cGUge0NhbnZhc0NvbnRleHR9ICovXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIC8qKiBAdHlwZSB7Q2FtZXJhfSAqL1xuICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgLyoqIEB0eXBlIHtWZWN0b3J9ICovXG4gICAgdGhpcy5pbGx1bWluYXRpb24gPSBuZXcgVmVjdG9yKDkwLDAsMCk7XG4gICAgLyoqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgTWVzaD59ICovXG4gICAgdGhpcy5tZXNoZXMgPSB7fTtcbiAgICB0aGlzLl94X29mZnNldCA9IE1hdGgucm91bmQodGhpcy53aWR0aCAvIDIpO1xuICAgIHRoaXMuX3lfb2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLmhlaWdodCAvIDIpO1xuICAgIHRoaXMuX2JhY2tfYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5fYmFja19idWZmZXIud2lkdGggPSB0aGlzLndpZHRoO1xuICAgIHRoaXMuX2JhY2tfYnVmZmVyLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMuX2JhY2tfYnVmZmVyX2N0eCA9IHRoaXMuX2JhY2tfYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5fYmFja19idWZmZXJfaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMuX2RlcHRoX2J1ZmZlciA9IFtdO1xuICAgIHRoaXMuX2JhY2tmYWNlX2N1bGxpbmcgPSB0cnVlO1xuICAgIHRoaXMuX2tleXMgPSB7fTsgLy8gS2V5cyBjdXJyZW50bHkgcHJlc3NlZFxuICAgIHRoaXMuX2tleV9jb3VudCA9IDA7IC8vIE51bWJlciBvZiBrZXlzIGJlaW5nIHByZXNzZWQuLi4gdGhpcyBmZWVscyBrbHVkZ3lcbiAgICB0aGlzLl9hbmltX2lkID0gbnVsbDtcbiAgICB0aGlzLl9uZWVkc191cGRhdGUgPSB0cnVlO1xuICAgIHRoaXMuX2RyYXdfbW9kZSA9IDA7XG4gICAgdGhpcy5jYW52YXMudGFiSW5kZXggPSAxOyAvLyBTZXQgdGFiIGluZGV4IHRvIGFsbG93IGNhbnZhcyB0byBoYXZlIGZvY3VzIHRvIHJlY2VpdmUga2V5IGV2ZW50c1xuICAgIHRoaXMuX2JhY2tfYnVmZmVyX2ltYWdlID0gdGhpcy5fYmFja19idWZmZXJfY3R4LmNyZWF0ZUltYWdlRGF0YSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuZW1wdHlLZXlzLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZURlcHRoQnVmZmVyKCk7XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cbm1peGluKFNjZW5lLnByb3RvdHlwZSwgRXZlbnRUYXJnZXQpO1xuLyoqXG4gKiBEdW1wIGFsbCBwcmVzc2VkIGtleXMgb24gYmx1ci5cbiAqIEBtZXRob2RcbiAqL1xuU2NlbmUucHJvdG90eXBlLmVtcHR5S2V5cyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5fa2V5X2NvdW50ID0gMDtcbiAgICB0aGlzLl9rZXlzID0ge307XG59O1xuLyoqIFxuICogQ2hlY2sgaWYga2V5IGlzIHByZXNzZWQuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IEtleSB0byBjaGVjay4gRS5nLiAnYScsICdzcGFjZScsICd0YWInLlxuICovXG5TY2VuZS5wcm90b3R5cGUuaXNLZXlEb3duID0gZnVuY3Rpb24oa2V5KXtcbiAgICB2YXIgcHJlc3NlZCA9IEtFWUNPREVTW2tleV07XG4gICAgcmV0dXJuIChwcmVzc2VkIGluIHRoaXMuX2tleXMgJiYgdGhpcy5fa2V5c1twcmVzc2VkXSk7XG59O1xuLyoqIFxuICogUmVnaXN0ZXIga2V5IHByZXNzZXMuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge0tleUV2ZW50fSBlXG4gKi9cblNjZW5lLnByb3RvdHlwZS5vbktleURvd24gPSBmdW5jdGlvbihlKXtcbiAgICAvLyBJZiB0aGVyZSBhcmUgb25lIG9yIG1vcmUga2V5cyBkZXByZXNzZWQsIHRoZSBrZXlkb3duIGV2ZW50IHdpbGwgZmlyZSBpbiB0aGUgdXBkYXRlXG4gICAgLy8gbG9vcC4gVGhpcyBwcmV2ZW50cyBhIGtleWRvd24gZGVsYXkgdGhhdCBub3JhbWxseSBvY2N1cnMuXG4gICAgdmFyIHByZXNzZWQgPSBlLmtleUNvZGUgfHwgZS53aGljaDtcbiAgICBpZiAoIXRoaXMuaXNLZXlEb3duKHByZXNzZWQpKXtcbiAgICAgICAgdGhpcy5fa2V5X2NvdW50ICs9IDE7XG4gICAgICAgIHRoaXMuX2tleXNbcHJlc3NlZF0gPSB0cnVlO1xuICAgIH1cbn07XG4vKiogXG4gKiBVbnJlZ2lzdGVyIGtleSBwcmVzc2VzIG9uIGtleXVwLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtLZXlFdmVudH0gZVxuICovXG5TY2VuZS5wcm90b3R5cGUub25LZXlVcCA9IGZ1bmN0aW9uKGUpe1xuICAgIHZhciBwcmVzc2VkID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG4gICAgaWYgKHByZXNzZWQgaW4gdGhpcy5fa2V5cyl7XG4gICAgICAgIHRoaXMuX2tleV9jb3VudCAtPSAxO1xuICAgICAgICB0aGlzLl9rZXlzW3ByZXNzZWRdID0gZmFsc2U7XG4gICAgfVxufTtcblNjZW5lLnByb3RvdHlwZS5fZ2V0TW91c2VQb3MgPSBmdW5jdGlvbihlKXtcbiAgICB2YXIgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcbiAgICB9O1xufTtcbi8qKiBcbiAqIFJlZ2lzdGVyIG1vdXNlZG93biBldmVudC5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxuICovXG5TY2VuZS5wcm90b3R5cGUub25Nb3VzZURvd24gPSBmdW5jdGlvbihlKXtcbiAgICAvLyBMYXN0IG1vdXNlIHBvc2l0aW9uLiBVc2VkIGZvciBjYWxjdWxhdGluZyBkZWx0YSB4IGFuZCB5IGZvciBtb3VzZWRyYWcuXG4gICAgLy8gSW5pdGlhbGx5IHNldCB0byB1bmRlZmluZWQuIEFsc28ga2VlcCB0cmFjayBvZiB0aW1lIG9mIHRpbWUgb2YgbGFzdFxuICAgIC8vIHVwZGF0ZSwgc28gdGhhdCBtb3VzZSBzcGVlZCBjYWxjdWxhdGlvbiBpcyBub3QgZGVwZW5kZW50IG9uIHN0ZWFkeVxuICAgIC8vIGZyYW1lIHJhdGUuXG4gICAgdGhpcy5fbGFzdF9tb3VzZV9jb29yZHMgPSB2b2lkKDApO1xuICAgIHRoaXMuX2xhc3RfbW91c2VfdXBkYXRlID0gdm9pZCgwKTtcbiAgICB2YXIgbW91c2VDb29yZCA9IHsnbW91c2UnOiB0aGlzLl9nZXRNb3VzZVBvcyhlKX07XG4gICAgdGhpcy5maXJlKCdtb3VzZWRvd24nLCBtb3VzZUNvb3JkKTtcbiAgICAvLyBTZXR1cCBtb3VzZWRyYWdcbiAgICB2YXIgbW91c2VkcmFnID0gdGhpcy5vbk1vdXNlRHJhZy5iaW5kKHRoaXMpO1xuICAgIHZhciBtb3VzZXVwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gVW5yZWdpc3RlciBldmVudHMgb24gbW91c2V1cC5cbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZWRyYWcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cCwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9sYXN0X21vdXNlX2Nvb3JkcyA9IHZvaWQoMCk7XG4gICAgICAgIHRoaXMuX2xhc3RfbW91c2VfdXBkYXRlID0gdm9pZCgwKTtcbiAgICB9O1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlZHJhZywgZmFsc2UpO1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZXVwLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXAsIGZhbHNlKTtcbn07XG4vKiogXG4gKiBSZWdpc3RlciBtb3VzZXVwIGV2ZW50LlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXG4gKi9cblNjZW5lLnByb3RvdHlwZS5vbk1vdXNlVXAgPSBmdW5jdGlvbihlKXtcbiAgICB2YXIgbW91c2VDb29yZCA9IHsnbW91c2UnOiB0aGlzLl9nZXRNb3VzZVBvcyhlKX07XG4gICAgdGhpcy5maXJlKCdtb3VzZXVwJywgbW91c2VDb29yZCk7XG59O1xuLyoqIFxuICogUmVnaXN0ZXIgbW91c2Vtb3ZlIGV2ZW50LlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXG4gKi9cblNjZW5lLnByb3RvdHlwZS5vbk1vdXNlTW92ZSA9IGZ1bmN0aW9uKGUpe1xuICAgIHZhciBtb3VzZUNvb3JkID0geydtb3VzZSc6IHRoaXMuX2dldE1vdXNlUG9zKGUpfTtcbiAgICB0aGlzLmZpcmUoJ21vdXNlbW92ZScsIG1vdXNlQ29vcmQpO1xufTtcbi8qKiBcbiAqIFJlZ2lzdGVyIG1vdXNlZHJhZyBldmVudC5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxuICovXG5TY2VuZS5wcm90b3R5cGUub25Nb3VzZURyYWcgPSBmdW5jdGlvbihlKXtcbiAgICB2YXIgbW91c2VfY29vcmRzID0gdGhpcy5fZ2V0TW91c2VQb3MoZSk7XG4gICAgLy8gQ2FsY3VsYXRlIGRlbHRheCBhbmQgZGVsdGEgeSwgYW5kIG1vdXNlIHNwZWVkLlxuICAgIGlmICh0eXBlb2YgdGhpcy5fbGFzdF9tb3VzZV9jb29yZHMgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdGhpcy5fbGFzdF9tb3VzZV9jb29yZHMgPSBtb3VzZV9jb29yZHM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5fbGFzdF9tb3VzZV91cGRhdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdGhpcy5fbGFzdF9tb3VzZV91cGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIH1cbiAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkgLSB0aGlzLl9sYXN0X21vdXNlX3VwZGF0ZTtcbiAgICB2YXIgZGVsdGF4ID0gbW91c2VfY29vcmRzLnggLSB0aGlzLl9sYXN0X21vdXNlX2Nvb3Jkcy54O1xuICAgIHZhciBkZWx0YXkgPSBtb3VzZV9jb29yZHMueSAtIHRoaXMuX2xhc3RfbW91c2VfY29vcmRzLnk7XG4gICAgdmFyIHh2ZWwgPSAwO1xuICAgIHZhciB5dmVsID0gMDtcbiAgICBpZiAodGltZSA+IDApe1xuICAgICAgICB4dmVsID0gZGVsdGF4IC8gdGltZTtcbiAgICAgICAgeXZlbCA9IGRlbHRheSAvIHRpbWU7XG4gICAgfVxuICAgIHZhciBtb3VzZUV2ZW50ID0geydtb3VzZSc6IHtcbiAgICAgICAgJ3gnOiBtb3VzZV9jb29yZHMueCxcbiAgICAgICAgJ3knOiBtb3VzZV9jb29yZHMueSxcbiAgICAgICAgJ3h2ZWwnOiB4dmVsLFxuICAgICAgICAneXZlbCc6IHl2ZWwsXG4gICAgICAgICdkZWx0YXgnOiBkZWx0YXgsXG4gICAgICAgICdkZWx0YXknOiBkZWx0YXlcbiAgICB9fTtcbiAgICB0aGlzLl9sYXN0X21vdXNlX2Nvb3JkcyA9IG1vdXNlX2Nvb3JkcztcbiAgICB0aGlzLl9sYXN0X21vdXNlX3VwZGF0ZSA9IHRpbWU7XG4gICAgdGhpcy5maXJlKCdtb3VzZWRyYWcnLCBtb3VzZUV2ZW50KTtcbn07XG4vKipcbiAqIEluaXRpYWxpemUgZGVwdGggYnVmZmVyIHdpdGggaGlnaCB6IHZhbHVlcy5cbiAqIEBtZXRob2RcbiAqL1xuU2NlbmUucHJvdG90eXBlLmluaXRpYWxpemVEZXB0aEJ1ZmZlciA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yICh2YXIgeCA9IDAsIGxlbiA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodDsgeCA8IGxlbjsgeCsrKXtcbiAgICAgICAgdGhpcy5fZGVwdGhfYnVmZmVyW3hdID0gOTk5OTk5OTtcbiAgICB9XG59O1xuLyoqXG4gKiBEZXRlcm1pbmUgaWQgdmVjdG9yIGlzIG9mZnNjcmVlbi5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7VmVjdG9yfSB2ZWN0b3JcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblNjZW5lLnByb3RvdHlwZS5vZmZzY3JlZW4gPSBmdW5jdGlvbih2ZWN0b3Ipe1xuICAgIC8vIFRPRE86IE5vdCB0b3RhbGx5IGNlcnRhaW4gdGhhdCB6PjEgaW5kaWNhdGVzIHZlY3RvciBpcyBiZWhpbmQgY2FtZXJhLlxuICAgIHZhciB4ID0gdmVjdG9yLnggKyB0aGlzLl94X29mZnNldDtcbiAgICB2YXIgeSA9IHZlY3Rvci55ICsgdGhpcy5feV9vZmZzZXQ7XG4gICAgdmFyIHogPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gKHogPiAxIHx8IHggPCAwIHx8IHggPiB0aGlzLndpZHRoIHx8IHkgPCAwIHx8IHkgPiB0aGlzLmhlaWdodCk7XG59O1xuLyoqXG4gKiBUb2dnbGUgZHJhd2luZyBtb2RlLiBDdXJyZW50bHksIGF2YWlsYWJsZSBkcmF3IG1vZGVzIGFyZSB3aXJlZnJhbWUgbW9kZSwgYW5kXG4gKiB0aGUgZXhwZXJpbWVudGFsIChhbmQgc2xvdykgZmlsbCBtb2RlLlxuICogQG1ldGhvZFxuICovXG5TY2VuZS5wcm90b3R5cGUudG9nZ2xlRHJhd01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuX2RyYXdfbW9kZSA9ICh0aGlzLl9kcmF3X21vZGUgKyAxKSAlIDI7XG4gICAgdGhpcy5yZW5kZXJTY2VuZSgpO1xufTtcbi8qKlxuICogVG9nZ2xlIGJhY2tmYWNlIGN1bGxpbmcuIFxuICogQG1ldGhvZFxuICovXG5TY2VuZS5wcm90b3R5cGUudG9nZ2xlQmFja2ZhY2VDdWxsaW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLl9iYWNrZmFjZV9jdWxsaW5nID0gIXRoaXMuX2JhY2tmYWNlX2N1bGxpbmc7XG4gICAgdGhpcy5yZW5kZXJTY2VuZSgpO1xufTtcbi8qKlxuICogRHJhdyBhIHNpbmdsZSBwaXhlbCB0byB0aGUgc2NlZW4gYW5kIHVwZGF0ZSB0aGUgZGVwdGggYnVmZmVyLiBJZiB0aGVyZSBpcyBhbHJlYWR5IFxuICogYSBjbG9zZXIgcGl4ZWwgKGkuZS4gb25lIHdpdGggYSBsb3dlciB6IHZhbHVlKSwgdGhlbiB0aGUgcGl4ZWwgaXMgbm90IGRyYXduLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtudW1iZXJ9IHggWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0geSBZIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSB6IFogY29vcmRpbmF0ZVxuICogQHBhcmFtIHtDb2xvcn0gY29sb3IgQ29sb3IgdG8gYmUgZHJhd24uXG4gKi9cblNjZW5lLnByb3RvdHlwZS5kcmF3UGl4ZWwgPSBmdW5jdGlvbih4LCB5LCB6LCBjb2xvcil7XG4gICAgeCA9IHggKyB0aGlzLl94X29mZnNldDtcbiAgICB5ID0geSArIHRoaXMuX3lfb2Zmc2V0O1xuICAgIGlmICh4ID49IDAgJiYgeCA8IHRoaXMud2lkdGggJiYgeSA+PSAwICYmIHkgPCB0aGlzLmhlaWdodCkge1xuICAgICAgICB2YXIgaW5kZXggPSB4ICsgKHkgKiB0aGlzLndpZHRoKTtcbiAgICAgICAgaWYgKHogPCB0aGlzLl9kZXB0aF9idWZmZXJbaW5kZXhdKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2VfZGF0YSA9IHRoaXMuX2JhY2tfYnVmZmVyX2ltYWdlLmRhdGE7XG4gICAgICAgICAgICB2YXIgaSA9IGluZGV4ICogNDtcbiAgICAgICAgICAgIGltYWdlX2RhdGFbaV0gPSBjb2xvci5yO1xuICAgICAgICAgICAgaW1hZ2VfZGF0YVtpKzFdID0gY29sb3IuZztcbiAgICAgICAgICAgIGltYWdlX2RhdGFbaSsyXSA9IGNvbG9yLmI7XG4gICAgICAgICAgICBpbWFnZV9kYXRhW2krM10gPSAyNTU7XG4gICAgICAgICAgICB0aGlzLl9kZXB0aF9idWZmZXJbaW5kZXhdID0gejtcbiAgICAgICAgfVxuICAgIH1cbn07XG4vKipcbiAqIERyYXcgYSBsaW5lIHNlZ21lbnQgYmV0d2VlbiB0d28gcG9pbnRzLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHYxIEZpcnN0IGVuZCBwb2ludCBvZiBsaW5lIHNlZ21lbnQuXG4gKiBAcGFyYW0ge1ZlY3Rvcn0gdjIgU2Vjb25kIGVuZCBwb2ludCBvZiBsaW5lIHNlZ21lbnQuXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBDb2xvciB0byBiZSBkcmF3bi5cbiAqL1xuU2NlbmUucHJvdG90eXBlLmRyYXdFZGdlID0gZnVuY3Rpb24odjEsIHYyLCBjb2xvcil7XG4gICAgdmFyIGFicyA9IE1hdGguYWJzO1xuICAgIGlmICh2MS54ID49IHYyLngpe1xuICAgICAgICB2YXIgdGVtcCA9IHYxO1xuICAgICAgICB2MSA9IHYyO1xuICAgICAgICB2MiA9IHRlbXA7XG4gICAgfVxuICAgIHZhciBjdXJyZW50X3ggPSB2MS54O1xuICAgIHZhciBjdXJyZW50X3kgPSB2MS55O1xuICAgIHZhciBjdXJyZW50X3ogPSB2MS56O1xuICAgIHZhciBsb25nZXN0X2Rpc3QgPSBNYXRoLm1heChhYnModjIueCAtIHYxLngpLCBhYnModjIueSAtIHYxLnkpLCBhYnModjIueiAtIHYxLnopKTtcbiAgICB2YXIgc3RlcF94ID0gKHYyLnggLSB2MS54KSAvIGxvbmdlc3RfZGlzdDtcbiAgICB2YXIgc3RlcF95ID0gKHYyLnkgLSB2MS55KSAvIGxvbmdlc3RfZGlzdDtcbiAgICB2YXIgc3RlcF96ID0gKHYyLnogLSB2MS56KSAvIGxvbmdlc3RfZGlzdDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9uZ2VzdF9kaXN0OyBpKyspe1xuICAgICAgICB0aGlzLmRyYXdQaXhlbChNYXRoLmZsb29yKGN1cnJlbnRfeCksIE1hdGguZmxvb3IoY3VycmVudF95KSwgY3VycmVudF96LCBjb2xvcik7XG4gICAgICAgIGN1cnJlbnRfeCArPSBzdGVwX3g7XG4gICAgICAgIGN1cnJlbnRfeSArPSBzdGVwX3k7XG4gICAgICAgIGN1cnJlbnRfeiArPSBzdGVwX3o7XG4gICAgfVxufTtcbi8qKlxuICogRHJhdyB0aGUgZWRnZXMgb2YgYSB0cmlhbmdsZS5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7VmVjdG9yfSB2MSBGaXJzdCB2ZXJ0ZXggb2YgdHJpYW5nbGUuXG4gKiBAcGFyYW0ge1ZlY3Rvcn0gdjIgU2Vjb25kIHZlcnRleCBvZiB0cmlhbmdsZS5cbiAqIEBwYXJhbSB7VmVjdG9yfSB2MyBUaGlyZCB2ZXJ0ZXggb2YgdHJpYW5nbGUuXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBDb2xvciB0byBiZSBkcmF3bi5cbiAqL1xuU2NlbmUucHJvdG90eXBlLmRyYXdUcmlhbmdsZSA9IGZ1bmN0aW9uKHYxLCB2MiwgdjMsIGNvbG9yKXtcbiAgICB0aGlzLmRyYXdFZGdlKHYxLCB2MiwgY29sb3IpO1xuICAgIHRoaXMuZHJhd0VkZ2UodjIsIHYzLCBjb2xvcik7XG4gICAgdGhpcy5kcmF3RWRnZSh2MywgdjEsIGNvbG9yKTtcbn07XG4vKipcbiAqIERyYXcgYSBmaWxsZWQgdHJpYW5nbGUgaW4gYSB1bmlmb3JtIGNvbG9yLlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtWZWN0b3J9IHYxIEZpcnN0IHZlcnRleCBvZiB0cmlhbmdsZS5cbiAqIEBwYXJhbSB7VmVjdG9yfSB2MiBTZWNvbmQgdmVydGV4IG9mIHRyaWFuZ2xlLlxuICogQHBhcmFtIHtWZWN0b3J9IHYzIFRoaXJkIHZlcnRleCBvZiB0cmlhbmdsZS5cbiAqIEBwYXJhbSB7Q29sb3J9IGNvbG9yIENvbG9yIHRvIGJlIGRyYXduLlxuICovXG5TY2VuZS5wcm90b3R5cGUuZmlsbFRyaWFuZ2xlID0gZnVuY3Rpb24odjEsIHYyLCB2MywgY29sb3Ipe1xuICAgIC8vIFRPRE86IFRoaXMgbWV0aG9kIGNodWdzIHdoZW4gY2xvc2UgdG8gYSBmYWNlLiBTZWUgaWYgdGhpcyBjYW4gYmUgZml4ZWQuXG4gICAgLy8gSXMgdGhpcyBqdXN0IGJlY2F1c2UgaXQncyBsb29waW5nIG92ZXIgc28gbWFueSBleHRyYW5lb3VzIHBvaW50cz9cbiAgICAvLyBEZWNvbXBvc2luZyBpbnRvIHNtYWxsZXIgdHJpYW5nbGVzIG1heSBhbGxldmlhdGUgdGhpcyBzb21ld2hhdC5cbiAgICB2YXIgeDAgPSB2MS54O1xuICAgIHZhciB4MSA9IHYyLng7XG4gICAgdmFyIHgyID0gdjMueDtcbiAgICB2YXIgeTAgPSB2MS55O1xuICAgIHZhciB5MSA9IHYyLnk7XG4gICAgdmFyIHkyID0gdjMueTtcbiAgICB2YXIgejAgPSB2MS56O1xuICAgIHZhciB6MSA9IHYyLno7XG4gICAgdmFyIHoyID0gdjMuejtcblxuICAgIC8vIENvbXB1dGUgb2Zmc2V0cy4gVXNlZCB0byBhdm9pZCBjb21wdXRpbmcgYmFyeWNlbnRyaWMgY29vcmRzIGZvciBvZmZzY3JlZW4gcGl4ZWxzXG4gICAgdmFyIHhsZWZ0ID0gMCAtIHRoaXMuX3hfb2Zmc2V0O1xuICAgIHZhciB4cmlnaHQgPSB0aGlzLndpZHRoIC0gdGhpcy5feF9vZmZzZXQ7XG4gICAgdmFyIHl0b3AgPSAwIC0gdGhpcy5feV9vZmZzZXQ7XG4gICAgdmFyIHlib3QgPSB0aGlzLmhlaWdodCAtIHRoaXMuX3lfb2Zmc2V0O1xuXG4gICAgLy8gQ29tcHV0ZSBib3VuZGluZyBib3hcbiAgICB2YXIgeG1pbiA9IE1hdGguZmxvb3IoTWF0aC5taW4oeDAsIHgxLCB4MikpO1xuICAgIGlmICh4bWluIDwgeGxlZnQpe3htaW49eGxlZnQ7fVxuICAgIHZhciB4bWF4ID0gTWF0aC5jZWlsKE1hdGgubWF4KHgwLCB4MSwgeDIpKTtcbiAgICBpZiAoeG1heCA+IHhyaWdodCl7eG1heD14cmlnaHQ7fVxuICAgIHZhciB5bWluID0gTWF0aC5mbG9vcihNYXRoLm1pbih5MCwgeTEsIHkyKSk7XG4gICAgaWYgKHltaW4gPCB5dG9wKXt5bWluPXl0b3A7fVxuICAgIHZhciB5bWF4ID0gTWF0aC5jZWlsKE1hdGgubWF4KHkwLCB5MSwgeTIpKTtcbiAgICBpZiAoeW1heCA+IHlib3Qpe3ltYXg9eWJvdDt9XG5cbiAgICAvLyBQcmVjb21wdXRlIGFzIG11Y2ggYXMgcG9zc2libGVcbiAgICB2YXIgeTJ5MCA9IHkyLXkwO1xuICAgIHZhciB4MHgyID0geDAteDI7XG4gICAgdmFyIHkweTEgPSB5MC15MTtcbiAgICB2YXIgeDF4MCA9IHgxLXgwO1xuICAgIHZhciB4MnkweDB5MiA9IHgyKnkwIC0geDAqeTI7XG4gICAgdmFyIHgweTF4MXkwID0geDAqeTEgLSB4MSp5MDtcbiAgICB2YXIgZjIweDF5MSA9ICgoeTJ5MCp4MSkgKyAoeDB4Mip5MSkgKyB4MnkweDB5Mik7XG4gICAgdmFyIGYwMXgyeTIgPSAoKHkweTEqeDIpICsgKHgxeDAqeTIpICsgeDB5MXgxeTApO1xuXG4gICAgdmFyIHkyeTBvdmVyZjIweDF5MSA9IHkyeTAvZjIweDF5MTtcbiAgICB2YXIgeDB4Mm92ZXJmMjB4MXkxID0geDB4Mi9mMjB4MXkxO1xuICAgIHZhciB4MnkweDB5MjFvdmVyZjIweDF5MSA9IHgyeTB4MHkyL2YyMHgxeTE7XG5cbiAgICB2YXIgeTB5MW92ZXJmMDF4MnkyID0geTB5MS9mMDF4MnkyO1xuICAgIHZhciB4MHgyb3ZlcmYwMXgyeTIgPSB4MXgwL2YwMXgyeTI7XG4gICAgdmFyIHgyeTB4MHkyb3ZlcmYwMXgyeTIgPSB4MHkxeDF5MC9mMDF4MnkyO1xuXG4gICAgLy8gTG9vcCBvdmVyIGJvdW5kaW5nIGJveFxuICAgIGZvciAodmFyIHggPSB4bWluOyB4IDw9IHhtYXg7IHgrKyl7XG4gICAgICAgIGZvciAodmFyIHkgPSB5bWluOyB5IDw9IHltYXg7IHkrKyl7XG4gICAgICAgICAgICAvLyBDb21wdXRlIGJhcnljZW50cmljIGNvb3JkaW5hdGVzXG4gICAgICAgICAgICAvLyBJZiBhbnkgb2YgdGhlIGNvb3JkaW5hdGVzIGFyZSBub3QgaW4gdGhlIHJhbmdlIFswLDFdLCB0aGVuIHRoZVxuICAgICAgICAgICAgLy8gcG9pbnQgaXMgbm90IGluc2lkZSB0aGUgdHJpYW5nbGUuIFJhdGhlciB0aGFuIGNvbXB1dGUgYWxsIHRoZVxuICAgICAgICAgICAgLy8gY29vcmRpbmF0ZXMgc3RyYWlnaHQgYXdheSwgd2UnbGwgc2hvcnQtY2lyY3VpdCBhcyBzb29uIGFzIGEgY29vcmRpbmF0ZSBvdXRzaWRlXG4gICAgICAgICAgICAvLyBvZiB0aGF0IHJhbmdlIGlzIGVuY291bnRlcmVkLlxuICAgICAgICAgICAgdmFyIGJldGEgPSB5Mnkwb3ZlcmYyMHgxeTEqeCArIHgweDJvdmVyZjIweDF5MSp5ICsgeDJ5MHgweTIxb3ZlcmYyMHgxeTE7XG4gICAgICAgICAgICBpZiAoYmV0YSA+PSAwICYmIGJldGEgPD0gMSl7XG4gICAgICAgICAgICAgICAgdmFyIGdhbW1hID0geTB5MW92ZXJmMDF4MnkyKnggKyB4MHgyb3ZlcmYwMXgyeTIqeSAreDJ5MHgweTJvdmVyZjAxeDJ5MjtcbiAgICAgICAgICAgICAgICBpZiAoZ2FtbWEgPj0gMCAmJiBnYW1tYSA8PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFscGhhID0gMSAtIGJldGEgLSBnYW1tYTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFscGhhID49IDAgJiYgYWxwaGEgPD0gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhbGwgYmFyeWNlbnRyaWMgY29vcmRzIHdpdGhpbiByYW5nZSBbMCwxXSwgaW5zaWRlIHRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeiA9IGFscGhhKnowICsgYmV0YSp6MSArIGdhbW1hKnoyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGl4ZWwoeCwgeSwgeiwgY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcbi8qKlxuICogUmVuZGVyIGEgc2luZ2xlIGZyYW1lIG9mIHRoZSBzY2VuZS5cbiAqIEBtZXRob2RcbiAqL1xuU2NlbmUucHJvdG90eXBlLnJlbmRlclNjZW5lID0gZnVuY3Rpb24oKXtcbiAgICAvLyBUT0RPOiBTaW1wbGlmeSB0aGlzIGZ1bmN0aW9uLlxuICAgIHRoaXMuX2JhY2tfYnVmZmVyX2ltYWdlID0gdGhpcy5fYmFja19idWZmZXJfY3R4LmNyZWF0ZUltYWdlRGF0YSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5pbml0aWFsaXplRGVwdGhCdWZmZXIoKTtcbiAgICB2YXIgY2FtZXJhX21hdHJpeCA9IHRoaXMuY2FtZXJhLnZpZXdfbWF0cml4O1xuICAgIHZhciBwcm9qZWN0aW9uX21hdHJpeCA9IHRoaXMuY2FtZXJhLnBlcnNwZWN0aXZlRm92O1xuICAgIHZhciBsaWdodCA9IHRoaXMuaWxsdW1pbmF0aW9uO1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLm1lc2hlcyl7XG4gICAgICAgIGlmICh0aGlzLm1lc2hlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgICAgIHZhciBtZXNoID0gdGhpcy5tZXNoZXNba2V5XTtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IG1lc2guc2NhbGU7XG4gICAgICAgICAgICB2YXIgcm90YXRpb24gPSBtZXNoLnJvdGF0aW9uO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gbWVzaC5wb3NpdGlvbjtcbiAgICAgICAgICAgIHZhciB3b3JsZF9tYXRyaXggPSBNYXRyaXguc2NhbGUoc2NhbGUueCwgc2NhbGUueSwgc2NhbGUueikubXVsdGlwbHkoXG4gICAgICAgICAgICAgICAgTWF0cml4LnJvdGF0aW9uKHJvdGF0aW9uLnBpdGNoLCByb3RhdGlvbi55YXcsIHJvdGF0aW9uLnJvbGwpLm11bHRpcGx5KFxuICAgICAgICAgICAgICAgICAgICBNYXRyaXgudHJhbnNsYXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueikpKTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbWVzaC5mYWNlcy5sZW5ndGg7IGsrKyl7XG4gICAgICAgICAgICAgICAgdmFyIGZhY2UgPSBtZXNoLmZhY2VzW2tdLmZhY2U7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gbWVzaC5mYWNlc1trXS5jb2xvcjtcbiAgICAgICAgICAgICAgICB2YXIgdjEgPSBtZXNoLnZlcnRpY2VzW2ZhY2VbMF1dO1xuICAgICAgICAgICAgICAgIHZhciB2MiA9IG1lc2gudmVydGljZXNbZmFjZVsxXV07XG4gICAgICAgICAgICAgICAgdmFyIHYzID0gbWVzaC52ZXJ0aWNlc1tmYWNlWzJdXTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgbm9ybWFsXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogQ2FuIHRoaXMgYmUgY2FsY3VsYXRlZCBqdXN0IG9uY2UsIGFuZCB0aGVuIHRyYW5zZm9ybWVkIGludG9cbiAgICAgICAgICAgICAgICAvLyBjYW1lcmEgc3BhY2U/XG4gICAgICAgICAgICAgICAgdmFyIGNhbV90b192ZXJ0ID0gdGhpcy5jYW1lcmEucG9zaXRpb24uc3VidHJhY3QodjEudHJhbnNmb3JtKHdvcmxkX21hdHJpeCkpO1xuICAgICAgICAgICAgICAgIHZhciBzaWRlMSA9IHYyLnRyYW5zZm9ybSh3b3JsZF9tYXRyaXgpLnN1YnRyYWN0KHYxLnRyYW5zZm9ybSh3b3JsZF9tYXRyaXgpKTtcbiAgICAgICAgICAgICAgICB2YXIgc2lkZTIgPSB2My50cmFuc2Zvcm0od29ybGRfbWF0cml4KS5zdWJ0cmFjdCh2MS50cmFuc2Zvcm0od29ybGRfbWF0cml4KSk7XG4gICAgICAgICAgICAgICAgdmFyIG5vcm0gPSBzaWRlMS5jcm9zcyhzaWRlMik7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm0ubWFnbml0dWRlKCkgPD0gMC4wMDAwMDAwMSl7XG4gICAgICAgICAgICAgICAgICAgIG5vcm0gPSBub3JtO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm0gPSBub3JtLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBCYWNrZmFjZSBjdWxsaW5nLlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fYmFja2ZhY2VfY3VsbGluZyB8fCBjYW1fdG9fdmVydC5kb3Qobm9ybSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd3ZwX21hdHJpeCA9IHdvcmxkX21hdHJpeC5tdWx0aXBseShjYW1lcmFfbWF0cml4KS5tdWx0aXBseShwcm9qZWN0aW9uX21hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3djEgPSB2MS50cmFuc2Zvcm0od3ZwX21hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3djIgPSB2Mi50cmFuc2Zvcm0od3ZwX21hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3djMgPSB2My50cmFuc2Zvcm0od3ZwX21hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkcmF3ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBEcmF3IHN1cmZhY2Ugbm9ybWFsc1xuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZmFjZV90cmFucyA9IE1hdHJpeC50cmFuc2xhdGlvbih3djEueCwgd3YxLnksIHYxLnopO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmRyYXdFZGdlKHd2MSwgbm9ybS5zY2FsZSgyMCkudHJhbnNmb3JtKGZhY2VfdHJhbnMpLCB7J3InOjI1NSxcImdcIjoyNTUsXCJiXCI6MjU1fSlcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBGaXggZnJ1c3R1bSBjdWxsaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgcmVhbGx5IHN0dXBpZCBmcnVzdHVtIGN1bGxpbmcuLi4gdGhpcyBjYW4gcmVzdWx0IGluIHNvbWUgZmFjZXMgbm90IGJlaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIGRyYXduIHdoZW4gdGhleSBzaG91bGQsIGUuZy4gd2hlbiBhIHRyaWFuZ2xlcyB2ZXJ0aWNlcyBzdHJhZGRsZSB0aGUgZnJ1c3RydW0uXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9mZnNjcmVlbih3djEpICYmIHRoaXMub2Zmc2NyZWVuKHd2MikgJiYgdGhpcy5vZmZzY3JlZW4od3YzKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYXcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RyYXdfbW9kZSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3VHJpYW5nbGUod3YxLCB3djIsIHd2MywgY29sb3IucmdiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZHJhd19tb2RlID09PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlnaHRfZGlyZWN0aW9uID0gbGlnaHQuc3VidHJhY3QodjEudHJhbnNmb3JtKHdvcmxkX21hdHJpeCkpLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbGx1bWluYXRpb25fYW5nbGUgPSBub3JtLmRvdChsaWdodF9kaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yID0gY29sb3IubGlnaHRlbihpbGx1bWluYXRpb25fYW5nbGUqMTUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsbFRyaWFuZ2xlKHd2MSwgd3YyLCB3djMsIGNvbG9yLnJnYik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fYmFja19idWZmZXJfY3R4LnB1dEltYWdlRGF0YSh0aGlzLl9iYWNrX2J1ZmZlcl9pbWFnZSwgMCwgMCk7XG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLl9iYWNrX2J1ZmZlciwgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG59O1xuLyoqXG4gKiBBZGQgYSBtZXNoIHRvIHRoZSBzY2VuZS5cbiAqIEBtZXRob2RcbiAqIEBwYXJhbSB7TWVzaH0gbWVzaFxuICovXG5TY2VuZS5wcm90b3R5cGUuYWRkTWVzaCA9IGZ1bmN0aW9uKG1lc2gpe1xuICAgIHRoaXMubWVzaGVzW21lc2gubmFtZV0gPSBtZXNoO1xufTtcbi8qKlxuICogUmVtb3ZlIGEgbWVzaCB0byB0aGUgc2NlbmUuXG4gKiBAbWV0aG9kXG4gKiBAcGFyYW0ge01lc2h9IG1lc2hcbiAqL1xuU2NlbmUucHJvdG90eXBlLnJlbW92ZU1lc2ggPSBmdW5jdGlvbihtZXNoKXtcbiAgICBkZWxldGUgdGhpcy5tZXNoZXNbbWVzaC5uYW1lXTtcbn07XG4vKipcbiAqIFVwZGF0ZSB0aGUgc2NlbmVcbiAqIEBtZXRob2RcbiAqL1xuU2NlbmUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuX2tleV9jb3VudCA+IDApe1xuICAgICAgICB0aGlzLmZpcmUoJ2tleWRvd24nKTtcbiAgICB9XG4gICAgLy8gVE9ETzogQWRkIGtleXVwLCBtb3VzZWRvd24sIG1vdXNlZHJhZywgbW91c2V1cCwgZXRjLlxuICAgIGlmICh0aGlzLl9uZWVkc191cGRhdGUpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJTY2VuZSgpO1xuICAgICAgICB0aGlzLl9uZWVkc191cGRhdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5fYW5pbV9pZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjZW5lO1xuIiwidmFyIENvbG9yID0gcmVxdWlyZSgnY29sb3VyJyk7XG5cbi8qKlxuICogQSAzRCB0cmlhbmdsZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0gYVxuICogQHBhcmFtIHtudW1iZXJ9IGJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3JcbiAqL1xuZnVuY3Rpb24gRmFjZShhLCBiLCBjLCBjb2xvcil7XG4gICAgdGhpcy5mYWNlID0gW2EsIGIsIGNdO1xuICAgIHRoaXMuY29sb3IgPSBuZXcgQ29sb3IoY29sb3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2U7IiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJ2xpbmVhcmFsZ2VhJykuVmVjdG9yO1xudmFyIEZhY2UgPSByZXF1aXJlKCcuL2ZhY2UuanMnKTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0FycmF5LjxWZWN0b3I+fSB2ZXJ0aWNlc1xuICogQHBhcmFtIHtBcnJheS48RmFjZT59IGVkZ2VzXG4gKi9cbmZ1bmN0aW9uIE1lc2gobmFtZSwgdmVydGljZXMsIGZhY2VzKXtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmVydGljZXMgPSB2ZXJ0aWNlcztcbiAgICB0aGlzLmZhY2VzID0gZmFjZXM7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoMCwgMCwgMCk7XG4gICAgdGhpcy5yb3RhdGlvbiA9IHsneWF3JzogMCwgJ3BpdGNoJzogMCwgJ3JvbGwnOiAwfTtcbiAgICB0aGlzLnNjYWxlID0geyd4JzogMSwgJ3knOiAxLCAneic6IDF9O1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIE1lc2ggZnJvbSBhIEpTT04gb2JqZWN0LlxuICogQG1ldGhvZFxuICogQHN0YXRpY1xuICogQHBhcmFtICB7e25hbWU6IHN0cmluZywgdmVydGljaWVzOiBBcnJheS48QXJyYXkuPG51bWJlcj4+LCBmYWNlczoge3tmYWNlOiBBcnJheS48bnVtYmVyPiwgY29sb3I6IHN0cmluZ319fX0ganNvblxuICogQHJldHVybiB7TWVzaH1cbiAqL1xuTWVzaC5mcm9tSlNPTiA9IGZ1bmN0aW9uKGpzb24pe1xuICAgIHZhciB2ZXJ0aWNlcyA9IFtdO1xuICAgIHZhciBmYWNlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBqc29uLnZlcnRpY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgdmFyIHZlcnRleCA9IGpzb24udmVydGljZXNbaV07XG4gICAgICAgIHZlcnRpY2VzLnB1c2gobmV3IFZlY3Rvcih2ZXJ0ZXhbMF0sIHZlcnRleFsxXSwgdmVydGV4WzJdKSk7XG4gICAgfVxuICAgIGZvciAodmFyIGogPSAwLCBsbiA9IGpzb24uZmFjZXMubGVuZ3RoOyBqIDwgbG47IGorKyl7XG4gICAgICAgIHZhciBmYWNlID0ganNvbi5mYWNlc1tqXTtcbiAgICAgICAgZmFjZXMucHVzaChuZXcgRmFjZShmYWNlLmZhY2VbMF0sIGZhY2UuZmFjZVsxXSwgZmFjZS5mYWNlWzJdLCBmYWNlLmNvbG9yKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWVzaChqc29uLm5hbWUsIHZlcnRpY2VzLCBmYWNlcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc2g7XG4iLCIvKiogXG4gKiBAY29uc3RhbnRcbiAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn0gXG4gKi9cbnZhciBLRVlDT0RFUyA9IHtcbiAgICAnc3BhY2UnOiAzMixcbiAgICAnYmFja3NwYWNlJyA6IDgsXG4gICAgJ3RhYicgOiA5LFxuICAgICdlbnRlcicgOiAxMyxcbiAgICAnc2hpZnQnIDogMTYsXG4gICAgJ2N0cmwnIDogMTcsXG4gICAgJ2FsdCcgOiAxOCxcbiAgICAncGF1c2VfYnJlYWsnIDogMTksXG4gICAgJ2NhcHNfbG9jaycgOiAyMCxcbiAgICAnZXNjYXBlJyA6IDI3LFxuICAgICdwYWdlX3VwJyA6IDMzLFxuICAgICdwYWdlIGRvd24nIDogMzQsXG4gICAgJ2VuZCcgOiAzNSxcbiAgICAnaG9tZScgOiAzNixcbiAgICAnbGVmdF9hcnJvdycgOiAzNyxcbiAgICAndXBfYXJyb3cnIDogMzgsXG4gICAgJ3JpZ2h0X2Fycm93JyA6IDM5LFxuICAgICdkb3duX2Fycm93JyA6IDQwLFxuICAgICdpbnNlcnQnIDogNDUsXG4gICAgJ2RlbGV0ZScgOiA0NixcbiAgICAnMCcgOiA0OCxcbiAgICAnMScgOiA0OSxcbiAgICAnMicgOiA1MCxcbiAgICAnMycgOiA1MSxcbiAgICAnNCcgOiA1MixcbiAgICAnNScgOiA1MyxcbiAgICAnNicgOiA1NCxcbiAgICAnNycgOiA1NSxcbiAgICAnOCcgOiA1NixcbiAgICAnOScgOiA1NyxcbiAgICAnYScgOiA2NSxcbiAgICAnYicgOiA2NixcbiAgICAnYycgOiA2NyxcbiAgICAnZCcgOiA2OCxcbiAgICAnZScgOiA2OSxcbiAgICAnZicgOiA3MCxcbiAgICAnZycgOiA3MSxcbiAgICAnaCcgOiA3MixcbiAgICAnaScgOiA3MyxcbiAgICAnaicgOiA3NCxcbiAgICAnaycgOiA3NSxcbiAgICAnbCcgOiA3NixcbiAgICAnbScgOiA3NyxcbiAgICAnbicgOiA3OCxcbiAgICAnbycgOiA3OSxcbiAgICAncCcgOiA4MCxcbiAgICAncScgOiA4MSxcbiAgICAncicgOiA4MixcbiAgICAncycgOiA4MyxcbiAgICAndCcgOiA4NCxcbiAgICAndScgOiA4NSxcbiAgICAndicgOiA4NixcbiAgICAndycgOiA4NyxcbiAgICAneCcgOiA4OCxcbiAgICAneScgOiA4OSxcbiAgICAneicgOiA5MCxcbiAgICAnbGVmdF93aW5kb3cga2V5JyA6IDkxLFxuICAgICdyaWdodF93aW5kb3cga2V5JyA6IDkyLFxuICAgICdzZWxlY3Rfa2V5JyA6IDkzLFxuICAgICdudW1wYWQgMCcgOiA5NixcbiAgICAnbnVtcGFkIDEnIDogOTcsXG4gICAgJ251bXBhZCAyJyA6IDk4LFxuICAgICdudW1wYWQgMycgOiA5OSxcbiAgICAnbnVtcGFkIDQnIDogMTAwLFxuICAgICdudW1wYWQgNScgOiAxMDEsXG4gICAgJ251bXBhZCA2JyA6IDEwMixcbiAgICAnbnVtcGFkIDcnIDogMTAzLFxuICAgICdudW1wYWQgOCcgOiAxMDQsXG4gICAgJ251bXBhZCA5JyA6IDEwNSxcbiAgICAnbXVsdGlwbHknIDogMTA2LFxuICAgICdhZGQnIDogMTA3LFxuICAgICdzdWJ0cmFjdCcgOiAxMDksXG4gICAgJ2RlY2ltYWwgcG9pbnQnIDogMTEwLFxuICAgICdkaXZpZGUnIDogMTExLFxuICAgICdmMScgOiAxMTIsXG4gICAgJ2YyJyA6IDExMyxcbiAgICAnZjMnIDogMTE0LFxuICAgICdmNCcgOiAxMTUsXG4gICAgJ2Y1JyA6IDExNixcbiAgICAnZjYnIDogMTE3LFxuICAgICdmNycgOiAxMTgsXG4gICAgJ2Y4JyA6IDExOSxcbiAgICAnZjknIDogMTIwLFxuICAgICdmMTAnIDogMTIxLFxuICAgICdmMTEnIDogMTIyLFxuICAgICdmMTInIDogMTIzLFxuICAgICdudW1fbG9jaycgOiAxNDQsXG4gICAgJ3Njcm9sbF9sb2NrJyA6IDE0NSxcbiAgICAnc2VtaV9jb2xvbicgOiAxODYsXG4gICAgJ2VxdWFsX3NpZ24nIDogMTg3LFxuICAgICdjb21tYScgOiAxODgsXG4gICAgJ2Rhc2gnIDogMTg5LFxuICAgICdwZXJpb2QnIDogMTkwLFxuICAgICdmb3J3YXJkX3NsYXNoJyA6IDE5MSxcbiAgICAnZ3JhdmVfYWNjZW50JyA6IDE5MixcbiAgICAnb3Blbl9icmFja2V0JyA6IDIxOSxcbiAgICAnYmFja3NsYXNoJyA6IDIyMCxcbiAgICAnY2xvc2VicmFja2V0JyA6IDIyMSxcbiAgICAnc2luZ2xlX3F1b3RlJyA6IDIyMlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLRVlDT0RFUzsiLCJmdW5jdGlvbiBtaXhpbihyZWNlaXZlciwgc3VwcGxpZXIpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzdXBwbGllcikge1xuICAgICAgICBpZiAoc3VwcGxpZXIuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICByZWNlaXZlcltwcm9wZXJ0eV0gPSBzdXBwbGllcltwcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlY2VpdmVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1peGluOyIsInJlcXVpcmUoJy4vLi4vdGVzdHMvaGVscGVycy5qcycpO1xucmVxdWlyZSgnLi8uLi90ZXN0cy9lbmdpbmUvY2FtZXJhLmpzJyk7XG5yZXF1aXJlKCcuLy4uL3Rlc3RzL2VuZ2luZS9zY2VuZS5qcycpO1xucmVxdWlyZSgnLi8uLi90ZXN0cy9nZW9tZXRyeS9mYWNlLmpzJyk7XG5yZXF1aXJlKCcuLy4uL3Rlc3RzL2dlb21ldHJ5L21lc2guanMnKTtcbiIsInZhciBDYW1lcmEgPSByZXF1aXJlKCcuLi8uLi9zcmMvZW5naW5lL2NhbWVyYS5qcycpO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5cbnN1aXRlKCdDYW1lcmEnLCBmdW5jdGlvbigpe1xuICAgIHZhciBjYW1lcmE7XG4gICAgc2V0dXAoZnVuY3Rpb24oKXtcbiAgICAgICAgY2FtZXJhID0gbmV3IENhbWVyYSg2MDAsIDQwMCk7XG4gICAgfSlcbiAgICBzdWl0ZSgncHJvcGVydGllcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHRlc3QoJ2hlaWdodCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBhc3NlcnQub2soY2FtZXJhLmhlaWdodCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoY2FtZXJhLmhlaWdodCwgNDAwKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgc3VpdGUoJ21ldGhvZHMnLCBmdW5jdGlvbigpe1xuXG4gICAgfSk7XG59KTsiLCJ2YXIgU2NlbmUgPSByZXF1aXJlKCcuLi8uLi9zcmMvZW5naW5lL3NjZW5lLmpzJyk7XG52YXIgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcblxuc3VpdGUoJ1NjZW5lJywgZnVuY3Rpb24oKXtcbiAgICBzZXR1cChmdW5jdGlvbigpe1xuICAgICAgICAvL3ZhciBzY2VuZSA9IG5ldyBTY2VuZSh7Y2FudmFzX2lkOiAnd2lyZWZyYW1lJywgd2lkdGg6NjAwLCBoZWlnaHQ6NDAwfSk7XG4gICAgfSk7XG4gICAgc3VpdGUoJ3Byb3BlcnRpZXMnLCBmdW5jdGlvbigpe1xuICAgICAgICB0ZXN0KCdoZWlnaHQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gYXNzZXJ0LmVxdWFsKHNjZW5lLmhlaWdodCwgNDAwKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgc3VpdGUoJ21ldGhvZHMnLCBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICB9KVxufSk7IiwidmFyIEZhY2UgPSByZXF1aXJlKCcuLi8uLi9zcmMvZ2VvbWV0cnkvZmFjZS5qcycpO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5cbnZhciBmYWNlO1xuXG5zdWl0ZSgnRmFjZScsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZhY2U7XG4gICAgc2V0dXAoZnVuY3Rpb24oKXtcbiAgICAgICAgZmFjZSA9IG5ldyBGYWNlKDAsIDEsIDIsIFwicmVkXCIpO1xuICAgIH0pO1xuICAgIHN1aXRlKCdwcm9wZXJ0aWVzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdGVzdCgndmVydGljZXMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGZhY2UuZmFjZVswXSwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoZmFjZS5mYWNlWzFdLCAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChmYWNlLmZhY2VbMl0sIDIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVzdCgnY29sb3InLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGZhY2UuY29sb3IucmdiLnIsIDI1NSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7IiwidmFyIE1lc2ggPSByZXF1aXJlKCcuLi8uLi9zcmMvZ2VvbWV0cnkvbWVzaC5qcycpO1xudmFyIEZhY2UgPSByZXF1aXJlKCcuLi8uLi9zcmMvZ2VvbWV0cnkvZmFjZS5qcycpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJ2xpbmVhcmFsZ2VhJykuVmVjdG9yO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5cbnN1aXRlKCdNZXNoJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgbWVzaDtcbiAgICBzZXR1cChmdW5jdGlvbigpe1xuICAgICAgICBtZXNoID0gbmV3IE1lc2goJ3RyaWFuZ2xlJyxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDEsMCwwKSxcbiAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDAsMSwwKSxcbiAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDAsMCwxKVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgRmFjZSgwLCAxLCAyLCAncmVkJylcbiAgICAgICAgICAgIF0pO1xuICAgIH0pO1xuICAgIHN1aXRlKCdwcm9wZXJ0aWVzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdGVzdCgnbmFtZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5uYW1lLCAndHJpYW5nbGUnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3QoJ3ZlcnRpY2VzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzBdLngsIDEpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMF0ueSwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1swXS56LCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzFdLngsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMV0ueSwgMSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1sxXS56LCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzJdLngsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMl0ueSwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1syXS56LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3QoJ2ZhY2VzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLmZhY2VzWzBdLmZhY2VbMF0sIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2guZmFjZXNbMF0uZmFjZVsxXSwgMSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5mYWNlc1swXS5mYWNlWzJdLCAyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3QoJ3Bvc2l0aW9uJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnBvc2l0aW9uLngsIDApO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gucG9zaXRpb24ueSwgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5wb3NpdGlvbi56LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3QoJ3JvdGF0aW9uJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnJvdGF0aW9uLnBpdGNoLCAwKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnJvdGF0aW9uLnlhdywgMCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5yb3RhdGlvbi5yb2xsLCAwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3QoJ3NjYWxlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnNjYWxlLngsIDEpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2guc2NhbGUueSwgMSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5zY2FsZS56LCAxKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgc3VpdGUoJ21ldGhvZHMnLCBmdW5jdGlvbigpe1xuICAgICAgICB0ZXN0KCdmcm9tSlNPTicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIganNvbiA9IE1lc2guZnJvbUpTT04oXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6ICd0cmlhbmdsZScsXG4gICAgICAgICAgICAgICAgICAgICd2ZXJ0aWNlcyc6W1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEsMCwwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFswLDEsMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMCwwLDFdXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICdmYWNlcyc6W1xuICAgICAgICAgICAgICAgICAgICAgICAgeydmYWNlJzogWzAsIDEsIDJdLCAnY29sb3InOiAncmVkJ31cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMF0ueCwganNvbi52ZXJ0aWNlc1swXS54KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzBdLnksIGpzb24udmVydGljZXNbMF0ueSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1swXS56LCBqc29uLnZlcnRpY2VzWzBdLnopO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMV0ueCwganNvbi52ZXJ0aWNlc1sxXS54KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzFdLnksIGpzb24udmVydGljZXNbMV0ueSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1sxXS56LCBqc29uLnZlcnRpY2VzWzFdLnopO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gudmVydGljZXNbMl0ueCwganNvbi52ZXJ0aWNlc1syXS54KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnZlcnRpY2VzWzJdLnksIGpzb24udmVydGljZXNbMl0ueSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC52ZXJ0aWNlc1syXS56LCBqc29uLnZlcnRpY2VzWzJdLnopO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5mYWNlc1swXS5mYWNlWzBdLCBqc29uLmZhY2VzWzBdLmZhY2VbMF0pO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2guZmFjZXNbMF0uZmFjZVsxXSwganNvbi5mYWNlc1swXS5mYWNlWzFdKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLmZhY2VzWzBdLmZhY2VbMl0sIGpzb24uZmFjZXNbMF0uZmFjZVsyXSk7XG5cbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnBvc2l0aW9uLngsIGpzb24ucG9zaXRpb24ueCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5wb3NpdGlvbi55LCBqc29uLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2gucG9zaXRpb24ueiwganNvbi5wb3NpdGlvbi56KTtcbiAgICAgXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5yb3RhdGlvbi5waXRjaCwganNvbi5yb3RhdGlvbi5waXRjaCk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5yb3RhdGlvbi55YXcsIGpzb24ucm90YXRpb24ueWF3KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnJvdGF0aW9uLnJvbGwsIGpzb24ucm90YXRpb24ucm9sbCk7XG4gICAgICAgIFxuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKG1lc2guc2NhbGUueCwgbWVzaC5zY2FsZS54KTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChtZXNoLnNjYWxlLnksIG1lc2guc2NhbGUueSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwobWVzaC5zY2FsZS56LCBtZXNoLnNjYWxlLnopO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyIsImZ1bmN0aW9uIG5lYXJseUVxdWFsKGEsIGIsIGVwcyl7XG4gICAgaWYgKHR5cGVvZiBlcHMgPT09IFwidW5kZWZpbmVkXCIpIHtlcHMgPSAwLjAxO31cbiAgICB2YXIgZGlmZiA9IE1hdGguYWJzKGEgLSBiKTtcbiAgICByZXR1cm4gKGRpZmYgPCBlcHMpO1xufVxuXG52YXIgaGVscGVycyA9IG5ldyBPYmplY3QobnVsbCk7XG5cbmhlbHBlcnMubmVhcmx5RXF1YWwgPSBuZWFybHlFcXVhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBoZWxwZXJzOyJdfQ==
(15)
});
