+++
title = "VideoASCII"
slug = "videoascii"
date = 2014-11-22 15:19:00

[taxonomies]
tags = ["JavaScript"]

[extra]
author = "ebenpack"
languages = ["JavaScript"]
description = "An ASCII video renderer."
summary = "An ASCII video renderer."
img = "videoascii.gif"
+++

<canvas id="canvas" width="300" height="300">
    Sorry, this browser does not support canvas.
</canvas>
<button id="start">Start</button><button id="pause">Pause</button><button id="restart">Restart</button>
<label>Monochrome<input id="monochrome" type="checkbox" checked="checked"></label>
<script>
    (function(){
        main.videoascii().then(function(videoascii){
            var canvas = document.getElementById('canvas');
            var start = document.getElementById('start');
            var pause = document.getElementById('pause');
            var restart = document.getElementById('restart');
            var monochrome = document.getElementById('monochrome');
            var ctx = canvas.getContext('2d');
            // Prepare canvas and display instruction
            canvas.style.border = "4px dashed gray";
            ctx.textAlign = "center"; 
            ctx.font = "14pt Arial"; 
            ctx.fillText("Drop video files here to asciify", 150, 150); 
            function make_ascii(canvas, videoSrc){
                canvas.style.border = "";
                var vid = videoascii({
                    canvas: canvas,
                    output_width: canvas.parentElement.offsetWidth,
                    videoSrc: videoSrc,
                    font_size: 8,
                    monochrome: true,
                    autoplay: false
                });
                start.addEventListener('click', function(){
                    vid.start();
                });
                pause.addEventListener('click', function(){
                    vid.pause();
                });
                restart.addEventListener('click', function(){
                    vid.restart();
                });
                monochrome.addEventListener('click', function(){
                    vid.toggleMonochrome();
                });
                window.addEventListener('resize', function() {
                    vid.resize(canvas.parentElement.offsetWidth);
                });
            }
            // Register canvas drag 'n' drop handler
            canvas.addEventListener("dragover", function (e) {
                e.preventDefault();
            }, false);
            canvas.addEventListener("drop", function (e) {
                e.preventDefault();
                var files = e.dataTransfer.files;
                var tempvid = document.createElement('video');
                if (files.length > 0) {
                    var file = files[0];
                    if (tempvid.canPlayType(file.type)) {
                        make_ascii(canvas, file);
                    }
                }
                e.preventDefault();
            }, false);
        });
    })()
</script>
