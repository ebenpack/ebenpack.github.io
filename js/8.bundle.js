(window.webpackJsonpmain=window.webpackJsonpmain||[]).push([[8],{6:function(e,t){e.exports=function(e){var t,n,r,o=document.getElementById(e.boltzId),a=document.getElementById(e.vectorcanvasId),i=document.getElementById(e.particlecanvasId),f=document.getElementById(e.barriercanvasId),c=o.getContext("2d"),d=a.getContext("2d"),s=i.getContext("2d"),l=f.getContext("2d"),v=e.latticeWidth,u=e.latticeHeight,h=o.width,y=o.height,m=.02,w=v*u,g=new Array(w),E=new Array(w),p=new Array(w),L=new Array(w),A=new Array(w),I=new Array(w),M=new Array(w),b=new Array(w),x=new Array(w),P=new Array(w),k=new Array(w),B=new Array(w),X=new Array(w),Y=new Array(w),R=1/(3*m+.5),O=0,T=!1,S=!0,C=[],D=0,q=null,H=10,F=Math.floor(o.width/v);function J(){for(var e=0,t=C.length;e<t;e++){var n=C[e],r=Math.floor(n.x),o=Math.floor(n.y);if(r>=0&&r<v&&o>=0&&o<u){var a=k[o*v+r],i=B[o*v+r];n.x+=a,n.y+=i}D>0&&n.x>v-2&&(n.x=1)}}function z(e){var t,n;if(void 0!==e){for(n=0;n<u;n++)for(t=0;t<v;t++)X[n*v+t]=0;for(var r=0;r<e.length;r++)X[e[r].y*v+e[r].x]=1}else for(n=0;n<u;n++)for(t=0;t<v;t++)(0===t||t===v-1||0===n||n===u-1||Math.abs(v/2-t)<10&&Math.abs(u/2-n)<10)&&(X[n*v+t]=1)}function W(){var e,t,n,r=v,o=u;for(t=o-2;t>0;t--)for(e=1;e<r-1;e++)p[n=t*r+e]=p[(t-1)*r+e],M[n]=M[(t-1)*r+(e+1)];for(t=o-2;t>0;t--)for(e=r-2;e>0;e--)E[n=t*r+e]=E[t*r+(e-1)],I[n]=I[(t-1)*r+(e-1)];for(t=1;t<o-1;t++)for(e=r-2;e>0;e--)A[n=t*r+e]=A[(t+1)*r+e],x[n]=x[(t+1)*r+(e-1)];for(t=1;t<o-1;t++)for(e=1;e<r-1;e++)L[n=t*r+e]=L[t*r+(e+1)],b[n]=b[(t+1)*r+(e+1)];for(t=1;t<o-1;t++)for(e=1;e<r-1;e++)X[n=t*r+e]&&(E[t*r+(e+1)]=L[n],p[(t+1)*r+e]=A[n],L[t*r+(e-1)]=E[n],A[(t-1)*r+e]=p[n],I[(t+1)*r+(e+1)]=b[n],M[(t+1)*r+(e-1)]=x[n],b[(t-1)*r+(e-1)]=I[n],x[(t-1)*r+(e+1)]=M[n])}function j(){for(var e,t=v,n=u,r=1;r<n-1;r++)for(var o=1;o<t-1;o++)if(!X[e=r*t+o]){var a=g[e]+E[e]+p[e]+L[e]+A[e]+I[e]+M[e]+b[e]+x[e],i=(E[e]+I[e]+x[e]-L[e]-M[e]-b[e])/a,f=(A[e]+b[e]+x[e]-p[e]-I[e]-M[e])/a;P[e]=a,k[e]=i,B[e]=f,4==O&&o>0&&o<t-1&&r>0&&r<n-1&&(Y[e]=B[r*t+(o+1)]-B[r*t+(o-1)]-k[(r+1)*t+o]+k[(r-1)*t+o]);var c=3*i,d=3*f,s=i*i,l=f*f,h=2*i*f,y=s+l,m=1.5*y,w=1/9*a,T=1/36*a,S=1+c,C=1-c;g[e]=g[e]+R*(4/9*a*(1-m)-g[e]),E[e]=E[e]+R*(w*(S+4.5*s-m)-E[e]),p[e]=p[e]+R*(w*(1-d+4.5*l-m)-p[e]),L[e]=L[e]+R*(w*(C+4.5*s-m)-L[e]),A[e]=A[e]+R*(w*(1+d+4.5*l-m)-A[e]),I[e]=I[e]+R*(T*(S-d+4.5*(y-h)-m)-I[e]),M[e]=M[e]+R*(T*(C-d+4.5*(y+h)-m)-M[e]),b[e]=b[e]+R*(T*(C+d+4.5*(y-h)-m)-b[e]),x[e]=x[e]+R*(T*(S+d+4.5*(y+h)-m)-x[e])}}function G(){var e=H;!function(){for(var e,t,n=3*D,r=D*D,o=2*D*-0,a=r+0,i=1.5*a,f=4/9*1*(1-i),c=1/9*1*(1+n+4.5*r-i),d=1/9*1*(1-i),s=1/9*1*(1-n+4.5*r-i),l=1/9*1*(1-i),h=1/36*1*(1+n+-0+4.5*(a+o)-i),y=1/36*1*(1-n-0+4.5*(a-o)-i),m=1/36*1*(1-n- -0+4.5*(a+o)-i),w=1/36*1*(1+n- -0+4.5*(a-o)-i),P=0;P<v-1;P++)e=P,g[t=(u-1)*v+P]=g[e]=f,E[t]=E[e]=c,p[t]=p[e]=d,L[t]=L[e]=s,A[t]=A[e]=l,I[t]=I[e]=h,M[t]=M[e]=y,b[t]=b[e]=m,x[t]=x[e]=w;for(var k=0;k<u-1;k++)e=k*v,g[t=k*v+(v-1)]=g[e]=f,E[t]=E[e]=c,p[t]=p[e]=d,L[t]=L[e]=s,A[t]=A[e]=l,I[t]=I[e]=h,M[t]=M[e]=y,b[t]=b[e]=m,x[t]=x[e]=w}();for(var t=0;t<e;t++)W(),j(),C.length>0&&J();te(),q=requestAnimationFrame(G)}function K(){!function(e,t){w=e*t,g=new Array(w),E=new Array(w),p=new Array(w),L=new Array(w),A=new Array(w),I=new Array(w),M=new Array(w),b=new Array(w),x=new Array(w),P=new Array(w),k=new Array(w),B=new Array(w),X=new Array(w),Y=new Array(w);for(var n=0;n<w;)g[n]=0,E[n]=0,p[n]=0,L[n]=0,A[n]=0,I[n]=0,M[n]=0,b[n]=0,x[n]=0,P[n]=0,k[n]=0,B[n]=0,X[n]=0,Y[n]=0,n++}(v,u),z([]),function(e,t,n){for(var r=0;r<w;r++)if(!X[r]){P[r]=n,k[r]=e,B[r]=t;var o=3*e,a=3*-t,i=e*e,f=-t*-t,c=2*e*-t,d=i+f,s=1.5*d;g[r]=4/9*n*(1-s),E[r]=1/9*n*(1+o+4.5*i-s),p[r]=1/9*n*(1+a+4.5*f-s),L[r]=1/9*n*(1-o+4.5*i-s),A[r]=1/9*n*(1-a+4.5*f-s),I[r]=1/36*n*(1+o+a+4.5*(d+c)-s),M[r]=1/36*n*(1-o+a+4.5*(d-c)-s),b[r]=1/36*n*(1-o-a+4.5*(d+c)-s),x[r]=1/36*n*(1+o-a+4.5*(d-c)-s)}}(0,0,1),te()}var N,Q,U,V=[];function Z(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+6*(t-e)*n:n<.5?t:n<2/3?e+(t-e)*(2/3-n)*6:e}function $(e,t,n,r){var o=e*F,a=t*F;d.beginPath(),d.moveTo(o,a),d.lineTo(Math.round(o+n*F*200),a+r*F*200),d.stroke(),d.beginPath(),d.arc(o,a,1,0,2*Math.PI,!1),d.fill(),d.closePath()}function _(e,t){s.beginPath(),s.arc(e*F,t*F,1,0,2*Math.PI,!1),s.fill(),s.closePath()}function ee(){for(var e=0;e<v;e++)for(var t=0;t<u;t++)X[t*v+e]&&(l.beginPath(),l.rect(e*F,t*F,F,F),l.fill(),l.closePath())}function te(){var e,o,a;if(T&&d.clearRect(0,0,h,y),C.length>0)for(s.clearRect(0,0,h,y),e=0,a=C.length;e<a;e++)_(C[e].x,C[e].y);for(S&&(l.clearRect(0,0,h,y),ee(),S=!1),e=0;e<v;e++)for(o=0;o<u;o++){var i,f=o*v+e;if(!X[f]){i=0;var m=k[f],w=B[f];if(T&&e%10==0&&o%10==0&&$(e,o,m,w),0===O){var g=Math.sqrt(Math.pow(m,2)+Math.pow(w,2));i=parseInt(400*(g+.21))}else if(1==O)i=parseInt(400*(m+.21052631578));else if(2==O)i=parseInt(400*(w+.21052631578));else if(3==O){var E=P[f];i=parseInt(400*(E-.75))}else if(4==O){var p=Y[f];i=parseInt(400*(p+.25196850393))}else if(5==O)continue;i>=400?i=399:i<0&&(i=0);for(var L=V[i],A=o*F;A<(o+1)*F;A++)for(var I=e*F;I<(e+1)*F;I++){var M=4*(I+A*r);n[M+0]=L.r,n[M+1]=L.g,n[M+2]=L.b,n[M+3]=L.a}}}c.putImageData(t,0,0)}function ne(){d.clearRect(0,0,h,y),s.clearRect(0,0,h,y),c.clearRect(0,0,h,y),l.clearRect(0,0,h,y),ee(),S=!1}function re(e,t,n,r){var o=(e-n)/F/H,a=(t-r)/F/H;Math.abs(o)>.1&&(o=.1*Math.abs(o)/o),Math.abs(a)>.1&&(a=.1*Math.abs(a)/a);for(var i=Math.floor(e/F),f=Math.floor(t/F),c=-5;c<=5;c++)for(var d=-5;d<=5;d++)if(i+c>=0&&i+c<v&&f+d>=0&&f+d<u&&!X[(f+d)*v+(i+c)]&&Math.sqrt(c*c+d*d)<5){var s=(f+d)*v+(i+c),l=o,h=a,y=P[s],m=3*l,w=3*-h,k=l*l,B=-h*-h,Y=2*l*-h,R=k+B,O=1.5*R;g[s]=4/9*y*(1-O),E[s]=1/9*y*(1+m+4.5*k-O),p[s]=1/9*y*(1+w+4.5*B-O),L[s]=1/9*y*(1-m+4.5*k-O),A[s]=1/9*y*(1-w+4.5*B-O),I[s]=1/36*y*(1+m+w+4.5*(R+Y)-O),M[s]=1/36*y*(1-m+w+4.5*(R-Y)-O),b[s]=1/36*y*(1-m-w+4.5*(R+Y)-O),x[s]=1/36*y*(1+m-w+4.5*(R-Y)-O)}n=e,r=t}function oe(e){if(1===(e.which||e.button)&&q){var t=e.hasOwnProperty("offsetX")?e.offsetX:e.layerX,n=e.hasOwnProperty("offsetY")?e.offsetY:e.layerY;o.addEventListener("mousemove",r,!1),o.addEventListener("mouseup",a,!1),o.addEventListener("touchmove",r,!1),document.body.addEventListener("touchend",a,!1)}function r(e){var r=e.hasOwnProperty("offsetX")?e.offsetX:e.layerX,o=e.hasOwnProperty("offsetY")?e.offsetY:e.layerY;re(r,o,t,n),t=r,n=o}function a(e){o.removeEventListener("mousemove",r,!1),o.removeEventListener("mouseup",a,!1),o.removeEventListener("touchmove",r,!1),document.body.removeEventListener("touchend",a,!1)}}function ae(e){e.preventDefault();var t,n=e.hasOwnProperty("offsetX")?e.offsetX:e.layerX,r=e.hasOwnProperty("offsetY")?e.offsetY:e.layerY,a=Math.floor(n/F),i=Math.floor(r/F),f=i*v+a;function c(e){n=e.hasOwnProperty("offsetX")?e.offsetX:e.layerX,r=e.hasOwnProperty("offsetY")?e.offsetY:e.layerY,a=Math.floor(n/F),i=Math.floor(r/F),X[i*v+a]=t,S=!0,q||te()}function d(e){o.removeEventListener("mousemove",c,!1),o.removeEventListener("mouseup",d,!1),o.removeEventListener("touchmove",c,!1),document.body.removeEventListener("touchend",d,!1)}t=X[f]=1^X[f],o.addEventListener("mousemove",c,!1),o.addEventListener("mouseup",d,!1),o.addEventListener("touchmove",c,!1),document.body.addEventListener("touchend",d,!1)}d.strokeStyle="red",d.fillStyle="red",s.strokeStyle="black",s.fillStyle="black",l.fillStyle="yellow",t=c.createImageData(h,y),n=t.data,r=t.width,function(e){for(var t=0;t<e;t++)V[t]=(void 0,r=void 0,void 0,void 0,void 0,1,function(e,t,n){var r,o,a;if(0===t)r=o=a=n;else{var i=n<.5?n*(1+t):n+t-n*t,f=2*n-i;r=Z(f,i,e+1/3),o=Z(f,i,e),a=Z(f,i,e-1/3)}return{r:Math.round(255*r),g:Math.round(255*o),b:Math.round(255*a),a:255}}(1-(r=0-(n=e)/(t-n)),1,r/2));var n,r}(400);var ie={},fe=o.getBoundingClientRect();function ce(e){for(var t=e.changedTouches,n=0,r=t.length;n<r;n++)ie[t[n].identifier+".x"]=t[n].clientX-fe.left,ie[t[n].identifier+".y"]=t[n].clientY-fe.top}function de(e){5==(O=this.selectedIndex)&&ne()}function se(e){H=parseInt(this.value,10)}function le(e){m=parseInt(this.value,10)/100,R=1/(3*m+.5)}function ve(e){this.checked?T=!0:(T=!1,d.clearRect(0,0,h,y))}function ue(e){this.checked?function(){C.length=0;for(var e=1;e<8;e++)for(var t=1;t<20;t++)X[10*e*v+10*t]||C.push({x:10*t,y:10*e})}():(C.length=0,s.clearRect(0,0,h,y))}function he(e){window.cancelAnimationFrame(q),q=null,e.innerHTML="Start"}function ye(e){var t;q?he(this):(t=this,G(),t.innerHTML="Pause")}function me(e){he(N),T=!1,C.length=0,Q.checked=!1,U.checked=!1,K(),ne()}function we(e){z([]),ne()}function ge(e){D=parseInt(this.value,10)/833}o.addEventListener("touchmove",(function(e){e.preventDefault();for(var t=e.changedTouches,n=0,r=t.length;n<r;n++){var o=ie[t[n].identifier+".x"],a=ie[t[n].identifier+".y"],i=t[n].clientX-fe.left,f=t[n].clientY-fe.top;re(i,f,o,a),ie[t[n].identifier+".x"]=i,ie[t[n].identifier+".y"]=f}}),!1),document.body.addEventListener("touchend",(function(e){var t=e.changedTouches,n=0;for(t.length;n<0;n++)delete ie[t[n].identifier+".x"],delete ie[t[n].identifier+".y"]}),!1),o.addEventListener("mousedown",oe,!1),o.addEventListener("touchstart",ce,!1),o.addEventListener("contextmenu",ae,!1),document.getElementById("drawmode").addEventListener("change",de,!1),document.getElementById("viscosity").addEventListener("input",le,!1),document.getElementById("speed").addEventListener("input",se,!1),(Q=document.getElementById("flowvectors")).addEventListener("click",ve,!1),(U=document.getElementById("flowparticles")).addEventListener("click",ue,!1),(N=document.getElementById("play")).addEventListener("click",ye,!1),document.getElementById("reset").addEventListener("click",me,!1),document.getElementById("clearbarriers").addEventListener("click",we,!1),document.getElementById("flow-speed").addEventListener("input",ge,!1),K()}}}]);