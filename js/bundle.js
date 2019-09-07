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
    var input = document.getElementById('input');
    var output = document.getElementById('output');
    var eval = document.getElementById('eval');
    eval.addEventListener('click', function(){
        var result = lidrisp.run(editor.getValue());
        output.textContent = result;
    });

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

},{"astar":3,"boltzmann":5,"conway":8,"lidrisp":10,"lispish.js":54,"projectwavybits":59,"videoascii":60,"vu":62,"wireframe":63}],2:[function(require,module,exports){
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
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":4,"ieee754":9}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],10:[function(require,module,exports){
(function (process,global,Buffer){
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(F,oa,R){F!=Array.prototype&&F!=Object.prototype&&(F[oa]=R.value)};$jscomp.getGlobal=function(F){return"undefined"!=typeof window&&window===F?F:"undefined"!=typeof global&&null!=global?global:F};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(F,oa,R,la){if(oa){R=$jscomp.global;F=F.split(".");for(la=0;la<F.length-1;la++){var ra=F[la];ra in R||(R[ra]={});R=R[ra]}F=F[F.length-1];la=R[F];oa=oa(la);oa!=la&&null!=oa&&$jscomp.defineProperty(R,F,{configurable:!0,writable:!0,value:oa})}};$jscomp.polyfill("Math.trunc",function(F){return F?F:function(F){F=Number(F);if(isNaN(F)||Infinity===F||-Infinity===F||0===F)return F;var R=Math.floor(Math.abs(F));return 0>F?-R:R}},"es6","es3");
(function(){function F(a,b,c,e,k){return function(a){return k(e(a))(a)}}function oa(){return function(a){return""+a}}function R(){return function(a){return function(b){return a+b}}}function la(){return function(a){return a.toString()}}function ra(){return function(a){return""+a}}function C(a,b,c){return function(a){return function(e){var k=b(a)(e);e=0===k.type?c(a)(e):new E(k.$1,k.$2,k.$3);return e}}}function Dc(a,b,c){return function(a){return function(b){b=c.$1(null)(a.$2)(b);return new w(a.$1,
b)}}}function Td(){return function(a){return Ud(a)}}function Vd(){return function(a){return Wd(a)}}function qb(a,b,c){return function(a){var e=$b(null,new f.jsbn.BigInteger("0"),a);if(1===e.type){var K=$b(null,new f.jsbn.BigInteger("1"),a);1===K.type?(a=b(e.$1),0===a.type?K=new d(a.$1):(K=b(K.$1),K=0===K.type?new d(K.$1):new h(new p(c(a.$1)(K.$1))))):K=new d(new q(new r(2,2),n(null,a),a))}else K=new d(new q(new r(2,2),n(null,a),a));return K}}function Xd(){return function(a){return Ec(a)}}function Yd(){return function(a){return Fc(a)}}
function Zd(){return function(a){return $d(a)}}function ae(){return function(a){return be(a)}}function Gc(){return function(a){return ce(a)}}function Hc(){return function(a){if(1===a.type){var b=a.$1;a=2===b.type?0===b.$1.type?0===a.$2.type?new h(new p(!0)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function de(){return function(a){return function(b){if(""===
a)b=new E(Sa,a,b);else{var c=""===a?f.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];b=new sa(Ic(c,b))}return b}}}function ac(){return function(a){return Ib(a)}}function ee(a,b,c){return function(e){return S(a,b,c,e)}}function fe(){return function(a){return ge(a)}}function he(a,b,c,e){return function(a){var b=bc(null,null,null,new rb(ie(),Jc(),je()),Dc(null,null,c),e)(a),k=c.$1(null),d=new Fa(cc(),Lc(),dc());b=Mc(null,null,Nc(),new Oc(d),b);a=k(b)(a);return new ke(a)}}
function Na(a,b,c,e){return function(a){a=e(a);return new h(a)}}function le(a,b,c,e,k,d,f){return function(a){var b=k(a);a=0===b.type?d(b.$1)(a):f(b.$1)(a);return a}}function me(){return function(a){return 1===a.type?10===a.$1.type?0===a.$2.type?new h(new p(!0)):new h(new p(!1)):new h(new p(!1)):new h(new p(!1))}}function ne(){return function(a){return new h(new p(!1))}}function T(){return function(a){a=0<Ta(a,"0")||"0"===a?0>Ta(a,"9")?!0:"9"===a:!1;return a}}function oe(){return function(a){return D(a)}}
function pe(){return function(a){return 1===a.type?2===a.$1.type?0===a.$2.type?new h(new p(!0)):new h(new p(!1)):new h(new p(!1)):new h(new p(!1))}}function qe(){return function(a){if(1===a.type){var b=a.$1;a=3===b.type?0===a.$2.type?new h(new p(!0)):new h(new p(!1)):2===b.type?0===b.$1.type?new h(new p(!1)):0===a.$2.type?new h(new p(!0)):new h(new p(!1)):new h(new p(!1))}else a=new h(new p(!1));return a}}function re(){return function(a){if(1===a.type){var b=a.$1;a=12===b.type?0===a.$2.type?new h(new p(!0)):
new d(new q(new r(1,1),n(null,a),a)):11===b.type?0===a.$2.type?new h(new p(!0)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function da(){return function(a){return 0===(" "===a?1:0)?0===("\t"===a?1:0)?0===("\r"===a?1:0)?0===("\n"===a?1:0)?0===("\f"===a?1:0)?0===("\v"===a?1:0)?"\u00a0"===a:!0:!0:!0:!0:!0:!0}}function se(){return function(a){return 1===a.type?8===a.$1.type?0===a.$2.type?
new h(new p(!0)):new h(new p(!1)):new h(new p(!1)):new h(new p(!1))}}function te(){return function(a){return 1===a.type?1===a.$1.type?0===a.$2.type?new h(new p(!0)):new h(new p(!1)):new h(new p(!1)):new h(new p(!1))}}function ue(){return function(a){return 1===a.type?0===a.$1.type?0===a.$2.type?new h(new p(!0)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,1),n(null,a),a)):new d(new q(new r(1,1),n(null,a),a))}}function sb(){return function(a){return function(b){if(""===
a)b=new sa(b);else{var c=""===a?f.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];var e=""===a?f.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);b=new E(c,e,Ic(c,b))}return b}}}function ve(){return function(a){a:{if(1===a.type){var b=a.$1;if(2===b.type){var c=a.$2;if(1===c.type){var e=c.$1;a=2===e.type?0===c.$2.type?new h(new z(L(null,b.$1,e.$1))):ec(null,t,a):ec(null,t,a);break a}}}a=ec(null,t,a)}return a}}function we(){return function(a){if(1===
a.type){var b=a.$1;a=2===b.type?0===a.$2.type?new h(new Z(n(null,b.$1))):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function xe(){return function(a){return ye(a)}}function ze(){return function(a){return Ae(a)}}function Be(){return function(a){return Ce(a)}}function De(){return function(a){if(1===a.type){var b=a.$1;a=10===b.type?b.$1?0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,
1),n(null,a),a)):0===a.$2.type?new h(new p(!0)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function Ee(){return function(a){a:{if(1===a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=tb(new g(a.$1,new g(b.$1,t)));a=0===a.type?new d(a.$1):Fe(null,null,a.$1);break a}}a=new d(new q(new r(2,2),n(null,a),a))}return a}}function Ge(){return function(a){return He(a)}}function Ie(){return function(a){a:{if(1===
a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=tb(new g(a.$1,new g(b.$1,t)));a=0===a.type?new d(a.$1):Je(null,null,a.$1);break a}}a=new d(new q(new r(2,2),n(null,a),a))}return a}}function Ke(){return function(a){a=1===a.type?0===a.$2.type?ub(null,Gc(),null,new g(a.$1,t),new Z(new f.jsbn.BigInteger("0"))):ub(null,Gc(),null,a.$2,a.$1):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Le(){return function(a){return Me(a)}}function Ne(){return function(a){return Oe(a)}}function Pe(){return function(a){return Qe(a)}}
function Re(){return function(a){return"b"===a?Jb(aa(Ua(),O("01")),ya(Ua(),O("01"),new f.jsbn.BigInteger("2")),za(aa(Ua(),O("01")))):"d"===a?Pc():"o"===a?Jb(aa(Va(),y(T())),ya(Va(),O("01234567"),new f.jsbn.BigInteger("8")),za(aa(Va(),y(T())))):"x"===a?Jb(aa(Wa(),C(null,y(T()),O("ABCDEFabcdef"))),ya(Wa(),C(null,y(T()),O("ABCDEFabcdef")),new f.jsbn.BigInteger("16")),za(aa(Wa(),C(null,y(T()),O("ABCDEFabcdef"))))):Xa()}}function Se(){return function(a){return"b"===a?ya(Ua(),O("01"),new f.jsbn.BigInteger("2")):
"d"===a?ya(Aa(),y(T()),new f.jsbn.BigInteger("10")):"o"===a?ya(Va(),O("01234567"),new f.jsbn.BigInteger("8")):"x"===a?ya(Wa(),C(null,y(T()),O("ABCDEFabcdef")),new f.jsbn.BigInteger("16")):Xa()}}function Te(){return function(a){return"b"===a?aa(Ua(),O("01")):"d"===a?aa(Aa(),y(T())):"o"===a?aa(Va(),y(T())):"x"===a?aa(Wa(),C(null,y(T()),O("ABCDEFabcdef"))):Xa()}}function Ue(){return function(a){return"b"===a?za(aa(Ua(),O("01"))):"d"===a?za(aa(Aa(),y(T()))):"o"===a?za(aa(Va(),y(T()))):"x"===a?za(aa(Wa(),
C(null,y(T()),O("ABCDEFabcdef")))):Xa()}}function Ve(a){return function(a){return function(b){var c=b.$1.$1;var k=b.$1.$1.$2(a.$6)(b.$7);var d=b.$1.$1.$2(a.$7)(b.$6);c=c.$1(k)(d);k=b.$1.$1.$2(a.$7)(b.$7);return Ya(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function We(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$7);var k=b.$1.$1.$2(a.$7)(b.$6);return Ya(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function Xe(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$6);var k=b.$1.$1.$2(a.$7)(b.$7);
return Ya(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function Ye(a){return function(a){return function(b){var c=b.$5;var k=b.$1.$1.$2(a.$6)(b.$7);var d=b.$1.$1.$2(b.$6)(a.$7);c=c.$2(k)(d);k=b.$1.$1.$2(a.$7)(b.$7);return Ya(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,k)}}}function Ze(a,b,c,e,k){return function(a){a=k(a)(new fc(1,0));a=0===a.type?e.$1(null)(null)(new $e(a.$1)):new x(a.$1);return a}}function B(){return function(a){return ea(a)}}function af(){return function(a){return bf(a)}}function cf(){return function(a){if(1===
a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new h(new Z(new f.jsbn.BigInteger(""+b.$1.length))):new d(new l("Invalid arguments to `string-length`")):new d(new l("Invalid arguments to `string-length`"))}else a=new d(new l("Invalid arguments to `string-length`"));return a}}function df(){return function(a){return ef(a)}}function ff(){return function(a){if(1===a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new h(new gc(b.$1)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new m("string",a.$1)):
new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function gf(){return function(a){return hf(a)}}function jf(){return function(a){if(1===a.type){var b=a.$1;a=1===b.type?0===a.$2.type?new h(new Oa(b.$1)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function kf(a,b){return function(a){return function(c){c=b(a)(c);c=0===c.type?new sa(c.$1):
new E(c.$1,c.$2,c.$3);return c}}}function Qc(a,b){return function(c){return lf(a,b,c)}}function vb(){return function(a){a=8===a.type?new h(a.$1):new d(new m("string",a));return a}}function mf(){return function(a){if(1===a.type){var b=a.$1;a=0===b.type?0===a.$2.type?new h(new Z(new f.jsbn.BigInteger(""+b.$1))):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new m("Vector",a.$1)):new d(new q(new r(1,1),n(null,a),a))}else a=new d(new q(new r(1,1),n(null,a),a));return a}}function nf(){return function(a){return of(a)}}
function pf(){return function(a){var b="c"+(ta(null,null,R(),"",a)+"r");a=ta(null,null,qf(),rf(),a);return new w(b,a)}}function sf(){return function(a){return function(b){return new w(a,b)}}}function tf(){return function(a){return uf(a)}}function vf(a,b){return function(c){c=1===b.type?new u(S(null,a,c,b.$1),Rc(a,c,b.$2)):new x(t);return new u(c,tf())}}function wf(){return function(a){return"("===a}}function xf(){return function(a){return"["===a}}function yf(){return function(a){return"{"===a}}function wb(a){return function(b){return function(b){return function(c){return new E(a,
b,c)}}}}function zf(a){return function(b){return v(null,null,Af(a),wb(b))}}function Bf(a){return function(b){return v(null,null,a,zf(b))}}function M(){return function(a){return a}}function Sc(a){return function(b){return v(null,null,a,wb(b))}}function ua(){return function(a){return function(b){return new E(t,a,b)}}}function Cf(a,b){return function(c){return Kb(null,a,b)}}function xb(){return function(a){return function(b){return a===b}}}function Df(a,b){return function(c){c=1===c.type?new x(c.$1):
a.$1(null)(null)(new l("Unknown atom: "+b));return c}}function H(){return function(a){return B()}}function Tc(){return function(a){return new x(a)}}function Uc(a,b){return function(c){if(12===b.type)if(Ba(n(null,b.$2),n(null,c))?0:1!==b.$3.type)var e=a.$1(null)(null)(new q(new xa(n(null,b.$2).intValue()|0),n(null,c),c));else{e=a.$3.$6(b.$5);var k=Lb(null,null,null,sf(),b.$2,c);var d=b.$3;if(1===d.type){d=d.$1;c:for(var h=n(null,b.$2);;)if(h.equals(new f.jsbn.BigInteger("0")))break c;else if(1===c.type)h=
h.subtract(new f.jsbn.BigInteger("1")),c=c.$2;else break c;d=new g(new w(d,new z(c)),t)}else d=t;e=e(L(null,k,d));e=new u(e,vf(a,b.$4))}else 11===b.type?(e=b.$1(c),e=0===e.type?a.$1(null)(null)(e.$1):new x(e.$1)):e=a.$1(null)(null)(new l("application: not a procedure; expected a procedure that can be applied to arguments; given: "+ea(b)));return new u(e,Tc())}}function Ef(a,b){return function(c){if(1===c.type){var e=c.$1;c=2===e.type?0===c.$2.type?new x(e.$1):a.$1(null)(null)(new q(new r(2,2),n(null,
c),c)):0===c.$2.type?a.$1(null)(null)(new m("list",c.$1)):a.$1(null)(null)(new q(new r(2,2),n(null,c),c))}else c=a.$1(null)(null)(new q(new r(2,2),n(null,c),c));return new u(c,Uc(a,b))}}function Ff(a,b,c){return function(e){return new u(yb(null,a,b,new g(c,t)),Ef(a,e))}}function Gf(a,b,c,e){return function(k){return new u(S(null,a,b,c),Ff(a,b,e))}}function Hf(a,b,c){return function(e){return new u(yb(null,a,b,c),Uc(a,e))}}function I(a,b,c,e){return function(k){return new u(S(null,a,b,c),Hf(a,b,e))}}
function If(a,b,c){return function(e){return Vc(null,a,null,null,b,e,c)}}function Za(){return function(a){return new x(va)}}function Jf(a,b,c){return function(e){e=a.$3.$5(b)(c)(e);return new u(e,Za())}}function Kf(a,b,c,e){return function(k){k=10===k.type?k.$1?S(null,a,b,e):S(null,a,b,c):S(null,a,b,e);return k}}function Lf(a,b,c){return function(e){return new x(new zb("\u03bb",U(null,null,B(),a),fa,b,c))}}function Mf(){return function(a){return function(b){return Nf(a,b)}}}function Of(a,b){return function(c){return Ga(null,
a,c,b)}}function Pf(a,b,c,e){return function(k){k=a.$3.$6(b)(Lb(null,null,null,Mf(),c,k));return new u(k,Of(a,e))}}function Qf(a,b,c,e){return function(k){return Rf(a,b,c,e,k)}}function Sf(a,b,c,e,k){return function(d){return new u(Mb(null,a,b),Qf(a,c,e,k))}}function Tf(a,b,c,e){return function(k){return Uf(a,b,c,e,k)}}function hc(a,b,c){return function(e){return Ga(null,a,b,c)}}function Vf(a,b,c,e){return function(k){return new u(Wc(null,null,null,null,a,k,b,c),hc(a,k,e))}}function Wf(a,b,c,e){return function(k){return Xf(a,
b,c,e,k)}}function Yf(a,b,c,e,k){return function(d){return new u(Mb(null,a,b),Wf(a,c,e,k))}}function Zf(a,b,c,e){return function(k){return $f(a,b,c,e,k)}}function ag(){return function(a){return function(b){return bg(a,b)}}}function cg(a,b,c,e){return function(k){return new u(Xc(null,null,null,null,a,b,Lb(null,null,null,ag(),c,k)),hc(a,b,e))}}function dg(a,b,c,e,k){return function(d){return new u(yb(null,a,b,c),cg(a,b,e,k))}}function eg(a,b,c,e){return function(k){return new u(Yc(null,null,null,null,
a,k,b),dg(a,k,c,b,e))}}function fg(a,b,c,e){return function(k){return gg(a,b,c,e,k)}}function hg(a,b,c,e,k){return function(d){return new u(Mb(null,a,b),fg(a,c,e,k))}}function ig(a,b,c,e){return function(k){return jg(a,b,c,e,k)}}function kg(a){return function(b){b=a.$2(null)(ea(b)+"\n");return new u(b,Za())}}function lg(a,b,c){return function(e){e=a.$3.$4(b)(c)(e);return new u(e,Za())}}function mg(a,b,c,e,k){return function(d){return new u(ng(null,null,a,b,c,e,d,k),Za())}}function og(a,b,c,e){return function(k){var d=
a.$3.$3(b)(c);return new u(d,mg(c,e,a,b,k))}}function ic(a){return function(b){return new x(new g(a,b))}}function pg(a,b,c){return function(e){return new u(yb(null,a,b,c),ic(e))}}function qg(a,b){return function(c){var e=ee(null,a,b);c=1===c.type?new u(e(c.$1),Zc(e,c.$2)):new x(t);return new u(c,Tc())}}function Nc(){return function(a){return function(b){return jc(null,null,b.$1,b.$2,a)}}}function rg(a){return function(b){return sg(a,b)}}function tg(a){return function(b){return ug(a,b)}}function ie(){return function(a){return function(a){return function(a){return function(b){return function(c){c=
b(c);return a(c)}}}}}}function Jc(){return function(a){return function(a){return function(b){return a}}}}function je(){return function(a){return function(a){return function(a){return function(b){return function(c){var e=a(c);c=b(c);return e(c)}}}}}}function cc(){return function(a){return function(b){return a==b}}}function Lc(){return function(a){return function(b){return Ab(a,b)}}}function dc(){return function(a){return function(b){b=0>Ab(a,b)?!0:a==b;return b}}}function vg(){return function(a){return new h(new z(a))}}
function $c(a){return function(b){return function(c){return function(e){return new E(new g(a,b),c,e)}}}}function wg(a){return function(b){return v(null,null,C(null,J(null,a),ua()),$c(b))}}function xg(){return function(a){return")"===a}}function yg(){return function(a){return"]"===a}}function zg(){return function(a){return"}"===a}}function X(){return function(a){return function(b){return a.add(b)}}}function Y(){return function(a){return function(b){return a.multiply(b)}}}function $a(){return function(a){return function(b){return ad(a,
b)}}}function ab(){return function(a){return function(b){return Bb(a,b)}}}function pa(){return function(a){return function(b){return a.equals(b)}}}function bb(){return function(a){a=0>Ca(a,new f.jsbn.BigInteger("0"))?(new f.jsbn.BigInteger("0")).subtract(a):a;return a}}function cb(){return function(a){return function(b){return Ca(a,b)}}}function db(){return function(a){return function(b){b=0>Ca(a,b)?!0:a.equals(b);return b}}}function eb(){return function(a){return function(b){return a.subtract(b)}}}
function Ag(){return function(a){return Math.cos(a)}}function Bg(){return function(a){return function(b){return new ha((Math.exp(b)+Math.exp(-b))/2*Math.cos(a),(Math.exp(b)-Math.exp(-b))/2*-1*Math.sin(a))}}}function Cg(){return function(a){return ub(null,Dg(),null,a,new Z(new f.jsbn.BigInteger("0")))}}function Eg(){return function(a){a=0===a.type?new h(new Z(new f.jsbn.BigInteger("1"))):ub(null,Fg(null),null,a,new Z(new f.jsbn.BigInteger("1")));return a}}function Gg(){return function(a){a=1===a.type?
ub(null,Hg(null,null),null,a.$2,a.$1):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Ig(){return function(a){return 1===a.type?6===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):D(a):1===a.type?5===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):
D(a):D(a):D(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):D(a):D(a)}}function Jg(){return function(a){return 1===a.type?6===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):D(a):1===a.type?5===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):
D(a):D(a):D(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):D(a):D(a)}}function Kg(){return function(a){return 1===a.type?5===a.$1.type?0===a.$2.type?new h(new p(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a):D(a)}}function Lg(){return function(a){return 1===a.type?7===a.$1.type?0===a.$2.type?new h(new p(!0)):D(a):D(a):D(a)}}function Mg(){return function(a){a=1===a.type?fb("=",
Ng(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Og(){return function(a){a=1===a.type?fb("/=",Pg(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Qg(){return function(a){a=1===a.type?fb(">",Rg(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Sg(){return function(a){a=1===a.type?fb("<",Tg(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));
return a}}function Ug(){return function(a){a=1===a.type?fb(">=",Vg(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Wg(){return function(a){a=1===a.type?fb("<=",Xg(null,null),a.$1,a.$2):new d(new q(new xa(1),new f.jsbn.BigInteger("0"),t));return a}}function Yg(){return function(a){return Math.sin(a)}}function Zg(){return function(a){return function(b){return new ha((Math.exp(b)+Math.exp(-b))/2*Math.sin(a),(Math.exp(b)-Math.exp(-b))/2*Math.cos(a))}}}function gb(){return function(a){return function(a){return a}}}
function Xa(){return function(a){return function(a){return new sa(a)}}}function bd(a){return function(b){var c=""===a?f.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];return b===c}}function kc(){return function(a){a=cd(a)?!0:dd(a);return a}}function $g(a){return function(b){return function(c){var e="#f"===a?new p(!1):"#t"===a?new p(!0):new gc(a);return new E(e,b,c)}}}function ah(a){return function(b){b=ta(null,null,R(),"",new g(a,b));return $g(b)}}function bh(){return function(a){return v(null,
null,C(null,J(null,C(null,y(kc()),C(null,y(T()),O("!#$%&|*+-/:<=>?@^_~")))),ua()),ah(a))}}function lc(){return function(a){return function(a){return function(b){return new E(va,a,b)}}}}function ed(){return function(a){return v(null,null,mc(null,null,Cb("|#"),C(null,v(null,null,Cb("#|"),ed()),v(null,null,sb(),lc()))),lc())}}function ch(){return function(a){a=cd(a)?String.fromCharCode((a.charCodeAt(0)|0)+32):a;return a}}function dh(a){return function(b){return function(c){return eh(a,b,c)}}}function fh(){return function(a){a=
ta(null,null,R(),"",U(null,null,ch(),a));return dh(a)}}function gh(){return function(a){return v(null,null,J(null,y(kc())),fh())}}function Ua(){return function(a){return Nb(Vd(),new f.jsbn.BigInteger("2"),null,new f.jsbn.BigInteger("0"),a)}}function Aa(){return function(a){return Nb(ae(),new f.jsbn.BigInteger("10"),null,new f.jsbn.BigInteger("0"),a)}}function hh(){return function(a){return ih(a)}}function jh(){return function(a){return kh(a)}}function lh(){return function(a){return"i"===a}}function mh(a,
b,c){return function(e){e=1===a.type?new E(new V(new ha(b,a.$1)),c,e):new sa(e);return e}}function nc(){return function(a){return new sa(a)}}function nh(a,b){return function(c){return function(c){c=1===a.type?mh(b,a.$1,c):nc();return c}}}function oh(a){return function(b){return v(null,null,y(lh()),nh(a,b))}}function ph(a,b,c){return function(e){return v(null,null,qa(null,null,jh(),C(null,a,C(null,b,c))),oh(e))}}function Wa(){return function(a){return Nb(fe(),new f.jsbn.BigInteger("16"),null,new f.jsbn.BigInteger("0"),
a)}}function Va(){return function(a){return Nb(Ne(),new f.jsbn.BigInteger("8"),null,new f.jsbn.BigInteger("0"),a)}}function ca(){return function(a){return function(a){return function(b){return new E(Sa,a,b)}}}}function Ob(){return function(a){return"."===a}}function qh(a,b,c,e){return function(k){return rh(a,b,c,e,k)}}function sh(a,b,c){return function(e){return new E(new z(L(null,a,b)),c,e)}}function th(a,b,c){return function(e){return uh(a,b,c,e)}}function vh(a,b){return function(c){return function(c){c=
3===a.type?qh(b,a.$1,a.$2,c):2===a.type?sh(b,a.$1,c):th(b,a,c);return c}}}function wh(a){return function(b){return v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),vh(b,a))}}function xh(a){return function(b){return v(null,null,Ia(),wh(a))}}function yh(a){return function(b){return v(null,null,v(null,null,J(null,y(da())),ca()),xh(a))}}function zh(){return function(a){return v(null,null,y(Ob()),yh(a))}}function Ah(){return function(a){a=Ia();var b=v(null,null,J(null,y(da())),ca());a=C(null,J(null,
v(null,null,a,Sc(b))),ua());return v(null,null,a,zh())}}function Db(){return function(a){return"#"===a}}function Bh(){return function(a){return v(null,null,O("bdox"),Se())}}function fd(){return function(a){return"-"===a}}function Ch(){return function(a){return-a}}function gd(){return function(a){return"+"===a}}function Dh(){return function(a){return v(null,null,O("bdox"),Te())}}function Eh(){return function(a){return(new f.jsbn.BigInteger("0")).subtract(a)}}function Fh(){return function(a){return";"===
a}}function Gh(){return function(a){return"\n"===a}}function Hh(){return function(a){return v(null,null,mc(null,null,y(Gh()),sb()),lc())}}function Ih(){return function(a){return function(b){return function(c){return new E(new z(a),b,c)}}}}function Jh(){return function(a){return v(null,null,O("bdox"),Re())}}function Kh(){return function(a){return"'"===a}}function Lh(){return function(a){return function(b){return function(c){return new E(new z(new g(new gc("quote"),new g(a,t))),b,c)}}}}function Mh(){return function(a){return v(null,
null,Ia(),Lh())}}function Nh(){return function(a){return v(null,null,O("bdox"),Ue())}}function Oh(){return function(a){return Ph(a)}}function Qh(){return function(a){return"/"===a}}function Rh(){return function(a){return Sh(a)}}function Th(a){return function(b){return function(c){c=1===a.type?new E(new na(a.$1),b,c):new sa(c);return c}}}function Uh(a){return function(b){b=Ya(null,new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),
M()),eb()),a,b);return Th(b)}}function Vh(a,b){return function(c){return v(null,null,qa(null,null,Rh(),a),Uh(b))}}function Wh(a){return function(b){return v(null,null,y(Qh()),Vh(a,b))}}function Xh(){return function(a){return v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),wb(a))}}function Yh(){return function(a){a=Ia();var b=v(null,null,J(null,y(da())),ca());a=v(null,null,a,hd(b,a));return v(null,null,C(null,a,ua()),Xh())}}function id(){return function(a){return'"'===a}}function Zh(){return function(a){a:for(var b=
'"\\';;){if(""===b){a=$h(a);break a}var c=""===b?f.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):b[0];if(0===(a===c?1:0))b=""===b?f.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):b.slice(1);else{a=Xa();break a}}return a}}function ai(a){return function(b){return function(b){return function(c){return new E(new Oa(ta(null,null,R(),"",a)),b,c)}}}}function bi(){return function(a){return v(null,null,y(id()),ai(a))}}function ci(){return function(a){return v(null,
null,C(null,J(null,C(null,v(null,null,y(di()),ei()),v(null,null,sb(),Zh()))),ua()),bi())}}function fi(a,b,c,e){return function(k){k=0===a.type?new sa(k):new E(new z(new g(b,L(null,c,a))),e,k);return k}}function gi(a,b,c){return function(e){return function(e){e=0===a.type?nc():fi(b,c,a,e);return e}}}function hi(a,b){return function(c){return v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),gi(a,c,b))}}function ii(a,b){return function(c){c=Ia();var e=v(null,null,J(null,y(da())),ca());c=v(null,
null,c,hd(e,c));return v(null,null,C(null,c,ua()),hi(a,b))}}function ji(a,b){return function(c){return v(null,null,v(null,null,J(null,y(da())),ca()),ii(a,b))}}function ki(a,b){return function(c){return v(null,null,y(Ob()),ji(a,b))}}function li(a){return function(b){return v(null,null,v(null,null,J(null,y(da())),ca()),ki(a,b))}}function mi(a){return function(b){return v(null,null,Ia(),li(a))}}function ni(a){return function(b){return v(null,null,v(null,null,J(null,y(da())),ca()),mi(a))}}function oi(){return function(a){return v(null,
null,y(Ob()),ni(a))}}function pi(){return function(a){a=Ia();var b=v(null,null,J(null,y(da())),ca());a=C(null,J(null,v(null,null,a,Sc(b))),ua());return v(null,null,a,oi())}}function qi(){return function(a){return function(b){return function(c){return new E(new ri(n(null,a).intValue()|0,a),b,c)}}}}function si(){return function(a){return v(null,null,jd(null,kd()),qi())}}function ti(){return function(a){return new w(a.$1,new ui(a.$2))}}function vi(){return function(a){return new h(va)}}function ld(){return function(a){return function(b){return a}}}
function md(){return function(a){return function(a){return function(a){return new Ka(La(),nd(a))}}}}function od(){return function(a){return function(a){return new Ka(La(),Na(null,null,null,wi(a)))}}}function jb(){return function(a){return function(a){return xi(null,a)}}}function kb(){return function(a){return function(a){return yi(null,a)}}}function lb(){return function(a){return function(a){return function(b){return zi(null,a,b)}}}}function pd(){return function(a){return function(b){var c=new mb(jb(),
kb(),lb());return new Ka(La(),Na(null,null,null,Ai(null,null,null,a,c,b)))}}}function qd(){return function(a){var b=new mb(jb(),kb(),lb());return new Ka(La(),Na(null,null,null,he(null,null,b,a)))}}function rd(){return function(a){return function(b){var c=new mb(jb(),kb(),lb());return new Ka(La(),Na(null,null,null,Bi(null,null,null,b,c,a)))}}}function sd(){return function(a){return function(b){return function(c){var e=new mb(jb(),kb(),lb());return new Ka(La(),Na(null,null,null,Ci(null,null,null,b,
c,e,a)))}}}}function td(){return function(a){return function(b){return function(c){var e=new mb(jb(),kb(),lb());return new Ka(La(),Na(null,null,null,Di(null,null,null,b,c,e,a)))}}}}function ud(){return function(a){return function(b){var c=new mb(jb(),kb(),lb());return new Ka(La(),Na(null,null,null,Ei(null,null,a,b,c)))}}}function Fi(){return function(a){return 13!==a.type}}function Gi(){return function(a){a=U(null,null,B(),vd(null,Fi(),a));a=ta(null,null,R(),"",wd(U(null,null,Hi(),a)));return new x(a)}}
function Ii(a){return function(b){var c=new xd(md(),od(),new yd(pd(),qd(),rd(),sd(),td(),ud()));b=new u(Ze(null,null,null,c,Pa(null,null,qa(null,null,ld(),C(null,J(null,v(null,null,Ha(null,y(da())),Ji())),ua())),de()))(a),qg(c,b));return new u(b,Gi())}}function Ki(){return function(a){return function(b){return function(b){return new h(a)}}}}function Li(){return function(a){return function(b){return Mi(a)}}}function Ni(a,b){return function(c){return function(e){return zd(null,null,null,null,null,e,
a(c),b)}}}function Oi(a,b,c){return function(b){return function(c){return a(b)(c)}}}function Pi(a,b){return function(c){return a(c)(b)}}function $h(a){return function(b){return function(c){return new E(a,b,c)}}}function Qi(a,b){return function(c){return new E(a,b,c)}}function Ri(a){return function(b){return function(c){c=a(b)?Qi(b,c):nc();return c}}}function Si(){return function(a){return ia(null,oa(),P,a)}}function Ti(){return function(a){return function(b){return ia(null,oa(),a,b)}}}function Ui(){return function(a){return function(b){return!!(0>
Ab(a,b))}}}function Vi(){return function(a){return function(b){return!!(0<Ab(a,b))}}}function Wi(){return function(a){return function(b){b=0<Ab(a,b)?!0:a==b;return b}}}function Xi(){return function(a){return function(b){return new E("",a,b)}}}function Yi(a){return function(b){b=""===a?f.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);return v(null,null,Cb(b),wb(a))}}function Zi(){return function(a){return new g(a,t)}}function Hi(){return function(a){if(1===
ja(0===(""==a?1:0)?!0:!1,!0).type)a=t;else{var b=0===(""==a.slice(1)?1:0)?!0:!1;1===ja(b,!0).type?b=t:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===ja(b,!0).type?b=t:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===ja(b,!0).type?t:new g(a.slice(1).slice(1).slice(1)[0],oc(a.slice(1).slice(1).slice(1).slice(1))),b=new g(a.slice(1).slice(1)[0],b)),b=new g(a.slice(1)[0],b));a=new g(a[0],b)}return a}}function pc(){return function(a){if(1===ja(0===(""==a?1:0)?!0:!1,!0).type)a=t;else{var b=0===
(""==a.slice(1)?1:0)?!0:!1;1===ja(b,!0).type?b=t:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===ja(b,!0).type?b=t:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,1===ja(b,!0).type?b=t:(b=0===(""==a.slice(1).slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===ja(b,!0).type?t:new g(a.slice(1).slice(1).slice(1).slice(1)[0],oc(a.slice(1).slice(1).slice(1).slice(1).slice(1))),b=new g(a.slice(1).slice(1).slice(1)[0],b)),b=new g(a.slice(1).slice(1)[0],b)),b=new g(a.slice(1)[0],b));a=new g(a[0],b)}return a}}
function $i(){return function(a){return function(b){return L(null,a,new g(" ",b))}}}function aj(a){return function(b){return function(c){return function(e){return new E(a(b),c,e)}}}}function bj(a){return function(b){return v(null,null,a,aj(b))}}function La(){return function(a){return function(a){return function(a){return function(b){return F(null,null,null,a,cj(b))}}}}}function wi(a){return function(b){f.prim_writeStr(a+"\n");return Sa}}function nd(a){return function(b){return new d(a)}}function cj(a){return function(b){b=
0===b.type?nd(b.$1):a(b.$1);return b}}function qa(a,b,c,e){return function(a){return function(b){b=e(a)(b);b=0===b.type?new sa(b.$1):new E(c(b.$1),b.$2,b.$3);return b}}}function xi(a,b){return function(a){return{val:b}}}function yi(a,b){return function(a){return b.val}}function zi(a,b,c){return function(a){return b.val=c}}function v(a,b,c,e){return function(a){return function(b){b=c(a)(b);b=0===b.type?new sa(b.$1):e(b.$1)(b.$2)(b.$3);return b}}}function qc(){return function(a){return function(a){return function(a){return function(b){return U(null,
null,a,b)}}}}}function rc(){return function(a){return function(a){return new g(a,t)}}}function dj(a){return function(b){return function(c){return L(null,U(null,null,b,a),c)}}}function sc(){return function(a){return function(a){return function(a){return function(b){return ta(null,null,dj(b),t,a)}}}}}function qf(){return function(a){return function(b){return function(c){0===("a"===a?1:0)?(c=b(c),c=0===c.type?new d(c.$1):Fc(new g(c.$1,t))):(c=b(c),c=0===c.type?new d(c.$1):Ec(new g(c.$1,t)));return c}}}}
function ej(){return function(a){return function(a){return function(a){return function(b){return function(c){c=b(c);return a(c)}}}}}}function fj(){return function(a){return function(a){return function(a){return function(b){return function(c){var e=a(c);c=b(c);return e(c)}}}}}}function gj(a,b,c){return function(e){return function(k){var d=a.$2(null)(b)(k);return a.$3(null)(b)(jc(null,null,c,e,d))(k)}}}function hj(a,b,c){return function(e){return function(k){var d=a.$2(null)(b)(k);return a.$3(null)(b)(jc(null,
null,c,e,d))(k)}}}function Zc(a,b){return function(c){var e=1===b.type?new u(a(b.$1),Zc(a,b.$2)):new x(t);return new u(e,ic(c))}}function Pb(){return function(a){return function(b){return a+b}}}function Qb(){return function(a){return function(b){return a*b}}}function Rb(){return function(a){return a.intValue()}}function ij(a,b,c,e){return function(k){return function(d){return function(h){var K=c(e);var g=c(k);if(0===(g.equals(new f.jsbn.BigInteger("0"))?1:0)){g=g.intValue();var Kc=b.intValue();K=
K.intValue()+g/tc(null,new N(Pb(),Qb(),Rb()),Kc,(new f.jsbn.BigInteger(Math.trunc(Math.floor(Math.log(g)/Math.log(Kc)))+"")).add(new f.jsbn.BigInteger("1")))}else K=K.intValue();return new E(new Q(a(K)),d,h)}}}}function jj(a,b,c,e,k){return function(d){return v(null,null,J(null,a),ij(b,c,e,k))}}function kj(a,b,c,e){return function(k){return v(null,null,y(Ob()),jj(a,b,c,e,k))}}function lj(a,b){return function(c){return new Z(a(b(c)))}}function di(){return function(a){return"\\"===a}}function mj(){return function(a){return function(b){return function(c){return nj(a,
b,c)}}}}function ei(){return function(a){return v(null,null,O('\\"nrt'),mj())}}function oj(){return function(a){return v(null,null,Ha(null,y(da())),wb(a))}}function Ji(){return function(a){return v(null,null,Ia(),oj())}}function Ad(){return function(a){return function(b){return new g(a,b)}}}function hd(a,b){return function(c){return v(null,null,C(null,J(null,Pa(null,null,qa(null,null,gb(),a),b)),ua()),$c(c))}}function Bd(){return function(a){return function(a){return!0}}}function pj(a,b){return function(c){return v(null,
null,mc(null,null,a,b),ca())}}function Cd(a,b){return function(c){return new g(c,uc(null,null,null,null,null,a,b))}}function qj(a,b,c){return function(e){return new g(e,uc(null,null,null,null,null,Cd(a,b),c))}}function Rc(a,b,c){return function(e){var k=1===c.type?new u(S(null,a,b,c.$1),Rc(a,b,c.$2)):new x(t);return new u(k,ic(e))}}function Dd(){return function(a){return function(b){return a-b}}}function rj(){return function(a){return function(b){return a/b}}}function sj(a,b,c,e){return function(k){k=
10===k.type?k.$1?0===e.type?new x(k):Ga(null,b,a,e):vc(null,a,null,b,c):0===e.type?new x(k):Ga(null,b,a,e);return k}}function tj(a,b,c,e){return function(k){k=10===k.type?k.$1?0===e.type?new x(k):Ga(null,b,a,e):vc(null,a,null,b,c):0===e.type?new x(k):Ga(null,b,a,e);return k}}function uj(a,b,c,e,k){return function(d){d=d?Ga(null,b,a,k):Vc(null,a,null,null,b,c,e);return d}}function vj(a,b,c){return function(e){e=10===e.type?e.$1?new x(!0):Eb(null,null,null,null,a,new g(b,new g(new z(c),t))):Eb(null,
null,null,null,a,new g(b,new g(new z(c),t)));return e}}function wj(a,b,c){return function(e){e=10===e.type?e.$1?new x(!0):Eb(null,null,null,null,a,new g(b,new g(new z(c),t))):Eb(null,null,null,null,a,new g(b,new g(new z(c),t)));return e}}function xj(a,b,c,e){return function(k){return Wc(null,null,null,null,a,b,c,e)}}function yj(a,b,c,e,k){return function(d){return zj(a,b,c,e,k,d)}}function Aj(a,b,c){return function(e){return Yc(null,null,null,null,a,b,c)}}function Bj(a,b,c){return function(e){return Xc(null,
null,null,null,a,b,c)}}function rf(){return function(a){a=1===a.type?0===a.$2.type?new h(a.$1):new h(new z(a)):new h(new z(a));return a}}function Ei(a,b,c,e,k){return function(a){var b=bc(null,null,null,new rb(ej(),Jc(),fj()),Dc(null,null,k),e)(a),d=k.$1(null),f=new Fa(cc(),Lc(),dc());b=Mc(null,null,Nc(),new Oc(f),b);a=d(b)(a);return new Cj(a,c)}}function Di(a,b,c,e,k,d,f){return function(a){if(1===f.type){var b=d.$2(null)(f.$1)(a);b=0===b.type?fa:nb(null,null,b.$1,null,e,b.$2);1===b.type?a=d.$3(null)(b.$1)(k)(a):
(b=d.$1(null)(k),a=gj(d,f.$1,e)(b(a))(a))}else b=d.$2(null)(f.$1)(a),b=0===b.type?fa:nb(null,null,b.$1,null,e,b.$2),1===b.type?a=d.$3(null)(b.$1)(k)(a):(b=d.$1(null)(k),a=hj(d,f.$1,e)(b(a))(a));return a}}function Bi(a,b,c,e,k,d){return function(a){a:for(var b=d;;)if(1===b.type){var c=k.$2(null)(b.$1)(a);c=0===c.type?fa:nb(null,null,c.$1,null,e,c.$2);if(1===c.type){a=k.$2(null)(c.$1)(a);a=new ka(a);break a}b=b.$2}else{b=k.$2(null)(b.$1)(a);b=0===b.type?fa:nb(null,null,b.$1,null,e,b.$2);if(1===b.type){a=
k.$2(null)(b.$1)(a);a=new ka(a);break a}a=fa;break a}return a}}function Dg(){return function(a){return Dj(a)}}function Ci(a,b,c,e,k,d,f){return function(a){a:for(var b=f;;)if(1===b.type){var c=d.$2(null)(b.$1)(a);c=0===c.type?fa:nb(null,null,c.$1,null,e,c.$2);if(1===c.type){b=d.$3(null)(c.$1)(k);c=Bd();a=c(b(a))(a);break a}b=b.$2}else{b=d.$2(null)(b.$1)(a);b=0===b.type?fa:nb(null,null,b.$1,null,e,b.$2);if(1===b.type){b=d.$3(null)(b.$1)(k);c=Bd();a=c(b(a))(a);break a}a=!1;break a}return a}}function Ai(a,
b,c,e,k,d){return function(f){return Ed(a,b,c,e,k,d,f)}}function Ng(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new h(new p(Fb(null,xb(),a.$1,b.$1))):new d(new l("Unexpected error in ="));else if(5===b.type)b=5===a.type?new h(new p(a.$1===b.$1)):new d(new l("Unexpected error in ="));else if(4===b.type)b=4===a.type?new h(new p(a.$1.equals(b.$1))):new d(new l("Unexpected error in ="));else if(7===b.type&&7===a.type){b=b.$1;var c=a.$1;var e=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);
b=b.$2(e)(c);b=new h(new p(b))}else b=new d(new l("Unexpected error in ="));return b}}}function Rg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new d(new l("> not defined for complex numbers")):new d(new l("Unexpected error in >"));else if(5===b.type)b=5===a.type?new h(new p(!!(0<Da(a.$1,b.$1)))):new d(new l("Unexpected error in >"));else if(4===b.type)b=4===a.type?new h(new p(!!(0<Ca(a.$1,b.$1)))):new d(new l("Unexpected error in >"));else if(7===b.type&&7===a.type){var c=
b.$1,e=a.$1;b=c.$4;var f=c.$1.$1.$2(e.$6)(c.$7);c=c.$1.$1.$2(c.$6)(e.$7);b=!!(0<b.$2(f)(c));b=new h(new p(b))}else b=new d(new l("Unexpected error in >"));return b}}}function Vg(a,b){return function(a){return function(b){a:if(6===b.type)var c=6===a.type?new d(new l(">= not defined for complex numbers")):new d(new l("Unexpected error in >="));else{if(5===b.type){if(5===a.type){c=0<Da(a.$1,b.$1)?!0:a.$1===b.$1;c=new h(new p(c));break a}}else if(4===b.type){if(4===a.type){c=0<Ca(a.$1,b.$1)?!0:a.$1.equals(b.$1);
c=new h(new p(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var e=b.$4;var f=b.$1.$1.$2(c.$6)(b.$7);var g=b.$1.$1.$2(b.$6)(c.$7);0<e.$2(f)(g)?c=!0:(e=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(e)(c));c=new h(new p(c));break a}c=new d(new l("Unexpected error in >="))}return c}}}function Tg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new d(new l("< not defined for complex numbers")):new d(new l("Unexpected error in <"));else if(5===b.type)b=5===a.type?
new h(new p(!!(0>Da(a.$1,b.$1)))):new d(new l("Unexpected error in <"));else if(4===b.type)b=4===a.type?new h(new p(!!(0>Ca(a.$1,b.$1)))):new d(new l("Unexpected error in <"));else if(7===b.type&&7===a.type){var c=b.$1,e=a.$1;b=c.$4;var f=c.$1.$1.$2(e.$6)(c.$7);c=c.$1.$1.$2(c.$6)(e.$7);b=!!(0>b.$2(f)(c));b=new h(new p(b))}else b=new d(new l("Unexpected error in <"));return b}}}function Xg(a,b){return function(a){return function(b){a:if(6===b.type)var c=6===a.type?new d(new l("<= not defined for complex numbers")):
new d(new l("Unexpected error in <="));else{if(5===b.type){if(5===a.type){c=0>Da(a.$1,b.$1)?!0:a.$1===b.$1;c=new h(new p(c));break a}}else if(4===b.type){if(4===a.type){c=0>Ca(a.$1,b.$1)?!0:a.$1.equals(b.$1);c=new h(new p(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var e=b.$4;var f=b.$1.$1.$2(c.$6)(b.$7);var g=b.$1.$1.$2(b.$6)(c.$7);0>e.$2(f)(g)?c=!0:(e=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(e)(c));c=new h(new p(c));break a}c=new d(new l("Unexpected error in <="))}return c}}}
function Pg(a,b){return function(a){return function(b){a:if(6===b.type)b=6===a.type?new h(new p(!Fb(null,xb(),a.$1,b.$1))):new d(new l("Unexpected error in /="));else{if(5===b.type){if(5===a.type){b=new h(new p(0===(a.$1===b.$1?1:0)?!0:!1));break a}}else if(4===b.type){if(4===a.type){b=0===(a.$1.equals(b.$1)?1:0)?!0:!1;b=new h(new p(b));break a}}else if(7===b.type&&7===a.type){b=b.$1;var c=a.$1;var e=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);b=!b.$2(e)(c);b=new h(new p(b));break a}b=new d(new l("Unexpected error in /="))}return b}}}
function Hg(a,b){return function(c){return Ej(a,b,c)}}function Fg(a){return function(b){return Fj(a,b)}}function Gb(a,b,c,e,d,f,h){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d;this.$6=f;this.$7=h}function ha(a,b){this.type=0;this.$1=a;this.$2=b}function g(a,b){this.type=1;this.$1=a;this.$2=b}function Fd(a,b){this.type=2;this.$1=a;this.$2=b}function u(a,b){this.type=1;this.$1=a;this.$2=b}function Ea(a,b,c){this.type=1;this.$1=a;this.$2=b;this.$3=c}function Hb(a,b,c,e,d){this.type=
2;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d}function Gj(a,b){this.type=10;this.$1=a;this.$2=b}function l(a){this.type=6;this.$1=a}function Oc(a){this.type=0;this.$1=a}function Cj(a,b){this.type=1;this.$1=a;this.$2=b}function ke(a){this.type=0;this.$1=a}function ka(a){this.type=1;this.$1=a}function ob(a,b){this.type=0;this.$1=a;this.$2=b}function d(a){this.type=0;this.$1=a}function Ka(a,b){this.type=2;this.$1=a;this.$2=b}function gc(a){this.type=1;this.$1=a}function p(a){this.type=10;this.$1=
a}function ma(a){this.type=9;this.$1=a}function V(a){this.type=6;this.$1=a}function Ma(a,b){this.type=3;this.$1=a;this.$2=b}function Q(a){this.type=5;this.$1=a}function zb(a,b,c,e,d){this.type=12;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d}function Z(a){this.type=4;this.$1=a}function z(a){this.type=2;this.$1=a}function $e(a){this.type=5;this.$1=a}function ui(a){this.type=11;this.$1=a}function na(a){this.type=7;this.$1=a}function Oa(a){this.type=8;this.$1=a}function ri(a,b){this.type=0;this.$1=
a;this.$2=b}function Gd(a,b){this.type=1;this.$1=a;this.$2=b}function xa(a){this.type=0;this.$1=a}function r(a,b){this.type=1;this.$1=a;this.$2=b}function w(a,b){this.type=0;this.$1=a;this.$2=b}function fc(a,b){this.type=0;this.$1=a;this.$2=b}function q(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function sa(a){this.type=0;this.$1=a}function E(a,b,c){this.type=1;this.$1=a;this.$2=b;this.$3=c}function x(a){this.type=0;this.$1=a}function h(a){this.type=1;this.$1=a}function Hd(a,b){this.type=1;
this.$1=a;this.$2=b}function m(a,b){this.type=1;this.$1=a;this.$2=b}function Sb(a){this.type=4;this.$1=a}function ib(a,b){this.type=0;this.$1=a;this.$2=b}function rb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function xd(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function yd(a,b,c,e,d,f){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=e;this.$5=d;this.$6=f}function Hj(a,b){this.type=0;this.$1=a;this.$2=b}function mb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function hb(a,b,c){this.type=
0;this.$1=a;this.$2=b;this.$3=c}function Ja(a,b){this.type=0;this.$1=a;this.$2=b}function N(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Fa(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function A(a,b){this.type=0;this.$1=a;this.$2=b}function L(a,b,c){return 1===b.type?new g(b.$1,L(null,b.$2,c)):c}function Ya(a,b,c,e,d,h,g,l){a=b.$1.$3(new f.jsbn.BigInteger("0"));if(c(l)(a))return fa;a=e.$2(g);var k=e.$2(l);a:for(;;){var K=b.$1.$3(new f.jsbn.BigInteger("0"));if(c(k)(K))break a;else K=
b.$3(a)(k),a=k,k=K}g=b.$2(g)(a);l=b.$2(l)(a);return new ka(new Gb(b,c,e,d,h,g,l))}function Ud(a){for(;;)if(1===a.type){if(0===a.$2.type)return new h(a.$1);var b=a.$1;if(10===b.type)if(b.$1)a=a.$2;else return new h(new p(!1));else a=a.$2}else return new h(new p(!0))}function Wd(a){return"0"===a?new f.jsbn.BigInteger("0"):"1"===a?new f.jsbn.BigInteger("1"):new f.Lazy(function(){throw Error("*** ParseNumber.idr:74:23:unmatched case in ParseNumber.case block in binConverter at ParseNumber.idr:74:23 ***");
})}function jd(a,b){return v(null,null,C(null,y(wf()),C(null,y(xf()),y(yf()))),Bf(b))}function Ec(a){if(1===a.type){var b=a.$1;return 3===b.type?(b=b.$1,1===b.type?0===a.$2.type?new h(b.$1):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new l("car expected pair, found "+ea(a.$1))):new d(new q(new r(1,1),n(null,a),a))):2===b.type?(b=b.$1,1===b.type?0===a.$2.type?new h(b.$1):new d(new q(new r(1,1),n(null,a),a)):0===b.type?0===a.$2.type?new d(new l("Unexpected error in car")):new d(new q(new r(1,
1),n(null,a),a)):0===a.$2.type?new d(new l("car expected pair, found "+ea(a.$1))):new d(new q(new r(1,1),n(null,a),a))):0===a.$2.type?new d(new l("car expected pair, found "+ea(a.$1))):new d(new q(new r(1,1),n(null,a),a))}return new d(new q(new r(1,1),n(null,a),a))}function Fc(a){if(1===a.type){var b=a.$1;if(3===b.type){var c=b.$1;return 1===c.type?0===c.$2.type?0===a.$2.type?new h(f.force(b.$2)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new Ma(c.$2,new f.Lazy(function(){return f.force(b.$2)}))):
new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new l("cdr expected pair, found "+ea(a.$1))):new d(new q(new r(1,1),n(null,a),a))}return 2===b.type?(c=b.$1,1===c.type?0===c.$2.type?0===a.$2.type?new h(new z(t)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new z(c.$2)):new d(new q(new r(1,1),n(null,a),a)):0===c.type?0===a.$2.type?new d(new l("cdr on empty list")):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new d(new l("cdr expected pair, found "+ea(a.$1))):new d(new q(new r(1,
1),n(null,a),a))):0===a.$2.type?new d(new l("cdr expected pair, found "+ea(a.$1))):new d(new q(new r(1,1),n(null,a),a))}return new d(new q(new r(1,1),n(null,a),a))}function wa(a){return(0<wc(a,0)||0===a)&&0>wc(a,1114112)?String.fromCharCode(a):"\x00"}function $d(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=b.$1;return 3===c.type?0===b.$2.type?new h(new Ma(new g(a.$1,c.$1),new f.Lazy(function(){return f.force(c.$2)}))):new d(new q(new r(2,2),n(null,a),a)):2===c.type?0===b.$2.type?new h(new z(new g(a.$1,
c.$1))):new d(new q(new r(2,2),n(null,a),a)):0===b.$2.type?new h(new Ma(new g(a.$1,t),new f.Lazy(function(){return b.$1}))):new d(new q(new r(2,2),n(null,a),a))}}return new d(new q(new r(2,2),n(null,a),a))}function be(a){return"0"===a?new f.jsbn.BigInteger("0"):"1"===a?new f.jsbn.BigInteger("1"):"2"===a?new f.jsbn.BigInteger("2"):"3"===a?new f.jsbn.BigInteger("3"):"4"===a?new f.jsbn.BigInteger("4"):"5"===a?new f.jsbn.BigInteger("5"):"6"===a?new f.jsbn.BigInteger("6"):"7"===a?new f.jsbn.BigInteger("7"):
"8"===a?new f.jsbn.BigInteger("8"):"9"===a?new f.jsbn.BigInteger("9"):new f.Lazy(function(){throw Error("*** ParseNumber.idr:31:23:unmatched case in ParseNumber.case block in decConverter at ParseNumber.idr:31:23 ***");})}function ad(a,b){return 0===(b.equals(new f.jsbn.BigInteger("0"))?1:0)?a.divide(b):new f.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:341:22-27:unmatched case in Prelude.Interfaces.case block in divBigInt at ./Prelude/Interfaces.idr:341:22-27 ***");})}function ce(a){if(2===
a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ha(a.$1-b.$1,a.$2-b.$2),new h(new V(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new h(new Q(a.$1-c.$1)):new d(new l("Unexpected error in -")):new d(new l("Unexpected error in -"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new Z(a.$1.subtract(c.$1))):new d(new l("Unexpected error in -")):
new d(new l("Unexpected error in -"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?Tb(Ye(null),a.$1,c.$1,"-"):new d(new l("Unexpected error in -")):new d(new l("Unexpected error in -"))}return new d(new l("Unexpected error in -"))}function Kb(a,b,c){return 1===c.type?(a=c.$1,a=1===a.type?new x(a):b.$1(null)(null)(new l("Type error")),new u(a,Cf(b,c.$2))):new x(va)}function Ib(a){for(;;)if(1===a.type){var b=a.$1;if(1===b.type){var c=a.$2;if(1===c.type){var e=c.$1;
return 1===e.type?0===c.$2.type?new h(new p(b.$1==e.$1)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))}return new d(new q(new r(2,2),n(null,a),a))}if(10===b.type)return e=a.$2,1===e.type?(c=e.$1,10===c.type?0===e.$2.type?(b=b.$1,b=new h(new p(c.$1?b:!b))):b=0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):b=0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)),b):
new d(new q(new r(2,2),n(null,a),a));if(9===b.type)return c=a.$2,1===c.type?(e=c.$1,9===e.type?0===c.$2.type?new h(new p(b.$1===e.$1)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):new d(new q(new r(2,2),n(null,a),a));if(6===b.type)return c=a.$2,1===c.type?(e=c.$1,6===e.type?0===c.$2.type?new h(new p(Fb(null,xb(),b.$1,e.$1))):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?
new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):new d(new q(new r(2,2),n(null,a),a));if(3===b.type)if(c=a.$2,1===c.type)if(e=c.$1,3===e.type)if(0===c.$2.type)a=new g(new z(L(null,b.$1,new g(f.force(b.$2),t))),new g(new z(L(null,e.$1,new g(f.force(e.$2),t))),t));else return 0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a));else return 0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a));else return new d(new q(new r(2,2),n(null,a),a));else{if(5===b.type)return c=
a.$2,1===c.type?(e=c.$1,5===e.type?0===c.$2.type?new h(new p(b.$1===e.$1)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):new d(new q(new r(2,2),n(null,a),a));if(4===b.type)return c=a.$2,1===c.type?(e=c.$1,4===e.type?0===c.$2.type?new h(new p(b.$1.equals(e.$1))):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):
new d(new q(new r(2,2),n(null,a),a));if(2===b.type){e=a.$2;if(1===e.type){c=e.$1;if(2===c.type&&0===e.$2.type){if(Ba(n(null,b.$1),n(null,c.$1))){a=Ij(null,null,b.$1,c.$1);if(0===a.type)return new d(a.$1);b=Ba(n(null,b.$1),n(null,c.$1))?a.$1:!1;return new h(new p(b))}return new h(new p(!1))}return 0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))}return new d(new q(new r(2,2),n(null,a),a))}if(7===b.type)return c=a.$2,1===c.type?(e=c.$1,7===e.type&&0===c.$2.type?(a=e.$1,c=b.$1,
b=a.$1.$1.$2(c.$6)(a.$7),c=a.$1.$1.$2(a.$6)(c.$7),b=a.$2(b)(c),new h(new p(b))):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):new d(new q(new r(2,2),n(null,a),a));if(8===b.type)return c=a.$2,1===c.type?(e=c.$1,8===e.type?0===c.$2.type?new h(new p(b.$1==e.$1)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):0===a.$2.$2.type?new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a))):new d(new q(new r(2,2),n(null,a),a));b=a.$2;return 1===b.type?0===b.$2.type?
new h(new p(!1)):new d(new q(new r(2,2),n(null,a),a)):new d(new q(new r(2,2),n(null,a),a))}}else return new d(new q(new r(2,2),n(null,a),a))}function S(a,b,c,e){if(1===e.type)return c=b.$3.$3(c)(e.$1),new u(c,Df(b,e.$1));if(10===e.type||9===e.type)return new x(e);if(6===e.type)return 0===(0===e.$1.$2?1:0)?new x(e):new x(new Q(e.$1.$1));if(5===e.type||4===e.type)return new x(e);if(2===e.type){a=e.$1;if(1===a.type){e=a.$1;if(1===e.type){e=e.$1;if("apply"===e){e=a.$2;if(1===e.type){var d=e.$2;if(1===
d.type){if(0===d.$2.type)return a=b.$3.$1(new A(B(),H()))(c),new u(a,Gf(b,c,e.$1,d.$1));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("case"===e)return a=a.$2,1===a.type?new u(S(null,b,c,a.$1),If(c,b,a.$2)):b.$1(null)(null)(new l("case: bad syntax in: (case)"));if("cond"===e)return vc(null,c,null,b,a.$2);if("define"===e){e=a.$2;if(1===e.type){d=e.$1;if(1===
d.type){e=e.$2;if(1===e.type){if(0===e.$2.type)return new u(S(null,b,c,e.$1),Jf(b,c,d.$1));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if(3===d.type){var h=d.$1;if(1===h.type){var g=h.$1;if(1===g.type)return b=b.$3.$5(c)(g.$1)(new zb(g.$1,U(null,null,B(),h.$2),new ka(ea(f.force(d.$2))),e.$2,c)),new u(b,Za());e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,
a.$1,a.$2))}if(2===d.type){d=d.$1;if(1===d.type){h=d.$1;if(1===h.type)return b=b.$3.$5(c)(h.$1)(new zb(h.$1,U(null,null,B(),d.$2),fa,e.$2,c)),new u(b,Za());e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("if"===e){e=a.$2;if(1===e.type){d=e.$2;if(1===d.type){h=d.$2;if(1===h.type){if(0===h.$2.type)return new u(S(null,
b,c,e.$1),Kf(b,c,h.$1,d.$1));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("lambda"===e){e=a.$2;if(1===e.type){d=e.$1;if(1===d.type)return new x(new zb("\u03bb",U(null,null,B(),t),new ka(ea(e.$1)),e.$2,c));if(3===d.type)return new x(new zb("\u03bb",U(null,null,B(),d.$1),new ka(ea(f.force(d.$2))),
e.$2,c));if(2===d.type)return b=b.$3.$1(new A(B(),H()))(c),new u(b,Lf(d.$1,e.$2,c));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("let"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new u(Ub(null,b,d.$1),Tf(b,d.$1,c,e.$2));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("let*"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new u(Ub(null,
b,d.$1),Zf(b,d.$1,c,e.$2));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("letrec"===e){e=a.$2;if(1===e.type){d=e.$1;if(2===d.type)return new u(Ub(null,b,d.$1),ig(b,d.$1,c,e.$2));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("print"===e){e=a.$2;if(1===e.type){if(0===e.$2.type)return new u(S(null,b,c,e.$1),kg(b));e=b.$3.$1(new A(B(),H()))(c);
return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("quote"===e){e=a.$2;if(1===e.type){if(0===e.$2.type)return new x(e.$1);e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("set!"===e){d=a.$2;if(1===d.type){e=d.$1;if(1===e.type){d=d.$2;if(1===d.type){if(0===d.$2.type)return new u(S(null,b,c,d.$1),lg(b,c,e.$1));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),
H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}if("set-car!"===e){d=a.$2;if(1===d.type){e=d.$1;if(1===e.type){d=d.$2;if(1===d.type){if(0===d.$2.type)return new u(S(null,b,c,d.$1),og(b,c,e.$1,d.$1));e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=
b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}e=b.$3.$1(new A(B(),H()))(c);return new u(e,I(b,c,a.$1,a.$2))}return b.$1(null)(null)(new Fd("Unrecognized special form",e))}return 7===e.type?0===(e.$1.$7.equals(new f.jsbn.BigInteger("1"))?1:0)?new x(e):new x(new Z(e.$1.$6)):8===e.type?new x(e):0===e.type?new x(e):13===e.type?new x(va):b.$1(null)(null)(new Fd("Unrecognized special form",e))}function yb(a,b,c,e){return 1===e.type?
new u(S(null,b,c,e.$1),pg(b,c,e.$2)):new x(t)}function Ga(a,b,c,e){return 1===e.type?0===e.$2.type?S(null,b,c,e.$1):new u(S(null,b,c,e.$1),hc(b,c,e.$2)):new x(va)}function vd(a,b,c){for(;;)if(1===c.type){if(b(c.$1))return new g(c.$1,vd(null,b,c.$2));c=c.$2}else return c}function Id(a,b,c){return 1===c.type?0===c.$2.type?c.$1:b(c.$1)(Id(null,b,c.$2)):new f.Lazy(function(){throw Error("*** ./Prelude/Strings.idr:24:1-16:unmatched case in Prelude.Strings.foldr1 ***");})}function Ub(a,b,c){return 1===
c.type?(a=c.$1,2===a.type?(a=a.$1,1===a.type?new u(Ub(null,b,c.$2),rg(a.$1)):b.$1(null)(null)(new l("Unexpected error (getHeads)"))):b.$1(null)(null)(new l("Unexpected error (getHeads)"))):0===c.type?new x(new z(t)):b.$1(null)(null)(new l("Unexpected error (getHeads)"))}function Mb(a,b,c){return 1===c.type?(a=c.$1,2===a.type&&(a=a.$1,1===a.type)?(a=a.$2,1===a.type?0===a.$2.type?new u(Mb(null,b,c.$2),tg(a.$1)):b.$1(null)(null)(new l("Unexpected error (getTails)")):b.$1(null)(null)(new l("Unexpected error (getTails)"))):
b.$1(null)(null)(new l("Unexpected error (getTails)"))):0===c.type?new x(new z(t)):b.$1(null)(null)(new l("Unexpected error (getTails)"))}function ge(a){var b=null;b=dd(a)?String.fromCharCode((a.charCodeAt(0)|0)-32):a;return"0"===b?new f.jsbn.BigInteger("0"):"1"===b?new f.jsbn.BigInteger("1"):"2"===b?new f.jsbn.BigInteger("2"):"3"===b?new f.jsbn.BigInteger("3"):"4"===b?new f.jsbn.BigInteger("4"):"5"===b?new f.jsbn.BigInteger("5"):"6"===b?new f.jsbn.BigInteger("6"):"7"===b?new f.jsbn.BigInteger("7"):
"8"===b?new f.jsbn.BigInteger("8"):"9"===b?new f.jsbn.BigInteger("9"):"A"===b?new f.jsbn.BigInteger("10"):"B"===b?new f.jsbn.BigInteger("11"):"C"===b?new f.jsbn.BigInteger("12"):"D"===b?new f.jsbn.BigInteger("13"):"E"===b?new f.jsbn.BigInteger("14"):"F"===b?new f.jsbn.BigInteger("15"):new f.Lazy(function(){throw Error("*** ParseNumber.idr:55:23-33:unmatched case in ParseNumber.case block in hexConverter at ParseNumber.idr:55:23-33 ***");})}function $b(a,b,c){for(;;)if(1===c.type){if(b.equals(new f.jsbn.BigInteger("0")))return new ka(c.$1);
b=b.subtract(new f.jsbn.BigInteger("1"));c=c.$2}else return fa}function jc(a,b,c,e,k){if(0===k.type)return new Gd(k.$1,new ob(c,e));a=pb(null,null,k.$1,null,c,e,k.$2);0===a.type?a=new d(a.$1):(a=a.$1,b=a.$2,a=new h(new Ea(a.$1,b.$1,b.$2)));return new Gd(k.$1,a.$1)}function D(a){return 1===a.type?4===a.$1.type?0===a.$2.type?new h(new p(!0)):new d(new q(new r(1,1),n(null,a),a)):0===a.$2.type?new h(new p(!1)):new d(new q(new r(1,1),n(null,a),a)):new d(new q(new r(1,1),n(null,a),a))}function dd(a){return 0<
Ta(a,"a")||"a"===a?0>Ta(a,"z")?!0:"z"===a:!1}function cd(a){return 0<Ta(a,"A")||"A"===a?0>Ta(a,"Z")?!0:"Z"===a:!1}function Jj(a,b,c){for(;;)if(a=b.$2,1===a.type)b=new g(a.$1,a.$2);else return b.$1}function n(a,b){return 1===b.type?n(null,b.$2).add(new f.jsbn.BigInteger("1")):new f.jsbn.BigInteger("0")}function xc(a,b){for(;;)if(1===b.type)if(1===a.type)if(yc(a.$1,b.$1))a=a.$2,b=b.$2;else return!1;else return!1;else return 0===b.type?0===a.type:!1}function ye(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=
b.$1;if(2===c.type){if(0===b.$2.type){a:for(a=a.$1,c=c.$1;;)if(1===c.type)if(yc(c.$1,a)){c=new h(new z(new g(c.$1,c.$2)));break a}else c=c.$2;else{c=new h(new p(!1));break a}return c}return new d(new q(new r(1,1),n(null,a),a))}return 0===b.$2.type?new d(new m("list",b.$1)):new d(new q(new r(1,1),n(null,a),a))}}return new d(new q(new r(1,1),n(null,a),a))}function Ae(a){if(1===a.type){var b=a.$1;if(2===b.type){if(0===a.$2.type){a:for(a=t,b=b.$1;;)if(1===b.type)a=new g(b.$1,a),b=b.$2;else break a;return new h(new z(a))}return new d(new q(new r(1,
1),n(null,a),a))}return 0===a.$2.type?new d(new m("list",a.$1)):new d(new q(new r(1,1),n(null,a),a))}return 0===a.type?new d(new q(new r(1,1),new f.jsbn.BigInteger("0"),t)):new d(new q(new r(1,1),n(null,a),a))}function Ce(a){for(;;)if(1===a.type){var b=a.$1;if(4===b.type){var c=a.$2;if(1===c.type)return a=c.$1,9===a.type?0===c.$2.type?new h(new Oa(ta(null,null,R(),"",Jd(null,b.$1,a.$1)))):new d(new l("Invalid arguments to `make-string`")):new d(new l("Invalid arguments to `make-string`"));if(0===
c.type)a=new g(a.$1,new g(new ma(wa(0)),t));else return new d(new l("Invalid arguments to `make-string`"))}else return new d(new l("Invalid arguments to `make-string`"))}else return new d(new l("Invalid arguments to `make-string`"))}function J(a,b){return v(null,null,b,wg(b))}function Af(a){return"("===a?y(xg()):"["===a?y(yg()):"{"===a?y(zg()):new f.Lazy(function(){throw Error("*** Parse.idr:15:10-13:unmatched case in Parse.case block in matchBracket at Parse.idr:15:10-13 ***");})}function Bb(a,b){return 0===
(b.equals(new f.jsbn.BigInteger("0"))?1:0)?a.remainder(b):new f.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:345:22-27:unmatched case in Prelude.Interfaces.case block in modBigInt at ./Prelude/Interfaces.idr:345:22-27 ***");})}function Ic(a,b){return 0===("\n"===a?1:0)?new fc(b.$1,b.$2+1):new fc(b.$1+1,0)}function fb(a,b,c,e){for(;;)if(1===e.type){c=tb(new g(c,new g(e.$1,t)));if(0===c.type)return new d(c.$1);c=c.$1;if(2===c.type){var k=c.$1;if(1===k.type)if(c=k.$2,1===c.type)if(0===c.$2.type){var K=
b(k.$1)(c.$1);if(0===K.type)return b(k.$1)(c.$1);k=K.$1;if(10===k.type)if(k=k.$1)if(k)c=c.$1,e=e.$2;else return new d(new l("Unexpected error in "+a));else return new h(new p(!1));else return new d(new l("Unexpected error in "+a))}else return new f.Lazy(function(){return Vb()});else return new f.Lazy(function(){return Vb()});else return new f.Lazy(function(){return Vb()})}else return new f.Lazy(function(){return Vb()})}else return new h(new p(!0))}function tb(a){if(1===a.type){var b=a.$1;if(6===b.type){if(b=
a.$2,1===b.type){var c=b.$1;if(6===c.type){if(0===b.$2.type)return new h(new z(new g(a.$1,new g(b.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===c.type){if(0===b.$2.type)return new h(new z(new g(a.$1,new g(new V(new ha(c.$1,0)),t))));b=a.$2;return 0===b.$2.type?
(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===c.type){if(0===b.$2.type)return new h(new z(new g(a.$1,new g(new V(new ha(c.$1.intValue(),0)),t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):
7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===c.type){if(0===b.$2.type)return b=Qa(c.$1),1===b.type?new h(new z(new g(a.$1,new g(new V(new ha(b.$1,0)),t)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):
new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(5===b.type){if(c=a.$2,1===c.type){var e=c.$1;if(6===e.type){if(0===c.$2.type)return new h(new z(new g(new V(new ha(b.$1,0)),new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===
c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===c.$2.type)return new h(new z(new g(a.$1,new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===
e.type){if(0===c.$2.type)return new h(new z(new g(a.$1,new g(new Q(e.$1.intValue()),t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return b=Qa(e.$1),1===b.type?new h(new z(new g(a.$1,new g(new Q(b.$1),t)))):new d(new l("Unexpected error in numCast"));
b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(4===
b.type){if(c=a.$2,1===c.type){e=c.$1;if(6===e.type){if(0===c.$2.type)return new h(new z(new g(new V(new ha(b.$1.intValue(),0)),new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===c.$2.type)return new h(new z(new g(new Q(b.$1.intValue()),new g(c.$1,
t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===e.type){if(0===c.$2.type)return new h(new z(new g(a.$1,new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",
b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return new h(new z(new g(new na(new Gb(new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),M()),eb()),b.$1,new f.jsbn.BigInteger("1"))),new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",
b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(7===b.type){if(c=a.$2,1===c.type){e=c.$1;if(6===e.type){if(0===c.$2.type)return a=Qa(b.$1),1===a.type?new h(new z(new g(new V(new ha(a.$1,0)),new g(c.$1,
t)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(5===e.type){if(0===c.$2.type)return a=Qa(b.$1),1===a.type?new h(new z(new g(new Q(a.$1),new g(c.$1,t)))):new d(new l("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=
a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(4===e.type){if(0===c.$2.type)return new h(new z(new g(a.$1,new g(new na(new Gb(new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),M()),eb()),e.$1,new f.jsbn.BigInteger("1"))),t))));b=a.$2;return 0===
b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}if(7===e.type){if(0===c.$2.type)return new h(new z(new g(a.$1,new g(c.$1,t))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",
b.$1)):new d(new m("Integer",a.$1))):new d(new l("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",b.$1)):new d(new m("Integer",a.$1))}}else if(b=a.$2,1===b.type&&0===b.$2.type)return c=a.$1,6===c.type?new d(new m("Integer",b.$1)):5===c.type?new d(new m("Integer",b.$1)):4===c.type?new d(new m("Integer",b.$1)):7===c.type?new d(new m("Integer",
b.$1)):new d(new m("Integer",a.$1))}return new d(new l("Unexpected error in numCast"))}function He(a){if(Ba(n(null,a),new f.jsbn.BigInteger("2"))){a=tb(a);if(0===a.type)return new d(a.$1);a=a.$1;if(2===a.type){var b=a.$1;if(1===b.type&&(a=b.$1,4===a.type&&(b=b.$2,1===b.type))){var c=b.$1;return 4===c.type?0===b.$2.type?new h(new Z(ad(a.$1,c.$1))):new d(new l("Unexpected error in <=")):new d(new l("Unexpected error in <="))}}return new d(new l("Unexpected error in <="))}return new d(new q(new r(2,
2),n(null,a),a))}function ba(a){if(6===a.type){var b=a.$1.$1;return(0===(0===a.$1.$2?1:0)?0:b===Wb(b).intValue())?new h(new Z(Wb(b))):new d(new l("Could not convert complex to integer"))}return 5===a.type?0===(a.$1===Wb(a.$1).intValue()?1:0)?new d(new l("Could not convert float to integer")):new h(new Z(Wb(a.$1))):4===a.type?new h(a):7===a.type?0===(a.$1.$7.equals(new f.jsbn.BigInteger("1"))?1:0)?new d(new l("Could not convert rational to integer")):new h(new Z(a.$1.$6)):new d(new l("Could not convert non-number to integer"))}
function Me(a){if(1===a.type&&0===a.$2.type){var b=a.$1,c=null;c=6===b.type?new h(new p(!0)):5===b.type?new h(new p(!0)):7===b.type?new h(new p(!0)):D(new g(a.$1,t));if(0===c.type)return new d(c.$1);b=c.$1;return 10===b.type?(b=b.$1)?b?new h(new Oa(ea(a.$1))):new d(new l("Unexpected error")):new d(new m("number?",a.$1)):new d(new l("Unexpected error"))}return new f.Lazy(function(){throw Error("*** Numbers.idr:342:1-347:46:unmatched case in Numbers.numToString ***");})}function Oe(a){return"0"===a?
new f.jsbn.BigInteger("0"):"1"===a?new f.jsbn.BigInteger("1"):"2"===a?new f.jsbn.BigInteger("2"):"3"===a?new f.jsbn.BigInteger("3"):"4"===a?new f.jsbn.BigInteger("4"):"5"===a?new f.jsbn.BigInteger("5"):"6"===a?new f.jsbn.BigInteger("6"):"7"===a?new f.jsbn.BigInteger("7"):new f.Lazy(function(){throw Error("*** ParseNumber.idr:44:23:unmatched case in ParseNumber.case block in octConverter at ParseNumber.idr:44:23 ***");})}function O(a){if(""===a)return Pa(null,null,qa(null,null,gb(),sb()),Xa());var b=
""===a?f.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);return C(null,kf(null,y(bd(a))),O(b))}function Qe(a){for(;;)if(1===a.type){if(0===a.$2.type)return new h(a.$1);var b=a.$1;if(10===b.type){if(b.$1)return new h(new p(!0));a=a.$2}else return new h(a.$1)}else return new h(new p(!1))}function Pc(){return Jb(aa(Aa(),y(T())),ya(Aa(),y(T()),new f.jsbn.BigInteger("10")),za(aa(Aa(),y(T()))))}function Jb(a,b,c){return v(null,null,qa(null,null,hh(),C(null,c,C(null,
b,a))),ph(c,b,a))}function Ia(){return C(null,v(null,null,y(Db()),si()),C(null,C(null,v(null,null,y(Fh()),Hh()),v(null,null,Cb("#|"),ed())),C(null,C(null,C(null,Pc(),v(null,null,y(Db()),Jh())),C(null,C(null,za(aa(Aa(),y(T()))),v(null,null,y(Db()),Nh())),C(null,C(null,ya(Aa(),y(T()),new f.jsbn.BigInteger("10")),v(null,null,y(Db()),Bh())),C(null,aa(Aa(),y(T())),v(null,null,y(Db()),Dh()))))),C(null,v(null,null,Cb("#\\"),gh()),C(null,v(null,null,C(null,y(kc()),O("!#$%&|*+-/:<=>?@^_~")),bh()),C(null,v(null,
null,y(id()),ci()),C(null,v(null,null,y(Kh()),Mh()),jd(null,C(null,v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),pi()),C(null,v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),Ah()),v(null,null,kd(),Ih())))))))))))}function ya(a,b,c){return C(null,Pa(null,null,qa(null,null,gb(),y(fd())),zc(a,b,c,Ch())),C(null,Pa(null,null,qa(null,null,gb(),y(gd())),zc(a,b,c,M())),zc(a,b,c,M())))}function aa(a,b){return C(null,Pa(null,null,qa(null,null,gb(),y(fd())),Ac(a,b,Eh())),C(null,Pa(null,null,
qa(null,null,gb(),y(gd())),Ac(a,b,M())),Ac(a,b,M())))}function za(a){return v(null,null,qa(null,null,Oh(),a),Wh(a))}function kd(){return v(null,null,Ha(null,v(null,null,J(null,y(da())),ca())),Yh())}function tc(a,b,c,e){if(e.equals(new f.jsbn.BigInteger("0")))return b.$3(new f.jsbn.BigInteger("1"));a=e.subtract(new f.jsbn.BigInteger("1"));return b.$2(c)(tc(null,b,c,a))}function ia(a,b,c,e){a=b(e);b=0===c.type?new f.jsbn.BigInteger("0"):new f.jsbn.BigInteger("4");return(0<Ca(b,new f.jsbn.BigInteger("5"))||
(0===c.type?new f.jsbn.BigInteger("0"):new f.jsbn.BigInteger("4")).equals(new f.jsbn.BigInteger("5")))&&(1===ja(0===(""==a?1:0)?!0:!1,!0).type?0:"-"===a[0])?"("+(a+")"):a}function Tb(a,b,c,e){a=a(b)(c);return 1===a.type?new h(new na(a.$1)):new d(new l("Unexpected error in "+e))}function Qa(a){return 0===(a.$7.equals(new f.jsbn.BigInteger("0"))?1:0)?new ka(a.$6.intValue()/a.$7.intValue()):fa}function Jd(a,b,c){if(b.equals(new f.jsbn.BigInteger("0")))return t;a=b.subtract(new f.jsbn.BigInteger("1"));
return new g(c,Jd(null,a,c))}function Wb(a){var b=0<Da(a,0)?a-Math.floor(a):-(a-Math.ceil(a));a=0===((0<Da(a,0)?new f.jsbn.BigInteger("1"):0>Da(a,0)?new f.jsbn.BigInteger("-1"):new f.jsbn.BigInteger("0")).equals(new f.jsbn.BigInteger("1"))?1:0)?0>Da(b,.5)||.5===b?Math.ceil(a):Math.floor(a):0>Da(b,.5)||.5===b?Math.floor(a):Math.ceil(a);return new f.jsbn.BigInteger(Math.trunc(a)+"")}function Kj(a,b){var c=(new xd(md(),od(),new yd(pd(),qd(),rd(),sd(),td(),ud()))).$3.$2(U(null,null,ti(),L(null,new g(new w("vector?",
ue()),new g(new w("vector-length",mf()),new g(new w("vector-ref",nf()),t))),L(null,L(null,new g(new w("pair?",qe()),new g(new w("car",Xd()),new g(new w("cdr",Yd()),new g(new w("cons",Zd()),new g(new w("empty?",Hc()),new g(new w("null?",Hc()),new g(new w("list",vg()),new g(new w("list?",pe()),new g(new w("length",we()),new g(new w("append",ve()),new g(new w("reverse",ze()),new g(new w("member",xe()),t)))))))))))),U(null,null,pf(),L(null,Xb(null,null,null,new g("a",new g("d",t)),new rb(qc(),rc(),sc()),
2),L(null,Xb(null,null,null,new g("a",new g("d",t)),new rb(qc(),rc(),sc()),3),Xb(null,null,null,new g("a",new g("d",t)),new rb(qc(),rc(),sc()),4))))),L(null,new g(new w("+",Cg()),new g(new w("-",Ke()),new g(new w("*",Eg()),new g(new w("/",Gg()),new g(new w("modulo",Ee()),new g(new w("number?",Ig()),new g(new w("complex?",Jg()),new g(new w("real?",Kg()),new g(new w("rational?",Lg()),new g(new w("integer?",oe()),new g(new w("=",Mg()),new g(new w("/=",Og()),new g(new w(">",Qg()),new g(new w("<",Sg()),
new g(new w(">=",Ug()),new g(new w("<=",Wg()),new g(new w("quotient",Ge()),new g(new w("remainder",Ie()),new g(new w("sin",Qc(Yg(),Zg())),new g(new w("cos",Qc(Ag(),Bg())),new g(new w("number->string",Le()),t))))))))))))))))))))),L(null,new g(new w("string=?",qb(null,vb(),cc())),new g(new w("string<?",qb(null,vb(),Ui())),new g(new w("string>?",qb(null,vb(),Vi())),new g(new w("string<=?",qb(null,vb(),dc())),new g(new w("string>=?",qb(null,vb(),Wi())),new g(new w("string?",se()),new g(new w("string->symbol",
ff()),new g(new w("string-ref",df()),new g(new w("make-string",Be()),new g(new w("string-length",cf()),new g(new w("string-append",af()),new g(new w("substring",gf()),t)))))))))))),L(null,new g(new w("boolean?",me()),new g(new w("and",Td()),new g(new w("or",Pe()),new g(new w("not",De()),t)))),L(null,new g(new w("symbol?",te()),new g(new w("symbol->string",jf()),t)),L(null,new g(new w("procedure?",re()),t),new g(new w("char?",ne()),new g(new w("eq?",ac()),new g(new w("eqv?",ac()),new g(new w("equal?",
ac()),new g(new w("void",vi()),t))))))))))))));return le(null,null,null,null,zd(null,null,null,null,null,Kd,new u(c,Ii(a)),Ki()),Li(),ld())(b)}function zd(a,b,c,e,d,f,h,g){for(;;)if(1===h.type)a=Ni(h.$2,g),h=h.$1,g=a;else if(10===h.type)a=Oi(g,f,h.$2),f=Kd,h=h.$1,g=a;else return 2===h.type?h.$1(null)(null)(h.$2)(Pi(g,f)):g(h.$1)(f)}function y(a){return v(null,null,sb(),Ri(a))}function Mi(a){if(2===a.type)return a.$1+(": "+ea(a.$2));if(6===a.type)return a.$1;if(5===a.type)return a=a.$1,"Parse error (line "+
(ia(null,ra(),P,a.$1)+(", column "+(ia(null,ra(),P,a.$2)+")")));if(0===a.type){var b=a.$1;b=0===b.type?"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: at least "+(ia(null,ra(),P,b.$1)+("\ngiven: "+ia(null,la(),P,a.$2))):"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: "+((0===(b.$1===b.$2?1:0)?"between "+(ia(null,ra(),P,b.$1)+(" and "+ia(null,ra(),P,b.$2))):ia(null,ra(),P,b.$1))+("\ngiven: "+ia(null,la(),P,
a.$2)));a=0===a.$3.type?"":"\narguments:\n"+Yb(U(null,null,B(),a.$3));return b+a}return"Invalid type: expected "+(a.$1+(", found "+ea(a.$2)))}function ea(a){if(1===a.type)return a.$1;if(10===a.type){var b=a.$1;return b?b?"#t":"":"#f"}if(6===a.type){b=new A(Si(),Ti());a=a.$1;if(4===P.type)var c=Bc(P.$1,new f.jsbn.BigInteger("6"));else c=0===P.type?new f.jsbn.BigInteger("0"):new f.jsbn.BigInteger("4"),c=Ca(c,new f.jsbn.BigInteger("4"));0<c||(4===P.type?Ba(P.$1,new f.jsbn.BigInteger("6")):(0===P.type?
new f.jsbn.BigInteger("0"):new f.jsbn.BigInteger("4")).equals(new f.jsbn.BigInteger("4")))?(c=b.$2(new Sb(new f.jsbn.BigInteger("6")))(a.$1),b=b.$2(new Sb(new f.jsbn.BigInteger("6")))(a.$2),b="("+(c+(" :+ "+b)+")")):(c=b.$2(new Sb(new f.jsbn.BigInteger("6")))(a.$1),b=b.$2(new Sb(new f.jsbn.BigInteger("6")))(a.$2),b=c+(" :+ "+b));return b}return 3===a.type?"("+(Yb(U(null,null,B(),a.$1))+(" . "+(ea(f.force(a.$2))+")"))):5===a.type?ia(null,oa(),P,a.$1):12===a.type?"#<procedure:"+(a.$1+">"):4===a.type?
ia(null,la(),P,a.$1):2===a.type?"("+(Yb(U(null,null,B(),a.$1))+")"):7===a.type?(b=a.$1,ia(null,la(),P,b.$6)+("/"+ia(null,la(),P,b.$7))):8===a.type?'"'+(a.$1+'"'):0===a.type?"#("+(Yb(U(null,null,B(),a.$2))+")"):""}function Ha(a,b){return v(null,null,C(null,J(null,b),ua()),ca())}function bf(a){for(;;)if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type)if(a=c.$1,8===a.type)a=new g(new Oa(b.$1+a.$1),c.$2);else return new d(new l("Invalid arguments to `string-append`"));else return 0===c.type?
new h(a.$1):new d(new l("Invalid arguments to `string-append`"))}else return new d(new l("Invalid arguments to `string-append`"))}else return 0===a.type?new h(new Oa("")):new d(new l("Invalid arguments to `string-append`"))}function Cb(a){return""===a?Xi():v(null,null,y(bd(a)),Yi(a))}function ef(a){if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type){var e=c.$1;if(4===e.type){if(0===c.$2.type){a=e.$1;if(1===ja(0===(""==b.$1?1:0)?!0:!1,!0).type)a=fa;else if(a.equals(new f.jsbn.BigInteger("0")))a=
new ka(b.$1[0]);else if(a=a.subtract(new f.jsbn.BigInteger("1")),c=0===(""==b.$1.slice(1)?1:0)?!0:!1,1===ja(c,!0).type)a=fa;else if(a.equals(new f.jsbn.BigInteger("0")))a=new ka(b.$1.slice(1)[0]);else a:for(a=a.subtract(new f.jsbn.BigInteger("1")),c=0===(""==b.$1.slice(1).slice(1)?1:0)?!0:!1,1===ja(c,!0).type?b=t:(c=0===(""==b.$1.slice(1).slice(1).slice(1)?1:0)?!0:!1,c=1===ja(c,!0).type?Ld:new Hd(b.$1.slice(1).slice(1).slice(1)[0],b.$1.slice(1).slice(1).slice(1).slice(1)),b=new g(b.$1.slice(1).slice(1)[0],
Md(null,c)));;)if(1===b.type)if(a.equals(new f.jsbn.BigInteger("0"))){a=new ka(b.$1);break a}else a=a.subtract(new f.jsbn.BigInteger("1")),b=b.$2;else{a=fa;break a}return 1===a.type?new h(new ma(a.$1)):new d(new l("string-ref: index is out of range"))}b=a.$2;if(4===b.$1.type){if(0===b.$2.type)return new d(new m("string",a.$1));b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),n(null,a),a))}b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),
n(null,a),a))}b=a.$2;if(4===b.$1.type){if(0===b.$2.type)return new d(new m("string",a.$1));b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),n(null,a),a))}b=a.$2;return 0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),n(null,a),a))}return new d(new q(new r(2,2),n(null,a),a))}b=a.$2;if(1===b.type)return 4===b.$1.type&&0===b.$2.type?new d(new m("string",a.$1)):8===a.$1.type?(b=a.$2,0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),n(null,
a),a))):new d(new q(new r(2,2),n(null,a),a));if(8===a.$1.type)return b=a.$2,1===b.type?0===b.$2.type?new d(new m("integer",b.$1)):new d(new q(new r(2,2),n(null,a),a)):new d(new q(new r(2,2),n(null,a),a))}return new d(new q(new r(2,2),n(null,a),a))}function hf(a){if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type&&(a=c.$1,4===a.type)){var e=c.$2;if(1===e.type&&(c=e.$1,4===c.type&&0===e.$2.type)){e=a.$1;var k=null;k=0<Bc(e,new f.jsbn.BigInteger("0"))?!0:Ba(e,new f.jsbn.BigInteger("0"));
var g=null;return(g=k?0>Bc(c.$1,new f.jsbn.BigInteger(""+b.$1.length))?!0:Ba(c.$1,new f.jsbn.BigInteger(""+b.$1.length)):!1)?new h(new Oa(f.prim_strSubstr(e.intValue()|0,c.$1.subtract(a.$1).intValue()|0,b.$1))):new d(new l("substring: ending index is out of range"))}}}}return new f.Lazy(function(){throw Error("*** Strings.idr:58:1-64:73:unmatched case in Strings.substring ***");})}function Nd(a,b,c){return 0===c.type?t:uc(null,null,null,null,null,Zi(),c.$2)}function pb(a,b,c,e,k,f,g){if(1===g.type){if(c.$3(k)(g.$2)){k=
pb(null,null,c,null,k,f,g.$1);if(0===k.type)return new d(new Ea(k.$1,g.$2,g.$3));k=k.$1;f=k.$2;return new d(new Hb(k.$1,f.$1,f.$2,g.$2,g.$3))}k=pb(null,null,c,null,k,f,g.$3);if(0===k.type)return new d(new Ea(g.$1,g.$2,k.$1));k=k.$1;f=k.$2;return new d(new Hb(g.$1,g.$2,k.$1,f.$1,f.$2))}if(2===g.type){if(c.$3(k)(g.$2)){k=pb(null,null,c,null,k,f,g.$1);if(0===k.type)return new d(new Hb(k.$1,g.$2,g.$3,g.$4,g.$5));k=k.$1;f=k.$2;return new h(new w(new Ea(k.$1,f.$1,f.$2),new w(g.$2,new Ea(g.$3,g.$4,g.$5))))}if(c.$3(k)(g.$4)){k=
pb(null,null,c,null,k,f,g.$3);if(0===k.type)return new d(new Hb(g.$1,g.$2,k.$1,g.$4,g.$5));k=k.$1;f=k.$2;return new h(new w(new Ea(g.$1,g.$2,k.$1),new w(f.$1,new Ea(f.$2,g.$4,g.$5))))}k=pb(null,null,c,null,k,f,g.$5);if(0===k.type)return new d(new Hb(g.$1,g.$2,g.$3,g.$4,k.$1));k=k.$1;f=k.$2;return new h(new w(new Ea(g.$1,g.$2,g.$3),new w(g.$4,new Ea(k.$1,f.$1,f.$2))))}a=c.$2(k)(g.$1);return 0===a?new d(new ob(k,f)):0<a?new h(new w(new ob(g.$1,g.$2),new w(g.$1,new ob(k,f)))):new h(new w(new ob(k,f),
new w(k,new ob(g.$1,g.$2))))}function nb(a,b,c,e,d,f){for(;;)if(1===f.type)f=c.$3(d)(f.$2)?f.$1:f.$3;else if(2===f.type)f=c.$3(d)(f.$2)?f.$1:c.$3(d)(f.$4)?f.$3:f.$5;else return c.$1(d)(f.$1)?new ka(f.$2):fa}function lf(a,b,c){if(Ba(n(null,c),new f.jsbn.BigInteger("1"))){if(1===c.type){var e=c.$1;if(6===e.type)return 0===c.$2.type?(a=e.$1.$1,e=e.$1.$2,new h(new V(b(a)(e)))):new d(new l("Numerical input expected"));if(5===e.type)return 0===c.$2.type?new h(new Q(a(e.$1))):new d(new l("Numerical input expected"));
if(4===e.type)return 0===c.$2.type?new h(new Q(a(e.$1.intValue()))):new d(new l("Numerical input expected"));if(7===e.type&&0===c.$2.type)return b=Qa(e.$1),1===b.type?new h(new Q(a(b.$1))):new d(new l("Unexpected error"))}return new d(new l("Numerical input expected"))}return new d(new q(new r(1,1),n(null,c),c))}function wd(a){return 1===a.type?L(null,a.$1,new g("\n",wd(a.$2))):a}function oc(a){return 1===ja(0===(""==a?1:0)?!0:!1,!0).type?t:new g(a[0],oc(a.slice(1)))}function Yb(a){a=0===U(null,null,
pc(),a).type?U(null,null,pc(),a):Id(null,$i(),U(null,null,pc(),a));return ta(null,null,R(),"",a)}function of(a){if(1===a.type){var b=a.$1;if(0===b.type){var c=a.$2;if(1===c.type){var e=c.$1;if(4===e.type&&0===c.$2.type){a=$b(null,e.$1,b.$2);if(1===a.type)return new h(a.$1);e=e.$1;b=b.$2;b=new l("vector-ref: index is out of range; index: "+(ia(null,la(),P,e)+("; valid range: "+ia(null,la(),P,n(null,b)))));return new d(b)}return new d(new q(new r(2,2),n(null,a),a))}return 0===c.type?new d(new m("Vector",
a.$1)):new d(new q(new r(2,2),n(null,a),a))}return 0===a.$2.type?new d(new m("Vector",a.$1)):new d(new q(new r(2,2),n(null,a),a))}return new d(new q(new r(2,2),n(null,a),a))}function Lb(a,b,c,e,d,f){return 1===f.type?1===d.type?new g(e(d.$1)(f.$1),Lb(null,null,null,e,d.$2,f.$2)):d:1===d.type?t:d}function uf(a){return 1===a.type?new x(Jj(null,new g(a.$1,a.$2),null)):new f.Lazy(function(){throw Error("*** Eval.idr:88:28-45:unmatched case in Eval.case block in apply' at Eval.idr:88:28-45 ***");})}function Zb(){throw Error("*** Eval.idr:57:1-33:unmatched case in Eval.extractVar ***");
}function Nf(a,b){var c=null;c=1===a.type?a.$1:new f.Lazy(function(){return Zb()});return new w(c,b)}function Rf(a,b,c,e,d){return 2===d.type?new u(yb(null,a,b,d.$1),Pf(a,b,c,e)):new f.Lazy(function(){throw Error("*** Eval.idr:269:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:267:31-44 at Eval.idr:269:30-43 ***");})}function Uf(a,b,c,e,d){return 2===d.type?new u(Kb(null,a,d.$1),Sf(a,b,c,d.$1,e)):new f.Lazy(function(){throw Error("*** Eval.idr:267:31-44:unmatched case in Eval.case block in eval at Eval.idr:267:31-44 ***");
})}function Xf(a,b,c,e,d){if(2===d.type){var k=null;k=a.$3.$6(b)(t);return new u(k,Vf(a,c,d.$1,e))}return new f.Lazy(function(){throw Error("*** Eval.idr:276:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:274:31-44 at Eval.idr:276:30-43 ***");})}function $f(a,b,c,e,d){return 2===d.type?new u(Kb(null,a,d.$1),Yf(a,b,c,d.$1,e)):new f.Lazy(function(){throw Error("*** Eval.idr:274:31-44:unmatched case in Eval.case block in eval at Eval.idr:274:31-44 ***");})}function bg(a,b){var c=
null;c=1===a.type?a.$1:new f.Lazy(function(){return Zb()});return new w(c,b)}function gg(a,b,c,e,d){if(2===d.type){var k=null;k=a.$3.$6(b)(t);return new u(k,eg(a,c,d.$1,e))}return new f.Lazy(function(){throw Error("*** Eval.idr:291:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:289:31-44 at Eval.idr:291:30-43 ***");})}function jg(a,b,c,e,d){return 2===d.type?new u(Kb(null,a,d.$1),hg(a,b,c,d.$1,e)):new f.Lazy(function(){throw Error("*** Eval.idr:289:31-44:unmatched case in Eval.case block in eval at Eval.idr:289:31-44 ***");
})}function sg(a,b){return 2===b.type?new x(new z(new g(a,b.$1))):new f.Lazy(function(){throw Error("*** Eval.idr:35:22-32:unmatched case in Eval.case block in getHeads at Eval.idr:35:22-32 ***");})}function ug(a,b){return 2===b.type?new x(new z(new g(a,b.$1))):new f.Lazy(function(){throw Error("*** Eval.idr:42:22-32:unmatched case in Eval.case block in getTails at Eval.idr:42:22-32 ***");})}function Vb(){throw Error("*** Numbers.idr:231:24-37:unmatched case in Numbers.case block in numBoolBinop at Numbers.idr:231:24-37 ***");
}function eh(a,b,c){var e=null;Ba(new f.jsbn.BigInteger(""+a.length),new f.jsbn.BigInteger("1"))?(e=null,e=""===a?f.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0],e=new ma(e)):e="altmode"===a?new ma(wa(27)):"backnext"===a?new ma(wa(31)):"backspace"===a?new ma(wa(8)):"call"===a?new ma(wa(26)):"linefeed"===a?new ma(wa(10)):"newline"===a?new ma("\n"):"page"===a?new ma(wa(12)):"return"===a?new ma(wa(13)):"rubout"===a?new ma(wa(127)):"space"===a?new ma(" "):"tab"===a?
new ma(wa(9)):new f.Lazy(function(){throw Error("*** Parse.idr:73:14:unmatched case in Parse.case block in parseCharacter at Parse.idr:73:14 ***");});return new E(e,b,c)}function Od(){throw Error("*** ParseNumber.idr:256:9-39:unmatched case in ParseNumber.parseComplexHelper, toDouble ***");}function ih(a){return 5===a.type?new ka(a.$1):4===a.type?new ka(a.$1.intValue()):7===a.type?Qa(a.$1):new f.Lazy(function(){return Od()})}function kh(a){return 5===a.type?new ka(a.$1):4===a.type?new ka(a.$1.intValue()):
7===a.type?Qa(a.$1):new f.Lazy(function(){return Od()})}function rh(a,b,c,e,d){return new E(new Ma(L(null,a,b),new f.Lazy(function(){return f.force(c)})),e,d)}function uh(a,b,c,e){return new E(new Ma(a,new f.Lazy(function(){return b})),c,e)}function Pd(){throw Error("*** ParseNumber.idr:212:9-33:unmatched case in ParseNumber.parseRationalHelper, toInt ***");}function Ph(a){return 4===a.type?a.$1:new f.Lazy(function(){return Pd()})}function Sh(a){return 4===a.type?a.$1:new f.Lazy(function(){return Pd()})}
function Pa(a,b,c,e){return v(null,null,c,bj(e))}function ja(a,b){return b?a?Qd:Rd:a?Rd:Qd}function Fb(a,b,c,e){a=c.$1;var d=e.$1;return b(a)(d)?(c=c.$2,e=e.$2,b(c)(e)):!1}function yc(a,b){if(1===b.type)return 1===a.type?a.$1==b.$1:!1;if(10===b.type)return 10===a.type?(a=a.$1,b=b.$1?a:!a):b=!1,b;if(9===b.type)return 9===a.type?a.$1===b.$1:!1;if(6===b.type)return 6===a.type?Fb(null,xb(),a.$1,b.$1):!1;if(3===b.type)return 3===a.type?yc(f.force(a.$2),f.force(b.$2))?!1:xc(a.$1,b.$1):!1;if(5===b.type)return 5===
a.type?a.$1===b.$1:!1;if(4===b.type)return 4===a.type?a.$1.equals(b.$1):!1;if(2===b.type)return 2===a.type?xc(a.$1,b.$1):!1;if(7===b.type){if(7===a.type){b=b.$1;var c=a.$1;a=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);return b.$2(a)(c)}return!1}return 8===b.type?8===a.type?a.$1==b.$1:!1:0===b.type?0===a.type?0===(a.$1===b.$1?1:0)?xc(a.$2,b.$2):!1:!1:13===b.type?13===a.type:!1}function Ba(a,b){for(;;){if(b.equals(new f.jsbn.BigInteger("0")))return a.equals(new f.jsbn.BigInteger("0"))?!0:!1;b=b.subtract(new f.jsbn.BigInteger("1"));
if(a.equals(new f.jsbn.BigInteger("0")))return!1;a=a.subtract(new f.jsbn.BigInteger("1"))}}function Mc(a,b,c,e,d){for(;;)if(1===d.type)e=a=c(e)(d.$1),d=d.$2;else return e}function ta(a,b,c,e,d){return 1===d.type?c(d.$1)(ta(null,null,c,e,d.$2)):e}function U(a,b,c,e){return 1===e.type?new g(c(e.$1),U(null,null,c,e.$2)):e}function Ta(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function Da(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function wc(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:
0}function Ca(a,b){return 0===(a.equals(b)?1:0)?0===(0>a.compareTo(b)?1:0)?1:-1:0}function Bc(a,b){for(;;){if(b.equals(new f.jsbn.BigInteger("0"))){if(a.equals(new f.jsbn.BigInteger("0")))return 0;a.subtract(new f.jsbn.BigInteger("1"));return 1}b=b.subtract(new f.jsbn.BigInteger("1"));if(a.equals(new f.jsbn.BigInteger("0")))return-1;a=a.subtract(new f.jsbn.BigInteger("1"))}}function Ab(a,b){return 0===(a==b?1:0)?0===(a<b?1:0)?1:-1:0}function bc(a,b,c,e,d,f){return 1===f.type?(a=e.$2(null)(Ad()),a=
e.$3(null)(null)(a)(d(f.$1)),e.$3(null)(null)(a)(bc(null,null,null,e,d,f.$2))):e.$2(null)(t)}function nj(a,b,c){var e=null;e='"'===a?a:"\\"===a?a:"n"===a?"\n":"r"===a?"\r":"t"===a?"\t":new f.Lazy(function(){throw Error("*** Parse.idr:41:28:unmatched case in Parse.case block in Parse.parseString, escapedChar at Parse.idr:41:28 ***");});return new E(e,b,c)}function zj(a,b,c,e,d,g){var k=null;k=a.$3;var h=null;h=1===c.type?c.$1:new f.Lazy(function(){return Zb()});k=k.$5(b)(h)(g);return new u(k,xj(a,
b,e,d))}function Nb(a,b,c,e,d){for(;;)if(1===d.type)e=c=e.add(tc(null,new N(X(),Y(),M()),b,n(null,d.$2)).multiply(a(d.$1))),d=d.$2;else return e}function Dj(a){if(2===a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ha(a.$1+b.$1,a.$2+b.$2),new h(new V(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new h(new Q(a.$1+c.$1)):new d(new l("Unexpected error in +")):new d(new l("Unexpected error in +"))}else if(4===
a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new Z(a.$1.add(c.$1))):new d(new l("Unexpected error in +")):new d(new l("Unexpected error in +"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?Tb(Ve(null),a.$1,c.$1,"+"):new d(new l("Unexpected error in +")):new d(new l("Unexpected error in +"))}return new d(new l("Unexpected error in +"))}function Fe(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=
c.$1,6===b.type&&0===c.$2.type)){a=new V(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=ba(new V(b.$1));if(0===c.type)return ba(new V(b.$1));b=c.$1;return 4===b.type?new h(new V(new ha(a.$1.subtract((new f.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)).intValue(),0))):new f.Lazy(function(){throw Error("*** Numbers.idr:174:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 at Numbers.idr:174:25-34 ***");
})}return new f.Lazy(function(){throw Error("*** Numbers.idr:173:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new Q(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=ba(new Q(b.$1));if(0===c.type)return ba(new Q(b.$1));b=c.$1;return 4===b.type?new h(new Q(a.$1.subtract((new f.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+
"")).multiply(b.$1)).intValue())):new f.Lazy(function(){throw Error("*** Numbers.idr:170:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 at Numbers.idr:170:25-34 ***");})}return new f.Lazy(function(){throw Error("*** Numbers.idr:169:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 ***");})}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new Z(a.$1.subtract((new f.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/
c.$1.intValue()))+"")).multiply(c.$1)))):new d(new l("Unexpected error in modulo")):new d(new l("Unexpected error in modulo"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new na(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=ba(new na(b.$1));if(0===c.type)return ba(new na(b.$1));b=c.$1;return 4===b.type?new h(new na(new Gb(new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),
M()),eb()),a.$1.subtract((new f.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)),new f.jsbn.BigInteger("1")))):new f.Lazy(function(){throw Error("*** Numbers.idr:166:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 at Numbers.idr:166:25-34 ***");})}return new f.Lazy(function(){throw Error("*** Numbers.idr:165:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 ***");
})}return new d(new l("Unexpected error in modulo"))}function Je(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=c.$1,6===b.type&&0===c.$2.type)){a=new V(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=ba(new V(b.$1));if(0===c.type)return ba(new V(b.$1));b=c.$1;return 4===b.type?new h(new V(new ha(Bb(a.$1,b.$1).intValue(),0))):new f.Lazy(function(){throw Error("*** Numbers.idr:199:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 at Numbers.idr:199:31-40 ***");
})}return new f.Lazy(function(){throw Error("*** Numbers.idr:198:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new Q(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);a=a.$1;if(4===a.type){c=ba(new Q(b.$1));if(0===c.type)return ba(new Q(b.$1));b=c.$1;return 4===b.type?new h(new Q(Bb(a.$1,b.$1).intValue())):new f.Lazy(function(){throw Error("*** Numbers.idr:194:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 at Numbers.idr:194:31-40 ***");
})}return new f.Lazy(function(){throw Error("*** Numbers.idr:193:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 ***");})}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new Z(Bb(a.$1,c.$1))):new d(new l("Unexpected error in remainder")):new d(new l("Unexpected error in remainder"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new na(a.$1);a=ba(a);if(0===a.type)return new d(a.$1);
a=a.$1;if(4===a.type){c=ba(new na(b.$1));if(0===c.type)return ba(new na(b.$1));b=c.$1;return 4===b.type?new h(new na(new Gb(new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),M()),eb()),Bb(a.$1,b.$1),new f.jsbn.BigInteger("1")))):new f.Lazy(function(){throw Error("*** Numbers.idr:189:25-34:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 at Numbers.idr:189:25-34 ***");})}return new f.Lazy(function(){throw Error("*** Numbers.idr:188:25-34:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 ***");
})}return new d(new l("Unexpected error in remainder"))}function zc(a,b,c,e){return v(null,null,J(null,b),kj(b,e,c,a))}function Ac(a,b,c){return qa(null,null,lj(c,a),J(null,b))}function Xb(a,b,c,e,d,f){if(0>wc(f,0)||0===f)return d.$2(null)(t);a=d.$1(null)(null)(Ad())(e);return d.$3(null)(null)(a)(Xb(null,null,null,e,d,f-1))}function Ed(a,b,c,e,d,f,g){if(1===f.type)return a=d.$2(null)(f.$1)(g),a=Cc(null,null,null,e,d,null,Nd(null,null,a),g),e=Ed(null,null,null,e,d,f.$2,g),"Frame<"+(a+(","+(e+">")));
f=d.$2(null)(f.$1)(g);return"Global<"+(Cc(null,null,null,e,d,null,Nd(null,null,f),g)+">")}function mc(a,b,c,e){return C(null,v(null,null,c,ca()),v(null,null,e,pj(c,e)))}function uc(a,b,c,e,d,f,g){for(;;)if(1===g.type)f=Cd(f,g.$3),g=g.$1;else if(2===g.type)f=qj(f,g.$5,g.$3),g=g.$1;else return f(new w(g.$1,g.$2))}function ub(a,b,c,e,f){for(;;)if(1===e.type){a=tb(new g(f,new g(e.$1,t)));if(0===a.type)return new d(a.$1);a=b(a.$1);if(0===a.type)return new d(a.$1);e=e.$2;f=a.$1}else return new h(f)}function Sd(a,
b,c,e,d){for(;;)if(1===d.type){if(0===d.$2.type)return c=c.$1(d.$1),e+c;a=c.$1(d.$1);e+=a+", ";d=d.$2}else return e}function Cc(a,b,c,e,d,f,g,h){return 1===g.type?(a=g.$1,b=d.$2(null)(a.$2)(h),d=Cc(null,null,null,e,d,null,g.$2,h),e=e.$1(b),a.$1+(": "+e)+(","+d)):""}function ec(a,b,c){for(a={};;a={$jscomp$loop$prop$$cg$3$1:a.$jscomp$loop$prop$$cg$3$1})if(1===c.type){a.$jscomp$loop$prop$$cg$3$1=c.$1;if(3===a.$jscomp$loop$prop$$cg$3$1.type)return 0===c.$2.type?new h(new Ma(L(null,b,a.$jscomp$loop$prop$$cg$3$1.$1),
new f.Lazy(function(a){return function(){return f.force(a.$jscomp$loop$prop$$cg$3$1.$2)}}(a)))):new d(new m("list",c.$1));if(0===c.$2.type)return 0===b.type?new h(c.$1):new h(new Ma(b,new f.Lazy(function(){return c.$1})));var e=c.$1;if(2===e.type)b=L(null,b,e.$1),c=c.$2;else return new d(new m("list",c.$1))}else return 0===c.type?new h(new z(b)):new d(new l("Unknown error in append"))}function Ej(a,b,c){if(2===c.type&&(a=c.$1,1===a.type))if(b=a.$1,6===b.type){if(a=a.$2,1===a.type){var e=a.$1;if(6===
e.type&&0===a.$2.type){if(Fb(null,xb(),e.$1,new ha(0,0)))return new d(new l("Zero division error"));c=new Ja(new N(Pb(),Qb(),Rb()),Dd());a=new Hj(new N(Pb(),Qb(),Rb()),rj());var f=b.$1;b=e.$1;e=a.$1;var g=a.$1.$2(f.$1)(b.$1);var m=a.$1.$2(f.$2)(b.$2);e=e.$1(g)(m);g=a.$1;m=a.$1.$2(b.$1)(b.$1);var n=a.$1.$2(b.$2)(b.$2);g=g.$1(m)(n);e=a.$2(e)(g);g=a.$1.$2(f.$2)(b.$1);f=a.$1.$2(f.$1)(b.$2);c=c.$2(g)(f);f=a.$1;g=a.$1.$2(b.$1)(b.$1);b=a.$1.$2(b.$2)(b.$2);b=f.$1(g)(b);a=a.$2(c)(b);a=new ha(e,a);return new h(new V(a))}}}else if(5===
b.type){if(a=a.$2,1===a.type)return c=a.$1,5===c.type?0===a.$2.type?0===(0===c.$1?1:0)?new h(new Q(b.$1/c.$1)):new d(new l("Zero division error")):new d(new l("Unexpected error in /")):new d(new l("Unexpected error in /"))}else if(4===b.type){if(a=a.$2,1===a.type&&(c=a.$1,4===c.type&&0===a.$2.type))return a=Ya(null,new hb(new N(X(),Y(),M()),$a(),ab()),pa(),new ib(new N(X(),Y(),M()),bb()),new Fa(pa(),cb(),db()),new Ja(new N(X(),Y(),M()),eb()),b.$1,c.$1),1===a.type?new h(new na(a.$1)):new d(new l("Zero division error"))}else if(7===
b.type&&(a=a.$2,1===a.type))return c=a.$1,7===c.type?0===a.$2.type?Tb(We(null),b.$1,c.$1,"/"):new d(new l("Unexpected error in /")):new d(new l("Unexpected error in /"));return new d(new l("Unexpected error in /"))}function Fj(a,b){if(2===b.type&&(b=b.$1,1===b.type))if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type){b=new Ja(new N(Pb(),Qb(),Rb()),Dd());a=a.$1;c=c.$1;var e=b.$1.$2(a.$1)(c.$1);var f=b.$1.$2(a.$2)(c.$2);e=b.$2(e)(f);f=b.$1;var g=b.$1.$2(a.$2)(c.$1);
a=b.$1.$2(a.$1)(c.$2);a=f.$1(g)(a);a=new ha(e,a);return new h(new V(a))}}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new h(new Q(a.$1*c.$1)):new d(new l("Unexpected error in *")):new d(new l("Unexpected error in *"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new h(new Z(a.$1.multiply(c.$1))):new d(new l("Unexpected error in *")):new d(new l("Unexpected error in *"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===
c.type?0===b.$2.type?Tb(Xe(null),a.$1,c.$1,"*"):new d(new l("Unexpected error in *")):new d(new l("Unexpected error in *"));return new d(new l("Unexpected error in *"))}function Ij(a,b,c,e){for(;;){if(0===e.type)return 0===c.type?new h(!0):new h(!1);if(0===c.type)return new h(!1);a=Ib(new g(c.$1,new g(e.$1,t)));if(0===a.type)return new d(a.$1);a=a.$1;if(10===a.type)if(a=a.$1)if(a)c=c.$2,e=e.$2;else return new h(!1);else return new h(!1);else return new h(!1)}}function vc(a,b,c,e,d){return 1===d.type?
(a=d.$1,2===a.type&&(a=a.$1,1===a.type)?(c=a.$1,1===c.type?"else"===c.$1?0===d.$2.type?Ga(null,e,b,a.$2):e.$1(null)(null)(new l("cond: bad syntax (`else` clause must be last)")):new u(S(null,e,b,a.$1),sj(b,e,d.$2,a.$2)):new u(S(null,e,b,a.$1),tj(b,e,d.$2,a.$2))):e.$1(null)(null)(new l("["+(Sd(null,null,new A(B(),H()),"",d)+"]")))):0===d.type?new x(va):e.$1(null)(null)(new l("["+(Sd(null,null,new A(B(),H()),"",d)+"]")))}function Vc(a,b,c,e,d,f,h){return 1===h.type?(a=h.$1,2===a.type?(a=a.$1,1===a.type?
new u(new Gj(Eb(null,null,null,null,d,new g(f,new g(a.$1,t))),Lj),uj(b,d,f,h.$2,a.$2)):0===a.type?0===h.$2.type?new x(va):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"))):d.$1(null)(null)(new l("case: bad syntax"))):0===h.type?new x(va):d.$1(null)(null)(new l("case: bad syntax"))}function Eb(a,b,c,e,d,f){if(1===f.type&&(b=f.$2,1===b.type)){a=b.$1;if(1===a.type)return"else"===a.$1?0===b.$2.type?new x(!0):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"));
if(2===a.type)return a=a.$1,1===a.type?(c=a.$1,1===c.type?"else"===c.$1?0===b.$2.type?d.$1(null)(null)(new l("case: bad syntax (`else` clause must be last)")):d.$1(null)(null)(new l("case: bad syntax")):0===b.$2.type?(b=Ib(new g(a.$1,new g(f.$1,t))),b=0===b.type?d.$1(null)(null)(b.$1):new x(b.$1),new u(b,vj(d,f.$1,a.$2))):d.$1(null)(null)(new l("case: bad syntax")):0===b.$2.type?(b=Ib(new g(a.$1,new g(f.$1,t))),b=0===b.type?d.$1(null)(null)(b.$1):new x(b.$1),new u(b,wj(d,f.$1,a.$2))):d.$1(null)(null)(new l("case: bad syntax"))):
0===a.type?0===b.$2.type?new x(!1):d.$1(null)(null)(new l("case: bad syntax")):d.$1(null)(null)(new l("case: bad syntax"))}return d.$1(null)(null)(new l("case: bad syntax"))}function ng(a,b,c,e,d,h,l,n){if(1===l.type){var k=l.$1;if(3===k.type)return a=k.$1,1===a.type?d.$3.$4(h)(c)(new Ma(new g(n,a.$2),new f.Lazy(function(){return f.force(k.$2)}))):d.$1(null)(null)(new m("list",e));if(2===k.type)return a=k.$1,1===a.type?d.$3.$4(h)(c)(new z(new g(n,a.$2))):d.$1(null)(null)(new m("list",e))}return d.$1(null)(null)(new m("list",
e))}function Wc(a,b,c,e,d,f,g,h){return 1===h.type?1===g.type?new u(S(null,d,f,h.$1),yj(d,f,g.$1,g.$2,h.$2)):d.$1(null)(null)(new l("let*: bad syntax")):0===h.type?0===g.type?new x(Sa):d.$1(null)(null)(new l("let*: bad syntax")):d.$1(null)(null)(new l("let*: bad syntax"))}function Yc(a,b,c,d,g,h,m){return 1===m.type?(a=null,a=g.$3,b=m.$1,c=null,c=1===b.type?b.$1:new f.Lazy(function(){return Zb()}),a=a.$5(h)(c)(va),new u(a,Aj(g,h,m.$2))):0===m.type?new x(Sa):g.$1(null)(null)(new l("let*: bad syntax"))}
function Xc(a,b,c,d,f,g,h){return 1===h.type?(a=h.$1,a=f.$3.$4(g)(a.$1)(a.$2),new u(a,Bj(f,g,h.$2))):new x(Sa)}function Md(a,b){return 1===b.type?(a=1===ja(0===(""==b.$2?1:0)?!0:!1,!0).type?Ld:new Hd(b.$2[0],b.$2.slice(1)),new g(b.$1,Md(null,a))):t}var f={throw:function(a){throw a;},Lazy:function(a){this.js_idris_lazy_calc=a;this.js_idris_lazy_val=void 0},force:function(a){if(void 0===a||void 0===a.js_idris_lazy_calc)return a;void 0===a.js_idris_lazy_val&&(a.js_idris_lazy_val=a.js_idris_lazy_calc());
return a.js_idris_lazy_val},prim_strSubstr:function(a,b,c){return c.substr(Math.max(0,a),Math.max(0,b))}};f.os=require("os");f.fs=require("fs");f.prim_systemInfo=function(a){switch(a){case 0:return"node";case 1:return f.os.platform()}return""};f.prim_writeStr=function(a){return process.stdout.write(a)};f.prim_readStr=function(){var a=new Buffer(1024);for(var b=0;;){f.fs.readSync(0,a,b,1);if(10==a[b]){a=a.toString("utf8",0,b);break}b++;if(b==a.length){var c=new Buffer(2*a.length);a.copy(c);a=c}}return a};
f.jsbn=function(){function a(a,b,c){null!=a&&("number"==typeof a?this.fromNumber(a,b,c):null==b&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function b(){return new a(null)}function c(a,b,c,d,e,f){for(;0<=--f;){var G=b*this[a++]+c[d]+e;e=Math.floor(G/67108864);c[d++]=G&67108863}return e}function d(a,b,c,d,e,f){var G=b&32767;for(b>>=15;0<=--f;){var W=this[a]&32767,g=this[a++]>>15,Ra=b*W+g*G;W=G*W+((Ra&32767)<<15)+c[d]+(e&1073741823);e=(W>>>30)+(Ra>>>15)+b*g+(e>>>30);c[d++]=W&1073741823}return e}
function f(a,b,c,d,e,f){var G=b&16383;for(b>>=14;0<=--f;){var W=this[a]&16383,g=this[a++]>>14,Ra=b*W+g*G;W=G*W+((Ra&16383)<<14)+c[d]+e;e=(W>>28)+(Ra>>14)+b*g;c[d++]=W&268435455}return e}function g(a,b){a=D[a.charCodeAt(b)];return null==a?-1:a}function h(a){var c=b();c.fromInt(a);return c}function l(a){var b=1,c;0!=(c=a>>>16)&&(a=c,b+=16);0!=(c=a>>8)&&(a=c,b+=8);0!=(c=a>>4)&&(a=c,b+=4);0!=(c=a>>2)&&(a=c,b+=2);0!=a>>1&&(b+=1);return b}function m(a){this.m=a}function n(a){this.m=a;this.mp=a.invDigit();
this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<a.DB-15)-1;this.mt2=2*a.t}function q(a,b){return a&b}function p(a,b){return a|b}function r(a,b){return a^b}function u(a,b){return a&~b}function t(){}function v(a){return a}function w(c){this.r2=b();this.q3=b();a.ONE.dlShiftTo(2*c.t,this.r2);this.mu=this.r2.divide(c);this.m=c}function y(a){F[E++]^=a&255;F[E++]^=a>>8&255;F[E++]^=a>>16&255;F[E++]^=a>>24&255;E>=J&&(E-=J)}function B(){}function C(){this.j=this.i=0;this.S=[]}var x;(x="undefined"!==
typeof navigator)&&"Microsoft Internet Explorer"==navigator.appName?(a.prototype.am=d,x=30):x&&"Netscape"!=navigator.appName?(a.prototype.am=c,x=26):(a.prototype.am=f,x=28);a.prototype.DB=x;a.prototype.DM=(1<<x)-1;a.prototype.DV=1<<x;a.prototype.FV=Math.pow(2,52);a.prototype.F1=52-x;a.prototype.F2=2*x-52;var D=[],z;x=48;for(z=0;9>=z;++z)D[x++]=z;x=97;for(z=10;36>z;++z)D[x++]=z;x=65;for(z=10;36>z;++z)D[x++]=z;m.prototype.convert=function(a){return 0>a.s||0<=a.compareTo(this.m)?a.mod(this.m):a};m.prototype.revert=
function(a){return a};m.prototype.reduce=function(a){a.divRemTo(this.m,null,a)};m.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};m.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};n.prototype.convert=function(c){var d=b();c.abs().dlShiftTo(this.m.t,d);d.divRemTo(this.m,null,d);0>c.s&&0<d.compareTo(a.ZERO)&&this.m.subTo(d,d);return d};n.prototype.revert=function(a){var c=b();a.copyTo(c);this.reduce(c);return c};n.prototype.reduce=function(a){for(;a.t<=this.mt2;)a[a.t++]=
0;for(var b=0;b<this.m.t;++b){var c=a[b]&32767,d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;c=b+this.m.t;for(a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp();a.drShiftTo(this.m.t,a);0<=a.compareTo(this.m)&&a.subTo(this.m,a)};n.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};n.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};a.prototype.copyTo=function(a){for(var b=this.t-1;0<=b;--b)a[b]=this[b];a.t=this.t;a.s=this.s};a.prototype.fromInt=
function(a){this.t=1;this.s=0>a?-1:0;0<a?this[0]=a:-1>a?this[0]=a+this.DV:this.t=0};a.prototype.fromString=function(b,c){if(16==c)c=4;else if(8==c)c=3;else if(256==c)c=8;else if(2==c)c=1;else if(32==c)c=5;else if(4==c)c=2;else{this.fromRadix(b,c);return}this.s=this.t=0;for(var d=b.length,e=!1,f=0;0<=--d;){var G=8==c?b[d]&255:g(b,d);0>G?"-"==b.charAt(d)&&(e=!0):(e=!1,0==f?this[this.t++]=G:f+c>this.DB?(this[this.t-1]|=(G&(1<<this.DB-f)-1)<<f,this[this.t++]=G>>this.DB-f):this[this.t-1]|=G<<f,f+=c,f>=
this.DB&&(f-=this.DB))}8==c&&0!=(b[0]&128)&&(this.s=-1,0<f&&(this[this.t-1]|=(1<<this.DB-f)-1<<f));this.clamp();e&&a.ZERO.subTo(this,this)};a.prototype.clamp=function(){for(var a=this.s&this.DM;0<this.t&&this[this.t-1]==a;)--this.t};a.prototype.dlShiftTo=function(a,b){var c;for(c=this.t-1;0<=c;--c)b[c+a]=this[c];for(c=a-1;0<=c;--c)b[c]=0;b.t=this.t+a;b.s=this.s};a.prototype.drShiftTo=function(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0);b.s=this.s};a.prototype.lShiftTo=function(a,
b){var c=a%this.DB,d=this.DB-c,e=(1<<d)-1;a=Math.floor(a/this.DB);var f=this.s<<c&this.DM,G;for(G=this.t-1;0<=G;--G)b[G+a+1]=this[G]>>d|f,f=(this[G]&e)<<c;for(G=a-1;0<=G;--G)b[G]=0;b[a]=f;b.t=this.t+a+1;b.s=this.s;b.clamp()};a.prototype.rShiftTo=function(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)b.t=0;else{a%=this.DB;var d=this.DB-a,e=(1<<a)-1;b[0]=this[c]>>a;for(var f=c+1;f<this.t;++f)b[f-c-1]|=(this[f]&e)<<d,b[f-c]=this[f]>>a;0<a&&(b[this.t-c-1]|=(this.s&e)<<d);b.t=this.t-c;b.clamp()}};
a.prototype.subTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0;-1>d?b[c++]=this.DV+d:0<d&&(b[c++]=d);b.t=c;b.clamp()};a.prototype.multiplyTo=function(b,c){var d=this.abs(),e=b.abs(),f=d.t;for(c.t=f+e.t;0<=--f;)c[f]=0;for(f=0;f<e.t;++f)c[f+d.t]=d.am(0,e[f],c,f,0,d.t);c.s=0;c.clamp();
this.s!=b.s&&a.ZERO.subTo(c,c)};a.prototype.squareTo=function(a){for(var b=this.abs(),c=a.t=2*b.t;0<=--c;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}0<a.t&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1));a.s=0;a.clamp()};a.prototype.divRemTo=function(c,d,e){var f=c.abs();if(!(0>=f.t)){var G=this.abs();if(G.t<f.t)null!=d&&d.fromInt(0),null!=e&&this.copyTo(e);else{null==e&&(e=b());var g=b(),h=this.s;c=c.s;var W=this.DB-
l(f[f.t-1]);0<W?(f.lShiftTo(W,g),G.lShiftTo(W,e)):(f.copyTo(g),G.copyTo(e));f=g.t;G=g[f-1];if(0!=G){var k=G*(1<<this.F1)+(1<f?g[f-2]>>this.F2:0),Ra=this.FV/k;k=(1<<this.F1)/k;var m=1<<this.F2,n=e.t,q=n-f,p=null==d?b():d;g.dlShiftTo(q,p);0<=e.compareTo(p)&&(e[e.t++]=1,e.subTo(p,e));a.ONE.dlShiftTo(f,p);for(p.subTo(g,g);g.t<f;)g[g.t++]=0;for(;0<=--q;){var r=e[--n]==G?this.DM:Math.floor(e[n]*Ra+(e[n-1]+m)*k);if((e[n]+=g.am(0,r,e,q,0,f))<r)for(g.dlShiftTo(q,p),e.subTo(p,e);e[n]<--r;)e.subTo(p,e)}null!=
d&&(e.drShiftTo(f,d),h!=c&&a.ZERO.subTo(d,d));e.t=f;e.clamp();0<W&&e.rShiftTo(W,e);0>h&&a.ZERO.subTo(e,e)}}}};a.prototype.invDigit=function(){if(1>this.t)return 0;var a=this[0];if(0==(a&1))return 0;var b=a&3;b=b*(2-(a&15)*b)&15;b=b*(2-(a&255)*b)&255;b=b*(2-((a&65535)*b&65535))&65535;b=b*(2-a*b%this.DV)%this.DV;return 0<b?this.DV-b:-b};a.prototype.isEven=function(){return 0==(0<this.t?this[0]&1:this.s)};a.prototype.exp=function(c,d){if(4294967295<c||1>c)return a.ONE;var e=b(),f=b(),g=d.convert(this),
G=l(c)-1;for(g.copyTo(e);0<=--G;)if(d.sqrTo(e,f),0<(c&1<<G))d.mulTo(f,g,e);else{var h=e;e=f;f=h}return d.revert(e)};a.prototype.toString=function(a){if(0>this.s)return"-"+this.negate().toString(a);if(16==a)a=4;else if(8==a)a=3;else if(2==a)a=1;else if(32==a)a=5;else if(4==a)a=2;else return this.toRadix(a);var b=(1<<a)-1,c,d=!1,e="",f=this.t,g=this.DB-f*this.DB%a;if(0<f--)for(g<this.DB&&0<(c=this[f]>>g)&&(d=!0,e="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));0<=f;)g<a?(c=(this[f]&(1<<g)-1)<<a-g,
c|=this[--f]>>(g+=this.DB-a)):(c=this[f]>>(g-=a)&b,0>=g&&(g+=this.DB,--f)),0<c&&(d=!0),d&&(e+="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));return d?e:"0"};a.prototype.negate=function(){var c=b();a.ZERO.subTo(this,c);return c};a.prototype.abs=function(){return 0>this.s?this.negate():this};a.prototype.compareTo=function(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;b=c-a.t;if(0!=b)return 0>this.s?-b:b;for(;0<=--c;)if(0!=(b=this[c]-a[c]))return b;return 0};a.prototype.bitLength=function(){return 0>=
this.t?0:this.DB*(this.t-1)+l(this[this.t-1]^this.s&this.DM)};a.prototype.mod=function(c){var d=b();this.abs().divRemTo(c,null,d);0>this.s&&0<d.compareTo(a.ZERO)&&c.subTo(d,d);return d};a.prototype.modPowInt=function(a,b){b=256>a||b.isEven()?new m(b):new n(b);return this.exp(a,b)};a.ZERO=h(0);a.ONE=h(1);t.prototype.convert=v;t.prototype.revert=v;t.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c)};t.prototype.sqrTo=function(a,b){a.squareTo(b)};w.prototype.convert=function(a){if(0>a.s||a.t>2*this.m.t)return a.mod(this.m);
if(0>a.compareTo(this.m))return a;var c=b();a.copyTo(c);this.reduce(c);return c};w.prototype.revert=function(a){return a};w.prototype.reduce=function(a){a.drShiftTo(this.m.t-1,this.r2);a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp());this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);for(this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);0>a.compareTo(this.r2);)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);0<=a.compareTo(this.m);)a.subTo(this.m,a)};w.prototype.mulTo=function(a,b,c){a.multiplyTo(b,
c);this.reduce(c)};w.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};var A=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,
613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],H=67108864/A[A.length-1];a.prototype.chunkSize=function(a){return Math.floor(Math.LN2*this.DB/Math.log(a))};a.prototype.toRadix=function(a){null==a&&(a=10);if(0==this.signum()||2>a||36<a)return"0";var c=this.chunkSize(a);c=Math.pow(a,c);var d=h(c),e=b(),f=b(),g="";for(this.divRemTo(d,
e,f);0<e.signum();)g=(c+f.intValue()).toString(a).substr(1)+g,e.divRemTo(d,e,f);return f.intValue().toString(a)+g};a.prototype.fromRadix=function(b,c){this.fromInt(0);null==c&&(c=10);for(var d=this.chunkSize(c),e=Math.pow(c,d),f=!1,h=0,G=0,k=0;k<b.length;++k){var W=g(b,k);0>W?"-"==b.charAt(k)&&0==this.signum()&&(f=!0):(G=c*G+W,++h>=d&&(this.dMultiply(e),this.dAddOffset(G,0),G=h=0))}0<h&&(this.dMultiply(Math.pow(c,h)),this.dAddOffset(G,0));f&&a.ZERO.subTo(this,this)};a.prototype.fromNumber=function(b,
c,d){if("number"==typeof c)if(2>b)this.fromInt(1);else for(this.fromNumber(b,d),this.testBit(b-1)||this.bitwiseTo(a.ONE.shiftLeft(b-1),p,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(c);)this.dAddOffset(2,0),this.bitLength()>b&&this.subTo(a.ONE.shiftLeft(b-1),this);else{d=[];var e=b&7;d.length=(b>>3)+1;c.nextBytes(d);d[0]=0<e?d[0]&(1<<e)-1:0;this.fromString(d,256)}};a.prototype.bitwiseTo=function(a,b,c){var d,e=Math.min(a.t,this.t);for(d=0;d<e;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){var f=
a.s&this.DM;for(d=e;d<this.t;++d)c[d]=b(this[d],f);c.t=this.t}else{f=this.s&this.DM;for(d=e;d<a.t;++d)c[d]=b(f,a[d]);c.t=a.t}c.s=b(this.s,a.s);c.clamp()};a.prototype.changeBit=function(b,c){b=a.ONE.shiftLeft(b);this.bitwiseTo(b,c,b);return b};a.prototype.addTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,
d>>=this.DB;d+=a.s}b.s=0>d?-1:0;0<d?b[c++]=d:-1>d&&(b[c++]=this.DV+d);b.t=c;b.clamp()};a.prototype.dMultiply=function(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()};a.prototype.dAddOffset=function(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}};a.prototype.multiplyLowerTo=function(a,b,c){var d=Math.min(this.t+a.t,b);c.s=0;for(c.t=d;0<d;)c[--d]=0;var e;for(e=c.t-this.t;d<e;++d)c[d+this.t]=
this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);d<e;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()};a.prototype.multiplyUpperTo=function(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;0<=--d;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp();c.drShiftTo(1,c)};a.prototype.modInt=function(a){if(0>=a)return 0;var b=this.DV%a,c=0>this.s?a-1:0;if(0<this.t)if(0==b)c=this[0]%a;else for(var d=this.t-1;0<=d;--d)c=(b*c+this[d])%a;return c};a.prototype.millerRabin=
function(c){var d=this.subtract(a.ONE),e=d.getLowestSetBit();if(0>=e)return!1;var f=d.shiftRight(e);c=c+1>>1;c>A.length&&(c=A.length);for(var g=b(),h=0;h<c;++h){g.fromInt(A[Math.floor(Math.random()*A.length)]);var k=g.modPow(f,this);if(0!=k.compareTo(a.ONE)&&0!=k.compareTo(d)){for(var G=1;G++<e&&0!=k.compareTo(d);)if(k=k.modPowInt(2,this),0==k.compareTo(a.ONE))return!1;if(0!=k.compareTo(d))return!1}}return!0};a.prototype.clone=function(){var a=b();this.copyTo(a);return a};a.prototype.intValue=function(){if(0>
this.s){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]};a.prototype.byteValue=function(){return 0==this.t?this.s:this[0]<<24>>24};a.prototype.shortValue=function(){return 0==this.t?this.s:this[0]<<16>>16};a.prototype.signum=function(){return 0>this.s?-1:0>=this.t||1==this.t&&0>=this[0]?0:1};a.prototype.toByteArray=function(){var a=this.t,b=[];b[0]=this.s;var c=this.DB-a*this.DB%8,d,
e=0;if(0<a--)for(c<this.DB&&(d=this[a]>>c)!=(this.s&this.DM)>>c&&(b[e++]=d|this.s<<this.DB-c);0<=a;)if(8>c?(d=(this[a]&(1<<c)-1)<<8-c,d|=this[--a]>>(c+=this.DB-8)):(d=this[a]>>(c-=8)&255,0>=c&&(c+=this.DB,--a)),0!=(d&128)&&(d|=-256),0==e&&(this.s&128)!=(d&128)&&++e,0<e||d!=this.s)b[e++]=d;return b};a.prototype.equals=function(a){return 0==this.compareTo(a)};a.prototype.min=function(a){return 0>this.compareTo(a)?this:a};a.prototype.max=function(a){return 0<this.compareTo(a)?this:a};a.prototype.and=
function(a){var c=b();this.bitwiseTo(a,q,c);return c};a.prototype.or=function(a){var c=b();this.bitwiseTo(a,p,c);return c};a.prototype.xor=function(a){var c=b();this.bitwiseTo(a,r,c);return c};a.prototype.andNot=function(a){var c=b();this.bitwiseTo(a,u,c);return c};a.prototype.not=function(){for(var a=b(),c=0;c<this.t;++c)a[c]=this.DM&~this[c];a.t=this.t;a.s=~this.s;return a};a.prototype.shiftLeft=function(a){var c=b();0>a?this.rShiftTo(-a,c):this.lShiftTo(a,c);return c};a.prototype.shiftRight=function(a){var c=
b();0>a?this.lShiftTo(-a,c):this.rShiftTo(a,c);return c};a.prototype.getLowestSetBit=function(){for(var a=0;a<this.t;++a)if(0!=this[a]){var b=a*this.DB;a=this[a];if(0==a)a=-1;else{var c=0;0==(a&65535)&&(a>>=16,c+=16);0==(a&255)&&(a>>=8,c+=8);0==(a&15)&&(a>>=4,c+=4);0==(a&3)&&(a>>=2,c+=2);0==(a&1)&&++c;a=c}return b+a}return 0>this.s?this.t*this.DB:-1};a.prototype.bitCount=function(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c){for(var d=this[c]^b,e=0;0!=d;)d&=d-1,++e;a+=e}return a};a.prototype.testBit=
function(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)};a.prototype.setBit=function(a){return this.changeBit(a,p)};a.prototype.clearBit=function(a){return this.changeBit(a,u)};a.prototype.flipBit=function(a){return this.changeBit(a,r)};a.prototype.add=function(a){var c=b();this.addTo(a,c);return c};a.prototype.subtract=function(a){var c=b();this.subTo(a,c);return c};a.prototype.multiply=function(a){var c=b();this.multiplyTo(a,c);return c};a.prototype.divide=function(a){var c=
b();this.divRemTo(a,c,null);return c};a.prototype.remainder=function(a){var c=b();this.divRemTo(a,null,c);return c};a.prototype.divideAndRemainder=function(a){var c=b(),d=b();this.divRemTo(a,c,d);return[c,d]};a.prototype.modPow=function(a,c){var d=a.bitLength(),e=h(1);if(0>=d)return e;var f=18>d?1:48>d?3:144>d?4:768>d?5:6;c=8>d?new m(c):c.isEven()?new w(c):new n(c);var g=[],k=3,p=f-1,q=(1<<f)-1;g[1]=c.convert(this);if(1<f)for(d=b(),c.sqrTo(g[1],d);k<=q;)g[k]=b(),c.mulTo(d,g[k-2],g[k]),k+=2;var r=
a.t-1,u=!0,t=b();for(d=l(a[r])-1;0<=r;){if(d>=p)var v=a[r]>>d-p&q;else v=(a[r]&(1<<d+1)-1)<<p-d,0<r&&(v|=a[r-1]>>this.DB+d-p);for(k=f;0==(v&1);)v>>=1,--k;0>(d-=k)&&(d+=this.DB,--r);if(u)g[v].copyTo(e),u=!1;else{for(;1<k;)c.sqrTo(e,t),c.sqrTo(t,e),k-=2;0<k?c.sqrTo(e,t):(k=e,e=t,t=k);c.mulTo(t,g[v],e)}for(;0<=r&&0==(a[r]&1<<d);)c.sqrTo(e,t),k=e,e=t,t=k,0>--d&&(d=this.DB-1,--r)}return c.revert(e)};a.prototype.modInverse=function(b){var c=b.isEven();if(this.isEven()&&c||0==b.signum())return a.ZERO;for(var d=
b.clone(),e=this.clone(),f=h(1),g=h(0),k=h(0),l=h(1);0!=d.signum();){for(;d.isEven();)d.rShiftTo(1,d),c?(f.isEven()&&g.isEven()||(f.addTo(this,f),g.subTo(b,g)),f.rShiftTo(1,f)):g.isEven()||g.subTo(b,g),g.rShiftTo(1,g);for(;e.isEven();)e.rShiftTo(1,e),c?(k.isEven()&&l.isEven()||(k.addTo(this,k),l.subTo(b,l)),k.rShiftTo(1,k)):l.isEven()||l.subTo(b,l),l.rShiftTo(1,l);0<=d.compareTo(e)?(d.subTo(e,d),c&&f.subTo(k,f),g.subTo(l,g)):(e.subTo(d,e),c&&k.subTo(f,k),l.subTo(g,l))}if(0!=e.compareTo(a.ONE))return a.ZERO;
if(0<=l.compareTo(b))return l.subtract(b);if(0>l.signum())l.addTo(b,l);else return l;return 0>l.signum()?l.add(b):l};a.prototype.pow=function(a){return this.exp(a,new t)};a.prototype.gcd=function(a){var b=0>this.s?this.negate():this.clone();a=0>a.s?a.negate():a.clone();if(0>b.compareTo(a)){var c=b;b=a;a=c}c=b.getLowestSetBit();var d=a.getLowestSetBit();if(0>d)return b;c<d&&(d=c);0<d&&(b.rShiftTo(d,b),a.rShiftTo(d,a));for(;0<b.signum();)0<(c=b.getLowestSetBit())&&b.rShiftTo(c,b),0<(c=a.getLowestSetBit())&&
a.rShiftTo(c,a),0<=b.compareTo(a)?(b.subTo(a,b),b.rShiftTo(1,b)):(a.subTo(b,a),a.rShiftTo(1,a));0<d&&a.lShiftTo(d,a);return a};a.prototype.isProbablePrime=function(a){var b,c=this.abs();if(1==c.t&&c[0]<=A[A.length-1]){for(b=0;b<A.length;++b)if(c[0]==A[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<A.length;){for(var d=A[b],e=b+1;e<A.length&&d<H;)d*=A[e++];for(d=c.modInt(d);b<e;)if(0==d%A[b++])return!1}return c.millerRabin(a)};a.prototype.square=function(){var a=b();this.squareTo(a);return a};
a.prototype.Barrett=w;var I;if(null==F){var F=[];var E=0;if("undefined"!==typeof window&&window.crypto)if(window.crypto.getRandomValues)for(z=new Uint8Array(32),window.crypto.getRandomValues(z),x=0;32>x;++x)F[E++]=z[x];else if("Netscape"==navigator.appName&&"5">navigator.appVersion)for(z=window.crypto.random(32),x=0;x<z.length;++x)F[E++]=z.charCodeAt(x)&255;for(;E<J;)x=Math.floor(65536*Math.random()),F[E++]=x>>>8,F[E++]=x&255;E=0;y((new Date).getTime())}B.prototype.nextBytes=function(a){var b;for(b=
0;b<a.length;++b){var c=b;if(null==I){y((new Date).getTime());I=new C;I.init(F);for(E=0;E<F.length;++E)F[E]=0;E=0}var d=I.next();a[c]=d}};C.prototype.init=function(a){var b,c;for(b=0;256>b;++b)this.S[b]=b;for(b=c=0;256>b;++b){c=c+this.S[b]+a[b%a.length]&255;var d=this.S[b];this.S[b]=this.S[c];this.S[c]=d}this.j=this.i=0};C.prototype.next=function(){this.i=this.i+1&255;this.j=this.j+this.S[this.i]&255;var a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[a+this.S[this.i]&
255]};var J=256;return{BigInteger:a,SecureRandom:B}}.call(this);var Sa={type:0},va={type:13},Kd={type:0},t={type:0},Rd={type:1},fa={type:0},P={type:0},Ld={type:0},Lj={type:0},Qd={type:0};module.exports={run:function(){return Kj.apply(this,Array.prototype.slice.call(arguments,0,2))}}}).call(this);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"_process":58,"buffer":7,"fs":6,"os":57}],11:[function(require,module,exports){
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

},{"../cons/cons":20,"../list/list":43}],12:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/equal":21,"../cons/pair":25,"../list/every":36,"./get":13}],13:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/equal":21,"../cons/isempty":22}],14:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../list/map":44}],15:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22,"../cons/pair":25}],16:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"./get":13}],17:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = Symbol("Cons");

},{}],18:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the car of a cons
 * @param  {Cons} cons cons to be car'd
 * @return {*}      car value of the given cons
 */
exports["default"] = (function (cons) { return cons(0); });

},{}],19:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the cdr of a cons
 * @param  {Cons} cons cons to be cdr'd
 * @return {*}      cdr value of the given cons
 */
exports["default"] = (function (cons) { return cons(1); });

},{}],20:[function(require,module,exports){
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

},{"./ConsType":17}],21:[function(require,module,exports){
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

},{"./car":18,"./cdr":19,"./pair":25}],22:[function(require,module,exports){
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

},{"./nil":24}],23:[function(require,module,exports){
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

},{"../fun/compose":29,"./car":18,"./cdr":19,"./cons":20,"./equal":21,"./isempty":22,"./nil":24,"./pair":25,"./print":26}],24:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = null;

},{}],25:[function(require,module,exports){
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

},{"./ConsType":17}],26:[function(require,module,exports){
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

},{"./car":18,"./cdr":19,"./isempty":22,"./pair":25}],27:[function(require,module,exports){
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

},{"../helpers/args":31,"../list/list":43,"./apply":28}],28:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],29:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Compose functions a and b
 * @param  {Function} a Outer function
 * @param  {Function} b Inner function
 * @return {Function}   Composed function
 */
exports["default"] = (function (a, b) { return function (c) { return a(b(c)); }; });

},{}],30:[function(require,module,exports){
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

},{"../cons/cons":20,"../cons/nil":24,"./apply":28}],31:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Given an array-like, returns a real array.
 * @param  {Array-like} args
 * @return {Arrau}
 */
exports["default"] = (function (args) { return Array.prototype.slice.call(args); });

},{}],32:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22}],33:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/equal":21,"../cons/isempty":22}],34:[function(require,module,exports){
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

},{"../cons/cdr":19,"../cons/isempty":22}],35:[function(require,module,exports){
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

},{"../cons/cons":20}],36:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],37:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],38:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/pair":25,"./concat":32}],39:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],40:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],41:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],42:[function(require,module,exports){
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

},{"./foldl":39}],43:[function(require,module,exports){
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

},{"../cons/cons":20,"../cons/nil":24,"../helpers/args":31}],44:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],45:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],46:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],47:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],48:[function(require,module,exports){
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

},{"../cons/cons":20,"../cons/nil":24}],49:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],50:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24,"./length":42}],51:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22}],52:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24,"./length":42}],53:[function(require,module,exports){
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

},{"../cons/car":18,"../cons/cdr":19,"../cons/cons":20,"../cons/isempty":22,"../cons/nil":24}],54:[function(require,module,exports){
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

},{"./alist/alist":11,"./alist/equal":12,"./alist/get":13,"./alist/map":14,"./alist/print":15,"./alist/put":16,"./cons/main":23,"./fun/Y":27,"./fun/apply":28,"./fun/compose":29,"./fun/curry":30,"./helpers/args":31,"./list/concat":32,"./list/contains":33,"./list/dequeue":34,"./list/enqueue":35,"./list/every":36,"./list/filter":37,"./list/flatten":38,"./list/foldl":39,"./list/foldr":40,"./list/get":41,"./list/length":42,"./list/list":43,"./list/map":44,"./list/peek":45,"./list/pop":46,"./list/push":47,"./list/range":48,"./list/reverse":49,"./list/slice":50,"./list/some":51,"./list/sort":52,"./list/zip":53,"./trie/getTrie":55,"./trie/putTrie":56}],55:[function(require,module,exports){
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

},{"../alist/get":13,"../alist/map":14,"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22,"../cons/nil":24,"../list/flatten":38}],56:[function(require,module,exports){
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

},{"../alist/alist":11,"../alist/get":13,"../alist/put":16,"../cons/car":18,"../cons/cdr":19,"../cons/isempty":22,"../cons/nil":24,"../cons/print":26,"../list/concat":32,"../list/list":43,"../list/push":47}],57:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],58:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],59:[function(require,module,exports){
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

},{}],60:[function(require,module,exports){
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
},{"asciify":2}],61:[function(require,module,exports){
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
},{}],62:[function(require,module,exports){
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

},{"wireframe":61}],63:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"dup":61}]},{},[1])(1)
});
