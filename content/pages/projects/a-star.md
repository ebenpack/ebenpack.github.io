+++
title = "A*"
slug = "a-star"
date = 2014-02-15 20:28:00

[taxonomies]
tags = ["JavaScript"]

[extra]
author = "ebenpack"
languages = ["JavaScript"]
description = "A* pathfinding made with JavaScript."
summary = "A* pathfinding."
hidden = true
img = "astar.gif"
+++

<div class="main" style="position:relative;">
    <canvas id="map" style="background-color: black;" width='600' height='240'></canvas>
    <canvas id="particles" style="position: absolute; left: 0; top:0;" width='600' height='240'></canvas>
</div>
<script>
(function(){
    main.astar().then(function(astar){
        new astar("map", "particles");
    });
})();
</script>
