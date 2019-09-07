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

},{"astar":2,"boltzmann":3,"conway":4,"lidrisp":5,"lispish.js":49,"projectwavybits":52,"videoascii":54,"vu":56,"wireframe":57}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
(function (global){
/*
 The buffer module from node.js, for the browser.

 @author   Feross Aboukhadijeh <https://feross.org>
 @license  MIT
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(k){var F=0;return function(){return F<k.length?{done:!1,value:k[F++]}:{done:!0}}};$jscomp.arrayIterator=function(k){return{next:$jscomp.arrayIteratorImpl(k)}};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;
$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(k,F,u){k!=Array.prototype&&k!=Object.prototype&&(k[F]=u.value)};$jscomp.getGlobal=function(k){return"undefined"!=typeof window&&window===k?k:"undefined"!=typeof global&&null!=global?global:k};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};
$jscomp.SymbolClass=function(k,F){this.$jscomp$symbol$id_=k;$jscomp.defineProperty(this,"description",{configurable:!0,writable:!0,value:F})};$jscomp.SymbolClass.prototype.toString=function(){return this.$jscomp$symbol$id_};$jscomp.Symbol=function(){function k(u){if(this instanceof k)throw new TypeError("Symbol is not a constructor");return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX+(u||"")+"_"+F++,u)}var F=0;return k}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var k=$jscomp.global.Symbol.iterator;k||(k=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("Symbol.iterator"));"function"!=typeof Array.prototype[k]&&$jscomp.defineProperty(Array.prototype,k,{configurable:!0,writable:!0,value:function(){return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))}});$jscomp.initSymbolIterator=function(){}};
$jscomp.initSymbolAsyncIterator=function(){$jscomp.initSymbol();var k=$jscomp.global.Symbol.asyncIterator;k||(k=$jscomp.global.Symbol.asyncIterator=$jscomp.global.Symbol("Symbol.asyncIterator"));$jscomp.initSymbolAsyncIterator=function(){}};$jscomp.iteratorPrototype=function(k){$jscomp.initSymbolIterator();k={next:k};k[$jscomp.global.Symbol.iterator]=function(){return this};return k};
$jscomp.polyfill=function(k,F,u,m){if(F){u=$jscomp.global;k=k.split(".");for(m=0;m<k.length-1;m++){var G=k[m];G in u||(u[G]={});u=u[G]}k=k[k.length-1];m=u[k];F=F(m);F!=m&&null!=F&&$jscomp.defineProperty(u,k,{configurable:!0,writable:!0,value:F})}};$jscomp.polyfill("Math.trunc",function(k){return k?k:function(k){k=Number(k);if(isNaN(k)||Infinity===k||-Infinity===k||0===k)return k;var u=Math.floor(Math.abs(k));return 0>k?-u:u}},"es6","es3");
$jscomp.underscoreProtoCanBeSet=function(){var k={a:!0},F={};try{return F.__proto__=k,F.a}catch(u){}return!1};$jscomp.setPrototypeOf="function"==typeof Object.setPrototypeOf?Object.setPrototypeOf:$jscomp.underscoreProtoCanBeSet()?function(k,F){k.__proto__=F;if(k.__proto__!==F)throw new TypeError(k+" is not extensible");return k}:null;$jscomp.polyfill("Object.setPrototypeOf",function(k){return k||$jscomp.setPrototypeOf},"es6","es5");
$jscomp.polyfill("Array.prototype.fill",function(k){return k?k:function(k,u,m){var G=this.length||0;0>u&&(u=Math.max(0,G+u));if(null==m||m>G)m=G;m=Number(m);0>m&&(m=Math.max(0,G+m));for(u=Number(u||0);u<m;u++)this[u]=k;return this}},"es6","es3");
(function(k){"object"===typeof exports&&"undefined"!==typeof module?module.exports=k():"function"===typeof define&&define.amd?define([],k):("undefined"!==typeof window?window:"undefined"!==typeof global?global:"undefined"!==typeof self?self:this).lidrisp=k()})(function(){return function(){function k(F,u,m){function G(K,H){if(!u[K]){if(!F[K]){var Aa="function"==typeof require&&require;if(!H&&Aa)return Aa(K,!0);if(R)return R(K,!0);H=Error("Cannot find module '"+K+"'");throw H.code="MODULE_NOT_FOUND",
H;}H=u[K]={exports:{}};F[K][0].call(H.exports,function(m){return G(F[K][1][m]||m)},H,H.exports,k,F,u,m)}return u[K].exports}for(var R="function"==typeof require&&require,K=0;K<m.length;K++)G(m[K]);return G}return k}()({1:[function(k,F,u){(function(m,u){(function(){function G(a,b,c,l,d){return function(a){return d(l(a))(a)}}function K(){return function(a){return""+a}}function T(){return function(a){return function(b){return a+b}}}function H(){return function(a){return a.toString()}}function Aa(){return function(a){return""+
a}}function v(a,b,c){return function(a){return function(l){var d=b(a)(l);l=0===d.type?c(a)(l):new S(d.$1,d.$2,d.$3);return l}}}function W(a,b,c){return function(a){return function(b){b=c.$1(null)(a.$2)(b);return new E(a.$1,b)}}}function Ea(){return function(a){return ne(a)}}function U(){return function(a){return oe(a)}}function fa(a,b,c){return function(a){var l=yc(null,new n.jsbn.BigInteger("0"),a);if(1===l.type){var d=yc(null,new n.jsbn.BigInteger("1"),a);1===d.type?(a=b(l.$1),0===a.type?d=new f(a.$1):
(d=b(d.$1),d=0===d.type?new f(d.$1):new p(new z(c(a.$1)(d.$1))))):d=new f(new y(new A(2,2),x(null,a),a))}else d=new f(new y(new A(2,2),x(null,a),a));return d}}function Ba(){return function(a){return bd(a)}}function Ma(){return function(a){return cd(a)}}function ba(){return function(a){return pe(a)}}function ma(){return function(a){return qe(a)}}function eb(){return function(a){return re(a)}}function Lb(){return function(a){if(1===a.type){var b=a.$1;a=2===b.type?0===b.$1.type?0===a.$2.type?new p(new z(!0)):
new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new t("list",a.$1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,1),x(null,a),a));return a}}function dc(){return function(a){return function(b){if(""===a)b=new S(kb,a,b);else{var c=""===a?n.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];b=new Ha(dd(c,b))}return b}}}function lb(){return function(a){return ec(a)}}function Mb(a,
b,c){return function(l){return ha(a,b,c,l)}}function fc(){return function(a){return se(a)}}function fb(a,b,c,l){return function(a){var b=zc(null,null,null,new Nb(te(),ed(),ue()),W(null,null,c),l)(a),d=c.$1(null),ya=new Va(Ac(),fd(),Bc());b=gd(null,null,hd(),new id(ya),b);a=d(b)(a);return new ve(a)}}function za(a,b,c,l){return function(a){a=l(a);return new p(a)}}function mb(a,b,c,l,d,e,f){return function(a){var b=d(a);a=0===b.type?e(b.$1)(a):f(b.$1)(a);return a}}function Wa(){return function(a){return 1===
a.type?10===a.$1.type?0===a.$2.type?new p(new z(!0)):new p(new z(!1)):new p(new z(!1)):new p(new z(!1))}}function gc(){return function(a){return new p(new z(!1))}}function X(){return function(a){a=0<nb(a,"0")||"0"===a?0>nb(a,"9")?!0:"9"===a:!1;return a}}function Cc(){return function(a){return L(a)}}function d(){return function(a){return 1===a.type?2===a.$1.type?0===a.$2.type?new p(new z(!0)):new p(new z(!1)):new p(new z(!1)):new p(new z(!1))}}function e(){return function(a){if(1===a.type){var b=a.$1;
a=3===b.type?0===a.$2.type?new p(new z(!0)):new p(new z(!1)):2===b.type?0===b.$1.type?new p(new z(!1)):0===a.$2.type?new p(new z(!0)):new p(new z(!1)):new p(new z(!1))}else a=new p(new z(!1));return a}}function g(){return function(a){if(1===a.type){var b=a.$1;a=12===b.type?0===a.$2.type?new p(new z(!0)):new f(new y(new A(1,1),x(null,a),a)):11===b.type?0===a.$2.type?new p(new z(!0)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,
1),x(null,a),a));return a}}function h(){return function(a){return 0===(" "===a?1:0)?0===("\t"===a?1:0)?0===("\r"===a?1:0)?0===("\n"===a?1:0)?0===("\f"===a?1:0)?0===("\v"===a?1:0)?"\u00a0"===a:!0:!0:!0:!0:!0:!0}}function ra(){return function(a){return 1===a.type?8===a.$1.type?0===a.$2.type?new p(new z(!0)):new p(new z(!1)):new p(new z(!1)):new p(new z(!1))}}function we(){return function(a){return 1===a.type?1===a.$1.type?0===a.$2.type?new p(new z(!0)):new p(new z(!1)):new p(new z(!1)):new p(new z(!1))}}
function xe(){return function(a){return 1===a.type?0===a.$1.type?0===a.$2.type?new p(new z(!0)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a)):new f(new y(new A(1,1),x(null,a),a))}}function Ob(){return function(a){return function(b){if(""===a)b=new Ha(b);else{var c=""===a?n.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];var l=""===a?n.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):
a.slice(1);b=new S(c,l,dd(c,b))}return b}}}function ye(){return function(a){a:{if(1===a.type){var b=a.$1;if(2===b.type){var c=a.$2;if(1===c.type){var l=c.$1;a=2===l.type?0===c.$2.type?new p(new M(Y(null,b.$1,l.$1))):Dc(null,C,a):Dc(null,C,a);break a}}}a=Dc(null,C,a)}return a}}function ze(){return function(a){if(1===a.type){var b=a.$1;a=2===b.type?0===a.$2.type?new p(new na(x(null,b.$1))):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new t("list",a.$1)):new f(new y(new A(1,1),x(null,a),
a))}else a=new f(new y(new A(1,1),x(null,a),a));return a}}function Ae(){return function(a){return Be(a)}}function Ce(){return function(a){return De(a)}}function Ee(){return function(a){return Fe(a)}}function Ge(){return function(a){if(1===a.type){var b=a.$1;a=10===b.type?b.$1?0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!0)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,
1),x(null,a),a));return a}}function He(){return function(a){a:{if(1===a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=Pb(new q(a.$1,new q(b.$1,C)));a=0===a.type?new f(a.$1):Ie(null,null,a.$1);break a}}a=new f(new y(new A(2,2),x(null,a),a))}return a}}function Je(){return function(a){return Ke(a)}}function Le(){return function(a){a:{if(1===a.type){var b=a.$2;if(1===b.type&&0===b.$2.type){a=Pb(new q(a.$1,new q(b.$1,C)));a=0===a.type?new f(a.$1):Me(null,null,a.$1);break a}}a=new f(new y(new A(2,2),
x(null,a),a))}return a}}function Ne(){return function(a){a=1===a.type?0===a.$2.type?Qb(null,eb(),null,new q(a.$1,C),new na(new n.jsbn.BigInteger("0"))):Qb(null,eb(),null,a.$2,a.$1):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Oe(){return function(a){return Pe(a)}}function Qe(){return function(a){return Re(a)}}function Se(){return function(a){return Te(a)}}function Ue(){return function(a){return"b"===a?hc(oa(ob(),ca("01")),Oa(ob(),ca("01"),new n.jsbn.BigInteger("2")),Pa(oa(ob(),
ca("01")))):"d"===a?jd():"o"===a?hc(oa(pb(),D(X())),Oa(pb(),ca("01234567"),new n.jsbn.BigInteger("8")),Pa(oa(pb(),D(X())))):"x"===a?hc(oa(qb(),v(null,D(X()),ca("ABCDEFabcdef"))),Oa(qb(),v(null,D(X()),ca("ABCDEFabcdef")),new n.jsbn.BigInteger("16")),Pa(oa(qb(),v(null,D(X()),ca("ABCDEFabcdef"))))):rb()}}function Ve(){return function(a){return"b"===a?Oa(ob(),ca("01"),new n.jsbn.BigInteger("2")):"d"===a?Oa(Qa(),D(X()),new n.jsbn.BigInteger("10")):"o"===a?Oa(pb(),ca("01234567"),new n.jsbn.BigInteger("8")):
"x"===a?Oa(qb(),v(null,D(X()),ca("ABCDEFabcdef")),new n.jsbn.BigInteger("16")):rb()}}function We(){return function(a){return"b"===a?oa(ob(),ca("01")):"d"===a?oa(Qa(),D(X())):"o"===a?oa(pb(),D(X())):"x"===a?oa(qb(),v(null,D(X()),ca("ABCDEFabcdef"))):rb()}}function Xe(){return function(a){return"b"===a?Pa(oa(ob(),ca("01"))):"d"===a?Pa(oa(Qa(),D(X()))):"o"===a?Pa(oa(pb(),D(X()))):"x"===a?Pa(oa(qb(),v(null,D(X()),ca("ABCDEFabcdef")))):rb()}}function Ye(a){return function(a){return function(b){var c=b.$1.$1;
var d=b.$1.$1.$2(a.$6)(b.$7);var e=b.$1.$1.$2(a.$7)(b.$6);c=c.$1(d)(e);d=b.$1.$1.$2(a.$7)(b.$7);return sb(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,d)}}}function Ze(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$7);var d=b.$1.$1.$2(a.$7)(b.$6);return sb(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,d)}}}function $e(a){return function(a){return function(b){var c=b.$1.$1.$2(a.$6)(b.$6);var d=b.$1.$1.$2(a.$7)(b.$7);return sb(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,d)}}}function af(a){return function(a){return function(b){var c=
b.$5;var d=b.$1.$1.$2(a.$6)(b.$7);var e=b.$1.$1.$2(b.$6)(a.$7);c=c.$2(d)(e);d=b.$1.$1.$2(a.$7)(b.$7);return sb(null,b.$1,b.$2,b.$3,b.$4,b.$5,c,d)}}}function bf(a,b,c,l,d){return function(a){a=d(a)(new Ec(0,0));a=0===a.type?l.$1(null)(null)(new cf(a.$1)):new J(a.$1);return a}}function I(){return function(a){return sa(a)}}function df(){return function(a){return ef(a)}}function ff(){return function(a){if(1===a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new p(new na(new n.jsbn.BigInteger(""+b.$1.length))):
new f(new r("Invalid arguments to `string-length`")):new f(new r("Invalid arguments to `string-length`"))}else a=new f(new r("Invalid arguments to `string-length`"));return a}}function gf(){return function(a){return hf(a)}}function jf(){return function(a){if(1===a.type){var b=a.$1;a=8===b.type?0===a.$2.type?new p(new Fc(b.$1)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new t("string",a.$1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,1),x(null,a),a));return a}}function kf(){return function(a){return lf(a)}}
function mf(){return function(a){if(1===a.type){var b=a.$1;a=1===b.type?0===a.$2.type?new p(new gb(b.$1)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new t("list",a.$1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,1),x(null,a),a));return a}}function nf(a,b){return function(a){return function(c){c=b(a)(c);c=0===c.type?new Ha(c.$1):new S(c.$1,c.$2,c.$3);return c}}}function kd(a,b){return function(c){return of(a,b,c)}}function Rb(){return function(a){a=8===a.type?new p(a.$1):
new f(new t("string",a));return a}}function pf(){return function(a){if(1===a.type){var b=a.$1;a=0===b.type?0===a.$2.type?new p(new na(new n.jsbn.BigInteger(""+b.$1))):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new t("Vector",a.$1)):new f(new y(new A(1,1),x(null,a),a))}else a=new f(new y(new A(1,1),x(null,a),a));return a}}function qf(){return function(a){return rf(a)}}function sf(){return function(a){var b="c"+(Ia(null,null,T(),"",a)+"r");a=Ia(null,null,tf(),uf(),a);return new E(b,a)}}
function vf(){return function(a){return function(b){return new E(a,b)}}}function wf(){return function(a){return xf(a)}}function yf(a,b){return function(c){c=1===b.type?new w(ha(null,a,c,b.$1),ld(a,c,b.$2)):new J(C);return new w(c,wf())}}function zf(){return function(a){return"("===a}}function Af(){return function(a){return"["===a}}function Bf(){return function(a){return"{"===a}}function Sb(a){return function(b){return function(b){return function(c){return new S(a,b,c)}}}}function Cf(a){return function(b){return B(null,
null,Df(a),Sb(b))}}function Ef(a){return function(b){return B(null,null,a,Cf(b))}}function Z(){return function(a){return a}}function md(a){return function(b){return B(null,null,a,Sb(b))}}function Ja(){return function(a){return function(b){return new S(C,a,b)}}}function Ff(a,b){return function(c){return ic(null,a,b)}}function Tb(){return function(a){return function(b){return a===b}}}function Gf(a,b){return function(c){c=1===c.type?new J(c.$1):a.$1(null)(null)(new r("Unknown atom: "+b));return c}}function O(){return function(a){return I()}}
function nd(){return function(a){return new J(a)}}function od(a,b){return function(c){if(12===b.type)if(Ra(x(null,b.$2),x(null,c))?0:1!==b.$3.type)var l=a.$1(null)(null)(new y(new Na(x(null,b.$2).intValue()|0),x(null,c),c));else{l=a.$3.$6(b.$5);var d=jc(null,null,null,vf(),b.$2,c);var e=b.$3;if(1===e.type){e=e.$1;c:for(var f=x(null,b.$2);;)if(f.equals(new n.jsbn.BigInteger("0")))break c;else if(1===c.type)f=f.subtract(new n.jsbn.BigInteger("1")),c=c.$2;else break c;e=new q(new E(e,new M(c)),C)}else e=
C;l=l(Y(null,d,e));l=new w(l,yf(a,b.$4))}else 11===b.type?(l=b.$1(c),l=0===l.type?a.$1(null)(null)(l.$1):new J(l.$1)):l=a.$1(null)(null)(new r("application: not a procedure; expected a procedure that can be applied to arguments; given: "+sa(b)));return new w(l,nd())}}function Hf(a,b){return function(c){if(1===c.type){var l=c.$1;c=2===l.type?0===c.$2.type?new J(l.$1):a.$1(null)(null)(new y(new A(2,2),x(null,c),c)):0===c.$2.type?a.$1(null)(null)(new t("list",c.$1)):a.$1(null)(null)(new y(new A(2,2),
x(null,c),c))}else c=a.$1(null)(null)(new y(new A(2,2),x(null,c),c));return new w(c,od(a,b))}}function If(a,b,c){return function(l){return new w(Ub(null,a,b,new q(c,C)),Hf(a,l))}}function Jf(a,b,c,l){return function(d){return new w(ha(null,a,b,c),If(a,b,l))}}function Kf(a,b,c){return function(l){return new w(Ub(null,a,b,c),od(a,l))}}function P(a,b,c,l){return function(d){return new w(ha(null,a,b,c),Kf(a,b,l))}}function Lf(a,b,c){return function(l){return pd(null,a,null,null,b,l,c)}}function tb(){return function(a){return new J(Ka)}}
function Mf(a,b,c){return function(l){l=a.$3.$5(b)(c)(l);return new w(l,tb())}}function Nf(a,b,c,l){return function(d){d=10===d.type?d.$1?ha(null,a,b,l):ha(null,a,b,c):ha(null,a,b,l);return d}}function Of(a,b,c){return function(l){return new J(new Vb("\u03bb",ia(null,null,I(),a),ta,b,c))}}function Pf(){return function(a){return function(b){return Qf(a,b)}}}function Rf(a,b){return function(c){return Xa(null,a,c,b)}}function Sf(a,b,c,l){return function(d){d=a.$3.$6(b)(jc(null,null,null,Pf(),c,d));return new w(d,
Rf(a,l))}}function Tf(a,b,c,l){return function(d){return Uf(a,b,c,l,d)}}function Vf(a,b,c,l,d){return function(ya){return new w(kc(null,a,b),Tf(a,c,l,d))}}function Wf(a,b,c,l){return function(d){return Xf(a,b,c,l,d)}}function Gc(a,b,c){return function(l){return Xa(null,a,b,c)}}function Yf(a,b,c,l){return function(d){return new w(qd(null,null,null,null,a,d,b,c),Gc(a,d,l))}}function Zf(a,b,c,l){return function(d){return $f(a,b,c,l,d)}}function ag(a,b,c,l,d){return function(ya){return new w(kc(null,
a,b),Zf(a,c,l,d))}}function bg(a,b,c,l){return function(d){return cg(a,b,c,l,d)}}function dg(){return function(a){return function(b){return eg(a,b)}}}function fg(a,b,c,l){return function(d){return new w(rd(null,null,null,null,a,b,jc(null,null,null,dg(),c,d)),Gc(a,b,l))}}function gg(a,b,c,l,d){return function(ya){return new w(Ub(null,a,b,c),fg(a,b,l,d))}}function hg(a,b,c,l){return function(d){return new w(sd(null,null,null,null,a,d,b),gg(a,d,c,b,l))}}function ig(a,b,c,l){return function(d){return jg(a,
b,c,l,d)}}function kg(a,b,c,l,d){return function(ya){return new w(kc(null,a,b),ig(a,c,l,d))}}function lg(a,b,c,l){return function(d){return mg(a,b,c,l,d)}}function ng(a){return function(b){b=a.$2(null)(sa(b)+"\n");return new w(b,tb())}}function og(a,b,c){return function(l){l=a.$3.$4(b)(c)(l);return new w(l,tb())}}function pg(a,b,c,l,d){return function(ya){return new w(qg(null,null,a,b,c,l,ya,d),tb())}}function rg(a,b,c,l){return function(d){var ya=a.$3.$3(b)(c);return new w(ya,pg(c,l,a,b,d))}}function Hc(a){return function(b){return new J(new q(a,
b))}}function sg(a,b,c){return function(l){return new w(Ub(null,a,b,c),Hc(l))}}function tg(a,b){return function(c){var l=Mb(null,a,b);c=1===c.type?new w(l(c.$1),td(l,c.$2)):new J(C);return new w(c,nd())}}function hd(){return function(a){return function(b){return Ic(null,null,b.$1,b.$2,a)}}}function ug(a){return function(b){return vg(a,b)}}function wg(a){return function(b){return xg(a,b)}}function te(){return function(a){return function(a){return function(a){return function(b){return function(c){c=
b(c);return a(c)}}}}}}function ed(){return function(a){return function(a){return function(b){return a}}}}function ue(){return function(a){return function(a){return function(a){return function(b){return function(c){var l=a(c);c=b(c);return l(c)}}}}}}function Ac(){return function(a){return function(b){return a==b}}}function fd(){return function(a){return function(b){return Wb(a,b)}}}function Bc(){return function(a){return function(b){b=0>Wb(a,b)?!0:a==b;return b}}}function yg(){return function(a){return new p(new M(a))}}
function ud(a){return function(b){return function(c){return function(l){return new S(new q(a,b),c,l)}}}}function zg(a){return function(b){return B(null,null,v(null,V(null,a),Ja()),ud(b))}}function Ag(){return function(a){return")"===a}}function Bg(){return function(a){return"]"===a}}function Cg(){return function(a){return"}"===a}}function ka(){return function(a){return function(b){return a.add(b)}}}function la(){return function(a){return function(b){return a.multiply(b)}}}function ub(){return function(a){return function(b){return vd(a,
b)}}}function vb(){return function(a){return function(b){return Xb(a,b)}}}function Fa(){return function(a){return function(b){return a.equals(b)}}}function wb(){return function(a){a=0>Sa(a,new n.jsbn.BigInteger("0"))?(new n.jsbn.BigInteger("0")).subtract(a):a;return a}}function xb(){return function(a){return function(b){return Sa(a,b)}}}function yb(){return function(a){return function(b){b=0>Sa(a,b)?!0:a.equals(b);return b}}}function zb(){return function(a){return function(b){return a.subtract(b)}}}
function Dg(){return function(a){return Math.cos(a)}}function Eg(){return function(a){return function(b){return new ua((Math.exp(b)+Math.exp(-b))/2*Math.cos(a),(Math.exp(b)-Math.exp(-b))/2*-1*Math.sin(a))}}}function Fg(){return function(a){return Qb(null,Gg(),null,a,new na(new n.jsbn.BigInteger("0")))}}function Hg(){return function(a){a=0===a.type?new p(new na(new n.jsbn.BigInteger("1"))):Qb(null,Ig(null),null,a,new na(new n.jsbn.BigInteger("1")));return a}}function Jg(){return function(a){a=1===
a.type?Qb(null,Kg(null,null),null,a.$2,a.$1):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Lg(){return function(a){return 1===a.type?6===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):L(a):1===a.type?5===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?7===a.$1.type?0===a.$2.type?
new p(new z(!0)):L(a):L(a):L(a):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):L(a):L(a)}}function Mg(){return function(a){return 1===a.type?6===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?5===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):L(a):1===a.type?5===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?7===a.$1.type?0===a.$2.type?
new p(new z(!0)):L(a):L(a):L(a):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):L(a):L(a)}}function Ng(){return function(a){return 1===a.type?5===a.$1.type?0===a.$2.type?new p(new z(!0)):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a):L(a)}}function Og(){return function(a){return 1===a.type?7===a.$1.type?0===a.$2.type?new p(new z(!0)):L(a):L(a):L(a)}}function Pg(){return function(a){a=
1===a.type?Ab("=",Qg(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Rg(){return function(a){a=1===a.type?Ab("/=",Sg(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Tg(){return function(a){a=1===a.type?Ab(">",Ug(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Vg(){return function(a){a=1===a.type?Ab("<",Wg(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),
C));return a}}function Xg(){return function(a){a=1===a.type?Ab(">=",Yg(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function Zg(){return function(a){a=1===a.type?Ab("<=",$g(null,null),a.$1,a.$2):new f(new y(new Na(1),new n.jsbn.BigInteger("0"),C));return a}}function ah(){return function(a){return Math.sin(a)}}function bh(){return function(a){return function(b){return new ua((Math.exp(b)+Math.exp(-b))/2*Math.sin(a),(Math.exp(b)-Math.exp(-b))/2*Math.cos(a))}}}
function Bb(){return function(a){return function(a){return a}}}function rb(){return function(a){return function(a){return new Ha(a)}}}function wd(a){return function(b){var c=""===a?n.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0];return b===c}}function Jc(){return function(a){a=xd(a)?!0:yd(a);return a}}function ch(a){return function(b){return function(c){var l="#f"===a?new z(!1):"#t"===a?new z(!0):new Fc(a);return new S(l,b,c)}}}function dh(a){return function(b){b=
Ia(null,null,T(),"",new q(a,b));return ch(b)}}function eh(){return function(a){return B(null,null,v(null,V(null,v(null,D(Jc()),v(null,D(X()),ca("!#$%&|*+-/:<=>?@^_~")))),Ja()),dh(a))}}function Kc(){return function(a){return function(a){return function(b){return new S(Ka,a,b)}}}}function zd(){return function(a){return B(null,null,Lc(null,null,Yb("|#"),v(null,B(null,null,Yb("#|"),zd()),B(null,null,Ob(),Kc()))),Kc())}}function fh(){return function(a){a=xd(a)?String.fromCharCode((a.charCodeAt(0)|0)+32):
a;return a}}function gh(a){return function(b){return function(c){return hh(a,b,c)}}}function ih(){return function(a){a=Ia(null,null,T(),"",ia(null,null,fh(),a));return gh(a)}}function jh(){return function(a){return B(null,null,V(null,D(Jc())),ih())}}function ob(){return function(a){return lc(U(),new n.jsbn.BigInteger("2"),null,new n.jsbn.BigInteger("0"),a)}}function Qa(){return function(a){return lc(ma(),new n.jsbn.BigInteger("10"),null,new n.jsbn.BigInteger("0"),a)}}function kh(){return function(a){return lh(a)}}
function mh(){return function(a){return nh(a)}}function oh(){return function(a){return"i"===a}}function ph(a,b,c){return function(l){l=1===a.type?new S(new ja(new ua(b,a.$1)),c,l):new Ha(l);return l}}function Mc(){return function(a){return new Ha(a)}}function qh(a,b){return function(c){return function(c){c=1===a.type?ph(b,a.$1,c):Mc();return c}}}function rh(a){return function(b){return B(null,null,D(oh()),qh(a,b))}}function sh(a,b,c){return function(l){return B(null,null,Ga(null,null,mh(),v(null,
a,v(null,b,c))),rh(l))}}function qb(){return function(a){return lc(fc(),new n.jsbn.BigInteger("16"),null,new n.jsbn.BigInteger("0"),a)}}function pb(){return function(a){return lc(Qe(),new n.jsbn.BigInteger("8"),null,new n.jsbn.BigInteger("0"),a)}}function qa(){return function(a){return function(a){return function(b){return new S(kb,a,b)}}}}function mc(){return function(a){return"."===a}}function th(a,b,c,l){return function(d){return uh(a,b,c,l,d)}}function vh(a,b,c){return function(l){return new S(new M(Y(null,
a,b)),c,l)}}function wh(a,b,c){return function(l){return xh(a,b,c,l)}}function yh(a,b){return function(c){return function(c){c=3===a.type?th(b,a.$1,a.$2,c):2===a.type?vh(b,a.$1,c):wh(b,a,c);return c}}}function zh(a){return function(b){return B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),yh(b,a))}}function Ah(a){return function(b){return B(null,null,Za(),zh(a))}}function Bh(a){return function(b){return B(null,null,B(null,null,V(null,D(h())),qa()),Ah(a))}}function Ch(){return function(a){return B(null,
null,D(mc()),Bh(a))}}function Dh(){return function(a){a=Za();var b=B(null,null,V(null,D(h())),qa());a=v(null,V(null,B(null,null,a,md(b))),Ja());return B(null,null,a,Ch())}}function Zb(){return function(a){return"#"===a}}function Eh(){return function(a){return B(null,null,ca("bdox"),Ve())}}function Ad(){return function(a){return"-"===a}}function Fh(){return function(a){return-a}}function Bd(){return function(a){return"+"===a}}function Gh(){return function(a){return B(null,null,ca("bdox"),We())}}function Hh(){return function(a){return(new n.jsbn.BigInteger("0")).subtract(a)}}
function Ih(){return function(a){return";"===a}}function Jh(){return function(a){return"\n"===a}}function Kh(){return function(a){return B(null,null,Lc(null,null,D(Jh()),Ob()),Kc())}}function Lh(){return function(a){return function(b){return function(c){return new S(new M(a),b,c)}}}}function Mh(){return function(a){return B(null,null,ca("bdox"),Ue())}}function Nh(){return function(a){return"'"===a}}function Oh(){return function(a){return function(b){return function(c){return new S(new M(new q(new Fc("quote"),
new q(a,C))),b,c)}}}}function Ph(){return function(a){return B(null,null,Za(),Oh())}}function Qh(){return function(a){return B(null,null,ca("bdox"),Xe())}}function Rh(){return function(a){return Sh(a)}}function Th(){return function(a){return"/"===a}}function Uh(){return function(a){return Vh(a)}}function Wh(a){return function(b){return function(c){c=1===a.type?new S(new Da(a.$1),b,c):new Ha(c);return c}}}function Xh(a){return function(b){b=sb(null,new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),
la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),la(),Z()),zb()),a,b);return Wh(b)}}function Yh(a,b){return function(c){return B(null,null,Ga(null,null,Uh(),a),Xh(b))}}function Zh(a){return function(b){return B(null,null,D(Th()),Yh(a,b))}}function $h(){return function(a){return B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),Sb(a))}}function ai(){return function(a){a=Za();var b=B(null,null,V(null,D(h())),qa());a=B(null,null,a,Cd(b,a));return B(null,null,v(null,a,Ja()),$h())}}function Dd(){return function(a){return'"'===
a}}function bi(){return function(a){a:for(var b='"\\';;){if(""===b){a=ci(a);break a}var c=""===b?n.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):b[0];if(0===(a===c?1:0))b=""===b?n.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):b.slice(1);else{a=rb();break a}}return a}}function di(a){return function(b){return function(b){return function(c){return new S(new gb(Ia(null,null,T(),"",a)),b,c)}}}}function ei(){return function(a){return B(null,
null,D(Dd()),di(a))}}function fi(){return function(a){return B(null,null,v(null,V(null,v(null,B(null,null,D(gi()),hi()),B(null,null,Ob(),bi()))),Ja()),ei())}}function ii(a,b,c,l){return function(d){d=0===a.type?new Ha(d):new S(new M(new q(b,Y(null,c,a))),l,d);return d}}function ji(a,b,c){return function(l){return function(l){l=0===a.type?Mc():ii(b,c,a,l);return l}}}function ki(a,b){return function(c){return B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),ji(a,c,b))}}function li(a,b){return function(c){c=
Za();var l=B(null,null,V(null,D(h())),qa());c=B(null,null,c,Cd(l,c));return B(null,null,v(null,c,Ja()),ki(a,b))}}function mi(a,b){return function(c){return B(null,null,B(null,null,V(null,D(h())),qa()),li(a,b))}}function ni(a,b){return function(c){return B(null,null,D(mc()),mi(a,b))}}function oi(a){return function(b){return B(null,null,B(null,null,V(null,D(h())),qa()),ni(a,b))}}function pi(a){return function(b){return B(null,null,Za(),oi(a))}}function qi(a){return function(b){return B(null,null,B(null,
null,V(null,D(h())),qa()),pi(a))}}function ri(){return function(a){return B(null,null,D(mc()),qi(a))}}function si(){return function(a){a=Za();var b=B(null,null,V(null,D(h())),qa());a=v(null,V(null,B(null,null,a,md(b))),Ja());return B(null,null,a,ri())}}function ti(){return function(a){return function(b){return function(c){return new S(new ui(x(null,a).intValue()|0,a),b,c)}}}}function vi(){return function(a){return B(null,null,Ed(null,Fd()),ti())}}function wi(){return function(a){return new E(a.$1,
new xi(a.$2))}}function yi(){return function(a){return new p(Ka)}}function Gd(){return function(a){return function(b){return a}}}function Hd(){return function(a){return function(a){return function(a){return new ab(bb(),Id(a))}}}}function Jd(){return function(a){return function(a){return new ab(bb(),za(null,null,null,zi(a)))}}}function Eb(){return function(a){return function(a){return Ai(null,a)}}}function Fb(){return function(a){return function(a){return Bi(null,a)}}}function Gb(){return function(a){return function(a){return function(b){return Ci(null,
a,b)}}}}function Kd(){return function(a){return function(b){var c=new Hb(Eb(),Fb(),Gb());return new ab(bb(),za(null,null,null,Di(null,null,null,a,c,b)))}}}function Ld(){return function(a){var b=new Hb(Eb(),Fb(),Gb());return new ab(bb(),za(null,null,null,fb(null,null,b,a)))}}function Md(){return function(a){return function(b){var c=new Hb(Eb(),Fb(),Gb());return new ab(bb(),za(null,null,null,Ei(null,null,null,b,c,a)))}}}function Nd(){return function(a){return function(b){return function(c){var l=new Hb(Eb(),
Fb(),Gb());return new ab(bb(),za(null,null,null,Fi(null,null,null,b,c,l,a)))}}}}function Od(){return function(a){return function(b){return function(c){var l=new Hb(Eb(),Fb(),Gb());return new ab(bb(),za(null,null,null,Gi(null,null,null,b,c,l,a)))}}}}function Pd(){return function(a){return function(b){var c=new Hb(Eb(),Fb(),Gb());return new ab(bb(),za(null,null,null,Hi(null,null,a,b,c)))}}}function Ii(){return function(a){return 13!==a.type}}function Ji(){return function(a){a=ia(null,null,I(),Qd(null,
Ii(),a));a=Ia(null,null,T(),"",Rd(ia(null,null,Ki(),a)));return new J(a)}}function Li(a){return function(b){var c=new Sd(Hd(),Jd(),new Td(Kd(),Ld(),Md(),Nd(),Od(),Pd()));b=new w(bf(null,null,null,c,hb(null,null,Ga(null,null,Gd(),v(null,V(null,B(null,null,Ya(null,D(h())),Mi())),Ja())),dc()))(a),tg(c,b));return new w(b,Ji())}}function Ni(){return function(a){return function(b){return function(b){return new p(a)}}}}function Oi(){return function(a){return function(b){return Pi(a)}}}function Qi(a,b){return function(c){return function(l){return Ud(null,
null,null,null,null,l,a(c),b)}}}function Ri(a,b,c){return function(b){return function(c){return a(b)(c)}}}function Si(a,b){return function(c){return a(c)(b)}}function ci(a){return function(b){return function(c){return new S(a,b,c)}}}function Ti(a,b){return function(c){return new S(a,b,c)}}function Ui(a){return function(b){return function(c){c=a(b)?Ti(b,c):Mc();return c}}}function Vi(){return function(a){return va(null,K(),da,a)}}function Wi(){return function(a){return function(b){return va(null,K(),
a,b)}}}function Xi(){return function(a){return function(b){return!!(0>Wb(a,b))}}}function Yi(){return function(a){return function(b){return!!(0<Wb(a,b))}}}function Zi(){return function(a){return function(b){b=0<Wb(a,b)?!0:a==b;return b}}}function $i(){return function(a){return function(b){return new S("",a,b)}}}function aj(a){return function(b){b=""===a?n.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);return B(null,null,Yb(b),Sb(a))}}function bj(){return function(a){return new q(a,
C)}}function Ki(){return function(a){if(1===wa(0===(""==a?1:0)?!0:!1,!0).type)a=C;else{var b=0===(""==a.slice(1)?1:0)?!0:!1;1===wa(b,!0).type?b=C:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===wa(b,!0).type?b=C:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===wa(b,!0).type?C:new q(a.slice(1).slice(1).slice(1)[0],Nc(a.slice(1).slice(1).slice(1).slice(1))),b=new q(a.slice(1).slice(1)[0],b)),b=new q(a.slice(1)[0],b));a=new q(a[0],b)}return a}}function Oc(){return function(a){if(1===wa(0===(""==
a?1:0)?!0:!1,!0).type)a=C;else{var b=0===(""==a.slice(1)?1:0)?!0:!1;1===wa(b,!0).type?b=C:(b=0===(""==a.slice(1).slice(1)?1:0)?!0:!1,1===wa(b,!0).type?b=C:(b=0===(""==a.slice(1).slice(1).slice(1)?1:0)?!0:!1,1===wa(b,!0).type?b=C:(b=0===(""==a.slice(1).slice(1).slice(1).slice(1)?1:0)?!0:!1,b=1===wa(b,!0).type?C:new q(a.slice(1).slice(1).slice(1).slice(1)[0],Nc(a.slice(1).slice(1).slice(1).slice(1).slice(1))),b=new q(a.slice(1).slice(1).slice(1)[0],b)),b=new q(a.slice(1).slice(1)[0],b)),b=new q(a.slice(1)[0],
b));a=new q(a[0],b)}return a}}function cj(){return function(a){return function(b){return Y(null,a,new q(" ",b))}}}function dj(a){return function(b){return function(c){return function(l){return new S(a(b),c,l)}}}}function ej(a){return function(b){return B(null,null,a,dj(b))}}function bb(){return function(a){return function(a){return function(a){return function(b){return G(null,null,null,a,fj(b))}}}}}function zi(a){return function(b){n.prim_writeStr(a+"\n");return kb}}function Id(a){return function(b){return new f(a)}}
function fj(a){return function(b){b=0===b.type?Id(b.$1):a(b.$1);return b}}function Ga(a,b,c,l){return function(a){return function(b){b=l(a)(b);b=0===b.type?new Ha(b.$1):new S(c(b.$1),b.$2,b.$3);return b}}}function Ai(a,b){return function(a){return{val:b}}}function Bi(a,b){return function(a){return b.val}}function Ci(a,b,c){return function(a){return b.val=c}}function B(a,b,c,l){return function(a){return function(b){b=c(a)(b);b=0===b.type?new Ha(b.$1):l(b.$1)(b.$2)(b.$3);return b}}}function Pc(){return function(a){return function(a){return function(a){return function(b){return ia(null,
null,a,b)}}}}}function Qc(){return function(a){return function(a){return new q(a,C)}}}function gj(a){return function(b){return function(c){return Y(null,ia(null,null,b,a),c)}}}function Rc(){return function(a){return function(a){return function(a){return function(b){return Ia(null,null,gj(b),C,a)}}}}}function tf(){return function(a){return function(b){return function(c){0===("a"===a?1:0)?(c=b(c),c=0===c.type?new f(c.$1):cd(new q(c.$1,C))):(c=b(c),c=0===c.type?new f(c.$1):bd(new q(c.$1,C)));return c}}}}
function hj(){return function(a){return function(a){return function(a){return function(b){return function(c){c=b(c);return a(c)}}}}}}function ij(){return function(a){return function(a){return function(a){return function(b){return function(c){var l=a(c);c=b(c);return l(c)}}}}}}function jj(a,b,c){return function(l){return function(d){var e=a.$2(null)(b)(d);return a.$3(null)(b)(Ic(null,null,c,l,e))(d)}}}function kj(a,b,c){return function(l){return function(d){var e=a.$2(null)(b)(d);return a.$3(null)(b)(Ic(null,
null,c,l,e))(d)}}}function td(a,b){return function(c){var l=1===b.type?new w(a(b.$1),td(a,b.$2)):new J(C);return new w(l,Hc(c))}}function nc(){return function(a){return function(b){return a+b}}}function oc(){return function(a){return function(b){return a*b}}}function pc(){return function(a){return a.intValue()}}function lj(a,b,c,l){return function(d){return function(e){return function(ya){var f=c(l);var g=c(d);if(0===(g.equals(new n.jsbn.BigInteger("0"))?1:0)){g=g.intValue();var h=b.intValue();f=
f.intValue()+g/Sc(null,new aa(nc(),oc(),pc()),h,(new n.jsbn.BigInteger(Math.trunc(Math.floor(Math.log(g)/Math.log(h)))+"")).add(new n.jsbn.BigInteger("1")))}else f=f.intValue();return new S(new ea(a(f)),e,ya)}}}}function mj(a,b,c,l,d){return function(e){return B(null,null,V(null,a),lj(b,c,l,d))}}function nj(a,b,c,l){return function(d){return B(null,null,D(mc()),mj(a,b,c,l,d))}}function oj(a,b){return function(c){return new na(a(b(c)))}}function gi(){return function(a){return"\\"===a}}function pj(){return function(a){return function(b){return function(c){return qj(a,
b,c)}}}}function hi(){return function(a){return B(null,null,ca('\\"nrt'),pj())}}function rj(){return function(a){return B(null,null,Ya(null,D(h())),Sb(a))}}function Mi(){return function(a){return B(null,null,Za(),rj())}}function Vd(){return function(a){return function(b){return new q(a,b)}}}function Cd(a,b){return function(c){return B(null,null,v(null,V(null,hb(null,null,Ga(null,null,Bb(),a),b)),Ja()),ud(c))}}function Wd(){return function(a){return function(a){return!0}}}function sj(a,b){return function(c){return B(null,
null,Lc(null,null,a,b),qa())}}function Xd(a,b){return function(c){return new q(c,Tc(null,null,null,null,null,a,b))}}function tj(a,b,c){return function(l){return new q(l,Tc(null,null,null,null,null,Xd(a,b),c))}}function ld(a,b,c){return function(l){var d=1===c.type?new w(ha(null,a,b,c.$1),ld(a,b,c.$2)):new J(C);return new w(d,Hc(l))}}function Yd(){return function(a){return function(b){return a-b}}}function uj(){return function(a){return function(b){return a/b}}}function vj(a,b,c,l){return function(d){d=
10===d.type?d.$1?0===l.type?new J(d):Xa(null,b,a,l):Uc(null,a,null,b,c):0===l.type?new J(d):Xa(null,b,a,l);return d}}function wj(a,b,c,l){return function(d){d=10===d.type?d.$1?0===l.type?new J(d):Xa(null,b,a,l):Uc(null,a,null,b,c):0===l.type?new J(d):Xa(null,b,a,l);return d}}function xj(a,b,c,l,d){return function(e){e=e?Xa(null,b,a,d):pd(null,a,null,null,b,c,l);return e}}function yj(a,b,c){return function(l){l=10===l.type?l.$1?new J(!0):$b(null,null,null,null,a,new q(b,new q(new M(c),C))):$b(null,
null,null,null,a,new q(b,new q(new M(c),C)));return l}}function zj(a,b,c){return function(l){l=10===l.type?l.$1?new J(!0):$b(null,null,null,null,a,new q(b,new q(new M(c),C))):$b(null,null,null,null,a,new q(b,new q(new M(c),C)));return l}}function Aj(a,b,c,l){return function(d){return qd(null,null,null,null,a,b,c,l)}}function Bj(a,b,c,l,d){return function(e){return Cj(a,b,c,l,d,e)}}function Dj(a,b,c){return function(l){return sd(null,null,null,null,a,b,c)}}function Ej(a,b,c){return function(l){return rd(null,
null,null,null,a,b,c)}}function uf(){return function(a){a=1===a.type?0===a.$2.type?new p(a.$1):new p(new M(a)):new p(new M(a));return a}}function Hi(a,b,c,l,d){return function(a){var b=zc(null,null,null,new Nb(hj(),ed(),ij()),W(null,null,d),l)(a),e=d.$1(null),f=new Va(Ac(),fd(),Bc());b=gd(null,null,hd(),new id(f),b);a=e(b)(a);return new Fj(a,c)}}function Gi(a,b,c,l,d,e,f){return function(a){if(1===f.type){var b=e.$2(null)(f.$1)(a);b=0===b.type?ta:Ib(null,null,b.$1,null,l,b.$2);1===b.type?a=e.$3(null)(b.$1)(d)(a):
(b=e.$1(null)(d),a=jj(e,f.$1,l)(b(a))(a))}else b=e.$2(null)(f.$1)(a),b=0===b.type?ta:Ib(null,null,b.$1,null,l,b.$2),1===b.type?a=e.$3(null)(b.$1)(d)(a):(b=e.$1(null)(d),a=kj(e,f.$1,l)(b(a))(a));return a}}function Ei(a,b,c,l,d,e){return function(a){a:for(var b=e;;)if(1===b.type){var c=d.$2(null)(b.$1)(a);c=0===c.type?ta:Ib(null,null,c.$1,null,l,c.$2);if(1===c.type){a=d.$2(null)(c.$1)(a);a=new xa(a);break a}b=b.$2}else{b=d.$2(null)(b.$1)(a);b=0===b.type?ta:Ib(null,null,b.$1,null,l,b.$2);if(1===b.type){a=
d.$2(null)(b.$1)(a);a=new xa(a);break a}a=ta;break a}return a}}function Gg(){return function(a){return Gj(a)}}function Fi(a,b,c,l,d,e,f){return function(a){a:for(var b=f;;)if(1===b.type){var c=e.$2(null)(b.$1)(a);c=0===c.type?ta:Ib(null,null,c.$1,null,l,c.$2);if(1===c.type){b=e.$3(null)(c.$1)(d);c=Wd();a=c(b(a))(a);break a}b=b.$2}else{b=e.$2(null)(b.$1)(a);b=0===b.type?ta:Ib(null,null,b.$1,null,l,b.$2);if(1===b.type){b=e.$3(null)(b.$1)(d);c=Wd();a=c(b(a))(a);break a}a=!1;break a}return a}}function Di(a,
b,c,l,d,e){return function(f){return Zd(a,b,c,l,d,e,f)}}function Qg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new p(new z(ac(null,Tb(),a.$1,b.$1))):new f(new r("Unexpected error in ="));else if(5===b.type)b=5===a.type?new p(new z(a.$1===b.$1)):new f(new r("Unexpected error in ="));else if(4===b.type)b=4===a.type?new p(new z(a.$1.equals(b.$1))):new f(new r("Unexpected error in ="));else if(7===b.type&&7===a.type){b=b.$1;var c=a.$1;var l=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);
b=b.$2(l)(c);b=new p(new z(b))}else b=new f(new r("Unexpected error in ="));return b}}}function Ug(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new f(new r("> not defined for complex numbers")):new f(new r("Unexpected error in >"));else if(5===b.type)b=5===a.type?new p(new z(!!(0<Ta(a.$1,b.$1)))):new f(new r("Unexpected error in >"));else if(4===b.type)b=4===a.type?new p(new z(!!(0<Sa(a.$1,b.$1)))):new f(new r("Unexpected error in >"));else if(7===b.type&&7===a.type){var c=
b.$1,l=a.$1;b=c.$4;var d=c.$1.$1.$2(l.$6)(c.$7);c=c.$1.$1.$2(c.$6)(l.$7);b=!!(0<b.$2(d)(c));b=new p(new z(b))}else b=new f(new r("Unexpected error in >"));return b}}}function Yg(a,b){return function(a){return function(b){a:if(6===b.type)var c=6===a.type?new f(new r(">= not defined for complex numbers")):new f(new r("Unexpected error in >="));else{if(5===b.type){if(5===a.type){c=0<Ta(a.$1,b.$1)?!0:a.$1===b.$1;c=new p(new z(c));break a}}else if(4===b.type){if(4===a.type){c=0<Sa(a.$1,b.$1)?!0:a.$1.equals(b.$1);
c=new p(new z(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var l=b.$4;var d=b.$1.$1.$2(c.$6)(b.$7);var e=b.$1.$1.$2(b.$6)(c.$7);0<l.$2(d)(e)?c=!0:(l=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(l)(c));c=new p(new z(c));break a}c=new f(new r("Unexpected error in >="))}return c}}}function Wg(a,b){return function(a){return function(b){if(6===b.type)b=6===a.type?new f(new r("< not defined for complex numbers")):new f(new r("Unexpected error in <"));else if(5===b.type)b=5===a.type?
new p(new z(!!(0>Ta(a.$1,b.$1)))):new f(new r("Unexpected error in <"));else if(4===b.type)b=4===a.type?new p(new z(!!(0>Sa(a.$1,b.$1)))):new f(new r("Unexpected error in <"));else if(7===b.type&&7===a.type){var c=b.$1,l=a.$1;b=c.$4;var d=c.$1.$1.$2(l.$6)(c.$7);c=c.$1.$1.$2(c.$6)(l.$7);b=!!(0>b.$2(d)(c));b=new p(new z(b))}else b=new f(new r("Unexpected error in <"));return b}}}function $g(a,b){return function(a){return function(b){a:if(6===b.type)var c=6===a.type?new f(new r("<= not defined for complex numbers")):
new f(new r("Unexpected error in <="));else{if(5===b.type){if(5===a.type){c=0>Ta(a.$1,b.$1)?!0:a.$1===b.$1;c=new p(new z(c));break a}}else if(4===b.type){if(4===a.type){c=0>Sa(a.$1,b.$1)?!0:a.$1.equals(b.$1);c=new p(new z(c));break a}}else if(7===b.type&&7===a.type){c=a.$1;b=b.$1;var d=b.$4;var l=b.$1.$1.$2(c.$6)(b.$7);var e=b.$1.$1.$2(b.$6)(c.$7);0>d.$2(l)(e)?c=!0:(d=b.$1.$1.$2(c.$6)(b.$7),c=b.$1.$1.$2(b.$6)(c.$7),c=b.$2(d)(c));c=new p(new z(c));break a}c=new f(new r("Unexpected error in <="))}return c}}}
function Sg(a,b){return function(a){return function(b){a:if(6===b.type)b=6===a.type?new p(new z(!ac(null,Tb(),a.$1,b.$1))):new f(new r("Unexpected error in /="));else{if(5===b.type){if(5===a.type){b=new p(new z(0===(a.$1===b.$1?1:0)?!0:!1));break a}}else if(4===b.type){if(4===a.type){b=0===(a.$1.equals(b.$1)?1:0)?!0:!1;b=new p(new z(b));break a}}else if(7===b.type&&7===a.type){b=b.$1;var c=a.$1;var d=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);b=!b.$2(d)(c);b=new p(new z(b));break a}b=new f(new r("Unexpected error in /="))}return b}}}
function Kg(a,b){return function(c){return Hj(a,b,c)}}function Ig(a){return function(b){return Ij(a,b)}}function bc(a,b,c,d,e,f,g){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=d;this.$5=e;this.$6=f;this.$7=g}function ua(a,b){this.type=0;this.$1=a;this.$2=b}function q(a,b){this.type=1;this.$1=a;this.$2=b}function $d(a,b){this.type=2;this.$1=a;this.$2=b}function w(a,b){this.type=1;this.$1=a;this.$2=b}function Ua(a,b,c){this.type=1;this.$1=a;this.$2=b;this.$3=c}function cc(a,b,c,d,e){this.type=
2;this.$1=a;this.$2=b;this.$3=c;this.$4=d;this.$5=e}function Jj(a,b){this.type=10;this.$1=a;this.$2=b}function r(a){this.type=6;this.$1=a}function id(a){this.type=0;this.$1=a}function Fj(a,b){this.type=1;this.$1=a;this.$2=b}function ve(a){this.type=0;this.$1=a}function xa(a){this.type=1;this.$1=a}function Jb(a,b){this.type=0;this.$1=a;this.$2=b}function f(a){this.type=0;this.$1=a}function ab(a,b){this.type=2;this.$1=a;this.$2=b}function Fc(a){this.type=1;this.$1=a}function z(a){this.type=10;this.$1=
a}function Ca(a){this.type=9;this.$1=a}function ja(a){this.type=6;this.$1=a}function cb(a,b){this.type=3;this.$1=a;this.$2=b}function ea(a){this.type=5;this.$1=a}function Vb(a,b,c,d,e){this.type=12;this.$1=a;this.$2=b;this.$3=c;this.$4=d;this.$5=e}function na(a){this.type=4;this.$1=a}function M(a){this.type=2;this.$1=a}function cf(a){this.type=5;this.$1=a}function xi(a){this.type=11;this.$1=a}function Da(a){this.type=7;this.$1=a}function gb(a){this.type=8;this.$1=a}function ui(a,b){this.type=0;this.$1=
a;this.$2=b}function ae(a,b){this.type=1;this.$1=a;this.$2=b}function Na(a){this.type=0;this.$1=a}function A(a,b){this.type=1;this.$1=a;this.$2=b}function E(a,b){this.type=0;this.$1=a;this.$2=b}function Ec(a,b){this.type=0;this.$1=a;this.$2=b}function y(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Ha(a){this.type=0;this.$1=a}function S(a,b,c){this.type=1;this.$1=a;this.$2=b;this.$3=c}function J(a){this.type=0;this.$1=a}function p(a){this.type=1;this.$1=a}function be(a,b){this.type=1;
this.$1=a;this.$2=b}function t(a,b){this.type=1;this.$1=a;this.$2=b}function qc(a){this.type=4;this.$1=a}function Db(a,b){this.type=0;this.$1=a;this.$2=b}function Nb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Sd(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Td(a,b,c,d,e,f){this.type=0;this.$1=a;this.$2=b;this.$3=c;this.$4=d;this.$5=e;this.$6=f}function Kj(a,b){this.type=0;this.$1=a;this.$2=b}function Hb(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Cb(a,b,c){this.type=
0;this.$1=a;this.$2=b;this.$3=c}function $a(a,b){this.type=0;this.$1=a;this.$2=b}function aa(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function Va(a,b,c){this.type=0;this.$1=a;this.$2=b;this.$3=c}function N(a,b){this.type=0;this.$1=a;this.$2=b}function Y(a,b,c){return 1===b.type?new q(b.$1,Y(null,b.$2,c)):c}function sb(a,b,c,d,e,f,g,h){a=b.$1.$3(new n.jsbn.BigInteger("0"));if(c(h)(a))return ta;a=d.$2(g);var l=d.$2(h);a:for(;;){var ya=b.$1.$3(new n.jsbn.BigInteger("0"));if(c(l)(ya))break a;
else ya=b.$3(a)(l),a=l,l=ya}g=b.$2(g)(a);h=b.$2(h)(a);return new xa(new bc(b,c,d,e,f,g,h))}function ne(a){for(;;)if(1===a.type){if(0===a.$2.type)return new p(a.$1);var b=a.$1;if(10===b.type)if(b.$1)a=a.$2;else return new p(new z(!1));else a=a.$2}else return new p(new z(!0))}function oe(a){return"0"===a?new n.jsbn.BigInteger("0"):"1"===a?new n.jsbn.BigInteger("1"):new n.Lazy(function(){throw Error("*** ParseNumber.idr:74:23:unmatched case in ParseNumber.case block in binConverter at ParseNumber.idr:74:23 ***");
})}function Ed(a,b){return B(null,null,v(null,D(zf()),v(null,D(Af()),D(Bf()))),Ef(b))}function bd(a){if(1===a.type){var b=a.$1;return 3===b.type?(b=b.$1,1===b.type?0===a.$2.type?new p(b.$1):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new r("car expected pair, found "+sa(a.$1))):new f(new y(new A(1,1),x(null,a),a))):2===b.type?(b=b.$1,1===b.type?0===a.$2.type?new p(b.$1):new f(new y(new A(1,1),x(null,a),a)):0===b.type?0===a.$2.type?new f(new r("Unexpected error in car")):new f(new y(new A(1,
1),x(null,a),a)):0===a.$2.type?new f(new r("car expected pair, found "+sa(a.$1))):new f(new y(new A(1,1),x(null,a),a))):0===a.$2.type?new f(new r("car expected pair, found "+sa(a.$1))):new f(new y(new A(1,1),x(null,a),a))}return new f(new y(new A(1,1),x(null,a),a))}function cd(a){if(1===a.type){var b=a.$1;if(3===b.type){var c=b.$1;return 1===c.type?0===c.$2.type?0===a.$2.type?new p(n.force(b.$2)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new cb(c.$2,new n.Lazy(function(){return n.force(b.$2)}))):
new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new r("cdr expected pair, found "+sa(a.$1))):new f(new y(new A(1,1),x(null,a),a))}return 2===b.type?(c=b.$1,1===c.type?0===c.$2.type?0===a.$2.type?new p(new M(C)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new M(c.$2)):new f(new y(new A(1,1),x(null,a),a)):0===c.type?0===a.$2.type?new f(new r("cdr on empty list")):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new f(new r("cdr expected pair, found "+sa(a.$1))):new f(new y(new A(1,
1),x(null,a),a))):0===a.$2.type?new f(new r("cdr expected pair, found "+sa(a.$1))):new f(new y(new A(1,1),x(null,a),a))}return new f(new y(new A(1,1),x(null,a),a))}function La(a){return(0<Vc(a,0)||0===a)&&0>Vc(a,1114112)?String.fromCharCode(a):"\x00"}function pe(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=b.$1;return 3===c.type?0===b.$2.type?new p(new cb(new q(a.$1,c.$1),new n.Lazy(function(){return n.force(c.$2)}))):new f(new y(new A(2,2),x(null,a),a)):2===c.type?0===b.$2.type?new p(new M(new q(a.$1,
c.$1))):new f(new y(new A(2,2),x(null,a),a)):0===b.$2.type?new p(new cb(new q(a.$1,C),new n.Lazy(function(){return b.$1}))):new f(new y(new A(2,2),x(null,a),a))}}return new f(new y(new A(2,2),x(null,a),a))}function qe(a){return"0"===a?new n.jsbn.BigInteger("0"):"1"===a?new n.jsbn.BigInteger("1"):"2"===a?new n.jsbn.BigInteger("2"):"3"===a?new n.jsbn.BigInteger("3"):"4"===a?new n.jsbn.BigInteger("4"):"5"===a?new n.jsbn.BigInteger("5"):"6"===a?new n.jsbn.BigInteger("6"):"7"===a?new n.jsbn.BigInteger("7"):
"8"===a?new n.jsbn.BigInteger("8"):"9"===a?new n.jsbn.BigInteger("9"):new n.Lazy(function(){throw Error("*** ParseNumber.idr:31:23:unmatched case in ParseNumber.case block in decConverter at ParseNumber.idr:31:23 ***");})}function vd(a,b){return 0===(b.equals(new n.jsbn.BigInteger("0"))?1:0)?a.divide(b):new n.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:341:22-27:unmatched case in Prelude.Interfaces.case block in divBigInt at ./Prelude/Interfaces.idr:341:22-27 ***");})}function re(a){if(2===
a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ua(a.$1-b.$1,a.$2-b.$2),new p(new ja(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new p(new ea(a.$1-c.$1)):new f(new r("Unexpected error in -")):new f(new r("Unexpected error in -"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new p(new na(a.$1.subtract(c.$1))):new f(new r("Unexpected error in -")):
new f(new r("Unexpected error in -"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?rc(af(null),a.$1,c.$1,"-"):new f(new r("Unexpected error in -")):new f(new r("Unexpected error in -"))}return new f(new r("Unexpected error in -"))}function ic(a,b,c){return 1===c.type?(a=c.$1,a=1===a.type?new J(a):b.$1(null)(null)(new r("Type error")),new w(a,Ff(b,c.$2))):new J(Ka)}function ec(a){for(;;)if(1===a.type){var b=a.$1;if(1===b.type){var c=a.$2;if(1===c.type){var d=c.$1;
return 1===d.type?0===c.$2.type?new p(new z(b.$1==d.$1)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))}return new f(new y(new A(2,2),x(null,a),a))}if(10===b.type)return d=a.$2,1===d.type?(c=d.$1,10===c.type?0===d.$2.type?(b=b.$1,b=new p(new z(c.$1?b:!b))):b=0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):b=0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)),b):
new f(new y(new A(2,2),x(null,a),a));if(9===b.type)return c=a.$2,1===c.type?(d=c.$1,9===d.type?0===c.$2.type?new p(new z(b.$1===d.$1)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):new f(new y(new A(2,2),x(null,a),a));if(6===b.type)return c=a.$2,1===c.type?(d=c.$1,6===d.type?0===c.$2.type?new p(new z(ac(null,Tb(),b.$1,d.$1))):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?
new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):new f(new y(new A(2,2),x(null,a),a));if(3===b.type)if(c=a.$2,1===c.type)if(d=c.$1,3===d.type)if(0===c.$2.type)a=new q(new M(Y(null,b.$1,new q(n.force(b.$2),C))),new q(new M(Y(null,d.$1,new q(n.force(d.$2),C))),C));else return 0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a));else return 0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a));else return new f(new y(new A(2,2),x(null,a),a));else{if(5===b.type)return c=
a.$2,1===c.type?(d=c.$1,5===d.type?0===c.$2.type?new p(new z(b.$1===d.$1)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):new f(new y(new A(2,2),x(null,a),a));if(4===b.type)return c=a.$2,1===c.type?(d=c.$1,4===d.type?0===c.$2.type?new p(new z(b.$1.equals(d.$1))):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):
new f(new y(new A(2,2),x(null,a),a));if(2===b.type){d=a.$2;if(1===d.type){c=d.$1;if(2===c.type&&0===d.$2.type){if(Ra(x(null,b.$1),x(null,c.$1))){a=Lj(null,null,b.$1,c.$1);if(0===a.type)return new f(a.$1);b=Ra(x(null,b.$1),x(null,c.$1))?a.$1:!1;return new p(new z(b))}return new p(new z(!1))}return 0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))}return new f(new y(new A(2,2),x(null,a),a))}if(7===b.type)return c=a.$2,1===c.type?(d=c.$1,7===d.type&&0===c.$2.type?(a=d.$1,c=b.$1,
b=a.$1.$1.$2(c.$6)(a.$7),c=a.$1.$1.$2(a.$6)(c.$7),b=a.$2(b)(c),new p(new z(b))):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):new f(new y(new A(2,2),x(null,a),a));if(8===b.type)return c=a.$2,1===c.type?(d=c.$1,8===d.type?0===c.$2.type?new p(new z(b.$1==d.$1)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):0===a.$2.$2.type?new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a))):new f(new y(new A(2,2),x(null,a),a));b=a.$2;return 1===b.type?0===b.$2.type?
new p(new z(!1)):new f(new y(new A(2,2),x(null,a),a)):new f(new y(new A(2,2),x(null,a),a))}}else return new f(new y(new A(2,2),x(null,a),a))}function ha(a,b,c,d){if(1===d.type)return c=b.$3.$3(c)(d.$1),new w(c,Gf(b,d.$1));if(10===d.type||9===d.type)return new J(d);if(6===d.type)return 0===(0===d.$1.$2?1:0)?new J(d):new J(new ea(d.$1.$1));if(5===d.type||4===d.type)return new J(d);if(2===d.type){a=d.$1;if(1===a.type){d=a.$1;if(1===d.type){d=d.$1;if("apply"===d){d=a.$2;if(1===d.type){var e=d.$2;if(1===
e.type){if(0===e.$2.type)return a=b.$3.$1(new N(I(),O()))(c),new w(a,Jf(b,c,d.$1,e.$1));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("case"===d)return a=a.$2,1===a.type?new w(ha(null,b,c,a.$1),Lf(c,b,a.$2)):b.$1(null)(null)(new r("case: bad syntax in: (case)"));if("cond"===d)return Uc(null,c,null,b,a.$2);if("define"===d){d=a.$2;if(1===d.type){e=d.$1;if(1===
e.type){d=d.$2;if(1===d.type){if(0===d.$2.type)return new w(ha(null,b,c,d.$1),Mf(b,c,e.$1));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if(3===e.type){var l=e.$1;if(1===l.type){var f=l.$1;if(1===f.type)return b=b.$3.$5(c)(f.$1)(new Vb(f.$1,ia(null,null,I(),l.$2),new xa(sa(n.force(e.$2))),d.$2,c)),new w(b,tb());d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,
c,a.$1,a.$2))}if(2===e.type){e=e.$1;if(1===e.type){l=e.$1;if(1===l.type)return b=b.$3.$5(c)(l.$1)(new Vb(l.$1,ia(null,null,I(),e.$2),ta,d.$2,c)),new w(b,tb());d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("if"===d){d=a.$2;if(1===d.type){e=d.$2;if(1===e.type){l=e.$2;if(1===l.type){if(0===l.$2.type)return new w(ha(null,
b,c,d.$1),Nf(b,c,l.$1,e.$1));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("lambda"===d){d=a.$2;if(1===d.type){e=d.$1;if(1===e.type)return new J(new Vb("\u03bb",ia(null,null,I(),C),new xa(sa(d.$1)),d.$2,c));if(3===e.type)return new J(new Vb("\u03bb",ia(null,null,I(),e.$1),new xa(sa(n.force(e.$2))),
d.$2,c));if(2===e.type)return b=b.$3.$1(new N(I(),O()))(c),new w(b,Of(e.$1,d.$2,c));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("let"===d){d=a.$2;if(1===d.type){e=d.$1;if(2===e.type)return new w(sc(null,b,e.$1),Wf(b,e.$1,c,d.$2));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("let*"===d){d=a.$2;if(1===d.type){e=d.$1;if(2===e.type)return new w(sc(null,
b,e.$1),bg(b,e.$1,c,d.$2));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("letrec"===d){d=a.$2;if(1===d.type){e=d.$1;if(2===e.type)return new w(sc(null,b,e.$1),lg(b,e.$1,c,d.$2));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("print"===d){d=a.$2;if(1===d.type){if(0===d.$2.type)return new w(ha(null,b,c,d.$1),ng(b));d=b.$3.$1(new N(I(),O()))(c);
return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("quote"===d){d=a.$2;if(1===d.type){if(0===d.$2.type)return new J(d.$1);d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("set!"===d){e=a.$2;if(1===e.type){d=e.$1;if(1===d.type){e=e.$2;if(1===e.type){if(0===e.$2.type)return new w(ha(null,b,c,e.$1),og(b,c,d.$1));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),
O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}if("set-car!"===d){e=a.$2;if(1===e.type){d=e.$1;if(1===d.type){e=e.$2;if(1===e.type){if(0===e.$2.type)return new w(ha(null,b,c,e.$1),rg(b,c,d.$1,e.$1));d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=
b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}d=b.$3.$1(new N(I(),O()))(c);return new w(d,P(b,c,a.$1,a.$2))}return b.$1(null)(null)(new $d("Unrecognized special form",d))}return 7===d.type?0===(d.$1.$7.equals(new n.jsbn.BigInteger("1"))?1:0)?new J(d):new J(new na(d.$1.$6)):8===d.type?new J(d):0===d.type?new J(d):13===d.type?new J(Ka):b.$1(null)(null)(new $d("Unrecognized special form",d))}function Ub(a,b,c,d){return 1===d.type?
new w(ha(null,b,c,d.$1),sg(b,c,d.$2)):new J(C)}function Xa(a,b,c,d){return 1===d.type?0===d.$2.type?ha(null,b,c,d.$1):new w(ha(null,b,c,d.$1),Gc(b,c,d.$2)):new J(Ka)}function Qd(a,b,c){for(;;)if(1===c.type){if(b(c.$1))return new q(c.$1,Qd(null,b,c.$2));c=c.$2}else return c}function ce(a,b,c){return 1===c.type?0===c.$2.type?c.$1:b(c.$1)(ce(null,b,c.$2)):new n.Lazy(function(){throw Error("*** ./Prelude/Strings.idr:24:1-16:unmatched case in Prelude.Strings.foldr1 ***");})}function sc(a,b,c){return 1===
c.type?(a=c.$1,2===a.type?(a=a.$1,1===a.type?new w(sc(null,b,c.$2),ug(a.$1)):b.$1(null)(null)(new r("Unexpected error (getHeads)"))):b.$1(null)(null)(new r("Unexpected error (getHeads)"))):0===c.type?new J(new M(C)):b.$1(null)(null)(new r("Unexpected error (getHeads)"))}function kc(a,b,c){return 1===c.type?(a=c.$1,2===a.type&&(a=a.$1,1===a.type)?(a=a.$2,1===a.type?0===a.$2.type?new w(kc(null,b,c.$2),wg(a.$1)):b.$1(null)(null)(new r("Unexpected error (getTails)")):b.$1(null)(null)(new r("Unexpected error (getTails)"))):
b.$1(null)(null)(new r("Unexpected error (getTails)"))):0===c.type?new J(new M(C)):b.$1(null)(null)(new r("Unexpected error (getTails)"))}function se(a){var b=null;b=yd(a)?String.fromCharCode((a.charCodeAt(0)|0)-32):a;return"0"===b?new n.jsbn.BigInteger("0"):"1"===b?new n.jsbn.BigInteger("1"):"2"===b?new n.jsbn.BigInteger("2"):"3"===b?new n.jsbn.BigInteger("3"):"4"===b?new n.jsbn.BigInteger("4"):"5"===b?new n.jsbn.BigInteger("5"):"6"===b?new n.jsbn.BigInteger("6"):"7"===b?new n.jsbn.BigInteger("7"):
"8"===b?new n.jsbn.BigInteger("8"):"9"===b?new n.jsbn.BigInteger("9"):"A"===b?new n.jsbn.BigInteger("10"):"B"===b?new n.jsbn.BigInteger("11"):"C"===b?new n.jsbn.BigInteger("12"):"D"===b?new n.jsbn.BigInteger("13"):"E"===b?new n.jsbn.BigInteger("14"):"F"===b?new n.jsbn.BigInteger("15"):new n.Lazy(function(){throw Error("*** ParseNumber.idr:55:23-33:unmatched case in ParseNumber.case block in hexConverter at ParseNumber.idr:55:23-33 ***");})}function yc(a,b,c){for(;;)if(1===c.type){if(b.equals(new n.jsbn.BigInteger("0")))return new xa(c.$1);
b=b.subtract(new n.jsbn.BigInteger("1"));c=c.$2}else return ta}function Ic(a,b,c,d,e){if(0===e.type)return new ae(e.$1,new Jb(c,d));a=Kb(null,null,e.$1,null,c,d,e.$2);0===a.type?a=new f(a.$1):(a=a.$1,b=a.$2,a=new p(new Ua(a.$1,b.$1,b.$2)));return new ae(e.$1,a.$1)}function L(a){return 1===a.type?4===a.$1.type?0===a.$2.type?new p(new z(!0)):new f(new y(new A(1,1),x(null,a),a)):0===a.$2.type?new p(new z(!1)):new f(new y(new A(1,1),x(null,a),a)):new f(new y(new A(1,1),x(null,a),a))}function yd(a){return 0<
nb(a,"a")||"a"===a?0>nb(a,"z")?!0:"z"===a:!1}function xd(a){return 0<nb(a,"A")||"A"===a?0>nb(a,"Z")?!0:"Z"===a:!1}function Mj(a,b,c){for(;;)if(a=b.$2,1===a.type)b=new q(a.$1,a.$2);else return b.$1}function x(a,b){return 1===b.type?x(null,b.$2).add(new n.jsbn.BigInteger("1")):new n.jsbn.BigInteger("0")}function Wc(a,b){for(;;)if(1===b.type)if(1===a.type)if(Xc(a.$1,b.$1))a=a.$2,b=b.$2;else return!1;else return!1;else return 0===b.type?0===a.type:!1}function Be(a){if(1===a.type){var b=a.$2;if(1===b.type){var c=
b.$1;if(2===c.type){if(0===b.$2.type){a:for(a=a.$1,c=c.$1;;)if(1===c.type)if(Xc(c.$1,a)){c=new p(new M(new q(c.$1,c.$2)));break a}else c=c.$2;else{c=new p(new z(!1));break a}return c}return new f(new y(new A(1,1),x(null,a),a))}return 0===b.$2.type?new f(new t("list",b.$1)):new f(new y(new A(1,1),x(null,a),a))}}return new f(new y(new A(1,1),x(null,a),a))}function De(a){if(1===a.type){var b=a.$1;if(2===b.type){if(0===a.$2.type){a:for(a=C,b=b.$1;;)if(1===b.type)a=new q(b.$1,a),b=b.$2;else break a;return new p(new M(a))}return new f(new y(new A(1,
1),x(null,a),a))}return 0===a.$2.type?new f(new t("list",a.$1)):new f(new y(new A(1,1),x(null,a),a))}return 0===a.type?new f(new y(new A(1,1),new n.jsbn.BigInteger("0"),C)):new f(new y(new A(1,1),x(null,a),a))}function Fe(a){for(;;)if(1===a.type){var b=a.$1;if(4===b.type){var c=a.$2;if(1===c.type)return a=c.$1,9===a.type?0===c.$2.type?new p(new gb(Ia(null,null,T(),"",de(null,b.$1,a.$1)))):new f(new r("Invalid arguments to `make-string`")):new f(new r("Invalid arguments to `make-string`"));if(0===
c.type)a=new q(a.$1,new q(new Ca(La(0)),C));else return new f(new r("Invalid arguments to `make-string`"))}else return new f(new r("Invalid arguments to `make-string`"))}else return new f(new r("Invalid arguments to `make-string`"))}function V(a,b){return B(null,null,b,zg(b))}function Df(a){return"("===a?D(Ag()):"["===a?D(Bg()):"{"===a?D(Cg()):new n.Lazy(function(){throw Error("*** Parse.idr:15:10-13:unmatched case in Parse.case block in matchBracket at Parse.idr:15:10-13 ***");})}function Xb(a,b){return 0===
(b.equals(new n.jsbn.BigInteger("0"))?1:0)?a.remainder(b):new n.Lazy(function(){throw Error("*** ./Prelude/Interfaces.idr:345:22-27:unmatched case in Prelude.Interfaces.case block in modBigInt at ./Prelude/Interfaces.idr:345:22-27 ***");})}function dd(a,b){return 0===("\n"===a?1:0)?new Ec(1,b.$2+1):new Ec(b.$1+1,0)}function Ab(a,b,c,d){for(;;)if(1===d.type){c=Pb(new q(c,new q(d.$1,C)));if(0===c.type)return new f(c.$1);c=c.$1;if(2===c.type){var e=c.$1;if(1===e.type)if(c=e.$2,1===c.type)if(0===c.$2.type){var l=
b(e.$1)(c.$1);if(0===l.type)return b(e.$1)(c.$1);e=l.$1;if(10===e.type)if(e=e.$1)if(e)c=c.$1,d=d.$2;else return new f(new r("Unexpected error in "+a));else return new p(new z(!1));else return new f(new r("Unexpected error in "+a))}else return new n.Lazy(function(){return tc()});else return new n.Lazy(function(){return tc()});else return new n.Lazy(function(){return tc()})}else return new n.Lazy(function(){return tc()})}else return new p(new z(!0))}function Pb(a){if(1===a.type){var b=a.$1;if(6===b.type){if(b=
a.$2,1===b.type){var c=b.$1;if(6===c.type){if(0===b.$2.type)return new p(new M(new q(a.$1,new q(b.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(5===c.type){if(0===b.$2.type)return new p(new M(new q(a.$1,new q(new ja(new ua(c.$1,0)),C))));b=a.$2;return 0===b.$2.type?
(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(4===c.type){if(0===b.$2.type)return new p(new M(new q(a.$1,new q(new ja(new ua(c.$1.intValue(),0)),C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):
7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(7===c.type){if(0===b.$2.type)return b=ib(c.$1),1===b.type?new p(new M(new q(a.$1,new q(new ja(new ua(b.$1,0)),C)))):new f(new r("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):
new f(new r("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))}}else if(5===b.type){if(c=a.$2,1===c.type){var d=c.$1;if(6===d.type){if(0===c.$2.type)return new p(new M(new q(new ja(new ua(b.$1,0)),new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===
c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(5===d.type){if(0===c.$2.type)return new p(new M(new q(a.$1,new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(4===
d.type){if(0===c.$2.type)return new p(new M(new q(a.$1,new q(new ea(d.$1.intValue()),C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(7===d.type){if(0===c.$2.type)return b=ib(d.$1),1===b.type?new p(new M(new q(a.$1,new q(new ea(b.$1),C)))):new f(new r("Unexpected error in numCast"));
b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))}}else if(4===
b.type){if(c=a.$2,1===c.type){d=c.$1;if(6===d.type){if(0===c.$2.type)return new p(new M(new q(new ja(new ua(b.$1.intValue(),0)),new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(5===d.type){if(0===c.$2.type)return new p(new M(new q(new ea(b.$1.intValue()),new q(c.$1,
C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(4===d.type){if(0===c.$2.type)return new p(new M(new q(a.$1,new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",
b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(7===d.type){if(0===c.$2.type)return new p(new M(new q(new Da(new bc(new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),la(),Z()),zb()),b.$1,new n.jsbn.BigInteger("1"))),new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===
c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))}}else if(7===b.type){if(c=a.$2,1===c.type){d=c.$1;if(6===d.type){if(0===c.$2.type)return a=ib(b.$1),1===a.type?new p(new M(new q(new ja(new ua(a.$1,
0)),new q(c.$1,C)))):new f(new r("Unexpected error in numCast"));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(5===d.type){if(0===c.$2.type)return a=ib(b.$1),1===a.type?new p(new M(new q(new ea(a.$1),new q(c.$1,C)))):new f(new r("Unexpected error in numCast"));b=a.$2;return 0===
b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(4===d.type){if(0===c.$2.type)return new p(new M(new q(a.$1,new q(new Da(new bc(new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),la(),Z()),zb()),d.$1,new n.jsbn.BigInteger("1"))),
C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}if(7===d.type){if(0===c.$2.type)return new p(new M(new q(a.$1,new q(c.$1,C))));b=a.$2;return 0===b.$2.type?(c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",
b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))):new f(new r("Unexpected error in numCast"))}b=a.$2;if(0===b.$2.type)return c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))}}else if(b=a.$2,1===b.type&&0===b.$2.type)return c=a.$1,6===c.type?new f(new t("Integer",b.$1)):5===c.type?new f(new t("Integer",b.$1)):4===c.type?new f(new t("Integer",
b.$1)):7===c.type?new f(new t("Integer",b.$1)):new f(new t("Integer",a.$1))}return new f(new r("Unexpected error in numCast"))}function Ke(a){if(Ra(x(null,a),new n.jsbn.BigInteger("2"))){a=Pb(a);if(0===a.type)return new f(a.$1);a=a.$1;if(2===a.type){var b=a.$1;if(1===b.type&&(a=b.$1,4===a.type&&(b=b.$2,1===b.type))){var c=b.$1;return 4===c.type?0===b.$2.type?new p(new na(vd(a.$1,c.$1))):new f(new r("Unexpected error in <=")):new f(new r("Unexpected error in <="))}}return new f(new r("Unexpected error in <="))}return new f(new y(new A(2,
2),x(null,a),a))}function pa(a){if(6===a.type){var b=a.$1.$1;return(0===(0===a.$1.$2?1:0)?0:b===uc(b).intValue())?new p(new na(uc(b))):new f(new r("Could not convert complex to integer"))}return 5===a.type?0===(a.$1===uc(a.$1).intValue()?1:0)?new f(new r("Could not convert float to integer")):new p(new na(uc(a.$1))):4===a.type?new p(a):7===a.type?0===(a.$1.$7.equals(new n.jsbn.BigInteger("1"))?1:0)?new f(new r("Could not convert rational to integer")):new p(new na(a.$1.$6)):new f(new r("Could not convert non-number to integer"))}
function Pe(a){if(1===a.type&&0===a.$2.type){var b=a.$1,c=null;c=6===b.type?new p(new z(!0)):5===b.type?new p(new z(!0)):7===b.type?new p(new z(!0)):L(new q(a.$1,C));if(0===c.type)return new f(c.$1);b=c.$1;return 10===b.type?(b=b.$1)?b?new p(new gb(sa(a.$1))):new f(new r("Unexpected error")):new f(new t("number?",a.$1)):new f(new r("Unexpected error"))}return new n.Lazy(function(){throw Error("*** Numbers.idr:342:1-347:46:unmatched case in Numbers.numToString ***");})}function Re(a){return"0"===a?
new n.jsbn.BigInteger("0"):"1"===a?new n.jsbn.BigInteger("1"):"2"===a?new n.jsbn.BigInteger("2"):"3"===a?new n.jsbn.BigInteger("3"):"4"===a?new n.jsbn.BigInteger("4"):"5"===a?new n.jsbn.BigInteger("5"):"6"===a?new n.jsbn.BigInteger("6"):"7"===a?new n.jsbn.BigInteger("7"):new n.Lazy(function(){throw Error("*** ParseNumber.idr:44:23:unmatched case in ParseNumber.case block in octConverter at ParseNumber.idr:44:23 ***");})}function ca(a){if(""===a)return hb(null,null,Ga(null,null,Bb(),Ob()),rb());var b=
""===a?n.throw(Error("Prelude.Strings: attempt to take the tail of an empty string")):a.slice(1);return v(null,nf(null,D(wd(a))),ca(b))}function Te(a){for(;;)if(1===a.type){if(0===a.$2.type)return new p(a.$1);var b=a.$1;if(10===b.type){if(b.$1)return new p(new z(!0));a=a.$2}else return new p(a.$1)}else return new p(new z(!1))}function jd(){return hc(oa(Qa(),D(X())),Oa(Qa(),D(X()),new n.jsbn.BigInteger("10")),Pa(oa(Qa(),D(X()))))}function hc(a,b,c){return B(null,null,Ga(null,null,kh(),v(null,c,v(null,
b,a))),sh(c,b,a))}function Za(){return v(null,B(null,null,D(Zb()),vi()),v(null,v(null,B(null,null,D(Ih()),Kh()),B(null,null,Yb("#|"),zd())),v(null,v(null,v(null,jd(),B(null,null,D(Zb()),Mh())),v(null,v(null,Pa(oa(Qa(),D(X()))),B(null,null,D(Zb()),Qh())),v(null,v(null,Oa(Qa(),D(X()),new n.jsbn.BigInteger("10")),B(null,null,D(Zb()),Eh())),v(null,oa(Qa(),D(X())),B(null,null,D(Zb()),Gh()))))),v(null,B(null,null,Yb("#\\"),jh()),v(null,B(null,null,v(null,D(Jc()),ca("!#$%&|*+-/:<=>?@^_~")),eh()),v(null,
B(null,null,D(Dd()),fi()),v(null,B(null,null,D(Nh()),Ph()),Ed(null,v(null,B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),si()),v(null,B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),Dh()),B(null,null,Fd(),Lh())))))))))))}function Oa(a,b,c){return v(null,hb(null,null,Ga(null,null,Bb(),D(Ad())),Yc(a,b,c,Fh())),v(null,hb(null,null,Ga(null,null,Bb(),D(Bd())),Yc(a,b,c,Z())),Yc(a,b,c,Z())))}function oa(a,b){return v(null,hb(null,null,Ga(null,null,Bb(),D(Ad())),Zc(a,b,Hh())),v(null,hb(null,
null,Ga(null,null,Bb(),D(Bd())),Zc(a,b,Z())),Zc(a,b,Z())))}function Pa(a){return B(null,null,Ga(null,null,Rh(),a),Zh(a))}function Fd(){return B(null,null,Ya(null,B(null,null,V(null,D(h())),qa())),ai())}function Sc(a,b,c,d){if(d.equals(new n.jsbn.BigInteger("0")))return b.$3(new n.jsbn.BigInteger("1"));a=d.subtract(new n.jsbn.BigInteger("1"));return b.$2(c)(Sc(null,b,c,a))}function va(a,b,c,d){a=b(d);b=0===c.type?new n.jsbn.BigInteger("0"):new n.jsbn.BigInteger("4");return(0<Sa(b,new n.jsbn.BigInteger("5"))||
(0===c.type?new n.jsbn.BigInteger("0"):new n.jsbn.BigInteger("4")).equals(new n.jsbn.BigInteger("5")))&&(1===wa(0===(""==a?1:0)?!0:!1,!0).type?0:"-"===a[0])?"("+(a+")"):a}function rc(a,b,c,d){a=a(b)(c);return 1===a.type?new p(new Da(a.$1)):new f(new r("Unexpected error in "+d))}function ib(a){return 0===(a.$7.equals(new n.jsbn.BigInteger("0"))?1:0)?new xa(a.$6.intValue()/a.$7.intValue()):ta}function de(a,b,c){if(b.equals(new n.jsbn.BigInteger("0")))return C;a=b.subtract(new n.jsbn.BigInteger("1"));
return new q(c,de(null,a,c))}function uc(a){var b=0<Ta(a,0)?a-Math.floor(a):-(a-Math.ceil(a));a=0===((0<Ta(a,0)?new n.jsbn.BigInteger("1"):0>Ta(a,0)?new n.jsbn.BigInteger("-1"):new n.jsbn.BigInteger("0")).equals(new n.jsbn.BigInteger("1"))?1:0)?0>Ta(b,.5)||.5===b?Math.ceil(a):Math.floor(a):0>Ta(b,.5)||.5===b?Math.floor(a):Math.ceil(a);return new n.jsbn.BigInteger(Math.trunc(a)+"")}function Nj(a,b){var c=(new Sd(Hd(),Jd(),new Td(Kd(),Ld(),Md(),Nd(),Od(),Pd()))).$3.$2(ia(null,null,wi(),Y(null,new q(new E("vector?",
xe()),new q(new E("vector-length",pf()),new q(new E("vector-ref",qf()),C))),Y(null,Y(null,new q(new E("pair?",e()),new q(new E("car",Ba()),new q(new E("cdr",Ma()),new q(new E("cons",ba()),new q(new E("empty?",Lb()),new q(new E("null?",Lb()),new q(new E("list",yg()),new q(new E("list?",d()),new q(new E("length",ze()),new q(new E("append",ye()),new q(new E("reverse",Ce()),new q(new E("member",Ae()),C)))))))))))),ia(null,null,sf(),Y(null,vc(null,null,null,new q("a",new q("d",C)),new Nb(Pc(),Qc(),Rc()),
2),Y(null,vc(null,null,null,new q("a",new q("d",C)),new Nb(Pc(),Qc(),Rc()),3),vc(null,null,null,new q("a",new q("d",C)),new Nb(Pc(),Qc(),Rc()),4))))),Y(null,new q(new E("+",Fg()),new q(new E("-",Ne()),new q(new E("*",Hg()),new q(new E("/",Jg()),new q(new E("modulo",He()),new q(new E("number?",Lg()),new q(new E("complex?",Mg()),new q(new E("real?",Ng()),new q(new E("rational?",Og()),new q(new E("integer?",Cc()),new q(new E("=",Pg()),new q(new E("/=",Rg()),new q(new E(">",Tg()),new q(new E("<",Vg()),
new q(new E(">=",Xg()),new q(new E("<=",Zg()),new q(new E("quotient",Je()),new q(new E("remainder",Le()),new q(new E("sin",kd(ah(),bh())),new q(new E("cos",kd(Dg(),Eg())),new q(new E("number->string",Oe()),C))))))))))))))))))))),Y(null,new q(new E("string=?",fa(null,Rb(),Ac())),new q(new E("string<?",fa(null,Rb(),Xi())),new q(new E("string>?",fa(null,Rb(),Yi())),new q(new E("string<=?",fa(null,Rb(),Bc())),new q(new E("string>=?",fa(null,Rb(),Zi())),new q(new E("string?",ra()),new q(new E("string->symbol",
jf()),new q(new E("string-ref",gf()),new q(new E("make-string",Ee()),new q(new E("string-length",ff()),new q(new E("string-append",df()),new q(new E("substring",kf()),C)))))))))))),Y(null,new q(new E("boolean?",Wa()),new q(new E("and",Ea()),new q(new E("or",Se()),new q(new E("not",Ge()),C)))),Y(null,new q(new E("symbol?",we()),new q(new E("symbol->string",mf()),C)),Y(null,new q(new E("procedure?",g()),C),new q(new E("char?",gc()),new q(new E("eq?",lb()),new q(new E("eqv?",lb()),new q(new E("equal?",
lb()),new q(new E("void",yi()),C))))))))))))));return mb(null,null,null,null,Ud(null,null,null,null,null,ee,new w(c,Li(a)),Ni()),Oi(),Gd())(b)}function Ud(a,b,c,d,e,f,g,h){for(;;)if(1===g.type)a=Qi(g.$2,h),g=g.$1,h=a;else if(10===g.type)a=Ri(h,f,g.$2),f=ee,g=g.$1,h=a;else return 2===g.type?g.$1(null)(null)(g.$2)(Si(h,f)):h(g.$1)(f)}function D(a){return B(null,null,Ob(),Ui(a))}function Pi(a){if(2===a.type)return a.$1+(": "+sa(a.$2));if(6===a.type)return a.$1;if(5===a.type)return a=a.$1,"Parse error (line "+
(va(null,Aa(),da,a.$1)+(", column"+(va(null,Aa(),da,a.$2)+")")));if(0===a.type){var b=a.$1;b=0===b.type?"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: at least "+(va(null,Aa(),da,b.$1)+("\ngiven: "+va(null,H(),da,a.$2))):"arity mismatch;\nthe expected number of arguments does not match the given number\nexpected: "+((0===(b.$1===b.$2?1:0)?"between "+(va(null,Aa(),da,b.$1)+(" and "+va(null,Aa(),da,b.$2))):va(null,Aa(),da,b.$1))+("\ngiven: "+va(null,H(),
da,a.$2)));a=0===a.$3.type?"":"\narguments:\n"+wc(ia(null,null,I(),a.$3));return b+a}return"Invalid type: expected "+(a.$1+(", found "+sa(a.$2)))}function sa(a){if(1===a.type)return a.$1;if(10===a.type){var b=a.$1;return b?b?"#t":"":"#f"}if(6===a.type){b=new N(Vi(),Wi());a=a.$1;if(4===da.type)var c=$c(da.$1,new n.jsbn.BigInteger("6"));else c=0===da.type?new n.jsbn.BigInteger("0"):new n.jsbn.BigInteger("4"),c=Sa(c,new n.jsbn.BigInteger("4"));0<c||(4===da.type?Ra(da.$1,new n.jsbn.BigInteger("6")):(0===
da.type?new n.jsbn.BigInteger("0"):new n.jsbn.BigInteger("4")).equals(new n.jsbn.BigInteger("4")))?(c=b.$2(new qc(new n.jsbn.BigInteger("6")))(a.$1),b=b.$2(new qc(new n.jsbn.BigInteger("6")))(a.$2),b="("+(c+(" :+ "+b)+")")):(c=b.$2(new qc(new n.jsbn.BigInteger("6")))(a.$1),b=b.$2(new qc(new n.jsbn.BigInteger("6")))(a.$2),b=c+(" :+ "+b));return b}return 3===a.type?"("+(wc(ia(null,null,I(),a.$1))+(" . "+(sa(n.force(a.$2))+")"))):5===a.type?va(null,K(),da,a.$1):12===a.type?"#<procedure:"+(a.$1+">"):
4===a.type?va(null,H(),da,a.$1):2===a.type?"("+(wc(ia(null,null,I(),a.$1))+")"):7===a.type?(b=a.$1,va(null,H(),da,b.$6)+("/"+va(null,H(),da,b.$7))):8===a.type?'"'+(a.$1+'"'):0===a.type?"#("+(wc(ia(null,null,I(),a.$2))+")"):""}function Ya(a,b){return B(null,null,v(null,V(null,b),Ja()),qa())}function ef(a){for(;;)if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type)if(a=c.$1,8===a.type)a=new q(new gb(b.$1+a.$1),c.$2);else return new f(new r("Invalid arguments to `string-append`"));else return 0===
c.type?new p(a.$1):new f(new r("Invalid arguments to `string-append`"))}else return new f(new r("Invalid arguments to `string-append`"))}else return 0===a.type?new p(new gb("")):new f(new r("Invalid arguments to `string-append`"))}function Yb(a){return""===a?$i():B(null,null,D(wd(a)),aj(a))}function hf(a){if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type){var d=c.$1;if(4===d.type){if(0===c.$2.type){a=d.$1;if(1===wa(0===(""==b.$1?1:0)?!0:!1,!0).type)a=ta;else if(a.equals(new n.jsbn.BigInteger("0")))a=
new xa(b.$1[0]);else if(a=a.subtract(new n.jsbn.BigInteger("1")),c=0===(""==b.$1.slice(1)?1:0)?!0:!1,1===wa(c,!0).type)a=ta;else if(a.equals(new n.jsbn.BigInteger("0")))a=new xa(b.$1.slice(1)[0]);else a:for(a=a.subtract(new n.jsbn.BigInteger("1")),c=0===(""==b.$1.slice(1).slice(1)?1:0)?!0:!1,1===wa(c,!0).type?b=C:(c=0===(""==b.$1.slice(1).slice(1).slice(1)?1:0)?!0:!1,c=1===wa(c,!0).type?fe:new be(b.$1.slice(1).slice(1).slice(1)[0],b.$1.slice(1).slice(1).slice(1).slice(1)),b=new q(b.$1.slice(1).slice(1)[0],
ge(null,c)));;)if(1===b.type)if(a.equals(new n.jsbn.BigInteger("0"))){a=new xa(b.$1);break a}else a=a.subtract(new n.jsbn.BigInteger("1")),b=b.$2;else{a=ta;break a}return 1===a.type?new p(new Ca(a.$1)):new f(new r("string-ref: index is out of range"))}b=a.$2;if(4===b.$1.type){if(0===b.$2.type)return new f(new t("string",a.$1));b=a.$2;return 0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),x(null,a),a))}b=a.$2;return 0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),
x(null,a),a))}b=a.$2;if(4===b.$1.type){if(0===b.$2.type)return new f(new t("string",a.$1));b=a.$2;return 0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),x(null,a),a))}b=a.$2;return 0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),x(null,a),a))}return new f(new y(new A(2,2),x(null,a),a))}b=a.$2;if(1===b.type)return 4===b.$1.type&&0===b.$2.type?new f(new t("string",a.$1)):8===a.$1.type?(b=a.$2,0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),x(null,
a),a))):new f(new y(new A(2,2),x(null,a),a));if(8===a.$1.type)return b=a.$2,1===b.type?0===b.$2.type?new f(new t("integer",b.$1)):new f(new y(new A(2,2),x(null,a),a)):new f(new y(new A(2,2),x(null,a),a))}return new f(new y(new A(2,2),x(null,a),a))}function lf(a){if(1===a.type){var b=a.$1;if(8===b.type){var c=a.$2;if(1===c.type&&(a=c.$1,4===a.type)){var d=c.$2;if(1===d.type&&(c=d.$1,4===c.type&&0===d.$2.type)){d=a.$1;var e=null;e=0<$c(d,new n.jsbn.BigInteger("0"))?!0:Ra(d,new n.jsbn.BigInteger("0"));
var g=null;return(g=e?0>$c(c.$1,new n.jsbn.BigInteger(""+b.$1.length))?!0:Ra(c.$1,new n.jsbn.BigInteger(""+b.$1.length)):!1)?new p(new gb(n.prim_strSubstr(d.intValue()|0,c.$1.subtract(a.$1).intValue()|0,b.$1))):new f(new r("substring: ending index is out of range"))}}}}return new n.Lazy(function(){throw Error("*** Strings.idr:58:1-64:73:unmatched case in Strings.substring ***");})}function he(a,b,c){return 0===c.type?C:Tc(null,null,null,null,null,bj(),c.$2)}function Kb(a,b,c,d,e,g,h){if(1===h.type){if(c.$3(e)(h.$2)){e=
Kb(null,null,c,null,e,g,h.$1);if(0===e.type)return new f(new Ua(e.$1,h.$2,h.$3));e=e.$1;g=e.$2;return new f(new cc(e.$1,g.$1,g.$2,h.$2,h.$3))}e=Kb(null,null,c,null,e,g,h.$3);if(0===e.type)return new f(new Ua(h.$1,h.$2,e.$1));e=e.$1;g=e.$2;return new f(new cc(h.$1,h.$2,e.$1,g.$1,g.$2))}if(2===h.type){if(c.$3(e)(h.$2)){e=Kb(null,null,c,null,e,g,h.$1);if(0===e.type)return new f(new cc(e.$1,h.$2,h.$3,h.$4,h.$5));e=e.$1;g=e.$2;return new p(new E(new Ua(e.$1,g.$1,g.$2),new E(h.$2,new Ua(h.$3,h.$4,h.$5))))}if(c.$3(e)(h.$4)){e=
Kb(null,null,c,null,e,g,h.$3);if(0===e.type)return new f(new cc(h.$1,h.$2,e.$1,h.$4,h.$5));e=e.$1;g=e.$2;return new p(new E(new Ua(h.$1,h.$2,e.$1),new E(g.$1,new Ua(g.$2,h.$4,h.$5))))}e=Kb(null,null,c,null,e,g,h.$5);if(0===e.type)return new f(new cc(h.$1,h.$2,h.$3,h.$4,e.$1));e=e.$1;g=e.$2;return new p(new E(new Ua(h.$1,h.$2,h.$3),new E(h.$4,new Ua(e.$1,g.$1,g.$2))))}a=c.$2(e)(h.$1);return 0===a?new f(new Jb(e,g)):0<a?new p(new E(new Jb(h.$1,h.$2),new E(h.$1,new Jb(e,g)))):new p(new E(new Jb(e,g),
new E(e,new Jb(h.$1,h.$2))))}function Ib(a,b,c,d,e,f){for(;;)if(1===f.type)f=c.$3(e)(f.$2)?f.$1:f.$3;else if(2===f.type)f=c.$3(e)(f.$2)?f.$1:c.$3(e)(f.$4)?f.$3:f.$5;else return c.$1(e)(f.$1)?new xa(f.$2):ta}function of(a,b,c){if(Ra(x(null,c),new n.jsbn.BigInteger("1"))){if(1===c.type){var d=c.$1;if(6===d.type)return 0===c.$2.type?(a=d.$1.$1,d=d.$1.$2,new p(new ja(b(a)(d)))):new f(new r("Numerical input expected"));if(5===d.type)return 0===c.$2.type?new p(new ea(a(d.$1))):new f(new r("Numerical input expected"));
if(4===d.type)return 0===c.$2.type?new p(new ea(a(d.$1.intValue()))):new f(new r("Numerical input expected"));if(7===d.type&&0===c.$2.type)return b=ib(d.$1),1===b.type?new p(new ea(a(b.$1))):new f(new r("Unexpected error"))}return new f(new r("Numerical input expected"))}return new f(new y(new A(1,1),x(null,c),c))}function Rd(a){return 1===a.type?Y(null,a.$1,new q("\n",Rd(a.$2))):a}function Nc(a){return 1===wa(0===(""==a?1:0)?!0:!1,!0).type?C:new q(a[0],Nc(a.slice(1)))}function wc(a){a=0===ia(null,
null,Oc(),a).type?ia(null,null,Oc(),a):ce(null,cj(),ia(null,null,Oc(),a));return Ia(null,null,T(),"",a)}function rf(a){if(1===a.type){var b=a.$1;if(0===b.type){var c=a.$2;if(1===c.type){var d=c.$1;if(4===d.type&&0===c.$2.type){a=yc(null,d.$1,b.$2);if(1===a.type)return new p(a.$1);d=d.$1;b=b.$2;b=new r("vector-ref: index is out of range; index: "+(va(null,H(),da,d)+("; valid range: "+va(null,H(),da,x(null,b)))));return new f(b)}return new f(new y(new A(2,2),x(null,a),a))}return 0===c.type?new f(new t("Vector",
a.$1)):new f(new y(new A(2,2),x(null,a),a))}return 0===a.$2.type?new f(new t("Vector",a.$1)):new f(new y(new A(2,2),x(null,a),a))}return new f(new y(new A(2,2),x(null,a),a))}function jc(a,b,c,d,e,f){return 1===f.type?1===e.type?new q(d(e.$1)(f.$1),jc(null,null,null,d,e.$2,f.$2)):e:1===e.type?C:e}function xf(a){return 1===a.type?new J(Mj(null,new q(a.$1,a.$2),null)):new n.Lazy(function(){throw Error("*** Eval.idr:88:28-45:unmatched case in Eval.case block in apply' at Eval.idr:88:28-45 ***");})}function xc(){throw Error("*** Eval.idr:57:1-33:unmatched case in Eval.extractVar ***");
}function Qf(a,b){var c=null;c=1===a.type?a.$1:new n.Lazy(function(){return xc()});return new E(c,b)}function Uf(a,b,c,d,e){return 2===e.type?new w(Ub(null,a,b,e.$1),Sf(a,b,c,d)):new n.Lazy(function(){throw Error("*** Eval.idr:269:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:267:31-44 at Eval.idr:269:30-43 ***");})}function Xf(a,b,c,d,e){return 2===e.type?new w(ic(null,a,e.$1),Vf(a,b,c,e.$1,d)):new n.Lazy(function(){throw Error("*** Eval.idr:267:31-44:unmatched case in Eval.case block in eval at Eval.idr:267:31-44 ***");
})}function $f(a,b,c,d,e){if(2===e.type){var f=null;f=a.$3.$6(b)(C);return new w(f,Yf(a,c,e.$1,d))}return new n.Lazy(function(){throw Error("*** Eval.idr:276:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:274:31-44 at Eval.idr:276:30-43 ***");})}function cg(a,b,c,d,e){return 2===e.type?new w(ic(null,a,e.$1),ag(a,b,c,e.$1,d)):new n.Lazy(function(){throw Error("*** Eval.idr:274:31-44:unmatched case in Eval.case block in eval at Eval.idr:274:31-44 ***");})}function eg(a,b){var c=
null;c=1===a.type?a.$1:new n.Lazy(function(){return xc()});return new E(c,b)}function jg(a,b,c,d,e){if(2===e.type){var f=null;f=a.$3.$6(b)(C);return new w(f,hg(a,c,e.$1,d))}return new n.Lazy(function(){throw Error("*** Eval.idr:291:30-43:unmatched case in Eval.case block in case block in eval at Eval.idr:289:31-44 at Eval.idr:291:30-43 ***");})}function mg(a,b,c,d,e){return 2===e.type?new w(ic(null,a,e.$1),kg(a,b,c,e.$1,d)):new n.Lazy(function(){throw Error("*** Eval.idr:289:31-44:unmatched case in Eval.case block in eval at Eval.idr:289:31-44 ***");
})}function vg(a,b){return 2===b.type?new J(new M(new q(a,b.$1))):new n.Lazy(function(){throw Error("*** Eval.idr:35:22-32:unmatched case in Eval.case block in getHeads at Eval.idr:35:22-32 ***");})}function xg(a,b){return 2===b.type?new J(new M(new q(a,b.$1))):new n.Lazy(function(){throw Error("*** Eval.idr:42:22-32:unmatched case in Eval.case block in getTails at Eval.idr:42:22-32 ***");})}function tc(){throw Error("*** Numbers.idr:231:24-37:unmatched case in Numbers.case block in numBoolBinop at Numbers.idr:231:24-37 ***");
}function hh(a,b,c){var d=null;Ra(new n.jsbn.BigInteger(""+a.length),new n.jsbn.BigInteger("1"))?(d=null,d=""===a?n.throw(Error("Prelude.Strings: attempt to take the head of an empty string")):a[0],d=new Ca(d)):d="altmode"===a?new Ca(La(27)):"backnext"===a?new Ca(La(31)):"backspace"===a?new Ca(La(8)):"call"===a?new Ca(La(26)):"linefeed"===a?new Ca(La(10)):"newline"===a?new Ca("\n"):"page"===a?new Ca(La(12)):"return"===a?new Ca(La(13)):"rubout"===a?new Ca(La(127)):"space"===a?new Ca(" "):"tab"===a?
new Ca(La(9)):new n.Lazy(function(){throw Error("*** Parse.idr:73:14:unmatched case in Parse.case block in parseCharacter at Parse.idr:73:14 ***");});return new S(d,b,c)}function ie(){throw Error("*** ParseNumber.idr:256:9-39:unmatched case in ParseNumber.parseComplexHelper, toDouble ***");}function lh(a){return 5===a.type?new xa(a.$1):4===a.type?new xa(a.$1.intValue()):7===a.type?ib(a.$1):new n.Lazy(function(){return ie()})}function nh(a){return 5===a.type?new xa(a.$1):4===a.type?new xa(a.$1.intValue()):
7===a.type?ib(a.$1):new n.Lazy(function(){return ie()})}function uh(a,b,c,d,e){return new S(new cb(Y(null,a,b),new n.Lazy(function(){return n.force(c)})),d,e)}function xh(a,b,c,d){return new S(new cb(a,new n.Lazy(function(){return b})),c,d)}function je(){throw Error("*** ParseNumber.idr:212:9-33:unmatched case in ParseNumber.parseRationalHelper, toInt ***");}function Sh(a){return 4===a.type?a.$1:new n.Lazy(function(){return je()})}function Vh(a){return 4===a.type?a.$1:new n.Lazy(function(){return je()})}
function hb(a,b,c,d){return B(null,null,c,ej(d))}function wa(a,b){return b?a?ke:le:a?le:ke}function ac(a,b,c,d){a=c.$1;var e=d.$1;return b(a)(e)?(c=c.$2,d=d.$2,b(c)(d)):!1}function Xc(a,b){if(1===b.type)return 1===a.type?a.$1==b.$1:!1;if(10===b.type)return 10===a.type?(a=a.$1,b=b.$1?a:!a):b=!1,b;if(9===b.type)return 9===a.type?a.$1===b.$1:!1;if(6===b.type)return 6===a.type?ac(null,Tb(),a.$1,b.$1):!1;if(3===b.type)return 3===a.type?Xc(n.force(a.$2),n.force(b.$2))?!1:Wc(a.$1,b.$1):!1;if(5===b.type)return 5===
a.type?a.$1===b.$1:!1;if(4===b.type)return 4===a.type?a.$1.equals(b.$1):!1;if(2===b.type)return 2===a.type?Wc(a.$1,b.$1):!1;if(7===b.type){if(7===a.type){b=b.$1;var c=a.$1;a=b.$1.$1.$2(c.$6)(b.$7);c=b.$1.$1.$2(b.$6)(c.$7);return b.$2(a)(c)}return!1}return 8===b.type?8===a.type?a.$1==b.$1:!1:0===b.type?0===a.type?0===(a.$1===b.$1?1:0)?Wc(a.$2,b.$2):!1:!1:13===b.type?13===a.type:!1}function Ra(a,b){for(;;){if(b.equals(new n.jsbn.BigInteger("0")))return a.equals(new n.jsbn.BigInteger("0"))?!0:!1;b=b.subtract(new n.jsbn.BigInteger("1"));
if(a.equals(new n.jsbn.BigInteger("0")))return!1;a=a.subtract(new n.jsbn.BigInteger("1"))}}function gd(a,b,c,d,e){for(;;)if(1===e.type)d=a=c(d)(e.$1),e=e.$2;else return d}function Ia(a,b,c,d,e){return 1===e.type?c(e.$1)(Ia(null,null,c,d,e.$2)):d}function ia(a,b,c,d){return 1===d.type?new q(c(d.$1),ia(null,null,c,d.$2)):d}function nb(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function Ta(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:-1:0}function Vc(a,b){return 0===(a===b?1:0)?0===(a<b?1:0)?1:
-1:0}function Sa(a,b){return 0===(a.equals(b)?1:0)?0===(0>a.compareTo(b)?1:0)?1:-1:0}function $c(a,b){for(;;){if(b.equals(new n.jsbn.BigInteger("0"))){if(a.equals(new n.jsbn.BigInteger("0")))return 0;a.subtract(new n.jsbn.BigInteger("1"));return 1}b=b.subtract(new n.jsbn.BigInteger("1"));if(a.equals(new n.jsbn.BigInteger("0")))return-1;a=a.subtract(new n.jsbn.BigInteger("1"))}}function Wb(a,b){return 0===(a==b?1:0)?0===(a<b?1:0)?1:-1:0}function zc(a,b,c,d,e,f){return 1===f.type?(a=d.$2(null)(Vd()),
a=d.$3(null)(null)(a)(e(f.$1)),d.$3(null)(null)(a)(zc(null,null,null,d,e,f.$2))):d.$2(null)(C)}function qj(a,b,c){var d=null;d='"'===a?a:"\\"===a?a:"n"===a?"\n":"r"===a?"\r":"t"===a?"\t":new n.Lazy(function(){throw Error("*** Parse.idr:41:28:unmatched case in Parse.case block in Parse.parseString, escapedChar at Parse.idr:41:28 ***");});return new S(d,b,c)}function Cj(a,b,c,d,e,f){var g=null;g=a.$3;var l=null;l=1===c.type?c.$1:new n.Lazy(function(){return xc()});g=g.$5(b)(l)(f);return new w(g,Aj(a,
b,d,e))}function lc(a,b,c,d,e){for(;;)if(1===e.type)d=c=d.add(Sc(null,new aa(ka(),la(),Z()),b,x(null,e.$2)).multiply(a(e.$1))),e=e.$2;else return d}function Gj(a){if(2===a.type){var b=a.$1;if(1===b.type)if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type)return b=c.$1,a=a.$1,a=new ua(a.$1+b.$1,a.$2+b.$2),new p(new ja(a))}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new p(new ea(a.$1+c.$1)):new f(new r("Unexpected error in +")):new f(new r("Unexpected error in +"))}else if(4===
a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new p(new na(a.$1.add(c.$1))):new f(new r("Unexpected error in +")):new f(new r("Unexpected error in +"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,7===c.type?0===b.$2.type?rc(Ye(null),a.$1,c.$1,"+"):new f(new r("Unexpected error in +")):new f(new r("Unexpected error in +"))}return new f(new r("Unexpected error in +"))}function Ie(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=
c.$1,6===b.type&&0===c.$2.type)){a=new ja(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);a=a.$1;if(4===a.type){c=pa(new ja(b.$1));if(0===c.type)return pa(new ja(b.$1));b=c.$1;return 4===b.type?new p(new ja(new ua(a.$1.subtract((new n.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)).intValue(),0))):new n.Lazy(function(){throw Error("*** Numbers.idr:174:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 at Numbers.idr:174:25-34 ***");
})}return new n.Lazy(function(){throw Error("*** Numbers.idr:173:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:173:25-34 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new ea(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);a=a.$1;if(4===a.type){c=pa(new ea(b.$1));if(0===c.type)return pa(new ea(b.$1));b=c.$1;return 4===b.type?new p(new ea(a.$1.subtract((new n.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+
"")).multiply(b.$1)).intValue())):new n.Lazy(function(){throw Error("*** Numbers.idr:170:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 at Numbers.idr:170:25-34 ***");})}return new n.Lazy(function(){throw Error("*** Numbers.idr:169:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:169:25-34 ***");})}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new p(new na(a.$1.subtract((new n.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/
c.$1.intValue()))+"")).multiply(c.$1)))):new f(new r("Unexpected error in modulo")):new f(new r("Unexpected error in modulo"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new Da(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);a=a.$1;if(4===a.type){c=pa(new Da(b.$1));if(0===c.type)return pa(new Da(b.$1));b=c.$1;return 4===b.type?new p(new Da(new bc(new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),
la(),Z()),zb()),a.$1.subtract((new n.jsbn.BigInteger(Math.trunc(Math.floor(a.$1.intValue()/b.$1.intValue()))+"")).multiply(b.$1)),new n.jsbn.BigInteger("1")))):new n.Lazy(function(){throw Error("*** Numbers.idr:166:25-34:unmatched case in Numbers.case block in case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 at Numbers.idr:166:25-34 ***");})}return new n.Lazy(function(){throw Error("*** Numbers.idr:165:25-34:unmatched case in Numbers.case block in Numbers.numMod, doMod at Numbers.idr:165:25-34 ***");
})}return new f(new r("Unexpected error in modulo"))}function Me(a,b,c){if(2===c.type&&(b=c.$1,1===b.type))if(a=b.$1,6===a.type){if(c=b.$2,1===c.type&&(b=c.$1,6===b.type&&0===c.$2.type)){a=new ja(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);a=a.$1;if(4===a.type){c=pa(new ja(b.$1));if(0===c.type)return pa(new ja(b.$1));b=c.$1;return 4===b.type?new p(new ja(new ua(Xb(a.$1,b.$1).intValue(),0))):new n.Lazy(function(){throw Error("*** Numbers.idr:199:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 at Numbers.idr:199:31-40 ***");
})}return new n.Lazy(function(){throw Error("*** Numbers.idr:198:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:198:31-40 ***");})}}else if(5===a.type){if(c=b.$2,1===c.type&&(b=c.$1,5===b.type&&0===c.$2.type)){a=new ea(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);a=a.$1;if(4===a.type){c=pa(new ea(b.$1));if(0===c.type)return pa(new ea(b.$1));b=c.$1;return 4===b.type?new p(new ea(Xb(a.$1,b.$1).intValue())):new n.Lazy(function(){throw Error("*** Numbers.idr:194:31-40:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 at Numbers.idr:194:31-40 ***");
})}return new n.Lazy(function(){throw Error("*** Numbers.idr:193:31-40:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:193:31-40 ***");})}}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new p(new na(Xb(a.$1,c.$1))):new f(new r("Unexpected error in remainder")):new f(new r("Unexpected error in remainder"))}else if(7===a.type&&(c=b.$2,1===c.type&&(b=c.$1,7===b.type&&0===c.$2.type))){a=new Da(a.$1);a=pa(a);if(0===a.type)return new f(a.$1);
a=a.$1;if(4===a.type){c=pa(new Da(b.$1));if(0===c.type)return pa(new Da(b.$1));b=c.$1;return 4===b.type?new p(new Da(new bc(new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),la(),Z()),zb()),Xb(a.$1,b.$1),new n.jsbn.BigInteger("1")))):new n.Lazy(function(){throw Error("*** Numbers.idr:189:25-34:unmatched case in Numbers.case block in case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 at Numbers.idr:189:25-34 ***");})}return new n.Lazy(function(){throw Error("*** Numbers.idr:188:25-34:unmatched case in Numbers.case block in Numbers.numRem, doRem at Numbers.idr:188:25-34 ***");
})}return new f(new r("Unexpected error in remainder"))}function Yc(a,b,c,d){return B(null,null,V(null,b),nj(b,d,c,a))}function Zc(a,b,c){return Ga(null,null,oj(c,a),V(null,b))}function vc(a,b,c,d,e,f){if(0>Vc(f,0)||0===f)return e.$2(null)(C);a=e.$1(null)(null)(Vd())(d);return e.$3(null)(null)(a)(vc(null,null,null,d,e,f-1))}function Zd(a,b,c,d,e,f,g){if(1===f.type)return a=e.$2(null)(f.$1)(g),a=ad(null,null,null,d,e,null,he(null,null,a),g),d=Zd(null,null,null,d,e,f.$2,g),"Frame<"+(a+(","+(d+">")));
f=e.$2(null)(f.$1)(g);return"Global<"+(ad(null,null,null,d,e,null,he(null,null,f),g)+">")}function Lc(a,b,c,d){return v(null,B(null,null,c,qa()),B(null,null,d,sj(c,d)))}function Tc(a,b,c,d,e,f,g){for(;;)if(1===g.type)f=Xd(f,g.$3),g=g.$1;else if(2===g.type)f=tj(f,g.$5,g.$3),g=g.$1;else return f(new E(g.$1,g.$2))}function Qb(a,b,c,d,e){for(;;)if(1===d.type){a=Pb(new q(e,new q(d.$1,C)));if(0===a.type)return new f(a.$1);a=b(a.$1);if(0===a.type)return new f(a.$1);d=d.$2;e=a.$1}else return new p(e)}function me(a,
b,c,d,e){for(;;)if(1===e.type){if(0===e.$2.type)return c=c.$1(e.$1),d+c;a=c.$1(e.$1);d+=a+", ";e=e.$2}else return d}function ad(a,b,c,d,e,f,g,h){return 1===g.type?(a=g.$1,b=e.$2(null)(a.$2)(h),e=ad(null,null,null,d,e,null,g.$2,h),d=d.$1(b),a.$1+(": "+d)+(","+e)):""}function Dc(a,b,c){for(a={};;a={$jscomp$loop$prop$$cg$3$4:a.$jscomp$loop$prop$$cg$3$4})if(1===c.type){a.$jscomp$loop$prop$$cg$3$4=c.$1;if(3===a.$jscomp$loop$prop$$cg$3$4.type)return 0===c.$2.type?new p(new cb(Y(null,b,a.$jscomp$loop$prop$$cg$3$4.$1),
new n.Lazy(function(a){return function(){return n.force(a.$jscomp$loop$prop$$cg$3$4.$2)}}(a)))):new f(new t("list",c.$1));if(0===c.$2.type)return 0===b.type?new p(c.$1):new p(new cb(b,new n.Lazy(function(){return c.$1})));var d=c.$1;if(2===d.type)b=Y(null,b,d.$1),c=c.$2;else return new f(new t("list",c.$1))}else return 0===c.type?new p(new M(b)):new f(new r("Unknown error in append"))}function Hj(a,b,c){if(2===c.type&&(a=c.$1,1===a.type))if(b=a.$1,6===b.type){if(a=a.$2,1===a.type){var d=a.$1;if(6===
d.type&&0===a.$2.type){if(ac(null,Tb(),d.$1,new ua(0,0)))return new f(new r("Zero division error"));c=new $a(new aa(nc(),oc(),pc()),Yd());a=new Kj(new aa(nc(),oc(),pc()),uj());var e=b.$1;b=d.$1;d=a.$1;var g=a.$1.$2(e.$1)(b.$1);var h=a.$1.$2(e.$2)(b.$2);d=d.$1(g)(h);g=a.$1;h=a.$1.$2(b.$1)(b.$1);var n=a.$1.$2(b.$2)(b.$2);g=g.$1(h)(n);d=a.$2(d)(g);g=a.$1.$2(e.$2)(b.$1);e=a.$1.$2(e.$1)(b.$2);c=c.$2(g)(e);e=a.$1;g=a.$1.$2(b.$1)(b.$1);b=a.$1.$2(b.$2)(b.$2);b=e.$1(g)(b);a=a.$2(c)(b);a=new ua(d,a);return new p(new ja(a))}}}else if(5===
b.type){if(a=a.$2,1===a.type)return c=a.$1,5===c.type?0===a.$2.type?0===(0===c.$1?1:0)?new p(new ea(b.$1/c.$1)):new f(new r("Zero division error")):new f(new r("Unexpected error in /")):new f(new r("Unexpected error in /"))}else if(4===b.type){if(a=a.$2,1===a.type&&(c=a.$1,4===c.type&&0===a.$2.type))return a=sb(null,new Cb(new aa(ka(),la(),Z()),ub(),vb()),Fa(),new Db(new aa(ka(),la(),Z()),wb()),new Va(Fa(),xb(),yb()),new $a(new aa(ka(),la(),Z()),zb()),b.$1,c.$1),1===a.type?new p(new Da(a.$1)):new f(new r("Zero division error"))}else if(7===
b.type&&(a=a.$2,1===a.type))return c=a.$1,7===c.type?0===a.$2.type?rc(Ze(null),b.$1,c.$1,"/"):new f(new r("Unexpected error in /")):new f(new r("Unexpected error in /"));return new f(new r("Unexpected error in /"))}function Ij(a,b){if(2===b.type&&(b=b.$1,1===b.type))if(a=b.$1,6===a.type){if(b=b.$2,1===b.type){var c=b.$1;if(6===c.type&&0===b.$2.type){b=new $a(new aa(nc(),oc(),pc()),Yd());a=a.$1;c=c.$1;var d=b.$1.$2(a.$1)(c.$1);var e=b.$1.$2(a.$2)(c.$2);d=b.$2(d)(e);e=b.$1;var g=b.$1.$2(a.$2)(c.$1);
a=b.$1.$2(a.$1)(c.$2);a=e.$1(g)(a);a=new ua(d,a);return new p(new ja(a))}}}else if(5===a.type){if(b=b.$2,1===b.type)return c=b.$1,5===c.type?0===b.$2.type?new p(new ea(a.$1*c.$1)):new f(new r("Unexpected error in *")):new f(new r("Unexpected error in *"))}else if(4===a.type){if(b=b.$2,1===b.type)return c=b.$1,4===c.type?0===b.$2.type?new p(new na(a.$1.multiply(c.$1))):new f(new r("Unexpected error in *")):new f(new r("Unexpected error in *"))}else if(7===a.type&&(b=b.$2,1===b.type))return c=b.$1,
7===c.type?0===b.$2.type?rc($e(null),a.$1,c.$1,"*"):new f(new r("Unexpected error in *")):new f(new r("Unexpected error in *"));return new f(new r("Unexpected error in *"))}function Lj(a,b,c,d){for(;;){if(0===d.type)return 0===c.type?new p(!0):new p(!1);if(0===c.type)return new p(!1);a=ec(new q(c.$1,new q(d.$1,C)));if(0===a.type)return new f(a.$1);a=a.$1;if(10===a.type)if(a=a.$1)if(a)c=c.$2,d=d.$2;else return new p(!1);else return new p(!1);else return new p(!1)}}function Uc(a,b,c,d,e){return 1===
e.type?(a=e.$1,2===a.type&&(a=a.$1,1===a.type)?(c=a.$1,1===c.type?"else"===c.$1?0===e.$2.type?Xa(null,d,b,a.$2):d.$1(null)(null)(new r("cond: bad syntax (`else` clause must be last)")):new w(ha(null,d,b,a.$1),vj(b,d,e.$2,a.$2)):new w(ha(null,d,b,a.$1),wj(b,d,e.$2,a.$2))):d.$1(null)(null)(new r("["+(me(null,null,new N(I(),O()),"",e)+"]")))):0===e.type?new J(Ka):d.$1(null)(null)(new r("["+(me(null,null,new N(I(),O()),"",e)+"]")))}function pd(a,b,c,d,e,f,g){return 1===g.type?(a=g.$1,2===a.type?(a=a.$1,
1===a.type?new w(new Jj($b(null,null,null,null,e,new q(f,new q(a.$1,C))),Oj),xj(b,e,f,g.$2,a.$2)):0===a.type?0===g.$2.type?new J(Ka):e.$1(null)(null)(new r("case: bad syntax")):e.$1(null)(null)(new r("case: bad syntax"))):e.$1(null)(null)(new r("case: bad syntax"))):0===g.type?new J(Ka):e.$1(null)(null)(new r("case: bad syntax"))}function $b(a,b,c,d,e,f){if(1===f.type&&(b=f.$2,1===b.type)){a=b.$1;if(1===a.type)return"else"===a.$1?0===b.$2.type?new J(!0):e.$1(null)(null)(new r("case: bad syntax")):
e.$1(null)(null)(new r("case: bad syntax"));if(2===a.type)return a=a.$1,1===a.type?(c=a.$1,1===c.type?"else"===c.$1?0===b.$2.type?e.$1(null)(null)(new r("case: bad syntax (`else` clause must be last)")):e.$1(null)(null)(new r("case: bad syntax")):0===b.$2.type?(b=ec(new q(a.$1,new q(f.$1,C))),b=0===b.type?e.$1(null)(null)(b.$1):new J(b.$1),new w(b,yj(e,f.$1,a.$2))):e.$1(null)(null)(new r("case: bad syntax")):0===b.$2.type?(b=ec(new q(a.$1,new q(f.$1,C))),b=0===b.type?e.$1(null)(null)(b.$1):new J(b.$1),
new w(b,zj(e,f.$1,a.$2))):e.$1(null)(null)(new r("case: bad syntax"))):0===a.type?0===b.$2.type?new J(!1):e.$1(null)(null)(new r("case: bad syntax")):e.$1(null)(null)(new r("case: bad syntax"))}return e.$1(null)(null)(new r("case: bad syntax"))}function qg(a,b,c,d,e,f,g,h){if(1===g.type){var l=g.$1;if(3===l.type)return a=l.$1,1===a.type?e.$3.$4(f)(c)(new cb(new q(h,a.$2),new n.Lazy(function(){return n.force(l.$2)}))):e.$1(null)(null)(new t("list",d));if(2===l.type)return a=l.$1,1===a.type?e.$3.$4(f)(c)(new M(new q(h,
a.$2))):e.$1(null)(null)(new t("list",d))}return e.$1(null)(null)(new t("list",d))}function qd(a,b,c,d,e,f,g,h){return 1===h.type?1===g.type?new w(ha(null,e,f,h.$1),Bj(e,f,g.$1,g.$2,h.$2)):e.$1(null)(null)(new r("let*: bad syntax")):0===h.type?0===g.type?new J(kb):e.$1(null)(null)(new r("let*: bad syntax")):e.$1(null)(null)(new r("let*: bad syntax"))}function sd(a,b,c,d,e,f,g){return 1===g.type?(a=null,a=e.$3,b=g.$1,c=null,c=1===b.type?b.$1:new n.Lazy(function(){return xc()}),a=a.$5(f)(c)(Ka),new w(a,
Dj(e,f,g.$2))):0===g.type?new J(kb):e.$1(null)(null)(new r("let*: bad syntax"))}function rd(a,b,c,d,e,f,g){return 1===g.type?(a=g.$1,a=e.$3.$4(f)(a.$1)(a.$2),new w(a,Ej(e,f,g.$2))):new J(kb)}function ge(a,b){return 1===b.type?(a=1===wa(0===(""==b.$2?1:0)?!0:!1,!0).type?fe:new be(b.$2[0],b.$2.slice(1)),new q(b.$1,ge(null,a))):C}var n={throw:function(a){throw a;},Lazy:function(a){this.js_idris_lazy_calc=a;this.js_idris_lazy_val=void 0},force:function(a){if(void 0===a||void 0===a.js_idris_lazy_calc)return a;
void 0===a.js_idris_lazy_val&&(a.js_idris_lazy_val=a.js_idris_lazy_calc());return a.js_idris_lazy_val},prim_strSubstr:function(a,b,c){return c.substr(Math.max(0,a),Math.max(0,b))}};n.os=k("os");n.fs=k("fs");n.prim_systemInfo=function(a){switch(a){case 0:return"node";case 1:return n.os.platform()}return""};n.prim_writeStr=function(a){return m.stdout.write(a)};n.prim_readStr=function(){var a=new u(1024);for(var b=0;;){n.fs.readSync(0,a,b,1);if(10==a[b]){a=a.toString("utf8",0,b);break}b++;if(b==a.length){var c=
new u(2*a.length);a.copy(c);a=c}}return a};n.jsbn=function(){function a(a,b,c){null!=a&&("number"==typeof a?this.fromNumber(a,b,c):null==b&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function b(){return new a(null)}function c(a,b,c,d,e,f){for(;0<=--f;){var Q=b*this[a++]+c[d]+e;e=Math.floor(Q/67108864);c[d++]=Q&67108863}return e}function d(a,b,c,d,e,f){var Q=b&32767;for(b>>=15;0<=--f;){var g=this[a]&32767,db=this[a++]>>15,h=b*g+db*Q;g=Q*g+((h&32767)<<15)+c[d]+(e&1073741823);e=
(g>>>30)+(h>>>15)+b*db+(e>>>30);c[d++]=g&1073741823}return e}function e(a,b,c,d,e,f){var Q=b&16383;for(b>>=14;0<=--f;){var g=this[a]&16383,db=this[a++]>>14,h=b*g+db*Q;g=Q*g+((h&16383)<<14)+c[d]+e;e=(g>>28)+(h>>14)+b*db;c[d++]=g&268435455}return e}function f(a,b){a=C[a.charCodeAt(b)];return null==a?-1:a}function g(a){var c=b();c.fromInt(a);return c}function h(a){var b=1,c;0!=(c=a>>>16)&&(a=c,b+=16);0!=(c=a>>8)&&(a=c,b+=8);0!=(c=a>>4)&&(a=c,b+=4);0!=(c=a>>2)&&(a=c,b+=2);0!=a>>1&&(b+=1);return b}function n(a){this.m=
a}function p(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<a.DB-15)-1;this.mt2=2*a.t}function q(a,b){return a&b}function m(a,b){return a|b}function r(a,b){return a^b}function t(a,b){return a&~b}function x(){}function ra(a){return a}function y(c){this.r2=b();this.q3=b();a.ONE.dlShiftTo(2*c.t,this.r2);this.mu=this.r2.divide(c);this.m=c}function k(a){u[D++]^=a&255;u[D++]^=a>>8&255;u[D++]^=a>>16&255;u[D++]^=a>>24&255;D>=G&&(D-=G)}function z(){}function A(){this.j=
this.i=0;this.S=[]}var w;(w="undefined"!==typeof navigator)&&"Microsoft Internet Explorer"==navigator.appName?(a.prototype.am=d,w=30):w&&"Netscape"!=navigator.appName?(a.prototype.am=c,w=26):(a.prototype.am=e,w=28);a.prototype.DB=w;a.prototype.DM=(1<<w)-1;a.prototype.DV=1<<w;a.prototype.FV=Math.pow(2,52);a.prototype.F1=52-w;a.prototype.F2=2*w-52;var C=[],B;w=48;for(B=0;9>=B;++B)C[w++]=B;w=97;for(B=10;36>B;++B)C[w++]=B;w=65;for(B=10;36>B;++B)C[w++]=B;n.prototype.convert=function(a){return 0>a.s||0<=
a.compareTo(this.m)?a.mod(this.m):a};n.prototype.revert=function(a){return a};n.prototype.reduce=function(a){a.divRemTo(this.m,null,a)};n.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};n.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};p.prototype.convert=function(c){var d=b();c.abs().dlShiftTo(this.m.t,d);d.divRemTo(this.m,null,d);0>c.s&&0<d.compareTo(a.ZERO)&&this.m.subTo(d,d);return d};p.prototype.revert=function(a){var c=b();a.copyTo(c);this.reduce(c);return c};p.prototype.reduce=
function(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=a[b]&32767,d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;c=b+this.m.t;for(a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp();a.drShiftTo(this.m.t,a);0<=a.compareTo(this.m)&&a.subTo(this.m,a)};p.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};p.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};a.prototype.copyTo=function(a){for(var b=this.t-1;0<=b;--b)a[b]=
this[b];a.t=this.t;a.s=this.s};a.prototype.fromInt=function(a){this.t=1;this.s=0>a?-1:0;0<a?this[0]=a:-1>a?this[0]=a+this.DV:this.t=0};a.prototype.fromString=function(b,c){if(16==c)c=4;else if(8==c)c=3;else if(256==c)c=8;else if(2==c)c=1;else if(32==c)c=5;else if(4==c)c=2;else{this.fromRadix(b,c);return}this.s=this.t=0;for(var d=b.length,e=!1,g=0;0<=--d;){var Q=8==c?b[d]&255:f(b,d);0>Q?"-"==b.charAt(d)&&(e=!0):(e=!1,0==g?this[this.t++]=Q:g+c>this.DB?(this[this.t-1]|=(Q&(1<<this.DB-g)-1)<<g,this[this.t++]=
Q>>this.DB-g):this[this.t-1]|=Q<<g,g+=c,g>=this.DB&&(g-=this.DB))}8==c&&0!=(b[0]&128)&&(this.s=-1,0<g&&(this[this.t-1]|=(1<<this.DB-g)-1<<g));this.clamp();e&&a.ZERO.subTo(this,this)};a.prototype.clamp=function(){for(var a=this.s&this.DM;0<this.t&&this[this.t-1]==a;)--this.t};a.prototype.dlShiftTo=function(a,b){var c;for(c=this.t-1;0<=c;--c)b[c+a]=this[c];for(c=a-1;0<=c;--c)b[c]=0;b.t=this.t+a;b.s=this.s};a.prototype.drShiftTo=function(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-
a,0);b.s=this.s};a.prototype.lShiftTo=function(a,b){var c=a%this.DB,d=this.DB-c,e=(1<<d)-1;a=Math.floor(a/this.DB);var f=this.s<<c&this.DM,g;for(g=this.t-1;0<=g;--g)b[g+a+1]=this[g]>>d|f,f=(this[g]&e)<<c;for(g=a-1;0<=g;--g)b[g]=0;b[a]=f;b.t=this.t+a+1;b.s=this.s;b.clamp()};a.prototype.rShiftTo=function(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)b.t=0;else{a%=this.DB;var d=this.DB-a,e=(1<<a)-1;b[0]=this[c]>>a;for(var f=c+1;f<this.t;++f)b[f-c-1]|=(this[f]&e)<<d,b[f-c]=this[f]>>a;0<a&&
(b[this.t-c-1]|=(this.s&e)<<d);b.t=this.t-c;b.clamp()}};a.prototype.subTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0;-1>d?b[c++]=this.DV+d:0<d&&(b[c++]=d);b.t=c;b.clamp()};a.prototype.multiplyTo=function(b,c){var d=this.abs(),e=b.abs(),f=d.t;for(c.t=f+e.t;0<=--f;)c[f]=0;for(f=
0;f<e.t;++f)c[f+d.t]=d.am(0,e[f],c,f,0,d.t);c.s=0;c.clamp();this.s!=b.s&&a.ZERO.subTo(c,c)};a.prototype.squareTo=function(a){for(var b=this.abs(),c=a.t=2*b.t;0<=--c;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}0<a.t&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1));a.s=0;a.clamp()};a.prototype.divRemTo=function(c,d,e){var f=c.abs();if(!(0>=f.t)){var g=this.abs();if(g.t<f.t)null!=d&&d.fromInt(0),null!=e&&this.copyTo(e);
else{null==e&&(e=b());var Q=b(),db=this.s;c=c.s;var n=this.DB-h(f[f.t-1]);0<n?(f.lShiftTo(n,Q),g.lShiftTo(n,e)):(f.copyTo(Q),g.copyTo(e));f=Q.t;g=Q[f-1];if(0!=g){var l=g*(1<<this.F1)+(1<f?Q[f-2]>>this.F2:0),p=this.FV/l;l=(1<<this.F1)/l;var q=1<<this.F2,jb=e.t,m=jb-f,r=null==d?b():d;Q.dlShiftTo(m,r);0<=e.compareTo(r)&&(e[e.t++]=1,e.subTo(r,e));a.ONE.dlShiftTo(f,r);for(r.subTo(Q,Q);Q.t<f;)Q[Q.t++]=0;for(;0<=--m;){var t=e[--jb]==g?this.DM:Math.floor(e[jb]*p+(e[jb-1]+q)*l);if((e[jb]+=Q.am(0,t,e,m,0,f))<
t)for(Q.dlShiftTo(m,r),e.subTo(r,e);e[jb]<--t;)e.subTo(r,e)}null!=d&&(e.drShiftTo(f,d),db!=c&&a.ZERO.subTo(d,d));e.t=f;e.clamp();0<n&&e.rShiftTo(n,e);0>db&&a.ZERO.subTo(e,e)}}}};a.prototype.invDigit=function(){if(1>this.t)return 0;var a=this[0];if(0==(a&1))return 0;var b=a&3;b=b*(2-(a&15)*b)&15;b=b*(2-(a&255)*b)&255;b=b*(2-((a&65535)*b&65535))&65535;b=b*(2-a*b%this.DV)%this.DV;return 0<b?this.DV-b:-b};a.prototype.isEven=function(){return 0==(0<this.t?this[0]&1:this.s)};a.prototype.exp=function(c,
d){if(4294967295<c||1>c)return a.ONE;var e=b(),f=b(),g=d.convert(this),Q=h(c)-1;for(g.copyTo(e);0<=--Q;)if(d.sqrTo(e,f),0<(c&1<<Q))d.mulTo(f,g,e);else{var n=e;e=f;f=n}return d.revert(e)};a.prototype.toString=function(a){if(0>this.s)return"-"+this.negate().toString(a);if(16==a)a=4;else if(8==a)a=3;else if(2==a)a=1;else if(32==a)a=5;else if(4==a)a=2;else return this.toRadix(a);var b=(1<<a)-1,c,d=!1,e="",f=this.t,g=this.DB-f*this.DB%a;if(0<f--)for(g<this.DB&&0<(c=this[f]>>g)&&(d=!0,e="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));0<=
f;)g<a?(c=(this[f]&(1<<g)-1)<<a-g,c|=this[--f]>>(g+=this.DB-a)):(c=this[f]>>(g-=a)&b,0>=g&&(g+=this.DB,--f)),0<c&&(d=!0),d&&(e+="0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));return d?e:"0"};a.prototype.negate=function(){var c=b();a.ZERO.subTo(this,c);return c};a.prototype.abs=function(){return 0>this.s?this.negate():this};a.prototype.compareTo=function(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;b=c-a.t;if(0!=b)return 0>this.s?-b:b;for(;0<=--c;)if(0!=(b=this[c]-a[c]))return b;return 0};
a.prototype.bitLength=function(){return 0>=this.t?0:this.DB*(this.t-1)+h(this[this.t-1]^this.s&this.DM)};a.prototype.mod=function(c){var d=b();this.abs().divRemTo(c,null,d);0>this.s&&0<d.compareTo(a.ZERO)&&c.subTo(d,d);return d};a.prototype.modPowInt=function(a,b){b=256>a||b.isEven()?new n(b):new p(b);return this.exp(a,b)};a.ZERO=g(0);a.ONE=g(1);x.prototype.convert=ra;x.prototype.revert=ra;x.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c)};x.prototype.sqrTo=function(a,b){a.squareTo(b)};y.prototype.convert=
function(a){if(0>a.s||a.t>2*this.m.t)return a.mod(this.m);if(0>a.compareTo(this.m))return a;var c=b();a.copyTo(c);this.reduce(c);return c};y.prototype.revert=function(a){return a};y.prototype.reduce=function(a){a.drShiftTo(this.m.t-1,this.r2);a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp());this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);for(this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);0>a.compareTo(this.r2);)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);0<=a.compareTo(this.m);)a.subTo(this.m,
a)};y.prototype.mulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};y.prototype.sqrTo=function(a,b){a.squareTo(b);this.reduce(b)};var v=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,
523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],H=67108864/v[v.length-1];a.prototype.chunkSize=function(a){return Math.floor(Math.LN2*this.DB/Math.log(a))};a.prototype.toRadix=function(a){null==a&&(a=10);if(0==this.signum()||2>a||36<a)return"0";var c=this.chunkSize(a);
c=Math.pow(a,c);var d=g(c),e=b(),f=b(),h="";for(this.divRemTo(d,e,f);0<e.signum();)h=(c+f.intValue()).toString(a).substr(1)+h,e.divRemTo(d,e,f);return f.intValue().toString(a)+h};a.prototype.fromRadix=function(b,c){this.fromInt(0);null==c&&(c=10);for(var d=this.chunkSize(c),e=Math.pow(c,d),g=!1,h=0,n=0,l=0;l<b.length;++l){var Q=f(b,l);0>Q?"-"==b.charAt(l)&&0==this.signum()&&(g=!0):(n=c*n+Q,++h>=d&&(this.dMultiply(e),this.dAddOffset(n,0),n=h=0))}0<h&&(this.dMultiply(Math.pow(c,h)),this.dAddOffset(n,
0));g&&a.ZERO.subTo(this,this)};a.prototype.fromNumber=function(b,c,d){if("number"==typeof c)if(2>b)this.fromInt(1);else for(this.fromNumber(b,d),this.testBit(b-1)||this.bitwiseTo(a.ONE.shiftLeft(b-1),m,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(c);)this.dAddOffset(2,0),this.bitLength()>b&&this.subTo(a.ONE.shiftLeft(b-1),this);else{d=[];var e=b&7;d.length=(b>>3)+1;c.nextBytes(d);d[0]=0<e?d[0]&(1<<e)-1:0;this.fromString(d,256)}};a.prototype.bitwiseTo=function(a,b,c){var d,e=Math.min(a.t,
this.t);for(d=0;d<e;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){var f=a.s&this.DM;for(d=e;d<this.t;++d)c[d]=b(this[d],f);c.t=this.t}else{f=this.s&this.DM;for(d=e;d<a.t;++d)c[d]=b(f,a[d]);c.t=a.t}c.s=b(this.s,a.s);c.clamp()};a.prototype.changeBit=function(b,c){b=a.ONE.shiftLeft(b);this.bitwiseTo(b,c,b);return b};a.prototype.addTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;
d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,d>>=this.DB;d+=a.s}b.s=0>d?-1:0;0<d?b[c++]=d:-1>d&&(b[c++]=this.DV+d);b.t=c;b.clamp()};a.prototype.dMultiply=function(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()};a.prototype.dAddOffset=function(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}};a.prototype.multiplyLowerTo=function(a,b,c){var d=Math.min(this.t+a.t,b);c.s=0;
for(c.t=d;0<d;)c[--d]=0;var e;for(e=c.t-this.t;d<e;++d)c[d+this.t]=this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);d<e;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()};a.prototype.multiplyUpperTo=function(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;0<=--d;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp();c.drShiftTo(1,c)};a.prototype.modInt=function(a){if(0>=a)return 0;var b=this.DV%a,c=0>this.s?a-1:0;if(0<this.t)if(0==b)c=this[0]%a;else for(var d=
this.t-1;0<=d;--d)c=(b*c+this[d])%a;return c};a.prototype.millerRabin=function(c){var d=this.subtract(a.ONE),e=d.getLowestSetBit();if(0>=e)return!1;var f=d.shiftRight(e);c=c+1>>1;c>v.length&&(c=v.length);for(var g=b(),h=0;h<c;++h){g.fromInt(v[Math.floor(Math.random()*v.length)]);var n=g.modPow(f,this);if(0!=n.compareTo(a.ONE)&&0!=n.compareTo(d)){for(var l=1;l++<e&&0!=n.compareTo(d);)if(n=n.modPowInt(2,this),0==n.compareTo(a.ONE))return!1;if(0!=n.compareTo(d))return!1}}return!0};a.prototype.clone=
function(){var a=b();this.copyTo(a);return a};a.prototype.intValue=function(){if(0>this.s){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]};a.prototype.byteValue=function(){return 0==this.t?this.s:this[0]<<24>>24};a.prototype.shortValue=function(){return 0==this.t?this.s:this[0]<<16>>16};a.prototype.signum=function(){return 0>this.s?-1:0>=this.t||1==this.t&&0>=this[0]?0:1};a.prototype.toByteArray=
function(){var a=this.t,b=[];b[0]=this.s;var c=this.DB-a*this.DB%8,d,e=0;if(0<a--)for(c<this.DB&&(d=this[a]>>c)!=(this.s&this.DM)>>c&&(b[e++]=d|this.s<<this.DB-c);0<=a;)if(8>c?(d=(this[a]&(1<<c)-1)<<8-c,d|=this[--a]>>(c+=this.DB-8)):(d=this[a]>>(c-=8)&255,0>=c&&(c+=this.DB,--a)),0!=(d&128)&&(d|=-256),0==e&&(this.s&128)!=(d&128)&&++e,0<e||d!=this.s)b[e++]=d;return b};a.prototype.equals=function(a){return 0==this.compareTo(a)};a.prototype.min=function(a){return 0>this.compareTo(a)?this:a};a.prototype.max=
function(a){return 0<this.compareTo(a)?this:a};a.prototype.and=function(a){var c=b();this.bitwiseTo(a,q,c);return c};a.prototype.or=function(a){var c=b();this.bitwiseTo(a,m,c);return c};a.prototype.xor=function(a){var c=b();this.bitwiseTo(a,r,c);return c};a.prototype.andNot=function(a){var c=b();this.bitwiseTo(a,t,c);return c};a.prototype.not=function(){for(var a=b(),c=0;c<this.t;++c)a[c]=this.DM&~this[c];a.t=this.t;a.s=~this.s;return a};a.prototype.shiftLeft=function(a){var c=b();0>a?this.rShiftTo(-a,
c):this.lShiftTo(a,c);return c};a.prototype.shiftRight=function(a){var c=b();0>a?this.lShiftTo(-a,c):this.rShiftTo(a,c);return c};a.prototype.getLowestSetBit=function(){for(var a=0;a<this.t;++a)if(0!=this[a]){var b=a*this.DB;a=this[a];if(0==a)a=-1;else{var c=0;0==(a&65535)&&(a>>=16,c+=16);0==(a&255)&&(a>>=8,c+=8);0==(a&15)&&(a>>=4,c+=4);0==(a&3)&&(a>>=2,c+=2);0==(a&1)&&++c;a=c}return b+a}return 0>this.s?this.t*this.DB:-1};a.prototype.bitCount=function(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c){for(var d=
this[c]^b,e=0;0!=d;)d&=d-1,++e;a+=e}return a};a.prototype.testBit=function(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)};a.prototype.setBit=function(a){return this.changeBit(a,m)};a.prototype.clearBit=function(a){return this.changeBit(a,t)};a.prototype.flipBit=function(a){return this.changeBit(a,r)};a.prototype.add=function(a){var c=b();this.addTo(a,c);return c};a.prototype.subtract=function(a){var c=b();this.subTo(a,c);return c};a.prototype.multiply=function(a){var c=
b();this.multiplyTo(a,c);return c};a.prototype.divide=function(a){var c=b();this.divRemTo(a,c,null);return c};a.prototype.remainder=function(a){var c=b();this.divRemTo(a,null,c);return c};a.prototype.divideAndRemainder=function(a){var c=b(),d=b();this.divRemTo(a,c,d);return[c,d]};a.prototype.modPow=function(a,c){var d=a.bitLength(),e=g(1);if(0>=d)return e;var f=18>d?1:48>d?3:144>d?4:768>d?5:6;c=8>d?new n(c):c.isEven()?new y(c):new p(c);var l=[],q=3,r=f-1,m=(1<<f)-1;l[1]=c.convert(this);if(1<f)for(d=
b(),c.sqrTo(l[1],d);q<=m;)l[q]=b(),c.mulTo(d,l[q-2],l[q]),q+=2;var t=a.t-1,x=!0,w=b();for(d=h(a[t])-1;0<=t;){if(d>=r)var ra=a[t]>>d-r&m;else ra=(a[t]&(1<<d+1)-1)<<r-d,0<t&&(ra|=a[t-1]>>this.DB+d-r);for(q=f;0==(ra&1);)ra>>=1,--q;0>(d-=q)&&(d+=this.DB,--t);if(x)l[ra].copyTo(e),x=!1;else{for(;1<q;)c.sqrTo(e,w),c.sqrTo(w,e),q-=2;0<q?c.sqrTo(e,w):(q=e,e=w,w=q);c.mulTo(w,l[ra],e)}for(;0<=t&&0==(a[t]&1<<d);)c.sqrTo(e,w),q=e,e=w,w=q,0>--d&&(d=this.DB-1,--t)}return c.revert(e)};a.prototype.modInverse=function(b){var c=
b.isEven();if(this.isEven()&&c||0==b.signum())return a.ZERO;for(var d=b.clone(),e=this.clone(),f=g(1),h=g(0),n=g(0),l=g(1);0!=d.signum();){for(;d.isEven();)d.rShiftTo(1,d),c?(f.isEven()&&h.isEven()||(f.addTo(this,f),h.subTo(b,h)),f.rShiftTo(1,f)):h.isEven()||h.subTo(b,h),h.rShiftTo(1,h);for(;e.isEven();)e.rShiftTo(1,e),c?(n.isEven()&&l.isEven()||(n.addTo(this,n),l.subTo(b,l)),n.rShiftTo(1,n)):l.isEven()||l.subTo(b,l),l.rShiftTo(1,l);0<=d.compareTo(e)?(d.subTo(e,d),c&&f.subTo(n,f),h.subTo(l,h)):(e.subTo(d,
e),c&&n.subTo(f,n),l.subTo(h,l))}if(0!=e.compareTo(a.ONE))return a.ZERO;if(0<=l.compareTo(b))return l.subtract(b);if(0>l.signum())l.addTo(b,l);else return l;return 0>l.signum()?l.add(b):l};a.prototype.pow=function(a){return this.exp(a,new x)};a.prototype.gcd=function(a){var b=0>this.s?this.negate():this.clone();a=0>a.s?a.negate():a.clone();if(0>b.compareTo(a)){var c=b;b=a;a=c}c=b.getLowestSetBit();var d=a.getLowestSetBit();if(0>d)return b;c<d&&(d=c);0<d&&(b.rShiftTo(d,b),a.rShiftTo(d,a));for(;0<b.signum();)0<
(c=b.getLowestSetBit())&&b.rShiftTo(c,b),0<(c=a.getLowestSetBit())&&a.rShiftTo(c,a),0<=b.compareTo(a)?(b.subTo(a,b),b.rShiftTo(1,b)):(a.subTo(b,a),a.rShiftTo(1,a));0<d&&a.lShiftTo(d,a);return a};a.prototype.isProbablePrime=function(a){var b,c=this.abs();if(1==c.t&&c[0]<=v[v.length-1]){for(b=0;b<v.length;++b)if(c[0]==v[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<v.length;){for(var d=v[b],e=b+1;e<v.length&&d<H;)d*=v[e++];for(d=c.modInt(d);b<e;)if(0==d%v[b++])return!1}return c.millerRabin(a)};
a.prototype.square=function(){var a=b();this.squareTo(a);return a};a.prototype.Barrett=y;var E;if(null==u){var u=[];var D=0;if("undefined"!==typeof window&&window.crypto)if(window.crypto.getRandomValues)for(B=new Uint8Array(32),window.crypto.getRandomValues(B),w=0;32>w;++w)u[D++]=B[w];else if("Netscape"==navigator.appName&&"5">navigator.appVersion)for(B=window.crypto.random(32),w=0;w<B.length;++w)u[D++]=B.charCodeAt(w)&255;for(;D<G;)w=Math.floor(65536*Math.random()),u[D++]=w>>>8,u[D++]=w&255;D=0;
k((new Date).getTime())}z.prototype.nextBytes=function(a){var b;for(b=0;b<a.length;++b){var c=b;if(null==E){k((new Date).getTime());E=new A;E.init(u);for(D=0;D<u.length;++D)u[D]=0;D=0}var d=E.next();a[c]=d}};A.prototype.init=function(a){var b,c;for(b=0;256>b;++b)this.S[b]=b;for(b=c=0;256>b;++b){c=c+this.S[b]+a[b%a.length]&255;var d=this.S[b];this.S[b]=this.S[c];this.S[c]=d}this.j=this.i=0};A.prototype.next=function(){this.i=this.i+1&255;this.j=this.j+this.S[this.i]&255;var a=this.S[this.i];this.S[this.i]=
this.S[this.j];this.S[this.j]=a;return this.S[a+this.S[this.i]&255]};var G=256;return{BigInteger:a,SecureRandom:z}}.call(this);var kb={type:0},Ka={type:13},ee={type:0},C={type:0},le={type:1},ta={type:0},da={type:0},fe={type:0},Oj={type:0},ke={type:0};F.exports={run:function(){return Nj.apply(this,Array.prototype.slice.call(arguments,0,2))}}}).call(this)}).call(this,k("_process"),k("buffer").Buffer)},{_process:8,buffer:5,fs:4,os:7}],2:[function(k,F,u){k=k("./dist/index").run;window.run=k},{"./dist/index":1}],
3:[function(k,F,u){function m(m){var k=m.length;if(0<k%4)throw Error("Invalid string. Length must be a multiple of 4");m=m.indexOf("=");-1===m&&(m=k);return[m,m===k?0:4-m%4]}function G(m,k,v){for(var u=[],H=k;H<v;H+=3)k=(m[H]<<16&16711680)+(m[H+1]<<8&65280)+(m[H+2]&255),u.push(R[k>>18&63]+R[k>>12&63]+R[k>>6&63]+R[k&63]);return u.join("")}u.byteLength=function(k){k=m(k);var u=k[1];return 3*(k[0]+u)/4-u};u.toByteArray=function(k){var u=m(k);var v=u[0];u=u[1];var H=new T(3*(v+u)/4-u),G=0,R=0<u?v-4:v,
F;for(F=0;F<R;F+=4)v=K[k.charCodeAt(F)]<<18|K[k.charCodeAt(F+1)]<<12|K[k.charCodeAt(F+2)]<<6|K[k.charCodeAt(F+3)],H[G++]=v>>16&255,H[G++]=v>>8&255,H[G++]=v&255;2===u&&(v=K[k.charCodeAt(F)]<<2|K[k.charCodeAt(F+1)]>>4,H[G++]=v&255);1===u&&(v=K[k.charCodeAt(F)]<<10|K[k.charCodeAt(F+1)]<<4|K[k.charCodeAt(F+2)]>>2,H[G++]=v>>8&255,H[G++]=v&255);return H};u.fromByteArray=function(m){for(var k=m.length,v=k%3,u=[],H=0,K=k-v;H<K;H+=16383)u.push(G(m,H,H+16383>K?K:H+16383));1===v?(m=m[k-1],u.push(R[m>>2]+R[m<<
4&63]+"==")):2===v&&(m=(m[k-2]<<8)+m[k-1],u.push(R[m>>10]+R[m>>4&63]+R[m<<2&63]+"="));return u.join("")};var R=[],K=[],T="undefined"!==typeof Uint8Array?Uint8Array:Array;for(k=0;64>k;++k)R[k]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[k],K["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(k)]=k;K[45]=62;K[95]=63},{}],4:[function(k,F,u){},{}],5:[function(k,F,u){(function(m){function G(d){if(2147483647<d)throw new RangeError('The value "'+d+'" is invalid for option "size"');
d=new Uint8Array(d);Object.setPrototypeOf(d,m.prototype);return d}function m(d,e,g){if("number"===typeof d){if("string"===typeof e)throw new TypeError('The "string" argument must be of type string. Received type number');return T(d)}return F(d,e,g)}function F(d,e,g){if("string"===typeof d){var h=e;if("string"!==typeof h||""===h)h="utf8";if(!m.isEncoding(h))throw new TypeError("Unknown encoding: "+h);e=W(d,h)|0;g=G(e);d=g.write(d,h);d!==e&&(g=g.slice(0,d));return g}if(ArrayBuffer.isView(d))return H(d);
if(null==d)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof d);if(za(d,ArrayBuffer)||d&&za(d.buffer,ArrayBuffer)){if(0>e||d.byteLength<e)throw new RangeError('"offset" is outside of buffer bounds');if(d.byteLength<e+(g||0))throw new RangeError('"length" is outside of buffer bounds');d=void 0===e&&void 0===g?new Uint8Array(d):void 0===g?new Uint8Array(d,e):new Uint8Array(d,e,g);Object.setPrototypeOf(d,m.prototype);
return d}if("number"===typeof d)throw new TypeError('The "value" argument must not be of type number. Received type number');h=d.valueOf&&d.valueOf();if(null!=h&&h!==d)return m.from(h,e,g);if(h=Aa(d))return h;$jscomp.initSymbol();$jscomp.initSymbol();$jscomp.initSymbol();if("undefined"!==typeof Symbol&&null!=Symbol.toPrimitive&&"function"===typeof d[Symbol.toPrimitive])return $jscomp.initSymbol(),m.from(d[Symbol.toPrimitive]("string"),e,g);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+
typeof d);}function K(d){if("number"!==typeof d)throw new TypeError('"size" argument must be of type number');if(0>d)throw new RangeError('The value "'+d+'" is invalid for option "size"');}function T(d){K(d);return G(0>d?0:v(d)|0)}function H(d){for(var e=0>d.length?0:v(d.length)|0,g=G(e),h=0;h<e;h+=1)g[h]=d[h]&255;return g}function Aa(d){if(m.isBuffer(d)){var e=v(d.length)|0,g=G(e);if(0===g.length)return g;d.copy(g,0,0,e);return g}if(void 0!==d.length)return(e="number"!==typeof d.length)||(e=d.length,
e=e!==e),e?G(0):H(d);if("Buffer"===d.type&&Array.isArray(d.data))return H(d.data)}function v(d){if(2147483647<=d)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+(2147483647).toString(16)+" bytes");return d|0}function W(d,e){if(m.isBuffer(d))return d.length;if(ArrayBuffer.isView(d)||za(d,ArrayBuffer))return d.byteLength;if("string"!==typeof d)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof d);var g=
d.length,h=2<arguments.length&&!0===arguments[2];if(!h&&0===g)return 0;for(var k=!1;;)switch(e){case "ascii":case "latin1":case "binary":return g;case "utf8":case "utf-8":return Mb(d).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return 2*g;case "hex":return g>>>1;case "base64":return mb.toByteArray(lb(d)).length;default:if(k)return h?-1:Mb(d).length;e=(""+e).toLowerCase();k=!0}}function Ea(d,e,g){var h=!1;if(void 0===e||0>e)e=0;if(e>this.length)return"";if(void 0===g||g>this.length)g=
this.length;if(0>=g)return"";g>>>=0;e>>>=0;if(g<=e)return"";for(d||(d="utf8");;)switch(d){case "hex":d=e;e=g;g=this.length;if(!d||0>d)d=0;if(!e||0>e||e>g)e=g;h="";for(g=d;g<e;++g)d=h,h=this[g],h=16>h?"0"+h.toString(16):h.toString(16),h=d+h;return h;case "utf8":case "utf-8":return Ma(this,e,g);case "ascii":d="";for(g=Math.min(this.length,g);e<g;++e)d+=String.fromCharCode(this[e]&127);return d;case "latin1":case "binary":d="";for(g=Math.min(this.length,g);e<g;++e)d+=String.fromCharCode(this[e]);return d;
case "base64":return e=0===e&&g===this.length?mb.fromByteArray(this):mb.fromByteArray(this.slice(e,g)),e;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":e=this.slice(e,g);g="";for(d=0;d<e.length;d+=2)g+=String.fromCharCode(e[d]+256*e[d+1]);return g;default:if(h)throw new TypeError("Unknown encoding: "+d);d=(d+"").toLowerCase();h=!0}}function U(d,e,g){var h=d[e];d[e]=d[g];d[g]=h}function fa(d,e,g,h,k){if(0===d.length)return-1;"string"===typeof g?(h=g,g=0):2147483647<g?g=2147483647:-2147483648>
g&&(g=-2147483648);g=+g;g!==g&&(g=k?0:d.length-1);0>g&&(g=d.length+g);if(g>=d.length){if(k)return-1;g=d.length-1}else if(0>g)if(k)g=0;else return-1;"string"===typeof e&&(e=m.from(e,h));if(m.isBuffer(e))return 0===e.length?-1:Ba(d,e,g,h,k);if("number"===typeof e)return e&=255,"function"===typeof Uint8Array.prototype.indexOf?k?Uint8Array.prototype.indexOf.call(d,e,g):Uint8Array.prototype.lastIndexOf.call(d,e,g):Ba(d,[e],g,h,k);throw new TypeError("val must be string, number or Buffer");}function Ba(d,
e,g,h,m){function k(d,e){return 1===ra?d[e]:d.readUInt16BE(e*ra)}var ra=1,v=d.length,u=e.length;if(void 0!==h&&(h=String(h).toLowerCase(),"ucs2"===h||"ucs-2"===h||"utf16le"===h||"utf-16le"===h)){if(2>d.length||2>e.length)return-1;ra=2;v/=2;u/=2;g/=2}if(m)for(h=-1;g<v;g++)if(k(d,g)===k(e,-1===h?0:g-h)){if(-1===h&&(h=g),g-h+1===u)return h*ra}else-1!==h&&(g-=g-h),h=-1;else for(g+u>v&&(g=v-u);0<=g;g--){v=!0;for(h=0;h<u;h++)if(k(d,g+h)!==k(e,h)){v=!1;break}if(v)return g}return-1}function Ma(d,e,g){g=Math.min(d.length,
g);for(var h=[];e<g;){var m=d[e],k=null,v=239<m?4:223<m?3:191<m?2:1;if(e+v<=g)switch(v){case 1:128>m&&(k=m);break;case 2:var u=d[e+1];128===(u&192)&&(m=(m&31)<<6|u&63,127<m&&(k=m));break;case 3:u=d[e+1];var G=d[e+2];128===(u&192)&&128===(G&192)&&(m=(m&15)<<12|(u&63)<<6|G&63,2047<m&&(55296>m||57343<m)&&(k=m));break;case 4:u=d[e+1];G=d[e+2];var H=d[e+3];128===(u&192)&&128===(G&192)&&128===(H&192)&&(m=(m&15)<<18|(u&63)<<12|(G&63)<<6|H&63,65535<m&&1114112>m&&(k=m))}null===k?(k=65533,v=1):65535<k&&(k-=
65536,h.push(k>>>10&1023|55296),k=56320|k&1023);h.push(k);e+=v}d=h.length;if(d<=X)h=String.fromCharCode.apply(String,h);else{g="";for(e=0;e<d;)g+=String.fromCharCode.apply(String,h.slice(e,e+=X));h=g}return h}function ba(d,e,g){if(0!==d%1||0>d)throw new RangeError("offset is not uint");if(d+e>g)throw new RangeError("Trying to access beyond buffer length");}function ma(d,e,g,h,k,v){if(!m.isBuffer(d))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>k||e<v)throw new RangeError('"value" argument is out of bounds');
if(g+h>d.length)throw new RangeError("Index out of range");}function eb(d,e,g,h,m,k){if(g+h>d.length)throw new RangeError("Index out of range");if(0>g)throw new RangeError("Index out of range");}function Lb(d,e,g,h,m){e=+e;g>>>=0;m||eb(d,e,g,4,3.4028234663852886E38,-3.4028234663852886E38);Wa.write(d,e,g,h,23,4);return g+4}function dc(d,e,g,h,m){e=+e;g>>>=0;m||eb(d,e,g,8,1.7976931348623157E308,-1.7976931348623157E308);Wa.write(d,e,g,h,52,8);return g+8}function lb(d){d=d.split("=")[0];d=d.trim().replace(Cc,
"");if(2>d.length)return"";for(;0!==d.length%4;)d+="=";return d}function Mb(d,e){e=e||Infinity;for(var g,h=d.length,m=null,k=[],v=0;v<h;++v){g=d.charCodeAt(v);if(55295<g&&57344>g){if(!m){if(56319<g){-1<(e-=3)&&k.push(239,191,189);continue}else if(v+1===h){-1<(e-=3)&&k.push(239,191,189);continue}m=g;continue}if(56320>g){-1<(e-=3)&&k.push(239,191,189);m=g;continue}g=(m-55296<<10|g-56320)+65536}else m&&-1<(e-=3)&&k.push(239,191,189);m=null;if(128>g){if(0>--e)break;k.push(g)}else if(2048>g){if(0>(e-=
2))break;k.push(g>>6|192,g&63|128)}else if(65536>g){if(0>(e-=3))break;k.push(g>>12|224,g>>6&63|128,g&63|128)}else if(1114112>g){if(0>(e-=4))break;k.push(g>>18|240,g>>12&63|128,g>>6&63|128,g&63|128)}else throw Error("Invalid code point");}return k}function fc(d){for(var e=[],g=0;g<d.length;++g)e.push(d.charCodeAt(g)&255);return e}function fb(d,e,g,h){for(var m=0;m<h&&!(m+g>=e.length||m>=d.length);++m)e[m+g]=d[m];return m}function za(d,e){return d instanceof e||null!=d&&null!=d.constructor&&null!=d.constructor.name&&
d.constructor.name===e.name}var mb=k("base64-js"),Wa=k("ieee754");$jscomp.initSymbol();$jscomp.initSymbol();var gc="function"===typeof Symbol?Symbol.for("nodejs.util.inspect.custom"):null;u.Buffer=m;u.SlowBuffer=function(d){+d!=d&&(d=0);return m.alloc(+d)};u.INSPECT_MAX_BYTES=50;u.kMaxLength=2147483647;m.TYPED_ARRAY_SUPPORT=function(){try{var d=new Uint8Array(1),e={foo:function(){return 42}};Object.setPrototypeOf(e,Uint8Array.prototype);Object.setPrototypeOf(d,e);return 42===d.foo()}catch(g){return!1}}();
m.TYPED_ARRAY_SUPPORT||"undefined"===typeof console||"function"!==typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");Object.defineProperty(m.prototype,"parent",{enumerable:!0,get:function(){if(m.isBuffer(this))return this.buffer}});Object.defineProperty(m.prototype,"offset",{enumerable:!0,get:function(){if(m.isBuffer(this))return this.byteOffset}});$jscomp.initSymbol();
$jscomp.initSymbol();$jscomp.initSymbol();"undefined"!==typeof Symbol&&null!=Symbol.species&&m[Symbol.species]===m&&($jscomp.initSymbol(),Object.defineProperty(m,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}));m.poolSize=8192;m.from=function(d,e,g){return F(d,e,g)};Object.setPrototypeOf(m.prototype,Uint8Array.prototype);Object.setPrototypeOf(m,Uint8Array);m.alloc=function(d,e,g){K(d);d=0>=d?G(d):void 0!==e?"string"===typeof g?G(d).fill(e,g):G(d).fill(e):G(d);return d};m.allocUnsafe=
function(d){return T(d)};m.allocUnsafeSlow=function(d){return T(d)};m.isBuffer=function(d){return null!=d&&!0===d._isBuffer&&d!==m.prototype};m.compare=function(d,e){za(d,Uint8Array)&&(d=m.from(d,d.offset,d.byteLength));za(e,Uint8Array)&&(e=m.from(e,e.offset,e.byteLength));if(!m.isBuffer(d)||!m.isBuffer(e))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(d===e)return 0;for(var g=d.length,h=e.length,k=0,v=Math.min(g,h);k<v;++k)if(d[k]!==e[k]){g=d[k];h=
e[k];break}return g<h?-1:h<g?1:0};m.isEncoding=function(d){switch(String(d).toLowerCase()){case "hex":case "utf8":case "utf-8":case "ascii":case "latin1":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return!0;default:return!1}};m.concat=function(d,e){if(!Array.isArray(d))throw new TypeError('"list" argument must be an Array of Buffers');if(0===d.length)return m.alloc(0);var g;if(void 0===e)for(g=e=0;g<d.length;++g)e+=d[g].length;e=m.allocUnsafe(e);var h=0;for(g=
0;g<d.length;++g){var k=d[g];za(k,Uint8Array)&&(k=m.from(k));if(!m.isBuffer(k))throw new TypeError('"list" argument must be an Array of Buffers');k.copy(e,h);h+=k.length}return e};m.byteLength=W;m.prototype._isBuffer=!0;m.prototype.swap16=function(){var d=this.length;if(0!==d%2)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<d;e+=2)U(this,e,e+1);return this};m.prototype.swap32=function(){var d=this.length;if(0!==d%4)throw new RangeError("Buffer size must be a multiple of 32-bits");
for(var e=0;e<d;e+=4)U(this,e,e+3),U(this,e+1,e+2);return this};m.prototype.swap64=function(){var d=this.length;if(0!==d%8)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<d;e+=8)U(this,e,e+7),U(this,e+1,e+6),U(this,e+2,e+5),U(this,e+3,e+4);return this};m.prototype.toString=function(){var d=this.length;return 0===d?"":0===arguments.length?Ma(this,0,d):Ea.apply(this,arguments)};m.prototype.toLocaleString=m.prototype.toString;m.prototype.equals=function(d){if(!m.isBuffer(d))throw new TypeError("Argument must be a Buffer");
return this===d?!0:0===m.compare(this,d)};m.prototype.inspect=function(){var d=u.INSPECT_MAX_BYTES;var e=this.toString("hex",0,d).replace(/(.{2})/g,"$1 ").trim();this.length>d&&(e+=" ... ");return"<Buffer "+e+">"};gc&&(m.prototype[gc]=m.prototype.inspect);m.prototype.compare=function(d,e,g,h,k){za(d,Uint8Array)&&(d=m.from(d,d.offset,d.byteLength));if(!m.isBuffer(d))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof d);void 0===e&&(e=0);void 0===
g&&(g=d?d.length:0);void 0===h&&(h=0);void 0===k&&(k=this.length);if(0>e||g>d.length||0>h||k>this.length)throw new RangeError("out of range index");if(h>=k&&e>=g)return 0;if(h>=k)return-1;if(e>=g)return 1;e>>>=0;g>>>=0;h>>>=0;k>>>=0;if(this===d)return 0;var v=k-h,u=g-e,G=Math.min(v,u);h=this.slice(h,k);d=d.slice(e,g);for(e=0;e<G;++e)if(h[e]!==d[e]){v=h[e];u=d[e];break}return v<u?-1:u<v?1:0};m.prototype.includes=function(d,e,g){return-1!==this.indexOf(d,e,g)};m.prototype.indexOf=function(d,e,g){return fa(this,
d,e,g,!0)};m.prototype.lastIndexOf=function(d,e,g){return fa(this,d,e,g,!1)};m.prototype.write=function(d,e,g,h){if(void 0===e)h="utf8",g=this.length,e=0;else if(void 0===g&&"string"===typeof e)h=e,g=this.length,e=0;else if(isFinite(e))e>>>=0,isFinite(g)?(g>>>=0,void 0===h&&(h="utf8")):(h=g,g=void 0);else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var m=this.length-e;if(void 0===g||g>m)g=m;if(0<d.length&&(0>g||0>e)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");
h||(h="utf8");for(m=!1;;)switch(h){case "hex":a:{e=Number(e)||0;h=this.length-e;g?(g=Number(g),g>h&&(g=h)):g=h;h=d.length;g>h/2&&(g=h/2);for(h=0;h<g;++h){m=parseInt(d.substr(2*h,2),16);if(m!==m){d=h;break a}this[e+h]=m}d=h}return d;case "utf8":case "utf-8":return fb(Mb(d,this.length-e),this,e,g);case "ascii":return fb(fc(d),this,e,g);case "latin1":case "binary":return fb(fc(d),this,e,g);case "base64":return fb(mb.toByteArray(lb(d)),this,e,g);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":h=
d;m=this.length-e;for(var k=[],v=0;v<h.length&&!(0>(m-=2));++v){var u=h.charCodeAt(v);d=u>>8;u%=256;k.push(u);k.push(d)}return fb(k,this,e,g);default:if(m)throw new TypeError("Unknown encoding: "+h);h=(""+h).toLowerCase();m=!0}};m.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var X=4096;m.prototype.slice=function(d,e){var g=this.length;d=~~d;e=void 0===e?g:~~e;0>d?(d+=g,0>d&&(d=0)):d>g&&(d=g);0>e?(e+=g,0>e&&(e=0)):e>g&&(e=g);e<d&&(e=d);d=this.subarray(d,
e);Object.setPrototypeOf(d,m.prototype);return d};m.prototype.readUIntLE=function(d,e,g){d>>>=0;e>>>=0;g||ba(d,e,this.length);g=this[d];for(var h=1,m=0;++m<e&&(h*=256);)g+=this[d+m]*h;return g};m.prototype.readUIntBE=function(d,e,g){d>>>=0;e>>>=0;g||ba(d,e,this.length);g=this[d+--e];for(var h=1;0<e&&(h*=256);)g+=this[d+--e]*h;return g};m.prototype.readUInt8=function(d,e){d>>>=0;e||ba(d,1,this.length);return this[d]};m.prototype.readUInt16LE=function(d,e){d>>>=0;e||ba(d,2,this.length);return this[d]|
this[d+1]<<8};m.prototype.readUInt16BE=function(d,e){d>>>=0;e||ba(d,2,this.length);return this[d]<<8|this[d+1]};m.prototype.readUInt32LE=function(d,e){d>>>=0;e||ba(d,4,this.length);return(this[d]|this[d+1]<<8|this[d+2]<<16)+16777216*this[d+3]};m.prototype.readUInt32BE=function(d,e){d>>>=0;e||ba(d,4,this.length);return 16777216*this[d]+(this[d+1]<<16|this[d+2]<<8|this[d+3])};m.prototype.readIntLE=function(d,e,g){d>>>=0;e>>>=0;g||ba(d,e,this.length);g=this[d];for(var h=1,m=0;++m<e&&(h*=256);)g+=this[d+
m]*h;g>=128*h&&(g-=Math.pow(2,8*e));return g};m.prototype.readIntBE=function(d,e,g){d>>>=0;e>>>=0;g||ba(d,e,this.length);g=e;for(var h=1,m=this[d+--g];0<g&&(h*=256);)m+=this[d+--g]*h;m>=128*h&&(m-=Math.pow(2,8*e));return m};m.prototype.readInt8=function(d,e){d>>>=0;e||ba(d,1,this.length);return this[d]&128?-1*(255-this[d]+1):this[d]};m.prototype.readInt16LE=function(d,e){d>>>=0;e||ba(d,2,this.length);d=this[d]|this[d+1]<<8;return d&32768?d|4294901760:d};m.prototype.readInt16BE=function(d,e){d>>>=
0;e||ba(d,2,this.length);d=this[d+1]|this[d]<<8;return d&32768?d|4294901760:d};m.prototype.readInt32LE=function(d,e){d>>>=0;e||ba(d,4,this.length);return this[d]|this[d+1]<<8|this[d+2]<<16|this[d+3]<<24};m.prototype.readInt32BE=function(d,e){d>>>=0;e||ba(d,4,this.length);return this[d]<<24|this[d+1]<<16|this[d+2]<<8|this[d+3]};m.prototype.readFloatLE=function(d,e){d>>>=0;e||ba(d,4,this.length);return Wa.read(this,d,!0,23,4)};m.prototype.readFloatBE=function(d,e){d>>>=0;e||ba(d,4,this.length);return Wa.read(this,
d,!1,23,4)};m.prototype.readDoubleLE=function(d,e){d>>>=0;e||ba(d,8,this.length);return Wa.read(this,d,!0,52,8)};m.prototype.readDoubleBE=function(d,e){d>>>=0;e||ba(d,8,this.length);return Wa.read(this,d,!1,52,8)};m.prototype.writeUIntLE=function(d,e,g,h){d=+d;e>>>=0;g>>>=0;h||ma(this,d,e,g,Math.pow(2,8*g)-1,0);h=1;var m=0;for(this[e]=d&255;++m<g&&(h*=256);)this[e+m]=d/h&255;return e+g};m.prototype.writeUIntBE=function(d,e,g,h){d=+d;e>>>=0;g>>>=0;h||ma(this,d,e,g,Math.pow(2,8*g)-1,0);h=g-1;var m=
1;for(this[e+h]=d&255;0<=--h&&(m*=256);)this[e+h]=d/m&255;return e+g};m.prototype.writeUInt8=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,1,255,0);this[e]=d&255;return e+1};m.prototype.writeUInt16LE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,2,65535,0);this[e]=d&255;this[e+1]=d>>>8;return e+2};m.prototype.writeUInt16BE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,2,65535,0);this[e]=d>>>8;this[e+1]=d&255;return e+2};m.prototype.writeUInt32LE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,4,4294967295,0);this[e+
3]=d>>>24;this[e+2]=d>>>16;this[e+1]=d>>>8;this[e]=d&255;return e+4};m.prototype.writeUInt32BE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,4,4294967295,0);this[e]=d>>>24;this[e+1]=d>>>16;this[e+2]=d>>>8;this[e+3]=d&255;return e+4};m.prototype.writeIntLE=function(d,e,g,h){d=+d;e>>>=0;h||(h=Math.pow(2,8*g-1),ma(this,d,e,g,h-1,-h));h=0;var m=1,k=0;for(this[e]=d&255;++h<g&&(m*=256);)0>d&&0===k&&0!==this[e+h-1]&&(k=1),this[e+h]=(d/m>>0)-k&255;return e+g};m.prototype.writeIntBE=function(d,e,g,h){d=+d;e>>>=
0;h||(h=Math.pow(2,8*g-1),ma(this,d,e,g,h-1,-h));h=g-1;var m=1,k=0;for(this[e+h]=d&255;0<=--h&&(m*=256);)0>d&&0===k&&0!==this[e+h+1]&&(k=1),this[e+h]=(d/m>>0)-k&255;return e+g};m.prototype.writeInt8=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,1,127,-128);0>d&&(d=255+d+1);this[e]=d&255;return e+1};m.prototype.writeInt16LE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,2,32767,-32768);this[e]=d&255;this[e+1]=d>>>8;return e+2};m.prototype.writeInt16BE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,2,32767,-32768);
this[e]=d>>>8;this[e+1]=d&255;return e+2};m.prototype.writeInt32LE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,4,2147483647,-2147483648);this[e]=d&255;this[e+1]=d>>>8;this[e+2]=d>>>16;this[e+3]=d>>>24;return e+4};m.prototype.writeInt32BE=function(d,e,g){d=+d;e>>>=0;g||ma(this,d,e,4,2147483647,-2147483648);0>d&&(d=4294967295+d+1);this[e]=d>>>24;this[e+1]=d>>>16;this[e+2]=d>>>8;this[e+3]=d&255;return e+4};m.prototype.writeFloatLE=function(d,e,g){return Lb(this,d,e,!0,g)};m.prototype.writeFloatBE=function(d,
e,g){return Lb(this,d,e,!1,g)};m.prototype.writeDoubleLE=function(d,e,g){return dc(this,d,e,!0,g)};m.prototype.writeDoubleBE=function(d,e,g){return dc(this,d,e,!1,g)};m.prototype.copy=function(d,e,g,h){if(!m.isBuffer(d))throw new TypeError("argument should be a Buffer");g||(g=0);h||0===h||(h=this.length);e>=d.length&&(e=d.length);e||(e=0);0<h&&h<g&&(h=g);if(h===g||0===d.length||0===this.length)return 0;if(0>e)throw new RangeError("targetStart out of bounds");if(0>g||g>=this.length)throw new RangeError("Index out of range");
if(0>h)throw new RangeError("sourceEnd out of bounds");h>this.length&&(h=this.length);d.length-e<h-g&&(h=d.length-e+g);var k=h-g;if(this===d&&"function"===typeof Uint8Array.prototype.copyWithin)this.copyWithin(e,g,h);else if(this===d&&g<e&&e<h)for(h=k-1;0<=h;--h)d[h+e]=this[h+g];else Uint8Array.prototype.set.call(d,this.subarray(g,h),e);return k};m.prototype.fill=function(d,e,g,h){if("string"===typeof d){"string"===typeof e?(h=e,e=0,g=this.length):"string"===typeof g&&(h=g,g=this.length);if(void 0!==
h&&"string"!==typeof h)throw new TypeError("encoding must be a string");if("string"===typeof h&&!m.isEncoding(h))throw new TypeError("Unknown encoding: "+h);if(1===d.length){var k=d.charCodeAt(0);if("utf8"===h&&128>k||"latin1"===h)d=k}}else"number"===typeof d&&(d&=255);if(0>e||this.length<e||this.length<g)throw new RangeError("Out of range index");if(g<=e)return this;e>>>=0;g=void 0===g?this.length:g>>>0;d||(d=0);if("number"===typeof d)for(h=e;h<g;++h)this[h]=d;else{k=m.isBuffer(d)?d:m.from(d,h);
var v=k.length;if(0===v)throw new TypeError('The value "'+d+'" is invalid for argument "value"');for(h=0;h<g-e;++h)this[h+e]=k[h%v]}return this};var Cc=/[^+/0-9A-Za-z-_]/g}).call(this,k("buffer").Buffer)},{"base64-js":3,buffer:5,ieee754:6}],6:[function(k,F,u){u.read=function(m,k,u,K,F){var G=8*F-K-1;var T=(1<<G)-1,v=T>>1,W=-7;F=u?F-1:0;var R=u?-1:1,U=m[k+F];F+=R;u=U&(1<<-W)-1;U>>=-W;for(W+=G;0<W;u=256*u+m[k+F],F+=R,W-=8);G=u&(1<<-W)-1;u>>=-W;for(W+=K;0<W;G=256*G+m[k+F],F+=R,W-=8);if(0===u)u=1-v;else{if(u===
T)return G?NaN:Infinity*(U?-1:1);G+=Math.pow(2,K);u-=v}return(U?-1:1)*G*Math.pow(2,u-K)};u.write=function(m,k,u,F,T,H){var G,v=8*H-T-1,K=(1<<v)-1,R=K>>1,U=23===T?Math.pow(2,-24)-Math.pow(2,-77):0;H=F?0:H-1;var fa=F?1:-1,Ba=0>k||0===k&&0>1/k?1:0;k=Math.abs(k);isNaN(k)||Infinity===k?(k=isNaN(k)?1:0,F=K):(F=Math.floor(Math.log(k)/Math.LN2),1>k*(G=Math.pow(2,-F))&&(F--,G*=2),k=1<=F+R?k+U/G:k+U*Math.pow(2,1-R),2<=k*G&&(F++,G/=2),F+R>=K?(k=0,F=K):1<=F+R?(k=(k*G-1)*Math.pow(2,T),F+=R):(k=k*Math.pow(2,R-
1)*Math.pow(2,T),F=0));for(;8<=T;m[u+H]=k&255,H+=fa,k/=256,T-=8);F=F<<T|k;for(v+=T;0<v;m[u+H]=F&255,H+=fa,F/=256,v-=8);m[u+H-fa]|=128*Ba}},{}],7:[function(k,F,u){u.endianness=function(){return"LE"};u.hostname=function(){return"undefined"!==typeof location?location.hostname:""};u.loadavg=function(){return[]};u.uptime=function(){return 0};u.freemem=function(){return Number.MAX_VALUE};u.totalmem=function(){return Number.MAX_VALUE};u.cpus=function(){return[]};u.type=function(){return"Browser"};u.release=
function(){return"undefined"!==typeof navigator?navigator.appVersion:""};u.networkInterfaces=u.getNetworkInterfaces=function(){return{}};u.arch=function(){return"javascript"};u.platform=function(){return"browser"};u.tmpdir=u.tmpDir=function(){return"/tmp"};u.EOL="\n";u.homedir=function(){return"/"}},{}],8:[function(k,F,u){function m(){throw Error("setTimeout has not been defined");}function G(){throw Error("clearTimeout has not been defined");}function R(k){if(W===setTimeout)return setTimeout(k,0);
if((W===m||!W)&&setTimeout)return W=setTimeout,setTimeout(k,0);try{return W(k,0)}catch(ma){try{return W.call(null,k,0)}catch(eb){return W.call(this,k,0)}}}function K(k){if(Ea===clearTimeout)return clearTimeout(k);if((Ea===G||!Ea)&&clearTimeout)return Ea=clearTimeout,clearTimeout(k);try{return Ea(k)}catch(ma){try{return Ea.call(null,k)}catch(eb){return Ea.call(this,k)}}}function T(){fa&&Ba&&(fa=!1,Ba.length?U=Ba.concat(U):Ma=-1,U.length&&H())}function H(){if(!fa){var k=R(T);fa=!0;for(var m=U.length;m;){Ba=
U;for(U=[];++Ma<m;)Ba&&Ba[Ma].run();Ma=-1;m=U.length}Ba=null;fa=!1;K(k)}}function Aa(k,m){this.fun=k;this.array=m}function v(){}k=F.exports={};try{var W="function"===typeof setTimeout?setTimeout:m}catch(ba){W=m}try{var Ea="function"===typeof clearTimeout?clearTimeout:G}catch(ba){Ea=G}var U=[],fa=!1,Ba,Ma=-1;k.nextTick=function(k){var m=Array(arguments.length-1);if(1<arguments.length)for(var u=1;u<arguments.length;u++)m[u-1]=arguments[u];U.push(new Aa(k,m));1!==U.length||fa||R(H)};Aa.prototype.run=
function(){this.fun.apply(null,this.array)};k.title="browser";k.browser=!0;k.env={};k.argv=[];k.version="";k.versions={};k.on=v;k.addListener=v;k.once=v;k.off=v;k.removeListener=v;k.removeAllListeners=v;k.emit=v;k.prependListener=v;k.prependOnceListener=v;k.listeners=function(k){return[]};k.binding=function(k){throw Error("process.binding is not supported");};k.cwd=function(){return"/"};k.chdir=function(k){throw Error("process.chdir is not supported");};k.umask=function(){return 0}},{}]},{},[2])(2)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
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

},{"../cons/cons":15,"../list/list":38}],7:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/equal":16,"../cons/pair":20,"../list/every":31,"./get":8}],8:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/equal":16,"../cons/isempty":17}],9:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../list/map":39}],10:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17,"../cons/pair":20}],11:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"./get":8}],12:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = Symbol("Cons");

},{}],13:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the car of a cons
 * @param  {Cons} cons cons to be car'd
 * @return {*}      car value of the given cons
 */
exports["default"] = (function (cons) { return cons(0); });

},{}],14:[function(require,module,exports){
"use strict";
/// <reference path="../cons.d.ts" />
exports.__esModule = true;
/**
 * Returns the cdr of a cons
 * @param  {Cons} cons cons to be cdr'd
 * @return {*}      cdr value of the given cons
 */
exports["default"] = (function (cons) { return cons(1); });

},{}],15:[function(require,module,exports){
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

},{"./ConsType":12}],16:[function(require,module,exports){
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

},{"./car":13,"./cdr":14,"./pair":20}],17:[function(require,module,exports){
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

},{"./nil":19}],18:[function(require,module,exports){
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

},{"../fun/compose":24,"./car":13,"./cdr":14,"./cons":15,"./equal":16,"./isempty":17,"./nil":19,"./pair":20,"./print":21}],19:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports["default"] = null;

},{}],20:[function(require,module,exports){
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

},{"./ConsType":12}],21:[function(require,module,exports){
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

},{"./car":13,"./cdr":14,"./isempty":17,"./pair":20}],22:[function(require,module,exports){
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

},{"../helpers/args":26,"../list/list":38,"./apply":23}],23:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],24:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Compose functions a and b
 * @param  {Function} a Outer function
 * @param  {Function} b Inner function
 * @return {Function}   Composed function
 */
exports["default"] = (function (a, b) { return function (c) { return a(b(c)); }; });

},{}],25:[function(require,module,exports){
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

},{"../cons/cons":15,"../cons/nil":19,"./apply":23}],26:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Given an array-like, returns a real array.
 * @param  {Array-like} args
 * @return {Arrau}
 */
exports["default"] = (function (args) { return Array.prototype.slice.call(args); });

},{}],27:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17}],28:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/equal":16,"../cons/isempty":17}],29:[function(require,module,exports){
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

},{"../cons/cdr":14,"../cons/isempty":17}],30:[function(require,module,exports){
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

},{"../cons/cons":15}],31:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],32:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],33:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/pair":20,"./concat":27}],34:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],35:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],36:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],37:[function(require,module,exports){
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

},{"./foldl":34}],38:[function(require,module,exports){
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

},{"../cons/cons":15,"../cons/nil":19,"../helpers/args":26}],39:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],40:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],41:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],42:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],43:[function(require,module,exports){
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

},{"../cons/cons":15,"../cons/nil":19}],44:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],45:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19,"./length":37}],46:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17}],47:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19,"./length":37}],48:[function(require,module,exports){
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

},{"../cons/car":13,"../cons/cdr":14,"../cons/cons":15,"../cons/isempty":17,"../cons/nil":19}],49:[function(require,module,exports){
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

},{"./alist/alist":6,"./alist/equal":7,"./alist/get":8,"./alist/map":9,"./alist/print":10,"./alist/put":11,"./cons/main":18,"./fun/Y":22,"./fun/apply":23,"./fun/compose":24,"./fun/curry":25,"./helpers/args":26,"./list/concat":27,"./list/contains":28,"./list/dequeue":29,"./list/enqueue":30,"./list/every":31,"./list/filter":32,"./list/flatten":33,"./list/foldl":34,"./list/foldr":35,"./list/get":36,"./list/length":37,"./list/list":38,"./list/map":39,"./list/peek":40,"./list/pop":41,"./list/push":42,"./list/range":43,"./list/reverse":44,"./list/slice":45,"./list/some":46,"./list/sort":47,"./list/zip":48,"./trie/getTrie":50,"./trie/putTrie":51}],50:[function(require,module,exports){
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

},{"../alist/get":8,"../alist/map":9,"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17,"../cons/nil":19,"../list/flatten":33}],51:[function(require,module,exports){
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

},{"../alist/alist":6,"../alist/get":8,"../alist/put":11,"../cons/car":13,"../cons/cdr":14,"../cons/isempty":17,"../cons/nil":19,"../cons/print":21,"../list/concat":27,"../list/list":38,"../list/push":42}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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
},{"asciify":53}],55:[function(require,module,exports){
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
