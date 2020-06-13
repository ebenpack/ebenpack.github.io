---
title: Computational Fluid Dynamics Made Easy
tags: JavaScript, Lattice Boltzmann
slug: lattice-boltzmann
published: 2014-02-16 12:49:00
author: ebenpack
description: Implementing the lattice Boltzmann method with JavaScript.
summary: Implementing the lattice Boltzmann method with JavaScript.
---

```{=html}
<div style="height:0">
    <svg width="0" height="0">
        <!-- Definitions -->
        <defs>
            <!-- Hatching pattern -->
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(-45)">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <path d="M -1,50 H 200" stroke="#000000" stroke-width="20"/>
            </pattern>
        </defs>
        <defs>
            <g id="arrow-group">
                <line x1="0" y1="0" x2="125" y2="125" stroke-width="10"></line>
                <polygon points="155,155 145,105 105,145"></polygon>
            </g>
        </defs>
        <defs>
            <g id="arrow-group-short">
                <line x1="0" y1="0" x2="85" y2="85" stroke-width="10"></line>
                <polygon points="110,110 100,60 60,100"></polygon>
            </g>
        </defs>
        <defs>
            <g id="triangle">
                <line x1="200" y1="0" x2="0" y2="347" stroke-width="10"></line>
                <line x1="200" y1="0" x2="400" y2="347" stroke-width="10"></line>
                <line x1="0" y1="347" x2="400" y2="347" stroke-width="10"></line>
            </g>
        </defs>
        <defs>
            <g id="particle-arrow">
                <circle cx="0" cy="0" r="30"></circle>
                <line x1="0" y1="0" x2="175" y2="0" stroke-width="15"></line>
                <polygon points="200,0 170,-20 170,20"></polygon>
            </g>
        </defs>
        <defs>
            <g id="arrow-group-large">
                <line x1="0" y1="0" x2="470" y2="470" stroke-width="10"></line>
                <polygon points="485,485 475,435 435,475"></polygon>
            </g>
        </defs>
        <defs>
            <g id="arrow-group-large-short">
                <line x1="0" y1="0" x2="330" y2="330" stroke-width="10"></line>
                <polygon points="345,345 335,295 295,335"></polygon>
            </g>
        </defs>
    </svg>
</div>
```

Over the 2013 winter holidays I was looking for a project to work on. I had been interested in learning more about the
canvas element for a while, so, with the snow driving o’er the fields, I decided to make a simple snow simulation to
start learning some canvas basics. Once I had a simple snow program up and running in the canvas, I turned my attention
to implementing a wind system that would allow users to interact with the snow, creating gusts of wind with their mouse.
My initial naive attempts—which mostly involved a mesh of nodes which contained a single wind vector, and some
mechanism to propagate those vectors to the next node in their direction of travel—were fairly unsatisfactory, so I
began to look for ways to improve the wind system. After some cursory googling, I started looking in earnest at
computational fluid dynamics. This led me to the Navier-Stokes equations, which seemed just a little too complicated
for what I was after. Navier-Stokes led me to lattice-gas automata (LGA), which, while conceptually quite simple, has
some inherent issues. Finally, LGA led to the lattice Boltzmann methods (LBM).

<!--more-->

In the 1970s and 1980s, the LGA model was developed to simulate fluid flow. This model uses a lattice comprised of
individual cellular automata. Each cell can be in one of several states, each state representing particles at the cell
moving with different discrete velocities. For example, in one of the most popular forms of the model, in which the
lattice is represented as a hexagonal grid of cells, each cell has six or seven velocities (possibly including the
'at-rest' velocity), and each of these velocities can be in either the 'on' or 'off' state to indicate if there is a
particle at that node traveling at that velocity. Each discrete time step in the model is comprised of two phases: the
streaming phase, in which particles move from one node to the next in their direction of travel, and the collision
phase, in which the particles within a node collide and bounce off each other and change direction.

```{=html}
<div id="lattice-gas-illustration">
    <svg width="300" height="200" viewbox="-20 -20 1230 650">
        <!-- First row -->
        <g class="triangle" transform="translate(0,0)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(200,-52) rotate(180 200 200)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(400, 0)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(600, -52) rotate(180 200 200)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(800, 0)">
            <use xlink:href="#triangle" />
        </g>
        <!-- Second row -->
        <g class="triangle" transform="translate(0,294) rotate(180 200 200)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(200,345)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(400,294) rotate(180 200 200)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(600,345)">
            <use xlink:href="#triangle" />
        </g>
        <g class="triangle" transform="translate(800,294) rotate(180 200 200)">
            <use xlink:href="#triangle" />
        </g>
        <!-- Particles -->
        <g class="particle-arrow" transform="translate(400,347)">
            <use xlink:href="#particle-arrow" />
        </g>
        <g class="particle-arrow" transform="translate(800,347) rotate(-120)">
            <use xlink:href="#particle-arrow" />
        </g>
        <g class="particle-arrow" transform="translate(400,347) rotate(60)">
            <use xlink:href="#particle-arrow" />
        </g>
        <g class="particle-arrow" transform="translate(400,347) rotate(120)">
            <use xlink:href="#particle-arrow" />
        </g>
        <g class="particle-arrow" transform="translate(800,347) rotate(120)">
            <use xlink:href="#particle-arrow" />
        </g>
    </svg>
    <p class="illustration-label">Two cells in a lattice-gas automata</p>
</div>
```

While its conceptual simplicity is alluring, LGA has some major shortcomings, many of which LBM directly addresses.
And while LBM sacrifices a small amount of LGA's simplicity for the sake of increased accuracy and robustness, LBM is
actually still surprisingly quite simple. Like LGA, LBM also consists of a lattice of nodes, but where LGA's nodes have
a finite set of possible states, LBM's nodes contain a set of particle distribution functions (DFs). In other words,
LBM is continuous where LGA is discrete.

LBM comes in many flavors. It can easily be configured for one-, two-, or three-dimensional spaces, each of which has
its own variants. In this example we will be discussing D2Q9, which means a two-dimensional lattice, with nine discrete
distribution functions per node. Other common configurations include D1Q3, D1Q5, D3Q15, and D3Q19

Each node in the lattice consists of a set of particle DFs. Together, these DFs represent a collection of particles, and
are related to the probability of finding a particle at a node, at a given time, with a particular velocity. For D2Q9,
there are nine DFs per node. The density of these DFs is represented by \\(n*i\\). Each DF is also associated with a
velocity, represented by \\( \\vec{e}*{i}\\). These velocities correspond to the four cardinal directions, the four
ordinal directions, as well as the 'at-rest' velocity. These velocities are chosen such that they carry a particle from
a node in the lattice to one of its neighboring nodes. For convenience, these velocities are each assigned a number, as
seen below.

```{=html}
<div id="node-distribution-illustration">
    <svg width="200" height="200" viewbox="-300 -300  1620 1620">
        <!-- Directions -->
        <rect class="outer" width="990" height="990" x="20" y="20" stroke="black" stroke-width="20" fill="white" />
        <!-- Ordinals -->
        <g class="arrow-3" transform="translate(515,515) rotate(0)">
            <use xlink:href="#arrow-group-large" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(90)">
            <use xlink:href="#arrow-group-large" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(180)">
            <use xlink:href="#arrow-group-large" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(270)">
            <use xlink:href="#arrow-group-large" />
        </g>

        <!-- Cardinals -->
        <g class="arrow-3" transform="translate(515,515) rotate(45)">
            <use xlink:href="#arrow-group-large-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(135)">
            <use xlink:href="#arrow-group-large-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(225)">
            <use xlink:href="#arrow-group-large-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(315)">
            <use xlink:href="#arrow-group-large-short" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <text x="-100" y="-50"
            font-family="Verdana"
            font-size="75">
            6
        </text>
        <text x="500" y="-50"
            font-family="Verdana"
            font-size="75">
            2
        </text>
        <text x="1100" y="-50"
            font-family="Verdana"
            font-size="75">
            5
        </text>
        <text x="-100" y="550"
            font-family="Verdana"
            font-size="75">
            3
        </text>
        <text x="600" y="500"
            font-family="Verdana"
            font-size="75">
            0
        </text>
        <text x="1100" y="550"
            font-family="Verdana"
            font-size="75">
            1
        </text>
        <text x="1100" y="1120"
            font-family="Verdana"
            font-size="75">
            8
        </text>
        <text x="500" y="1120"
            font-family="Verdana"
            font-size="75">
            4
        </text>
        <text x="-100" y="1120"
            font-family="Verdana"
            font-size="75">
            7
        </text>
    </svg>
    <p class="illustration-label">Discrete velocities for D2Q9 model</p>
</div>
```

The \\(x\\) and \\(y\\) components of the velocities for each \\( \\vec{e}\_{i}\\) are shown below, and as you can see
they correspond to the diagram above.

\\(
\begin{alignat}{7}
&\\vec{e}\_{0} = (&0, &&0) \\quad \\\\
&\\vec{e}\_{1} = (&1, &&0) \\quad &\\vec{e}\_{5} = (& 1, &&1) \\\\
&\\vec{e}\_{2} = (&0, &&1) \\quad &\\vec{e}\_{6} = (&-1, &&1) \\\\
&\\vec{e}\_{3} = (&-1, &&0) \\quad &\\vec{e}\_{7} = (&-1,&&-1) \\\\
&\\vec{e}\_{4} = (&0, &&-1) \\quad &\\vec{e}\_{8} = (& 1,&&-1) \\\\
\end{alignat}
\\)

For each node in the lattice, two important properties can be calculated from the DFs. The macroscopic density at a
particular node is described by the equation \\( \\rho = \sum n\_{i} \\), or the summation of the densities of the
individual distribution functions of a node (i.e. the macroscopic density). Once the density has been calculated, it
can then be used to calculate the macroscopic velocity, \\( \\vec{u} = \\frac{1}{\\rho} \sum n\_{i} \\vec{e}\_{i}\\).

Like the LGA, the LBM consists of two phases which update the DFs: namely, streaming, and collision. In the streaming
phase, the DFs of each node move to the next node in their direction of travel. It is also during this phase that
boundary conditions are considered. If a boundary is encountered, the distributions that would have been streamed into
the boundary are in some way redirected away from that boundary. More will be said of this later.

```{=html}
<div id="stream-start-illustration">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Streaming, start -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(185,185) rotate(0)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(185,515) rotate(315)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(185,845) rotate(270)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(515,185) rotate(45)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />

        <!-- Ordinal directions -->
        <g class="arrow-1" transform="translate(515,515) rotate(0)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(180)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(270)">
            <use xlink:href="#arrow-group" />
        </g>

        <!-- Cardinal directions -->
        <g class="arrow-1" transform="translate(515,515) rotate(45)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(135)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(225)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-1" transform="translate(515,515) rotate(315)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(515,845) rotate(225)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(845,185) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="845" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(845,515) rotate(135)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="845" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(845,845) rotate(180)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="845" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>
    </svg>
    <p class="illustration-label">Prior to streaming phase</p>
</div>
```

```{=html}
<div id="stream-end-illustration">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Streaming, end -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,185) rotate(180)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,515) rotate(135)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,845) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(515,185) rotate(225)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />

        <!-- Ordinal directions -->
        <g class="arrow-3" transform="translate(515,515) rotate(0)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(180)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(270)">
            <use xlink:href="#arrow-group" />
        </g>

        <!-- Cardinal directions -->
        <g class="arrow-3" transform="translate(515,515) rotate(45)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(135)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(225)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(315)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(515,845) rotate(45)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(845,185) rotate(270)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="845" cy="185" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(845,515) rotate(315)">
            <use xlink:href="#arrow-group-short" />
        </g>
        <circle cx="845" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(845,845) rotate(0)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="845" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>
    </svg>
    <p class="illustration-label">After streaming phase</p>
</div>
```

The collision phase moves the DFs at a node towards a local equilibrium. The collision phase for the LBM is somewhat
more complicated than that of LGA. The most important thing for this phase is that however the collision is calculated,
it must conserve mass, momentum and energy. One common approach to this phase is to make use of the
Bhatnagar-Gross-Krook (BGK) relaxation term. This is described by the equation
\\( \\Omega\_{i}=-\\tau^{-1}(n_i-n_i^{eq})\\), where \\( n_i^{eq} \\) is a local equilibrium value for the DFs.
The term \\( \\tau \\) is a relaxation time, and is related to the viscosity. Equilibrium is calculated with the
equation \\( n\_{i}^{eq} = \\rho\\omega\_{i}[1+3\\vec{e}\_{i}\\cdot\\vec{u}+\\frac{9}{2}(\\vec{e}\_{i}\\cdot\\vec{u}^{2})-\\frac{3}{2}|\\vec{u}|^{2}] \\),
where the weights \\(\\omega\_{i}\\) are as follows:

\\(
\\begin{cases}\\begin{alignat}{2}
\\omega\_{i=0} = \\frac{4}{9} \\\\
\\omega\_{i=\\{1..4\\}}= \\frac{1}{9} \\\\
\\omega\_{i=\\{5..8\\}}= \\frac{1}{36}
\\end{alignat}\\end{cases}
\\)

The new equilibrium values after collision are calculated with the following equation
\\( n\_{i}^{new} = n\_{i}^{old}+\\frac{1}{\\tau}(n\_{i}^{eq}-n\_{i}^{old})\\)

There are many options for handling boundary conditions, but for the sake of brevity we will only discuss a few of the
highlights. One of the most important distinctions with boundary conditions is between slip and no-slip conditions.
These describe the behavior of the fluid at the interface between fluid and solid boundary. The slip condition
represents a non-zero relative velocity between the fluid and the boundary, while no-slip represents a zero velocity
at the boundary.

In terms of implementation in a lattice Boltzmann simulation, these two boundary conditions would look like this: in
this example, before streaming, we have three distribution functions of three different nodes, all with the same
velocity. If boundary conditions were ignored, after streaming, each of these DFs would land within a boundary.

```{=html}
<div id="bounce-start-illustration-no-slip">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Boundary conditions, starting position -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,515) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-2" transform="translate(515,515) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(515,845) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
    </svg>
</div>
```

After streaming, with the no-slip condition, each of those distributions are still headed in the same direction,
although they are now traveling in the opposite direction as prior to streaming. No-slip, in essence, can be thought
of as a simple reflection of the particles at the boundary. Upon encountering a boundary, a distribution is bounced back
to its source node, but with an opposing velocity.

```{=html}
<div id="bounce-no-slip-illustration">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Boundary conditions, no-slip -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,515) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-2" transform="translate(515,515) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(515,845) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
    </svg>
</div>
```

Boundary slip is a bit more complicated in terms of implementation. In the example below, we start as before, with three
distribution functions of three different nodes, all headed in the same direction towards a boundary.

```{=html}
<div id="bounce-start-illustration-slip">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Boundary conditions, starting position -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-1" transform="translate(185,515) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-2" transform="translate(515,515) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-3" transform="translate(515,845) rotate(-90)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
    </svg>
</div>
```

After streaming we can see the distributions 'slip' at the boundary.

```{=html}
<div id="bounce-slip-illustration">
    <svg width="200" height="200" viewbox="0 0 1020 1020">
        <!-- Boundary conditions, slip -->
        <!-- First column -->
        <rect class="inner" width="330" height="330" x="20" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="20" y="350" stroke="black" stroke-width="20" fill="white" />
        <circle cx="185" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="20" y="680" stroke="black" stroke-width="20" fill="white" />

        <!-- Second column -->
        <rect class="inner" width="330" height="330" x="350" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="350" y="350" stroke="black" stroke-width="20" fill="white" />
        <g class="arrow-2" transform="translate(515,515) rotate(90)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-1" transform="translate(515,515)">
            <use xlink:href="#arrow-group" />
        </g>
        <g class="arrow-3" transform="translate(515,515) rotate(180)">
            <use xlink:href="#arrow-group" />
        </g>
        <circle cx="515" cy="515" r="30" stroke="black" stroke-width="10" fill="white"></circle>
        <rect class="inner" width="330" height="330" x="350" y="680" stroke="black" stroke-width="20" fill="white" />
        <circle cx="515" cy="845" r="30" stroke="black" stroke-width="10" fill="white"></circle>

        <!-- Third column -->
        <rect class="inner" width="330" height="330" x="680" y="20" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="350" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
        <rect class="inner" width="330" height="330" x="680" y="680" stroke="black" stroke-width="20" fill="url(#diagonalHatch)" />
    </svg>
</div>
```

We can see that, although the three DFs had the same velocity before streaming (i.e. were traveling in the same
direction), after they collide with the boundary, each is headed in a different direction. The direction that a DF is
traveling after encountering a boundary under the slip condition, then, is dependent on the orientation of that
boundary.

Fortunately, not only is no-slip easier to implement, it also generally provides a more accurate simulation. It
simulates the adhesion of a viscous fluid at the boundary, as if the fluid at the edge is sticking to the boundary.
The no-slip condition does not hold in every situation, but for our purposes it is sufficient.

That more or less sums up the lattice Boltzmann method. Of course, it's very broad and deep topic, and I have only
provided a short introduction. Hopefully, though, that will provide enough of a background to understand some of the
implementation details I'm going to discuss below. For more information, "Lattice Boltzmann Simulation for Shallow Water
Flow Applications" (Banda and Seaid) provides a nice, brief introduction, and "Lattice-Gas Cellular Automata and
Lattice Boltzmann Models - An Introduction" (Wolf-Gladrow) presents a much more thorough study of the topic.

## JavaScript Implementation

You can view a demo [here](/pages/projects/lattice-boltzmann.html).

Implementation is not particularly difficult, once you understand the lattice Boltzmann methods. At its most basic,
the LBM requires a lattice of nodes. In this case, for D2Q9, a two-dimensional array suffices to represent our lattice
(technically, an array of length n, with each item consisting of an m length array, where n represents the width of the
lattice, and m represents the height). For each node in the lattice, we must store, at a minimum, the densities of the
DFs. It is also useful, in order to avoid repetition of work, to store the calculated macroscopic density, macroscopic
velocity, the x and y components of that velocity, and the 'curl'. Additionally, a `barrier` boolean was stored on each
node, as well as a `stream` array, used to temporarily store streamed values. Altogether, the constructor looked like
this:

```{.javascript .numberLines}
function LatticeNode() {
    this.distribution = [0,0,0,0,0,0,0,0,0]; // Individual densities for
    // each of the nine DFs of a node.
    this.stream = [0,0,0,0,0,0,0,0,0]; // Used to temporarily hold streamed values
    this.density = 0; // Macroscopic density of a node.
    this.ux = 0; // X component of macroscopic velocity of a node.
    this.uy = 0; // Y component of macroscopic velocity of a node.
    this.barrier = false; // Boolean indicating if node is a barrier.
    this.curl = 0; // Curl of node.
}
```

A `stream` and `collide` function are also required. And an `equilibrium` function helps avoid some repetition of code.
These are shown below.

```{.javascript .numberLines}
function stream() {
    // For each node in the lattice
    for (var x = 0; x < lattice_width; x++) {
        for (var y = 0; y < lattice_height; y++) {
            var node = lattice[x][y];
            if (!node.barrier) {
                // For each DF on the node
                for (var d = 0; d < 9; d++) {
                    // Get the velocity for the DF and calculate
                    // the coordinates of the node to stream it to
                    var move = node_directions[d];
                    var newx = move.x + x;
                    var newy = move.y + y;
                    // Check if new node is in the lattice
                    if (newx >= 0 && newx < lattice_width &&
                        newy >= 0 && newy < lattice_height) {
                        // If destination node is barrier, bounce distribution back to
                        // originating node in opposite direction.
                        if (lattice[newx][newy].barrier) {
                            lattice[x][y].stream[reflection[d]] = node.distribution[d];
                        } else {
                            lattice[newx][newy].stream[d] = node.distribution[d];
                        }
                    }
                }
            }
        }
    }
}
```

In this example, the streamed values are placed in the special `node.stream` array. This allows us to avoid obliterating
DF values which we will still need to use, while also allowing us to avoid creating an entirely new `LatticeNode` for
every single node in the lattice.

```{.javascript .numberLines}
function collide() {
    // For each node in the lattice
    for (var x = 0; x < lattice_width; x++) {
        for (var y = 0; y < lattice_height; y++) {
            var node = lattice[x][y];
            if (!node.barrier) {
                var d = node.distribution; // Array of DFs
                for (var p = 0; p < 9; p++) {
                    // Copy over values from streaming phase.
                    d[p] = node.stream[p];
                }
                // Calculate macroscopic density (rho) and velocity (ux, uy)
                var rho = 0;
                var ux = 0;
                var uy = 0;
                for (var i = 0; i < 9; i++) {
                    var direction = node_directions[i]
                    rho += d[i];
                    ux += d[i] * direction.x;
                    uy += d[i] * direction.x;
                }
                // Update values stored in node.
                node.density = rho;
                node.ux = ux;
                node.uy = uy;
                // Set node equilibrium for each velocity
                var eq = equilibrium(ux, uy, rho);
                for (var i = 0; i < 9; i++) {
                    var old_value = d[i];
                    node.distribution[i] = old_value + (omega * (eq[i] - old_value));
                }
            }
        }
    }
}
```

The equilibrium function would look more or less like so:

```{.javascript .numberLines}
function equilibrium(node, ux, uy, rho) {
    // Calculate equilibrium densities of a node
    var eq = []; // Equilibrium values for all velocities in a node.
    var u2 = (ux * ux) + (uy * uy); // Magnitude of macroscopic velocity
    for (var d = 0; d < 9; d++) {
        // Calculate equilibrium value
        var velocity = node_directions[d]; // Node direction vector
        var eu = (velocity.x * ux) + (velocity.y * uy); // Macro velocity multiplied by distribution velocity
        eq.push(node_weight[d] * rho * (1 + 3*eu + 4.5*(eu*eu) - 1.5*u2)); // Equilibrium equation
    }
    return eq;
}
```

It is possible to rewrite these functions such that much of the repetition of work is eliminated, but these are the core
algorithms.

And that's really more or less all that's required at the most basic level. Of course, in order to draw and interact
with the lattice, and do other interesting things, a few more functions are required, and there's going to be some glue
code to stick everything together, but those are mostly just implementation details.

## Difficulties

It took rather a long time to arrive at a proper implementation of the LBM. Not having any prior experience with
computational fluid dynamics, I was learning the material as I was trying to code it. There were a lot of missteps, as
I didn't fully understand the topic, but attempting to code implementations as I learned certainly helped to concretize
the material.

One of the biggest bugbears on this project was related to the coordinate system. The literature on the topic naturally
presents examples and equations in the standard Cartesian coordinate system (i.e. with the origin at the bottom left,
with x increasing as you move right, and y increasing as you move up). However, computer graphics typically place the
origin at the top left (i.e. x increasing as you move right, and y increasing as you move down). This is how the canvas
behaves. This was the source of a subtle and pernicious bug, where I had failed to translate between these coordinate
systems in a single equation. The program appeared to behave mostly correctly, but upon close inspection exhibited odd,
incorrect behavior. At this point, where this bug has been (I hope) thoroughly squashed, I am not planning on
re-engineering the program, but if I were to build this from scratch, knowing what I now know, I would try to find a way
to design the program with a single point of failure for this issue, instead of translating between the coordinate
systems every time something happens on the y-axis.

### Optimizations and improvements

This simulation started out dog-slow. Some optimizations were made here and there (e.g. removing the loop from the
equilibrium function, pre-calculating any shared values, and then calculating each equilibrium value on its own line;
see below), but I believe the most significant speedup came when I added the `stream` array to the `LatticeNode`
objects. With the LBM, it is necessary to have somewhere to store the streamed values so that they don't obliterate the
values ahead of them (although this isn't strictly true... it is possible to achieve the same goal by looping over the
lattice four times, starting from each of the four corners, streaming only a portion of the DFs each time). Previously I
had been creating an entirely new lattice for each time-step. This was very inefficient, and required a lot of extra
work, both to set up and initialize the array, as well as behind the scenes with the extra garbage collection required
when the old array was discarded. So the addition of the `stream` array, along with a few related optimizations, meant
that, instead of throwing away every single node on every single tick, that each node essentially lived in perpetuity,
for the life of the program, and the values it stored (especially the `distribution` array) were never destroyed and
recreated, only ever updated. This obviated the need for much of the garbage collection and object instantiation that
the browser had been performing, and it resulted in a very significant speedup.

```{.javascript .numberLines}
// Optimized equilibrium function.
// Eliminates much repetition of work.
function equilibrium(ux, uy, rho) {
    var eq = []; // Equilibrium values for all velocities in a node.
    var ux3 = 3 * ux;
    var uy3 = 3 * uy;
    var ux2 = ux * ux;
    var uy2 = uy * uy;
    var uxuy2 = 2 * ux * uy;
    var u2 = ux2 + uy2;
    var u215 = 1.5 * u2;
    eq[0] = four9ths * rho * (1 - u215);
    eq[1] = one9th * rho * (1 + ux3 + 4.5*ux2 - u215);
    eq[2] = one9th * rho * (1 - uy3 + 4.5*uy2 - u215);
    eq[3] = one9th * rho * (1 - ux3 + 4.5*ux2 - u215);
    eq[4] = one9th * rho * (1 + uy3 + 4.5*uy2 - u215);
    eq[5] = one36th * rho * (1 + ux3 - uy3 + 4.5*(u2-uxuy2) - u215);
    eq[6] = one36th * rho * (1 - ux3 - uy3 + 4.5*(u2+uxuy2) - u215);
    eq[7] = one36th * rho * (1 - ux3 + uy3 + 4.5*(u2-uxuy2) - u215);
    eq[8] = one36th * rho * (1 + ux3 + uy3 + 4.5*(u2+uxuy2) - u215);
    return eq;
}
```

One of the most significant improvements that I made, in terms of maintainability, clarity, and extensibility, was
refactoring to the module pattern. My early efforts in programming the LBM were not well designed. It can be difficult
to settle on a design before you fully understand the problem at hand. But once I had come to a full understanding of
the problem, and had a more-or-less working (but still poorly designed) implementation, I refactored. Well.. . I say
refactored, but the truth is that it was a complete rewrite. They say 'write one to throw away', and that can be a major
boon on a project. It certainly would have taken longer to reshape my initial design than to start from scratch, and
bugs—introduced as a result of my incomplete understanding of the problem—would have almost certainly come along for the
ride. This module-like architecture has also allowed for more rapid extension of the program, such as the addition of a
new draw-mode, or new controls (play/pause, etc.), and overall it is far less brittle than the ad-hoc, global-ridden
spaghetti-mess the program began as.

<script type="text/javascript" src="/js/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
