---
title: A*
slug: a-star
tags: JavaScript
languages: JavaScript
published: 2014-02-15 20:28:00
author: ebenpack
description: A* pathfinding made with JavaScript.
summary: A* pathfinding.
status: hidden
img: astar.gif
---

```{=html}
<div class="main" style="position:relative;">
    <canvas id="map" style="background-color: black;" width='600' height='240'></canvas>
    <canvas id="particles" style="position: absolute; left: 0; top:0;" width='600' height='240'></canvas>
</div>
<script>
    (function(){
        var maze = new main.astar("map", "particles");
    })();
</script>
```