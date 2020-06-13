---
title: Lattice Boltzmann
slug: lattice-boltzmann
tags: JavaScript
languages: JavaScript
published: 2015-08-02 20:28:00
author: ebenpack
description: An implementation of the lattice Boltzmann method with JavaScript.
summary: A computational fluid dynamics simulation.
img: lattice-boltzmann.gif
---

```{=html}
<div class="main" style="position:relative;">
<div class="canvases" style="position: relative; height: 240px; width: 600px;">
    <canvas id="boltzmann" style="background-color: #9044FF; position: absolute; left: 0; top: 0;" width='600' height='240'></canvas>
    <canvas id="vectorcanvas" style="position: absolute; left: 0; top: 0;; pointer-events: none" width='600' height='240'></canvas>
    <canvas id="particlecanvas" style="position: absolute; left: 0; top: 0; pointer-events: none" width='600' height='240'></canvas>
    <canvas id="barriercanvas" style="position: absolute; left: 0; top: 0; pointer-events: none" width='600' height='240'></canvas>
</div>
<div id="controls" class="controls">   
    <select id="drawmode">
        <option value="speed">Speed</option>
        <option value="xvelocity">X Velocity</option>
        <option value="yvelocity">Y Velocity</option>
        <option value="density">Density</option>
        <option value="curl">Curl</option>
        <option value="nothing">Nothing</option>
    </select>
    <label><input id="flowvectors" type="checkbox" name="flowvectors"> Flow Vectors</label>
    <label><input id="flowparticles" type="checkbox" name="flowparticles"> Flow Particles</label>
    <button id="play">Start</button>
    <button id="reset">Reset</button>
    <button id="clearbarriers">Clear barriers</button>
    <br>
    <br>
    <label><input id="viscosity" type="range" name="viscosity" min="2" max="50"> Viscosity</label><br><br>
    <label><input id="speed" type="range" name="anim-speed" min="1" max="15"> Animation Speed</label>
    <br><br>
    <label><input id="flow-speed" type="range" name="flow-speed" value="0" min="0" max="100"> Flow Speed</label>
</div>
<div style="border:1px solid gray; width: 600px; padding: 10px; margin-top:10px;">
    <p><b>Left click</b> to drag fluid</p>
    <p><b>Right click</b> to draw/erase barriers</p>
</div>
<div id="debug"></div>
</div>
<script>
main.boltzmann().then(function(boltzmann){
    boltzmann({
        boltzId: "boltzmann",
        latticeWidth: 200,
        latticeHeight: 80,
        vectorcanvasId: "vectorcanvas",
        particlecanvasId: "particlecanvas",
        barriercanvasId: "barriercanvas",
    });
});
</script>
```
