+++
title = "Conway's Game of Life"
slug = "game-of-life"
date = 2014-02-15 20:28:00

[taxonomies]
tags = ["JavaScript"]

[extra]
author = "ebenpack"
languages = ["JavaScript"]
description = "Conway's Game of Life made with JavaScript."
summary = "Conway's Game of Life made with JavaScript."
hidden = true
img = "game-of-life.png"
+++

<div id="game" class="game">
    <canvas id="gol" style="border: 1px solid black;position:relative;" width='600' height='400'></canvas>
</div>
<script>
(function(){
    main.conway().then(function(conway){
        new conway('gol', 50);
    });
})();
</script>
