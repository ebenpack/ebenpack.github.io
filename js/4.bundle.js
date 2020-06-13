(window.webpackJsonpmain=window.webpackJsonpmain||[]).push([[4],{3:function(t,i){function a(t,i){this.mapcanvas=document.getElementById(t),this.canvas=document.getElementById(i),this.mapctx=this.mapcanvas.getContext("2d"),this.ctx=this.canvas.getContext("2d"),this.ctx.fillStyle="rgb(0, 255, 0)",this.mouse={x:10,y:4},this.map_width=60,this.block_size=Math.floor(this.canvas.width/this.map_width),this.map_height=Math.floor(this.canvas.height/this.block_size),this.map=[],this.particles=[],this.particle_size=2,this.path_queue=[],this.init()}function e(t,i){this.x=t,this.y=i,this.vel={x:0,y:0},this.ang=0,this.speed=o(1,2),this.path=[],this.destination={x:0,y:0},this.inertia=o(.1,.2)}function s(t){return JSON.stringify([t.x,t.y])}function h(t,i){return Math.abs(i.x-t.x)+Math.abs(i.y-t.y)}function o(t,i){return Math.random()*(i-t)+t}function n(t){for(var i in t)if(t.hasOwnProperty(i))return!1;return!0}a.prototype.init_map=function(t,i,a){a>9&&(a=9);for(var e=this.map,s=0;s<t;s++){e[s]=[];for(var h=0;h<i;h++)10*Math.random()<a?(e[s][h]={x:s,y:h,barrier:!0},this.mapctx.fillStyle="red"):(e[s][h]={x:s,y:h,barrier:!1},this.mapctx.fillStyle="black"),this.mapctx.fillRect(s*this.block_size,h*this.block_size,this.block_size,this.block_size)}},a.prototype.find_neighbors=function(t,i){for(var a=[],e=this.map,s=-1;s<=1;s++)for(var h=-1;h<=1;h++)(s!==h||0!==s)&&void 0!==e[t+s]&&void 0!==e[t+s][i+h]&&!e[t+s][i+h].barrier&&Math.abs(s)+Math.abs(h)<2&&a.push({x:t+s,y:i+h,parent:{x:t,y:i}});return a},a.prototype.collides=function(t,i){for(var a=this.map,e=0;e<1;e++)for(var s=0;s<1;s++){var h=this.map_location(t+e*this.particle_size,i+s*this.particle_size);if(void 0===a[h.x]||void 0===a[h.x][h.y]||!0===a[h.x][h.y].barrier)return!0}return!1},a.prototype.map_location=function(t,i){return{x:Math.floor(t/this.block_size),y:Math.floor(i/this.block_size)}},a.prototype.init_particles=function(t){for(var i=0;i<t;){var a=Math.floor(o(1,this.canvas.width-2)),s=Math.floor(o(1,this.canvas.height-2));if(!this.collides(a,s)){this.map_location(a,s);this.particles.push(new e(a,s)),i+=1}}},a.prototype.queue_path_updates=function(){for(var t=0;t<this.particles.length;t++)this.path_queue.push(this.particles[t])},a.prototype.update_particles=function(){if(this.path_queue.length>0){var t=this.path_queue.shift();this.set_particle_path(t);for(var i=[],a=this.map_location(t.x,t.y),e=0;e<this.path_queue.length;e++){var s=this.map_location(this.path_queue[e].x,this.path_queue[e].y);a.x===s.x&&a.y===s.y&&i.push(e)}for(;i.length>0;){var h=i.pop();this.path_queue[h].path=t.path.slice(0),this.path_queue.splice(h,1)}}},a.prototype.draw_particles=function(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.beginPath();for(var t=0;t<this.particles.length;t++){var i=this.particles[t];this.update_particle(i),this.move_particle(i),this.ctx.rect(Math.round(i.x),Math.round(i.y),this.particle_size,this.particle_size)}this.ctx.fill(),this.ctx.closePath()},a.prototype.move_goal=function(t){this.mouse.x=t.hasOwnProperty("offsetX")?t.offsetX:t.layerX,this.mouse.y=t.hasOwnProperty("offsetY")?t.offsetY:t.layerY,this.queue_path_updates()},a.prototype.init=function(){this.canvas.addEventListener("click",this.move_goal.bind(this)),this.init_map(this.map_width,this.map_height,3),this.init_particles(20),this.update()},a.prototype.update=function(){this.update_particles(),this.draw_particles(),window.requestAnimationFrame(this.update.bind(this))},a.prototype.update_particle=function(t){var i=this.map_location(t.x,t.y);i.x===t.destination.x&&i.y===t.destination.y&&t.path.length>0&&(t.destination=t.path.pop()),t.ang=function(t,i,a,e){var s=a-t,h=e-i,o=Math.atan2(h,s);o<0&&(o+=2*Math.PI);return o}(t.x,t.y,t.destination.x*this.block_size+this.block_size/2,t.destination.y*this.block_size+this.block_size/2);var a=t.speed*Math.cos(t.ang),e=t.speed*Math.sin(t.ang);t.vel.x=t.vel.x+(a-t.vel.x)*t.inertia,t.vel.y=t.vel.y+(e-t.vel.y)*t.inertia},a.prototype.move_particle=function(t){var i=Math.round(t.vel.x+t.x),a=Math.round(t.vel.y+t.y);i>0&&i<this.canvas.width-1&&a>0&&a<this.canvas.height-1&&!this.collides(i,a)?(t.x=i,t.y=a):this.collides(a,i)},a.prototype.set_particle_path=function(t){var i=this.map_location(t.x,t.y),a=this.map_location(this.mouse.x,this.mouse.y);i.parent=null,i.g=0,i.h=h(i,a),i.f=i.g+i.h;var e={};e[s(i)]=i;for(var o={};!n(e);){var r=-1,p=1/0;for(var c in e)e[c].f<p&&(r=c,p=e[c].f);var l=e[r];delete e[r],o[r]=l;for(var u=this.find_neighbors(l.x,l.y),f=0;f<u.length;f++){var y=u[f];y.parent=l,y.g=y.parent.g+1,y.h=h(y,a),y.f=y.g+y.h;var v=s(y);if(v in e&&!(v in o)?y.g<e[v].g&&(e[v]=y):v in o||(e[v]=y),y.x===a.x&&y.y===a.y){o[s(y)]=y;for(var _=[],d=o[s(a)];null!==d;)_.push({x:d.x,y:d.y}),d=d.parent;return t.destination={x:_[_.length-1].x,y:_[_.length-1].y},void(t.path=_)}}}n(e)&&(t.path.length=0)},t.exports=a}}]);