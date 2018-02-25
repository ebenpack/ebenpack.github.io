function luminance(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function asciify(inputWidth, inputHeight, outputWidth, outputHeight, monochrome, ctx, fontSize, fidelity) {
    // Characters from 'darkest' to 'lightest'
    var asciiLuminanceMap = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft\/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    var ratio;
    var inputSampleWidth;
    var inputSampleHeight;
    var incrementX;
    var incrementY;
    ctx.font = fontSize + "pt Courier";
    var fontWidth = ctx.measureText('W').width;
    var fontHeight = fontSize;
    resize(inputWidth, inputHeight, outputWidth, outputHeight);

    function draw(imageData) {
        // For each ascii character in the output
        for (var y = 0; y < outputHeight; y += fontHeight) {
            for (var x = 0; x < outputWidth; x += fontWidth) {
                // Loop over input sample, determine average RGB
                // and luminance values
                var blockLuminanceTotal = 0;
                var redTotal = 0;
                var greenTotal = 0;
                var blueTotal = 0;
                var area = 0;
                for (var y2 = 0; y2 < inputSampleHeight; y2 += incrementY) {
                    for (var x2 = 0; x2 < inputSampleWidth; x2 += incrementX) {
                        var index = ((Math.round(x * ratio) + x2) + ((Math.round(y * ratio) + y2) * inputWidth)) * 4;
                        if (index < imageData.length) {
                            var red = imageData[index];
                            var green = imageData[index + 1];
                            var blue = imageData[index + 2];
                            redTotal += red;
                            greenTotal += green;
                            blueTotal += blue;
                            blockLuminanceTotal += luminance(red, green, blue);
                            area += 1;
                        }
                    }
                }
                var blockLuminanceAvg = blockLuminanceTotal / area;
                var idx = Math.floor((asciiLuminanceMap.length - 1) * blockLuminanceAvg);
                if (!monochrome) {
                    var r = Math.floor(redTotal / area);
                    var g = Math.floor(greenTotal / area);
                    var b = Math.floor(blueTotal / area);
                    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                }
                var character = asciiLuminanceMap[idx];
                ctx.fillText(character, x, y);
            }
        }
    }

    function resize(iWidth, iHeight, oWidth, oHeight) {
        inputWidth = iWidth;
        inputHeight = iHeight;
        outputWidth = oWidth;
        outputHeight = oHeight;
        ratio = inputWidth / outputWidth;
        inputSampleWidth = Math.floor(fontWidth * ratio);
        inputSampleHeight = Math.floor(fontHeight * ratio);
        incrementX = Math.max(1, Math.floor(inputSampleWidth * (1 - fidelity)));
        incrementY = Math.max(1, Math.floor(inputSampleHeight * (1 - fidelity)));
    }

    function toggleMonochrome(){
        ctx.fillStyle = "black";
        monochrome = !monochrome;
    }

    return {
        toggleMonochrome: toggleMonochrome,
        draw: draw,
        resize: resize,
    };
}

module.exports = asciify;