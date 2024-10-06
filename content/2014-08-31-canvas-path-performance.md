+++
title = "Canvas Path Performance"
date = 2014-08-31 12:34:00
slug = "posts/canvas-path-performance.html"

[taxonomies]
tags = ["JavaScript", "Canvas"]

# description: An investigation of a canvas performance issue leads to unexpected results.

[extra]
author = "ebenpack"
summary = "If you’ve done much work with the HTML5 canvas API, and especially if you’ve ever looked into performance tuning your canvas apps, you’ve likely come across the advice to batch your canvas calls together. For example, you may have read that when drawing multiple lines or shapes, it’s better to create a single path and only call your draw method once, drawing all lines and shapes in one go, than it is to draw each line or shape individually."
+++

If you've done much work with the HTML5 canvas API, and especially if you've ever looked into performance tuning your
canvas apps, you've likely come across the advice to batch your canvas calls together. For example, you may have read
that when drawing multiple lines or shapes, it's better to create a single path and only call your draw method once,
drawing all lines and shapes in one go, than it is to draw each line or shape individually. In other words, this:

<!--more-->

```js,linenos
ctx.beginPath();
lineArray.forEach(function(line){
    ctx.moveTo(line.startx, line.starty);
    ctx.lineTo(line.endx, line.endy);
});
// Draw all lines at once.
ctx.stroke();
ctx.closePath();
```

is preferable to this:

```js,linenos
 lineArray.forEach(function(line){
    ctx.beginPath();
    ctx.moveTo(line.startx, line.starty);
    ctx.lineTo(line.endx, line.endy);
    // Draw each line individually.
    ctx.stroke();
    ctx.closePath();
});
```

As I recently discovered, however, this does not always hold true. Performance in certain browsers actually degrades
very quickly as the number of subpaths increases above a certain threshold. More information about how different
browsers perform can be found at this [jsperf](http://jsperf.com/canvas-path-performance/2).

The following test method was used in order to obtain quantitative data to investigate this issue:

```html,linenos
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Long Path</title>
</head>
<body>
    <canvas id="canvas" width="600" height="600"></canvas>
    <script>
        (function(){
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            ctx.strokeStyle = "red";

            var results = [];

            // Draw increasingly long paths
            for (var i=0; i<2000; i+=20){
                ctx.clearRect(0,0,600,600);
                var start = performance.now();
                ctx.beginPath();
                for (var j=0; j<i; j++){
                    ctx.moveTo(0, j);
                    ctx.lineTo(j, 0);
                }
                ctx.stroke();
                ctx.closePath();
                var end = performance.now();
                results.push(end-start);
            }
        })();
    </script>
</body>
</html>
```

What this code is doing is drawing paths to the canvas with increasingly many subpaths. `performance.now()` was used to
measure execution time, as it provides higher resolution timestamps than `Date.now()`. Results were stored in an array,
which was used to produce the chart below.

<svg viewBox="0,0,1000,280">
    <g transform="translate(80,80)">
        <g class="x axis" transform="translate(0,120)">
            <line class="tick minor" y2="-120" x2="0" transform="translate(42,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(126,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(210,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(294,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(378,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(462.00000000000006,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(546,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(630,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(714,0)" style="opacity: 1;"></line>
            <line class="tick minor" y2="-120" x2="0" transform="translate(798,0)" style="opacity: 1;"></line>
            <g transform="translate(0,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">0</text>
            </g>
            <g transform="translate(84,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">200</text>
            </g>
            <g transform="translate(168,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">400</text>
            </g>
            <g transform="translate(252,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">600</text>
            </g>
            <g transform="translate(336,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">800</text>
            </g>
            <g transform="translate(420,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">1,000</text>
            </g>
            <g transform="translate(504,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">1,200</text>
            </g>
            <g transform="translate(588,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">1,400</text>
            </g>
            <g transform="translate(672,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">1,600</text>
            </g>
            <g transform="translate(756,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">1,800</text>
            </g>
            <g transform="translate(840,0)" style="opacity: 1;">
                <line class="tick" y2="-120" x2="0"></line>
                <text y="3" x="0" dy=".71em" text-anchor="middle">2,000</text>
            </g>
            <path class="domain" d="M0,-120V0H840V-120"></path>
        </g>
        <g class="y axis" transform="translate(-25,0)">
            <g transform="translate(0,120)" style="opacity: 1;">
                <line class="tick" x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" text-anchor="end">0</text>
            </g>
            <g transform="translate(0,95.24057071334579)" style="opacity: 1;">
                <line class="tick" x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" text-anchor="end">200</text>
            </g>
            <g transform="translate(0,70.4811414266916)" style="opacity: 1;">
                <line class="tick" x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" text-anchor="end">400</text>
            </g>
            <g transform="translate(0,45.7217121400374)" style="opacity: 1;">
                <line class="tick" x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" text-anchor="end">600</text>
            </g>
            <g transform="translate(0,20.962282853383186)" style="opacity: 1;">
                <line class="tick" x2="-6" y2="0"></line>
                <text x="-9" y="0" dy=".32em" text-anchor="end">800</text>
            </g>
            <path class="domain" d="M-6,0H0V120H-6"></path>
        </g>
        <text class="y label" text-anchor="end" y="6" dy=".75em" transform="rotate(-90)">execution time</text>
        <text class="y label" text-anchor="end" y="25" dy=".75em" transform="rotate(-90)">(milliseconds)</text>
        <text class="x label" text-anchor="end" x="160" y="160" dx=".75em">number of subpaths</text>
        <rect x="70" y="55" width="10" height="10" style="fill: steelblue;"></rect>
        <rect x="70" y="25" width="10" height="10" style="fill: rgb(223, 94, 98);"></rect>
        <text text-anchor="start" x="90" y="65">Chrome</text>
        <text text-anchor="start" x="90" y="35">Firefox</text>
        <path class="chartline1" d="M0,119.99715266556885L8.4,119.9870012997277L16.8,119.98997243134718L25.2,119.98353497935483L33.6,119.97474538213508L42,119.96347984159884L50.4,119.95085253289156L58.800000000000004,119.93599687524448L67.2,119.9170559117332L75.6,119.9005908915384L84,119.81380909178408L92.4,119.52251440624426L100.8,119.83237866373032L109.2,119.80402911705758L117.60000000000001,119.76874693053983L126,119.738292832566L134.4,119.7139047945691L142.8,119.67664185348825L151.2,119.61981896340477L159.6,119.43065692356936L168,119.56101531875817L176.4,119.34276094957032L184.8,119.45318800419147L193.20000000000002,119.42483845751872L201.6,119.38274742789397L210,119.32716250924355L218.4,119.27479631613893L226.8,119.24335184110872L235.20000000000002,119.18900489344098L243.6,119.14765664694629L252,119.09677601965141L260.4,119.03970553519125L268.8,118.99588134538007L277.2,118.93484935224404L285.6,118.89795780227784L294,118.83630682365047L302.4,118.7975583163095L310.8,118.75744804124787L319.2,118.70842437132778L327.6,118.66398119602526L336,118.62647066056772L344.40000000000003,117.35395979214475L352.8,118.54488834092231L361.2,118.37231511892041L369.6,118.44547923246071L378,118.43557546054588L386.40000000000003,118.40512136257203L394.8,118.38159990444316L403.2,118.3497840382983L411.59999999999997,118.32527220311306L420,118.31895854875941L428.40000000000003,118.3085595880912L436.8,118.28800926158183L445.20000000000005,118.2777340990027L453.6,118.25755516405836L462.00000000000006,118.24430886940937L470.40000000000003,118.23948078041511L478.80000000000007,118.22722486282248L487.2,117.81287581395424L495.59999999999997,118.21360717705883L504,118.21385477143552L512.4,118.21992083186285L520.8,118.2107598426277L529.2,118.2123692051754L537.6,118.2080363053849L546,118.20357960840603L554.4,118.20902668289163L562.8000000000001,118.20741731989354L571.2,118.210017059948L579.6,118.20345581121768L588,118.20543656533043L596.4,118.19119989362507L604.8,117.79133511083886L613.1999999999999,118.1970183596757L621.6,118.19738975079036L630,118.19738975079036L638.4,118.1940472280562L646.8000000000001,118.19491380792424L655.2,118.19305685054947L663.6,118.19144748755137L672,118.18327687582297L680.4000000000001,118.17312550998182L688.8000000000001,118.1783249905411L697.2,118.09253356784315L705.6,118.08894345073232L714,118.05910833824981L722.4,118.16730704438154L730.8,118.08931484184697L739.2,118.09216217627812L747.6,118.06269845536065L756,118.02667348571286L764.4,118.16520249263009L772.8000000000001,118.16185996989593L781.2,118.15938402702982L789.6,118.15220379190741L798,118.15307037267618L806.4,118.15269898066077L814.8,118.1533179666025L823.1999999999999,118.14081445508356L831.6,118.15282277784912"></path>
        <path class="chartline2" d="M0,119.9912308291324L8.4,119.93999391376089L16.8,119.94360581930523L25.2,119.90974680456713L33.6,119.87566829748843L42,119.82725767097L50.4,119.53072611852409L58.800000000000004,119.75350762553386L67.2,119.72090193310626L75.6,119.61835568103258L84,119.55524278160658L92.4,119.50405129978782L100.8,119.51322144961271L109.2,119.43695720792967L117.60000000000001,119.2900369828913L126,119.27491726600596L134.4,119.13142993583818L142.8,119.00078123633557L151.2,118.96507900588423L159.6,118.85537802152959L168,118.76208870108046L176.4,118.64402682884715L184.8,118.53474997351618L193.20000000000002,118.3230038679366L201.6,118.2931461007684L210,118.15872641638828L218.4,118.02142188710482L226.8,117.88072333525474L235.20000000000002,117.73717732523956L243.6,117.2005280847888L252,117.35293759909716L260.4,113.53191762891937L268.8,110.89718666177275L277.2,107.63527545794592L285.6,104.35110008011594L294,101.0171323758162L302.4,97.60070289708865L310.8,94.36911902300646L319.2,90.6793943448271L327.6,87.55608221704398L336,83.95848440410875L344.40000000000003,80.20568223248725L352.8,77.28288236202775L361.2,74.23344556239297L369.6,70.37056569170028L378,67.10857748604835L386.40000000000003,63.670215857264495L394.8,60.44323352311505L403.2,56.307507465220645L411.59999999999997,53.56912510887422L420,47.83764392968311L428.40000000000003,46.02670646541338L436.8,43.49289827456225L445.20000000000005,40.17975473585841L453.6,36.59497661262485L462.00000000000006,32.873368598367264L470.40000000000003,29.00521311227945L478.80000000000007,25.453203722315394L487.2,21.83521949049407L495.59999999999997,19.685698811483718L504,16.636561229551546L512.4,14.742435425402121L520.8,15.10897636870753L529.2,14.755852931523862L537.6,12.933001848866894L546,12.931146872425032L554.4,14.418725571225323L562.8000000000001,13.544054412295864L571.2,11.614251384718287L579.6,12.094303540951373L588,10.586572152277313L596.4,11.398966042519348L604.8,10.661775823806948L613.1999999999999,10.117330953248143L621.6,11.77077925869709L630,9.823872417368008L638.4,7.789974683008694L646.8000000000001,10.0715295991846L655.2,8.72169144321795L663.6,7.964194654778922L672,5.639081960224502L680.4000000000001,8.914967881129385L688.8000000000001,5.657684833622511L697.2,5.7032650859815135L705.6,6.380235544579136L714,4.908095464115149L722.4,4.899469774139476L730.8,3.6037475599813007L739.2,3.914607889343941L747.6,3.4469436183657365L756,4.266697744151614L764.4,3.4666475435839743L772.8000000000001,4.536972788419362L781.2,3.9160970452180948L789.6,2.7566662044977335L798,1.1558531031896564L806.4,1.372214985373617L814.8,1.626467955355011L823.1999999999999,1.313460859676212L831.6,0"></path>
    </g>
</svg>

The takeaway, it would seem, is that you may see performance drop off precipitously in some browsers when the number of
subpaths in your path reaches or exceeds ~600. If you encounter this issue, in order to work around it, paths should be
periodically drawn and closed. In other words, paths should not be fully batched together, but should be batched into
chunks. Experimentation has shown that keeping subpaths to <200 provides relatively good performance.

Addendum: Further testing suggests this issue is not very widespread at all, and does not affect all versions of
Firefox. Currently, these results are reproducible in Firefox 31.0 running on Arch Linux. Firefox 31.0 running on
OS X 10.7 does not produce similar results. After further investigation, this sounds like it may be an issue with
[cairo](https://bugzilla.mozilla.org/show_bug.cgi?id=703281).