(window.webpackJsonpmain=window.webpackJsonpmain||[]).push([[11],{7:function(e,n,t){var o=t(3);e.exports=function(e){var n,t=new(0,o.engine.Scene)({canvas_id:"canvas",width:600,height:400});!function(){for(var e=o.geometry.Mesh,r=[],a=[],i=0;i<20;i++)for(var c=0;c<16;c++)r.push([20*c-160,0,-20*i]);for(i=0;i<19;i++)for(c=0;c<15;c++){var d=c+16*i,s=c+1+16*i,f=c+1+16*(i+1),u=c+16*(i+1);a.push({face:[d,u,f],color:"green"}),a.push({face:[d,f,s],color:"green"})}n=e.fromJSON({name:"vu",vertices:r,faces:a}),t.camera.moveTo(0,-200,400),t.camera.lookDown(.2),t.addMesh(n),t.addListener("keydown",(function(e){t.isKeyDown("w")&&t.camera.moveForward(3),t.isKeyDown("s")&&t.camera.moveBackward(3),t.isKeyDown("a")&&t.camera.moveLeft(3),t.isKeyDown("d")&&t.camera.moveRight(3),t.isKeyDown("r")&&t.camera.moveUp(3),t.isKeyDown("f")&&t.camera.moveDown(3),t.isKeyDown("t")&&t.camera.lookUp(.02),t.isKeyDown("g")&&t.camera.lookDown(.02),t.isKeyDown("q")&&t.camera.turnLeft(.02),t.isKeyDown("e")&&t.camera.turnRight(.02)})),t.toggleBackfaceCulling()}(),function(){var o=document.getElementById("canvas"),r=document.createElement("div");r.appendChild(document.createTextNode(""));var a=document.createElement("button");a.style.marginLeft="10px",a.appendChild(document.createTextNode("Start")),r.appendChild(a),r.loading=function(){this.childNodes[0].textContent="Audio loading...",this.style.color="red",this.childNodes[1].disabled=!0},r.ready=function(){this.childNodes[0].textContent="Ready!",this.style.color="green",this.childNodes[1].disabled=!1},r.error=function(){this.childNodes[0].textContent="Error! File type not supported",this.style.color="red",this.childNodes[1].disabled=!0},r.loading(),o.nextSibling?o.parentNode.insertBefore(r,o.nextSibling):o.parentNode.appendChild(r);var i,c,d,s,f,u=new(window.AudioContext||window.webkitAudioContext),l=!1;function w(){(s=u.createScriptProcessor(2048,1,1)).connect(u.destination),i=u.createAnalyser(),c=new Uint8Array(i.frequencyBinCount),i.fftSize=64,(d=u.createBufferSource()).connect(i),i.connect(s),d.connect(u.destination)}function v(e){u.decodeAudioData(e,(function(e){a.removeEventListener("click",f),function(e){r.ready(),f=function(n){l?(this.textContent="Start",p+=(new Date-m)/1e3,l=!1,d.stop(),w()):(this.textContent="Stop",d.buffer=e,l=!0,m=new Date,d.start(0,p))},a.addEventListener("click",f)}(e)}),h)}var m,p=0;function h(e){r.error()}o.addEventListener("dragover",(function(e){e.preventDefault()}),!1),o.addEventListener("drop",(function(e){e.preventDefault(),p=0,r.loading();var n=e.dataTransfer.files,t=new FileReader;t.onload=function(e){v(e.target.result)},t.readAsArrayBuffer(n[0])}));var y,g,D=new Date;w(),y=e,(g=new XMLHttpRequest).open("GET",y,!0),g.responseType="arraybuffer",g.onload=function(){p=0,v(g.response)},g.send(),window.requestAnimationFrame((function e(){i.getByteFrequencyData(c),function(e){var o,r=new Date;if(r-D>100){for(var a=19;a>=1;a--)for(var i=0;i<16;i++){var c=i+16*(a-1),d=i+16*a;n.vertices[d].y=n.vertices[c].y}D=r}for(c=0;c<16;c++)o=e[c]/2,n.vertices[c].y=-o;t.renderScene()}(c),window.requestAnimationFrame(e)}))}()}}}]);