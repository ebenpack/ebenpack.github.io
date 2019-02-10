(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.main = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var lispish = require('lispish.js');

function initLispish(input, ref) {
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

var lidrisp = require('lidrisp');

function initLidrisp() {
    // This is all an ugly dirty quick hack right now
    var editor = ace.edit("input");
    var langTools = ace.require("ace/ext/language_tools");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/scheme");
    editor.setOptions({
        fontSize: "16px"
    });
    window.lidrisp = (function(){
        var lidrisp = {};
        var input = document.getElementById('input');
        var output = document.getElementById('output');
        var eval = document.getElementById('eval');
        lidrisp.read = function(err, succ) {
            function _read(){
                if (input.textContent) {
                    succ(editor.getValue())
                }
                else {err("Could not get input")}
                eval.removeEventListener('click', _read);
            }
            eval.addEventListener('click', _read)
        }
        lidrisp.print = function(out) {
            output.textContent = out;
        }
        return lidrisp;
    })();
    lidrisp();
}

exports.astar = require('astar');
exports.wireframe = require('wireframe');
exports.videoascii = require('videoascii');
exports.boltzmann = require('boltzmann');
exports.initLispish = initLispish;
exports.initLidrisp = initLidrisp;
exports.vu = require('vu');
exports.conway = require('conway');
exports.projectwavybits = require('projectwavybits');

},{"astar":3,"boltzmann":4,"conway":5,"lidrisp":6,"lispish.js":50,"projectwavybits":53,"videoascii":54,"vu":56,"wireframe":57}],2:[function(require,module,exports){
function luminance(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function asciify(inputWidth, inputHeight, outputWidth, outputHeight, monochrome, ctx, fontSize, fidelity) {
    // Characters from 'darkest' to 'lightest'
    var asciiLuminanceMap = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft\/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    var ratio;
    var inputSampleWidth;
    var inputSampleHeight;
    var incrementX;
    var incrementY;
    ctx.font = fontSize + "pt Courier";
    var fontWidth = ctx.measureText('W').width;
    var fontHeight = fontSize;
    resize(inputWidth, inputHeight, outputWidth, outputHeight);

    function draw(imageData) {
        // For each ascii character in the output
        for (var y = 0; y < outputHeight; y += fontHeight) {
            for (var x = 0; x < outputWidth; x += fontWidth) {
                // Loop over input sample, determine average RGB
                // and luminance values
                var blockLuminanceTotal = 0;
                var redTotal = 0;
                var greenTotal = 0;
                var blueTotal = 0;
                var area = 0;
                for (var y2 = 0; y2 < inputSampleHeight; y2 += incrementY) {
                    for (var x2 = 0; x2 < inputSampleWidth; x2 += incrementX) {
                        var index = ((Math.round(x * ratio) + x2) + ((Math.round(y * ratio) + y2) * inputWidth)) * 4;
                        if (index < imageData.length) {
                            var red = imageData[index];
                            var green = imageData[index + 1];
                            var blue = imageData[index + 2];
                            redTotal += red;
                            greenTotal += green;
                            blueTotal += blue;
                            blockLuminanceTotal += luminance(red, green, blue);
                            area += 1;
                        }
                    }
                }
                var blockLuminanceAvg = blockLuminanceTotal / area;
                var idx = Math.floor((asciiLuminanceMap.length - 1) * blockLuminanceAvg);
                if (!monochrome) {
                    var r = Math.floor(redTotal / area);
                    var g = Math.floor(greenTotal / area);
                    var b = Math.floor(blueTotal / area);
                    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                }
                var character = asciiLuminanceMap[idx];
                ctx.fillText(character, x, y);
            }
        }
    }

    function resize(iWidth, iHeight, oWidth, oHeight) {
        inputWidth = iWidth;
        inputHeight = iHeight;
        outputWidth = oWidth;
        outputHeight = oHeight;
        ratio = inputWidth / outputWidth;
        inputSampleWidth = Math.floor(fontWidth * ratio);
        inputSampleHeight = Math.floor(fontHeight * ratio);
        incrementX = Math.max(1, Math.floor(inputSampleWidth * (1 - fidelity)));
        incrementY = Math.max(1, Math.floor(inputSampleHeight * (1 - fidelity)));
    }

    function toggleMonochrome(){
        ctx.fillStyle = "black";
        monochrome = !monochrome;
    }

    return {
        toggleMonochrome: toggleMonochrome,
        draw: draw,
        resize: resize,
    };
}

module.exports = asciify;
},{}],3:[function(require,module,exports){
function Maze(map_id, particle_id) {
    this.mapcanvas = document.getElementById(map_id);
    this.canvas = document.getElementById(particle_id);
    this.mapctx = this.mapcanvas.getContext('2d');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'rgb(0, 255, 0)';
    this.mouse = {
        'x': 10,
        'y': 4
    };
    this.map_width = 60;
    this.block_size = Math.floor(this.canvas.width / this.map_width);
    this.map_height = Math.floor(this.canvas.height / this.block_size);
    this.map = [];
    this.particles = [];
    this.particle_size = 2;
    this.path_queue = [];
    this.init();
}
Maze.prototype.init_map = function(width, height, density) {
    // Initialize and draw map.
    // Density is a number from [1-10). Lower = sparser barriers,
    // higher = denser barriers. 3 works fairly well
    if (density > 9) {
        density = 9;
    }
    var map = this.map;
    for (var x = 0; x < width; x++) {
        map[x] = [];
        for (var y = 0; y < height; y++) {
            if (Math.random() * 10 < density) {
                map[x][y] = {
                    'x': x,
                    'y': y,
                    'barrier': true
                };
                this.mapctx.fillStyle = 'red';
            } else {
                map[x][y] = {
                    'x': x,
                    'y': y,
                    'barrier': false
                };
                this.mapctx.fillStyle = 'black';
            }
            this.mapctx.fillRect(x * this.block_size, y * this.block_size, this.block_size, this.block_size);
        }
    }
};
Maze.prototype.find_neighbors = function(x, y) {
    // Only return neighbors in cardinal directions
    // Particles can't navigate through barriers diagonally
    var neighbor_list = [];
    var map = this.map;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (!(i === j && i === 0) &&
                map[x + i] !== undefined && map[x + i][y + j] !== undefined &&
                !map[x + i][y + j].barrier && (Math.abs(i) + Math.abs(j) < 2)) {
                neighbor_list.push({
                    'x': x + i,
                    'y': y + j,
                    'parent': {
                        'x': x,
                        'y': y
                    }
                });
            }
        }
    }
    return neighbor_list;
}
Maze.prototype.collides = function(x, y) {
    // If a particle at x,y collides with a barrier on the map, return true
    // Check all four corners to see if any corner is within a barrier
    var map = this.map;
    for (var i = 0; i < 1; i++) {
        for (var j = 0; j < 1; j++) {
            var mloc = this.map_location(x + (i * this.particle_size), y + (j * this.particle_size));
            if (map[mloc.x] === undefined || map[mloc.x][mloc.y] === undefined || map[mloc.x][mloc.y].barrier === true) {
                return true;
            }
        }
    }
    return false;
};
Maze.prototype.map_location = function(x, y) {
    // Returns map coordinates for a given x,y on the canvas
    return {
        'x': Math.floor(x / this.block_size),
        'y': Math.floor(y / this.block_size)
    };
};
Maze.prototype.init_particles = function(n) {
    // Add n particles to free (non-barrier) spaces on the map
    var added = 0;
    while (added < n) {
        var x = Math.floor(random_range(1, this.canvas.width - 2));
        var y = Math.floor(random_range(1, this.canvas.height - 2));
        if (!this.collides(x, y)) {
            var coords = this.map_location(x, y);
            this.particles.push(new Particle(x, y));
            added += 1;
        }
    }
};
Maze.prototype.queue_path_updates = function() {
    // Queue all particles to find their path
    for (var i = 0; i < this.particles.length; i++) {
        this.path_queue.push(this.particles[i]);
    }
};
Maze.prototype.update_particles = function() {
    // Update and move particles. If any particles remain
    // in the path queue, dequeue one and find its path
    // Get the path for the first particle in the queue
    if (this.path_queue.length > 0) {
        var q = this.path_queue.shift();
        this.set_particle_path(q);
        // Loop through the queue and set the paths of any particles that are in the same area
        // This prevents much duplication of effort. E.g. if there are 20 particles all in
        // the same area, then we only need to find the path for one of them.
        var remove = []; // Indices for particles in path_queue to be removed.
        var particle1 = this.map_location(q.x, q.y);
        for (var j = 0; j < this.path_queue.length; j++) {
            var particle2 = this.map_location(this.path_queue[j].x, this.path_queue[j].y);
            if (particle1.x === particle2.x && particle1.y === particle2.y) {
                remove.push(j);
            }
        }
        while (remove.length > 0) {
            var idx = remove.pop();
            this.path_queue[idx].path = q.path.slice(0); // Copy path
            this.path_queue.splice(idx, 1);
        }
    }
};
Maze.prototype.draw_particles = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        this.update_particle(p);
        this.move_particle(p);
        this.ctx.rect(Math.round(p.x), Math.round(p.y), this.particle_size, this.particle_size);
    }
    this.ctx.fill();
    this.ctx.closePath();
};
Maze.prototype.move_goal = function(e) {
    this.mouse.x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
    this.mouse.y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
    // TODO: Clear old marker
    // TODO: draw new marker
    this.queue_path_updates();
};
Maze.prototype.init = function() {
    this.canvas.addEventListener('click', this.move_goal.bind(this));
    this.init_map(this.map_width, this.map_height, 3);
    this.init_particles(20);
    this.update();
};
Maze.prototype.update = function() {
    this.update_particles();
    this.draw_particles();
    window.requestAnimationFrame(this.update.bind(this));
};
Maze.prototype.update_particle = function(p) {
    // A particle's velocity doesn't change instantaneously. The angle
    // of its movement is nudged towards the angle towards its goal,
    // and then the goal angle is updated for its new position.

    // If particle has reached its current destination, remove the next
    // node in the path, and set that node as the new destination.
    var map_loc = this.map_location(p.x, p.y);
    if (map_loc.x === p.destination.x && map_loc.y === p.destination.y) {
        if (p.path.length > 0) {
            p.destination = p.path.pop();
        }
    }
    // Calculate angle to destination for current position.
    p.ang = angle(p.x, p.y, (p.destination.x * this.block_size) + (this.block_size / 2), (p.destination.y * this.block_size) + (this.block_size / 2));
    // Update particle velocity using new angle value
    var velx = p.speed * Math.cos(p.ang);
    var vely = p.speed * Math.sin(p.ang);
    // Velocity does not change instantaneously
    p.vel.x = p.vel.x + (velx - p.vel.x) * p.inertia;
    p.vel.y = p.vel.y + (vely - p.vel.y) * p.inertia;
};
Maze.prototype.move_particle = function(p) {
    // Get integer values for next position
    var newx = Math.round(p.vel.x + p.x);
    var newy = Math.round(p.vel.y + p.y);
    // Move if path unobstructed
    if (newx > 0 && newx < this.canvas.width - 1 &&
        newy > 0 && newy < this.canvas.height - 1 &&
        !this.collides(newx, newy)) {
        p.x = newx;
        p.y = newy;
    } else if (this.collides(newy, newx)) {
        // Bounce off. 
        // p.vel.x = -p.vel.x;
        // p.vel.y = -p.vel.y;
    }
};
Maze.prototype.set_particle_path = function(p) {
    // Find and set the path to the goal, using A*
    var start = this.map_location(p.x, p.y);
    var goal = this.map_location(this.mouse.x, this.mouse.y);
    start.parent = null;
    start.g = 0;
    start.h = calc_h(start, goal);
    start.f = start.g + start.h;
    var to_visit = {};
    to_visit[to_str(start)] = start;
    var visited = {};
    while (!isEmpty(to_visit)) {
        // Find node with smalled F value is to_visit
        var idx = -1;
        var smallest_f = Infinity;
        for (var i in to_visit) {
            if (to_visit[i].f < smallest_f) {
                idx = i;
                smallest_f = to_visit[i].f;
            }
        }
        // Remove node with smallest F value from to_visit, add to visited
        var current = to_visit[idx];
        delete to_visit[idx];
        visited[idx] = current;
        // Calculate properties for neighbors of current and add to to_visit
        // if not already there and not already visited. 
        var neighbor_list = this.find_neighbors(current.x, current.y);
        for (var j = 0; j < neighbor_list.length; j++) {
            var neighbor = neighbor_list[j];
            neighbor.parent = current;
            neighbor.g = neighbor.parent.g + 1;
            neighbor.h = calc_h(neighbor, goal);
            neighbor.f = neighbor.g + neighbor.h;
            var key = to_str(neighbor);
            // Check if already visited, if so, check if F value here is better.
            if (key in to_visit && !(key in visited)) {
                if (neighbor.g < to_visit[key].g) {
                    to_visit[key] = neighbor;
                }
            } else if (!(key in visited)) {
                to_visit[key] = neighbor;
            }
            // Stop if we've reached our goal
            if (neighbor.x === goal.x && neighbor.y === goal.y) {
                visited[to_str(neighbor)] = neighbor;
                // Work backwards from goal, adding parents to path, until we reach start
                var path = [];
                var curr = visited[to_str(goal)];
                while (curr !== null) {
                    path.push({
                        'x': curr.x,
                        'y': curr.y
                    });
                    curr = curr.parent;
                }
                // Update current destination and path
                p.destination = {
                    'x': path[path.length - 1].x,
                    'y': path[path.length - 1].y
                };
                p.path = path;
                return;
            }
        }
    }
    if (isEmpty(to_visit)) {
        p.path.length = 0;
    }
};

function Particle(x, y) {
    this.x = x; // X position on canvas
    this.y = y; // Y position on canvas
    this.vel = {
        'x': 0,
        'y': 0
    }; // Particle velocity vector
    this.ang = 0; // Angle the particle is travelling in
    this.speed = random_range(1, 2);
    this.path = [];
    this.destination = {
        'x': 0,
        'y': 0
    }; // The current destination
    this.inertia = random_range(0.1, 0.2);
}

function to_str(node) {
    return JSON.stringify([node.x, node.y]);
}

function calc_h(p0, p1) {
    // Calculate H using Manhatten method.
    var d1 = Math.abs(p1.x - p0.x);
    var d2 = Math.abs(p1.y - p0.y);
    return d1 + d2;
}

function random_range(min, max) {
    return Math.random() * (max - min) + min;
}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function angle(x1, y1, x2, y2) {
    // Return angle in radians, with 'East' being 0,
    // increasing clockwise to 3pi/2 at 'South', pi at 'West', etc.
    var dx = x2 - x1;
    var dy = y2 - y1;
    var theta = Math.atan2(dy, dx);
    // atan2 returns results in the range -pi...pi. Convert results 
    // to the range 0...2pi
    if (theta < 0) {
        theta += (2 * Math.PI);
    }
    return theta;
}

module.exports = Maze;
},{}],4:[function(require,module,exports){
function boltzmann(config) {
    var boltzcanvas = document.getElementById(config.boltzId);
    var vectorcanvas = document.getElementById(config.vectorcanvasId);
    var particlecanvas = document.getElementById(config.particlecanvasId);
    var barriercanvas = document.getElementById(config.barriercanvasId);
    var boltzctx = boltzcanvas.getContext('2d');
    var vectorctx = vectorcanvas.getContext('2d');
    var particlectx = particlecanvas.getContext('2d');
    var barrierctx = barriercanvas.getContext('2d');
    var latticeWidth = config.latticeWidth;
    var latticeHeight = config.latticeHeight;
    var canvasWidth = boltzcanvas.width;
    var canvasHeight = boltzcanvas.height;
    var viscosity = 0.02;
    // Lattice arrays
    var size = latticeWidth * latticeHeight;
    var L0 = new Array(size);
    var L1 = new Array(size);
    var L2 = new Array(size);
    var L3 = new Array(size);
    var L4 = new Array(size);
    var L5 = new Array(size);
    var L6 = new Array(size);
    var L7 = new Array(size);
    var L8 = new Array(size);
    var Ldensity = new Array(size);
    var Lux = new Array(size);
    var Luy = new Array(size);
    var Lbarrier = new Array(size);
    var Lcurl = new Array(size);
    var omega = 1 / (3 * viscosity + 0.5); // "relaxation" parameter
    var draw_mode = 0;
    var flow_vectors = false;
    // new_barrier flag is set when new barriers are added, to let the draw
    // function know it needs to redraw barriers (this saves us from redrawing barriers every single frame)
    var new_barrier = true;
    var flow_particles = [];
    var flow_speed = 0;
    // play = false, // Start the simulation in a paused state
    var animation_id = null; // requestanimationframe ID
    var steps_per_frame = 10;
    var px_per_node = Math.floor(boltzcanvas.width / latticeWidth);
    var four9ths = 4 / 9;
    var one9th = 1 / 9;
    var one36th = 1 / 36;

    /**
     * Make a new empty lattice 
     * @param {number} latticeWidth Width of the lattice being initialized, in nodes
     * @param {number} latticeHeight Width of the lattice being initialized, in nodes
     */
    function make_lattice(latticeWidth, latticeHeight) {
        size = latticeWidth * latticeHeight;
        L0 = new Array(size);
        L1 = new Array(size);
        L2 = new Array(size);
        L3 = new Array(size);
        L4 = new Array(size);
        L5 = new Array(size);
        L6 = new Array(size);
        L7 = new Array(size);
        L8 = new Array(size);
        Ldensity = new Array(size);
        Lux = new Array(size);
        Luy = new Array(size);
        Lbarrier = new Array(size);
        Lcurl = new Array(size);
        var i = 0;
        while (i < size) {
            L0[i] = 0;
            L1[i] = 0;
            L2[i] = 0;
            L3[i] = 0;
            L4[i] = 0;
            L5[i] = 0;
            L6[i] = 0;
            L7[i] = 0;
            L8[i] = 0;
            Ldensity[i] = 0;
            Lux[i] = 0;
            Luy[i] = 0;
            Lbarrier[i] = 0;
            Lcurl[i] = 0;
            i++;
        }
    }

    /**
     * Initialize all nodes in lattice to flow with velocity (ux, uy) and density rho 
     * @param {number} ux X velocity of flow
     * @param {number} uy Y velocity of flow
     * @param {number} rho Macroscopic density
     */
    function init_flow(ux, uy, rho) {
        for (var i = 0; i < size; i++) {
            if (!Lbarrier[i]) {
                Ldensity[i] = rho;
                Lux[i] = ux;
                Luy[i] = uy;
                var ux3 = 3 * ux;
                var uy3 = 3 * -uy;
                var ux2 = ux * ux;
                var uy2 = -uy * -uy;
                var uxuy2 = 2 * ux * -uy;
                var u2 = ux2 + uy2;
                var u215 = 1.5 * u2;
                L0[i] = four9ths * rho * (1 - u215);
                L1[i] = one9th * rho * (1 + ux3 + 4.5 * ux2 - u215);
                L2[i] = one9th * rho * (1 + uy3 + 4.5 * uy2 - u215);
                L3[i] = one9th * rho * (1 - ux3 + 4.5 * ux2 - u215);
                L4[i] = one9th * rho * (1 - uy3 + 4.5 * uy2 - u215);
                L5[i] = one36th * rho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
                L6[i] = one36th * rho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
                L7[i] = one36th * rho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
                L8[i] = one36th * rho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
            }
        }
    }

    /**
     * Initialize flow particles
     */
    function init_flow_particles() {
        flow_particles.length = 0;
        for (var y = 1; y < 8; y++) {
            for (var x = 1; x < 20; x++) {
                if (!Lbarrier[(y * 10) * latticeWidth + (x * 10)]) {
                    flow_particles.push({
                        'x': x * 10,
                        'y': y * 10
                    });
                }
            }
        }
    }

    /**
     * Move flow particles 
     */
    function move_particles() {
        for (var x = 0, l = flow_particles.length; x < l; x++) {
            var p = flow_particles[x];
            var lx = Math.floor(p.x);
            var ly = Math.floor(p.y);
            if (lx >= 0 && lx < latticeWidth &&
                ly >= 0 && ly < latticeHeight) {
                var ux = Lux[ly * latticeWidth + lx];
                var uy = Luy[ly * latticeWidth + lx];
                p.x += ux;
                p.y += uy;
            }
            if (flow_speed > 0 && p.x > latticeWidth - 2) {
                // Wrap particles around to other side of screen
                p.x = 1;
            }
        }
    }

    /**
     * Initialize barrier nodes.
     * @param {Array.<Object>=} barrier Optional barrier barrier array. Contains
     *      objects definining (x, y) coordinates of barrier nodes to initialize
     */
    function init_barrier(barrier) {
        var x, y;
        if (barrier !== undefined) {
            // Clear all
            for (y = 0; y < latticeHeight; y++) {
                for (x = 0; x < latticeWidth; x++) {
                    Lbarrier[y * latticeWidth + x] = 0;
                }
            }
            // Set new barriers from barrier array
            for (var i = 0; i < barrier.length; i++) {
                Lbarrier[barrier[i].y * latticeWidth + barrier[i].x] = 1;
            }
        } else {
            // Default barrier setup
            for (y = 0; y < latticeHeight; y++) {
                for (x = 0; x < latticeWidth; x++) {
                    if (x === 0 || x === latticeWidth - 1 ||
                        y === 0 || y === latticeHeight - 1 ||
                        (Math.abs((latticeWidth / 2) - x) < 10 &&
                            Math.abs((latticeHeight / 2) - y) < 10)) {
                        Lbarrier[y * latticeWidth + x] = 1;
                    }
                }
            }
        }
    }

    function stream() {
        var x, y, idx;
        // Get local references, to reduce
        // any additional lookup cost.
        var wid = latticeWidth;
        var hei = latticeHeight;
        for (y = hei - 2; y > 0; y--) {
            for (x = 1; x < wid - 1; x++) {
                idx = y * wid + x;
                L2[idx] = L2[(y - 1) * wid + x];
                L6[idx] = L6[(y - 1) * wid + (x + 1)];
            }
        }

        for (y = hei - 2; y > 0; y--) {
            for (x = wid - 2; x > 0; x--) {
                idx = y * wid + x;
                L1[idx] = L1[y * wid + (x - 1)];
                L5[idx] = L5[(y - 1) * wid + (x - 1)];
            }
        }

        for (y = 1; y < hei - 1; y++) {
            for (x = wid - 2; x > 0; x--) {
                idx = y * wid + x;
                L4[idx] = L4[(y + 1) * wid + x];
                L8[idx] = L8[(y + 1) * wid + (x - 1)];
            }
        }

        for (y = 1; y < hei - 1; y++) {
            for (x = 1; x < wid - 1; x++) {
                idx = y * wid + x;
                L3[idx] = L3[y * wid + (x + 1)];
                L7[idx] = L7[(y + 1) * wid + (x + 1)];
            }
        }
        for (y = 1; y < hei - 1; y++) {
            for (x = 1; x < wid - 1; x++) {
                idx = y * wid + x;
                if (Lbarrier[idx]) {
                    L1[(y) * wid + (x + 1)] = L3[idx];
                    L2[(y + 1) * wid + (x)] = L4[idx];
                    L3[(y) * wid + (x - 1)] = L1[idx];
                    L4[(y - 1) * wid + (x)] = L2[idx];
                    L5[(y + 1) * wid + (x + 1)] = L7[idx];
                    L6[(y + 1) * wid + (x - 1)] = L8[idx];
                    L7[(y - 1) * wid + (x - 1)] = L5[idx];
                    L8[(y - 1) * wid + (x + 1)] = L6[idx];
                }
            }
        }
    }

    /**
     * Collision phase of LBM
     */
    function collide() {
        var idx;
        var wid = latticeWidth;
        var hei = latticeHeight;
        for (var y = 1; y < hei - 1; y++) {
            for (var x = 1; x < wid - 1; x++) {
                idx = y * wid + x;
                if (!Lbarrier[idx]) {
                    // Calculate macroscopic density (rho) and velocity (ux, uy)
                    // Thanks to Daniel V. Schroeder for this optimization
                    // http://physics.weber.edu/schroeder/fluids/
                    var rho = (
                        L0[idx] +
                        L1[idx] +
                        L2[idx] +
                        L3[idx] +
                        L4[idx] +
                        L5[idx] +
                        L6[idx] +
                        L7[idx] +
                        L8[idx]
                    );
                    var ux = (
                        (
                            L1[idx] +
                            L5[idx] +
                            L8[idx] -
                            L3[idx] -
                            L6[idx] -
                            L7[idx]
                        ) /
                        rho
                    );
                    var uy = (
                        (
                            L4[idx] +
                            L7[idx] +
                            L8[idx] -
                            L2[idx] -
                            L5[idx] -
                            L6[idx]
                        ) / rho
                    );
                    // Update values stored in node.
                    Ldensity[idx] = rho;
                    Lux[idx] = ux;
                    Luy[idx] = uy;
                    // Compute curl. Non-edge nodes only.
                    // Don't compute if it won't get drawn
                    if (draw_mode == 4 && x > 0 && x < wid - 1 &&
                        y > 0 && y < hei - 1) {
                        Lcurl[idx] = (
                            Luy[y * wid + (x + 1)] -
                            Luy[y * wid + (x - 1)] -
                            Lux[(y + 1) * wid + x] +
                            Lux[(y - 1) * wid + x]
                        );
                    }
                    // Set node equilibrium for each velocity
                    // Inlining the equilibrium function here provides significant performance improvements
                    var ux3 = 3 * ux;
                    var uy3 = 3 * uy;
                    var ux2 = ux * ux;
                    var uy2 = uy * uy;
                    var uxuy2 = 2 * ux * uy;
                    var u2 = ux2 + uy2;
                    var u215 = 1.5 * u2;
                    var one9thrho = one9th * rho;
                    var one36thrho = one36th * rho;
                    var ux3p1 = 1 + ux3;
                    var ux3m1 = 1 - ux3;
                    L0[idx] = L0[idx] + (omega * ((four9ths * rho * (1 - u215)) - L0[idx]));
                    L1[idx] = L1[idx] + (omega * ((one9thrho * (ux3p1 + 4.5 * ux2 - u215)) - L1[idx]));
                    L2[idx] = L2[idx] + (omega * ((one9thrho * (1 - uy3 + 4.5 * uy2 - u215)) - L2[idx]));
                    L3[idx] = L3[idx] + (omega * ((one9thrho * (ux3m1 + 4.5 * ux2 - u215)) - L3[idx]));
                    L4[idx] = L4[idx] + (omega * ((one9thrho * (1 + uy3 + 4.5 * uy2 - u215)) - L4[idx]));
                    L5[idx] = L5[idx] + (omega * ((one36thrho * (ux3p1 - uy3 + 4.5 * (u2 - uxuy2) - u215)) - L5[idx]));
                    L6[idx] = L6[idx] + (omega * ((one36thrho * (ux3m1 - uy3 + 4.5 * (u2 + uxuy2) - u215)) - L6[idx]));
                    L7[idx] = L7[idx] + (omega * ((one36thrho * (ux3m1 + uy3 + 4.5 * (u2 - uxuy2) - u215)) - L7[idx]));
                    L8[idx] = L8[idx] + (omega * ((one36thrho * (ux3p1 + uy3 + 4.5 * (u2 + uxuy2) - u215)) - L8[idx]));
                }
            }
        }
    }

    /**
     * Set equilibrium values for boundary nodes.
     */
    function set_boundaries() {
        // Copied from Daniel V. Schroeder.
        var wid = latticeWidth;
        var hei = latticeHeight;
        var idx1, idx2;
        var ux = flow_speed;
        var uy = 0;
        var rho = 1;
        var ux3 = 3 * ux;
        var uy3 = 3 * -uy;
        var ux2 = ux * ux;
        var uy2 = -uy * -uy;
        var uxuy2 = 2 * ux * -uy;
        var u2 = ux2 + uy2;
        var u215 = 1.5 * u2;
        var zero = four9ths * rho * (1 - u215);
        var one = one9th * rho * (1 + ux3 + 4.5 * ux2 - u215);
        var two = one9th * rho * (1 + uy3 + 4.5 * uy2 - u215);
        var three = one9th * rho * (1 - ux3 + 4.5 * ux2 - u215);
        var four = one9th * rho * (1 - uy3 + 4.5 * uy2 - u215);
        var five = one36th * rho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
        var six = one36th * rho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
        var seven = one36th * rho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
        var eight = one36th * rho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
        for (var x = 0; x < latticeWidth - 1; x++) {
            idx1 = x;
            idx2 = (latticeHeight - 1) * latticeWidth + x;
            L0[idx2] = L0[idx1] = zero;
            L1[idx2] = L1[idx1] = one;
            L2[idx2] = L2[idx1] = two;
            L3[idx2] = L3[idx1] = three;
            L4[idx2] = L4[idx1] = four;
            L5[idx2] = L5[idx1] = five;
            L6[idx2] = L6[idx1] = six;
            L7[idx2] = L7[idx1] = seven;
            L8[idx2] = L8[idx1] = eight;
        }
        for (var y = 0; y < latticeHeight - 1; y++) {
            idx1 = y * latticeWidth;
            idx2 = y * latticeWidth + (latticeWidth - 1);
            L0[idx2] = L0[idx1] = zero;
            L1[idx2] = L1[idx1] = one;
            L2[idx2] = L2[idx1] = two;
            L3[idx2] = L3[idx1] = three;
            L4[idx2] = L4[idx1] = four;
            L5[idx2] = L5[idx1] = five;
            L6[idx2] = L6[idx1] = six;
            L7[idx2] = L7[idx1] = seven;
            L8[idx2] = L8[idx1] = eight;
        }
    }
    /**
     * Update loop. 
     */
    function updater() {
        var steps = steps_per_frame;
        set_boundaries();
        for (var i = 0; i < steps; i++) {
            stream();
            collide();
            if (flow_particles.length > 0) {
                move_particles();
            }
        }
        drawFrame();
        animation_id = requestAnimationFrame(updater);
    }

    function init() {
        /**
         * Initialize lattice.
         */
        make_lattice(latticeWidth, latticeHeight);
        init_barrier([]);
        init_flow(0, 0, 1); // Initialize all lattice nodes with zero velocity, and density of 1
        drawFrame(); // Call draw once to draw barriers, but don't start animating
    }

    //*******

    var image;
    var image_data;
    var image_width;
    var color_array = [];
    var num_colors = 400;


    vectorctx.strokeStyle = "red";
    vectorctx.fillStyle = "red";
    particlectx.strokeStyle = "black";
    particlectx.fillStyle = "black";
    barrierctx.fillStyle = "yellow";
    image = boltzctx.createImageData(canvasWidth, canvasHeight);
    image_data = image.data;
    image_width = image.width;
    // Pre-compute color array
    compute_color_array(num_colors);

    /**
     * Convert hue RGB
     * @param {number} p Hue
     * @param {number} q Saturation
     * @param {number} t Luminance
     * @return {number} RGBa color object
     */
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    /**
     * Convert HSL to RGB
     * @param {number} h Hue
     * @param {number} s Saturation
     * @param {number} l Luminance
     * @return {Object} RGBa color object
     */
    function hslToRgb(h, s, l) {
        var r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: 255
        };
    }

    /**
     * Given a range and a value within that range, return a color for that value.
     * @param {number} min Minimum value in range
     * @param {number} max Maximum value in range
     * @param {number} val Value within the range for which a color will be returned
     * @return {object} RGBa color object
     */
    function get_color(min, max, val) {
        // This function is actually being called
        // incorrectly, but it produces interesting results.
        var left_span = max - min;
        var value_scaled = val - min / left_span;
        var h = (1 - value_scaled);
        var s = 1;
        var l = value_scaled / 2;
        return hslToRgb(h, s, l);
    }

    /**
     * Precompute color values and place them in an array
     * @param {number} n Number of colors to compute
     */
    function compute_color_array(n) {
        for (var i = 0; i < n; i++) {
            color_array[i] = get_color(n, i, 0);
        }
    }

    /**
     * Draw a square region on the canvas image corresponding to a
     * lattice node at (x,y).
     * @param {number} x X position of node to be drawn
     * @param {number} y Y position of node to be drawn
     * @param {Object} color Color of node to be drawn
     * @param {Object} image ImageData
     */
    function draw_square(x, y, color, image) {
        // Credit to Daniel V. Schroeder
        // http://physics.weber.edu/schroeder/fluids/
        // for this drawing method.
        for (var ypx = y * px_per_node; ypx < (y + 1) * px_per_node; ypx++) {
            for (var xpx = x * px_per_node; xpx < (x + 1) * px_per_node; xpx++) {
                var index = (xpx + ypx * image.width) * 4;
                image.data[index + 0] = color.r;
                image.data[index + 1] = color.g;
                image.data[index + 2] = color.b;
                image.data[index + 3] = color.a;
            }
        }
    }

    /**
     * Draw flow vectors for the node at (x, y).
     * @param {number} x X position of node
     * @param {number} y Y position of node
     * @param {number} ux X component of velocity at node (x, y)
     * @param {number} uy Y component of velocity at node (x, y)
     */
    function draw_flow_vector(x, y, ux, uy) {
        var scale = 200;
        var xpx = x * px_per_node;
        var ypx = y * px_per_node;
        vectorctx.beginPath();
        vectorctx.moveTo(xpx, ypx);
        vectorctx.lineTo(Math.round(xpx + (ux * px_per_node * scale)), ypx + (uy * px_per_node * scale));
        vectorctx.stroke();
        vectorctx.beginPath();
        vectorctx.arc(xpx, ypx, 1, 0, 2 * Math.PI, false);
        vectorctx.fill();
        vectorctx.closePath();
    }

    /**
     * Draw flow particle.
     * @param {number} x X position of particle
     * @param {number} y Y position of particle
     */
    function draw_flow_particle(x, y) {
        particlectx.beginPath();
        particlectx.arc(x * px_per_node, y * px_per_node, 1, 0, 2 * Math.PI, false);
        particlectx.fill();
        particlectx.closePath();
    }

    /**
     * Draw barriers.
     */
    function draw_barriers() {
        for (var x = 0; x < latticeWidth; x++) {
            for (var y = 0; y < latticeHeight; y++) {
                if (Lbarrier[y * latticeWidth + x]) {
                    barrierctx.beginPath();
                    barrierctx.rect(x * px_per_node, y * px_per_node, px_per_node, px_per_node);
                    barrierctx.fill();
                    barrierctx.closePath();
                }
            }
        }
    }

    /**
     * Draw to canvas.
     */
    function drawFrame() {
        var x, y, l;
        if (flow_vectors) {
            vectorctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
        if (flow_particles.length > 0) {
            particlectx.clearRect(0, 0, canvasWidth, canvasHeight);
            for (x = 0, l = flow_particles.length; x < l; x++) {
                draw_flow_particle(flow_particles[x].x, flow_particles[x].y, particlectx);
            }
        }
        if (new_barrier) {
            barrierctx.clearRect(0, 0, canvasWidth, canvasHeight);
            draw_barriers(barrierctx);
            new_barrier = false;
        }
        for (x = 0; x < latticeWidth; x++) {
            for (y = 0; y < latticeHeight; y++) {
                var idx = y * latticeWidth + x;
                var color_index;
                if (!Lbarrier[idx]) {
                    // var color = {'r': 0, 'g': 0, 'b': 0, 'a': 0};
                    color_index = 0;
                    var ux = Lux[idx];
                    var uy = Luy[idx];
                    if (flow_vectors && x % 10 === 0 && y % 10 === 0) {
                        // Draw flow vectors every tenth node.
                        draw_flow_vector(x, y, ux, uy);
                    }
                    // There are a lot of magic numbers ahead.
                    // They are primarily expiramentally derived values chosen
                    // to produce aesthetically pleasing results.
                    if (draw_mode === 0) {
                        // Speed
                        var speed = Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2));
                        color_index = parseInt((speed + 0.21) * num_colors);
                    } else if (draw_mode == 1) {
                        // X velocity
                        color_index = parseInt((ux + 0.21052631578) * num_colors);
                    } else if (draw_mode == 2) {
                        // Y Velocity
                        color_index = parseInt((uy + 0.21052631578) * num_colors);
                    } else if (draw_mode == 3) {
                        // Density
                        var dens = Ldensity[idx];
                        color_index = parseInt((dens - 0.75) * num_colors);
                    } else if (draw_mode == 4) {
                        // Curl
                        var curl = Lcurl[idx];
                        color_index = parseInt((curl + 0.25196850393) * num_colors);
                    } else if (draw_mode == 5) {
                        // Draw nothing. This mode is useful when flow vectors or particles are turned on.
                        continue;
                    }
                    if (color_index >= num_colors) {
                        color_index = num_colors - 1;
                    } else if (color_index < 0) {
                        color_index = 0;
                    }
                    var color = color_array[color_index];
                    // draw_square inlined for performance
                    for (var ypx = y * px_per_node; ypx < (y + 1) * px_per_node; ypx++) {
                        for (var xpx = x * px_per_node; xpx < (x + 1) * px_per_node; xpx++) {
                            var index = (xpx + ypx * image_width) * 4;
                            image_data[index + 0] = color.r;
                            image_data[index + 1] = color.g;
                            image_data[index + 2] = color.b;
                            image_data[index + 3] = color.a;
                        }
                    }
                }
            }
        }
        boltzctx.putImageData(image, 0, 0);
    }
    /**
     * Clear canvas.
     */
    function clear() {
        vectorctx.clearRect(0, 0, canvasWidth, canvasHeight);
        particlectx.clearRect(0, 0, canvasWidth, canvasHeight);
        boltzctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Clear barrier canvas, but redraw in case barriers are still present
        barrierctx.clearRect(0, 0, canvasWidth, canvasHeight);
        draw_barriers();
        new_barrier = false;
    }

    //**************\

    // The reset button also affects the start button and vector and particle
    // checkboxes, , so they need to be available outside of the register function
    var startbutton;
    var flowvector;
    var flowparticle;

    function moveHelper(newX, newY, oldX, oldY) {
        var radius = 5;
        var dx = (newX - oldX) / px_per_node / steps_per_frame;
        var dy = (newY - oldY) / px_per_node / steps_per_frame;
        // Ensure that push isn't too big
        if (Math.abs(dx) > 0.1) {
            dx = 0.1 * Math.abs(dx) / dx;
        }
        if (Math.abs(dy) > 0.1) {
            dy = 0.1 * Math.abs(dy) / dy;
        }
        // Scale from canvas coordinates to lattice coordinates
        var lattice_x = Math.floor(newX / px_per_node);
        var lattice_y = Math.floor(newY / px_per_node);
        for (var x = -radius; x <= radius; x++) {
            for (var y = -radius; y <= radius; y++) {
                // Push in circle around cursor. Make sure coordinates are in bounds.
                if (lattice_x + x >= 0 && lattice_x + x < latticeWidth &&
                    lattice_y + y >= 0 && lattice_y + y < latticeHeight &&
                    !Lbarrier[(lattice_y + y) * latticeWidth + (lattice_x + x)] &&
                    Math.sqrt((x * x) + (y * y)) < radius) {
                    var idx = (lattice_y + y) * latticeWidth + (lattice_x + x);
                    var ux = dx;
                    var uy = dy;
                    var rho = Ldensity[idx];
                    var ux3 = 3 * ux;
                    var uy3 = 3 * -uy;
                    var ux2 = ux * ux;
                    var uy2 = -uy * -uy;
                    var uxuy2 = 2 * ux * -uy;
                    var u2 = ux2 + uy2;
                    var u215 = 1.5 * u2;
                    L0[idx] = four9ths * rho * (1 - u215);
                    L1[idx] = one9th * rho * (1 + ux3 + 4.5 * ux2 - u215);
                    L2[idx] = one9th * rho * (1 + uy3 + 4.5 * uy2 - u215);
                    L3[idx] = one9th * rho * (1 - ux3 + 4.5 * ux2 - u215);
                    L4[idx] = one9th * rho * (1 - uy3 + 4.5 * uy2 - u215);
                    L5[idx] = one36th * rho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
                    L6[idx] = one36th * rho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
                    L7[idx] = one36th * rho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
                    L8[idx] = one36th * rho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
                }
            }
        }
        oldX = newX;
        oldY = newY;
    }


    /**
     * Push fluid with mouse 
     * @param {Object} e MouseEvent 'mousedown'
     */
    function mousedownListener(e) {
        var button = e.which || e.button;
        if (button !== 1) {
            return;
        } // Only capture left click
        if (!animation_id) {
            return;
        } // Don't capture if stopped
        var oldX = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
        var oldY = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;

        /**
         * Push fluid with mouse 
         * @param {Object} e MouseEvent 'mousemove'
         */
        function moveListener(e) {
            var newX = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
            var newY = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
            moveHelper(newX, newY, oldX, oldY);
            oldX = newX;
            oldY = newY;
        }

        /**
         * Remove mousemove listeners
         * @param {Object} e MouseEvent 'mouseup'
         */
        function mouseupListener(e) {
            boltzcanvas.removeEventListener('mousemove', moveListener, false);
            boltzcanvas.removeEventListener('mouseup', mouseupListener, false);

            boltzcanvas.removeEventListener('touchmove', moveListener, false);
            document.body.removeEventListener('touchend', mouseupListener, false);
        }

        boltzcanvas.addEventListener('mousemove', moveListener, false);
        boltzcanvas.addEventListener('mouseup', mouseupListener, false);

        boltzcanvas.addEventListener('touchmove', moveListener, false);
        document.body.addEventListener('touchend', mouseupListener, false);
    }

    /**
     * Place/remove barrier
     * @param {Object} e MouseEvent right 'click'
     */
    function place_barrier(e) {
        e.preventDefault();
        var mouse_x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
        var mouse_y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
        var lattice_x = Math.floor(mouse_x / px_per_node);
        var lattice_y = Math.floor(mouse_y / px_per_node);
        var draw;
        var idx = lattice_y * latticeWidth + lattice_x;
        // Bitflip the barrier
        draw = Lbarrier[idx] = Lbarrier[idx] ^ 1;

        /**
         * Place/remove barrier
         * @param {Object} e MouseEvent 'mousemove'
         */
        function moveListener(e) {
            mouse_x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
            mouse_y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
            // Scale from canvas coordinates to lattice coordinates
            lattice_x = Math.floor(mouse_x / px_per_node);
            lattice_y = Math.floor(mouse_y / px_per_node);
            // Draw/erase barrier
            Lbarrier[lattice_y * latticeWidth + lattice_x] = draw;
            new_barrier = true;
            if (!animation_id) {
                // If stopped, we need to explicitly call drawFrame()
                drawFrame();
            }
        }

        /**
         * Remove mousemove listeners
         * @param {Object} e MouseEvent 'mouseup'
         */
        function mouseupListener(e) {
            boltzcanvas.removeEventListener('mousemove', moveListener, false);
            boltzcanvas.removeEventListener('mouseup', mouseupListener, false);

            boltzcanvas.removeEventListener('touchmove', moveListener, false);
            document.body.removeEventListener('touchend', mouseupListener, false);
        }

        boltzcanvas.addEventListener('mousemove', moveListener, false);
        boltzcanvas.addEventListener('mouseup', mouseupListener, false);

        boltzcanvas.addEventListener('touchmove', moveListener, false);
        document.body.addEventListener('touchend', mouseupListener, false);
    }


    var touches = {};
    var rect = boltzcanvas.getBoundingClientRect();

    function touchdownListener(e) {
        var started = e.changedTouches;
        for (var i = 0, len = started.length; i < len; i++) {
            touches[started[i].identifier + '.x'] = started[i].clientX - rect.left;
            touches[started[i].identifier + '.y'] = started[i].clientY - rect.top;
        }
    }
    /**
     * Push fluid with finger
     * @param {Object} e MouseEvent 'touchmove'
     */
    function touchMoveListener(e) {
        e.preventDefault();
        var moved = e.changedTouches;
        for (var i = 0, len = moved.length; i < len; i++) {
            var oldX = touches[moved[i].identifier + '.x'];
            var oldY = touches[moved[i].identifier + '.y'];
            var newX = moved[i].clientX - rect.left;
            var newY = moved[i].clientY - rect.top;
            moveHelper(newX, newY, oldX, oldY);
            touches[moved[i].identifier + '.x'] = newX;
            touches[moved[i].identifier + '.y'] = newY;
        }
    }
    /**
     * Remove mousemove listeners
     * @param {Object} e MouseEvent 'mouseup'
     */
    function touchupListener(e) {
        var ended = e.changedTouches;
        for (var i = 0, len = ended.length; i < 0; i++) {
            delete touches[ended[i].identifier + '.x'];
            delete touches[ended[i].identifier + '.y'];
        }
    }
    boltzcanvas.addEventListener('touchmove', touchMoveListener, false);
    document.body.addEventListener('touchend', touchupListener, false);

    /**
     * Change draw mode.
     * @param {Object} e Event 'change'
     */
    function update_draw_mode(e) {
        draw_mode = this.selectedIndex;
        if (draw_mode == 5) {
            // Clear canvas
            clear();
        }
    }

    /**
     * Change animation speed.
     * @param {Object} e Event 'input'
     */
    function update_speed(e) {
        steps_per_frame = parseInt(this.value, 10);
    }

    /**
     * Change viscosity of fluid.
     * @param {Object} e Event 'input'
     */
    function update_viscosity(e) {
        viscosity = parseInt(this.value, 10) / 100;
        omega = 1 / (3 * viscosity + 0.5);
    }

    /**
     * Toggle whether vectors are drawn.
     * @param {Object} e MouseEvent 'click'
     */
    function toggle_vectors(e) {
        if (this.checked) {
            flow_vectors = true;
        } else {
            flow_vectors = false;
            vectorctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear vector canvas
        }
    }

    /**
     * Toggle whether particles are drawn.
     * @param {Object} e MouseEvent 'click'
     */
    function toggle_particles(e) {
        if (this.checked) {
            init_flow_particles();
        } else {
            flow_particles.length = 0;
            particlectx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear
        }
    }

    /**
     * Stop animation
     * @param {Object} bttn Button DOM node
     */
    function stop(bttn) {
        // Stop animation
        window.cancelAnimationFrame(animation_id);
        animation_id = null;
        bttn.innerHTML = "Start";
    }

    /**
     * Stop animation
     * @param {Object} bttn Button DOM node
     */
    function start(bttn) {
        // Start animation
        // Flush any mouse events that occured while the program was stopped
        updater();
        bttn.innerHTML = "Pause";
    }

    /**
     * Play/pause animation
     * @param {Object} e MouseEvent 'click'
     */
    function toggle_play_state(e) {
        if (animation_id) {
            stop(this);
        } else {
            start(this);
        }
    }

    /**
     * Reset simulation (removing barriers, particles, etc.) and stop animation
     * @param {Object} e MouseEvent 'click'
     */
    function reset(e) {
        stop(startbutton);
        flow_vectors = false;
        flow_particles.length = 0;
        flowvector.checked = false;
        flowparticle.checked = false;
        init(); // Reset lattice, barriers
        clear();
    }

    /**
     * Remove all barriers
     * @param {Object} e MouseEvent 'click'
     */
    function clear_barriers(e) {
        init_barrier([]);
        clear();
    }

    /**
     * Change speed of flow
     * @param {Object} e Event 'input'
     */
    function set_flow_speed(e) {
        flow_speed = parseInt(this.value, 10) / 833;
    }

    /**
     * Register events
     */
    (function register() {
        // Register left click
        boltzcanvas.addEventListener('mousedown', mousedownListener, false);
        boltzcanvas.addEventListener('touchstart', touchdownListener, false);
        // Register right click 
        boltzcanvas.addEventListener('contextmenu', place_barrier, false);
        // Register dropdown
        var drawoptions = document.getElementById("drawmode");
        drawoptions.addEventListener('change', update_draw_mode, false);
        // Register sliders
        var viscoslider = document.getElementById("viscosity");
        viscoslider.addEventListener('input', update_viscosity, false);
        var speedslider = document.getElementById("speed");
        speedslider.addEventListener('input', update_speed, false);
        // Register checkboxes
        flowvector = document.getElementById("flowvectors");
        flowvector.addEventListener('click', toggle_vectors, false);
        flowparticle = document.getElementById("flowparticles");
        flowparticle.addEventListener('click', toggle_particles, false);
        // Register start/stop
        startbutton = document.getElementById('play');
        startbutton.addEventListener('click', toggle_play_state, false);
        // Register reset
        var resetbutton = document.getElementById('reset');
        resetbutton.addEventListener('click', reset, false);
        // Register clear barriers
        var clear = document.getElementById('clearbarriers');
        clear.addEventListener('click', clear_barriers, false);
        // Register flow speed slider
        var flow_speed = document.getElementById('flow-speed');
        flow_speed.addEventListener('input', set_flow_speed, false);
    })();


    init();
}

module.exports = boltzmann;

},{}],5:[function(require,module,exports){
function GameOfLife(canvas_id, speed) {
    this.canvas = document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext('2d');
    this.speed = speed;
    this.last_updated = new Date();
    this.board = [];
    this.next_board = [];
    this.block_size = 15;
    this.play = false;
    this.intervalID = undefined;
    this.mouse = {
        'x': 0,
        'y': 0
    };
    this.initialize();
}

function Cell(x, y, alive) {
    // A single cell on the board.
    this.x = x; // X coordinate on canvas
    this.y = y; // Y coordinate on canvas
    this.alive = alive;
}

GameOfLife.prototype.initialize = function() {
    // Add controls
    this.controls = document.createElement('div');
    this.start = document.createElement('button');
    this.reset = document.createElement('button');
    this.speedlabel = document.createElement('label');
    this.speedbutton = document.createElement('input');
    this.speedbutton.type = 'range';
    this.speedbutton.min = 0;
    this.speedbutton.max = 100;
    this.speedbutton.value = this.speed;
    this.speedlabel.appendChild(this.speedbutton);
    this.start.textContent = "Start";
    this.reset.textContent = "Reset";
    this.speedlabel.textContent = "Speed";
    this.controls.appendChild(this.start);
    this.controls.appendChild(this.reset);
    this.controls.appendChild(this.speedbutton);
    this.canvas.parentNode.appendChild(this.controls);

    // Add pre-made shapes to canvas
    this.addDefaults();

    // Set up context
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "grey";
    this.ctx.lineWidth = 0.4;

    // Register event listeners
    this.register_events();

    // Initialize board and draw board once, and start animation loop
    this.init_board();
    this.draw_board();
    this.update();
};

GameOfLife.prototype._boardDump = function() {
    // Return the contents of the current board.
    // An array of all living cells is returned, where
    // each living cell is represented by a two-element array
    // of x, y coordinates.
    // This is a mostly a utility function to make manual
    // creation of pre-made board configurations easier.
    var board = [];
    for (var x = 0; x < this.board.length; x++) {
        for (var y = 0; y < this.board[y].length; y++) {
            if (this.board[x][y].alive) {
                board.push([x, y]);
            }
        }
    }
    return board;
};

GameOfLife.prototype.addDefaults = function() {
    // Add select list of pre-made board configurations.
    // TODO: Load these in from a JSON file
    var empty = [];
    var glider = [
        [17, 15],
        [18, 13],
        [18, 15],
        [19, 14],
        [19, 15]
    ];
    var pulsar = [
        [12, 11],
        [12, 12],
        [12, 13],
        [12, 17],
        [12, 18],
        [12, 19],
        [14, 9],
        [14, 14],
        [14, 16],
        [14, 21],
        [15, 9],
        [15, 14],
        [15, 16],
        [15, 21],
        [16, 9],
        [16, 14],
        [16, 16],
        [16, 21],
        [17, 11],
        [17, 12],
        [17, 13],
        [17, 17],
        [17, 18],
        [17, 19],
        [19, 11],
        [19, 12],
        [19, 13],
        [19, 17],
        [19, 18],
        [19, 19],
        [20, 9],
        [20, 14],
        [20, 16],
        [20, 21],
        [21, 9],
        [21, 14],
        [21, 16],
        [21, 21],
        [22, 9],
        [22, 14],
        [22, 16],
        [22, 21],
        [24, 11],
        [24, 12],
        [24, 13],
        [24, 17],
        [24, 18],
        [24, 19]
    ];
    var glider_gun = [
        [0, 15],
        [0, 16],
        [1, 15],
        [1, 16],
        [10, 15],
        [10, 16],
        [10, 17],
        [11, 14],
        [11, 18],
        [12, 13],
        [12, 19],
        [13, 13],
        [13, 19],
        [14, 16],
        [15, 14],
        [15, 18],
        [16, 15],
        [16, 16],
        [16, 17],
        [17, 16],
        [20, 13],
        [20, 14],
        [20, 15],
        [21, 13],
        [21, 14],
        [21, 15],
        [22, 12],
        [22, 16],
        [24, 11],
        [24, 12],
        [24, 16],
        [24, 17],
        [34, 13],
        [34, 14],
        [35, 13],
        [35, 14]
    ];
    var options = [
        ['Glider', glider],
        ['Pulsar', pulsar],
        ['Glider Gun', glider_gun],
        ['Empty Board', empty]
    ];
    var select = document.createElement('select');
    var opt = document.createElement('option');
    opt.textContent = 'Pre-made board configs';
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
    for (var i = 0; i < options.length; i++) {
        opt = document.createElement('option');
        opt.textContent = options[i][0];
        select.appendChild(opt);
    }
    this.canvas.parentNode.appendChild(select);
    select.addEventListener('change', (function(e) {
        var choice = e.target.selectedIndex - 1;
        if (choice >= 0) {
            this.loadBoard(options[choice][1])
        }
    }).bind(this));
};

GameOfLife.prototype.init_board = function() {
    // Initializes a two-dimensional array of dead Cells.
    var x_size = Math.floor(this.canvas.width / this.block_size);
    var y_size = Math.floor(this.canvas.height / this.block_size);
    this.board.length = 0;
    this.next_board.length = 0;
    for (var i = 0; i < x_size; i++) {
        var xpos = i * this.block_size;
        this.board[i] = [];
        this.next_board[i] = [];
        for (var j = 0; j < y_size; j++) {
            var ypos = j * this.block_size;
            this.board[i][j] = new Cell(xpos, ypos, 0);
            this.next_board[i][j] = new Cell(xpos, ypos, 0);
        }
    }
};

GameOfLife.prototype.update_board = function() {
    var board_width = this.board.length;
    var board_height = this.board[0].length;
    // For each cell on the board.
    for (var x = 0; x < board_width; x++) {
        for (var y = 0; y < board_height; y++) {
            var old_cell = this.board[x][y];
            var neighbours = 0;
            // Count neighbours
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var newx = x + i;
                    var newy = y + j;
                    // Wraparound logic
                    if (newx < 0) {
                        newx += board_width;
                    }
                    if (newy < 0) {
                        newy += board_height;
                    }
                    newx = newx % board_width;
                    newy = newy % board_height;
                    neighbours += this.board[newx][newy].alive;
                }
            }
            // A cell can't be a neighbor to itself, so subtract one from neighbors
            // if cell was alive last generation.
            if (old_cell.alive) {
                neighbours -= 1;
            }
            // Apply rules for life and death.
            if (old_cell.alive) {
                if (neighbours === 2 || neighbours === 3) {
                    this.next_board[x][y].alive = 1;
                } else {
                    this.next_board[x][y].alive = 0;
                }
            } else {
                if (neighbours === 3) {
                    this.next_board[x][y].alive = 1;
                } else {
                    this.next_board[x][y].alive = 0;
                }
            }
        }
    }
    for (var x = 0; x < board_width; x++) {
        for (var y = 0; y < board_height; y++) {
            this.board[x][y].alive = this.next_board[x][y].alive;
        }
    }
};

GameOfLife.prototype.reset_board = function() {
    if (this.play) {
        this.play = false;
        this.start.textContent = "Start";
    }
    this.init_board();
    this.draw_board();
};

GameOfLife.prototype.loadBoard = function(board) {
    this.reset_board();
    for (var i = 0; i < board.length; i++) {
        var cell = board[i];
        this.board[cell[0]][cell[1]].alive = 1;
    }
    this.draw_board();
};

GameOfLife.prototype.playPause = function() {
    if (!this.play) {
        this.start.textContent = "Pause";
    } else {
        this.start.textContent = "Start";
    }
    // Toggle play state.
    this.play = !this.play;
};

GameOfLife.prototype.draw_board = function() {
    // Reset canvas and redraw
    var width = this.canvas.width;
    var height = this.canvas.height;
    var block_size = this.block_size;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);
    var row_length = this.board.length;
    var col_length = this.board[0].length;
    for (var i = 0; i < row_length; i++) {
        // Draw grid lines
        ctx.beginPath();
        ctx.moveTo(0, i * block_size);
        ctx.lineTo(width, i * block_size);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(i * block_size, 0);
        ctx.lineTo(i * block_size, height);
        ctx.stroke();
        ctx.closePath();
        for (var j = 0; j < col_length; j++) {
            var cell = this.board[i][j];
            // Draw if alive
            if (cell.alive === 1) {
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.rect(cell.x, cell.y, block_size, block_size);
                ctx.fill();
                ctx.closePath();
            } else if (!this.play && this.mouse.x === cell.x && this.mouse.y === cell.y) {
                ctx.fillStyle = "grey";
                ctx.beginPath();
                ctx.rect(this.mouse.x, this.mouse.y, block_size, block_size);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
};

GameOfLife.prototype.register_events = function() {
    var that = this;
    this.start.addEventListener("click", this.playPause.bind(this), false);
    this.reset.addEventListener("click", this.reset_board.bind(this), false);

    function update_speed(e) {
        that.speed = parseInt(this.value, 10);
    }
    this.speedbutton.addEventListener("input", update_speed);

    var mousedownListener = function(e) {
        var board_width = that.board.length;
        var board_height = that.board[0].length;
        var xpos = e.offsetX ? e.offsetX : e.layerX;
        var ypos = e.offsetY ? e.offsetY : e.layerY;

        var board_x = Math.floor(xpos / that.block_size);
        var board_y = Math.floor(ypos / that.block_size);
        if (board_x >= board_width) {
            board_x = board_width - 1;
        }
        if (board_y >= board_height) {
            board_y = board_height - 1;
        }
        if (board_x < 0) {
            board_x = 0;
        }
        if (board_y < 0) {
            board_y = 0;
        }
        var cell = that.board[board_x][board_y];
        // On click, toggle cell life and redraw canvas.
        cell.alive = (cell.alive + 1) % 2;
        if (!that.play) {
            that.draw_board();
        }
    };
    var moveListener = function(e) {
        var board_width = that.board.length;
        var board_height = that.board[0].length;
        var xpos = e.offsetX ? e.offsetX : e.layerX;
        var ypos = e.offsetY ? e.offsetY : e.layerY;
        var board_y = Math.floor(ypos / that.block_size) * that.block_size;
        var board_x = Math.floor(xpos / that.block_size) * that.block_size;
        that.mouse.x = board_x;
        that.mouse.y = board_y;
        if (!that.play) {
            that.draw_board();
        }
    };
    this.canvas.addEventListener('mousedown', mousedownListener);
    this.canvas.addEventListener('mousemove', moveListener);
};

GameOfLife.prototype.update = function() {
    if (this.play) {
        var now = new Date();
        if (now - this.last_updated > (1000 - this.speed * 10)) {
            this.update_board();
            this.draw_board();
            this.last_updated = now;
        }
    }
    window.requestAnimationFrame(this.update.bind(this));
};

module.exports = GameOfLife;
},{}],6:[function(require,module,exports){
module.exports=function(){
    (function(){function Yb(a,b,c,e,k){return function(a){return k(e(a))(a)}}function Zb(){return function(a){return""+a}}function Ga(){return function(a){return function(b){return a+b}}}function Ud(a){return function(b){return a+b}}function Ha(){return function(a){return a.toString()}}function kb(){return function(a){return""+a}}function x(a,b,c){return function(a){var e=b(a);if(0===e.type)a=c(a);else if(1===e.type)if(e=e.$1,1===e.type){var d=e.$1;a=0===e.$2.type?new I(new f(new t(d.$1,d.$2),n)):new ha(new t("Error",
    a))}else a=new ha(new t("Error",a));else a=new ha(new t("Error",a));return a}}function Ic(a,b,c){return function(a){return function(b){b=c.$1(null)(a.$2)(b);return new t(a.$1,b)}}}function Vd(){return function(a){return Wd(a)}}function Xd(){return function(a){return Yd(a)}}function lb(a,b,c){return function(a){var e=$b(null,new g.jsbn.BigInteger("0"),a);if(1===e.type){var L=$b(null,new g.jsbn.BigInteger("1"),a);1===L.type?(a=b(e.$1),0===a.type?L=new d(a.$1):(L=b(L.$1),L=0===L.type?new d(L.$1):new h(new r(c(a.$1)(L.$1))))):
    L=new d(new q(new u(2,2),p(null,a),a))}else L=new d(new q(new u(2,2),p(null,a),a));return L}}function Zd(){return function(a){return Jc(a)}}function $d(){return function(a){return Kc(a)}}function ae(){return function(a){return be(a)}}function ce(){return function(a){return de(a)}}function Lc(){return function(a){return ee(a)}}function fe(){return function(a){if(1===a.type){var b=a.$1;a=2===b.type?0===b.$1.type?0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!1)):
    new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function ac(){return function(a){return Bb(a)}}function ge(a,b,c){return function(e){return T(a,b,c,e)}}function la(a,b){return function(a){a=""===a?new ha(new t(b,"")):new ha(new t(b,a));return a}}function he(){return function(a){return ie(a)}}function je(a,b,c,e){return function(a){var b=bc(null,null,null,new mb(ke(),Mc(),le()),Ic(null,
    null,c),e)(a),k=c.$1(null),d=new ya(cc(),Nc(),dc());b=Oc(null,null,Pc(),new Qc(d),b);a=k(b)(a);return new me(a)}}function Ia(a,b,c,e){return function(a){a=e(a);return new h(a)}}function ne(a,b,c,e,k,d,f){return function(a){var b=k(a);a=0===b.type?d(b.$1)(a):f(b.$1)(a);return a}}function oe(){return function(a){return 1===a.type?10===a.$1.type?0===a.$2.type?new h(new r(!0)):new h(new r(!1)):new h(new r(!1)):new h(new r(!1))}}function pe(){return function(a){return new h(new r(!1))}}function O(){return function(a){a=
    0<Ja(a,"0")||"0"===a?0>Ja(a,"9")?!0:"9"===a:!1;return a}}function qe(){return function(a){return E(a)}}function re(){return function(a){return 1===a.type?2===a.$1.type?0===a.$2.type?new h(new r(!0)):new h(new r(!1)):new h(new r(!1)):new h(new r(!1))}}function se(){return function(a){if(1===a.type){var b=a.$1;a=3===b.type?0===a.$2.type?new h(new r(!0)):new h(new r(!1)):2===b.type?0===b.$1.type?new h(new r(!1)):0===a.$2.type?new h(new r(!0)):new h(new r(!1)):new h(new r(!1))}else a=new h(new r(!1));
    return a}}function te(){return function(a){if(1===a.type){var b=a.$1;a=12===b.type?0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):11===b.type?0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function ca(){return function(a){return 0===(" "===a?1:0)?0===("\t"===a?1:0)?0===("\r"===a?1:0)?0===("\n"===a?1:0)?0===("\f"===a?1:0)?0===("\v"===a?
    1:0)?"\u00a0"===a:!0:!0:!0:!0:!0:!0}}function ue(){return function(a){return 1===a.type?8===a.$1.type?0===a.$2.type?new h(new r(!0)):new h(new r(!1)):new h(new r(!1)):new h(new r(!1))}}function ve(){return function(a){return 1===a.type?1===a.$1.type?0===a.$2.type?new h(new r(!0)):new h(new r(!1)):new h(new r(!1)):new h(new r(!1))}}function we(){return function(a){return 1===a.type?0===a.$1.type?0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!1)):new d(new q(new u(1,
    1),p(null,a),a)):new d(new q(new u(1,1),p(null,a),a))}}function Cb(){return function(a){if(""===a)var b=new ha(new t("'Item' run on empty input",""));else b=""===a?g["throw"](Error("Prelude.Strings: attempt to take the head of an empty string")):a[0],a=""===a?g["throw"](Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1),b=new I(new f(new t(b,a),n));return b}}function xe(){return function(a){a:{if(1===a.type){var b=a.$1;if(2===b.type){var c=a.$2;if(1===c.type){var e=
    c.$1;a=2===e.type?0===c.$2.type?new h(new A(F(null,b.$1,e.$1))):ec(null,n,a):ec(null,n,a);break a}}}a=ec(null,n,a)}return a}}function ye(){return function(a){if(1===a.type){var b=a.$1;a=2===b.type?0===a.$2.type?new h(new X(p(null,b.$1))):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function ze(){return function(a){return Ae(a)}}function Be(){return function(a){return Ce(a)}}function De(){return function(a){return Ee(a)}}
    function Fe(){return function(a){if(1===a.type){var b=a.$1;a=10===b.type?b.$1?0===a.$2.type?new h(new r(!1)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function Ge(){return function(a){a:{if(1===a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=nb(new f(a.$1,new f(b.$1,n)));a=0===a.type?new d(a.$1):He(null,null,a.$1);
    break a}}a=new d(new q(new u(2,2),p(null,a),a))}return a}}function Ie(){return function(a){return Je(a)}}function Ke(){return function(a){a:{if(1===a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=nb(new f(a.$1,new f(b.$1,n)));a=0===a.type?new d(a.$1):Le(null,null,a.$1);break a}}a=new d(new q(new u(2,2),p(null,a),a))}return a}}function Me(){return function(a){a=1===a.type?0===a.$2.type?ob(null,Lc(),null,new f(a.$1,n),new X(new g.jsbn.BigInteger("0"))):ob(null,Lc(),null,a.$2,a.$1):new d(new q(new qa(1),
    new g.jsbn.BigInteger("0"),n));return a}}function Ne(){return function(a){return Oe(a)}}function Pe(){return function(a){return Qe(a)}}function Re(){return function(a){return Se(a)}}function Te(){return function(a){return"b"===a?Db(Y(Na(),N("01")),ra(Na(),N("01"),new g.jsbn.BigInteger("2")),sa(Y(Na(),N("01")))):"d"===a?Rc():"o"===a?Db(Y(Oa(),y(O())),ra(Oa(),N("01234567"),new g.jsbn.BigInteger("8")),sa(Y(Oa(),y(O())))):"x"===a?Db(Y(Pa(),x(null,y(O()),N("ABCDEFabcdef"))),ra(Pa(),x(null,y(O()),N("ABCDEFabcdef")),
    new g.jsbn.BigInteger("16")),sa(Y(Pa(),x(null,y(O()),N("ABCDEFabcdef"))))):la(null,"Bad complex format")}}function Ue(){return function(a){return"b"===a?ra(Na(),N("01"),new g.jsbn.BigInteger("2")):"d"===a?ra(ta(),y(O()),new g.jsbn.BigInteger("10")):"o"===a?ra(Oa(),N("01234567"),new g.jsbn.BigInteger("8")):"x"===a?ra(Pa(),x(null,y(O()),N("ABCDEFabcdef")),new g.jsbn.BigInteger("16")):la(null,"Bad float format")}}function Ve(){return function(a){return"b"===a?Y(Na(),N("01")):"d"===a?Y(ta(),y(O())):"o"===
    a?Y(Oa(),y(O())):"x"===a?Y(Pa(),x(null,y(O()),N("ABCDEFabcdef"))):la(null,"Bad integer format")}}function We(){return function(a){return"b"===a?sa(Y(Na(),N("01"))):"d"===a?sa(Y(ta(),y(O()))):"o"===a?sa(Y(Oa(),y(O()))):"x"===a?sa(Y(Pa(),x(null,y(O()),N("ABCDEFabcdef")))):la(null,"Bad rational format")}}function Xe(a,b){return function(c){return Sc(a,b,c)}}function Ye(a){return function(a){return function(b){var c=b.$1.$1;var k=b.$1.$1.$2(a.$6)(b.$7);var d=b.$1.$1.$2(a.$7)(b.$6);c=c.$1(k)(d);k=b.$1.$1.$2(a.$7)(b.$7);
    return Qa(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function Ze(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$7);var k=b.$1.$1.$2(a.$7)(b.$6);return Qa(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function $e(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$6);var k=b.$1.$1.$2(a.$7)(b.$7);return Qa(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function af(a){return function(a){return function(b){var c=b.$5;var k=b.$1.$1.$2(a.$6)(b.$7);var d=b.$1.$1.$2(b.$6)(a.$7);c=c.$2(k)(d);k=b.$1.$1.$2(a.$7)(b.$7);
    return Qa(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function bf(a,b,c,e){return function(a){a=e(a);if(0===a.type)a=a.$1,a=c.$1(null)(null)(new cf(a.$1));else if(1===a.type)if(a=a.$1,1===a.type){var b=a.$1;a=0===a.$2.type?new C(b.$1):c.$1(null)(null)(new l("Read error"))}else a=c.$1(null)(null)(new l("Read error"));else a=c.$1(null)(null)(new l("Read error"));return a}}function df(a){return function(b){return window.lidrisp.print(a)}}function ef(a,b){return function(c){return ff(a,b,c)}}function D(){return function(a){return da(a)}}
    function gf(){return function(a){return hf(a)}}function jf(){return function(a){if(1===a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new h(new X(new g.jsbn.BigInteger(""+b.$1.length))):new d(new l("Invalid arguments to `string-length`")):new d(new l("Invalid arguments to `string-length`"))}else a=new d(new l("Invalid arguments to `string-length`"));return a}}function kf(){return function(a){return lf(a)}}function mf(){return function(a){if(1===a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new h(new fc(b.$1)):
    new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new m("string",a.$1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function nf(){return function(a){return of(a)}}function pf(){return function(a){if(1===a.type){var b=a.$1;a=1===b.type?0===a.$2.type?new h(new Ka(b.$1)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function qf(a,
    b){return function(a){a:{var c=b(a);if(0===c.type)a=new ha(new t(c.$1.$1,a));else{if(1===c.type&&(c=c.$1,1===c.type)){var k=c.$1;a=0===c.$2.type?new I(new f(new t(k.$1,k.$2),n)):new ha(new t("Error",a));break a}a=new ha(new t("Error",a))}}return a}}function Tc(a,b){return function(c){return rf(a,b,c)}}function pb(){return function(a){a=8===a.type?new h(a.$1):new d(new m("string",a));return a}}function sf(){return function(a){if(1===a.type){var b=a.$1;a=0===b.type?0===a.$2.type?new h(new X(new g.jsbn.BigInteger(""+
    b.$1))):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new m("Vector",a.$1)):new d(new q(new u(1,1),p(null,a),a))}else a=new d(new q(new u(1,1),p(null,a),a));return a}}function tf(){return function(a){return uf(a)}}function vf(){return function(a){var b="c"+(na(null,null,Ga(),"",a)+"r");a=na(null,null,wf(),xf(),a);return new t(b,a)}}function yf(){return function(a){return function(b){return new t(a,b)}}}function zf(){return function(a){return Af(a)}}function Bf(a,b){return function(c){c=
    1===b.type?new v(T(null,a,c,b.$1),Uc(a,c,b.$2)):new C(n);return new v(c,zf())}}function Cf(){return function(a){return"("===a}}function Df(){return function(a){return"["===a}}function Ef(){return function(a){return"{"===a}}function Eb(a){return function(b){return function(b){return new I(new f(new t(a,b),n))}}}function Ff(a){return function(b){return w(null,null,Gf(a),Eb(b))}}function Hf(a){return function(b){return w(null,null,a,Ff(b))}}function J(){return function(a){return a}}function If(a){return function(b){return w(null,
    null,a,Eb(b))}}function Jf(a,b){return function(c){return Fb(null,a,b)}}function qb(){return function(a){return function(b){return a===b}}}function Kf(a,b){return function(c){c=1===c.type?new C(c.$1):a.$1(null)(null)(new l("Unknown atom: "+b));return c}}function Lf(a,b,c){return function(e){return Vc(null,a,null,null,b,e,c)}}function Ra(){return function(a){return new C(oa)}}function Mf(a,b,c){return function(e){e=a.$3.$5(b)(c)(e);return new v(e,Ra())}}function G(){return function(a){return D()}}
    function Wc(){return function(a){return new C(a)}}function Nf(a,b){return function(c){if(12===b.type)if(ua(p(null,b.$2),p(null,c))?0:1!==b.$3.type)var e=a.$1(null)(null)(new q(new qa(p(null,b.$2).intValue()|0),p(null,c),c));else{e=a.$3.$6(b.$5);var k=F,d=Gb(null,null,null,yf(),b.$2,c);var h=b.$3;if(1===h.type){h=h.$1;c:for(var m=p(null,b.$2);;)if(m.equals(new g.jsbn.BigInteger("0")))break c;else if(1===c.type)m=m.subtract(new g.jsbn.BigInteger("1")),c=c.$2;else break c;h=new f(new t(h,new A(c)),n)}else h=
    n;e=e(k(null,d,h));e=new v(e,Bf(a,b.$4))}else 11===b.type?(e=b.$1(c),e=0===e.type?a.$1(null)(null)(e.$1):new C(e.$1)):e=a.$1(null)(null)(new l("application: not a procedure; expected a procedure that can be applied to arguments; given: "+da(b)));return new v(e,Wc())}}function Of(a,b,c){return function(e){return new v(Hb(null,a,b,c),Nf(a,e))}}function H(a,b,c,e){return function(k){return new v(T(null,a,b,c),Of(a,b,e))}}function Pf(a,b,c,e){return function(k){k=10===k.type?k.$1?T(null,a,b,e):T(null,
    a,b,c):T(null,a,b,e);return k}}function Qf(a,b,c){return function(e){return new C(new rb("\u03bb",Q(null,null,D(),a),aa,b,c))}}function Rf(){return function(a){return function(b){return Sf(a,b)}}}function Tf(a,b){return function(c){return za(null,a,c,b)}}function Uf(a,b,c,e){return function(k){k=a.$3.$6(b)(Gb(null,null,null,Rf(),c,k));return new v(k,Tf(a,e))}}function Vf(a,b,c,e){return function(k){return Wf(a,b,c,e,k)}}function Xf(a,b,c,e,k){return function(d){return new v(Ib(null,a,b),Vf(a,c,e,
    k))}}function Yf(a,b,c,e){return function(k){return Zf(a,b,c,e,k)}}function gc(a,b,c){return function(e){return za(null,a,b,c)}}function $f(a,b,c,e){return function(k){return new v(Xc(null,null,null,null,a,k,b,c),gc(a,k,e))}}function ag(a,b,c,e){return function(k){return bg(a,b,c,e,k)}}function cg(a,b,c,e,k){return function(d){return new v(Ib(null,a,b),ag(a,c,e,k))}}function dg(a,b,c,e){return function(k){return eg(a,b,c,e,k)}}function fg(){return function(a){return function(b){return gg(a,b)}}}function hg(a,
    b,c,e){return function(k){return new v(Yc(null,null,null,null,a,b,Gb(null,null,null,fg(),c,k)),gc(a,b,e))}}function ig(a,b,c,e,k){return function(d){return new v(Hb(null,a,b,c),hg(a,b,e,k))}}function jg(a,b,c,e){return function(k){return new v(Zc(null,null,null,null,a,k,b),ig(a,k,c,b,e))}}function kg(a,b,c,e){return function(k){return lg(a,b,c,e,k)}}function mg(a,b,c,e,k){return function(d){return new v(Ib(null,a,b),kg(a,c,e,k))}}function ng(a,b,c,e){return function(k){return og(a,b,c,e,k)}}function pg(a){return function(b){b=
    a.$2(null)(da(b)+"\n");return new v(b,Ra())}}function qg(a,b,c){return function(e){e=a.$3.$4(b)(c)(e);return new v(e,Ra())}}function rg(a,b,c,e,k){return function(d){return new v(sg(null,null,a,b,c,e,d,k),Ra())}}function tg(a,b,c,e){return function(k){var d=a.$3.$3(b)(c);return new v(d,rg(c,e,a,b,k))}}function hc(a){return function(b){return new C(new f(a,b))}}function ug(a,b,c){return function(e){return new v(Hb(null,a,b,c),hc(e))}}function vg(a,b){return function(c){var e=ge(null,a,b);c=1===c.type?
    new v(e(c.$1),$c(e,c.$2)):new C(n);return new v(c,Wc())}}function Pc(){return function(a){return function(b){return ic(null,null,b.$1,b.$2,a)}}}function wg(a){return function(b){return xg(a,b)}}function yg(a){return function(b){return zg(a,b)}}function ke(){return function(a){return function(a){return function(a){return function(b){return function(c){c=b(c);return a(c)}}}}}}function Mc(){return function(a){return function(a){return function(b){return a}}}}function le(){return function(a){return function(a){return function(a){return function(b){return function(c){var e=
    a(c);c=b(c);return e(c)}}}}}}function cc(){return function(a){return function(b){return a==b}}}function Nc(){return function(a){return function(b){return sb(a,b)}}}function dc(){return function(a){return function(b){b=0>sb(a,b)?!0:a==b;return b}}}function Ag(){return function(a){return new h(new A(a))}}function ad(){return function(a){return function(a){return Sa}}}function jc(){return function(a){return new I(new f(new t(n,a),n))}}function bd(a){return function(b){return function(c){return new I(new f(new t(new f(a,
    b),c),n))}}}function Bg(a){return function(b){return w(null,null,Ta(null,a),bd(b))}}function Cg(){return function(a){return")"===a}}function Dg(){return function(a){return"]"===a}}function Eg(){return function(a){return"}"===a}}function U(){return function(a){return function(b){return a.add(b)}}}function V(){return function(a){return function(b){return a.multiply(b)}}}function Ua(){return function(a){return function(b){return cd(a,b)}}}function Va(){return function(a){return function(b){return tb(a,
    b)}}}function ma(){return function(a){return function(b){return a.equals(b)}}}function Wa(){return function(a){a=0>va(a,new g.jsbn.BigInteger("0"))?(new g.jsbn.BigInteger("0")).subtract(a):a;return a}}function Xa(){return function(a){return function(b){return va(a,b)}}}function Ya(){return function(a){return function(b){b=0>va(a,b)?!0:a.equals(b);return b}}}function Za(){return function(a){return function(b){return a.subtract(b)}}}function Fg(){return function(a){return Math.cos(a)}}function Gg(){return function(a){return function(b){return new ea((Math.exp(b)+
    Math.exp(-b))/2*Math.cos(a),(Math.exp(b)-Math.exp(-b))/2*-1*Math.sin(a))}}}function Hg(){return function(a){return ob(null,Ig(),null,a,new X(new g.jsbn.BigInteger("0")))}}function Jg(){return function(a){a=0===a.type?new h(new X(new g.jsbn.BigInteger("1"))):ob(null,Kg(null),null,a,new X(new g.jsbn.BigInteger("1")));return a}}function Lg(){return function(a){a=1===a.type?ob(null,Mg(null,null),null,a.$2,a.$1):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function Ng(){return function(a){return 1===
    a.type?6===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):E(a):1===a.type?5===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):E(a):E(a)}}function Og(){return function(a){return 1===
    a.type?6===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):E(a):1===a.type?5===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):E(a):E(a)}}function Pg(){return function(a){return 1===
    a.type?5===a.$1.type?0===a.$2.type?new h(new r(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a):E(a)}}function Qg(){return function(a){return 1===a.type?7===a.$1.type?0===a.$2.type?new h(new r(!0)):E(a):E(a):E(a)}}function Rg(){return function(a){a=1===a.type?$a("=",Sg(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function Tg(){return function(a){a=1===a.type?$a("/=",
    Ug(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function Vg(){return function(a){a=1===a.type?$a(">",Wg(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function Xg(){return function(a){a=1===a.type?$a("<",Yg(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function Zg(){return function(a){a=1===a.type?$a(">=",$g(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));
    return a}}function ah(){return function(a){a=1===a.type?$a("<=",bh(null,null),a.$1,a.$2):new d(new q(new qa(1),new g.jsbn.BigInteger("0"),n));return a}}function ch(){return function(a){return Math.sin(a)}}function dh(){return function(a){return function(b){return new ea((Math.exp(b)+Math.exp(-b))/2*Math.sin(a),(Math.exp(b)-Math.exp(-b))/2*Math.cos(a))}}}function dd(a){return function(b){var c=""===a?g["throw"](Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];return b===
    c}}function kc(){return function(a){a=ed(a)?!0:fd(a);return a}}function eh(a){return function(b){var c="#f"===a?new r(!1):"#t"===a?new r(!0):new fc(a);return new I(new f(new t(c,b),n))}}function fh(a){return function(b){b=na(null,null,Ga(),"",new f(a,b));return eh(b)}}function gh(){return function(a){return w(null,null,Ta(null,x(null,y(kc()),x(null,y(O()),N("!#$%&|*+-/:<=>?@^_~")))),fh(a))}}function lc(){return function(a){return function(a){return new I(new f(new t(oa,a),n))}}}function gd(){return function(a){return w(null,
    null,mc(null,null,ub("|#"),x(null,w(null,null,ub("#|"),gd()),w(null,null,Cb(),lc()))),lc())}}function hh(){return function(a){a=ed(a)?String.fromCharCode((a.charCodeAt(0)|0)+32):a;return a}}function ih(a){return function(b){return jh(a,b)}}function kh(){return function(a){a=na(null,null,Ga(),"",Q(null,null,hh(),a));return ih(a)}}function lh(){return function(a){return w(null,null,ab(null,y(kc())),kh())}}function Na(){return function(a){return Jb(Xd(),new g.jsbn.BigInteger("2"),null,new g.jsbn.BigInteger("0"),
    a)}}function ta(){return function(a){return Jb(ce(),new g.jsbn.BigInteger("10"),null,new g.jsbn.BigInteger("0"),a)}}function mh(){return function(a){return nh(a)}}function oh(){return function(a){return ph(a)}}function qh(){return function(a){return"i"===a}}function rh(a,b){return function(c){return new I(new f(new t(new R(new ea(a,b)),c),n))}}function sh(a,b){return function(c){c=1===a.type?1===b.type?rh(a.$1,b.$1):la(null,"Division by zero"):la(null,"Division by zero");return c}}function th(a){return function(b){return w(null,
    null,y(qh()),sh(a,b))}}function uh(a,b,c){return function(e){return w(null,null,vb(null,null,oh(),x(null,a,x(null,b,c))),th(e))}}function Pa(){return function(a){return Jb(he(),new g.jsbn.BigInteger("16"),null,new g.jsbn.BigInteger("0"),a)}}function Oa(){return function(a){return Jb(Pe(),new g.jsbn.BigInteger("8"),null,new g.jsbn.BigInteger("0"),a)}}function Kb(){return function(a){return"."===a}}function vh(a,b){return function(c){return function(e){return wh(a,b,c,e)}}}function xh(a){return function(b){return w(null,
    null,Aa(null,ia(null,y(ca()))),vh(b,a))}}function yh(a){return function(b){return w(null,null,Ba(),xh(a))}}function zh(a){return function(b){return w(null,null,ia(null,y(ca())),yh(a))}}function Ah(){return function(a){return w(null,null,y(Kb()),zh(a))}}function Bh(){return function(a){return w(null,null,nc(null,null,Ba(),ia(null,y(ca()))),Ah())}}function wb(){return function(a){return"#"===a}}function Ch(){return function(a){return w(null,null,N("bdox"),Ue())}}function hd(){return function(a){return"-"===
    a}}function Dh(){return function(a){return-a}}function Eh(a,b,c){return function(e){return oc(a,b,c,Dh())}}function id(){return function(a){return"+"===a}}function Fh(a,b,c){return function(e){return oc(a,b,c,J())}}function Gh(){return function(a){return w(null,null,N("bdox"),Ve())}}function Hh(){return function(a){return(new g.jsbn.BigInteger("0")).subtract(a)}}function Ih(a,b){return function(c){return pc(a,b,Hh())}}function Jh(a,b){return function(c){return pc(a,b,J())}}function Kh(){return function(a){return";"===
    a}}function Lh(){return function(a){return"\n"===a}}function Mh(){return function(a){return w(null,null,mc(null,null,y(Lh()),Cb()),lc())}}function Nh(){return function(a){return function(b){return new I(new f(new t(new A(a),b),n))}}}function Oh(){return function(a){return w(null,null,N("bdox"),Te())}}function Ph(){return function(a){return"'"===a}}function Qh(){return function(a){return function(b){return new I(new f(new t(new A(new f(new fc("quote"),new f(a,n))),b),n))}}}function Rh(){return function(a){return w(null,
    null,Ba(),Qh())}}function Sh(){return function(a){return w(null,null,N("bdox"),We())}}function Th(){return function(a){return Uh(a)}}function Vh(){return function(a){return"/"===a}}function Wh(){return function(a){return Xh(a)}}function Yh(a){return function(b){return new I(new f(new t(new ka(a),b),n))}}function Zh(a){return function(b){b=Qa(null,new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),V(),J()),Za()),a,b);b=1===b.type?Yh(b.$1):
    la(null,"Division by zero");return b}}function $h(a,b){return function(c){return w(null,null,vb(null,null,Wh(),a),Zh(b))}}function ai(a){return function(b){return w(null,null,y(Vh()),$h(a,b))}}function bi(){return function(a){return w(null,null,Aa(null,ia(null,y(ca()))),Eb(a))}}function ci(){return function(a){a=w;var b=Ba();var c=ia(null,y(ca()));b=x(null,w(null,null,b,jd(c,b)),jc());return a(null,null,b,bi())}}function qc(){return function(a){return'"'===a}}function di(a){return function(b){return function(b){return new I(new f(new t(new Ka(na(null,
    null,Ga(),"",a)),b),n))}}}function ei(){return function(a){return w(null,null,y(qc()),di(a))}}function fi(){return function(a){a=w;var b=w(null,null,y(gi()),hi());var c=qc();c=w(null,null,Cb(),ii(c));return a(null,null,Ta(null,x(null,b,c)),ei())}}function ji(a,b,c){return function(e){return new I(new f(new t(new A(new f(a,F(null,b,c))),e),n))}}function ki(a,b,c){return function(e){e=0===a.type?la(null,"Illegal use of `.`"):0===b.type?la(null,"Illegal use of `.`"):ji(c,a,b);return e}}function li(a,
    b){return function(c){return w(null,null,Aa(null,ia(null,y(ca()))),ki(a,c,b))}}function mi(a,b){return function(c){c=w;var e=Ba();var k=ia(null,y(ca()));e=x(null,w(null,null,e,jd(k,e)),jc());return c(null,null,e,li(a,b))}}function ni(a,b){return function(c){return w(null,null,ia(null,y(ca())),mi(a,b))}}function oi(a,b){return function(c){return w(null,null,y(Kb()),ni(a,b))}}function pi(a){return function(b){return w(null,null,ia(null,y(ca())),oi(a,b))}}function qi(a){return function(b){return w(null,
    null,Ba(),pi(a))}}function ri(a){return function(b){return w(null,null,ia(null,y(ca())),qi(a))}}function si(){return function(a){return w(null,null,y(Kb()),ri(a))}}function ti(){return function(a){return w(null,null,nc(null,null,Ba(),ia(null,y(ca()))),si())}}function ui(){return function(a){return function(b){return new I(new f(new t(new vi(p(null,a).intValue()|0,a),b),n))}}}function wi(){return function(a){return w(null,null,kd(null,ld()),ui())}}function xi(){return function(a){return new t(a.$1,
    new yi(a.$2))}}function zi(){return function(a){return new h(oa)}}function Ai(){return function(a){return nc(null,null,Ba(),Aa(null,y(ca())))}}function md(a){return function(b){return new I(new f(new t(a,b),n))}}function ii(a){return function(b){b=a(b)?la(null,"Rejection condition not satisfied for: `"+(b+"`")):md(b);return b}}function nd(){return function(a){return function(a){return function(a){return new Da(Ea(),od(a))}}}}function pd(){return function(a){return function(a){return new Da(Ea(),Ia(null,
    null,null,Bi(a)))}}}function db(){return function(a){return function(a){return Ci(null,a)}}}function eb(){return function(a){return function(a){return Di(null,a)}}}function fb(){return function(a){return function(a){return function(b){return Ei(null,a,b)}}}}function qd(){return function(a){return function(b){var c=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,Fi(null,null,null,a,c,b)))}}}function rd(){return function(a){var b=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,
    je(null,null,b,a)))}}function sd(){return function(a){return function(b){var c=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,Gi(null,null,null,b,c,a)))}}}function td(){return function(a){return function(b){return function(c){var e=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,Hi(null,null,null,b,c,e,a)))}}}}function ud(){return function(a){return function(b){return function(c){var e=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,Ii(null,null,null,b,c,e,a)))}}}}
    function vd(){return function(a){return function(b){var c=new gb(db(),eb(),fb());return new Da(Ea(),Ia(null,null,null,Ji(null,null,a,b,c)))}}}function Ki(){return function(a){return 13!==a.type}}function Li(){return function(a){a=Q(null,null,D(),wd(null,Ki(),a));a=na(null,null,Ga(),"",xd(Q(null,null,Mi(),a)));return new C(a)}}function Ni(a){return function(b){var c=new yd(nd(),pd(),new zd(qd(),rd(),sd(),td(),ud(),vd()));b=new v(bf(null,null,c,w(null,null,Aa(null,y(ca())),Ai()))(a),vg(c,b));return new v(b,
    Li())}}function Oi(){return function(a){return function(b){return function(b){return new h(a)}}}}function Pi(){return function(a){return function(b){return Qi(a)}}}function Ri(){return function(a){return function(b){return a}}}function Si(a){return function(b){return a}}function Ad(){return function(a){return function(b){return ef(a,b)}}}function Ti(a){return function(b){return function(b){var c=(new yd(nd(),pd(),new zd(qd(),rd(),sd(),td(),ud(),vd()))).$3.$2(Q(null,null,xi(),F(null,new f(new t("vector?",
    we()),new f(new t("vector-length",sf()),new f(new t("vector-ref",tf()),n))),F(null,F(null,new f(new t("pair?",se()),new f(new t("car",Zd()),new f(new t("cdr",$d()),new f(new t("cons",ae()),new f(new t("null?",fe()),new f(new t("list",Ag()),new f(new t("list?",re()),new f(new t("length",ye()),new f(new t("append",xe()),new f(new t("reverse",Be()),new f(new t("member",ze()),n))))))))))),Q(null,null,vf(),F(null,Lb(null,null,null,new f("a",new f("d",n)),new mb(rc(),sc(),tc()),2),F(null,Lb(null,null,null,
    new f("a",new f("d",n)),new mb(rc(),sc(),tc()),3),Lb(null,null,null,new f("a",new f("d",n)),new mb(rc(),sc(),tc()),4))))),F(null,new f(new t("+",Hg()),new f(new t("-",Me()),new f(new t("*",Jg()),new f(new t("/",Lg()),new f(new t("modulo",Ge()),new f(new t("number?",Ng()),new f(new t("complex?",Og()),new f(new t("real?",Pg()),new f(new t("rational?",Qg()),new f(new t("integer?",qe()),new f(new t("=",Rg()),new f(new t("/=",Tg()),new f(new t(">",Vg()),new f(new t("<",Xg()),new f(new t(">=",Zg()),new f(new t("<=",
    ah()),new f(new t("quotient",Ie()),new f(new t("remainder",Ke()),new f(new t("sin",Tc(ch(),dh())),new f(new t("cos",Tc(Fg(),Gg())),new f(new t("number->string",Ne()),n))))))))))))))))))))),F(null,new f(new t("string=?",lb(null,pb(),cc())),new f(new t("string<?",lb(null,pb(),Ui())),new f(new t("string>?",lb(null,pb(),Vi())),new f(new t("string<=?",lb(null,pb(),dc())),new f(new t("string>=?",lb(null,pb(),Wi())),new f(new t("string?",ue()),new f(new t("string-ref",kf()),new f(new t("make-string",De()),
    new f(new t("string-length",jf()),new f(new t("string-append",gf()),new f(new t("substring",nf()),n))))))))))),F(null,new f(new t("boolean?",oe()),new f(new t("and",Vd()),new f(new t("or",Re()),new f(new t("not",Fe()),n)))),F(null,new f(new t("symbol?",ve()),new f(new t("symbol->string",pf()),new f(new t("string->symbol",mf()),n))),F(null,new f(new t("procedure?",te()),n),F(null,new f(new t("char?",pe()),n),new f(new t("eq?",ac()),new f(new t("eqv?",ac()),new f(new t("equal?",ac()),new f(new t("void",
    zi()),n))))))))))))));c=ne(null,null,null,null,Bd(null,null,null,null,null,Cd,new v(c,Ni(a)),Oi()),Pi(),Ri());return Yb(null,null,null,c,b)}}}function Xi(a){return function(b){return function(b){return Yb(null,null,null,df(a),b)}}}function Yi(){return function(a){return Mb(null,null,Ad(),Dd())}}function Zi(){return function(a){return Mb(null,null,Xi(a),Yi())}}function Dd(){return function(a){return Mb(null,null,Ti(a),Zi())}}function $i(a){return function(b){return a(aj)}}function bj(a,b){return function(c){return function(e){return Bd(null,
    null,null,null,null,e,a(c),b)}}}function cj(a,b,c){return function(b){return function(c){return a(b)(c)}}}function dj(a,b){return function(c){return a(c)(b)}}function ej(a){return function(b){b=a(b)?md(b):la(null,"Condition not satisfied for: `"+(b+"`"));return b}}function fj(){return function(a){return"\\a"+a}}function gj(){return function(a){return"\\b"+a}}function hj(){return function(a){return"\\t"+a}}function ij(){return function(a){return"\\n"+a}}function jj(){return function(a){return"\\v"+
    a}}function kj(){return function(a){return"\\f"+a}}function lj(){return function(a){return"\\r"+a}}function mj(){return function(a){return"H"===a}}function nj(){return function(a){return"\\\\"+a}}function oj(){return function(a){return"\\DEL"+a}}function pj(a){return function(b){return"\\"+(a+b)}}function qj(a){return function(b){return"\\"+Sc(O(),fa(null,kb(),S,a.charCodeAt(0)|0),b)}}function rj(){return function(a){return fa(null,Zb(),S,a)}}function sj(){return function(a){return function(b){return fa(null,
    Zb(),a,b)}}}function Nb(){return function(a){return function(a){return new I(new f(new t(Sa,a),n))}}}function Ui(){return function(a){return function(b){return!!(0>sb(a,b))}}}function Vi(){return function(a){return function(b){return!!(0<sb(a,b))}}}function Wi(){return function(a){return function(b){b=0<sb(a,b)?!0:a==b;return b}}}function tj(){return function(a){return new I(new f(new t("",a),n))}}function uj(a){return function(b){b=""===a?g["throw"](Error("Prelude.Strings: attempt to take the tail of an empty string")):
    a.slice(1);return w(null,null,ub(b),Eb(a))}}function vj(){return function(a){return new f(a,n)}}function Mi(){return function(a){if(1===W(0===(""==a?1:0)?!0:!1,!0).type)a=n;else{var b=0===(""==a.slice(1)?1:0)?!0:!1;1===W(b,!0).type?b=n:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===W(b,!0).type?b=n:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===W(b,!0).type?n:new f(a.slice(1).slice(1).slice(1)[0],uc(a.slice(1).slice(1).slice(1).slice(1))),b=new f(a.slice(1).slice(1)[0],b)),b=new f(a.slice(1)[0],
    b));a=new f(a[0],b)}return a}}function vc(){return function(a){if(1===W(0===(""==a?1:0)?!0:!1,!0).type)a=n;else{var b=0===(""==a.slice(1)?1:0)?!0:!1;1===W(b,!0).type?b=n:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===W(b,!0).type?b=n:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,1===W(b,!0).type?b=n:(b=0===(""==a.slice(1).slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===W(b,!0).type?n:new f(a.slice(1).slice(1).slice(1).slice(1)[0],uc(a.slice(1).slice(1).slice(1).slice(1).slice(1))),b=new f(a.slice(1).slice(1).slice(1)[0],
    b)),b=new f(a.slice(1).slice(1)[0],b)),b=new f(a.slice(1)[0],b));a=new f(a[0],b)}return a}}function wj(){return function(a){return function(b){return F(null,a,new f(" ",b))}}}function Ea(){return function(a){return function(a){return function(a){return function(b){return Yb(null,null,null,a,xj(b))}}}}}function Bi(a){return function(b){g.prim_writeStr(a+"\n");return Sa}}function od(a){return function(b){return new d(a)}}function yj(a,b,c){return function(e){return a(e)(b)(c)}}function xj(a){return function(b){b=
    0===b.type?od(b.$1):a(b.$1);return b}}function vb(a,b,c,e){return function(a){a=e(a);0===a.type?(a=a.$1,a=new ha(new t(a.$1,a.$2))):a=new I(Ed(null,null,null,null,c,a.$1));return a}}function Ci(a,b){return function(a){return{val:b}}}function Di(a,b){return function(a){return b.val}}function Ei(a,b,c){return function(a){return b.val=c}}function Mb(a,b,c,e){return function(a){return function(b){return c(a)(yj(e,a,b))}}}function w(a,b,c,e){return function(a){var b=c(a);if(0===b.type)a=new ha(new t(b.$1.$1,
    a));else if(1===b.type)if(b=b.$1,1===b.type){var k=b.$1;a=0===b.$2.type?e(k.$1)(k.$2):new ha(new t("Error",a))}else a=new ha(new t("Error",a));else a=new ha(new t("Error",a));return a}}function rc(){return function(a){return function(a){return function(a){return function(b){return Q(null,null,a,b)}}}}}function sc(){return function(a){return function(a){return new f(a,n)}}}function zj(a){return function(b){return function(c){return F(null,Q(null,null,b,a),c)}}}function tc(){return function(a){return function(a){return function(a){return function(b){return na(null,
    null,zj(b),n,a)}}}}}function wf(){return function(a){return function(b){return function(c){0===("a"===a?1:0)?(c=b(c),c=0===c.type?new d(c.$1):Kc(new f(c.$1,n))):(c=b(c),c=0===c.type?new d(c.$1):Jc(new f(c.$1,n)));return c}}}}function Aj(){return function(a){return function(a){return function(a){return function(b){return function(c){c=b(c);return a(c)}}}}}}function Bj(){return function(a){return function(a){return function(a){return function(b){return function(c){var e=a(c);c=b(c);return e(c)}}}}}}
    function Cj(a,b,c){return function(e){return function(k){var d=a.$2(null)(b)(k);return a.$3(null)(b)(ic(null,null,c,e,d))(k)}}}function Dj(a,b,c){return function(e){return function(k){var d=a.$2(null)(b)(k);return a.$3(null)(b)(ic(null,null,c,e,d))(k)}}}function $c(a,b){return function(c){var e=1===b.type?new v(a(b.$1),$c(a,b.$2)):new C(n);return new v(e,hc(c))}}function Ob(){return function(a){return function(b){return a+b}}}function Pb(){return function(a){return function(b){return a*b}}}function Qb(){return function(a){return a.intValue()}}
    function Ej(a,b,c,e){return function(k){return function(d){var h=c(e);var L=c(k);if(0===(L.equals(new g.jsbn.BigInteger("0"))?1:0)){L=L.intValue();var l=b.intValue();h=h.intValue()+L/wc(null,new M(Ob(),Pb(),Qb()),l,(new g.jsbn.BigInteger(Math.trunc(Math.floor(Math.log(L)/Math.log(l)))+"")).add(new g.jsbn.BigInteger("1")))}else h=h.intValue();return new I(new f(new t(new P(a(h)),d),n))}}}function Fj(a,b,c,e,k){return function(d){return w(null,null,ab(null,a),Ej(b,c,e,k))}}function Gj(a,b,c,e){return function(k){return w(null,
    null,y(Kb()),Fj(a,b,c,e,k))}}function Hj(a,b){return function(c){return new X(a(b(c)))}}function gi(){return function(a){return"\\"===a}}function Ij(){return function(a){return function(b){return Jj(a,b)}}}function hi(){return function(a){return w(null,null,N('\\"nrt'),Ij())}}function Fd(){return function(a){return function(b){return new f(a,b)}}}function jd(a,b){return function(c){return w(null,null,Ta(null,w(null,null,a,Si(b))),bd(c))}}function Gd(){return function(a){return function(a){return!0}}}
    function Kj(a,b){return function(c){return w(null,null,mc(null,null,a,b),Nb())}}function Hd(a,b){return function(c){return new f(c,xc(null,null,null,null,null,a,b))}}function Lj(a,b,c){return function(e){return new f(e,xc(null,null,null,null,null,Hd(a,b),c))}}function Uc(a,b,c){return function(e){var k=1===c.type?new v(T(null,a,b,c.$1),Uc(a,b,c.$2)):new C(n);return new v(k,hc(e))}}function Id(){return function(a){return function(b){return a-b}}}function Mj(){return function(a){return function(b){return a/
    b}}}function Nj(a,b,c,e){return function(k){k=10===k.type?k.$1?0===e.type?new C(k):za(null,b,a,e):yc(null,a,null,b,c):0===e.type?new C(k):za(null,b,a,e);return k}}function Oj(a,b,c,e){return function(k){k=10===k.type?k.$1?0===e.type?new C(k):za(null,b,a,e):yc(null,a,null,b,c):0===e.type?new C(k):za(null,b,a,e);return k}}function Pj(a,b,c,e,k){return function(d){d=d?za(null,b,a,k):Vc(null,a,null,null,b,c,e);return d}}function Qj(a,b,c){return function(e){e=10===e.type?e.$1?new C(!0):xb(null,null,null,
    null,a,new f(b,new f(new A(c),n))):xb(null,null,null,null,a,new f(b,new f(new A(c),n)));return e}}function Rj(a,b,c){return function(e){e=10===e.type?e.$1?new C(!0):xb(null,null,null,null,a,new f(b,new f(new A(c),n))):xb(null,null,null,null,a,new f(b,new f(new A(c),n)));return e}}function Sj(a,b,c,e){return function(k){return Xc(null,null,null,null,a,b,c,e)}}function Tj(a,b,c,e,k){return function(d){return Uj(a,b,c,e,k,d)}}function Vj(a,b,c){return function(e){return Zc(null,null,null,null,a,b,c)}}
    function Wj(a,b,c){return function(e){return Yc(null,null,null,null,a,b,c)}}function xf(){return function(a){a=1===a.type?0===a.$2.type?new h(a.$1):new h(new A(a)):new h(new A(a));return a}}function Ji(a,b,c,e,k){return function(a){var b=bc(null,null,null,new mb(Aj(),Mc(),Bj()),Ic(null,null,k),e)(a),d=k.$1(null),f=new ya(cc(),Nc(),dc());b=Oc(null,null,Pc(),new Qc(f),b);a=d(b)(a);return new Xj(a,c)}}function Ii(a,b,c,e,k,d,f){return function(a){if(1===f.type){var b=d.$2(null)(f.$1)(a);b=0===b.type?
    aa:hb(null,null,b.$1,null,e,b.$2);1===b.type?a=d.$3(null)(b.$1)(k)(a):(b=d.$1(null)(k),a=Cj(d,f.$1,e)(b(a))(a))}else b=d.$2(null)(f.$1)(a),b=0===b.type?aa:hb(null,null,b.$1,null,e,b.$2),1===b.type?a=d.$3(null)(b.$1)(k)(a):(b=d.$1(null)(k),a=Dj(d,f.$1,e)(b(a))(a));return a}}function Gi(a,b,c,e,k,d){return function(a){a:for(var b=d;;)if(1===b.type){var c=k.$2(null)(b.$1)(a);c=0===c.type?aa:hb(null,null,c.$1,null,e,c.$2);if(1===c.type){a=k.$2(null)(c.$1)(a);a=new ba(a);break a}b=b.$2}else{b=k.$2(null)(b.$1)(a);
    b=0===b.type?aa:hb(null,null,b.$1,null,e,b.$2);if(1===b.type){a=k.$2(null)(b.$1)(a);a=new ba(a);break a}a=aa;break a}return a}}function Ig(){return function(a){return Yj(a)}}function Hi(a,b,c,e,k,d,f){return function(a){a:for(var b=f;;)if(1===b.type){var c=d.$2(null)(b.$1)(a);c=0===c.type?aa:hb(null,null,c.$1,null,e,c.$2);if(1===c.type){b=d.$3(null)(c.$1)(k);c=Gd();a=c(b(a))(a);break a}b=b.$2}else{b=d.$2(null)(b.$1)(a);b=0===b.type?aa:hb(null,null,b.$1,null,e,b.$2);if(1===b.type){b=d.$3(null)(b.$1)(k);
    c=Gd();a=c(b(a))(a);break a}a=!1;break a}return a}}function Fi(a,b,c,e,k,d){return function(f){return Jd(a,b,c,e,k,d,f)}}function Sg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new h(new r(yb(null,qb(),a.$1,b.$1))):new d(new l("Unexpected error in ="));else if(5===b.type)b=5===a.type?new h(new r(a.$1===b.$1)):new d(new l("Unexpected error in ="));else if(4===b.type)b=4===a.type?new h(new r(a.$1.equals(b.$1))):new d(new l("Unexpected error in ="));else if(7===b.type&&7===
    a.type){b=b.$1;var c=a.$1;var e=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);b=b.$2(e)(c);b=new h(new r(b))}else b=new d(new l("Unexpected error in ="));return b}}}function Wg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new d(new l("> not defined for complex numbers")):new d(new l("Unexpected error in >"));else if(5===b.type)b=5===a.type?new h(new r(!!(0<wa(a.$1,b.$1)))):new d(new l("Unexpected error in >"));else if(4===b.type)b=4===a.type?new h(new r(!!(0<va(a.$1,b.$1)))):
    new d(new l("Unexpected error in >"));else if(7===b.type&&7===a.type){var c=b.$1,e=a.$1;b=c.$4;var f=c.$1.$1.$2(e.$6)(c.$7);c=c.$1.$1.$2(c.$6)(e.$7);b=!!(0<b.$2(f)(c));b=new h(new r(b))}else b=new d(new l("Unexpected error in >"));return b}}}function $g(a,b){return function(a){return function(b){a:if(6===b.type)var c=6===a.type?new d(new l(">= not defined for complex numbers")):new d(new l("Unexpected error in >="));else{if(5===b.type){if(5===a.type){c=0<wa(a.$1,b.$1)?!0:a.$1===b.$1;c=new h(new r(c));
    break a}}else if(4===b.type){if(4===a.type){c=0<va(a.$1,b.$1)?!0:a.$1.equals(b.$1);c=new h(new r(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var e=b.$4;var f=b.$1.$1.$2(c.$6)(b.$7);var g=b.$1.$1.$2(b.$6)(c.$7);0<e.$2(f)(g)?c=!0:(e=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(e)(c));c=new h(new r(c));break a}c=new d(new l("Unexpected error in >="))}return c}}}function Yg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new d(new l("< not defined for complex numbers")):
    new d(new l("Unexpected error in <"));else if(5===b.type)b=5===a.type?new h(new r(!!(0>wa(a.$1,b.$1)))):new d(new l("Unexpected error in <"));else if(4===b.type)b=4===a.type?new h(new r(!!(0>va(a.$1,b.$1)))):new d(new l("Unexpected error in <"));else if(7===b.type&&7===a.type){var c=b.$1,e=a.$1;b=c.$4;var f=c.$1.$1.$2(e.$6)(c.$7);c=c.$1.$1.$2(c.$6)(e.$7);b=!!(0>b.$2(f)(c));b=new h(new r(b))}else b=new d(new l("Unexpected error in <"));return b}}}function bh(a,b){return function(a){return function(b){a:if(6===
    b.type)var c=6===a.type?new d(new l("<= not defined for complex numbers")):new d(new l("Unexpected error in <="));else{if(5===b.type){if(5===a.type){c=0>wa(a.$1,b.$1)?!0:a.$1===b.$1;c=new h(new r(c));break a}}else if(4===b.type){if(4===a.type){c=0>va(a.$1,b.$1)?!0:a.$1.equals(b.$1);c=new h(new r(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var e=b.$4;var f=b.$1.$1.$2(c.$6)(b.$7);var g=b.$1.$1.$2(b.$6)(c.$7);0>e.$2(f)(g)?c=!0:(e=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(e)(c));
    c=new h(new r(c));break a}c=new d(new l("Unexpected error in <="))}return c}}}function Ug(a,b){return function(a){return function(b){a:if(6===b.type)b=6===a.type?new h(new r(!yb(null,qb(),a.$1,b.$1))):new d(new l("Unexpected error in /="));else{if(5===b.type){if(5===a.type){b=new h(new r(0===(a.$1===b.$1?1:0)?!0:!1));break a}}else if(4===b.type){if(4===a.type){b=0===(a.$1.equals(b.$1)?1:0)?!0:!1;b=new h(new r(b));break a}}else if(7===b.type&&7===a.type){b=b.$1;var c=a.$1;var e=b.$1.$1.$2(c.$6)(b.$7);
    c=b.$1.$1.$2(b.$6)(c.$7);b=!b.$2(e)(c);b=new h(new r(b));break a}b=new d(new l("Unexpected error in /="))}return b}}}function Mg(a,b){return function(c){return Zj(a,b,c)}}function Kg(a){return function(b){return ak(a,b)}}function zb(a,b,c,e,d,f,g){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d;this.$6=f;this.$7=g}function ea(a,b){this.type=0;this.$1=a;this.$2=b}function f(a,b){this.type=1;this.$1=a;this.$2=b}function Kd(a,b){this.type=2;this.$1=a;this.$2=b}function v(a,b){this.type=
    1;this.$1=a;this.$2=b}function xa(a,b,c){this.type=1;this.$1=a;this.$2=b;this.$3=c}function Ab(a,b,c,e,d){this.type=2;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d}function bk(a,b){this.type=10;this.$1=a;this.$2=b}function l(a){this.type=6;this.$1=a}function Qc(a){this.type=0;this.$1=a}function Xj(a,b){this.type=1;this.$1=a;this.$2=b}function me(a){this.type=0;this.$1=a}function ba(a){this.type=1;this.$1=a}function ib(a,b){this.type=0;this.$1=a;this.$2=b}function d(a){this.type=0;this.$1=a}function Da(a,
    b){this.type=2;this.$1=a;this.$2=b}function fc(a){this.type=1;this.$1=a}function r(a){this.type=10;this.$1=a}function ja(a){this.type=9;this.$1=a}function R(a){this.type=6;this.$1=a}function Fa(a,b){this.type=3;this.$1=a;this.$2=b}function P(a){this.type=5;this.$1=a}function rb(a,b,c,e,d){this.type=12;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d}function X(a){this.type=4;this.$1=a}function A(a){this.type=2;this.$1=a}function yi(a){this.type=11;this.$1=a}function ka(a){this.type=7;this.$1=a}function Ka(a){this.type=
    8;this.$1=a}function vi(a,b){this.type=0;this.$1=a;this.$2=b}function Ld(a,b){this.type=1;this.$1=a;this.$2=b}function qa(a){this.type=0;this.$1=a}function u(a,b){this.type=1;this.$1=a;this.$2=b}function t(a,b){this.type=0;this.$1=a;this.$2=b}function q(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function cf(a){this.type=5;this.$1=a}function ha(a){this.type=0;this.$1=a}function I(a){this.type=1;this.$1=a}function C(a){this.type=0;this.$1=a}function h(a){this.type=1;this.$1=a}function zc(a,b){this.type=
    1;this.$1=a;this.$2=b}function m(a,b){this.type=1;this.$1=a;this.$2=b}function Rb(a){this.type=4;this.$1=a}function cb(a,b){this.type=0;this.$1=a;this.$2=b}function mb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function yd(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function zd(a,b,c,e,d,f){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d;this.$6=f}function ck(a,b){this.type=0;this.$1=a;this.$2=b}function gb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function bb(a,b,
    c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Ca(a,b){this.type=0;this.$1=a;this.$2=b}function M(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function ya(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function B(a,b){this.type=0;this.$1=a;this.$2=b}function F(a,b,c){return 1===b.type?new f(b.$1,F(null,b.$2,c)):c}function Qa(a,b,c,e,d,f,h,l){a=b.$1.$3(new g.jsbn.BigInteger("0"));if(c(l)(a))return aa;a=e.$2(h);var k=e.$2(l);a:for(;;){var L=b.$1.$3(new g.jsbn.BigInteger("0"));if(c(k)(L))break a;
    else L=b.$3(a)(k),a=k,k=L}h=b.$2(h)(a);l=b.$2(l)(a);return new ba(new zb(b,c,e,d,f,h,l))}function Wd(a){for(;;)if(1===a.type){if(0===a.$2.type)return new h(a.$1);var b=a.$1;if(10===b.type)if(b.$1)a=a.$2;else return new h(new r(!1));else a=a.$2}else return new h(new r(!0))}function Yd(a){return"0"===a?new g.jsbn.BigInteger("0"):"1"===a?new g.jsbn.BigInteger("1"):new g.Lazy(function(){throw Error("*** ParseNumber.idr:74:23:unmatched case in ParseNumber.case block in binConverter at ParseNumber.idr:74:23 ***");
    })}function kd(a,b){return w(null,null,x(null,y(Cf()),x(null,y(Df()),y(Ef()))),Hf(b))}function Jc(a){if(1===a.type){var b=a.$1;return 3===b.type?(b=b.$1,1===b.type?0===a.$2.type?new h(b.$1):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new l("car expected pair, found "+da(a.$1))):new d(new q(new u(1,1),p(null,a),a))):2===b.type?(b=b.$1,1===b.type?0===a.$2.type?new h(b.$1):new d(new q(new u(1,1),p(null,a),a)):0===b.type?0===a.$2.type?new d(new l("Unexpected error in car")):new d(new q(new u(1,
    1),p(null,a),a)):0===a.$2.type?new d(new l("car expected pair, found "+da(a.$1))):new d(new q(new u(1,1),p(null,a),a))):0===a.$2.type?new d(new l("car expected pair, found "+da(a.$1))):new d(new q(new u(1,1),p(null,a),a))}return new d(new q(new u(1,1),p(null,a),a))}function Kc(a){if(1===a.type){var b=a.$1;if(3===b.type){var c=b.$1;return 1===c.type?0===c.$2.type?0===a.$2.type?new h(g.force(b.$2)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new Fa(c.$2,new g.Lazy(function(){return g.force(b.$2)}))):
    new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new l("cdr expected pair, found "+da(a.$1))):new d(new q(new u(1,1),p(null,a),a))}return 2===b.type?(c=b.$1,1===c.type?0===c.$2.type?0===a.$2.type?new h(new A(n)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new A(c.$2)):new d(new q(new u(1,1),p(null,a),a)):0===c.type?0===a.$2.type?new d(new l("cdr on empty list")):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new d(new l("cdr expected pair, found "+da(a.$1))):new d(new q(new u(1,
    1),p(null,a),a))):0===a.$2.type?new d(new l("cdr expected pair, found "+da(a.$1))):new d(new q(new u(1,1),p(null,a),a))}return new d(new q(new u(1,1),p(null,a),a))}function pa(a){return(0<Ac(a,0)||0===a)&&0>Ac(a,1114112)?String.fromCharCode(a):"\x00"}function be(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=b.$1;return 3===c.type?0===b.$2.type?new h(new Fa(new f(a.$1,c.$1),new g.Lazy(function(){return g.force(c.$2)}))):new d(new q(new u(2,2),p(null,a),a)):2===c.type?0===b.$2.type?new h(new A(new f(a.$1,
    c.$1))):new d(new q(new u(2,2),p(null,a),a)):0===b.$2.type?new h(new Fa(new f(a.$1,n),new g.Lazy(function(){return b.$1}))):new d(new q(new u(2,2),p(null,a),a))}}return new d(new q(new u(2,2),p(null,a),a))}function de(a){return"0"===a?new g.jsbn.BigInteger("0"):"1"===a?new g.jsbn.BigInteger("1"):"2"===a?new g.jsbn.BigInteger("2"):"3"===a?new g.jsbn.BigInteger("3"):"4"===a?new g.jsbn.BigInteger("4"):"5"===a?new g.jsbn.BigInteger("5"):"6"===a?new g.jsbn.BigInteger("6"):"7"===a?new g.jsbn.BigInteger("7"):
    "8"===a?new g.jsbn.BigInteger("8"):"9"===a?new g.jsbn.BigInteger("9"):new g.Lazy(function(){throw Error("*** ParseNumber.idr:31:23:unmatched case in ParseNumber.case block in decConverter at ParseNumber.idr:31:23 ***");})}function cd(a,b){return 0===(b.equals(new g.jsbn.BigInteger("0"))?1:0)?a.divide(b):new g.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:341:22-27:unmatched case in Prelude.Interfaces.case block in divBigInt at ./Prelude/Interfaces.idr:341:22-27 ***");})}function ee(a){if(2===
    a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ea(a.$1-b.$1,a.$2-b.$2),new h(new R(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new h(new P(a.$1-c.$1)):new d(new l("Unexpected error in -")):new d(new l("Unexpected error in -"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new X(a.$1.subtract(c.$1))):new d(new l("Unexpected error in -")):
    new d(new l("Unexpected error in -"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?Sb(af(null),a.$1,c.$1,"-"):new d(new l("Unexpected error in -")):new d(new l("Unexpected error in -"))}return new d(new l("Unexpected error in -"))}function nc(a,b,c,e){return Ta(null,w(null,null,c,If(e)))}function Fb(a,b,c){return 1===c.type?(a=c.$1,a=1===a.type?new C(a):b.$1(null)(null)(new l("Type error")),new v(a,Jf(b,c.$2))):new C(oa)}function Bb(a){for(;;)if(1===a.type){var b=
    a.$1;if(1===b.type){var c=a.$2;if(1===c.type){var e=c.$1;return 1===e.type?0===c.$2.type?new h(new r(b.$1==e.$1)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))}return new d(new q(new u(2,2),p(null,a),a))}if(10===b.type)return e=a.$2,1===e.type?(c=e.$1,10===c.type?0===e.$2.type?(b=b.$1,b=new h(new r(c.$1?b:!b))):b=0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):b=0===a.$2.$2.type?
    new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)),b):new d(new q(new u(2,2),p(null,a),a));if(9===b.type)return c=a.$2,1===c.type?(e=c.$1,9===e.type?0===c.$2.type?new h(new r(b.$1===e.$1)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(6===b.type)return c=a.$2,1===c.type?(e=c.$1,6===e.type?0===c.$2.type?new h(new r(yb(null,qb(),b.$1,e.$1))):0===a.$2.$2.type?new h(new r(!1)):
    new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(3===b.type)if(c=a.$2,1===c.type)if(e=c.$1,3===e.type)if(0===c.$2.type)a=new f(new A(F(null,b.$1,new f(g.force(b.$2),n))),new f(new A(F(null,e.$1,new f(g.force(e.$2),n))),n));else return 0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a));else return 0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a));else return new d(new q(new u(2,
    2),p(null,a),a));else{if(5===b.type)return c=a.$2,1===c.type?(e=c.$1,5===e.type?0===c.$2.type?new h(new r(b.$1===e.$1)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(4===b.type)return c=a.$2,1===c.type?(e=c.$1,4===e.type?0===c.$2.type?new h(new r(b.$1.equals(e.$1))):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):
    new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(2===b.type){e=a.$2;if(1===e.type){c=e.$1;if(2===c.type&&0===e.$2.type){if(ua(p(null,b.$1),p(null,c.$1))){a=dk(null,null,b.$1,c.$1);if(0===a.type)return new d(a.$1);b=ua(p(null,b.$1),p(null,c.$1))?a.$1:!1;return new h(new r(b))}return new h(new r(!1))}return 0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))}return new d(new q(new u(2,2),p(null,a),a))}if(7===b.type)return c=a.$2,1===c.type?(e=c.$1,7===
    e.type&&0===c.$2.type?(a=e.$1,c=b.$1,b=a.$1.$1.$2(c.$6)(a.$7),c=a.$1.$1.$2(a.$6)(c.$7),b=a.$2(b)(c),new h(new r(b))):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(8===b.type)return c=a.$2,1===c.type?(e=c.$1,8===e.type?0===c.$2.type?new h(new r(b.$1==e.$1)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):0===a.$2.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));
    b=a.$2;return 1===b.type?0===b.$2.type?new h(new r(!1)):new d(new q(new u(2,2),p(null,a),a)):new d(new q(new u(2,2),p(null,a),a))}}else return new d(new q(new u(2,2),p(null,a),a))}function T(a,b,c,e){if(1===e.type)return c=b.$3.$3(c)(e.$1),new v(c,Kf(b,e.$1));if(10===e.type||9===e.type)return new C(e);if(6===e.type)return 0===(0===e.$1.$2?1:0)?new C(e):new C(new P(e.$1.$1));if(5===e.type||4===e.type)return new C(e);if(2===e.type){a=e.$1;if(1===a.type){e=a.$1;if(1===e.type){e=e.$1;if("case"===e)return a=
    a.$2,1===a.type?new v(T(null,b,c,a.$1),Lf(c,b,a.$2)):b.$1(null)(null)(new l("case: bad syntax in: (case)"));if("cond"===e)return yc(null,c,null,b,a.$2);if("define"===e){e=a.$2;if(1===e.type){var d=e.$1;if(1===d.type){e=e.$2;if(1===e.type){if(0===e.$2.type)return new v(T(null,b,c,e.$1),Mf(b,c,d.$1));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if(3===d.type){var f=d.$1;if(1===f.type){var h=f.$1;if(1===h.type)return b=b.$3.$5(c)(h.$1)(new rb(h.$1,
    Q(null,null,D(),f.$2),new ba(da(g.force(d.$2))),e.$2,c)),new v(b,Ra());e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if(2===d.type){d=d.$1;if(1===d.type){f=d.$1;if(1===f.type)return b=b.$3.$5(c)(f.$1)(new rb(f.$1,Q(null,null,D(),d.$2),aa,e.$2,c)),new v(b,Ra());e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,
    H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("if"===e){e=a.$2;if(1===e.type){d=e.$2;if(1===d.type){f=d.$2;if(1===f.type){if(0===f.$2.type)return new v(T(null,b,c,e.$1),Pf(b,c,f.$1,d.$1));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("lambda"===e){e=a.$2;if(1===
    e.type){d=e.$1;if(1===d.type)return new C(new rb("\u03bb",Q(null,null,D(),n),new ba(da(e.$1)),e.$2,c));if(3===d.type)return new C(new rb("\u03bb",Q(null,null,D(),d.$1),new ba(da(g.force(d.$2))),e.$2,c));if(2===d.type)return b=b.$3.$1(new B(D(),G()))(c),new v(b,Qf(d.$1,e.$2,c));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("let"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new v(Tb(null,b,d.$1),Yf(b,d.$1,c,e.$2));
    e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("let*"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new v(Tb(null,b,d.$1),dg(b,d.$1,c,e.$2));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("letrec"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new v(Tb(null,b,d.$1),ng(b,d.$1,c,e.$2));e=b.$3.$1(new B(D(),G()))(c);return new v(e,
    H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("print"===e){e=a.$2;if(1===e.type){if(0===e.$2.type)return new v(T(null,b,c,e.$1),pg(b));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("quote"===e){e=a.$2;if(1===e.type){if(0===e.$2.type)return new C(e.$1);e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("set!"===
    e){d=a.$2;if(1===d.type){e=d.$1;if(1===e.type){d=d.$2;if(1===d.type){if(0===d.$2.type)return new v(T(null,b,c,d.$1),qg(b,c,e.$1));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}if("set-car!"===e){d=a.$2;if(1===d.type){e=d.$1;if(1===e.type){d=d.$2;if(1===d.type){if(0===d.$2.type)return new v(T(null,b,
    c,d.$1),tg(b,c,e.$1,d.$1));e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}e=b.$3.$1(new B(D(),G()))(c);return new v(e,H(b,c,a.$1,a.$2))}return b.$1(null)(null)(new Kd("Unrecognized special form",e))}return 7===e.type?0===(e.$1.$7.equals(new g.jsbn.BigInteger("1"))?
    1:0)?new C(e):new C(new X(e.$1.$6)):8===e.type?new C(e):0===e.type?new C(e):13===e.type?new C(oa):b.$1(null)(null)(new Kd("Unrecognized special form",e))}function Hb(a,b,c,e){return 1===e.type?new v(T(null,b,c,e.$1),ug(b,c,e.$2)):new C(n)}function za(a,b,c,e){return 1===e.type?0===e.$2.type?T(null,b,c,e.$1):new v(T(null,b,c,e.$1),gc(b,c,e.$2)):new C(oa)}function wd(a,b,c){for(;;)if(1===c.type){if(b(c.$1))return new f(c.$1,wd(null,b,c.$2));c=c.$2}else return c}function Md(a,b,c){return 1===c.type?
    0===c.$2.type?c.$1:b(c.$1)(Md(null,b,c.$2)):new g.Lazy(function(){throw Error("*** ./Prelude/Strings.idr:24:1-16:unmatched case in Prelude.Strings.foldr1 ***");})}function Tb(a,b,c){return 1===c.type?(a=c.$1,2===a.type?(a=a.$1,1===a.type?new v(Tb(null,b,c.$2),wg(a.$1)):b.$1(null)(null)(new l("Unexpected error (getHeads)"))):b.$1(null)(null)(new l("Unexpected error (getHeads)"))):0===c.type?new C(new A(n)):b.$1(null)(null)(new l("Unexpected error (getHeads)"))}function Ib(a,b,c){return 1===c.type?
    (a=c.$1,2===a.type&&(a=a.$1,1===a.type)?(a=a.$2,1===a.type?0===a.$2.type?new v(Ib(null,b,c.$2),yg(a.$1)):b.$1(null)(null)(new l("Unexpected error (getTails)")):b.$1(null)(null)(new l("Unexpected error (getTails)"))):b.$1(null)(null)(new l("Unexpected error (getTails)"))):0===c.type?new C(new A(n)):b.$1(null)(null)(new l("Unexpected error (getTails)"))}function ie(a){var b=null;b=fd(a)?String.fromCharCode((a.charCodeAt(0)|0)-32):a;return"0"===b?new g.jsbn.BigInteger("0"):"1"===b?new g.jsbn.BigInteger("1"):
    "2"===b?new g.jsbn.BigInteger("2"):"3"===b?new g.jsbn.BigInteger("3"):"4"===b?new g.jsbn.BigInteger("4"):"5"===b?new g.jsbn.BigInteger("5"):"6"===b?new g.jsbn.BigInteger("6"):"7"===b?new g.jsbn.BigInteger("7"):"8"===b?new g.jsbn.BigInteger("8"):"9"===b?new g.jsbn.BigInteger("9"):"A"===b?new g.jsbn.BigInteger("10"):"B"===b?new g.jsbn.BigInteger("11"):"C"===b?new g.jsbn.BigInteger("12"):"D"===b?new g.jsbn.BigInteger("13"):"E"===b?new g.jsbn.BigInteger("14"):"F"===b?new g.jsbn.BigInteger("15"):new g.Lazy(function(){throw Error("*** ParseNumber.idr:55:23-33:unmatched case in ParseNumber.case block in hexConverter at ParseNumber.idr:55:23-33 ***");
    })}function $b(a,b,c){for(;;)if(1===c.type){if(b.equals(new g.jsbn.BigInteger("0")))return new ba(c.$1);b=b.subtract(new g.jsbn.BigInteger("1"));c=c.$2}else return aa}function ic(a,b,c,e,k){if(0===k.type)return new Ld(k.$1,new ib(c,e));a=jb(null,null,k.$1,null,c,e,k.$2);0===a.type?a=new d(a.$1):(a=a.$1,b=a.$2,a=new h(new xa(a.$1,b.$1,b.$2)));return new Ld(k.$1,a.$1)}function E(a){return 1===a.type?4===a.$1.type?0===a.$2.type?new h(new r(!0)):new d(new q(new u(1,1),p(null,a),a)):0===a.$2.type?new h(new r(!1)):
    new d(new q(new u(1,1),p(null,a),a)):new d(new q(new u(1,1),p(null,a),a))}function fd(a){return 0<Ja(a,"a")||"a"===a?0>Ja(a,"z")?!0:"z"===a:!1}function ed(a){return 0<Ja(a,"A")||"A"===a?0>Ja(a,"Z")?!0:"Z"===a:!1}function ek(a,b,c){for(;;)if(a=b.$2,1===a.type)b=new f(a.$1,a.$2);else return b.$1}function p(a,b){return 1===b.type?p(null,b.$2).add(new g.jsbn.BigInteger("1")):new g.jsbn.BigInteger("0")}function Bc(a,b){for(;;)if(1===b.type)if(1===a.type)if(Cc(a.$1,b.$1))a=a.$2,b=b.$2;else return!1;else return!1;
    else return 0===b.type?0===a.type:!1}function Ae(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=b.$1;if(2===c.type){if(0===b.$2.type){a:for(a=a.$1,c=c.$1;;)if(1===c.type)if(Cc(c.$1,a)){c=new h(new A(new f(c.$1,c.$2)));break a}else c=c.$2;else{c=new h(new r(!1));break a}return c}return new d(new q(new u(1,1),p(null,a),a))}return 0===b.$2.type?new d(new m("list",b.$1)):new d(new q(new u(1,1),p(null,a),a))}}return new d(new q(new u(1,1),p(null,a),a))}function Ce(a){if(1===a.type){var b=a.$1;if(2===
    b.type){if(0===a.$2.type){a:for(a=n,b=b.$1;;)if(1===b.type)a=new f(b.$1,a),b=b.$2;else break a;return new h(new A(a))}return new d(new q(new u(1,1),p(null,a),a))}return 0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new u(1,1),p(null,a),a))}return 0===a.type?new d(new q(new u(1,1),new g.jsbn.BigInteger("0"),n)):new d(new q(new u(1,1),p(null,a),a))}function Ee(a){for(;;)if(1===a.type){var b=a.$1;if(4===b.type){var c=a.$2;if(1===c.type)return a=c.$1,9===a.type?0===c.$2.type?new h(new Ka(na(null,
    null,Ga(),"",Nd(null,b.$1,a.$1)))):new d(new l("Invalid arguments to `make-string`")):new d(new l("Invalid arguments to `make-string`"));if(0===c.type)a=new f(a.$1,new f(new ja(pa(0)),n));else return new d(new l("Invalid arguments to `make-string`"))}else return new d(new l("Invalid arguments to `make-string`"))}else return new d(new l("Invalid arguments to `make-string`"))}function Ta(a,b){return x(null,ab(null,b),jc())}function ab(a,b){return w(null,null,b,Bg(b))}function Gf(a){return"("===a?y(Cg()):
    "["===a?y(Dg()):"{"===a?y(Eg()):new g.Lazy(function(){throw Error("*** Parse.idr:15:10-13:unmatched case in Parse.case block in matchBracket at Parse.idr:15:10-13 ***");})}function tb(a,b){return 0===(b.equals(new g.jsbn.BigInteger("0"))?1:0)?a.remainder(b):new g.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:345:22-27:unmatched case in Prelude.Interfaces.case block in modBigInt at ./Prelude/Interfaces.idr:345:22-27 ***");})}function $a(a,b,c,e){for(;;)if(1===e.type){c=nb(new f(c,new f(e.$1,
    n)));if(0===c.type)return new d(c.$1);c=c.$1;if(2===c.type){var k=c.$1;if(1===k.type)if(c=k.$2,1===c.type)if(0===c.$2.type){var L=b(k.$1)(c.$1);if(0===L.type)return b(k.$1)(c.$1);k=L.$1;if(10===k.type)if(k=k.$1)if(k)c=c.$1,e=e.$2;else return new d(new l("Unexpected error in "+a));else return new h(new r(!1));else return new d(new l("Unexpected error in "+a))}else return new g.Lazy(function(){return Ub()});else return new g.Lazy(function(){return Ub()});else return new g.Lazy(function(){return Ub()})}else return new g.Lazy(function(){return Ub()})}else return new h(new r(!0))}
    function nb(a){if(1===a.type){var b=a.$1;if(6===b.type){if(b=a.$2,1===b.type){var c=b.$1;if(6===c.type){if(0===b.$2.type)return new h(new A(new f(a.$1,new f(b.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===c.type){if(0===b.$2.type)return new h(new A(new f(a.$1,new f(new R(new ea(c.$1,
    0)),n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===c.type){if(0===b.$2.type)return new h(new A(new f(a.$1,new f(new R(new ea(c.$1.intValue(),0)),n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):
    4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===c.type){if(0===b.$2.type)return b=La(c.$1),1===b.type?new h(new A(new f(a.$1,new f(new R(new ea(b.$1,0)),n)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",
    b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(5===b.type){if(c=a.$2,1===c.type){var e=c.$1;if(6===e.type){if(0===c.$2.type)return new h(new A(new f(new R(new ea(b.$1,0)),new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?
    new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===c.$2.type)return new h(new A(new f(a.$1,new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",
    a.$1))):new d(new l("Unexpected error in numCast"))}if(4===e.type){if(0===c.$2.type)return new h(new A(new f(a.$1,new f(new P(e.$1.intValue()),n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return b=La(e.$1),1===b.type?new h(new A(new f(a.$1,
    new f(new P(b.$1),n)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?
    new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(4===b.type){if(c=a.$2,1===c.type){e=c.$1;if(6===e.type){if(0===c.$2.type)return new h(new A(new f(new R(new ea(b.$1.intValue(),0)),new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===
    c.$2.type)return new h(new A(new f(new P(b.$1.intValue()),new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===e.type){if(0===c.$2.type)return new h(new A(new f(a.$1,new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===
    c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return new h(new A(new f(new ka(new zb(new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),V(),J()),Za()),b.$1,new g.jsbn.BigInteger("1"))),new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",
    b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(7===b.type){if(c=a.$2,1===c.type){e=c.$1;if(6===e.type){if(0===c.$2.type)return a=
    La(b.$1),1===a.type?new h(new A(new f(new R(new ea(a.$1,0)),new f(c.$1,n)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===c.$2.type)return a=La(b.$1),1===a.type?new h(new A(new f(new P(a.$1),new f(c.$1,n)))):new d(new l("Unexpected error in numCast"));
    b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===e.type){if(0===c.$2.type)return new h(new A(new f(a.$1,new f(new ka(new zb(new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),V(),J()),Za()),e.$1,new g.jsbn.BigInteger("1"))),
    n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return new h(new A(new f(a.$1,new f(c.$1,n))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",
    b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(b=a.$2,1===b.type&&0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",
    b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}return new d(new l("Unexpected error in numCast"))}function Je(a){if(ua(p(null,a),new g.jsbn.BigInteger("2"))){a=nb(a);if(0===a.type)return new d(a.$1);a=a.$1;if(2===a.type){var b=a.$1;if(1===b.type&&(a=b.$1,4===a.type&&(b=b.$2,1===b.type))){var c=b.$1;return 4===c.type?0===b.$2.type?new h(new X(cd(a.$1,c.$1))):new d(new l("Unexpected error in <=")):new d(new l("Unexpected error in <="))}}return new d(new l("Unexpected error in <="))}return new d(new q(new u(2,
    2),p(null,a),a))}function Z(a){if(6===a.type){var b=a.$1.$1;return(0===(0===a.$1.$2?1:0)?0:b===Vb(b).intValue())?new h(new X(Vb(b))):new d(new l("Could not convert complex to integer"))}return 5===a.type?0===(a.$1===Vb(a.$1).intValue()?1:0)?new d(new l("Could not convert float to integer")):new h(new X(Vb(a.$1))):4===a.type?new h(a):7===a.type?0===(a.$1.$7.equals(new g.jsbn.BigInteger("1"))?1:0)?new d(new l("Could not convert rational to integer")):new h(new X(a.$1.$6)):new d(new l("Could not convert non-number to integer"))}
    function Oe(a){if(1===a.type&&0===a.$2.type){var b=a.$1;b=6===b.type?new h(new r(!0)):5===b.type?new h(new r(!0)):7===b.type?new h(new r(!0)):E(new f(a.$1,n));if(0===b.type)return new d(b.$1);b=b.$1;return 10===b.type?(b=b.$1)?b?new h(new Ka(da(a.$1))):new d(new l("Unexpected error")):new d(new m("number?",a.$1)):new d(new l("Unexpected error"))}return new d(new q(new u(2,2),p(null,a),a))}function Qe(a){return"0"===a?new g.jsbn.BigInteger("0"):"1"===a?new g.jsbn.BigInteger("1"):"2"===a?new g.jsbn.BigInteger("2"):
    "3"===a?new g.jsbn.BigInteger("3"):"4"===a?new g.jsbn.BigInteger("4"):"5"===a?new g.jsbn.BigInteger("5"):"6"===a?new g.jsbn.BigInteger("6"):"7"===a?new g.jsbn.BigInteger("7"):new g.Lazy(function(){throw Error("*** ParseNumber.idr:44:23:unmatched case in ParseNumber.case block in octConverter at ParseNumber.idr:44:23 ***");})}function N(a){if(""===a)return la(null,"Empty input to 'OneOf'");var b=""===a?g["throw"](Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);return x(null,
    y(dd(a)),N(b))}function Se(a){for(;;)if(1===a.type){if(0===a.$2.type)return new h(a.$1);var b=a.$1;if(10===b.type){if(b.$1)return new h(new r(!0));a=a.$2}else return new h(a.$1)}else return new h(new r(!1))}function Rc(){return Db(Y(ta(),y(O())),ra(ta(),y(O()),new g.jsbn.BigInteger("10")),sa(Y(ta(),y(O()))))}function Db(a,b,c){return w(null,null,vb(null,null,mh(),x(null,c,x(null,b,a))),uh(c,b,a))}function Ba(){return x(null,w(null,null,y(wb()),wi()),x(null,x(null,w(null,null,y(Kh()),Mh()),w(null,
    null,ub("#|"),gd())),x(null,x(null,x(null,Rc(),w(null,null,y(wb()),Oh())),x(null,x(null,sa(Y(ta(),y(O()))),w(null,null,y(wb()),Sh())),x(null,x(null,ra(ta(),y(O()),new g.jsbn.BigInteger("10")),w(null,null,y(wb()),Ch())),x(null,Y(ta(),y(O())),w(null,null,y(wb()),Gh()))))),x(null,w(null,null,ub("#\\"),lh()),x(null,w(null,null,x(null,y(kc()),N("!#$%&|*+-/:<=>?@^_~")),gh()),x(null,w(null,null,y(qc()),fi()),x(null,w(null,null,y(Ph()),Rh()),kd(null,x(null,w(null,null,Aa(null,ia(null,y(ca()))),ti()),x(null,
    w(null,null,Aa(null,ia(null,y(ca()))),Bh()),w(null,null,ld(),Nh())))))))))))}function ra(a,b,c){return x(null,w(null,null,y(hd()),Eh(a,b,c)),x(null,w(null,null,y(id()),Fh(a,b,c)),oc(a,b,c,J())))}function Y(a,b){return x(null,w(null,null,y(hd()),Ih(a,b)),x(null,w(null,null,y(id()),Jh(a,b)),pc(a,b,J())))}function sa(a){return w(null,null,vb(null,null,Th(),a),ai(a))}function ld(){return w(null,null,Aa(null,ia(null,y(ca()))),ci())}function wc(a,b,c,e){if(e.equals(new g.jsbn.BigInteger("0")))return b.$3(new g.jsbn.BigInteger("1"));
    a=e.subtract(new g.jsbn.BigInteger("1"));return b.$2(c)(wc(null,b,c,a))}function fa(a,b,c,e){a=b(e);b=0===c.type?new g.jsbn.BigInteger("0"):new g.jsbn.BigInteger("4");return(0<va(b,new g.jsbn.BigInteger("5"))||(0===c.type?new g.jsbn.BigInteger("0"):new g.jsbn.BigInteger("4")).equals(new g.jsbn.BigInteger("5")))&&(1===W(0===(""==a?1:0)?!0:!1,!0).type?0:"-"===a[0])?"("+(a+")"):a}function Sc(a,b,c){a=(1===W(0===(""==c?1:0)?!0:!1,!0).type?0:a(c[0]))?"\\&":"";return b+(a+c)}function Sb(a,b,c,e){a=a(b)(c);
    return 1===a.type?new h(new ka(a.$1)):new d(new l("Unexpected error in "+e))}function La(a){return 0===(a.$7.equals(new g.jsbn.BigInteger("0"))?1:0)?new ba(a.$6.intValue()/a.$7.intValue()):aa}function ff(a,b,c){return window.lidrisp.read(function(b){return $i(a)(b)(null)},function(a){return b(a)(null)})}function Nd(a,b,c){if(b.equals(new g.jsbn.BigInteger("0")))return n;a=b.subtract(new g.jsbn.BigInteger("1"));return new f(c,Nd(null,a,c))}function Vb(a){var b=0<wa(a,0)?a-Math.floor(a):-(a-Math.ceil(a));
    a=0===((0<wa(a,0)?new g.jsbn.BigInteger("1"):0>wa(a,0)?new g.jsbn.BigInteger("-1"):new g.jsbn.BigInteger("0")).equals(new g.jsbn.BigInteger("1"))?1:0)?0>wa(b,.5)||.5===b?Math.ceil(a):Math.floor(a):0>wa(b,.5)||.5===b?Math.floor(a):Math.ceil(a);return new g.jsbn.BigInteger(Math.trunc(a)+"")}function Bd(a,b,c,e,d,f,h,g){for(;;)if(1===h.type)a=bj(h.$2,g),h=h.$1,g=a;else if(10===h.type)a=cj(g,f,h.$2),f=Cd,h=h.$1,g=a;else return 2===h.type?h.$1(null)(null)(h.$2)(dj(g,f)):g(h.$1)(f)}function y(a){return qf(null,
    w(null,null,Cb(),ej(a)))}function Qi(a){if(2===a.type)return a.$1+(": "+da(a.$2));if(6===a.type)return a.$1;if(0===a.type){var b=a.$1;b=0===b.type?"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: at least "+(fa(null,kb(),S,b.$1)+("\ngiven: "+fa(null,Ha(),S,a.$2))):"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: "+((0===(b.$1===b.$2?1:0)?"between "+(fa(null,kb(),S,b.$1)+(" and "+fa(null,kb(),S,b.$2))):fa(null,
    kb(),S,b.$1))+("\ngiven: "+fa(null,Ha(),S,a.$2)));a=0===a.$3.type?"":"\narguments:\n"+Wb(Q(null,null,D(),a.$3));return b+a}return 5===a.type?(1===W(0===(""==a.$1?1:0)?!0:!1,!0).type?a=n:(b=0===(""==a.$1.slice(1)?1:0)?!0:!1,b=1===W(b,!0).type?Dc:new zc(a.$1.slice(1)[0],a.$1.slice(1).slice(1)),a=new f(a.$1[0],Ec(null,b))),'Parse error at "'+Fc(a,'"')):"Invalid type: expected "+(a.$1+(", found "+da(a.$2)))}function fk(a){if("\u0007"===a)return fj();if("\b"===a)return gj();if("\t"===a)return hj();if("\n"===
    a)return ij();if("\v"===a)return jj();if("\f"===a)return kj();if("\r"===a)return lj();if("\u000e"===a)return Xe(mj(),"\\SO");if("\\"===a)return nj();if("\u007f"===a)return oj();a:{var b=new g.jsbn.BigInteger(""+(a.charCodeAt(0)|0));for(var c=new f("NUL",new f("SOH",new f("STX",new f("ETX",new f("EOT",new f("ENQ",new f("ACK",new f("BEL",new f("BS",new f("HT",new f("LF",new f("VT",new f("FF",new f("CR",new f("SO",new f("SI",new f("DLE",new f("DC1",new f("DC2",new f("DC3",new f("DC4",new f("NAK",new f("SYN",
    new f("ETB",new f("CAN",new f("EM",new f("SUB",new f("ESC",new f("FS",new f("GS",new f("RS",new f("US",n))))))))))))))))))))))))))))))));;)if(1===c.type)if(b.equals(new g.jsbn.BigInteger("0"))){b=new ba(c.$1);break a}else b=b.subtract(new g.jsbn.BigInteger("1")),c=c.$2;else{b=aa;break a}}return 1===b.type?pj(b.$1):0<Ja(a,"\u007f")?qj(a):Ud(a)}function Fc(a,b){return 1===a.type?'"'===a.$1?'\\"'+Fc(a.$2,b):fk(a.$1)(Fc(a.$2,b)):b}function da(a){if(1===a.type)return a.$1;if(10===a.type){var b=a.$1;return b?
    b?"#t":"":"#f"}if(6===a.type){b=new B(rj(),sj());a=a.$1;if(4===S.type)var c=Gc(S.$1,new g.jsbn.BigInteger("6"));else c=0===S.type?new g.jsbn.BigInteger("0"):new g.jsbn.BigInteger("4"),c=va(c,new g.jsbn.BigInteger("4"));0<c||(4===S.type?ua(S.$1,new g.jsbn.BigInteger("6")):(0===S.type?new g.jsbn.BigInteger("0"):new g.jsbn.BigInteger("4")).equals(new g.jsbn.BigInteger("4")))?(c=b.$2(new Rb(new g.jsbn.BigInteger("6")))(a.$1),b=b.$2(new Rb(new g.jsbn.BigInteger("6")))(a.$2),b="("+(c+(" :+ "+b)+")")):(c=
    b.$2(new Rb(new g.jsbn.BigInteger("6")))(a.$1),b=b.$2(new Rb(new g.jsbn.BigInteger("6")))(a.$2),b=c+(" :+ "+b));return b}return 3===a.type?"("+(Wb(Q(null,null,D(),a.$1))+(" . "+(da(g.force(a.$2))+")"))):5===a.type?fa(null,Zb(),S,a.$1):12===a.type?"#<procedure:"+(a.$1+">"):4===a.type?fa(null,Ha(),S,a.$1):2===a.type?"("+(Wb(Q(null,null,D(),a.$1))+")"):7===a.type?(b=a.$1,fa(null,Ha(),S,b.$6)+("/"+fa(null,Ha(),S,b.$7))):8===a.type?'"'+(a.$1+'"'):0===a.type?"#("+(Wb(Q(null,null,D(),a.$2))+")"):""}function Aa(a,
    b){return w(null,null,Ta(null,b),Nb())}function ia(a,b){return w(null,null,ab(null,b),Nb())}function hf(a){for(;;)if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type)if(a=c.$1,8===a.type)a=new f(new Ka(b.$1+a.$1),c.$2);else return new d(new l("Invalid arguments to `string-append`"));else return 0===c.type?new h(a.$1):new d(new l("Invalid arguments to `string-append`"))}else return new d(new l("Invalid arguments to `string-append`"))}else return 0===a.type?new h(new Ka("")):new d(new l("Invalid arguments to `string-append`"))}
    function ub(a){return""===a?tj():w(null,null,y(dd(a)),uj(a))}function lf(a){if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type){var e=c.$1;if(4===e.type){if(0===c.$2.type){a=e.$1;if(1===W(0===(""==b.$1?1:0)?!0:!1,!0).type)a=aa;else if(a.equals(new g.jsbn.BigInteger("0")))a=new ba(b.$1[0]);else if(a=a.subtract(new g.jsbn.BigInteger("1")),c=0===(""==b.$1.slice(1)?1:0)?!0:!1,1===W(c,!0).type)a=aa;else if(a.equals(new g.jsbn.BigInteger("0")))a=new ba(b.$1.slice(1)[0]);else a:for(a=a.subtract(new g.jsbn.BigInteger("1")),
    c=0===(""==b.$1.slice(1).slice(1)?1:0)?!0:!1,1===W(c,!0).type?b=n:(c=0===(""==b.$1.slice(1).slice(1).slice(1)?1:0)?!0:!1,c=1===W(c,!0).type?Dc:new zc(b.$1.slice(1).slice(1).slice(1)[0],b.$1.slice(1).slice(1).slice(1).slice(1)),b=new f(b.$1.slice(1).slice(1)[0],Ec(null,c)));;)if(1===b.type)if(a.equals(new g.jsbn.BigInteger("0"))){a=new ba(b.$1);break a}else a=a.subtract(new g.jsbn.BigInteger("1")),b=b.$2;else{a=aa;break a}return 1===a.type?new h(new ja(a.$1)):new d(new l("string-ref: index is out of range"))}b=
    a.$2;if(4===b.$1.type){if(0===b.$2.type)return new d(new m("string",a.$1));b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,2),p(null,a),a))}b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,2),p(null,a),a))}b=a.$2;if(4===b.$1.type){if(0===b.$2.type)return new d(new m("string",a.$1));b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,2),p(null,a),a))}b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,
    2),p(null,a),a))}return new d(new q(new u(2,2),p(null,a),a))}b=a.$2;if(1===b.type)return 4===b.$1.type&&0===b.$2.type?new d(new m("string",a.$1)):8===a.$1.type?(b=a.$2,0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,2),p(null,a),a))):new d(new q(new u(2,2),p(null,a),a));if(8===a.$1.type)return b=a.$2,1===b.type?0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new u(2,2),p(null,a),a)):new d(new q(new u(2,2),p(null,a),a))}return new d(new q(new u(2,2),p(null,a),a))}function of(a){if(1===
    a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type&&(a=c.$1,4===a.type)){var e=c.$2;if(1===e.type&&(c=e.$1,4===c.type&&0===e.$2.type)){e=a.$1;var k=null;k=0<Gc(e,new g.jsbn.BigInteger("0"))?!0:ua(e,new g.jsbn.BigInteger("0"));var f=null;return(f=k?0>Gc(c.$1,new g.jsbn.BigInteger(""+b.$1.length))?!0:ua(c.$1,new g.jsbn.BigInteger(""+b.$1.length)):!1)?new h(new Ka(g.prim_strSubstr(e.intValue()|0,c.$1.subtract(a.$1).intValue()|0,b.$1))):new d(new l("substring: ending index is out of range"))}}}}return new g.Lazy(function(){throw Error("*** Strings.idr:53:1-59:73:unmatched case in Strings.substring ***");
    })}function Od(a,b,c){return 0===c.type?n:xc(null,null,null,null,null,vj(),c.$2)}function jb(a,b,c,e,k,f,g){if(1===g.type){if(c.$3(k)(g.$2)){k=jb(null,null,c,null,k,f,g.$1);if(0===k.type)return new d(new xa(k.$1,g.$2,g.$3));k=k.$1;f=k.$2;return new d(new Ab(k.$1,f.$1,f.$2,g.$2,g.$3))}k=jb(null,null,c,null,k,f,g.$3);if(0===k.type)return new d(new xa(g.$1,g.$2,k.$1));k=k.$1;f=k.$2;return new d(new Ab(g.$1,g.$2,k.$1,f.$1,f.$2))}if(2===g.type){if(c.$3(k)(g.$2)){k=jb(null,null,c,null,k,f,g.$1);if(0===
    k.type)return new d(new Ab(k.$1,g.$2,g.$3,g.$4,g.$5));k=k.$1;f=k.$2;return new h(new t(new xa(k.$1,f.$1,f.$2),new t(g.$2,new xa(g.$3,g.$4,g.$5))))}if(c.$3(k)(g.$4)){k=jb(null,null,c,null,k,f,g.$3);if(0===k.type)return new d(new Ab(g.$1,g.$2,k.$1,g.$4,g.$5));k=k.$1;f=k.$2;return new h(new t(new xa(g.$1,g.$2,k.$1),new t(f.$1,new xa(f.$2,g.$4,g.$5))))}k=jb(null,null,c,null,k,f,g.$5);if(0===k.type)return new d(new Ab(g.$1,g.$2,g.$3,g.$4,k.$1));k=k.$1;f=k.$2;return new h(new t(new xa(g.$1,g.$2,g.$3),new t(g.$4,
    new xa(k.$1,f.$1,f.$2))))}a=c.$2(k)(g.$1);return 0===a?new d(new ib(k,f)):0<a?new h(new t(new ib(g.$1,g.$2),new t(g.$1,new ib(k,f)))):new h(new t(new ib(k,f),new t(k,new ib(g.$1,g.$2))))}function hb(a,b,c,e,d,f){for(;;)if(1===f.type)f=c.$3(d)(f.$2)?f.$1:f.$3;else if(2===f.type)f=c.$3(d)(f.$2)?f.$1:c.$3(d)(f.$4)?f.$3:f.$5;else return c.$1(d)(f.$1)?new ba(f.$2):aa}function rf(a,b,c){if(ua(p(null,c),new g.jsbn.BigInteger("1"))){if(1===c.type){var e=c.$1;if(6===e.type)return 0===c.$2.type?(a=e.$1.$1,
    e=e.$1.$2,new h(new R(b(a)(e)))):new d(new l("Numerical input expected"));if(5===e.type)return 0===c.$2.type?new h(new P(a(e.$1))):new d(new l("Numerical input expected"));if(4===e.type)return 0===c.$2.type?new h(new P(a(e.$1.intValue()))):new d(new l("Numerical input expected"));if(7===e.type&&0===c.$2.type)return b=La(e.$1),1===b.type?new h(new P(a(b.$1))):new d(new l("Unexpected error"))}return new d(new l("Numerical input expected"))}return new d(new q(new u(1,1),p(null,c),c))}function xd(a){return 1===
    a.type?F(null,a.$1,new f("\n",xd(a.$2))):a}function uc(a){return 1===W(0===(""==a?1:0)?!0:!1,!0).type?n:new f(a[0],uc(a.slice(1)))}function Wb(a){a=0===Q(null,null,vc(),a).type?Q(null,null,vc(),a):Md(null,wj(),Q(null,null,vc(),a));return na(null,null,Ga(),"",a)}function uf(a){if(1===a.type){var b=a.$1;if(0===b.type){var c=a.$2;if(1===c.type){var e=c.$1;if(4===e.type&&0===c.$2.type){a=$b(null,e.$1,b.$2);if(1===a.type)return new h(a.$1);e=e.$1;b=b.$2;b=new l("vector-ref: index is out of range; index: "+
    (fa(null,Ha(),S,e)+("; valid range: "+fa(null,Ha(),S,p(null,b)))));return new d(b)}return new d(new q(new u(2,2),p(null,a),a))}return 0===c.type?new d(new m("Vector",a.$1)):new d(new q(new u(2,2),p(null,a),a))}return 0===a.$2.type?new d(new m("Vector",a.$1)):new d(new q(new u(2,2),p(null,a),a))}return new d(new q(new u(2,2),p(null,a),a))}function Gb(a,b,c,e,d,g){return 1===g.type?1===d.type?new f(e(d.$1)(g.$1),Gb(null,null,null,e,d.$2,g.$2)):d:1===d.type?n:d}function Af(a){return 1===a.type?new C(ek(null,
    new f(a.$1,a.$2),null)):new g.Lazy(function(){throw Error("*** Eval.idr:90:28-45:unmatched case in Eval.case block in apply' at Eval.idr:90:28-45 ***");})}function Xb(){throw Error("*** Eval.idr:59:1-33:unmatched case in Eval.extractVar ***");}function Sf(a,b){var c=null;c=1===a.type?a.$1:new g.Lazy(function(){return Xb()});return new t(c,b)}function Wf(a,b,c,e,d){return 2===d.type?new v(Hb(null,a,b,d.$1),Uf(a,b,c,e)):new g.Lazy(function(){throw Error("*** Eval.idr:271:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:269:31-44 at Eval.idr:271:30-43 ***");
    })}function Zf(a,b,c,e,d){return 2===d.type?new v(Fb(null,a,d.$1),Xf(a,b,c,d.$1,e)):new g.Lazy(function(){throw Error("*** Eval.idr:269:31-44:unmatched case in Eval.case block in eval at Eval.idr:269:31-44 ***");})}function bg(a,b,c,e,d){if(2===d.type){var k=null;k=a.$3.$6(b)(n);return new v(k,$f(a,c,d.$1,e))}return new g.Lazy(function(){throw Error("*** Eval.idr:278:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:276:31-44 at Eval.idr:278:30-43 ***");})}function eg(a,b,
    c,e,d){return 2===d.type?new v(Fb(null,a,d.$1),cg(a,b,c,d.$1,e)):new g.Lazy(function(){throw Error("*** Eval.idr:276:31-44:unmatched case in Eval.case block in eval at Eval.idr:276:31-44 ***");})}function gg(a,b){var c=null;c=1===a.type?a.$1:new g.Lazy(function(){return Xb()});return new t(c,b)}function lg(a,b,c,e,d){if(2===d.type){var k=null;k=a.$3.$6(b)(n);return new v(k,jg(a,c,d.$1,e))}return new g.Lazy(function(){throw Error("*** Eval.idr:293:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:291:31-44 at Eval.idr:293:30-43 ***");
    })}function og(a,b,c,e,d){return 2===d.type?new v(Fb(null,a,d.$1),mg(a,b,c,d.$1,e)):new g.Lazy(function(){throw Error("*** Eval.idr:291:31-44:unmatched case in Eval.case block in eval at Eval.idr:291:31-44 ***");})}function xg(a,b){return 2===b.type?new C(new A(new f(a,b.$1))):new g.Lazy(function(){throw Error("*** Eval.idr:37:22-32:unmatched case in Eval.case block in getHeads at Eval.idr:37:22-32 ***");})}function zg(a,b){return 2===b.type?new C(new A(new f(a,b.$1))):new g.Lazy(function(){throw Error("*** Eval.idr:44:22-32:unmatched case in Eval.case block in getTails at Eval.idr:44:22-32 ***");
    })}function Ub(){throw Error("*** Numbers.idr:231:24-37:unmatched case in Numbers.case block in numBoolBinop at Numbers.idr:231:24-37 ***");}function jh(a,b){var c=null;ua(new g.jsbn.BigInteger(""+a.length),new g.jsbn.BigInteger("1"))?(c=null,c=""===a?g["throw"](Error("Prelude.Strings: attempt to take the head of an empty string")):a[0],c=new ja(c)):c="altmode"===a?new ja(pa(27)):"backnext"===a?new ja(pa(31)):"backspace"===a?new ja(pa(8)):"call"===a?new ja(pa(26)):"linefeed"===a?new ja(pa(10)):"newline"===
    a?new ja("\n"):"page"===a?new ja(pa(12)):"return"===a?new ja(pa(13)):"rubout"===a?new ja(pa(127)):"space"===a?new ja(" "):"tab"===a?new ja(pa(9)):new g.Lazy(function(){throw Error("*** Parse.idr:74:14:unmatched case in Parse.case block in parseCharacter at Parse.idr:74:14 ***");});return new I(new f(new t(c,b),n))}function Pd(){throw Error("*** ParseNumber.idr:257:9-39:unmatched case in ParseNumber.parseComplexHelper, toDouble ***");}function nh(a){return 5===a.type?new ba(a.$1):4===a.type?new ba(a.$1.intValue()):
    7===a.type?La(a.$1):new g.Lazy(function(){return Pd()})}function ph(a){return 5===a.type?new ba(a.$1):4===a.type?new ba(a.$1.intValue()):7===a.type?La(a.$1):new g.Lazy(function(){return Pd()})}function wh(a,b,c,e){return 3===a.type?new I(new f(new t(new Fa(F(null,b,a.$1),new g.Lazy(function(){return g.force(a.$2)})),e),n)):2===a.type?new I(new f(new t(new A(F(null,b,a.$1)),e),n)):new I(new f(new t(new Fa(b,new g.Lazy(function(){return a})),e),n))}function Qd(){throw Error("*** ParseNumber.idr:213:9-33:unmatched case in ParseNumber.parseRationalHelper, toInt ***");
    }function Uh(a){return 4===a.type?a.$1:new g.Lazy(function(){return Qd()})}function Xh(a){return 4===a.type?a.$1:new g.Lazy(function(){return Qd()})}function W(a,b){return b?a?Rd:Sd:a?Sd:Rd}function yb(a,b,c,e){a=c.$1;var d=e.$1;return b(a)(d)?(c=c.$2,e=e.$2,b(c)(e)):!1}function Cc(a,b){if(1===b.type)return 1===a.type?a.$1==b.$1:!1;if(10===b.type){if(10===a.type){var c=a.$1;c=b.$1?c:!c}else c=!1;return c}if(9===b.type)return 9===a.type?a.$1===b.$1:!1;if(6===b.type)return 6===a.type?yb(null,qb(),a.$1,
    b.$1):!1;if(3===b.type)return 3===a.type?Cc(g.force(a.$2),g.force(b.$2))?!1:Bc(a.$1,b.$1):!1;if(5===b.type)return 5===a.type?a.$1===b.$1:!1;if(4===b.type)return 4===a.type?a.$1.equals(b.$1):!1;if(2===b.type)return 2===a.type?Bc(a.$1,b.$1):!1;if(7===b.type){if(7===a.type){c=b.$1;var e=a.$1;var d=c.$1.$1.$2(e.$6)(c.$7);e=c.$1.$1.$2(c.$6)(e.$7);return c.$2(d)(e)}return!1}return 8===b.type?8===a.type?a.$1==b.$1:!1:0===b.type?0===a.type?0===(a.$1===b.$1?1:0)?Bc(a.$2,b.$2):!1:!1:13===b.type?13===a.type:
    !1}function ua(a,b){for(;;){if(b.equals(new g.jsbn.BigInteger("0")))return a.equals(new g.jsbn.BigInteger("0"))?!0:!1;var c=b.subtract(new g.jsbn.BigInteger("1"));if(a.equals(new g.jsbn.BigInteger("0")))return!1;a=a.subtract(new g.jsbn.BigInteger("1"));b=c}}function Oc(a,b,c,e,d){for(;;)if(1===d.type)e=a=c(e)(d.$1),d=d.$2;else return e}function na(a,b,c,e,d){return 1===d.type?c(d.$1)(na(null,null,c,e,d.$2)):e}function Q(a,b,c,e){return 1===e.type?new f(c(e.$1),Q(null,null,c,e.$2)):e}function Ja(a,
    b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function wa(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function Ac(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function va(a,b){return 0===(a.equals(b)?1:0)?0===(0>a.compareTo(b)?1:0)?1:-1:0}function Gc(a,b){for(;;){if(b.equals(new g.jsbn.BigInteger("0"))){if(a.equals(new g.jsbn.BigInteger("0")))return 0;a.subtract(new g.jsbn.BigInteger("1"));return 1}var c=b.subtract(new g.jsbn.BigInteger("1"));if(a.equals(new g.jsbn.BigInteger("0")))return-1;
    a=a.subtract(new g.jsbn.BigInteger("1"));b=c}}function sb(a,b){return 0===(a==b?1:0)?0===(a<b?1:0)?1:-1:0}function bc(a,b,c,e,d,f){return 1===f.type?(a=e.$2(null)(Fd()),a=e.$3(null)(null)(a)(d(f.$1)),e.$3(null)(null)(a)(bc(null,null,null,e,d,f.$2))):e.$2(null)(n)}function Jj(a,b){var c=null;c='"'===a?a:"\\"===a?a:"n"===a?"\n":"r"===a?"\r":"t"===a?"\t":new g.Lazy(function(){throw Error("*** Parse.idr:42:28:unmatched case in Parse.case block in Parse.parseString, escapedChar at Parse.idr:42:28 ***");
    });return new I(new f(new t(c,b),n))}function Uj(a,b,c,e,d,f){var k=null;k=a.$3;var h=null;h=1===c.type?c.$1:new g.Lazy(function(){return Xb()});k=k.$5(b)(h)(f);return new v(k,Sj(a,b,e,d))}function Jb(a,b,c,e,d){for(;;)if(1===d.type)e=c=e.add(wc(null,new M(U(),V(),J()),b,p(null,d.$2)).multiply(a(d.$1))),d=d.$2;else return e}function Yj(a){if(2===a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ea(a.$1+b.$1,
    a.$2+b.$2),new h(new R(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new h(new P(a.$1+c.$1)):new d(new l("Unexpected error in +")):new d(new l("Unexpected error in +"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new X(a.$1.add(c.$1))):new d(new l("Unexpected error in +")):new d(new l("Unexpected error in +"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?Sb(Ye(null),a.$1,c.$1,"+"):new d(new l("Unexpected error in +")):
    new d(new l("Unexpected error in +"))}return new d(new l("Unexpected error in +"))}function He(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=c.$1,6===b.type&&0===c.$2.type)){a=new R(a.$1);a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=Z(new R(b.$1));if(0===c.type)return Z(new R(b.$1));b=c.$1;return 4===b.type?new h(new R(new ea(a.$1.subtract((new g.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)).intValue(),
    0))):new g.Lazy(function(){throw Error("*** Numbers.idr:174:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 at Numbers.idr:174:25-34 ***");})}return new g.Lazy(function(){throw Error("*** Numbers.idr:173:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new P(a.$1);a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;
    if(4===a.type){c=Z(new P(b.$1));if(0===c.type)return Z(new P(b.$1));b=c.$1;return 4===b.type?new h(new P(a.$1.subtract((new g.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)).intValue())):new g.Lazy(function(){throw Error("*** Numbers.idr:170:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 at Numbers.idr:170:25-34 ***");})}return new g.Lazy(function(){throw Error("*** Numbers.idr:169:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 ***");
    })}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new X(a.$1.subtract((new g.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/c.$1.intValue()))+"")).multiply(c.$1)))):new d(new l("Unexpected error in modulo")):new d(new l("Unexpected error in modulo"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new ka(a.$1);a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=Z(new ka(b.$1));if(0===c.type)return Z(new ka(b.$1));
    b=c.$1;return 4===b.type?new h(new ka(new zb(new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),V(),J()),Za()),a.$1.subtract((new g.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)),new g.jsbn.BigInteger("1")))):new g.Lazy(function(){throw Error("*** Numbers.idr:166:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 at Numbers.idr:166:25-34 ***");
    })}return new g.Lazy(function(){throw Error("*** Numbers.idr:165:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 ***");})}return new d(new l("Unexpected error in modulo"))}function Le(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=c.$1,6===b.type&&0===c.$2.type)){a=new R(a.$1);a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=Z(new R(b.$1));if(0===c.type)return Z(new R(b.$1));b=c.$1;return 4===b.type?
    new h(new R(new ea(tb(a.$1,b.$1).intValue(),0))):new g.Lazy(function(){throw Error("*** Numbers.idr:199:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 at Numbers.idr:199:31-40 ***");})}return new g.Lazy(function(){throw Error("*** Numbers.idr:198:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new P(a.$1);
    a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=Z(new P(b.$1));if(0===c.type)return Z(new P(b.$1));b=c.$1;return 4===b.type?new h(new P(tb(a.$1,b.$1).intValue())):new g.Lazy(function(){throw Error("*** Numbers.idr:194:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 at Numbers.idr:194:31-40 ***");})}return new g.Lazy(function(){throw Error("*** Numbers.idr:193:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 ***");
    })}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new X(tb(a.$1,c.$1))):new d(new l("Unexpected error in remainder")):new d(new l("Unexpected error in remainder"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new ka(a.$1);a=Z(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=Z(new ka(b.$1));if(0===c.type)return Z(new ka(b.$1));b=c.$1;return 4===b.type?new h(new ka(new zb(new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),
    V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),V(),J()),Za()),tb(a.$1,b.$1),new g.jsbn.BigInteger("1")))):new g.Lazy(function(){throw Error("*** Numbers.idr:189:25-34:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 at Numbers.idr:189:25-34 ***");})}return new g.Lazy(function(){throw Error("*** Numbers.idr:188:25-34:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 ***");})}return new d(new l("Unexpected error in remainder"))}
    function oc(a,b,c,e){return w(null,null,ab(null,b),Gj(b,e,c,a))}function pc(a,b,c){return vb(null,null,Hj(c,a),ab(null,b))}function Lb(a,b,c,e,d,f){if(0>Ac(f,0)||0===f)return d.$2(null)(n);a=d.$1(null)(null)(Fd())(e);return d.$3(null)(null)(a)(Lb(null,null,null,e,d,f-1))}function Jd(a,b,c,e,d,f,g){if(1===f.type)return a=d.$2(null)(f.$1)(g),a=Hc(null,null,null,e,d,null,Od(null,null,a),g),e=Jd(null,null,null,e,d,f.$2,g),"Frame<"+(a+(","+(e+">")));f=d.$2(null)(f.$1)(g);return"Global<"+(Hc(null,null,
    null,e,d,null,Od(null,null,f),g)+">")}function mc(a,b,c,e){return x(null,w(null,null,c,Nb()),w(null,null,e,Kj(c,e)))}function xc(a,b,c,e,d,f,g){for(;;)if(1===g.type)f=Hd(f,g.$3),g=g.$1;else if(2===g.type)f=Lj(f,g.$5,g.$3),g=g.$1;else return f(new t(g.$1,g.$2))}function ob(a,b,c,e,g){for(;;)if(1===e.type){a=nb(new f(g,new f(e.$1,n)));if(0===a.type)return new d(a.$1);a=b(a.$1);if(0===a.type)return new d(a.$1);e=e.$2;g=a.$1}else return new h(g)}function Ed(a,b,c,e,d,g){return 1===g.type?(a=g.$1,new f(new t(d(a.$1),
    a.$2),Ed(null,null,null,null,d,g.$2))):g}function Td(a,b,c,e,d){for(;;)if(1===d.type){if(0===d.$2.type)return c=c.$1(d.$1),e+c;a=c.$1(d.$1);e+=a+", ";d=d.$2}else return e}function Hc(a,b,c,e,d,f,g,h){return 1===g.type?(a=g.$1,b=d.$2(null)(a.$2)(h),d=Hc(null,null,null,e,d,null,g.$2,h),e=e.$1(b),a.$1+(": "+e)+(","+d)):""}function ec(a,b,c){for(a={};;a={$jscomp$loop$prop$$cg$3$1:a.$jscomp$loop$prop$$cg$3$1})if(1===c.type){a.$jscomp$loop$prop$$cg$3$1=c.$1;if(3===a.$jscomp$loop$prop$$cg$3$1.type)return 0===
    c.$2.type?new h(new Fa(F(null,b,a.$jscomp$loop$prop$$cg$3$1.$1),new g.Lazy(function(a){return function(){return g.force(a.$jscomp$loop$prop$$cg$3$1.$2)}}(a)))):new d(new m("list",c.$1));if(0===c.$2.type)return 0===b.type?new h(c.$1):new h(new Fa(b,new g.Lazy(function(){return c.$1})));var e=c.$1;if(2===e.type)b=F(null,b,e.$1),c=c.$2;else return new d(new m("list",c.$1))}else return 0===c.type?new h(new A(b)):new d(new l("Unknown error in append"))}function Zj(a,b,c){if(2===c.type&&(a=c.$1,1===a.type))if(b=
    a.$1,6===b.type){if(a=a.$2,1===a.type){var e=a.$1;if(6===e.type&&0===a.$2.type){if(yb(null,qb(),e.$1,new ea(0,0)))return new d(new l("Zero division error"));c=new Ca(new M(Ob(),Pb(),Qb()),Id());a=new ck(new M(Ob(),Pb(),Qb()),Mj());var f=b.$1;b=e.$1;e=a.$1;var g=a.$1.$2(f.$1)(b.$1);var m=a.$1.$2(f.$2)(b.$2);e=e.$1(g)(m);g=a.$1;m=a.$1.$2(b.$1)(b.$1);var p=a.$1.$2(b.$2)(b.$2);g=g.$1(m)(p);e=a.$2(e)(g);g=a.$1.$2(f.$2)(b.$1);f=a.$1.$2(f.$1)(b.$2);c=c.$2(g)(f);f=a.$1;g=a.$1.$2(b.$1)(b.$1);b=a.$1.$2(b.$2)(b.$2);
    b=f.$1(g)(b);a=a.$2(c)(b);a=new ea(e,a);return new h(new R(a))}}}else if(5===b.type){if(a=a.$2,1===a.type)return c=a.$1,5===c.type?0===a.$2.type?0===(0===c.$1?1:0)?new h(new P(b.$1/c.$1)):new d(new l("Zero division error")):new d(new l("Unexpected error in /")):new d(new l("Unexpected error in /"))}else if(4===b.type){if(a=a.$2,1===a.type&&(c=a.$1,4===c.type&&0===a.$2.type))return a=Qa(null,new bb(new M(U(),V(),J()),Ua(),Va()),ma(),new cb(new M(U(),V(),J()),Wa()),new ya(ma(),Xa(),Ya()),new Ca(new M(U(),
    V(),J()),Za()),b.$1,c.$1),1===a.type?new h(new ka(a.$1)):new d(new l("Zero division error"))}else if(7===b.type&&(a=a.$2,1===a.type))return c=a.$1,7===c.type?0===a.$2.type?Sb(Ze(null),b.$1,c.$1,"/"):new d(new l("Unexpected error in /")):new d(new l("Unexpected error in /"));return new d(new l("Unexpected error in /"))}function ak(a,b){if(2===b.type){var c=b.$1;if(1===c.type){var e=c.$1;if(6===e.type){if(c=c.$2,1===c.type){var f=c.$1;if(6===f.type&&0===c.$2.type){c=new Ca(new M(Ob(),Pb(),Qb()),Id());
    e=e.$1;f=f.$1;var g=c.$1.$2(e.$1)(f.$1);var m=c.$1.$2(e.$2)(f.$2);g=c.$2(g)(m);m=c.$1;var p=c.$1.$2(e.$2)(f.$1);e=c.$1.$2(e.$1)(f.$2);e=m.$1(p)(e);e=new ea(g,e);return new h(new R(e))}}}else if(5===e.type){if(c=c.$2,1===c.type)return f=c.$1,5===f.type?0===c.$2.type?new h(new P(e.$1*f.$1)):new d(new l("Unexpected error in *")):new d(new l("Unexpected error in *"))}else if(4===e.type){if(c=c.$2,1===c.type)return f=c.$1,4===f.type?0===c.$2.type?new h(new X(e.$1.multiply(f.$1))):new d(new l("Unexpected error in *")):
    new d(new l("Unexpected error in *"))}else if(7===e.type&&(c=c.$2,1===c.type))return f=c.$1,7===f.type?0===c.$2.type?Sb($e(null),e.$1,f.$1,"*"):new d(new l("Unexpected error in *")):new d(new l("Unexpected error in *"))}}return new d(new l("Unexpected error in *"))}function dk(a,b,c,e){for(;;){if(0===e.type)return 0===c.type?new h(!0):new h(!1);if(0===c.type)return new h(!1);a=Bb(new f(c.$1,new f(e.$1,n)));if(0===a.type)return new d(a.$1);a=a.$1;if(10===a.type)if(a=a.$1)if(a)c=c.$2,e=e.$2;else return new h(!1);
    else return new h(!1);else return new h(!1)}}function yc(a,b,c,e,d){return 1===d.type?(a=d.$1,2===a.type&&(a=a.$1,1===a.type)?(c=a.$1,1===c.type?"else"===c.$1?0===d.$2.type?za(null,e,b,a.$2):e.$1(null)(null)(new l("cond: bad syntax (`else` clause must be last)")):new v(T(null,e,b,a.$1),Nj(b,e,d.$2,a.$2)):new v(T(null,e,b,a.$1),Oj(b,e,d.$2,a.$2))):e.$1(null)(null)(new l("["+(Td(null,null,new B(D(),G()),"",d)+"]")))):0===d.type?new C(oa):e.$1(null)(null)(new l("["+(Td(null,null,new B(D(),G()),"",d)+
    "]")))}function Vc(a,b,c,e,d,g,h){return 1===h.type?(a=h.$1,2===a.type?(a=a.$1,1===a.type?new v(new bk(xb(null,null,null,null,d,new f(g,new f(a.$1,n))),gk),Pj(b,d,g,h.$2,a.$2)):0===a.type?0===h.$2.type?new C(oa):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"))):d.$1(null)(null)(new l("case: bad syntax"))):0===h.type?new C(oa):d.$1(null)(null)(new l("case: bad syntax"))}function xb(a,b,c,e,d,g){if(1===g.type&&(b=g.$2,1===b.type)){a=b.$1;if(1===a.type)return"else"===
    a.$1?0===b.$2.type?new C(!0):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"));if(2===a.type)return a=a.$1,1===a.type?(c=a.$1,1===c.type?"else"===c.$1?0===b.$2.type?d.$1(null)(null)(new l("case: bad syntax (`else` clause must be last)")):d.$1(null)(null)(new l("case: bad syntax")):0===b.$2.type?(b=Bb(new f(a.$1,new f(g.$1,n))),b=0===b.type?d.$1(null)(null)(b.$1):new C(b.$1),new v(b,Qj(d,g.$1,a.$2))):d.$1(null)(null)(new l("case: bad syntax")):0===b.$2.type?(b=
    Bb(new f(a.$1,new f(g.$1,n))),b=0===b.type?d.$1(null)(null)(b.$1):new C(b.$1),new v(b,Rj(d,g.$1,a.$2))):d.$1(null)(null)(new l("case: bad syntax"))):0===a.type?0===b.$2.type?new C(!1):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"))}return d.$1(null)(null)(new l("case: bad syntax"))}function sg(a,b,c,d,h,l,p,n){if(1===p.type){var e=p.$1;if(3===e.type)return a=e.$1,1===a.type?h.$3.$4(l)(c)(new Fa(new f(n,a.$2),new g.Lazy(function(){return g.force(e.$2)}))):h.$1(null)(null)(new m("list",
    d));if(2===e.type)return a=e.$1,1===a.type?h.$3.$4(l)(c)(new A(new f(n,a.$2))):h.$1(null)(null)(new m("list",d))}return h.$1(null)(null)(new m("list",d))}function Xc(a,b,c,d,f,g,h,m){return 1===m.type?1===h.type?new v(T(null,f,g,m.$1),Tj(f,g,h.$1,h.$2,m.$2)):f.$1(null)(null)(new l("let*: bad syntax")):0===m.type?0===h.type?new C(Sa):f.$1(null)(null)(new l("let*: bad syntax")):f.$1(null)(null)(new l("let*: bad syntax"))}function Zc(a,b,c,d,f,h,m){return 1===m.type?(a=null,a=f.$3,b=m.$1,c=null,c=1===
    b.type?b.$1:new g.Lazy(function(){return Xb()}),a=a.$5(h)(c)(oa),new v(a,Vj(f,h,m.$2))):0===m.type?new C(Sa):f.$1(null)(null)(new l("let*: bad syntax"))}function Yc(a,b,c,d,f,g,h){return 1===h.type?(a=h.$1,a=f.$3.$4(g)(a.$1)(a.$2),new v(a,Wj(f,g,h.$2))):new C(Sa)}function Ec(a,b){if(1===b.type){var c=1===W(0===(""==b.$2?1:0)?!0:!1,!0).type?Dc:new zc(b.$2[0],b.$2.slice(1));return new f(b.$1,Ec(null,c))}return n}var g={"throw":function(a){throw a;},Lazy:function(a){this.js_idris_lazy_calc=a;this.js_idris_lazy_val=
    void 0},force:function(a){if(void 0===a||void 0===a.js_idris_lazy_calc)return a;void 0===a.js_idris_lazy_val&&(a.js_idris_lazy_val=a.js_idris_lazy_calc());return a.js_idris_lazy_val},prim_strSubstr:function(a,b,c){return c.substr(Math.max(0,a),Math.max(0,b))},prim_systemInfo:function(a){switch(a){case 0:return"javascript";case 1:return navigator.platform}return""},prim_writeStr:function(a){return console.log(a)},prim_readStr:function(){return prompt("Prelude.getLine")}};g.jsbn=function(){function a(a,
    b,c){null!=a&&("number"==typeof a?this.fromNumber(a,b,c):null==b&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function b(){return new a(null)}function c(a,b,c,d,e,f){for(;0<=--f;){var z=b*this[a++]+c[d]+e;e=Math.floor(z/67108864);c[d++]=z&67108863}return e}function d(a,b,c,d,e,f){var z=b&32767;for(b>>=15;0<=--f;){var K=this[a]&32767,g=this[a++]>>15,Ma=b*K+g*z;K=z*K+((Ma&32767)<<15)+c[d]+(e&1073741823);e=(K>>>30)+(Ma>>>15)+b*g+(e>>>30);c[d++]=K&1073741823}return e}function f(a,
    b,c,d,e,f){var z=b&16383;for(b>>=14;0<=--f;){var K=this[a]&16383,g=this[a++]>>14,Ma=b*K+g*z;K=z*K+((Ma&16383)<<14)+c[d]+e;e=(K>>28)+(Ma>>14)+b*g;c[d++]=K&268435455}return e}function g(a,b){var c=E[a.charCodeAt(b)];return null==c?-1:c}function h(a){var c=b();c.fromInt(a);return c}function l(a){var b=1,c;0!=(c=a>>>16)&&(a=c,b+=16);0!=(c=a>>8)&&(a=c,b+=8);0!=(c=a>>4)&&(a=c,b+=4);0!=(c=a>>2)&&(a=c,b+=2);0!=a>>1&&(b+=1);return b}function m(a){this.m=a}function p(a){this.m=a;this.mp=a.invDigit();this.mpl=
    this.mp&32767;this.mph=this.mp>>15;this.um=(1<<a.DB-15)-1;this.mt2=2*a.t}function n(a,b){return a&b}function q(a,b){return a|b}function t(a,b){return a^b}function r(a,b){return a&~b}function u(){}function v(a){return a}function w(c){this.r2=b();this.q3=b();a.ONE.dlShiftTo(2*c.t,this.r2);this.mu=this.r2.divide(c);this.m=c}function y(a){I[F++]^=a&255;I[F++]^=a>>8&255;I[F++]^=a>>16&255;I[F++]^=a>>24&255;F>=J&&(F-=J)}function C(){}function D(){this.j=this.i=0;this.S=[]}var x;(x="undefined"!==typeof navigator)&&
    "Microsoft Internet Explorer"==navigator.appName?(a.prototype.am=d,x=30):x&&"Netscape"!=navigator.appName?(a.prototype.am=c,x=26):(a.prototype.am=f,x=28);a.prototype.DB=x;a.prototype.DM=(1<<x)-1;a.prototype.DV=1<<x;a.prototype.FV=Math.pow(2,52);a.prototype.F1=52-x;a.prototype.F2=2*x-52;var E=[],A;x=48;for(A=0;9>=A;++A)E[x++]=A;x=97;for(A=10;36>A;++A)E[x++]=A;x=65;for(A=10;36>A;++A)E[x++]=A;m.prototype.convert=function(a){return 0>a.s||0<=a.compareTo(this.m)?a.mod(this.m):a};m.prototype.revert=function(a){return a};
    m.prototype.reduce=function(a){a.divRemTo(this.m,null,a)};m.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};m.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};p.prototype.convert=function(c){var d=b();c.abs().dlShiftTo(this.m.t,d);d.divRemTo(this.m,null,d);0>c.s&&0<d.compareTo(a.ZERO)&&this.m.subTo(d,d);return d};p.prototype.revert=function(a){var c=b();a.copyTo(c);this.reduce(c);return c};p.prototype.reduce=function(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=
    a[b]&32767,d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;c=b+this.m.t;for(a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp();a.drShiftTo(this.m.t,a);0<=a.compareTo(this.m)&&a.subTo(this.m,a)};p.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};p.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};a.prototype.copyTo=function(a){for(var b=this.t-1;0<=b;--b)a[b]=this[b];a.t=this.t;a.s=this.s};a.prototype.fromInt=function(a){this.t=
    1;this.s=0>a?-1:0;0<a?this[0]=a:-1>a?this[0]=a+this.DV:this.t=0};a.prototype.fromString=function(b,c){if(16==c)var d=4;else if(8==c)d=3;else if(256==c)d=8;else if(2==c)d=1;else if(32==c)d=5;else if(4==c)d=2;else{this.fromRadix(b,c);return}this.s=this.t=0;for(var e=b.length,f=!1,z=0;0<=--e;){var K=8==d?b[e]&255:g(b,e);0>K?"-"==b.charAt(e)&&(f=!0):(f=!1,0==z?this[this.t++]=K:z+d>this.DB?(this[this.t-1]|=(K&(1<<this.DB-z)-1)<<z,this[this.t++]=K>>this.DB-z):this[this.t-1]|=K<<z,z+=d,z>=this.DB&&(z-=this.DB))}8==
    d&&0!=(b[0]&128)&&(this.s=-1,0<z&&(this[this.t-1]|=(1<<this.DB-z)-1<<z));this.clamp();f&&a.ZERO.subTo(this,this)};a.prototype.clamp=function(){for(var a=this.s&this.DM;0<this.t&&this[this.t-1]==a;)--this.t};a.prototype.dlShiftTo=function(a,b){var c;for(c=this.t-1;0<=c;--c)b[c+a]=this[c];for(c=a-1;0<=c;--c)b[c]=0;b.t=this.t+a;b.s=this.s};a.prototype.drShiftTo=function(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0);b.s=this.s};a.prototype.lShiftTo=function(a,b){var c=a%this.DB,
    d=this.DB-c,e=(1<<d)-1,f=Math.floor(a/this.DB),g=this.s<<c&this.DM,z;for(z=this.t-1;0<=z;--z)b[z+f+1]=this[z]>>d|g,g=(this[z]&e)<<c;for(z=f-1;0<=z;--z)b[z]=0;b[f]=g;b.t=this.t+f+1;b.s=this.s;b.clamp()};a.prototype.rShiftTo=function(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)b.t=0;else{var d=a%this.DB,e=this.DB-d,f=(1<<d)-1;b[0]=this[c]>>d;for(var g=c+1;g<this.t;++g)b[g-c-1]|=(this[g]&f)<<e,b[g-c]=this[g]>>d;0<d&&(b[this.t-c-1]|=(this.s&f)<<e);b.t=this.t-c;b.clamp()}};a.prototype.subTo=
    function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0;-1>d?b[c++]=this.DV+d:0<d&&(b[c++]=d);b.t=c;b.clamp()};a.prototype.multiplyTo=function(b,c){var d=this.abs(),e=b.abs(),f=d.t;for(c.t=f+e.t;0<=--f;)c[f]=0;for(f=0;f<e.t;++f)c[f+d.t]=d.am(0,e[f],c,f,0,d.t);c.s=0;c.clamp();this.s!=b.s&&
    a.ZERO.subTo(c,c)};a.prototype.squareTo=function(a){for(var b=this.abs(),c=a.t=2*b.t;0<=--c;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}0<a.t&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1));a.s=0;a.clamp()};a.prototype.divRemTo=function(c,d,e){var f=c.abs();if(!(0>=f.t)){var g=this.abs();if(g.t<f.t)null!=d&&d.fromInt(0),null!=e&&this.copyTo(e);else{null==e&&(e=b());var z=b(),h=this.s;c=c.s;var K=this.DB-l(f[f.t-
    1]);0<K?(f.lShiftTo(K,z),g.lShiftTo(K,e)):(f.copyTo(z),g.copyTo(e));f=z.t;g=z[f-1];if(0!=g){var k=g*(1<<this.F1)+(1<f?z[f-2]>>this.F2:0),Ma=this.FV/k;k=(1<<this.F1)/k;var m=1<<this.F2,p=e.t,n=p-f,q=null==d?b():d;z.dlShiftTo(n,q);0<=e.compareTo(q)&&(e[e.t++]=1,e.subTo(q,e));a.ONE.dlShiftTo(f,q);for(q.subTo(z,z);z.t<f;)z[z.t++]=0;for(;0<=--n;){var t=e[--p]==g?this.DM:Math.floor(e[p]*Ma+(e[p-1]+m)*k);if((e[p]+=z.am(0,t,e,n,0,f))<t)for(z.dlShiftTo(n,q),e.subTo(q,e);e[p]<--t;)e.subTo(q,e)}null!=d&&(e.drShiftTo(f,
    d),h!=c&&a.ZERO.subTo(d,d));e.t=f;e.clamp();0<K&&e.rShiftTo(K,e);0>h&&a.ZERO.subTo(e,e)}}}};a.prototype.invDigit=function(){if(1>this.t)return 0;var a=this[0];if(0==(a&1))return 0;var b=a&3;b=b*(2-(a&15)*b)&15;b=b*(2-(a&255)*b)&255;b=b*(2-((a&65535)*b&65535))&65535;b=b*(2-a*b%this.DV)%this.DV;return 0<b?this.DV-b:-b};a.prototype.isEven=function(){return 0==(0<this.t?this[0]&1:this.s)};a.prototype.exp=function(c,d){if(4294967295<c||1>c)return a.ONE;var e=b(),f=b(),g=d.convert(this),z=l(c)-1;for(g.copyTo(e);0<=
    --z;)if(d.sqrTo(e,f),0<(c&1<<z))d.mulTo(f,g,e);else{var h=e;e=f;f=h}return d.revert(e)};a.prototype.toString=function(a){if(0>this.s)return"-"+this.negate().toString(a);if(16==a)a=4;else if(8==a)a=3;else if(2==a)a=1;else if(32==a)a=5;else if(4==a)a=2;else return this.toRadix(a);var b=(1<<a)-1,c,d=!1,e="",f=this.t,g=this.DB-f*this.DB%a;if(0<f--)for(g<this.DB&&0<(c=this[f]>>g)&&(d=!0,e="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));0<=f;)g<a?(c=(this[f]&(1<<g)-1)<<a-g,c|=this[--f]>>(g+=this.DB-a)):
    (c=this[f]>>(g-=a)&b,0>=g&&(g+=this.DB,--f)),0<c&&(d=!0),d&&(e+="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));return d?e:"0"};a.prototype.negate=function(){var c=b();a.ZERO.subTo(this,c);return c};a.prototype.abs=function(){return 0>this.s?this.negate():this};a.prototype.compareTo=function(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;b=c-a.t;if(0!=b)return 0>this.s?-b:b;for(;0<=--c;)if(0!=(b=this[c]-a[c]))return b;return 0};a.prototype.bitLength=function(){return 0>=this.t?0:this.DB*(this.t-
    1)+l(this[this.t-1]^this.s&this.DM)};a.prototype.mod=function(c){var d=b();this.abs().divRemTo(c,null,d);0>this.s&&0<d.compareTo(a.ZERO)&&c.subTo(d,d);return d};a.prototype.modPowInt=function(a,b){var c=256>a||b.isEven()?new m(b):new p(b);return this.exp(a,c)};a.ZERO=h(0);a.ONE=h(1);u.prototype.convert=v;u.prototype.revert=v;u.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c)};u.prototype.sqrTo=function(a,b){a.squareTo(b)};w.prototype.convert=function(a){if(0>a.s||a.t>2*this.m.t)return a.mod(this.m);
    if(0>a.compareTo(this.m))return a;var c=b();a.copyTo(c);this.reduce(c);return c};w.prototype.revert=function(a){return a};w.prototype.reduce=function(a){a.drShiftTo(this.m.t-1,this.r2);a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp());this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);for(this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);0>a.compareTo(this.r2);)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);0<=a.compareTo(this.m);)a.subTo(this.m,a)};w.prototype.mulTo=function(a,b,c){a.multiplyTo(b,
    c);this.reduce(c)};w.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};var B=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,
    613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],G=67108864/B[B.length-1];a.prototype.chunkSize=function(a){return Math.floor(Math.LN2*this.DB/Math.log(a))};a.prototype.toRadix=function(a){null==a&&(a=10);if(0==this.signum()||2>a||36<a)return"0";var c=this.chunkSize(a);c=Math.pow(a,c);var d=h(c),e=b(),f=b(),g="";for(this.divRemTo(d,
    e,f);0<e.signum();)g=(c+f.intValue()).toString(a).substr(1)+g,e.divRemTo(d,e,f);return f.intValue().toString(a)+g};a.prototype.fromRadix=function(b,c){this.fromInt(0);null==c&&(c=10);for(var d=this.chunkSize(c),e=Math.pow(c,d),f=!1,h=0,z=0,k=0;k<b.length;++k){var K=g(b,k);0>K?"-"==b.charAt(k)&&0==this.signum()&&(f=!0):(z=c*z+K,++h>=d&&(this.dMultiply(e),this.dAddOffset(z,0),z=h=0))}0<h&&(this.dMultiply(Math.pow(c,h)),this.dAddOffset(z,0));f&&a.ZERO.subTo(this,this)};a.prototype.fromNumber=function(b,
    c,d){if("number"==typeof c)if(2>b)this.fromInt(1);else for(this.fromNumber(b,d),this.testBit(b-1)||this.bitwiseTo(a.ONE.shiftLeft(b-1),q,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(c);)this.dAddOffset(2,0),this.bitLength()>b&&this.subTo(a.ONE.shiftLeft(b-1),this);else{d=[];var e=b&7;d.length=(b>>3)+1;c.nextBytes(d);d[0]=0<e?d[0]&(1<<e)-1:0;this.fromString(d,256)}};a.prototype.bitwiseTo=function(a,b,c){var d,e=Math.min(a.t,this.t);for(d=0;d<e;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){var f=
    a.s&this.DM;for(d=e;d<this.t;++d)c[d]=b(this[d],f);c.t=this.t}else{f=this.s&this.DM;for(d=e;d<a.t;++d)c[d]=b(f,a[d]);c.t=a.t}c.s=b(this.s,a.s);c.clamp()};a.prototype.changeBit=function(b,c){var d=a.ONE.shiftLeft(b);this.bitwiseTo(d,c,d);return d};a.prototype.addTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,
    d>>=this.DB;d+=a.s}b.s=0>d?-1:0;0<d?b[c++]=d:-1>d&&(b[c++]=this.DV+d);b.t=c;b.clamp()};a.prototype.dMultiply=function(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()};a.prototype.dAddOffset=function(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}};a.prototype.multiplyLowerTo=function(a,b,c){var d=Math.min(this.t+a.t,b);c.s=0;for(c.t=d;0<d;)c[--d]=0;var e;for(e=c.t-this.t;d<e;++d)c[d+this.t]=
    this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);d<e;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()};a.prototype.multiplyUpperTo=function(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;0<=--d;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp();c.drShiftTo(1,c)};a.prototype.modInt=function(a){if(0>=a)return 0;var b=this.DV%a,c=0>this.s?a-1:0;if(0<this.t)if(0==b)c=this[0]%a;else for(var d=this.t-1;0<=d;--d)c=(b*c+this[d])%a;return c};a.prototype.millerRabin=
    function(c){var d=this.subtract(a.ONE),e=d.getLowestSetBit();if(0>=e)return!1;var f=d.shiftRight(e);c=c+1>>1;c>B.length&&(c=B.length);for(var g=b(),h=0;h<c;++h){g.fromInt(B[Math.floor(Math.random()*B.length)]);var k=g.modPow(f,this);if(0!=k.compareTo(a.ONE)&&0!=k.compareTo(d)){for(var z=1;z++<e&&0!=k.compareTo(d);)if(k=k.modPowInt(2,this),0==k.compareTo(a.ONE))return!1;if(0!=k.compareTo(d))return!1}}return!0};a.prototype.clone=function(){var a=b();this.copyTo(a);return a};a.prototype.intValue=function(){if(0>
    this.s){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]};a.prototype.byteValue=function(){return 0==this.t?this.s:this[0]<<24>>24};a.prototype.shortValue=function(){return 0==this.t?this.s:this[0]<<16>>16};a.prototype.signum=function(){return 0>this.s?-1:0>=this.t||1==this.t&&0>=this[0]?0:1};a.prototype.toByteArray=function(){var a=this.t,b=[];b[0]=this.s;var c=this.DB-a*this.DB%8,d,
    e=0;if(0<a--)for(c<this.DB&&(d=this[a]>>c)!=(this.s&this.DM)>>c&&(b[e++]=d|this.s<<this.DB-c);0<=a;)if(8>c?(d=(this[a]&(1<<c)-1)<<8-c,d|=this[--a]>>(c+=this.DB-8)):(d=this[a]>>(c-=8)&255,0>=c&&(c+=this.DB,--a)),0!=(d&128)&&(d|=-256),0==e&&(this.s&128)!=(d&128)&&++e,0<e||d!=this.s)b[e++]=d;return b};a.prototype.equals=function(a){return 0==this.compareTo(a)};a.prototype.min=function(a){return 0>this.compareTo(a)?this:a};a.prototype.max=function(a){return 0<this.compareTo(a)?this:a};a.prototype.and=
    function(a){var c=b();this.bitwiseTo(a,n,c);return c};a.prototype.or=function(a){var c=b();this.bitwiseTo(a,q,c);return c};a.prototype.xor=function(a){var c=b();this.bitwiseTo(a,t,c);return c};a.prototype.andNot=function(a){var c=b();this.bitwiseTo(a,r,c);return c};a.prototype.not=function(){for(var a=b(),c=0;c<this.t;++c)a[c]=this.DM&~this[c];a.t=this.t;a.s=~this.s;return a};a.prototype.shiftLeft=function(a){var c=b();0>a?this.rShiftTo(-a,c):this.lShiftTo(a,c);return c};a.prototype.shiftRight=function(a){var c=
    b();0>a?this.lShiftTo(-a,c):this.rShiftTo(a,c);return c};a.prototype.getLowestSetBit=function(){for(var a=0;a<this.t;++a)if(0!=this[a]){var b=a*this.DB;a=this[a];if(0==a)a=-1;else{var c=0;0==(a&65535)&&(a>>=16,c+=16);0==(a&255)&&(a>>=8,c+=8);0==(a&15)&&(a>>=4,c+=4);0==(a&3)&&(a>>=2,c+=2);0==(a&1)&&++c;a=c}return b+a}return 0>this.s?this.t*this.DB:-1};a.prototype.bitCount=function(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c){for(var d=this[c]^b,e=0;0!=d;)d&=d-1,++e;a+=e}return a};a.prototype.testBit=
    function(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)};a.prototype.setBit=function(a){return this.changeBit(a,q)};a.prototype.clearBit=function(a){return this.changeBit(a,r)};a.prototype.flipBit=function(a){return this.changeBit(a,t)};a.prototype.add=function(a){var c=b();this.addTo(a,c);return c};a.prototype.subtract=function(a){var c=b();this.subTo(a,c);return c};a.prototype.multiply=function(a){var c=b();this.multiplyTo(a,c);return c};a.prototype.divide=function(a){var c=
    b();this.divRemTo(a,c,null);return c};a.prototype.remainder=function(a){var c=b();this.divRemTo(a,null,c);return c};a.prototype.divideAndRemainder=function(a){var c=b(),d=b();this.divRemTo(a,c,d);return[c,d]};a.prototype.modPow=function(a,c){var d=a.bitLength(),e=h(1);if(0>=d)return e;var f=18>d?1:48>d?3:144>d?4:768>d?5:6;var g=8>d?new m(c):c.isEven()?new w(c):new p(c);var k=[],n=3,q=f-1,t=(1<<f)-1;k[1]=g.convert(this);if(1<f)for(d=b(),g.sqrTo(k[1],d);n<=t;)k[n]=b(),g.mulTo(d,k[n-2],k[n]),n+=2;var r=
    a.t-1,u=!0,z=b();for(d=l(a[r])-1;0<=r;){if(d>=q)var v=a[r]>>d-q&t;else v=(a[r]&(1<<d+1)-1)<<q-d,0<r&&(v|=a[r-1]>>this.DB+d-q);for(n=f;0==(v&1);)v>>=1,--n;0>(d-=n)&&(d+=this.DB,--r);if(u)k[v].copyTo(e),u=!1;else{for(;1<n;)g.sqrTo(e,z),g.sqrTo(z,e),n-=2;0<n?g.sqrTo(e,z):(n=e,e=z,z=n);g.mulTo(z,k[v],e)}for(;0<=r&&0==(a[r]&1<<d);)g.sqrTo(e,z),n=e,e=z,z=n,0>--d&&(d=this.DB-1,--r)}return g.revert(e)};a.prototype.modInverse=function(b){var c=b.isEven();if(this.isEven()&&c||0==b.signum())return a.ZERO;for(var d=
    b.clone(),e=this.clone(),f=h(1),g=h(0),k=h(0),l=h(1);0!=d.signum();){for(;d.isEven();)d.rShiftTo(1,d),c?(f.isEven()&&g.isEven()||(f.addTo(this,f),g.subTo(b,g)),f.rShiftTo(1,f)):g.isEven()||g.subTo(b,g),g.rShiftTo(1,g);for(;e.isEven();)e.rShiftTo(1,e),c?(k.isEven()&&l.isEven()||(k.addTo(this,k),l.subTo(b,l)),k.rShiftTo(1,k)):l.isEven()||l.subTo(b,l),l.rShiftTo(1,l);0<=d.compareTo(e)?(d.subTo(e,d),c&&f.subTo(k,f),g.subTo(l,g)):(e.subTo(d,e),c&&k.subTo(f,k),l.subTo(g,l))}if(0!=e.compareTo(a.ONE))return a.ZERO;
    if(0<=l.compareTo(b))return l.subtract(b);if(0>l.signum())l.addTo(b,l);else return l;return 0>l.signum()?l.add(b):l};a.prototype.pow=function(a){return this.exp(a,new u)};a.prototype.gcd=function(a){var b=0>this.s?this.negate():this.clone();a=0>a.s?a.negate():a.clone();if(0>b.compareTo(a)){var c=b;b=a;a=c}c=b.getLowestSetBit();var d=a.getLowestSetBit();if(0>d)return b;c<d&&(d=c);0<d&&(b.rShiftTo(d,b),a.rShiftTo(d,a));for(;0<b.signum();)0<(c=b.getLowestSetBit())&&b.rShiftTo(c,b),0<(c=a.getLowestSetBit())&&
    a.rShiftTo(c,a),0<=b.compareTo(a)?(b.subTo(a,b),b.rShiftTo(1,b)):(a.subTo(b,a),a.rShiftTo(1,a));0<d&&a.lShiftTo(d,a);return a};a.prototype.isProbablePrime=function(a){var b,c=this.abs();if(1==c.t&&c[0]<=B[B.length-1]){for(b=0;b<B.length;++b)if(c[0]==B[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<B.length;){for(var d=B[b],e=b+1;e<B.length&&d<G;)d*=B[e++];for(d=c.modInt(d);b<e;)if(0==d%B[b++])return!1}return c.millerRabin(a)};a.prototype.square=function(){var a=b();this.squareTo(a);return a};
    a.prototype.Barrett=w;var H;if(null==I){var I=[];var F=0;if("undefined"!==typeof window&&window.crypto)if(window.crypto.getRandomValues)for(A=new Uint8Array(32),window.crypto.getRandomValues(A),x=0;32>x;++x)I[F++]=A[x];else if("Netscape"==navigator.appName&&"5">navigator.appVersion)for(A=window.crypto.random(32),x=0;x<A.length;++x)I[F++]=A.charCodeAt(x)&255;for(;F<J;)x=Math.floor(65536*Math.random()),I[F++]=x>>>8,I[F++]=x&255;F=0;y((new Date).getTime())}C.prototype.nextBytes=function(a){var b;for(b=
    0;b<a.length;++b){var c=b;if(null==H){y((new Date).getTime());H=new D;H.init(I);for(F=0;F<I.length;++F)I[F]=0;F=0}var d=H.next();a[c]=d}};D.prototype.init=function(a){var b,c;for(b=0;256>b;++b)this.S[b]=b;for(b=c=0;256>b;++b){c=c+this.S[b]+a[b%a.length]&255;var d=this.S[b];this.S[b]=this.S[c];this.S[c]=d}this.j=this.i=0};D.prototype.next=function(){this.i=this.i+1&255;this.j=this.j+this.S[this.i]&255;var a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[a+this.S[this.i]&
    255]};var J=256;return{BigInteger:a,SecureRandom:C}}.call(this);var Sa={type:0},oa={type:13},aj={type:0},Cd={type:0},n={type:0},Sd={type:1},aa={type:0},S={type:0},Dc={type:0},gk={type:0},Rd={type:0};g.force(Mb(null,null,Ad(),Dd())(ad())(ad())(null))}).call(this);
};

},{}],7:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var list_1 = require("../list/list");
var cons_1 = require("../cons/cons");
/**
 * Returns an association list with a single key-value pair.
 * @param  {*} key
 * @param  {*} value
 * @return {Cons}
 */
exports["default"] = (function (key, value) { return list_1["default"](cons_1["default"](key, value)); });

},{"../cons/cons":16,"../list/list":39}],8:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("../cons/pair");
var equal_1 = require("../cons/equal");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var every_1 = require("../list/every");
var get_1 = require("./get");
/**
 * Compares two association lists for equality. Two association
 * lists are considered equal if all the key-value-pairs from the
 * first list are in the second, and vice-versa. The ordering and
 * relative positions of these KVPs are irrelevant for these purposes.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
exports["default"] = (function (L1, L2) {
    return every_1["default"](function (val) { return pair_1["default"](val) && equal_1["default"](get_1["default"](car_1["default"](val), L2), cdr_1["default"](val)); }, L1) &&
        every_1["default"](function (val) { return pair_1["default"](val) && equal_1["default"](get_1["default"](car_1["default"](val), L1), cdr_1["default"](val)); }, L2);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/equal":17,"../cons/pair":21,"../list/every":32,"./get":9}],9:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var equal_1 = require("../cons/equal");
var isempty_1 = require("../cons/isempty");
/**
 * Finds and returns the first key-value pair
 * which has a key matching that passed in.
 * Returns false if no match is found.
 * @param  {*} key
 * @param  {Cons} L
 * @return {Cons}
 */
var get = function (key, L) {
    return isempty_1["default"](L) ? L : equal_1["default"](car_1["default"](car_1["default"](L)), key) ? cdr_1["default"](car_1["default"](L)) : get(key, cdr_1["default"](L));
};
exports["default"] = get;

},{"../cons/car":14,"../cons/cdr":15,"../cons/equal":17,"../cons/isempty":18}],10:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var map_1 = require("../list/map");
/**
 * Map over an association list.
 * @param  {Function} fn
 * @param  {alist} L
 * @return {list}
 */
var map = function (fn, L) {
    return map_1["default"](function (v) { return cons_1["default"](car_1["default"](v), fn(car_1["default"](v), cdr_1["default"](v))); }, L);
};
exports["default"] = map;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../list/map":40}],11:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var pair_1 = require("../cons/pair");
var isempty_1 = require("../cons/isempty");
/**
 * Returns a string representation of the
 * given association list. Currently, some
 * assumptions are made about the given list.
 * Namely, that the values are either primitives or
 * nested association lists.
 * @param  {Cons} L
 * @return {string}
 */
exports["default"] = (function (L) {
    var getIndent = function (n) { return Array(n * 4).join(" "); };
    var outerWrap = function (L, indent) {
        return "{\n" + helper(L, "", indent + 1) + "\n" + getIndent(indent) + "}";
    };
    var helper = function (L, spacer, indent) {
        return isempty_1["default"](L)
            ? ""
            : pair_1["default"](cdr_1["default"](car_1["default"](L)))
                ? spacer +
                    getIndent(indent) +
                    car_1["default"](car_1["default"](L)) +
                    ": " +
                    outerWrap(cdr_1["default"](car_1["default"](L)), indent) +
                    helper(cdr_1["default"](L), ",\n", indent)
                : spacer +
                    getIndent(indent) +
                    car_1["default"](car_1["default"](L)) +
                    ": " +
                    cdr_1["default"](car_1["default"](L)) +
                    helper(cdr_1["default"](L), ",\n", indent);
    };
    return outerWrap(L, 0);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18,"../cons/pair":21}],12:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var get_1 = require("./get");
/**
 * Returns a new alist. If the given key
 * pair existed in the original list, the
 * value will be replaced with the one privded. Otherwise
 * the key-value pair will be added.
 * @param  {*} key
 * @param  {*} value
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (key, value, L) {
    var helper = function (L, key, value) {
        return car_1["default"](car_1["default"](L)) === key
            ? cons_1["default"](cons_1["default"](key, value), cdr_1["default"](L))
            : cons_1["default"](car_1["default"](L), helper(cdr_1["default"](L), key, value));
    };
    return isempty_1["default"](get_1["default"](key, L))
        ? cons_1["default"](cons_1["default"](key, value), L)
        : helper(L, key, value);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"./get":9}],13:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = Symbol("Cons");

},{}],14:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the car of a cons
 * @param  {Cons} cons cons to be car'd
 * @return {*}      car value of the given cons
 */
exports["default"] = (function (cons) { return cons(0); });

},{}],15:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the cdr of a cons
 * @param  {Cons} cons cons to be cdr'd
 * @return {*}      cdr value of the given cons
 */
exports["default"] = (function (cons) { return cons(1); });

},{}],16:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/// <reference path="../cons.d.ts" />
var ConsType_1 = require("./ConsType");
/**
 * Returns an immutable cons pair consisting
 * of a and b
 * @param  {*} car
 * @param  {*} cdr
 * @return {Cons}
 */
exports["default"] = (function (car, cdr) { return function (pick) {
    return pick === 0 ? car : pick === 1 ? cdr : ConsType_1["default"];
}; });

},{"./ConsType":13}],17:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("./pair");
var cdr_1 = require("./cdr");
var car_1 = require("./car");
/**
 * Returns a boolean indicating whether to two given parameters
 * are equal. If the paramters are cons pairs, equality is determined
 * by the equality of their members.
 * @param  {*} a
 * @param  {*} b
 * @return {boolean}
 */
var equal = function (a, b) {
    // If a is a pair and b is not (or vice versa),
    // these cannot be equal.
    return pair_1["default"](a) !== pair_1["default"](b)
        ? false
        : // If car(a) is a pair and car(b) is not (or vice versa),
            // these cannot be equal.
            (pair_1["default"](a) && pair_1["default"](car_1["default"](a))) !== (pair_1["default"](b) && pair_1["default"](car_1["default"](b)))
                ? false
                : // If cdr(a) is a pair and cdr(b) is not (or vice versa),
                    // these cannot be equal.
                    (pair_1["default"](a) && pair_1["default"](cdr_1["default"](a))) !== (pair_1["default"](b) && pair_1["default"](cdr_1["default"](b)))
                        ? false
                        : // If a is a pair (which, if we have reached this point,
                            // means that b must also be a pair), recurse.
                            // Otherwise, test the equality of a and b directly.
                            pair_1["default"](a)
                                ? equal(car_1["default"](a), car_1["default"](b)) && equal(cdr_1["default"](a), cdr_1["default"](b))
                                : a === b;
};
exports["default"] = equal;

},{"./car":14,"./cdr":15,"./pair":21}],18:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var nil_1 = require("./nil");
/**
 * Returns a boolean indicating whether the given parameter
 * is the empty list.
 * @param  {*} c
 * @return {boolean}
 */
exports["default"] = (function (c) { return c === nil_1["default"]; });

},{"./nil":20}],19:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var cons_1 = require("./cons");
var car_1 = require("./car");
var cdr_1 = require("./cdr");
var print_1 = require("./print");
var equal_1 = require("./equal");
var pair_1 = require("./pair");
var isempty_1 = require("./isempty");
var nil_1 = require("./nil");
var compose_1 = require("../fun/compose");
exports.cons = cons_1["default"];
exports.car = car_1["default"];
exports.cdr = cdr_1["default"];
exports.caar = compose_1["default"](exports.car, exports.car);
exports.cadr = compose_1["default"](exports.car, exports.cdr);
exports.cdar = compose_1["default"](exports.cdr, exports.car);
exports.cddr = compose_1["default"](exports.cdr, exports.cdr);
exports.caaar = compose_1["default"](exports.car, compose_1["default"](exports.car, exports.car));
exports.caadr = compose_1["default"](exports.car, compose_1["default"](exports.car, exports.cdr));
exports.cadar = compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.car));
exports.caddr = compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.cdr));
exports.cdaar = compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.car));
exports.cdadr = compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.cdr));
exports.cddar = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.car));
exports.cdddr = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.cdr));
exports.caaaar = compose_1["default"](exports.car, compose_1["default"](exports.car, compose_1["default"](exports.car, exports.car)));
exports.caaadr = compose_1["default"](exports.car, compose_1["default"](exports.car, compose_1["default"](exports.car, exports.cdr)));
exports.caadar = compose_1["default"](exports.car, compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.car)));
exports.caaddr = compose_1["default"](exports.car, compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.cdr)));
exports.cadaar = compose_1["default"](exports.car, compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.car)));
exports.cadadr = compose_1["default"](exports.car, compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.cdr)));
exports.caddar = compose_1["default"](exports.car, compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.car)));
exports.cadddr = compose_1["default"](exports.car, compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.cdr)));
exports.cdaaar = compose_1["default"](exports.cdr, compose_1["default"](exports.car, compose_1["default"](exports.car, exports.car)));
exports.cdaadr = compose_1["default"](exports.cdr, compose_1["default"](exports.car, compose_1["default"](exports.car, exports.cdr)));
exports.cdadar = compose_1["default"](exports.cdr, compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.car)));
exports.cdaddr = compose_1["default"](exports.cdr, compose_1["default"](exports.car, compose_1["default"](exports.cdr, exports.cdr)));
exports.cddaar = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.car)));
exports.cddadr = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, compose_1["default"](exports.car, exports.cdr)));
exports.cdddar = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.car)));
exports.cddddr = compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, compose_1["default"](exports.cdr, exports.cdr)));
exports.print = print_1["default"];
exports.equal = equal_1["default"];
exports.pair = pair_1["default"];
exports.isEmpty = isempty_1["default"];
exports.nil = nil_1["default"];

},{"../fun/compose":25,"./car":14,"./cdr":15,"./cons":16,"./equal":17,"./isempty":18,"./nil":20,"./pair":21,"./print":22}],20:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = null;

},{}],21:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ConsType_1 = require("./ConsType");
/**
 * Returns a boolean indicating whether the given parameter is a cons pair.
 * @param  {*} c
 * @return {boolean}
 */
exports["default"] = (function (c) {
    return typeof c === "function" && c(3) === ConsType_1["default"];
});

},{"./ConsType":13}],22:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var pair_1 = require("./pair");
var cdr_1 = require("./cdr");
var car_1 = require("./car");
var isempty_1 = require("./isempty");
/**
 * Returns a string representation of a cons.
 * cons prefix, suffix, and separator can all
 * optionally be defined by the user.
 * @param  {Cons} c    cons to be printed
 * @param  {(Object|undefined)} options Optional options object
 * @return {string}      String representation of the given cons
 */
var print = function (c, options) {
    var opts = options || {};
    var printHelper = function (c, separator, nil) {
        var carResult = pair_1["default"](c)
            ? pair_1["default"](car_1["default"](c))
                ? printHelper(car_1["default"](c), separator, nil)
                : !isempty_1["default"](car_1["default"](c)) ? car_1["default"](c).toString() : nil
            : "";
        var cdrResult = pair_1["default"](c)
            ? pair_1["default"](cdr_1["default"](c))
                ? printHelper(cdr_1["default"](c), separator, nil)
                : !isempty_1["default"](cdr_1["default"](c)) ? cdr_1["default"](c).toString() : nil
            : "";
        var newSeparator = carResult === "" || cdrResult === "" ? "" : separator;
        return ((typeof opts.prefix !== "undefined" ? opts.prefix : "(") +
            carResult +
            newSeparator +
            cdrResult +
            (typeof opts.suffix !== "undefined" ? opts.suffix : ")"));
    };
    return printHelper(c, typeof opts.separator !== "undefined" ? opts.separator : " . ", typeof opts.nil !== "undefined" ? opts.nil : "()");
};
exports["default"] = print;

},{"./car":14,"./cdr":15,"./isempty":18,"./pair":21}],23:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var apply_1 = require("./apply");
var args_1 = require("../helpers/args");
var list_1 = require("../list/list");
exports["default"] = (function (f) {
    return f((function (h) { return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return apply_1["default"](f(h(h)), list_1["default"](args_1["default"](rest)));
    }; })(function (h) { return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return apply_1["default"](f(h(h)), list_1["default"](args_1["default"](rest)));
    }; }));
});

},{"../helpers/args":27,"../list/list":39,"./apply":24}],24:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Call the given function with the list of arguments supplied.
 * @param  {Function} fn
 * @param  {Cons}   args
 * @return {*}
 */
// TODO: Remove bind?
var apply = function (fn, args) {
    var helper = function (fn, args) {
        return isempty_1["default"](cdr_1["default"](args))
            ? fn(car_1["default"](args))
            : apply(fn.bind(null, car_1["default"](args)), cdr_1["default"](args));
    };
    return helper(fn, args);
};
exports["default"] = apply;

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],25:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Compose functions a and b
 * @param  {Function} a Outer function
 * @param  {Function} b Inner function
 * @return {Function}   Composed function
 */
exports["default"] = (function (a, b) { return function (c) { return a(b(c)); }; });

},{}],26:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var apply_1 = require("./apply");
var nil_1 = require("../cons/nil");
/**
 * Curry the given function. If the number of expected parameters
 * is passed explicitly, this will be used. Otherwise, the arity of the
 * function passed in will be used.
 * @param  {Function} fn
 * @param  {integer}  arity
 * @return {Function}
 */
exports["default"] = (function (fn, arity) {
    var helper = function (fn, arity, args) {
        return arity === 0
            ? apply_1["default"](fn, args)
            : function (arg) { return helper(fn, arity - 1, cons_1["default"](arg, args)); };
    };
    return typeof arity === "undefined"
        ? helper(fn, fn.length, nil_1["default"])
        : helper(fn, arity, nil_1["default"]);
});

},{"../cons/cons":16,"../cons/nil":20,"./apply":24}],27:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Given an array-like, returns a real array.
 * @param  {Array-like} args
 * @return {Arrau}
 */
exports["default"] = (function (args) { return Array.prototype.slice.call(args); });

},{}],28:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns a new list that is the result
 * of concatenating L2 onto the end of L1;
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
var concat = function (L1, L2) {
    return isempty_1["default"](L1) ? L2 : cons_1["default"](car_1["default"](L1), concat(cdr_1["default"](L1), L2));
};
exports["default"] = concat;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18}],29:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var equal_1 = require("../cons/equal");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns true if the specified value is equal to at least one element of the given list.
 * @param  {*} a
 * @param  {Cons} L
 * @return {Boolean}
 */
var contains = function (a, L) {
    return isempty_1["default"](L) ? false : equal_1["default"](car_1["default"](L), a) ? true : contains(a, cdr_1["default"](L));
};
exports["default"] = contains;

},{"../cons/car":14,"../cons/cdr":15,"../cons/equal":17,"../cons/isempty":18}],30:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Given a cons list, returns a new cons list
 * with the first item removed
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (L) { return (isempty_1["default"](L) ? L : cdr_1["default"](L)); });

},{"../cons/cdr":15,"../cons/isempty":18}],31:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the front of the list.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (val, L) { return cons_1["default"](val, L); });

},{"../cons/cons":16}],32:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns true if every element in the list passes the
 * test implemented by the provided callback function.
 * The callback function is passed the current value
 * and the current index in the list.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {boolean}
 */
exports["default"] = (function (fn, L) {
    var helper = function (fn, idx, L) {
        return isempty_1["default"](L)
            ? true
            : !fn(car_1["default"](L), idx) ? false : helper(fn, idx + 1, cdr_1["default"](L));
    };
    return helper(fn, 0, L);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],33:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new cons list consisting of the values
 * of the given cons list for which the the callback function,
 * called passing the value of each item in the list in turn,
 * evaluated to true.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {Cons}
 */
var filter = function (fn, L) {
    return isempty_1["default"](L)
        ? L
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(car_1["default"](L)) ? cons_1["default"](car_1["default"](L), nil_1["default"]) : nil_1["default"]
            : fn(car_1["default"](L)) ? cons_1["default"](car_1["default"](L), filter(fn, cdr_1["default"](L))) : filter(fn, cdr_1["default"](L));
};
exports["default"] = filter;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],34:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var pair_1 = require("../cons/pair");
var concat_1 = require("./concat");
var isempty_1 = require("../cons/isempty");
/**
 * Flatten a list.
 * @return {Cons}
 */
var flatten = function (L) {
    return isempty_1["default"](L)
        ? L
        : !pair_1["default"](car_1["default"](L))
            ? cons_1["default"](car_1["default"](L), flatten(cdr_1["default"](L)))
            : concat_1["default"](flatten(car_1["default"](L)), flatten(cdr_1["default"](L)));
};
exports["default"] = flatten;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/pair":21,"./concat":28}],35:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Applies the given callback function against an accumulator
 * and each value of the cons list (from left-to-right) in order
 * to reduce it to a single value.
 * @param  {Function} fn
 * @param  {*}   acc
 * @param  {Cons} L
 * @return {Cons}
 */
var foldl = function (fn, acc, L) {
    return isempty_1["default"](L)
        ? acc
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(acc, car_1["default"](L))
            : foldl(fn, fn(acc, car_1["default"](L)), cdr_1["default"](L));
};
exports["default"] = foldl;

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],36:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Applies the given callback function against an accumulator
 * and each value of the cons list (from right-to-left) in order
 * to reduce it to a single value.
 * @param  {Function} fn
 * @param  {*}   acc
 * @param  {Cons} L
 * @return {Cons}
 */
// TODO: make foldl and folr
var foldr = function (fn, acc, L) {
    return isempty_1["default"](L)
        ? acc
        : isempty_1["default"](cdr_1["default"](L))
            ? fn(car_1["default"](L), acc)
            : fn(car_1["default"](L), foldr(fn, acc, cdr_1["default"](L)));
};
exports["default"] = foldr;

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],37:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns the value at the given index, or nil if the index exceeds the
 * length of the list.
 * @param  {number} idx
 * @param  {Cons} L
 * @return {boolean}
 */
var get = function (idx, L) {
    return isempty_1["default"](L) ? L : idx === 0 ? car_1["default"](L) : get(idx - 1, cdr_1["default"](L));
};
exports["default"] = get;

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],38:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var foldl_1 = require("./foldl");
/**
 * Returns the length of the given list
 * @param  {Cons} L list
 * @return {integer}   length of the given list.
 */
exports["default"] = (function (L) { return foldl_1["default"](function (acc, curr) { return acc + 1; }, 0, L); });

},{"./foldl":35}],39:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var args_1 = require("../helpers/args");
var nil_1 = require("../cons/nil");
/**
 * Returns a cons list constructed from the given parameters.
 * @return {Cons}
 */
exports["default"] = (function () {
    var outerArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        outerArgs[_i] = arguments[_i];
    }
    var helper = function (args) {
        return args.length === 0
            ? nil_1["default"]
            : Array.isArray(args[0])
                ? cons_1["default"](helper(args[0]), helper(args.slice(1)))
                : cons_1["default"](args[0], helper(args.slice(1)));
    };
    return outerArgs.length === 1 && Array.isArray(outerArgs[0])
        ? helper(outerArgs[0])
        : helper(args_1["default"](outerArgs));
});

},{"../cons/cons":16,"../cons/nil":20,"../helpers/args":27}],40:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new cons list with the results of calling the provided
 * function on every element.
 * @param  {Function} fn callback function
 * @param  {Cons} L  cons list to be mapped
 * @return {Cons}
 */
var map = function (fn, L) {
    return isempty_1["default"](L)
        ? L
        : isempty_1["default"](cdr_1["default"](L))
            ? cons_1["default"](fn(car_1["default"](L)), nil_1["default"])
            : cons_1["default"](fn(car_1["default"](L)), map(fn, cdr_1["default"](L)));
};
exports["default"] = map;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],41:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns the value of the last item in a cons list.
 * @param  {Cons} L
 * @return {*}
 */
var peek = function (L) {
    return isempty_1["default"](L) ? L : isempty_1["default"](cdr_1["default"](L)) ? car_1["default"](L) : peek(cdr_1["default"](L));
};
exports["default"] = peek;

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],42:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a cons list, returns a new list with the last item removed.
 * @param  {Cons} L
 * @return {Cons}
 */
var pop = function (L) {
    return isempty_1["default"](L) || isempty_1["default"](cdr_1["default"](L)) ? nil_1["default"] : cons_1["default"](car_1["default"](L), pop(cdr_1["default"](L)));
};
exports["default"] = pop;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],43:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a cons list and a value, returns a new cons list
 * with the value appended to the end.
 * @param  {*} val
 * @param  {Cons} L
 * @return {Cons}
 */
var push = function (val, L) {
    return isempty_1["default"](L)
        ? cons_1["default"](val, nil_1["default"])
        : isempty_1["default"](cdr_1["default"](L))
            ? cons_1["default"](car_1["default"](L), cons_1["default"](val, nil_1["default"]))
            : cons_1["default"](car_1["default"](L), push(val, cdr_1["default"](L)));
};
exports["default"] = push;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],44:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var nil_1 = require("../cons/nil");
/**
 * Returns a range list from n to m.
 * @param  {integer} n If m in not passed, the end of the range (exlusive),
 * otherwise the start of the range (inclusive).
 * @param  {integer} m If passed, the end of the range (exlusive).
 * @param  {(integer|undefined)} step steps to take between each item in the range. Defaults to 1.
 * @return {Cons} List from n to m.
 */
exports["default"] = (function (m, n, step) {
    var abs = function (n) { return (n < 0 ? -n : n); };
    var rangeHelper = function (m, n, step) {
        return m === n
            ? nil_1["default"]
            : goodStep(m, n, step)
                ? cons_1["default"](m, rangeHelper(m + step, n, step))
                : cons_1["default"](m, nil_1["default"]);
    };
    var goodStep = function (start, stop, step) {
        return abs(stop - start) > abs(stop - (start + step));
    };
    var stepHelper = function (m, step, n) {
        return typeof n === "undefined"
            ? goodStep(0, m, step) ? rangeHelper(0, m, step) : nil_1["default"]
            : goodStep(m, n, step) ? rangeHelper(m, n, step) : nil_1["default"];
    };
    return typeof step === "undefined"
        ? stepHelper(m, 1, n)
        : stepHelper(m, step, n);
});

},{"../cons/cons":16,"../cons/nil":20}],45:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Returns a new list, which is a
 * reversed copy of the list passed in.
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (L) {
    var helper = function (L, rev) {
        return isempty_1["default"](L) ? rev : helper(cdr_1["default"](L), cons_1["default"](car_1["default"](L), rev));
    };
    return helper(L, nil_1["default"]);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],46:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var length_1 = require("./length");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a list, returns a new list 'slice'.
 * If n is not passed in, the slice will be from m to
 * the end of the original list. If n is passed in,
 * then the slice will be from m to n. Invalid slices
 * (e.g. where m is larger than n) will return nil.
 * @param  {Cons} L
 * @param  {integer} m
 * @param  {(integer|undefined)} n
 * @return {Cons}
 */
exports["default"] = (function (L, m, n) {
    var sliceHelper = function (L, m, n, current) {
        return current === n || m >= n
            ? nil_1["default"]
            : isempty_1["default"](L)
                ? L
                : current >= m
                    ? cons_1["default"](car_1["default"](L), sliceHelper(cdr_1["default"](L), m, n, current + 1))
                    : sliceHelper(cdr_1["default"](L), m, n, current + 1);
    };
    return typeof n === "undefined"
        ? sliceHelper(L, m, length_1["default"](L), 0)
        : sliceHelper(L, m, n, 0);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20,"./length":38}],47:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
/**
 * Returns true if some element in the list passes the
 * test implemented by the provided callback function.
 * The callback function is passed the current value
 * and the current index in the list.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {boolean}
 */
exports["default"] = (function (fn, L) {
    var someHelper = function (fn, idx, L) {
        return isempty_1["default"](L)
            ? false
            : fn(car_1["default"](L), idx) ? true : someHelper(fn, idx + 1, cdr_1["default"](L));
    };
    return someHelper(fn, 0, L);
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18}],48:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var length_1 = require("./length");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given a list, returns a new, sorted list.
 * Optionally, a custom comparison function can be passed.
 * By default, ascending sort if performed.
 * @param  {Function} fn
 * @param  {Cons} L
 * @return {Cons}
 */
exports["default"] = (function (fn, L) {
    var merge = function (L1, L2, fn) {
        return isempty_1["default"](L1)
            ? L2
            : isempty_1["default"](L2)
                ? L1
                : fn(car_1["default"](L1), car_1["default"](L2))
                    ? cons_1["default"](car_1["default"](L1), merge(cdr_1["default"](L1), L2, fn))
                    : cons_1["default"](car_1["default"](L2), merge(L1, cdr_1["default"](L2), fn));
    };
    var split = function (L, lo, hi) {
        var splitHelper = function (L, lo, hi, curr) {
            return curr < lo
                ? splitHelper(cdr_1["default"](L), lo, hi, curr + 1)
                : curr === hi
                    ? nil_1["default"]
                    : cons_1["default"](car_1["default"](L), splitHelper(cdr_1["default"](L), lo, hi, curr + 1));
        };
        return splitHelper(L, lo, hi, 0);
    };
    var msort = function (L, fn, len) {
        return isempty_1["default"](L) || isempty_1["default"](cdr_1["default"](L))
            ? L
            : merge(msort(split(L, 0, Math.floor(len / 2)), fn, Math.floor(len / 2)), msort(split(L, Math.floor(len / 2), len), fn, len - Math.floor(len / 2)), fn);
    };
    return msort(L, fn, length_1["default"](L));
});

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20,"./length":38}],49:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var cons_1 = require("../cons/cons");
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
/**
 * Given two cons lists, returns a new cons list composed of
 * cons pairs consisting of positionally determined elements
 * from each of the given lists. The resulting list will only contain
 * as many elements as contained in the shorter of the two lists.
 * @param  {Cons} L1
 * @param  {Cons} L2
 * @return {Cons}
 */
var zip = function (L1, L2) {
    return isempty_1["default"](L1) || isempty_1["default"](L2)
        ? nil_1["default"]
        : isempty_1["default"](cdr_1["default"](L1)) || isempty_1["default"](cdr_1["default"](L2))
            ? cons_1["default"](cons_1["default"](car_1["default"](L1), car_1["default"](L2)), nil_1["default"])
            : cons_1["default"](cons_1["default"](car_1["default"](L1), car_1["default"](L2)), zip(cdr_1["default"](L1), cdr_1["default"](L2)));
};
exports["default"] = zip;

},{"../cons/car":14,"../cons/cdr":15,"../cons/cons":16,"../cons/isempty":18,"../cons/nil":20}],50:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var _cons = require("./cons/main");
exports.cons = _cons;
// helpers
var args_1 = require("./helpers/args");
exports.helpers = { args: args_1["default"] };
// list
var list_1 = require("./list/list");
var concat_1 = require("./list/concat");
var contains_1 = require("./list/contains");
var dequeue_1 = require("./list/dequeue");
var enqueue_1 = require("./list/enqueue");
var every_1 = require("./list/every");
var filter_1 = require("./list/filter");
var flatten_1 = require("./list/flatten");
var foldl_1 = require("./list/foldl");
var foldr_1 = require("./list/foldr");
var get_1 = require("./list/get");
var length_1 = require("./list/length");
var map_1 = require("./list/map");
var peek_1 = require("./list/peek");
var pop_1 = require("./list/pop");
var push_1 = require("./list/push");
var range_1 = require("./list/range");
var reverse_1 = require("./list/reverse");
var slice_1 = require("./list/slice");
var some_1 = require("./list/some");
var sort_1 = require("./list/sort");
var zip_1 = require("./list/zip");
exports.list = {
    concat: concat_1["default"],
    contains: contains_1["default"],
    dequeue: dequeue_1["default"],
    enqueue: enqueue_1["default"],
    every: every_1["default"],
    filter: filter_1["default"],
    flatten: flatten_1["default"],
    foldl: foldl_1["default"],
    foldr: foldr_1["default"],
    get: get_1["default"],
    length: length_1["default"],
    list: list_1["default"],
    map: map_1["default"],
    peek: peek_1["default"],
    pop: pop_1["default"],
    push: push_1["default"],
    range: range_1["default"],
    reverse: reverse_1["default"],
    slice: slice_1["default"],
    some: some_1["default"],
    sort: sort_1["default"],
    zip: zip_1["default"]
};
// alist
var alist_1 = require("./alist/alist");
var equal_1 = require("./alist/equal");
var get_2 = require("./alist/get");
var map_2 = require("./alist/map");
var print_1 = require("./alist/print");
var put_1 = require("./alist/put");
exports.alist = {
    alist: alist_1["default"],
    alistMap: map_2["default"],
    alistPrint: print_1["default"],
    equal: equal_1["default"],
    get: get_2["default"],
    put: put_1["default"]
};
// fun
var apply_1 = require("./fun/apply");
var compose_1 = require("./fun/compose");
var curry_1 = require("./fun/curry");
var Y_1 = require("./fun/Y");
exports.fun = {
    apply: apply_1["default"],
    compose: compose_1["default"],
    curry: curry_1["default"],
    Y: Y_1["default"]
};
var getTrie_1 = require("./trie/getTrie");
var putTrie_1 = require("./trie/putTrie");
exports.trie = {
    getTrie: getTrie_1["default"],
    putTrie: putTrie_1["default"]
};

},{"./alist/alist":7,"./alist/equal":8,"./alist/get":9,"./alist/map":10,"./alist/print":11,"./alist/put":12,"./cons/main":19,"./fun/Y":23,"./fun/apply":24,"./fun/compose":25,"./fun/curry":26,"./helpers/args":27,"./list/concat":28,"./list/contains":29,"./list/dequeue":30,"./list/enqueue":31,"./list/every":32,"./list/filter":33,"./list/flatten":34,"./list/foldl":35,"./list/foldr":36,"./list/get":37,"./list/length":38,"./list/list":39,"./list/map":40,"./list/peek":41,"./list/pop":42,"./list/push":43,"./list/range":44,"./list/reverse":45,"./list/slice":46,"./list/some":47,"./list/sort":48,"./list/zip":49,"./trie/getTrie":51,"./trie/putTrie":52}],51:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var car_1 = require("../cons/car");
var cdr_1 = require("../cons/cdr");
var flatten_1 = require("../list/flatten");
var get_1 = require("../alist/get");
var map_1 = require("../alist/map");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
exports["default"] = (function (T, str) {
    var getLeaves = function (T, list) {
        return isempty_1["default"](T)
            ? list
            : map_1["default"](function (key, val) { return (key === "_value" ? val : getLeaves(val, list)); }, T);
    };
    var descendToNode = function (T, word) {
        return isempty_1["default"](T)
            ? nil_1["default"]
            : isempty_1["default"](word)
                ? nil_1["default"]
                : isempty_1["default"](cdr_1["default"](word))
                    ? get_1["default"](car_1["default"](word), T)
                    : descendToNode(get_1["default"](car_1["default"](word), T), cdr_1["default"](word));
    };
    return flatten_1["default"](getLeaves(descendToNode(T, str), nil_1["default"]));
});

},{"../alist/get":9,"../alist/map":10,"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18,"../cons/nil":20,"../list/flatten":34}],52:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
var print_1 = require("../cons/print");
var concat_1 = require("../list/concat");
var list_1 = require("../list/list");
var cdr_1 = require("../cons/cdr");
var alist_1 = require("../alist/alist");
var car_1 = require("../cons/car");
var get_1 = require("../alist/get");
var put_1 = require("../alist/put");
var push_1 = require("../list/push");
var isempty_1 = require("../cons/isempty");
var nil_1 = require("../cons/nil");
exports["default"] = (function (T, name, namespace) {
    var stringifyName = function (name, namespace) {
        return print_1["default"](concat_1["default"](concat_1["default"](namespace, list_1["default"](".")), name), {
            prefix: "",
            suffix: "",
            separator: ""
        });
    };
    var helper = function (T, name, namespace, fullName) {
        return isempty_1["default"](cdr_1["default"](name))
            ? isempty_1["default"](T)
                ? alist_1["default"](car_1["default"](name), alist_1["default"]("_value", list_1["default"](stringifyName(fullName, namespace))))
                : isempty_1["default"](get_1["default"](car_1["default"](name), T))
                    ? put_1["default"](car_1["default"](name), alist_1["default"]("_value", list_1["default"](stringifyName(fullName, namespace))), T)
                    : put_1["default"](car_1["default"](name), put_1["default"]("_value", push_1["default"](stringifyName(fullName, namespace), get_1["default"]("_value", get_1["default"](car_1["default"](name), T))), get_1["default"](car_1["default"](name), T)), T)
            : isempty_1["default"](T)
                ? alist_1["default"](car_1["default"](name), helper(nil_1["default"], cdr_1["default"](name), namespace, fullName))
                : isempty_1["default"](get_1["default"](car_1["default"](name), T))
                    ? put_1["default"](car_1["default"](name), helper(nil_1["default"], cdr_1["default"](name), namespace, fullName), T)
                    : put_1["default"](car_1["default"](name), helper(get_1["default"](car_1["default"](name), T), cdr_1["default"](name), namespace, fullName), T);
    };
    return isempty_1["default"](name) ? T : helper(T, name, namespace, name);
});

},{"../alist/alist":7,"../alist/get":9,"../alist/put":12,"../cons/car":14,"../cons/cdr":15,"../cons/isempty":18,"../cons/nil":20,"../cons/print":22,"../list/concat":28,"../list/list":39,"../list/push":43}],53:[function(require,module,exports){
// WHAT TO DO WITH EXTRA BYTES
// 1. OOB checks for mouse
// 2. curl
// 3. different draw method
// 4. black background (25 bytes)
// 5. better drawing (tone down alpha)
// 6. More loops per draw (would need extra count variable and if statement)
// 7. Fullscreen drawing
// 8. Bouceback
// These are givens for the contest, but it helps to have
// them here so Google closure doesn't use the names

function JS1K(){
    var a = document.getElementsByTagName('canvas')[0];
    var b = document.body;
    var c = a.getContext("2d");
    var d = function(e){ return function(){ e.parentNode.removeChild(e); }; }(a);
    var Y=600;Z=99;
    with(Math)S=sqrt,P=pow,F=floor,A=abs;
    var lattice_dim = 99; // lattice dimensions. 99 saves me 1 byte vs 100. I'm seriously that desperate 
    var lattice_sq = lattice_dim*lattice_dim; // total # of nodes
    var lattice=[];
    var x, x_pos, y_pos, d; // loop variables
    var eq = []; // Instead of equilibrium() returning an array, we'll just use this one over and over again and hope we don't forget to initialize it before every use
    var init=1; // This is only used once. Is there another variable that could be used instead?
    //var count=0;
    var ND = [0,0,1,0,0,-1,-1,0,0,1,1,-1,-1,-1,-1,1,1,1];
    var px_per_node = 6;
    I = c.createImageData(600, 600);
    var mousex = 0;
    var mousey = 0;
    function equilibrium(ux, uy, rho) {
        // D = loop variable
        // E = node_distribution index
        // G = velocity * node direction... or something
        // B = node weight
        eq = [];
        for (D = 0; D < 9; D++) {
            // Calculate equilibrium value
            G = (ND[D*2] * ux) + (ND[D*2+1] * uy);
            // Find the node weight. I think this is more succinct than keeping 
            // an array of these values
            if (D) {
                B = (D<5)?1/9:1/36;
            } else {
                B = 4/9;
            }
            // Equilibrium equation
            eq[D] = B * rho * (1 + 3*(G) + 4.5*(G*G) - 1.5*(ux * ux + uy * uy));
        }
    }
    function stream(){
        // Q = loop variable
        // K = loop variable
        // H = node directions index
        // N = newx
        // R = newy
        for (Q = 0; Q < lattice_sq; Q++) {
            y_pos = F(Q/lattice_dim);
            x_pos = Q%lattice_dim;
            for (K = 0; K < 9; K++) {
                // Multiply node direction by one to coerce to int
                N = ND[K*2] + x_pos;
                R = ND[K*2+1] + y_pos;
                // Check if new node is in the lattice
                // Cheat a little, though (N>0 instead of N>=0). For the bytes.
                if (N > 0 && N < lattice_dim &&
                    R > 0 && R < lattice_dim) {
                    lattice[N+R*600].s[K] = lattice[x_pos+y_pos*600].d[K];
                }
            }
        }
    }
    function collide(){
        // Collide is going to draw and initialize, too, because LOL, why not?
        // i = loop variable
        // I = Image
        // L = imagedata
        // M = node
        // C = dist
        // T = d1
        // U = d2
        // W = rho
        // V = index
        L = I.data;
        for (x = 0; x < lattice_sq; x++) {
            y_pos = F(x/lattice_dim);
            x_pos = x%lattice_dim;
            if (init) {
                // Inititialize lattice
                // Distribution, stream, density (rho), x velocity, y velocity
                equilibrium(0,0,1);
                lattice[x_pos+y_pos*600] = {d:[],s:eq,r:1,x:0,y:0};
            }
            M = lattice[x_pos+y_pos*600];
            // Copy over values from streaming phase.
            C = M.s;
            // Calculate macroscopic density (rho) and velocity (ux, uy)
            // and update values stored in node.
            // TODO: Can this be compacted any more?
            T = C[1] + C[5] + C[8];
            U = C[3] + C[6] + C[7];
            W = T + U + C[0] + C[2] + C[4];
            M.x = (T - U) / W;
            M.y = (C[4] + C[7] + C[8] - C[2] - C[5] - C[6]) / W;
            // Update values stored in node.
            M.r = W;
            // Set node equilibrium for each velocity
            equilibrium(M.x, M.y, W);
            for (i = 0; i < 9; i++) {
                M.d[i] = C[i] + (1 * (eq[i] - C[i]));
            }
            // DRAW
            //if (count%5==0) {
            for (i = 0; i < 36; i++) {
                V = 4*(i%6+6*x_pos+600*(F(i/6)+6*y_pos));
                q = lattice[x_pos+y_pos*600];
                // Surprisingly, floor is not required here.
                // SPEED
                L[V+1] = S(P(q.x, 2) + P(q.y, 2))*4E3;
                // DENSITY
                //L[V+1] = F((255 - (255 / A(q.r)))*60)
                L[V+3] = Y; // Setting this way above the max of 255. 2 bytes is 2 bytes.
            }
            //}
        }
        //count++;
        c.putImageData(I, 0, 0);
        init=0;
    }

    function mousemove(e){
        // Scale from canvas coordinates to lattice coordinates
        // O = radius around mouse
        // J = node
        // t = new mouse x position
        // u = new mouse y position
        // v = delta x
        // w = delta y
        t = e.layerX;
        u = e.layerY;
        v = t-mousex;
        w = u-mousey;
        for (O = 0; O < 36; O++) {
            g = F(t / px_per_node + O/6);
            h = F(u / px_per_node) + O%6;
            // So... this bounds check is definitely the right thing to do,
            // and it makes to program look and act better, but... it puts us
            // over the top. I'm not sure if this can be made up elsewhere, either.
            if (g>0&&g<98&&h>0&&h<98) {
                J = lattice[g+h*600];
                // x&&x/abs(v) == sign of x
                // Note to future self: It's pretty important that we take the 
                // absolute value here. You might think you can save 12 bytes
                // by removing it, but I assure you it won't work.
                equilibrium(v&&v/A(v)/20, w&&w/A(w)/20, J.r);
                //equilibrium(.002*v, .002*w, J.r);
                // This is enticing, but it can cause major issues
                // if the user exits the canvas and renters somewhere
                // far from where they exited.
                J.s = eq;
            }
        }
        mousex=t;
        mousey=u;
    }
    a.onmousemove=mousemove;
    (function update(){
        collide();
        stream();
        requestAnimationFrame(update);
    })();
}

module.exports = JS1K;

},{}],54:[function(require,module,exports){
var asciify = require('asciify');

function videoascii(options){
    var canvas = options.canvas;
    var ctx = canvas.getContext('2d');
    var videoSrc = options.videoSrc;
    var video = document.createElement('video');
    var output_width = options.output_width;
    var autoplay = (options.autoplay === undefined) ? false : options.autoplay;
    var font_size = (options.font_size === undefined) ? 12 : options.font_size;
    var monochrome = (options.monochrome === undefined) ? true : options.monochrome;
    var rafId = null;

    var width, height, image_data, aspect_ratio, output_height;

    // Video frames are drawn to offscreen buffer canvas
    // in order to get pixel data into ImageData array.
    var buffer_canvas = document.createElement('canvas');
    var buffer_ctx = buffer_canvas.getContext('2d');
    var ascii = asciify(
            0,
            0,
            0,
            0,
            monochrome,
            ctx,
            10,
            0.001
        );
    video.addEventListener('canplay', function(){
        resize(output_width);
        ctx.font = font_size + "pt Courier";
        image_data = buffer_ctx.getImageData(0, 0, width, height);

        if (autoplay){
            start();
        }
    });

    video.src = window.URL.createObjectURL(videoSrc);

    function update(){
        if (!video.paused && !video.ended){
            drawFrame();
            rafId = requestAnimationFrame(update);
        }
    }

    function drawFrame(){
        buffer_ctx.drawImage(video, 0, 0);
        image_data = buffer_ctx.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, output_width, output_height);
        ascii.draw(image_data.data);
    }

    function start(){
        video.play();
        rafId = requestAnimationFrame(update);
    }
    function pause(){
        video.pause();
        cancelAnimationFrame(rafId);
    }
    function resize(output_width){
        // Setting width/height resets the context, so these go first.
        width = Math.floor(video.videoWidth);
        height = Math.floor(video.videoHeight);
        buffer_canvas.width = width;
        buffer_canvas.height = height;

        aspect_ratio = width / height;
        // Set output canvas to same aspect ratio as video
        // If no output width is specified, output canvas will
        // be same size as video.
        output_width = (output_width === undefined) ? width : output_width;
        output_height = Math.floor(output_width / aspect_ratio);
        canvas.width = output_width;
        canvas.height = output_height;
        ascii.resize(width, height, output_width, output_height);
    }
    function restart(){
        video.currentTime = 0;
    }
    function toggleMonochrome(){
        ascii.toggleMonochrome();
    }

    return {
        start: start,
        pause: pause,
        resize: resize,
        restart: restart,
        toggleMonochrome: toggleMonochrome,
    };
}

module.exports = videoascii;
},{"asciify":2}],55:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.wireframe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var hslToRgb, rgbToHsl, parseColor, cache;
/**
 * A color with both rgb and hsl representations.
 * @class Colour
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 */
function Colour(color, alpha){
    var hsl, rgb;
    var parsed_color = {};
    if (typeof color === 'string'){
        color = color.toLowerCase();
        if (color in cache){
            parsed_color = cache[color];
        } else {
            parsed_color = parseColor(color);
            cache[color] = parsed_color;
        }
        rgb = parsed_color;
        hsl = rgbToHsl(parsed_color.r, parsed_color.g, parsed_color.b);
        alpha = parsed_color.a || alpha || 1;
    } else if ('r' in color){
        rgb = color;
        hsl = rgbToHsl(color.r, color.g, color.b);
        alpha = hsl.a || alpha || 1;
    } else if ('h' in color){
        hsl = color;
        rgb = hslToRgb(color.h, color.s, color.l);
        alpha = rgb.a || alpha || 1;
    }
    this.rgb = {'r': rgb.r, 'g': rgb.g, 'b': rgb.b};
    this.hsl = {'h': hsl.h, 's': hsl.s, 'l': hsl.l};
    this.alpha = alpha;
    // Precompute and store string representation of color.
    this._color_string = this._toString();
}
/**
 * Lighten a color by the given percentage.

 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.lighten = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l + percent;
    if (lum > 100){
        lum = 100;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Darken a color by the given percentage.
 * @method
 * @param  {number} percent
 * @return {Colour}
 */
Colour.prototype.darken = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l - percent;
    if (lum < 0){
        lum = 0;
    }
    return new Colour({'h':hsl.h, 's':hsl.s, 'l':lum}, this.alpha);
};
/**
 * Return a string representation of color in #hex form.
 * @method
 * @return {string}
 */
Colour.prototype.toString = function() {
    return this._color_string;
};

Colour.prototype._toString = function(){
    var r = this.rgb.r.toString(16);
    var g = this.rgb.g.toString(16);
    var b = this.rgb.b.toString(16);
    // Zero fill
    if (r.length === 1){
        r = "0" + r;
    }
    if (g.length === 1){
        g = "0" + g;
    }
    if (b.length === 1){
        b = "0" + b;
    }
    return "#" + r + g + b;
};
/**
* @param {number} h Hue
* @param {number} s Saturation
* @param {number} l Luminance
* @return {{r: number, g: number, b: number}}
*/
hslToRgb = function(h, s, l){
    function _v(m1, m2, hue){
        hue = hue;
        if (hue < 0){hue+=1;}
        if (hue > 1){hue-=1;}
        if (hue < (1/6)){
            return m1 + (m2-m1)*hue*6;
        }
        if (hue < 0.5){
            return m2;
        }
        if (hue < (2/3)){
            return m1 + (m2-m1)*((2/3)-hue)*6;
        }
        return m1;
    }
    var m2;
    var fraction_l = (l/100);
    var fraction_s = (s/100);
    if (s === 0){
        var gray = fraction_l*255;
        return {'r': gray, 'g': gray, 'b': gray};
    }
    if (l <= 50){
        m2 = fraction_l * (1+fraction_s);
    }
    else{
        m2 = fraction_l+fraction_s-(fraction_l*fraction_s);
    }
    var m1 = 2*fraction_l - m2;
    h = h / 360;
    return {'r': Math.round(_v(m1, m2, h+(1/3))*255), 'g': Math.round(_v(m1, m2, h)*255), 'b': Math.round(_v(m1, m2, h-(1/3))*255)};
};
/**
 * @param  {number} r Red
 * @param  {number} g Green
 * @param  {number} b Blue
 * @return {{h: number, s: number, l: number}}
 */
rgbToHsl = function(r, g, b){
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var maxc = Math.max(r, g, b);
    var minc = Math.min(r, g, b);
    var l = Math.round(((minc+maxc)/2)*100);
    if (l > 100) {l = 100;}
    if (l < 0) {l = 0;}
    var h, s;
    if (minc === maxc){
        return {'h': 0, 's': 0, 'l': l};
    }
    if (l <= 50){
        s = (maxc-minc) / (maxc+minc);
    }
    else{
        s = (maxc-minc) / (2-maxc-minc);
    }
    var rc = (maxc-r) / (maxc-minc);
    var gc = (maxc-g) / (maxc-minc);
    var bc = (maxc-b) / (maxc-minc);
    if (r === maxc){
        h = bc-gc;
    }
    else if (g === maxc){
        h = 2+rc-bc;
    }
    else{
        h = 4+gc-rc;
    }
    h = (h/6) % 1;
    if (h < 0){h+=1;}
    h = Math.round(h*360);
    s = Math.round(s*100);
    if (h > 360) {h = 360;}
    if (h < 0) {h = 0;}
    if (s > 100) {s = 100;}
    if (s < 0) {s = 0;}
    return {'h': h, 's': s, 'l': l};
};
// Clamp x and y values to min and max
function clamp(x, min, max){
    if (x < min){x = min;}
    else if (x > max){x = max;}
    return x;
}
/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColourError} If illegal color value is passed.
 */
parseColor = function(color){
    var red, green, blue, hue, sat, lum;
    var alpha = 1;
    var match;
    var error = false;
    var pref = color.substr(0,3); // Three letter color prefix
    // HSL(a)
    if (pref === 'hsl'){
        var hsl_regex = /hsla?\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = hsl_regex.exec(color);
        if (match){
            hue = parseInt(match[1], 10);
            sat = parseInt(match[2], 10);
            lum = parseInt(match[3], 10);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
            hue = Math.abs(hue % 360);
            sat = clamp(sat, 0, 100);
            lum = clamp(lum, 0, 100);
            var parsed = hslToRgb(hue, sat, lum);
            red = parsed.r;
            green = parsed.g;
            blue = parsed.b;
        } else {
            error = true;
        }
    // RGB(a)
    } else if (pref === 'rgb'){
        var rgb_regex = /rgba?\((-?\d+%?)\s*,\s*(-?\d+%?)\s*,\s*(-?\d+%?)(,\s*(-?\d+(\.\d+)?)\s*)?\)/g;
        match = rgb_regex.exec(color);
        if (match){
            var m1 = match[1];
            var m2 = match[2];
            var m3 = match[3];
            red = parseInt(match[1], 10);
            green = parseInt(match[2], 10);
            blue = parseInt(match[3], 10);
            // Check if using rgb(a) percentage values.
            if (m1[m1.length-1] === '%' ||
                m2[m2.length-1] === '%' ||
                m3[m3.length-1] === '%'){
                // All values must be percetage.
                if (m1[m1.length-1] === '%' &&
                    m2[m2.length-1] === '%' &&
                    m3[m3.length-1] === '%'){
                    // Convert to 255
                    red = Math.floor(red/100 * 255);
                    green = Math.floor(green/100 * 255);
                    blue = Math.floor(blue/100 * 255);
                } else {
                   error = true; 
                }
            }
            red = clamp(red, 0, 255);
            green = clamp(green, 0, 255);
            blue = clamp(blue, 0, 255);
            if (color[3] === 'a'){
                alpha = parseFloat(match[5]);
            }
        } else {
            error = true;
        }
    // HEX
    } else if (color[0] === '#'){
        var hex = color.substr(1);
        if (hex.length === 3){
            red = parseInt(hex[0]+hex[0], 16);
            green = parseInt(hex[1]+hex[1], 16);
            blue = parseInt(hex[2]+hex[2], 16);
        } else if (hex.length === 6){
            red = parseInt(hex[0]+hex[1], 16);
            green = parseInt(hex[2]+hex[3], 16);
            blue = parseInt(hex[4]+hex[5], 16);
        } else {
            error = true;
        }
    } else {
        error = true;
    }

    alpha = clamp(alpha, 0, 1);

    if (error){
        throw "ColourError: Something went wrong. Perhaps " + color + " is not a legal CSS color value";
    }
    return {'r': red, 'g': green, 'b': blue, 'a': alpha};
};
// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
cache = {
    "black": {"r": 0, "g": 0, "b": 0, "h": 0, "s": 0, "l": 0},
    "silver": {"r": 192, "g": 192, "b": 192, "h": 0, "s": 0, "l": 75},
    "gray": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "white": {"r": 255, "g": 255, "b": 255, "h": 0, "s": 0, "l": 100},
    "maroon": {"r": 128, "g": 0, "b": 0, "h": 0, "s": 100, "l": 25},
    "red": {"r": 255, "g": 0, "b": 0, "h": 0, "s": 100, "l": 50},
    "purple": {"r": 128, "g": 0, "b": 128, "h": 300, "s": 100, "l": 25},
    "fuchsia": {"r": 255, "g": 0, "b": 255, "h": 300, "s": 100, "l": 50},
    "green": {"r": 0, "g": 128, "b": 0, "h": 120, "s": 100, "l": 25},
    "lime": {"r": 0, "g": 255, "b": 0, "h": 120, "s": 100, "l": 50},
    "olive": {"r": 128, "g": 128, "b": 0, "h": 60, "s": 100, "l": 25},
    "yellow": {"r": 255, "g": 255, "b": 0, "h": 60, "s": 100, "l": 50},
    "navy": {"r": 0, "g": 0, "b": 128, "h": 240, "s": 100, "l": 25},
    "blue": {"r": 0, "g": 0, "b": 255, "h": 240, "s": 100, "l": 50},
    "teal": {"r": 0, "g": 128, "b": 128, "h": 180, "s": 100, "l": 25},
    "aqua": {"r": 0, "g": 255, "b": 255, "h": 180, "s": 100, "l": 50},
    "orange": {"r": 255, "g": 165, "b": 0, "h": 39, "s": 100, "l": 50},
    "aliceblue": {"r": 240, "g": 248, "b": 255, "h": 208, "s": 100, "l": 97},
    "antiquewhite": {"r": 250, "g": 235, "b": 215, "h": 34, "s": 78, "l": 91},
    "aquamarine": {"r": 127, "g": 255, "b": 212, "h": 160, "s": 100, "l": 75},
    "azure": {"r": 240, "g": 255, "b": 255, "h": 180, "s": 100, "l": 97},
    "beige": {"r": 245, "g": 245, "b": 220, "h": 60, "s": 56, "l": 91},
    "bisque": {"r": 255, "g": 228, "b": 196, "h": 33, "s": 100, "l": 88},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205, "h": 36, "s": 100, "l": 90},
    "blueviolet": {"r": 138, "g": 43, "b": 226, "h": 271, "s": 76, "l": 53},
    "brown": {"r": 165, "g": 42, "b": 42, "h": 0, "s": 59, "l": 41},
    "burlywood": {"r": 222, "g": 184, "b": 135, "h": 34, "s": 57, "l": 70},
    "cadetblue": {"r": 95, "g": 158, "b": 160, "h": 182, "s": 25, "l": 50},
    "chartreuse": {"r": 127, "g": 255, "b": 0, "h": 90, "s": 100, "l": 50},
    "chocolate": {"r": 210, "g": 105, "b": 30, "h": 25, "s": 75, "l": 47},
    "coral": {"r": 255, "g": 127, "b": 80, "h": 16, "s": 100, "l": 66},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237, "h": 219, "s": 79, "l": 66},
    "cornsilk": {"r": 255, "g": 248, "b": 220, "h": 48, "s": 100, "l": 93},
    "cyan": {"r": 0,"g": 255,"b": 255, "h": 180,"s": 100,"l": 97},
    "crimson": {"r": 220, "g": 20, "b": 60, "h": 348, "s": 83, "l": 47},
    "darkblue": {"r": 0, "g": 0, "b": 139, "h": 240, "s": 100, "l": 27},
    "darkcyan": {"r": 0, "g": 139, "b": 139, "h": 180, "s": 100, "l": 27},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11, "h": 43, "s": 89, "l": 38},
    "darkgray": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkgreen": {"r": 0, "g": 100, "b": 0, "h": 120, "s": 100, "l": 20},
    "darkgrey": {"r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 66},
    "darkkhaki": {"r": 189, "g": 183, "b": 107, "h": 56, "s": 38, "l": 58},
    "darkmagenta": {"r": 139, "g": 0, "b": 139, "h": 300, "s": 100, "l": 27},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47, "h": 82, "s": 39, "l": 30},
    "darkorange": {"r": 255, "g": 140, "b": 0, "h": 33, "s": 100, "l": 50},
    "darkorchid": {"r": 153, "g": 50, "b": 204, "h": 280, "s": 61, "l": 50},
    "darkred": {"r": 139, "g": 0, "b": 0, "h": 0, "s": 100, "l": 27},
    "darksalmon": {"r": 233, "g": 150, "b": 122, "h": 15, "s": 72, "l": 70},
    "darkseagreen": {"r": 143, "g": 188, "b": 143, "h": 120, "s": 25, "l": 65},
    "darkslateblue": {"r": 72, "g": 61, "b": 139, "h": 248, "s": 39, "l": 39},
    "darkslategray": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkslategrey": {"r": 47, "g": 79, "b": 79, "h": 180, "s": 25, "l": 25},
    "darkturquoise": {"r": 0, "g": 206, "b": 209, "h": 181, "s": 100, "l": 41},
    "darkviolet": {"r": 148, "g": 0, "b": 211, "h": 282, "s": 100, "l": 41},
    "deeppink": {"r": 255, "g": 20, "b": 147, "h": 328, "s": 100, "l": 54},
    "deepskyblue": {"r": 0, "g": 191, "b": 255, "h": 195, "s": 100, "l": 50},
    "dimgray": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dimgrey": {"r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 41},
    "dodgerblue": {"r": 30, "g": 144, "b": 255, "h": 210, "s": 100, "l": 56},
    "firebrick": {"r": 178, "g": 34, "b": 34, "h": 0, "s": 68, "l": 42},
    "floralwhite": {"r": 255, "g": 250, "b": 240, "h": 40, "s": 100, "l": 97},
    "forestgreen": {"r": 34, "g": 139, "b": 34, "h": 120, "s": 61, "l": 34},
    "gainsboro": {"r": 220, "g": 220, "b": 220, "h": 0, "s": 0, "l": 86},
    "ghostwhite": {"r": 248, "g": 248, "b": 255, "h": 240, "s": 100, "l": 99},
    "gold": {"r": 255, "g": 215, "b": 0, "h": 51, "s": 100, "l": 50},
    "goldenrod": {"r": 218, "g": 165, "b": 32, "h": 43, "s": 74, "l": 49},
    "greenyellow": {"r": 173, "g": 255, "b": 47, "h": 84, "s": 100, "l": 59},
    "grey": {"r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 50},
    "honeydew": {"r": 240, "g": 255, "b": 240, "h": 120, "s": 100, "l": 97},
    "hotpink": {"r": 255, "g": 105, "b": 180, "h": 330, "s": 100, "l": 71},
    "indianred": {"r": 205, "g": 92, "b": 92, "h": 0, "s": 53, "l": 58},
    "indigo": {"r": 75, "g": 0, "b": 130, "h": 275, "s": 100, "l": 25},
    "ivory": {"r": 255, "g": 255, "b": 240, "h": 60, "s": 100, "l": 97},
    "khaki": {"r": 240, "g": 230, "b": 140, "h": 54, "s": 77, "l": 75},
    "lavender": {"r": 230, "g": 230, "b": 250, "h": 240, "s": 67, "l": 94},
    "lavenderblush": {"r": 255, "g": 240, "b": 245, "h": 340, "s": 100, "l": 97},
    "lawngreen": {"r": 124, "g": 252, "b": 0, "h": 90, "s": 100, "l": 49},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205, "h": 54, "s": 100, "l": 90},
    "lightblue": {"r": 173, "g": 216, "b": 230, "h": 195, "s": 53, "l": 79},
    "lightcoral": {"r": 240, "g": 128, "b": 128, "h": 0, "s": 79, "l": 72},
    "lightcyan": {"r": 224, "g": 255, "b": 255, "h": 180, "s": 100, "l": 94},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210, "h": 60, "s": 80, "l": 90},
    "lightgray": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightgreen": {"r": 144, "g": 238, "b": 144, "h": 120, "s": 73, "l": 75},
    "lightgrey": {"r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 83},
    "lightpink": {"r": 255, "g": 182, "b": 193, "h": 351, "s": 100, "l": 86},
    "lightsalmon": {"r": 255, "g": 160, "b": 122, "h": 17, "s": 100, "l": 74},
    "lightseagreen": {"r": 32, "g": 178, "b": 170, "h": 177, "s": 70, "l": 41},
    "lightskyblue": {"r": 135, "g": 206, "b": 250, "h": 203, "s": 92, "l": 75},
    "lightslategray": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightslategrey": {"r": 119, "g": 136, "b": 153, "h": 210, "s": 14, "l": 53},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222, "h": 214, "s": 41, "l": 78},
    "lightyellow": {"r": 255, "g": 255, "b": 224, "h": 60, "s": 100, "l": 94},
    "limegreen": {"r": 50, "g": 205, "b": 50, "h": 120, "s": 61, "l": 50},
    "linen": {"r": 250, "g": 240, "b": 230, "h": 30, "s": 67, "l": 94},
    "magenta": {"r": 255,"g": 0,"b": 255, "h": 17,"s": 100,"l": 74},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170, "h": 160, "s": 51, "l": 60},
    "mediumblue": {"r": 0, "g": 0, "b": 205, "h": 240, "s": 100, "l": 40},
    "mediumorchid": {"r": 186, "g": 85, "b": 211, "h": 288, "s": 59, "l": 58},
    "mediumpurple": {"r": 147, "g": 112, "b": 219, "h": 260, "s": 60, "l": 65},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113, "h": 147, "s": 50, "l": 47},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238, "h": 249, "s": 80, "l": 67},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154, "h": 157, "s": 100, "l": 49},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204, "h": 178, "s": 60, "l": 55},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133, "h": 322, "s": 81, "l": 43},
    "midnightblue": {"r": 25, "g": 25, "b": 112, "h": 240, "s": 64, "l": 27},
    "mintcream": {"r": 245, "g": 255, "b": 250, "h": 150, "s": 100, "l": 98},
    "mistyrose": {"r": 255, "g": 228, "b": 225, "h": 6, "s": 100, "l": 94},
    "moccasin": {"r": 255, "g": 228, "b": 181, "h": 38, "s": 100, "l": 85},
    "navajowhite": {"r": 255, "g": 222, "b": 173, "h": 36, "s": 100, "l": 84},
    "oldlace": {"r": 253, "g": 245, "b": 230, "h": 39, "s": 85, "l": 95},
    "olivedrab": {"r": 107, "g": 142, "b": 35, "h": 80, "s": 60, "l": 35},
    "orangered": {"r": 255, "g": 69, "b": 0, "h": 16, "s": 100, "l": 50},
    "orchid": {"r": 218, "g": 112, "b": 214, "h": 302, "s": 59, "l": 65},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170, "h": 55, "s": 67, "l": 80},
    "palegreen": {"r": 152, "g": 251, "b": 152, "h": 120, "s": 93, "l": 79},
    "paleturquoise": {"r": 175, "g": 238, "b": 238, "h": 180, "s": 65, "l": 81},
    "palevioletred": {"r": 219, "g": 112, "b": 147, "h": 340, "s": 60, "l": 65},
    "papayawhip": {"r": 255, "g": 239, "b": 213, "h": 37, "s": 100, "l": 92},
    "peachpuff": {"r": 255, "g": 218, "b": 185, "h": 28, "s": 100, "l": 86},
    "peru": {"r": 205, "g": 133, "b": 63, "h": 30, "s": 59, "l": 53},
    "pink": {"r": 255, "g": 192, "b": 203, "h": 350, "s": 100, "l": 88},
    "plum": {"r": 221, "g": 160, "b": 221, "h": 300, "s": 47, "l": 75},
    "powderblue": {"r": 176, "g": 224, "b": 230, "h": 187, "s": 52, "l": 80},
    "rosybrown": {"r": 188, "g": 143, "b": 143, "h": 0, "s": 25, "l": 65},
    "royalblue": {"r": 65, "g": 105, "b": 225, "h": 225, "s": 73, "l": 57},
    "saddlebrown": {"r": 139, "g": 69, "b": 19, "h": 25, "s": 76, "l": 31},
    "salmon": {"r": 250, "g": 128, "b": 114, "h": 6, "s": 93, "l": 71},
    "sandybrown": {"r": 244, "g": 164, "b": 96, "h": 28, "s": 87, "l": 67},
    "seagreen": {"r": 46, "g": 139, "b": 87, "h": 146, "s": 50, "l": 36},
    "seashell": {"r": 255, "g": 245, "b": 238, "h": 25, "s": 100, "l": 97},
    "sienna": {"r": 160, "g": 82, "b": 45, "h": 19, "s": 56, "l": 40},
    "skyblue": {"r": 135, "g": 206, "b": 235, "h": 197, "s": 71, "l": 73},
    "slateblue": {"r": 106, "g": 90, "b": 205, "h": 248, "s": 53, "l": 58},
    "slategray": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "slategrey": {"r": 112, "g": 128, "b": 144, "h": 210, "s": 13, "l": 50},
    "snow": {"r": 255, "g": 250, "b": 250, "h": 0, "s": 100, "l": 99},
    "springgreen": {"r": 0, "g": 255, "b": 127, "h": 150, "s": 100, "l": 50},
    "steelblue": {"r": 70, "g": 130, "b": 180, "h": 207, "s": 44, "l": 49},
    "tan": {"r": 210, "g": 180, "b": 140, "h": 34, "s": 44, "l": 69},
    "thistle": {"r": 216, "g": 191, "b": 216, "h": 300, "s": 24, "l": 80},
    "tomato": {"r": 255, "g": 99, "b": 71, "h": 9, "s": 100, "l": 64},
    "turquoise": {"r": 64, "g": 224, "b": 208, "h": 174, "s": 72, "l": 56},
    "violet": {"r": 238, "g": 130, "b": 238, "h": 300, "s": 76, "l": 72},
    "wheat": {"r": 245, "g": 222, "b": 179, "h": 39, "s": 77, "l": 83},
    "whitesmoke": {"r": 245, "g": 245, "b": 245, "h": 0, "s": 0, "l": 96},
    "yellowgreen": {"r": 154, "g": 205, "b": 50, "h": 80, "s": 61, "l": 50}
};

module.exports = Colour;

},{}],2:[function(_dereq_,module,exports){
/**
 * @license
 * Copyright (c) 2014 Eben Packwood. All rights reserved.
 * MIT License
 *
 */

/** @ignore */
var Vector = _dereq_('./vector.js');
var Matrix = _dereq_('./matrix.js');

var math = Object.create(null);

math.Vector = Vector;
math.Matrix = Matrix;

module.exports = math;

},{"./matrix.js":3,"./vector.js":4}],3:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector.js');

/** 
 * 4x4 matrix.
 * @constructor
 */
function Matrix(){
    for (var i=0; i<16; i++){
        this[i] = 0;
    }
    this.length = 16;
}
/**
 * Compare matrices for equality.
 * @method
 * @param {Matrix} matrix
 * @return {boolean}
 */
Matrix.prototype.equal = function(matrix){
    for (var i = 0, len = this.length; i < len; i++){
        if (this[i] !== matrix[i]){
            return false;
        }
    }
    return true;
};
/**
 * Add matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.add = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] + matrix[i];
    }
    return new_matrix;
};
/**
 * Add matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.addLG = function(matrix, result){
    result[0] = this[0] + matrix[0];
    result[1] = this[1] + matrix[1];
    result[2] = this[2] + matrix[2];
    result[3] = this[3] + matrix[3];
    result[4] = this[4] + matrix[4];
    result[5] = this[5] + matrix[5];
    result[6] = this[6] + matrix[6];
    result[7] = this[7] + matrix[7];
    result[8] = this[8] + matrix[8];
    result[9] = this[9] + matrix[9];
    result[10] = this[10] + matrix[10];
    result[11] = this[11] + matrix[11];
    result[12] = this[12] + matrix[12];
    result[13] = this[13] + matrix[13];
    result[14] = this[14] + matrix[14];
    result[15] = this[15] + matrix[15];
    return result;
};
/**
 * Subtract matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.subtract = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] - matrix[i];
    }
    return new_matrix;
};
/**
 * Subtract matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.subtractLG = function(matrix, result){
    result[0] = this[0] - matrix[0];
    result[1] = this[1] - matrix[1];
    result[2] = this[2] - matrix[2];
    result[3] = this[3] - matrix[3];
    result[4] = this[4] - matrix[4];
    result[5] = this[5] - matrix[5];
    result[6] = this[6] - matrix[6];
    result[7] = this[7] - matrix[7];
    result[8] = this[8] - matrix[8];
    result[9] = this[9] - matrix[9];
    result[10] = this[10] - matrix[10];
    result[11] = this[11] - matrix[11];
    result[12] = this[12] - matrix[12];
    result[13] = this[13] - matrix[13];
    result[14] = this[14] - matrix[14];
    result[15] = this[15] - matrix[15];
    return result;
};
/**
 * Multiply matrix by scalar. Returns a new Matrix.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalar = function(scalar){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] * scalar;
    }
    return new_matrix;
};
/**
 * Multiply matrix by scalar. Result is assigned to result parameter.
 * @method
 * @param {number} scalar
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalarLG = function(scalar, result){
    result[0] = this[0] * scalar;
    result[1] = this[1] * scalar;
    result[2] = this[2] * scalar;
    result[3] = this[3] * scalar;
    result[4] = this[4] * scalar;
    result[5] = this[5] * scalar;
    result[6] = this[6] * scalar;
    result[7] = this[7] * scalar;
    result[8] = this[8] * scalar;
    result[9] = this[9] * scalar;
    result[10] = this[10] * scalar;
    result[11] = this[11] * scalar;
    result[12] = this[12] * scalar;
    result[13] = this[13] * scalar;
    result[14] = this[14] * scalar;
    result[15] = this[15] * scalar;
    return result;
};
/**
 * Multiply matrices. Returns a new Matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.multiply = function(matrix){
    var new_matrix = new Matrix();
    new_matrix[0] = (this[0] * matrix[0]) + (this[1] * matrix[4]) + (this[2] * matrix[8]) + (this[3] * matrix[12]);
    new_matrix[1] = (this[0] * matrix[1]) + (this[1] * matrix[5]) + (this[2] * matrix[9]) + (this[3] * matrix[13]);
    new_matrix[2] = (this[0] * matrix[2]) + (this[1] * matrix[6]) + (this[2] * matrix[10]) + (this[3] * matrix[14]);
    new_matrix[3] = (this[0] * matrix[3]) + (this[1] * matrix[7]) + (this[2] * matrix[11]) + (this[3] * matrix[15]);
    new_matrix[4] = (this[4] * matrix[0]) + (this[5] * matrix[4]) + (this[6] * matrix[8]) + (this[7] * matrix[12]);
    new_matrix[5] = (this[4] * matrix[1]) + (this[5] * matrix[5]) + (this[6] * matrix[9]) + (this[7] * matrix[13]);
    new_matrix[6] = (this[4] * matrix[2]) + (this[5] * matrix[6]) + (this[6] * matrix[10]) + (this[7] * matrix[14]);
    new_matrix[7] = (this[4] * matrix[3]) + (this[5] * matrix[7]) + (this[6] * matrix[11]) + (this[7] * matrix[15]);
    new_matrix[8] = (this[8] * matrix[0]) + (this[9] * matrix[4]) + (this[10] * matrix[8]) + (this[11] * matrix[12]);
    new_matrix[9] = (this[8] * matrix[1]) + (this[9] * matrix[5]) + (this[10] * matrix[9]) + (this[11] * matrix[13]);
    new_matrix[10] = (this[8] * matrix[2]) + (this[9] * matrix[6]) + (this[10] * matrix[10]) + (this[11] * matrix[14]);
    new_matrix[11] = (this[8] * matrix[3]) + (this[9] * matrix[7]) + (this[10] * matrix[11]) + (this[11] * matrix[15]);
    new_matrix[12] = (this[12] * matrix[0]) + (this[13] * matrix[4]) + (this[14] * matrix[8]) + (this[15] * matrix[12]);
    new_matrix[13] = (this[12] * matrix[1]) + (this[13] * matrix[5]) + (this[14] * matrix[9]) + (this[15] * matrix[13]);
    new_matrix[14] = (this[12] * matrix[2]) + (this[13] * matrix[6]) + (this[14] * matrix[10]) + (this[15] * matrix[14]);
    new_matrix[15] = (this[12] * matrix[3]) + (this[13] * matrix[7]) + (this[14] * matrix[11]) + (this[15] * matrix[15]);
    return new_matrix;
};
/**
 * Multiply matrices. Result is assigned to result parameter.
 * @method
 * @param {Matrix} matrix
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.multiplyLG = function(matrix, result){
    result[0] = (this[0] * matrix[0]) + (this[1] * matrix[4]) + (this[2] * matrix[8]) + (this[3] * matrix[12]);
    result[1] = (this[0] * matrix[1]) + (this[1] * matrix[5]) + (this[2] * matrix[9]) + (this[3] * matrix[13]);
    result[2] = (this[0] * matrix[2]) + (this[1] * matrix[6]) + (this[2] * matrix[10]) + (this[3] * matrix[14]);
    result[3] = (this[0] * matrix[3]) + (this[1] * matrix[7]) + (this[2] * matrix[11]) + (this[3] * matrix[15]);
    result[4] = (this[4] * matrix[0]) + (this[5] * matrix[4]) + (this[6] * matrix[8]) + (this[7] * matrix[12]);
    result[5] = (this[4] * matrix[1]) + (this[5] * matrix[5]) + (this[6] * matrix[9]) + (this[7] * matrix[13]);
    result[6] = (this[4] * matrix[2]) + (this[5] * matrix[6]) + (this[6] * matrix[10]) + (this[7] * matrix[14]);
    result[7] = (this[4] * matrix[3]) + (this[5] * matrix[7]) + (this[6] * matrix[11]) + (this[7] * matrix[15]);
    result[8] = (this[8] * matrix[0]) + (this[9] * matrix[4]) + (this[10] * matrix[8]) + (this[11] * matrix[12]);
    result[9] = (this[8] * matrix[1]) + (this[9] * matrix[5]) + (this[10] * matrix[9]) + (this[11] * matrix[13]);
    result[10] = (this[8] * matrix[2]) + (this[9] * matrix[6]) + (this[10] * matrix[10]) + (this[11] * matrix[14]);
    result[11] = (this[8] * matrix[3]) + (this[9] * matrix[7]) + (this[10] * matrix[11]) + (this[11] * matrix[15]);
    result[12] = (this[12] * matrix[0]) + (this[13] * matrix[4]) + (this[14] * matrix[8]) + (this[15] * matrix[12]);
    result[13] = (this[12] * matrix[1]) + (this[13] * matrix[5]) + (this[14] * matrix[9]) + (this[15] * matrix[13]);
    result[14] = (this[12] * matrix[2]) + (this[13] * matrix[6]) + (this[14] * matrix[10]) + (this[15] * matrix[14]);
    result[15] = (this[12] * matrix[3]) + (this[13] * matrix[7]) + (this[14] * matrix[11]) + (this[15] * matrix[15]);
    return result;
};
/**
 * Negate matrix. Returns a new Matrix.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.negate = function(){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = -this[i];
    }
    return new_matrix;
};
/**
 * Negate matrix. Result is assigned to result parameter.
 * @method
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.negateLG = function(result){
    result[0] = -this[0];
    result[1] = -this[1];
    result[2] = -this[2];
    result[3] = -this[3];
    result[4] = -this[4];
    result[5] = -this[5];
    result[6] = -this[6];
    result[7] = -this[7];
    result[8] = -this[8];
    result[9] = -this[9];
    result[10] = -this[10];
    result[11] = -this[11];
    result[12] = -this[12];
    result[13] = -this[13];
    result[14] = -this[14];
    result[15] = -this[15];
    return result;
};
/**
 * Transpose matrix. Returns a new Matrix.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.transpose = function(){
    var new_matrix = new Matrix();
    new_matrix[0] = this[0];
    new_matrix[1] = this[4];
    new_matrix[2] = this[8];
    new_matrix[3] = this[12];
    new_matrix[4] = this[1];
    new_matrix[5] = this[5];
    new_matrix[6] = this[9];
    new_matrix[7] = this[13];
    new_matrix[8] = this[2];
    new_matrix[9] = this[6];
    new_matrix[10] = this[10];
    new_matrix[11] = this[14];
    new_matrix[12] = this[3];
    new_matrix[13] = this[7];
    new_matrix[14] = this[11];
    new_matrix[15] = this[15];
    return new_matrix;
};
/**
 * Transpose matrix. Result is assigned to result parameter.
 * @method
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.prototype.transposeLG = function(result){
    result[0] = this[0];
    result[1] = this[4];
    result[2] = this[8];
    result[3] = this[12];
    result[4] = this[1];
    result[5] = this[5];
    result[6] = this[9];
    result[7] = this[13];
    result[8] = this[2];
    result[9] = this[6];
    result[10] = this[10];
    result[11] = this[14];
    result[12] = this[3];
    result[13] = this[7];
    result[14] = this[11];
    result[15] = this[15];
    return result;
};
/**
 * Write zeros to all elements of the matrix.
 * @method
 */
Matrix.prototype.empty = function(){
    for (var i = 0, len = this.length; i < len; i++){
        this[i] = 0;
    }
};
/**
 * Copy matrix values to another matrix.
 * @method
 * @param result
 *
 */
Matrix.prototype.copy = function(result) {
    for (var i = 0; i < 16; i++) {
        result[i] = this[i];
    }
    return result;
};


/**
 * Constructs a rotation matrix, rotating by theta around the x-axis. Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationX = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = 1;
    rotation_matrix[5] = cos;
    rotation_matrix[6] = -sin;
    rotation_matrix[9] = sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the x-axis. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationXLG = function(theta, result){
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = cos;
    result[6] = -sin;
    result[7] = 0;
    result[8] = 0;
    result[9] = sin;
    result[10] = cos;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the y-axis. Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationY = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = cos;
    rotation_matrix[2] = sin;
    rotation_matrix[5] = 1;
    rotation_matrix[8] = -sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the y-axis. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationYLG = function(theta, result){
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = cos;
    result[1] = 0;
    result[2] = sin;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = -sin;
    result[9] = 0;
    result[10] = cos;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the z-axis. Returns a new Matrix.
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationZ = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix[0] = cos;
    rotation_matrix[1] = -sin;
    rotation_matrix[4] = sin;
    rotation_matrix[5] = cos;
    rotation_matrix[10] = 1;
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the z-axis. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationZLG = function(theta, result){
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    result[0] = cos;
    result[1] = -sin;
    result[2] = 0;
    result[3] = 0;
    result[4] = sin;
    result[5] = cos;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix, rotating by theta around the axis. Returns a new Matrix.
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationAxis = function(axis, theta){
    var rotation_matrix = new Matrix();
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    rotation_matrix[0] = cos + ((ux*ux)*cos1);
    rotation_matrix[1] = (xy*cos1) - (uz*sin);
    rotation_matrix[2] = (xz*cos1)+(uy*sin);
    rotation_matrix[4] = (xy*cos1)+(uz*sin);
    rotation_matrix[5] = cos+((uy*uy)*cos1);
    rotation_matrix[6] = (yz*cos1)-(ux*sin);
    rotation_matrix[8] = (xz*cos1)-(uy*sin);
    rotation_matrix[9] = (yz*cos1)+(ux*sin);
    rotation_matrix[10] = cos + ((uz*uz)*cos1);
    rotation_matrix[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the axis. Result is assigned to result parameter.
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationAxisLG = function(axis, theta, result){
    axis.normalizeLG(temp_vector);
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = temp_vector.x;
    var uy = temp_vector.y;
    var uz = temp_vector.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    result[0] = cos + ((ux*ux)*cos1);
    result[1] = (xy*cos1) - (uz*sin);
    result[2] = (xz*cos1)+(uy*sin);
    result[3] = 0;
    result[4] = (xy*cos1)+(uz*sin);
    result[5] = cos+((uy*uy)*cos1);
    result[6] = (yz*cos1)-(ux*sin);
    result[7] = 0;
    result[8] = (xz*cos1)-(uy*sin);
    result[9] = (yz*cos1)+(ux*sin);
    result[10] = cos + ((uz*uz)*cos1);
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll. Returns a new Matrix.
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Matrix}
 */
Matrix.rotation = function(pitch, yaw, roll){
    return Matrix.rotationX(roll).multiply(Matrix.rotationZ(yaw)).multiply(Matrix.rotationY(pitch));
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.rotationLG = function(pitch, yaw, roll, result){
    // TODO: Can I get away with using fewer temporary matrices?
    Matrix.rotationXLG(roll, temp_matrix1);
    Matrix.rotationZLG(yaw, temp_matrix2);
    Matrix.rotationYLG(pitch, temp_matrix3);
    temp_matrix1.multiplyLG(temp_matrix2, temp_matrix4);
    temp_matrix4.multiplyLG(temp_matrix3, result);
    return result;
};
/**
 * Constructs a translation matrix from x, y, and z distances. Returns a new Matrix.
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.translation = function(xtrans, ytrans, ztrans){
    var translation_matrix = Matrix.identity();
    translation_matrix[12] = xtrans;
    translation_matrix[13] = ytrans;
    translation_matrix[14] = ztrans;
    return translation_matrix;
};
/**
 * Constructs a translation matrix from x, y, and z distances. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.translationLG = function(xtrans, ytrans, ztrans, result){
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[12] = xtrans;
    result[13] = ytrans;
    result[14] = ztrans;
    result[15] = 1;
    return result;
};
/**
 * Constructs a scaling matrix from x, y, and z scale. Returns a new Matrix.
 * @method
 * @static
 * @param {number} xscale
 * @param {number} yscale
 * @param {number} zscale
 * @return {Matrix}
 */
Matrix.scale = function(xscale, yscale, zscale){
    var scaling_matrix = new Matrix();
    scaling_matrix[0] = xscale;
    scaling_matrix[5] = yscale;
    scaling_matrix[10] = zscale;
    scaling_matrix[15] = 1;
    return scaling_matrix;
};
/**
 * Constructs a scaling matrix from x, y, and z scale. Result is assigned to result parameter.
 * @method
 * @static
 * @param {number} xscale
 * @param {number} yscale
 * @param {number} zscale
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.scaleLG = function(xscale, yscale, zscale, result){
    result[0] = xscale;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = yscale;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = zscale;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs an identity matrix. Returns a new Matrix.
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.identity = function(){
    var identity = new Matrix();
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    return identity;
};
/**
 * Constructs an identity matrix. Result is assigned to result parameter.
 * @method
 * @static
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.identityLG = function(result){
    result[0] = 1;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 1;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 1;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;
    return result;
};
/**
 * Constructs a zero matrix. Returns a new Matrix.
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.zero = function(){
    return new Matrix();
};
/**
 * Constructs a zero matrix. Result is assigned to result parameter.
 * @method
 * @static
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.zeroLG = function(result){
    result[0] = 0;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = 0;
    result[6] = 0;
    result[7] = 0;
    result[8] = 0;
    result[9] = 0;
    result[10] = 0;
    result[11] = 0;
    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 0;
    return result;
};
/**
 * Constructs a new matrix from an array. Returns a new Matrix.
 * @method
 * @static
 * @param {Array.<number>} arr
 * @return {Matrix}
 */
Matrix.fromArray = function(arr){
    var new_matrix = new Matrix();
    for (var i = 0; i < 16; i++){
        new_matrix[i] = arr[i];
    }
    return new_matrix;
};
/**
 * Constructs a new matrix from an array. Result is assigned to result parameter.
 * @method
 * @static
 * @param {Array.<number>} arr
 * @param {Matrix} result
 * @return {Matrix}
 */
Matrix.fromArrayLG = function(arr, result){
    result[0] = arr[0];
    result[1] = arr[1];
    result[2] = arr[2];
    result[3] = arr[3];
    result[4] = arr[4];
    result[5] = arr[5];
    result[6] = arr[6];
    result[7] = arr[7];
    result[8] = arr[8];
    result[9] = arr[9];
    result[10] = arr[10];
    result[11] = arr[11];
    result[12] = arr[12];
    result[13] = arr[13];
    result[14] = arr[14];
    result[15] = arr[15];
    return result;
};
/**
 * Copy values from one matrix to another.
 * @param {Matrix} matrix1
 * @param {Matrix} matrix2
 * @return {Matrix}
 */
Matrix.copy = function(matrix1, matrix2){
    for (var i = 0; i < 16; i++) {
        matrix2[i] = matrix1[i];
    }
    return matrix2;
};

var temp_matrix1 = new Matrix();
var temp_matrix2 = new Matrix();
var temp_matrix3 = new Matrix();
var temp_matrix4 = new Matrix();
var temp_vector = new Vector(0,0,0);

module.exports = Matrix;

},{"./vector.js":4}],4:[function(_dereq_,module,exports){
/**
 * 3D vector.
 * @constructor
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {number} z z coordinate
 */
function Vector(x, y, z){
    if (typeof x === 'undefined' ||
        typeof y === 'undefined' ||
        typeof z === 'undefined'){
        throw new Error('Insufficient arguments.');
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
/**
 * Add vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.add = function(vector){
    return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
};
/**
 * Add vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.addLG = function(vector, result){
    result.x = this.x + vector.x;
    result.y = this.y + vector.y;
    result.z = this.z + vector.z;
    return result;
};
/**
 * Subtract vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.subtract = function(vector){
    return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
};
/**
 * Subtract vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.subtractLG = function(vector, result){
    result.x = this.x - vector.x;
    result.y = this.y - vector.y;
    result.z = this.z - vector.z;
    return result;
};
/**
 * Compare vectors for equality
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Vector.prototype.equal = function(vector){
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
};
/**
 * Calculate angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return Math.acos(theta);
};
/**
 * Calculate angle between two vectors. Low garbage (doesn't create any intermediate Vectors).
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angleLG = function(vector){
    this.normalizeLG(temp_vector1);
    vector.normalizeLG(temp_vector2);
    var amag = temp_vector1.magnitude();
    var bmag = temp_vector2.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = temp_vector1.dot(temp_vector2) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return Math.acos(theta);
};
/**
 * Calculate the cosine of the angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return theta;
};
/**
 * Calculate the cosine of the angle between two vectors. Low garbage (doesn't create any intermediate Vectors).
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngleLG = function(vector){
    this.normalizeLG(temp_vector1);
    vector.normalizeLG(temp_vector2);
    var amag = temp_vector1.magnitude();
    var bmag = temp_vector2.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = temp_vector1.dot(temp_vector2) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return theta;
};
/**
 * Calculate magnitude of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitude = function(){
    return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};
/**
 * Calculate magnitude squared of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitudeSquared = function(){
    return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
};
/**
 * Calculate dot product of two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.dot = function(vector){
    return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
};
/**
 * Calculate cross product of two vectors. Returns a new Vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.cross = function(vector){
    return new Vector(
        (this.y * vector.z) - (this.z * vector.y),
        (this.z * vector.x) - (this.x * vector.z),
        (this.x * vector.y) - (this.y * vector.x)
    );
};
/**
 * Calculate cross product of two vectors. Result is assigned to result parameter.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.crossLG = function(vector, result){
    result.x = (this.y * vector.z) - (this.z * vector.y);
    result.y = (this.z * vector.x) - (this.x * vector.z);
    result.z = (this.x * vector.y) - (this.y * vector.x);
    return result;
};
/**
 * Normalize vector. Returns a new Vector.
 * @method
 * @return {Vector}
 */
Vector.prototype.normalize = function(){
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        return new Vector(this.x, this.y, this.z);
    }
    return new Vector(this.x / magnitude, this.y / magnitude, this.z / magnitude);
};
/**
 * Normalize vector. Result is assigned to result parameter.
 * @method
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.normalizeLG = function(result){
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        result.x = this.x;
        result.y = this.y;
        result.z = this.z;
    }
    result.x = this.x / magnitude;
    result.y = this.y / magnitude;
    result.z = this.z / magnitude;
    return result;
};
/**
 * Scale vector by scaling factor. Returns a new Vector.
 * @method
 * @param {number} scale
 * @return {Vector}
 */
Vector.prototype.scale = function(scale){
    return new Vector(this.x * scale, this.y * scale, this.z * scale);
};
/**
 * Scale vector by scaling factor. Result is assigned to result parameter.
 * @method
 * @param {number} scale
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.scaleLG = function(scale, result){
    result.x = this.x * scale;
    result.y = this.y * scale;
    result.z = this.z * scale;
    return result;
};
/**
 * Negate vector. Returns a new Vector.
 * @method
 * @return {Vector}
 */
Vector.prototype.negate = function(){
    return new Vector(-this.x, -this.y, -this.z);
};
/**
 * Negate vector. Result is assigned to result parameter.
 * @method
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.negateLG = function(result){
    result.x = -this.x;
    result.y = -this.y;
    result.z = -this.z;
    return result;
};
/**
 * Calculate vector projection of two vectors.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.vectorProjection = function(vector){
    var mag = vector.magnitude();
    return vector.scale(this.dot(vector) / (mag * mag));
};
/**
 * Calculate vector projection of two vectors. Does not construct any new Vectors in the course of its operation.
 * @method
 * @param {Vector} vector
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.vectorProjectionLG = function(vector, result){
    var mag = vector.magnitude();
    vector.scaleLG(this.dot(vector) / (mag * mag), result);
    return result;
};
/**
 * Calculate scalar projection of two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.scalarProjection = function(vector){
    return this.dot(vector) / vector.magnitude();
};
/**
 * Perform linear tranformation on a vector. Returns a new Vector.
 * @method
 * @param {Matrix} transform_matrix
 * @return {Vector}
 */
Vector.prototype.transform = function(transform_matrix){
    var x = (this.x * transform_matrix[0]) + (this.y * transform_matrix[4]) + (this.z * transform_matrix[8]) + transform_matrix[12];
    var y = (this.x * transform_matrix[1]) + (this.y * transform_matrix[5]) + (this.z * transform_matrix[9]) + transform_matrix[13];
    var z = (this.x * transform_matrix[2]) + (this.y * transform_matrix[6]) + (this.z * transform_matrix[10]) + transform_matrix[14];
    var w = (this.x * transform_matrix[3]) + (this.y * transform_matrix[7]) + (this.z * transform_matrix[11]) + transform_matrix[15];
    return new Vector(x / w, y / w, z / w);
};
/**
 * Perform linear tranformation on a vector.  Result is assigned to result parameter.
 * @method
 * @param {Matrix} transform_matrix
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.transformLG = function(transform_matrix, result){
    var x = (this.x * transform_matrix[0]) + (this.y * transform_matrix[4]) + (this.z * transform_matrix[8]) + transform_matrix[12];
    var y = (this.x * transform_matrix[1]) + (this.y * transform_matrix[5]) + (this.z * transform_matrix[9]) + transform_matrix[13];
    var z = (this.x * transform_matrix[2]) + (this.y * transform_matrix[6]) + (this.z * transform_matrix[10]) + transform_matrix[14];
    var w = (this.x * transform_matrix[3]) + (this.y * transform_matrix[7]) + (this.z * transform_matrix[11]) + transform_matrix[15];
    result.x = x / w;
    result.y = y / w;
    result.z = z / w;
    return result;
};
/**
 * Rotate vector by theta around axis. Returns a new Vector.
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotate = function(axis, theta){
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = u.x * u.y;
    var xz = u.x * u.z;
    var yz = u.y * u.z;
    var x = ((cos + ((ux*ux)*cos1)) * this.x) + (((xy*cos1) - (uz*sin)) * this.y) + (((xz*cos1)+(uy*sin)) * this.z);
    var y = (((xy*cos1)+(uz*sin)) * this.x) + ((cos+((uy*uy)*cos1)) * this.y) + (((yz*cos1)-(ux*sin)) * this.z);
    var z = (((xz*cos1)-(uy*sin)) * this.x) + (((yz*cos1)+(ux*sin)) * this.y) + ((cos + ((ux*ux)*cos1)) * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around axis. Result is assigned to result parameter.
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateLG = function(axis, theta, result){
    axis.normalizeLG(result);
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = result.x;
    var uy = result.y;
    var uz = result.z;
    var xy = result.x * result.y;
    var xz = result.x * result.z;
    var yz = result.y * result.z;
    var x = ((cos + ((ux*ux)*cos1)) * this.x) + (((xy*cos1) - (uz*sin)) * this.y) + (((xz*cos1)+(uy*sin)) * this.z);
    var y = (((xy*cos1)+(uz*sin)) * this.x) + ((cos+((uy*uy)*cos1)) * this.y) + (((yz*cos1)-(ux*sin)) * this.z);
    var z = (((xz*cos1)-(uy*sin)) * this.x) + (((yz*cos1)+(ux*sin)) * this.y) + ((cos + ((ux*ux)*cos1)) * this.z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around x-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateX = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around x-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateXLG = function(theta, result){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around y-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateY = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos *this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around y-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateYLG = function(theta, result){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos *this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by theta around z-axis. Returns a new Vector.
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateZ = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    return new Vector(x, y, z);
};
/**
 * Rotate vector by theta around z-axis. Result is assigned to result parameter.
 * @method
 * @param {number} theta
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotateZLG = function(theta, result){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
/**
 * Rotate vector by pitch, yaw, and roll. Returns a new Vector.
 * @method
 * @param {number} pitch_amnt
 * @param {number} yaw_amnt
 * @param {number} roll_amnt
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRoll = function(pitch_amnt, yaw_amnt, roll_amnt) {
    return this.rotateX(roll_amnt).rotateY(pitch_amnt).rotateZ(yaw_amnt);
};
/** 
 * Rotate vector by pitch, yaw, and roll. Result is assigned to result parameter.
 * @method
 * @param {number} pitch_amnt
 * @param {number} yaw_amnt
 * @param {number} roll_amnt
 * @param {Vector} result
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRollLG = function(pitch_amnt, yaw_amnt, roll_amnt, result) {
    this.rotateXLG(roll_amnt, result);
    result.rotateYLG(pitch_amnt, result);
    result.rotateZLG(yaw_amnt, result);
    return result;
};

var temp_vector1 = new Vector(0,0,0);
var temp_vector2 = new Vector(0,0,0);

module.exports = Vector;

},{}],5:[function(_dereq_,module,exports){
var math = _dereq_('linearalgea');
var Vector = math.Vector;
var Matrix = math.Matrix;

var TWOPI = Math.PI*2;

/** 
 * @constructor
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
function Camera(width, height, position){
    this.position = position || new Vector(1,1,20);
    this.up = new Vector(0, 1, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.view_matrix = new Matrix();
    this.width = width;
    this.height = height;
    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;
    this.perspectiveFov = new Matrix();

    this._xaxis = new Vector(0,0,0);
    this._yaxis = new Vector(0,0,0);
    this._zaxis = new Vector(0,0,0);
    this._direction = new Vector(0,0,0);
    this._temp_vector1 = new Vector(0,0,0);
    this._temp_vector2 = new Vector(0,0,0);
    this._temp_matrix = new Matrix();

    this.calculatePerspectiveFov();
    this.createViewMatrix();
}
/** @method */
Camera.prototype.direction = function() {
    var sin_pitch = Math.sin(this.rotation.pitch);
    var cos_pitch = Math.cos(this.rotation.pitch);
    var sin_yaw = Math.sin(this.rotation.yaw);
    var cos_yaw = Math.cos(this.rotation.yaw);
    this._direction.x = -cos_pitch * sin_yaw;
    this._direction.y = sin_pitch;
    this._direction.z = -cos_pitch * cos_yaw;
};
/**
 * Builds a perspective projection matrix based on a field of view.
 * @method
 * @return {Matrix}
 */
Camera.prototype.calculatePerspectiveFov = function() {
    var fov = this.fov * (Math.PI / 180); // convert to radians
    var aspect = this.width / this.height;
    var near = this.near;
    var far = this.far;
    var height = (1/Math.tan(fov/2)) * this.height;
    var width = height * aspect;

    this.perspectiveFov[0] = width;
    this.perspectiveFov[5] = height;
    this.perspectiveFov[10] = far/(near-far) ;
    this.perspectiveFov[11] = -1;
    this.perspectiveFov[14] = near*far/(near-far);
};
/** @method */
Camera.prototype.createViewMatrix = function(){
    var eye = this.position;
    var pitch = this.rotation.pitch;
    var yaw = this.rotation.yaw;
    var cos_pitch = Math.cos(pitch);
    var sin_pitch = Math.sin(pitch);
    var cos_yaw = Math.cos(yaw);
    var sin_yaw = Math.sin(yaw);

    this._xaxis.x = cos_yaw;
    this._xaxis.y = 0;
    this._xaxis.z = -sin_yaw;
    this._yaxis.x = sin_yaw * sin_pitch;
    this._yaxis.y = cos_pitch;
    this._yaxis.z = cos_yaw * sin_pitch;
    this._zaxis.x = sin_yaw * cos_pitch;
    this._zaxis.y = -sin_pitch;
    this._zaxis.z = cos_pitch * cos_yaw;

    Matrix.fromArrayLG([
        this._xaxis.x, this._yaxis.x, this._zaxis.x, 0,
        this._xaxis.y, this._yaxis.y, this._zaxis.y, 0,
        this._xaxis.z, this._yaxis.z, this._zaxis.z, 0,
        -(this._xaxis.dot(eye) ), -( this._yaxis.dot(eye) ), -( this._zaxis.dot(eye) ), 1
    ], this.view_matrix);
};
/**
 * Move camera rotation by the x and y amounts passed.
 * @method
 * @param {number} x
 * @param {number} y
 */
Camera.prototype.look = function(x, y){
    this.rotation.yaw -= x;
    if (this.rotation.yaw < 0){
        this.rotation.yaw = this.rotation.yaw + (TWOPI);
    }
    else if (this.rotation.yaw > (TWOPI)){
        this.rotation.yaw = this.rotation.yaw - (TWOPI);
    }
    this.rotation.pitch -= y;
    if (this.rotation.pitch < 0){
        this.rotation.pitch = this.rotation.pitch + (TWOPI);
    }
    else if (this.rotation.pitch > (TWOPI)){
        this.rotation.pitch = this.rotation.pitch - (TWOPI);
    }
    this.createViewMatrix();
};

Camera.prototype.turnRight = function(amount){
    this.rotation.yaw -= amount;
    if (this.rotation.yaw < 0){
        this.rotation.yaw = this.rotation.yaw + (TWOPI);
    }
    this.createViewMatrix();
};
/** @method */
Camera.prototype.turnLeft = function(amount){
    this.rotation.yaw += amount;
    if (this.rotation.yaw > (TWOPI)){
        this.rotation.yaw = this.rotation.yaw - (TWOPI);
    }
    this.createViewMatrix();
};
Camera.prototype.lookUp = function(amount){
    this.rotation.pitch -= amount;
    if (this.rotation.pitch > (TWOPI)){
        this.rotation.pitch = this.rotation.pitch - (TWOPI);
    }
    this.createViewMatrix();
};
/** @method */
Camera.prototype.lookDown = function(amount){
    this.rotation.pitch += amount;
    if (this.rotation.pitch < 0){
        this.rotation.pitch = this.rotation.pitch + (TWOPI);
    }
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveTo = function(x, y, z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.createViewMatrix();
};
/**
 * Move camera position by the x, y, and z amounts passed.
 * @method
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
Camera.prototype.move = function(x, y, z){
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
    this.createViewMatrix();
};

/** @method */
Camera.prototype.moveRight = function(amount){
    this.direction();
    this._direction.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.up.crossLG(this._temp_vector2, this._temp_vector1);
    this.position.subtractLG(this._temp_vector1, this.position);
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    this.direction();
    this._direction.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.up.crossLG(this._temp_vector2, this._temp_vector1);
    this.position.addLG(this._temp_vector1, this.position);
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveUp = function(amount){
    this.up.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.position.subtractLG(this._temp_vector2, this.position);
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveDown = function(amount){
    this.up.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.position.addLG(this._temp_vector2, this.position);
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveForward = function(amount){
    this.direction();
    this._direction.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.position.addLG(this._temp_vector2, this.position);
    this.createViewMatrix();
};
/** @method */
Camera.prototype.moveBackward = function(amount){
    this.direction();
    this._direction.normalizeLG(this._temp_vector1);
    this._temp_vector1.scaleLG(amount, this._temp_vector2);
    this.position.subtractLG(this._temp_vector2, this.position);
    this.createViewMatrix();
};

module.exports = Camera;

},{"linearalgea":2}],6:[function(_dereq_,module,exports){
var Scene = _dereq_('./scene.js');
var Camera = _dereq_('./camera.js');

module.exports.Scene = Scene;
module.exports.Camera = Camera;
},{"./camera.js":5,"./scene.js":8}],7:[function(_dereq_,module,exports){
/**
 * Event handler.
 * @mixin
 */
var EventTarget = {
    _listeners: {},
    /**
     * @method
     * @param {string} type Type of event to be added.
     * @param {function()} listener Function to be called when event is fired.
     */
    addListener: function(type, listener){
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    },
    /**
     * @method
     * @param  {string} type Type of event to be fired.
     * @param  {Object} [event] Optional user-defined event object. This could contain, for example, mouse coordinates, or key codes.
     */
    fire: function(type, event){
        var e = {};
        if (typeof event !== 'undefined'){
            e = event;
        }
        e.event = type;
        e.target = this;
        var listeners = this._listeners[type];
        if (typeof listeners !== 'undefined'){
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(this, e);
            }
        }
    },
    /**
     * @method
     * @param  {string} type
     * @param  {function()} listener
     */
    removeListener: function(type, listener){
        var listeners = this._listeners[type];
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
            }
        }
    }
};

module.exports = EventTarget;

},{}],8:[function(_dereq_,module,exports){
var math = _dereq_('linearalgea');
var Camera = _dereq_('./camera.js');
var EventTarget = _dereq_('./events.js');
var mixin = _dereq_('../utilities/mixin.js');
var KEYCODES = _dereq_('../utilities/keycodes.js');

var Vector = math.Vector;
var Matrix = math.Matrix;

/**
 * @constructor
 * @param {{canvas_id: string, width: number, height: number}} options
 */
function Scene(options){
    /** @type {number} */
    this.width = options.width;
    /** @type {number} */
    this.height = options.height;
    /** @type {HTMLElement} */
    this.canvas = document.getElementById(options.canvas_id);
    /** @type {CanvasContext} */
    this.ctx = this.canvas.getContext('2d');
    this.ctx.strokeStyle = 'red';
    /** @type {Camera} */
    this.camera = new Camera(this.width, this.height);
    /** @type {Vector} */
    this.illumination = new Vector(90,0,0);
    /** @type {Object.<string, Mesh>} */
    this.meshes = {};
    this._x_offset = Math.round(this.width / 2);
    this._y_offset = Math.round(this.height / 2);
    this._back_buffer = document.createElement('canvas');
    this._back_buffer.width = this.width;
    this._back_buffer.height = this.height;
    this._back_buffer_ctx = this._back_buffer.getContext('2d');
    this._back_buffer_image = null;
    this._depth_buffer = [];
    this._backface_culling = true;
    this._quickdraw = false;
    this._keys = {}; // Keys currently pressed
    this._key_count = 0; // Number of keys being pressed... this feels kludgy
    this._anim_id = null;
    this._needs_update = true;
    this._draw_mode = 0;
    this.canvas.tabIndex = 1; // Set tab index to allow canvas to have focus to receive key events
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.canvas.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.canvas.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.canvas.addEventListener('blur', this.emptyKeys.bind(this), false);
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.initializeDepthBuffer();
    this.update();

    this._light_direction = new Vector(0,0,0);
    this._wv1 = new Vector(0,0,0);
    this._wv2 = new Vector(0,0,0);
    this._wv3 = new Vector(0,0,0);
    this._v1 = new Vector(0,0,0);
    this._v2 = new Vector(0,0,0);
    this._v3 = new Vector(0,0,0);
    this._v1t = new Vector(0,0,0);
    this._v2t = new Vector(0,0,0);
    this._v3t = new Vector(0,0,0);
    this._wvp_matrix = new Matrix();
    this._world_matrix = new Matrix();
    this._rotation_matrix = new Matrix();
    this._translation_matrix = new Matrix();
    this._scale_matrix = new Matrix();
    this._cam_to_vert = new Vector(0,0,0);
    this._temp_matrix = new Matrix();
    this._side1 = new Vector(0,0,0);
    this._side2 = new Vector(0,0,0);
    this._norm = new Vector(0,0,0);
}
mixin(Scene.prototype, EventTarget);
/**
 * Dump all pressed keys on blur.
 * @method
 */
Scene.prototype.emptyKeys = function(){
    this._key_count = 0;
    this._keys = {};
};
/** 
 * Check if key is pressed.
 * @method
 * @param {string} key Key to check. E.g. 'a', 'space', 'tab'.
 */
Scene.prototype.isKeyDown = function(key){
    var pressed = KEYCODES[key];
    return (pressed in this._keys && this._keys[pressed]);
};
/** 
 * Register key presses.
 * @method
 * @param {KeyEvent} e
 */
Scene.prototype.onKeyDown = function(e){
    // If there are one or more keys depressed, the keydown event will fire in the update
    // loop. This prevents a keydown delay that noramlly occurs.
    var pressed = e.keyCode || e.which;
    if (!this.isKeyDown(pressed)){
        this._key_count += 1;
        this._keys[pressed] = true;
    }
};
/** 
 * Unregister key presses on keyup.
 * @method
 * @param {KeyEvent} e
 */
Scene.prototype.onKeyUp = function(e){
    var pressed = e.keyCode || e.which;
    if (pressed in this._keys){
        this._key_count -= 1;
        this._keys[pressed] = false;
    }
};
Scene.prototype._getMousePos = function(e){
    var rect = this.canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
};
/** 
 * Register mousedown event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseDown = function(e){
    // Last mouse position. Used for calculating delta x and y for mousedrag.
    // Initially set to undefined. Also keep track of time of time of last
    // update, so that mouse speed calculation is not dependent on steady
    // frame rate.
    this._last_mouse_coords = void(0);
    this._last_mouse_update = void(0);
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mousedown', mouseCoord);
    // Setup mousedrag
    var mousedrag = this.onMouseDrag.bind(this);
    var mouseup = function(){
        // Unregister events on mouseup.
        this.removeEventListener('mousemove', mousedrag, false);
        this.removeEventListener('mouseup', mouseup, false);
        this._last_mouse_coords = void(0);
        this._last_mouse_update = void(0);
    };
    this.canvas.addEventListener('mousemove', mousedrag, false);
    this.canvas.addEventListener('mouseup', mouseup, false);
    this.canvas.addEventListener('mouseleave', mouseup, false);
};
/** 
 * Register mouseup event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseUp = function(e){
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mouseup', mouseCoord);
};
/** 
 * Register mousemove event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseMove = function(e){
    var mouseCoord = {'mouse': this._getMousePos(e)};
    this.fire('mousemove', mouseCoord);
};
/** 
 * Register mousedrag event.
 * @method
 * @param {MouseEvent} e
 */
Scene.prototype.onMouseDrag = function(e){
    var mouse_coords = this._getMousePos(e);
    // Calculate deltax and delta y, and mouse speed.
    if (typeof this._last_mouse_coords === 'undefined'){
        this._last_mouse_coords = mouse_coords;
    }
    if (typeof this._last_mouse_update === 'undefined'){
        this._last_mouse_update = new Date();
    }
    var time = new Date() - this._last_mouse_update;
    var deltax = mouse_coords.x - this._last_mouse_coords.x;
    var deltay = mouse_coords.y - this._last_mouse_coords.y;
    var xvel = 0;
    var yvel = 0;
    if (time > 0){
        xvel = deltax / time;
        yvel = deltay / time;
    }
    var mouseEvent = {'mouse': {
        'x': mouse_coords.x,
        'y': mouse_coords.y,
        'xvel': xvel,
        'yvel': yvel,
        'deltax': deltax,
        'deltay': deltay
    }};
    this._last_mouse_coords = mouse_coords;
    this._last_mouse_update = time;
    this.fire('mousedrag', mouseEvent);
};
/**
 * Initialize depth buffer with high z values.
 * @method
 */
Scene.prototype.initializeDepthBuffer = function(){
    for (var x = 0, len = this.width * this.height; x < len; x++){
        this._depth_buffer[x] = 9999999;
    }
};
/**
 * Clear back buffer image.
 * @method
 */
Scene.prototype._clear_back_buffer_image = function(){
    // Clear back buffer image, instead of using createImageData to reduce garbage.
    // This method only sets alpha for every pixel to 0, which takes 1/4 the time of a full clear.
    var back_buf_data = this._back_buffer_image.data;
    for (var i = 3; i < back_buf_data.length; i+=4){
        back_buf_data[i] = 0;
    }
};
/**
 * Determine id vector is offscreen.
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Scene.prototype.offscreen = function(vector){
    // TODO: Not totally certain that z>1 indicates vector is behind camera.
    var x = vector.x + this._x_offset;
    var y = vector.y + this._y_offset;
    var z = vector.z;
    return (z > 1 || x < 0 || x > this.width || y < 0 || y > this.height);
};
/**
 * Toggle drawing mode. Currently, available draw modes are wireframe mode, and
 * the experimental (and slow) fill mode.
 * @method
 */
Scene.prototype.toggleDrawMode = function(){
    this._draw_mode = (this._draw_mode + 1) % 2;
    this.renderScene();
};
/**
 * Toggle backface culling. 
 * @method
 */
Scene.prototype.toggleBackfaceCulling = function(){
    this._backface_culling = !this._backface_culling;
    this.renderScene();
};
/**
 * Toggle quickdraw mode. 
 * @method
 */
Scene.prototype.toggleQuickDraw = function(){
    this._quickdraw = !this._quickdraw;
    this.renderScene();
};
/**
 * Draw a single pixel to the sceen and update the depth buffer. If there is already 
 * a closer pixel (i.e. one with a lower z value), then the pixel is not drawn.
 * @method
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {number} z Z coordinate
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawPixel = function(x, y, z, color){
    x = x + this._x_offset;
    y = y + this._y_offset;
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        var index = x + (y * this.width);
        if (z < this._depth_buffer[index]) {
            var image_data = this._back_buffer_image.data;
            var i = index * 4;
            image_data[i] = color.rgb.r;
            image_data[i+1] = color.rgb.g;
            image_data[i+2] = color.rgb.b;
            image_data[i+3] = 255;
            this._depth_buffer[index] = z;
        }
    }
};
/**
 * Draw a line segment between two points.
 * @method
 * @param {Vector} v1 First end point of line segment.
 * @param {Vector} v2 Second end point of line segment.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawEdge = function(v1, v2, color){
    var abs = Math.abs;
    if (v1.x >= v2.x){
        var temp = v1;
        v1 = v2;
        v2 = temp;
    }
    var current_x = v1.x;
    var current_y = v1.y;
    var current_z = v1.z;
    var longest_dist = Math.max(abs(v2.x - v1.x), abs(v2.y - v1.y), abs(v2.z - v1.z));
    var step_x = (v2.x - v1.x) / longest_dist;
    var step_y = (v2.y - v1.y) / longest_dist;
    var step_z = (v2.z - v1.z) / longest_dist;

    for (var i = 0; i < longest_dist; i++){
        this.drawPixel(Math.floor(current_x), Math.floor(current_y), current_z, color);
        current_x += step_x;
        current_y += step_y;
        current_z += step_z;
    }
};
/**
 * Draw a line segment between two points. This method has a
 * significant speed advantage to the other line method, but it
 * does not respect z-ordering, so it is only appropriate to
 * use if all meshes in a scene are the same color.
 * @method
 * @param {Vector} v1 First end point of line segment.
 * @param {Vector} v2 Second end point of line segment.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.quickLine = function(v1, v2){
    var x1 = Math.round(v1.x + this._x_offset);
    var y1 = Math.round(v1.y + this._y_offset);
    var x2 = Math.round(v2.x + this._x_offset);
    var y2 = Math.round(v2.y + this._y_offset);
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
};
/**
 * Draw the edges of a triangle.
 * @method
 * @param {Vector} v1 First vertex of triangle.
 * @param {Vector} v2 Second vertex of triangle.
 * @param {Vector} v3 Third vertex of triangle.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.drawTriangle = function(v1, v2, v3, color){
    if (this._quickdraw){
        this.quickLine(v1, v2);
        this.quickLine(v2, v3);
        this.quickLine(v3, v1);
    } else {
        this.drawEdge(v1, v2, color);
        this.drawEdge(v2, v3, color);
        this.drawEdge(v3, v1, color);
    }
};
/**
 * Draw a filled triangle in a uniform color.
 * @method
 * @param {Vector} v1 First vertex of triangle.
 * @param {Vector} v2 Second vertex of triangle.
 * @param {Vector} v3 Third vertex of triangle.
 * @param {Color} color Color to be drawn.
 */
Scene.prototype.fillTriangle = function(v1, v2, v3, color){
    // TODO: This method chugs when close to a face. See if this can be fixed.
    // Is this just because it's looping over so many extraneous points?
    // Decomposing into smaller triangles may alleviate this somewhat.
    var x0 = v1.x;
    var x1 = v2.x;
    var x2 = v3.x;
    var y0 = v1.y;
    var y1 = v2.y;
    var y2 = v3.y;
    var z0 = v1.z;
    var z1 = v2.z;
    var z2 = v3.z;

    // Compute offsets. Used to avoid computing barycentric coords for offscreen pixels
    var xleft = 0 - this._x_offset;
    var xright = this.width - this._x_offset;
    var ytop = 0 - this._y_offset;
    var ybot = this.height - this._y_offset;

    // Compute bounding box
    var xmin = Math.floor(Math.min(x0, x1, x2));
    if (xmin < xleft){xmin=xleft;}
    var xmax = Math.ceil(Math.max(x0, x1, x2));
    if (xmax > xright){xmax=xright;}
    var ymin = Math.floor(Math.min(y0, y1, y2));
    if (ymin < ytop){ymin=ytop;}
    var ymax = Math.ceil(Math.max(y0, y1, y2));
    if (ymax > ybot){ymax=ybot;}

    // Precompute as much as possible
    var y2y0 = y2-y0;
    var x0x2 = x0-x2;
    var y0y1 = y0-y1;
    var x1x0 = x1-x0;
    var x2y0x0y2 = x2*y0 - x0*y2;
    var x0y1x1y0 = x0*y1 - x1*y0;
    var f20x1y1 = ((y2y0*x1) + (x0x2*y1) + x2y0x0y2);
    var f01x2y2 = ((y0y1*x2) + (x1x0*y2) + x0y1x1y0);

    var y2y0overf20x1y1 = y2y0/f20x1y1;
    var x0x2overf20x1y1 = x0x2/f20x1y1;
    var x2y0x0y21overf20x1y1 = x2y0x0y2/f20x1y1;

    var y0y1overf01x2y2 = y0y1/f01x2y2;
    var x0x2overf01x2y2 = x1x0/f01x2y2;
    var x2y0x0y2overf01x2y2 = x0y1x1y0/f01x2y2;

    // Loop over bounding box
    for (var x = xmin; x <= xmax; x++){
        for (var y = ymin; y <= ymax; y++){
            // Compute barycentric coordinates
            // If any of the coordinates are not in the range [0,1], then the
            // point is not inside the triangle. Rather than compute all the
            // coordinates straight away, we'll short-circuit as soon as a coordinate outside
            // of that range is encountered.
            var beta = y2y0overf20x1y1*x + x0x2overf20x1y1*y + x2y0x0y21overf20x1y1;
            if (beta >= 0 && beta <= 1){
                var gamma = y0y1overf01x2y2*x + x0x2overf01x2y2*y +x2y0x0y2overf01x2y2;
                if (gamma >= 0 && gamma <= 1){
                    var alpha = 1 - beta - gamma;
                    if (alpha >= 0 && alpha <= 1){
                        // If all barycentric coords within range [0,1], inside triangle
                        var z = alpha*z0 + beta*z1 + gamma*z2;
                        this.drawPixel(x, y, z, color);
                    }
                }
            }
        }
    }
};
/**
 * Render a single frame of the scene.
 * @method
 */
Scene.prototype.renderScene = function(){
    // TODO: Simplify this function.
    if (this._quickdraw && this._draw_mode === 0){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
    } else {
        this._clear_back_buffer_image();
        this.initializeDepthBuffer();
    }
    var camera_matrix = this.camera.view_matrix;
    var projection_matrix = this.camera.perspectiveFov;
    var light = this.illumination;
    for (var key in this.meshes){
        if (this.meshes.hasOwnProperty(key)){
            var mesh = this.meshes[key];
            var scale = mesh.scale;
            var rotation = mesh.rotation;
            var position = mesh.position;
            // Build world matrix
            Matrix.scaleLG(scale.x, scale.y, scale.z, this._scale_matrix);
            Matrix.rotationLG(rotation.pitch, rotation.yaw, rotation.roll, this._rotation_matrix);
            Matrix.translationLG(position.x, position.y, position.z, this._translation_matrix);
            this._scale_matrix.multiplyLG(this._rotation_matrix, this._world_matrix);
            this._world_matrix.multiplyLG(this._translation_matrix, this._world_matrix);
            for (var k = 0; k < mesh.faces.length; k++){
                var face = mesh.faces[k].face;
                var color = mesh.faces[k].color;
                var v1 = mesh.vertices[face[0]];
                var v2 = mesh.vertices[face[1]];
                var v3 = mesh.vertices[face[2]];

                // Calculate the normal
                // TODO: Can this be calculated just once, and then transformed into
                // camera space?
                v1.transformLG(this._world_matrix, this._v1t);
                v2.transformLG(this._world_matrix, this._v2t);
                v3.transformLG(this._world_matrix, this._v3t);

                this.camera.position.subtractLG(this._v1t, this._cam_to_vert);

                this._v2t.subtractLG(this._v1t, this._side1);
                this._v3t.subtractLG(this._v1t, this._side2);
                this._side1.crossLG(this._side2, this._norm);
                if (this._norm.magnitude() >= 0.00000001){
                    this._norm.normalizeLG(this._norm);
                }
                // Backface culling.
                if (!this._backface_culling || this._cam_to_vert.dot(this._norm) >= 0) {
                    //var wvp_matrix = world_matrix.multiply(camera_matrix).multiply(projection_matrix);
                    this._world_matrix.multiplyLG(camera_matrix, this._temp_matrix);
                    this._temp_matrix.multiplyLG(projection_matrix, this._wvp_matrix);
                    v1.transformLG(this._wvp_matrix, this._wv1);
                    v2.transformLG(this._wvp_matrix, this._wv2);
                    v3.transformLG(this._wvp_matrix, this._wv3);
                    var draw = true;

                    // Draw surface normals
                    // var face_trans = Matrix.translation(wv1.x, wv1.y, v1.z);
                    // this.drawEdge(wv1, norm.scale(20).transform(face_trans), {'r':255,"g":255,"b":255})

                    // TODO: Fix frustum culling
                    // This is really stupid frustum culling... this can result in some faces not being
                    // drawn when they should, e.g. when a triangles vertices straddle the frustrum.
                    if (this.offscreen(this._wv1) && this.offscreen(this._wv2) && this.offscreen(this._wv3)){
                        draw = false;
                    }
                    if (draw){
                        if (this._draw_mode === 0){
                            this.drawTriangle(this._wv1, this._wv2, this._wv3, color);
                        } else if (this._draw_mode === 1){
                            light.subtractLG(this._v1t, this._light_direction);
                            this._light_direction.normalizeLG(this._light_direction);
                            var illumination_angle = this._norm.dot(this._light_direction);
                            color = color.lighten(illumination_angle*15);
                            this.fillTriangle(this._wv1, this._wv2, this._wv3, color);
                        }
                    }
                }
            }
        }
    }
    if (this._quickdraw && this._draw_mode === 0){
        this.ctx.stroke();
        this.ctx.closePath();
    } else {
        this._back_buffer_ctx.putImageData(this._back_buffer_image, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this._back_buffer, 0, 0, this.canvas.width, this.canvas.height);
    } 
};
/**
 * Add a mesh to the scene.
 * @method
 * @param {Mesh} mesh
 */
Scene.prototype.addMesh = function(mesh){
    this.meshes[mesh.name] = mesh;
};
/**
 * Remove a mesh to the scene.
 * @method
 * @param {Mesh} mesh
 */
Scene.prototype.removeMesh = function(mesh){
    delete this.meshes[mesh.name];
};
/**
 * Update the scene
 * @method
 */
Scene.prototype.update = function(){
    if (this._key_count > 0){
        this.fire('keydown');
    }
    // TODO: Add keyup, mousedown, mousedrag, mouseup, etc.
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};

module.exports = Scene;

},{"../utilities/keycodes.js":13,"../utilities/mixin.js":14,"./camera.js":5,"./events.js":7,"linearalgea":2}],9:[function(_dereq_,module,exports){
/**
 * @license
 * Copyright (c) 2014 Eben Packwood. All rights reserved.
 * MIT License
 *
 */

/** @ignore */
var geometry = _dereq_('./geometry/geometry.js');
var engine = _dereq_('./engine/engine.js');


module.exports.geometry = geometry;
module.exports.engine = engine;

},{"./engine/engine.js":6,"./geometry/geometry.js":11}],10:[function(_dereq_,module,exports){
var Color = _dereq_('colour');

/**
 * A 3D triangle
 * @constructor
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {string} color
 */
function Face(a, b, c, color){
    this.face = [a, b, c];
    this.color = new Color(color);
}

module.exports = Face;
},{"colour":1}],11:[function(_dereq_,module,exports){
var Mesh = _dereq_('./mesh.js');
var Face = _dereq_('./face.js');

module.exports.Mesh = Mesh;
module.exports.Face = Face;

},{"./face.js":10,"./mesh.js":12}],12:[function(_dereq_,module,exports){
var Vector = _dereq_('linearalgea').Vector;
var Face = _dereq_('./face.js');

/**
 * @constructor
 * @param {string} name
 * @param {Array.<Vector>} vertices
 * @param {Array.<Face>} edges
 */
function Mesh(name, vertices, faces){
    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.position = new Vector(0, 0, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.scale = {'x': 1, 'y': 1, 'z': 1};
}

/**
 * Construct a Mesh from a JSON object.
 * @method
 * @static
 * @param  {{name: string, verticies: Array.<Array.<number>>, faces: {{face: Array.<number>, color: string}}}} json
 * @return {Mesh}
 */
Mesh.fromJSON = function(json){
    var vertices = [];
    var faces = [];
    for (var i = 0, len = json.vertices.length; i < len; i++){
        var vertex = json.vertices[i];
        vertices.push(new Vector(vertex[0], vertex[1], vertex[2]));
    }
    for (var j = 0, ln = json.faces.length; j < ln; j++){
        var face = json.faces[j];
        faces.push(new Face(face.face[0], face.face[1], face.face[2], face.color));
    }
    return new Mesh(json.name, vertices, faces);
};

module.exports = Mesh;

},{"./face.js":10,"linearalgea":2}],13:[function(_dereq_,module,exports){
/** 
 * @constant
 * @type {Object.<string, number>} 
 */
var KEYCODES = {
    'space': 32,
    'backspace' : 8,
    'tab' : 9,
    'enter' : 13,
    'shift' : 16,
    'ctrl' : 17,
    'alt' : 18,
    'pause_break' : 19,
    'caps_lock' : 20,
    'escape' : 27,
    'page_up' : 33,
    'page down' : 34,
    'end' : 35,
    'home' : 36,
    'left_arrow' : 37,
    'up_arrow' : 38,
    'right_arrow' : 39,
    'down_arrow' : 40,
    'insert' : 45,
    'delete' : 46,
    '0' : 48,
    '1' : 49,
    '2' : 50,
    '3' : 51,
    '4' : 52,
    '5' : 53,
    '6' : 54,
    '7' : 55,
    '8' : 56,
    '9' : 57,
    'a' : 65,
    'b' : 66,
    'c' : 67,
    'd' : 68,
    'e' : 69,
    'f' : 70,
    'g' : 71,
    'h' : 72,
    'i' : 73,
    'j' : 74,
    'k' : 75,
    'l' : 76,
    'm' : 77,
    'n' : 78,
    'o' : 79,
    'p' : 80,
    'q' : 81,
    'r' : 82,
    's' : 83,
    't' : 84,
    'u' : 85,
    'v' : 86,
    'w' : 87,
    'x' : 88,
    'y' : 89,
    'z' : 90,
    'left_window key' : 91,
    'right_window key' : 92,
    'select_key' : 93,
    'numpad 0' : 96,
    'numpad 1' : 97,
    'numpad 2' : 98,
    'numpad 3' : 99,
    'numpad 4' : 100,
    'numpad 5' : 101,
    'numpad 6' : 102,
    'numpad 7' : 103,
    'numpad 8' : 104,
    'numpad 9' : 105,
    'multiply' : 106,
    'add' : 107,
    'subtract' : 109,
    'decimal point' : 110,
    'divide' : 111,
    'f1' : 112,
    'f2' : 113,
    'f3' : 114,
    'f4' : 115,
    'f5' : 116,
    'f6' : 117,
    'f7' : 118,
    'f8' : 119,
    'f9' : 120,
    'f10' : 121,
    'f11' : 122,
    'f12' : 123,
    'num_lock' : 144,
    'scroll_lock' : 145,
    'semi_colon' : 186,
    'equal_sign' : 187,
    'comma' : 188,
    'dash' : 189,
    'period' : 190,
    'forward_slash' : 191,
    'grave_accent' : 192,
    'open_bracket' : 219,
    'backslash' : 220,
    'closebracket' : 221,
    'single_quote' : 222
};

module.exports = KEYCODES;
},{}],14:[function(_dereq_,module,exports){
function mixin(receiver, supplier) {
    for (var property in supplier) {
        if (supplier.hasOwnProperty(property)) {
            receiver[property] = supplier[property];
        }
    }
    return receiver;
}

module.exports = mixin;
},{}]},{},[9])
(9)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],56:[function(require,module,exports){
var wireframe = require('wireframe');

function VU(audioFile){
    // "Globals"
    var Scene = wireframe.engine.Scene;
    var scene = new Scene({canvas_id: 'canvas', width:600, height:400});
    // scene.toggleQuickDraw();
    // scene.ctx.strokeStyle = "green";
    var mesh;
    var ROWS = 20;
    var COLS = 16;

    (function initializeScene(){
        /************************
        ***  Wireframe setup  ***
        *************************/
        var Mesh = wireframe.geometry.Mesh;
        var vertices = [];
        var faces = [];

        // Build mesh vertices
        for (var row = 0; row < ROWS; row++){
            for (var col = 0; col < COLS; col++){
                vertices.push([(col*20)-160, 0, (row*(-20))]);
            }
        }

        // Build mesh edges.
        for (var row = 0; row < ROWS-1; row++){
            for (var col = 0; col < COLS-1; col++){
                var a = col + (row * COLS);
                var b = (col + 1) + (row * COLS);
                var d = (col +1)+ ((row+1) * COLS);
                var c = col + ((row +1)* COLS);
                faces.push({"face": [a, c, d], "color": "green"});
                faces.push({"face": [a, d, b], "color": "green"});
            }
        }
        mesh = Mesh.fromJSON({
            "name": "vu",
            "vertices": vertices,
            "faces": faces
        });

        scene.camera.moveTo(0, -200, 400);
        scene.camera.lookDown(0.2);
        scene.addMesh(mesh);

        function moveCamera(e){
            if (scene.isKeyDown('w')) {
                scene.camera.moveForward(3);
            }
            if (scene.isKeyDown('s')) {
                scene.camera.moveBackward(3);
            }
            if (scene.isKeyDown('a')) {
                scene.camera.moveLeft(3);
            }
            if (scene.isKeyDown('d')) {
                scene.camera.moveRight(3);
            }
            if (scene.isKeyDown('r')) {
                scene.camera.moveUp(3);
            }
            if (scene.isKeyDown('f')) {
                scene.camera.moveDown(3);
            }
            if (scene.isKeyDown('t')) {
                scene.camera.lookUp(0.02);
            }
            if (scene.isKeyDown('g')) {
                scene.camera.lookDown(0.02);
            }
            if (scene.isKeyDown('q')) {
                scene.camera.turnLeft(0.02);
            }
            if (scene.isKeyDown('e')) {
                scene.camera.turnRight(0.02);
            }
        }

        scene.addListener('keydown', moveCamera);
        scene.toggleBackfaceCulling();
    })();

    (function initializeAudio(){
        /************************
        ***     DOM setup     ***
        *************************/
        var canvas = document.getElementById('canvas');

        // ready indicates whether audio is loaded and ready to be played.
        var ready = document.createElement('div');
        ready.appendChild(document.createTextNode(""));
        var start_button = document.createElement('button');
        start_button.style.marginLeft = "10px";
        start_button.appendChild(document.createTextNode("Start"));
        ready.appendChild(start_button);
        ready.loading = function(){
            this.childNodes[0].textContent = "Audio loading...";
            this.style.color = 'red';
            this.childNodes[1].disabled = true;
        };
        ready.ready = function(){
            this.childNodes[0].textContent = "Ready!";
            this.style.color = 'green';
            this.childNodes[1].disabled = false;
        };
        ready.error = function(){
            this.childNodes[0].textContent = "Error! File type not supported";
            this.style.color = 'red';
            this.childNodes[1].disabled = true;
        };
        ready.loading();
        if (canvas.nextSibling) {
          canvas.parentNode.insertBefore(ready, canvas.nextSibling);
        }
        else {
          canvas.parentNode.appendChild(ready);
        }

        /************************
        ***    Audio setup    ***
        *************************/

        var audioctx = new (window.AudioContext || window.webkitAudioContext)();
        var analyser;

        var dataArray;
        var audio_node, javascript_node;
        // clicklistener function needs to be held onto so that the event
        // listener can be removed, when necessary.
        var clicklistener;
        var playing = false;

        function initAudio() {
            javascript_node = audioctx.createScriptProcessor(2048, 1, 1);
            javascript_node.connect(audioctx.destination);
            analyser = audioctx.createAnalyser();
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.fftSize = 64;
            audio_node = audioctx.createBufferSource();
            audio_node.connect(analyser);
            analyser.connect(javascript_node);

            audio_node.connect(audioctx.destination);
        }

        function decodeAudio(buffer){
            audioctx.decodeAudioData(buffer, function(decoded) {
                // Remove clicklistener to avoid adding multiple
                // event listeners
                start_button.removeEventListener('click', clicklistener);
                soundReady(decoded);
            }, onError);
        }

        function XHRLoadSound(url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                playtime = 0;
                decodeAudio(request.response);
            };
            request.send();
        }

        // Keep track of where in the audio track we are.
        var playtime = 0;
        var time_started;
        function playAudio(){
            playing = true;
            time_started = new Date();
            audio_node.start(0, playtime);
        }
        function pauseAudio(){
            // Convert times from miliseconds to seconds
            playtime = playtime + ((new Date() - time_started)/1000);
            playing = false;
            audio_node.stop();
            // Since buffersource is one-time use, we need
            // to reinitialize if we want to play again after pausing
            initAudio();
        }

        function soundReady(buffer){
            ready.ready();
            clicklistener = function(e){
                if (playing){
                    this.textContent = "Start";
                    pauseAudio();
                } else {
                    this.textContent = "Stop";
                    audio_node.buffer = buffer;
                    playAudio();
                }
            };
            start_button.addEventListener('click', clicklistener);
        }

        function onError(e) {
            ready.error();
        }

        function fileDrop(e){
            e.preventDefault();
            playtime = 0;
            ready.loading();
            var files = e.dataTransfer.files;
            var reader = new FileReader();
        
            reader.onload = function(e) {
                decodeAudio(e.target.result);
            };
            reader.readAsArrayBuffer(files[0]);
            
        }

        // Required for drag 'n' drop to work on canvas
        canvas.addEventListener("dragover", function (e) {
            e.preventDefault();
        }, false);
        canvas.addEventListener('drop', fileDrop);
        
        function draw(array) {
            var current_time = new Date();
            // Shift everything back one row.
            if (current_time - last_update > 100){
                // Take rows from back to front,
                // otherwise we would overwrite rows we haven't copied over yet.
                for (var row = ROWS - 1; row >= 1; row--){
                    for (var col = 0; col < COLS; col++){
                        var i = col + ((row - 1) * COLS);
                        var i2 = col + (row * COLS);
                        mesh.vertices[i2].y = mesh.vertices[i].y;
                    }
                }
                last_update = current_time;
            }

            var freq_height;
            for(var i = 0; i < COLS; i++) {
                freq_height = array[i]/2;
                mesh.vertices[i].y = -freq_height;
            }

            scene.renderScene();
        }

        var last_update = new Date();
        function update(){
            analyser.getByteFrequencyData(dataArray);

            draw(dataArray);
            window.requestAnimationFrame(update);
        }

        // Start off with default audio file.
        initAudio();
        XHRLoadSound(audioFile);
        window.requestAnimationFrame(update);
    })();
    }
module.exports = VU;

},{"wireframe":55}],57:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}]},{},[1])(1)
});
