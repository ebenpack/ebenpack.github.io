+++
title = "JS1K Lattice Boltzmann"
slug = "js1k"
date = 2014-02-15 20:28:00

[taxonomies]
tags = ["JavaScript"]

[extra]
author = "ebenpack"
languages = ["JavaScript"]
description = "An implementation of the lattice Boltzmann method with JavaScript for the JS1k contest."
summary = "Lattice Boltzmann, implemented in under 1K."
hidden = true
img = "js1k.gif"
+++

<canvas id="c" style="position: relative;"></canvas>
<script>
(function(){
    var a = document.getElementsByTagName('canvas')[0];
    var b = document.body;
    var c = a.getContext('2d');
    a.width = a.height = 600;
    main.projectwavybits().then(function(projectwavybits){
        projectwavybits();
    });
})();
</script>
