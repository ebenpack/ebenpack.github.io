(window.webpackJsonpmain=window.webpackJsonpmain||[]).push([[9],{10:function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__);var lispish_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(53),lispish_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(lispish_js__WEBPACK_IMPORTED_MODULE_0__),initLispish=function initLispish(input,ref){function addTrie(_,s,i){function e(_,s){return lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.print(lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.concat(lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.concat(s,lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(".")),_),{prefix:"",suffix:"",separator:""})}return function _(s,i,t,n){return null===lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i)?null===s?lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.alist(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.alist("_value",lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(e(n,t)))):null===lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s)?lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.put(s,lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.alist("_value",lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(e(n,t)))):lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.put(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.put("_value",lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.push(e(n,t),lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get("_value",lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s))),lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s)),s):null===s?null===lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s)?lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.alist(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),_(null,lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i),t,n)):lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.alist(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),_(lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s),lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i),t,n)):null===lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s)?lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.put(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),_(null,lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i),t,n),s):lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.put(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),_(lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s),lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i),t,n),s)}(_,lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.map((function(_){return _.toLowerCase()}),s),i,s)}function getTrie(_,s){var i=function _(s,i){return null===s?i:lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.map((function(s,e){return"_value"===s?e:_(e,i)}),s)}(function _(s,i){return null===s?null:null===lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i)?lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s):_(lispish_js__WEBPACK_IMPORTED_MODULE_0__.alist.get(lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.car(i),s),lispish_js__WEBPACK_IMPORTED_MODULE_0__.cons.cdr(i))}(_,s),null);return lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.flatten(i)}var docu={},autocomplete=null,namespace;for(namespace in console.log(lispish_js__WEBPACK_IMPORTED_MODULE_0__),lispish_js__WEBPACK_IMPORTED_MODULE_0__)if("__esModule"!==namespace)for(var p in docu[namespace]=[],window[namespace]={},lispish_js__WEBPACK_IMPORTED_MODULE_0__[namespace])"__esModule"!==p&&(window[namespace][p]=lispish_js__WEBPACK_IMPORTED_MODULE_0__[namespace][p],"c"===p[0]&&"r"===p[p.length-1]&&p.length>3||(docu[namespace].push(p),autocomplete=addTrie(autocomplete,lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(p.split("")),lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(namespace.split("")))));function _getCompletions(_,s){return list.reduce(list.sort(getTrie(_,lispish_js__WEBPACK_IMPORTED_MODULE_0__.list.list(s.toLowerCase().split("")))),(function(_,s){return s.concat(_)}),[])}var lispishCompleter={getCompletions:function(_,s,i,e,t){if(0!==e.length){var n=_getCompletions(autocomplete,e.toLowerCase());return n.sort(),n.forEach((function(_,s,i){i[s]={caption:_,snippet:_+"($1)",meta:"lispish"}})),void t(null,n)}t(null,[])}},editor=ace.edit("input"),langTools=ace.require("ace/ext/language_tools");langTools.setCompleters([lispishCompleter]),editor.setTheme("ace/theme/monokai"),editor.getSession().setMode("ace/mode/javascript"),editor.setOptions({fontSize:"16px",enableSnippets:!0,enableBasicAutocompletion:!0,enableLiveAutocompletion:!0});var ref=document.getElementById(ref);function recalculate(editor){for(var code=editor.getValue(),lines=code.split("\n"),chunks,lastChunk;lines[lines.length-1].match(/^\s*$/);)lines.pop();0!==lines.length&&(chunks=lines.reduce((function(_,s,i){return s.match(/^\s*$/)||(s.match(/\/\/=>/)?(_[_.length-1].push("//=> "+i),_.push(_[_.length-1].slice(0))):_[_.length-1].push(s)),_}),[[]]),chunks=chunks.filter((function(_){return _.length>0})),0!==chunks.length&&(chunks=chunks.map((function(chunk){var wantsResult=chunk[chunk.length-1].match(/\/\/=>/),resultPosition=wantsResult?parseInt(chunk.pop().split(" ")[1]):lines.length,result;try{result=JSON.stringify(eval(chunk.join("\n"))),wantsResult&&(lines[resultPosition]="//=> "+result)}catch(_){lines[resultPosition]="//=> "+_.name+": "+_.message}})),code=lines.join("\n"),editor.setValue(code),editor.gotoLine(editor.session.getLength(),editor.session.getLine(editor.session.getLength()-1).length)))}function makeLink(_,s){var i=document.createElement("div"),e=document.createElement("a");return e.href="#",e.textContent=_,e.addEventListener("click",(function(i){i.preventDefault(),"//=>"===_?editor.insert(_):editor.insert((void 0===s?"":s+".")+_+"()")})),i.appendChild(e),i}function heading(_){var s=document.createElement("h3");return s.textContent=_,s.className="namespace",s}editor.commands.addCommand({name:"evaluate",bindKey:{win:"Ctrl-Return",mac:"Command-Return"},exec:recalculate,readOnly:!0});var input=document.getElementById(input);for(namespace in docu)docu.hasOwnProperty(namespace)&&(ref.appendChild(heading(namespace)),docu[namespace].sort(),docu[namespace].forEach((function(_){ref.appendChild(makeLink(_,namespace))})));ref.appendChild(heading("evaluate")),ref.appendChild(makeLink("//=>"))};__webpack_exports__.default=initLispish}}]);