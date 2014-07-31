var boltzmann = boltzmann || {};
boltzmann = (function (module) {
    module.drawing = (function () {
        var drawing = {};
        var boltzcanvas = module.boltzcanvas;
        var vectorcanvas = module.vectorcanvas;
        var particlecanvas = module.particlecanvas;
        var barriercanvas = module.barriercanvas;
        var boltzctx;
        var vectorctx;
        var particlectx;
        var barrierctx;
        var px_per_node = module.px_per_node;
        var lattice = module.lattice;
        var particles = module.flow_particles;
        var lattice_width = module.lattice_width;
        var lattice_height = module.lattice_height;
        var canvas_width = boltzcanvas.width;
        var canvas_height = boltzcanvas.height;
        var image;
        var image_data;
        var image_width;
        var color_array = [];
        var num_colors = 400;

        (function() {
            // Initialize
            if (boltzcanvas.getContext) {
                module.boltzctx = boltzcanvas.getContext('2d');
                module.vectorctx = vectorcanvas.getContext('2d');
                module.particlectx = particlecanvas.getContext('2d');
                module.barrierctx = barriercanvas.getContext('2d');
                boltzctx = module.boltzctx;
                vectorctx = module.vectorctx;
                particlectx = module.particlectx;
                barrierctx = module.barrierctx;
                vectorctx.strokeStyle = "red";
                vectorctx.fillStyle = "red";
                particlectx.strokeStyle = "black";
                particlectx.fillStyle = "black";
                barrierctx.fillStyle = "yellow";
                image = boltzctx.createImageData(canvas_width, canvas_height);
                image_data = image.data;
                image_width = image.width;
                // Pre-compute color array
                compute_color_array(num_colors);

            } else {
                console.log("This browser does not support canvas");
                // ABORT!
            }
        })();

        /**
         * Convert HSL to RGB
         * @param {number} h Hue
         * @param {number} s Saturation
         * @param {number} l Luminance
         * @return {Object} RGBa color object
         */
        function hslToRgb(h, s, l){
            var r, g, b;

            if(s == 0){
                r = g = b = l;
            } else {
                /**
                 * Convert hue RGB
                 * @param {number} p Hue
                 * @param {number} q Saturation
                 * @param {number} t Luminance
                 * @return {number} RGBa color object
                 */
                function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255), a:255};
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
            var right_span = 1;
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
        function compute_color_array(n){
            for (var i = 0; i < n; i++){
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
            for (var ypx = y * px_per_node; ypx < (y+1) * px_per_node; ypx++) {
                for (var xpx = x * px_per_node; xpx < (x + 1) * px_per_node; xpx++) {
                    var index = (xpx + ypx * image.width) * 4;
                    image.data[index+0] = color.r;
                    image.data[index+1] = color.g;
                    image.data[index+2] = color.b;
                    image.data[index+3] = color.a;
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
        function draw_flow_particle(x,y) {
            particlectx.beginPath();
            particlectx.arc(x * px_per_node, y * px_per_node, 1, 0, 2 * Math.PI, false);
            particlectx.fill();
            particlectx.closePath();
        }

        /**
         * Draw barriers.
         */
        function draw_barriers() {
            for (var x = 0; x < lattice_width; x++) {
                for (var y = 0; y < lattice_height; y++) {
                    if (lattice[x][y].barrier) {
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
        drawing.draw = function() {
            var draw_mode = module.draw_mode;
            if (module.flow_vectors) {
                vectorctx.clearRect(0, 0, canvas_width, canvas_height);
            }
            if (particles.length > 0) {
                particlectx.clearRect(0, 0, canvas_width, canvas_height);
                for (var x = 0, l=particles.length; x < l; x++) {
                    draw_flow_particle(particles[x].x, particles[x].y, particlectx);
                }
            }
            if (module.new_barrier) {
                barrierctx.clearRect(0, 0, canvas_width, canvas_height);
                draw_barriers(barrierctx);
                module.new_barrier = false;
            }
            for (var x = 0; x < lattice_width; x++) {
                for (var y = 0; y < lattice_height; y++) {
                    if (!lattice[x][y].barrier) {
                        var color = {'r': 0, 'g': 0, 'b': 0, 'a': 0};
                        var color_index = 0;
                        var ux = lattice[x][y].ux;
                        var uy = lattice[x][y].uy;
                        if (module.flow_vectors && x % 10 === 0 && y % 10 ===0) {
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
                            var xvel = ux;
                            color_index = parseInt((xvel + 0.21052631578) * num_colors);
                        } else if (draw_mode == 2) {
                            // Y Velocity
                            var yvel = uy;
                            color_index = parseInt((yvel + 0.21052631578) * num_colors);
                        } else if (draw_mode == 3) {
                            // Density
                            var dens = lattice[x][y].density;
                            color_index = parseInt((dens - 0.75) * num_colors);
                        } else if (draw_mode == 4) {
                            // Curl
                            var curl = lattice[x][y].curl;
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
                        for (var ypx = y * px_per_node; ypx < (y+1) * px_per_node; ypx++) {
                            for (var xpx = x * px_per_node; xpx < (x + 1) * px_per_node; xpx++) {
                                var index = (xpx + ypx * image_width) * 4;
                                image_data[index+0] = color.r;
                                image_data[index+1] = color.g;
                                image_data[index+2] = color.b;
                                image_data[index+3] = color.a;
                            }
                        }
                    }
                }
            }
            boltzctx.putImageData(image, 0, 0);
        };
        /**
         * Clear canvas.
         */
        drawing.clear = function() {
            image = boltzctx.createImageData(canvas_width, canvas_height);
            image_data = image.data;
            image_width = image.width;
            vectorctx.clearRect(0, 0, canvas_width, canvas_height);
            particlectx.clearRect(0, 0, canvas_width, canvas_height);
            boltzctx.clearRect(0, 0, canvas_width, canvas_height);
            // Clear barrier canvas, but redraw in case barriers are still present
            barrierctx.clearRect(0, 0, canvas_width, canvas_height);
            draw_barriers();
            module.new_barrier = false;
        };
        return drawing;
    })();
    return module;
})(boltzmann);