import * as lispish from 'lispish.js';

const initLispish = (input, ref) => {
    // Use a trie for autocompletion.
    function addTrie(T, name, namespace) {
        function stringifyName(name, namespace) {
            return lispish.cons.print(
                lispish.list.concat(
                    lispish.list.concat(
                        namespace,
                        lispish.list.list('.')
                    ), name
                ), {
                    prefix: '',
                    suffix: '',
                    separator: ''
                }
            );
        }

        function helper(T, name, namespace, fullName) {
            if (lispish.cons.cdr(name) === null) {
                if (T === null) {
                    return lispish.alist.alist(
                        lispish.cons.car(name),
                        lispish.alist.alist(
                            '_value',
                            lispish.list.list(
                                stringifyName(fullName, namespace)
                            )
                        )
                    );
                } else {
                    if (lispish.alist.get(lispish.cons.car(name), T) === null) {
                        return lispish.alist.put(
                            T,
                            lispish.cons.car(name),
                            lispish.alist.alist(
                                '_value',
                                lispish.list.list(
                                    stringifyName(fullName, namespace)
                                )
                            )
                        );
                    } else {
                        return lispish.alist.put(
                            lispish.cons.car(name),
                            lispish.alist.put(
                                '_value',
                                lispish.list.push(
                                    stringifyName(fullName, namespace),
                                    lispish.alist.get(
                                        '_value',
                                        lispish.alist.get(
                                            lispish.cons.car(name),
                                            T,
                                        ),
                                    ),
                                ),
                                lispish.alist.get(
                                    lispish.cons.car(name),
                                    T,
                                ),
                            ),
                            T
                        );
                    }
                }
            } else {
                if (T === null) {
                    if (lispish.alist.get(lispish.cons.car(name), T) === null) {
                        return lispish.alist.alist(
                            lispish.cons.car(name),
                            helper(
                                null,
                                lispish.cons.cdr(name),
                                namespace,
                                fullName
                            )
                        );
                    } else {
                        return lispish.alist.alist(
                            lispish.cons.car(name),
                            helper(
                                lispish.alist.get(lispish.cons.car(name), T),
                                lispish.cons.cdr(name),
                                namespace,
                                fullName
                            )
                        );
                    }
                } else {
                    if (lispish.alist.get(lispish.cons.car(name), T) === null) {
                        return lispish.alist.put(
                            lispish.cons.car(name),
                            helper(
                                null,
                                lispish.cons.cdr(name),
                                namespace,
                                fullName
                            ),
                            T
                        );
                    } else {
                        return lispish.alist.put(
                            lispish.cons.car(name),
                            helper(
                                lispish.alist.get(lispish.cons.car(name), T),
                                lispish.cons.cdr(name),
                                namespace,
                                fullName
                            ),
                            T
                        );
                    }
                }
            }
        }
        return helper(
            T,
            lispish.list.map(function (letter) {
                return letter.toLowerCase();
            }, name),
            namespace,
            name
        );
    }

    function getTrie(T, str) {
        function getLeaves(T, list) {
            if (T === null) {
                return list;
            } else {
                return lispish.alist.map(function (key, val) {
                    if (key === '_value') {
                        return val;
                    } else {
                        return getLeaves(val, list);
                    }
                }, T);
            }
        }

        function descendToNode(T, word) {
            if (T === null) {
                return null;
            } else if (lispish.cons.cdr(word) === null) {
                return lispish.alist.get(lispish.cons.car(word), T);
            } else {
                return descendToNode(
                    lispish.alist.get(lispish.cons.car(word), T),
                    lispish.cons.cdr(word)
                );
            }
        }
        var f = getLeaves(descendToNode(T, str), null);
        return lispish.list.flatten(f);
    }
    // Throw everything into the global namespace
    // and collect function names for autocompletion
    // and for sidebar.
    var docu = {};
    var autocomplete = null;
    var namespace;
    console.log(lispish)
    for (namespace in lispish) {

        if (namespace !== '__esModule') {
            docu[namespace] = [];
            window[namespace] = {};
            for (var p in lispish[namespace]) {
                if (p !== '__esModule') {
                    window[namespace][p] = lispish[namespace][p];
                    if (!(p[0] === 'c' && p[p.length - 1] === 'r' && p.length > 3)) {
                        docu[namespace].push(p);
                        autocomplete = addTrie(
                            autocomplete,
                            lispish.list.list(p.split('')),
                            lispish.list.list(namespace.split(''))
                        );
                    }
                }
            }
        }
    }

    function getCompletions(T, text) {
        return list.reduce(
            list.sort(
                getTrie(
                    T,
                    lispish.list.list(text.toLowerCase().split(''))
                )
            ),
            function (curr, prev) {
                return prev.concat(curr);
            }, []
        );
    }
    var lispishCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (prefix.length === 0) {
                callback(null, []);
                return;
            } else {
                var completions = getCompletions(autocomplete, prefix.toLowerCase());
                completions.sort();
                completions.forEach(function (curr, idx, arr) {
                    arr[idx] = {
                        caption: curr,
                        snippet: curr + '($1)',
                        meta: "lispish"
                    };
                });
                callback(null, completions);
                return;
            }
        }
    };

    var editor = ace.edit("input");
    var langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([lispishCompleter]);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setOptions({
        fontSize: "16px",
        enableSnippets: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    });

    var ref = document.getElementById(ref);
    editor.commands.addCommand({
        name: 'evaluate',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return'
        },
        exec: recalculate,
        readOnly: true // false if this command should not apply in readOnly mode
    });

    function recalculate(editor) {
        var code = editor.getValue(),
            lines = code.split("\n"),
            chunks,
            lastChunk;

        while (lines[lines.length - 1].match(/^\s*$/)) {
            lines.pop();
        }

        if (lines.length === 0) {
            return;
        }

        chunks = lines.reduce(
            function (acc, line, index) {
                if (line.match(/^\s*$/)) {
                    // do nothing
                } else if (line.match(/\/\/=>/)) {
                    acc[acc.length - 1].push("//=> " + index);
                    acc.push(acc[acc.length - 1].slice(0));
                } else acc[acc.length - 1].push(line);

                return acc;
            }, [
                []
            ]);

        chunks = chunks.filter(function (item) {
            return item.length > 0;
        });

        if (chunks.length === 0) {
            return;
        }

        chunks = chunks.map(function (chunk) {
            var wantsResult = chunk[chunk.length - 1].match(/\/\/=>/),
                resultPosition = wantsResult ? parseInt(chunk.pop().split(' ')[1]) : lines.length,
                result;

            try {
                result = JSON.stringify(eval(chunk.join('\n')));
                if (wantsResult) {
                    lines[resultPosition] = '//=> ' + result;
                }
            } catch (error) {
                lines[resultPosition] = '//=> ' + error.name + ': ' + error.message;
            }
        });

        code = lines.join('\n');

        editor.setValue(code);

        editor.gotoLine(editor.session.getLength(), editor.session.getLine(editor.session.getLength() - 1).length);

    }

    function makeLink(elmt, namespace) {
        var outer = document.createElement('div');
        var lnk = document.createElement('a');
        lnk.href = '#';
        lnk.textContent = elmt;
        lnk.addEventListener('click', function (e) {
            e.preventDefault();
            elmt === '//=>' ? editor.insert(elmt) : editor.insert((typeof namespace === 'undefined' ? '' : namespace + '.') + elmt + '()');
        });
        outer.appendChild(lnk);
        return outer;
    }

    function heading(txt) {
        var header = document.createElement('h3');
        header.textContent = txt;
        header.className = 'namespace';
        return header;
    }
    var input = document.getElementById(input);
    for (namespace in docu) {
        if (docu.hasOwnProperty(namespace)) {

            ref.appendChild(heading(namespace));
            docu[namespace].sort();
            docu[namespace].forEach(function (elmt) {
                ref.appendChild(makeLink(elmt, namespace));
            });
        }
    }
    ref.appendChild(heading('evaluate'));
    ref.appendChild(makeLink('//=>'));
}

export default initLispish;