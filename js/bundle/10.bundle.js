(window.webpackJsonpmain=window.webpackJsonpmain||[]).push([[10],{12:function(t,e,r){"use strict";r.r(e);var n=r(17),o=r(86),a=r(18),i=r(83),c=r(82),l=r(30),u=r(49),f=r(35),s=[a.d.theme({"&":{color:"#abb2bf",backgroundColor:"#272822",fontSize:"1.3em"},".cm-content":{caretColor:"white"},"&.cm-focused .cm-cursor":{borderLeftColor:"white"},"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":{backgroundColor:"#49483e"},".cm-panels":{backgroundColor:"#272822",color:"#abb2bf"},".cm-panels.cm-panels-top":{borderBottom:"2px solid black"},".cm-panels.cm-panels-bottom":{borderTop:"2px solid black"},".cm-searchMatch":{backgroundColor:"#72a1ff59",outline:"1px solid #457dff"},".cm-searchMatch.cm-searchMatch-selected":{backgroundColor:"#6199ff2f"},".cm-activeLine":{backgroundColor:"#373831"},".cm-selectionMatch":{backgroundColor:"#aafe661a"},"&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bad0f847",outline:"1px solid #515a6b"},".cm-gutters":{backgroundColor:"#272822",color:"white",border:"none",borderRight:"1px solid white"},".cm-activeLineGutter":{backgroundColor:"#373831"},".cm-foldPlaceholder":{backgroundColor:"transparent",border:"none",color:"#ddd"},".cm-tooltip":{border:"none",backgroundColor:"#353a42"},".cm-tooltip .cm-tooltip-arrow:before":{borderTopColor:"transparent",borderBottomColor:"transparent"},".cm-tooltip .cm-tooltip-arrow:after":{borderTopColor:"#353a42",borderBottomColor:"#353a42"},".cm-tooltip-autocomplete":{"& > ul > li[aria-selected]":{backgroundColor:"#373831",color:"#abb2bf"}}},{dark:!0}),f.a.define([{tag:f.d.keyword,color:"#c678dd"},{tag:[f.d.name,f.d.deleted,f.d.character,f.d.propertyName,f.d.macroName],color:"white"},{tag:[f.d.function(f.d.variableName),f.d.labelName],color:"#61afef"},{tag:[f.d.color,f.d.constant(f.d.name),f.d.standard(f.d.name)],color:"#66D9EF"},{tag:[f.d.definition(f.d.name),f.d.separator],color:"#abb2bf"},{tag:[f.d.typeName,f.d.className,f.d.number,f.d.changed,f.d.annotation,f.d.modifier,f.d.self,f.d.namespace],color:"#AE81FF"},{tag:[f.d.operator,f.d.operatorKeyword,f.d.url,f.d.escape,f.d.regexp,f.d.link,f.d.special(f.d.string)],color:"#56b6c2"},{tag:[f.d.meta,f.d.comment],color:"#7d8799"},{tag:f.d.strong,fontWeight:"bold"},{tag:f.d.emphasis,fontStyle:"italic"},{tag:f.d.strikethrough,textDecoration:"line-through"},{tag:f.d.link,color:"#7d8799",textDecoration:"underline"},{tag:f.d.heading,fontWeight:"bold",color:"#F92672"},{tag:[f.d.atom,f.d.bool,f.d.special(f.d.variableName)],color:"#fd971f"},{tag:[f.d.processingInstruction,f.d.string,f.d.inserted],color:"#98c379"},{tag:f.d.invalid,color:"#ffffff"}])];function d(t){return(d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function h(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */h=function(){return e};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value},a="function"==typeof Symbol?Symbol:{},i=a.iterator||"@@iterator",c=a.asyncIterator||"@@asyncIterator",l=a.toStringTag||"@@toStringTag";function u(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{u({},"")}catch(t){u=function(t,e,r){return t[e]=r}}function f(t,e,r,n){var a=e&&e.prototype instanceof b?e:b,i=Object.create(a.prototype),c=new P(n||[]);return o(i,"_invoke",{value:_(t,r,c)}),i}function s(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=f;var p="suspendedStart",m="executing",g="completed",y={};function b(){}function v(){}function w(){}var x={};u(x,i,(function(){return this}));var k=Object.getPrototypeOf,L=k&&k(k(T([])));L&&L!==r&&n.call(L,i)&&(x=L);var E=w.prototype=b.prototype=Object.create(x);function C(t){["next","throw","return"].forEach((function(e){u(t,e,(function(t){return this._invoke(e,t)}))}))}function S(t,e){function r(o,a,i,c){var l=s(t[o],t,a);if("throw"!==l.type){var u=l.arg,f=u.value;return f&&"object"==d(f)&&n.call(f,"__await")?e.resolve(f.__await).then((function(t){r("next",t,i,c)}),(function(t){r("throw",t,i,c)})):e.resolve(f).then((function(t){u.value=t,i(u)}),(function(t){return r("throw",t,i,c)}))}c(l.arg)}var a;o(this,"_invoke",{value:function(t,n){function o(){return new e((function(e,o){r(t,n,e,o)}))}return a=a?a.then(o,o):o()}})}function _(e,r,n){var o=p;return function(a,i){if(o===m)throw Error("Generator is already running");if(o===g){if("throw"===a)throw i;return{value:t,done:!0}}for(n.method=a,n.arg=i;;){var c=n.delegate;if(c){var l=N(c,n);if(l){if(l===y)continue;return l}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===p)throw o=g,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=m;var u=s(e,r,n);if("normal"===u.type){if(o=n.done?g:"suspendedYield",u.arg===y)continue;return{value:u.arg,done:n.done}}"throw"===u.type&&(o=g,n.method="throw",n.arg=u.arg)}}}function N(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,N(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),y;var a=s(o,e.iterator,r.arg);if("throw"===a.type)return r.method="throw",r.arg=a.arg,r.delegate=null,y;var i=a.arg;return i?i.done?(r[e.resultName]=i.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,y):i:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,y)}function O(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function j(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function P(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0)}function T(e){if(e||""===e){var r=e[i];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,a=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return a.next=a}}throw new TypeError(d(e)+" is not iterable")}return v.prototype=w,o(E,"constructor",{value:w,configurable:!0}),o(w,"constructor",{value:v,configurable:!0}),v.displayName=u(w,l,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===v||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,w):(t.__proto__=w,u(t,l,"GeneratorFunction")),t.prototype=Object.create(E),t},e.awrap=function(t){return{__await:t}},C(S.prototype),u(S.prototype,c,(function(){return this})),e.AsyncIterator=S,e.async=function(t,r,n,o,a){void 0===a&&(a=Promise);var i=new S(f(t,r,n,o),a);return e.isGeneratorFunction(r)?i:i.next().then((function(t){return t.done?t.value:i.next()}))},C(E),u(E,l,"Generator"),u(E,i,(function(){return this})),u(E,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},e.values=T,P.prototype={constructor:P,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(j),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return c.type="throw",c.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var a=this.tryEntries.length-1;a>=0;--a){var i=this.tryEntries[a],c=i.completion;if("root"===i.tryLoc)return o("end");if(i.tryLoc<=this.prev){var l=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(l&&u){if(this.prev<i.catchLoc)return o(i.catchLoc,!0);if(this.prev<i.finallyLoc)return o(i.finallyLoc)}else if(l){if(this.prev<i.catchLoc)return o(i.catchLoc,!0)}else{if(!u)throw Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return o(i.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var a=o;break}}a&&("break"===t||"continue"===t)&&a.tryLoc<=e&&e<=a.finallyLoc&&(a=null);var i=a?a.completion:{};return i.type=t,i.arg=e,a?(this.method="next",this.next=a.finallyLoc,y):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),j(r),y}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;j(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:T(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),y}},e}function p(t,e,r,n,o,a,i){try{var c=t[a](i),l=c.value}catch(t){return void r(t)}c.done?e(l):Promise.resolve(l).then(n,o)}(function(){var t,e=(t=h().mark((function t(){var e,f,d,p,m,g,y,b,v;return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.e(4).then(r.bind(null,87));case 2:(e=t.sent).evaluate,f=e.Thing,d=document.querySelector("#scheme"),p=document.querySelector("#output"),m=document.querySelector("#eval"),g=n.f.create({doc:"(define (foldl fn acc ls)\n    (if (null? ls)\n        acc\n        (foldl fn (fn acc (car ls)) (cdr ls))))\n(define (foldr fn acc ls)\n    (if (null? ls)\n        acc\n        (fn (car ls) (foldr fn acc (cdr ls)))))\n(define (map fn ls)\n    (foldr (lambda (x xs) (cons (fn x) xs)) '() ls))\n(define (filter fn ls)\n    (foldr (lambda (x xs) (if (fn x) (cons x xs) xs)) '() ls))\n(define (double n) (+ n n))\n(define (even?  n) (= 0 (modulo n 2)))\n(define (zero?  n) (= 0 n))\n(define (sub1   n) (- n 1))\n(define (not    b) (if b #f #t))\n(foldl  + 0    '(1 2 3 4 5))\n(map    double '(1 2 3 4 5))\n(filter even?  '(1 2 3 4 5 6 7 8 9 10))\n(let* ([a 5] [b (+ a 10)]) (+ b 20))\n(letrec\n    ([is-even?\n        (lambda (n)\n            (if (zero? n) #t\n                (is-odd? (sub1 n))))]\n    [is-odd?\n        (lambda (n)\n            (if (zero? n) #f\n                (is-even? (sub1 n))))])\n    (is-odd? 13))\n",extensions:[o.a,s,a.l.of([u.b]),Object(l.b)({class:"cm-mygutter"}),c.a.define(i.a)]}),y=new a.d({state:g,parent:d}),b=function(){console.log(v.read_port("default"))},v=f.new(b),m.addEventListener("click",(function(){var t="string"==typeof y.state.doc?y.state.doc:y.state.doc.sliceString(0),e=v.eval(t);p.textContent=e}));case 14:case"end":return t.stop()}}),t)})),function(){var e=this,r=arguments;return new Promise((function(n,o){var a=t.apply(e,r);function i(t){p(a,n,o,i,c,"next",t)}function c(t){p(a,n,o,i,c,"throw",t)}i(void 0)}))});return function(){return e.apply(this,arguments)}})()()}}]);