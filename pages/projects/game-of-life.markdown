---
title: Conway's Game of Life
slug: game-of-life
tags: JavaScript
languages: JavaScript
date: 2014-02-15 20:28
author: ebenpack
description: Conway's Game of Life made with JavaScript.
summary: Conway's Game of Life made with JavaScript.
status: hidden
img: game-of-life.png
---

```{=html}
<div id="game" class="game">
    <canvas id="gol" style="border: 1px solid black;position:relative;" width='600' height='400'></canvas>
</div>
<script>
(function(){
    var GOL = new main.conway('gol', 50);
})();
</script>
```
