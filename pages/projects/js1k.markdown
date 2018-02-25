---
title: JS1K Lattice Boltzmann
slug: js1k
tags: JavaScript
languages: JavaScript
published: 2014-02-15 20:28:00
author: ebenpack
description: An implementation of the lattice Boltzmann method with JavaScript for the JS1k contest.
summary: Lattice Boltzmann, implemented in under 1K.
status: hidden
img: js1k.gif
---

```{=html}
<canvas id="c" style="position: relative;"></canvas>
<script>
  var a = document.getElementsByTagName('canvas')[0];
  var b = document.body;
  var c = a.getContext('2d');
  a.width = a.height = 600;
</script>
<script>
    main.projectwavybits();
</script>
```