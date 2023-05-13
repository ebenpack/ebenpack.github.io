+++
title = "VU"
slug = "vu"
date = 2015-07-29 17:18:00

[taxonomies]
tags = ["JavaScript"]

[extra]
author = "ebenpack"
languages = ["JavaScript"]
description = "A 3d sound visualizer."
summary = "A 3d sound visualizer."
img = "vu.gif"
+++

<canvas id="canvas" width="600" height="400" style="background-color:black;"></canvas>
<div>
    <p>Drop an audio file onto the canvas above (some <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats" rel="noreferrer">filetype restrictions</a> may apply). You can also use the audio file that is loaded by default. Once the status reads 'Ready!', click the canvas to begin playback.</p>
</div>
<div>
    <p>Click on the canvas to give it focus. Move with WASDRF keys. Look around with QETG.</p>
</div>
<script>
    main.vu().then((vu) => vu("/audio/piano-sonata-no13.ogg"));
</script>
