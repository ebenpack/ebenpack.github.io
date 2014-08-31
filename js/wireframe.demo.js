(function () {
    var Mesh = wireframe.geometry.Mesh;
    var Face = wireframe.geometry.Face;

    var Scene = wireframe.engine.Scene;
    var Camera = wireframe.engine.Camera;

    var cubejson = {
        "name": "cube",
        "vertices": [
            [-40, -40,  40],
            [-40, -40, -40],
            [ 40, -40, -40],
            [ 40, -40,  40],
            [-40,  40,  40],
            [-40,  40, -40],
            [ 40,  40, -40],
            [ 40,  40,  40]
        ],
        "faces": [
            {"face": [1, 2, 0], "color": "red"},
            {"face": [2, 3, 0], "color": "red"},
            {"face": [7, 6, 4], "color": "red"},
            {"face": [6, 5, 4], "color": "red"},
            {"face": [4, 5, 0], "color": "red"},
            {"face": [5, 1, 0], "color": "red"},
            {"face": [5, 6, 1], "color": "red"},
            {"face": [6, 2, 1], "color": "red"},
            {"face": [6, 7, 2], "color": "red"},
            {"face": [7, 3, 2], "color": "red"},
            {"face": [0, 3, 4], "color": "red"},
            {"face": [3, 7, 4], "color": "red"}
        ]
    };

    var icosjson = {
        "name": "ico",
        "vertices": [
            [0,-69.03285,0],
            [-49.9527, -30.872850000000003, -36.29235],
            [19.07985, -30.872850000000003, -58.722750000000005],
            [61.7448, -30.8726, 0],
            [19.07985, -30.872850000000003, 58.722750000000005],
            [-49.9527, -30.872850000000003, 36.29235],
            [-19.07985, 30.872850000000003, -58.722750000000005],
            [49.9527, 30.872850000000003, -36.29235],
            [49.9527, 30.872850000000003, 36.29235],
            [-19.07985, 30.872850000000003, 58.722750000000005],
            [-61.7448, 30.8726, 0],
            [0, 69.03285, 0],
            [11.21475, -58.723099999999995, -34.5161],
            [-29.36125, -58.723099999999995, -21.33195],
            [-18.1466, -36.2932, -55.8484],
            [-58.72265, -36.29305, 0],
            [-29.36125, -58.723099999999995, 21.33195],
            [36.29265, -58.72295, 0],
            [47.5077, -36.2931, -34.516200000000005],
            [11.21475, -58.723099999999995, 34.5161],
            [47.5077, -36.2931, 34.516200000000005],
            [-18.1466, -36.2932, 55.8484],
            [-65.65425, 0, -21.33205],
            [-65.65425, 0, 21.33205],
            [0, 0, -69.03285],
            [-40.57655, 0, -55.84875],
            [65.65425, 0, -21.33205],
            [40.57655, 0, -55.84875],
            [40.57655, 0, 55.84875],
            [65.65425, 0, 21.33205],
            [-40.57655, 0, 55.84875],
            [0, 0, 69.03285],
            [-47.5077, 36.2931, -34.516200000000005],
            [18.1466, 36.2932, -55.8484],
            [58.72265, 36.29305, 0],
            [18.1466, 36.2932, 55.8484],
            [-47.5077, 36.2931, 34.516200000000005],
            [-11.21475, 58.723099999999995, -34.5161],
            [-36.29265, 58.72295, 0],
            [29.36125, 58.723099999999995, -21.33195],
            [29.36125, 58.723099999999995, 21.33195],
            [-11.21475,58.723099999999995,34.5161]
        ],
        "faces": [
            {"face": [13, 12,  0], "color": "red"},
            {"face": [13, 15,  1], "color": "red"},
            {"face": [12, 17,  0], "color": "red"},
            {"face": [17, 19,  0], "color": "red"},
            {"face": [19, 16,  0], "color": "red"},
            {"face": [15, 22,  1], "color": "red"},
            {"face": [14, 24,  2], "color": "red"},
            {"face": [18, 26,  3], "color": "red"},
            {"face": [20, 28,  4], "color": "red"},
            {"face": [21, 30,  5], "color": "red"},
            {"face": [22, 25,  1], "color": "red"},
            {"face": [24, 27,  2], "color": "red"},
            {"face": [26, 29,  3], "color": "red"},
            {"face": [28, 31,  4], "color": "red"},
            {"face": [30, 23,  5], "color": "red"},
            {"face": [32, 37,  6], "color": "red"},
            {"face": [33, 39,  7], "color": "red"},
            {"face": [34, 40,  8], "color": "red"},
            {"face": [35, 41,  9], "color": "red"},
            {"face": [36, 38, 10], "color": "red"},
            {"face": [14,  2, 12], "color": "red"},
            {"face": [13, 14, 12], "color": "red"},
            {"face": [ 1, 14, 13], "color": "red"},
            {"face": [16,  5, 15], "color": "red"},
            {"face": [13, 16, 15], "color": "red"},
            {"face": [ 0, 16, 13], "color": "red"},
            {"face": [18,  3, 17], "color": "red"},
            {"face": [12, 18, 17], "color": "red"},
            {"face": [ 2, 18, 12], "color": "red"},
            {"face": [20,  4, 19], "color": "red"},
            {"face": [17, 20, 19], "color": "red"},
            {"face": [ 3, 20, 17], "color": "red"},
            {"face": [21,  5, 16], "color": "red"},
            {"face": [19, 21, 16], "color": "red"},
            {"face": [ 4, 21, 19], "color": "red"},
            {"face": [23, 10, 22], "color": "red"},
            {"face": [15, 23, 22], "color": "red"},
            {"face": [ 5, 23, 15], "color": "red"},
            {"face": [25,  6, 24], "color": "red"},
            {"face": [14, 25, 24], "color": "red"},
            {"face": [ 1, 25, 14], "color": "red"},
            {"face": [27,  7, 26], "color": "red"},
            {"face": [18, 27, 26], "color": "red"},
            {"face": [ 2, 27, 18], "color": "red"},
            {"face": [29,  8, 28], "color": "red"},
            {"face": [20, 29, 28], "color": "red"},
            {"face": [ 3, 29, 20], "color": "red"},
            {"face": [31,  9, 30], "color": "red"},
            {"face": [21, 31, 30], "color": "red"},
            {"face": [ 4, 31, 21], "color": "red"},
            {"face": [32,  6, 25], "color": "red"},
            {"face": [22, 32, 25], "color": "red"},
            {"face": [10, 32, 22], "color": "red"},
            {"face": [33,  7, 27], "color": "red"},
            {"face": [24, 33, 27], "color": "red"},
            {"face": [ 6, 33, 24], "color": "red"},
            {"face": [34,  8, 29], "color": "red"},
            {"face": [26, 34, 29], "color": "red"},
            {"face": [ 7, 34, 26], "color": "red"},
            {"face": [35,  9, 31], "color": "red"},
            {"face": [28, 35, 31], "color": "red"},
            {"face": [ 8, 35, 28], "color": "red"},
            {"face": [36, 10, 23], "color": "red"},
            {"face": [30, 36, 23], "color": "red"},
            {"face": [ 9, 36, 30], "color": "red"},
            {"face": [38, 11, 37], "color": "red"},
            {"face": [32, 38, 37], "color": "red"},
            {"face": [10, 38, 32], "color": "red"},
            {"face": [37, 11, 39], "color": "red"},
            {"face": [33, 37, 39], "color": "red"},
            {"face": [ 6, 37, 33], "color": "red"},
            {"face": [39, 11, 40], "color": "red"},
            {"face": [34, 39, 40], "color": "red"},
            {"face": [ 7, 39, 34], "color": "red"},
            {"face": [40, 11, 41], "color": "red"},
            {"face": [35, 40, 41], "color": "red"},
            {"face": [ 8, 40, 35], "color": "red"},
            {"face": [41, 11, 38], "color": "red"},
            {"face": [36, 41, 38], "color": "red"},
            {"face": [ 9, 41, 36], "color": "red"}
         ]
    }

    var icos = Mesh.fromJSON(icosjson);
    var cube = Mesh.fromJSON(cubejson);

    function rotateMesh(){
        if (scene.isKeyDown('h')) {
            icos.rotation.yaw -= 0.03;
        }
        if (scene.isKeyDown('j')) {
            icos.rotation.pitch -= 0.03;
        }
        if (scene.isKeyDown('l')) {
            icos.rotation.yaw += 0.03;
        }
        if (scene.isKeyDown('k')) {
            icos.rotation.pitch += 0.03;
        }
        if (scene.isKeyDown('u')) {
            icos.rotation.roll += 0.03;
        }
        if (scene.isKeyDown('i')) {
            icos.rotation.roll -= 0.03;
        }
    }
    function moveCamera(E, H){
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
        scene._needs_update = true;
    }

    var scene = new Scene({canvas_id: 'wireframe', width:600, height:400});
    scene.addListener('keydown', rotateMesh);
    scene.addListener('keydown', moveCamera);
    scene.addListener('mousedrag', function(e){
        var mouse = e.mouse;
        scene.camera.move(mouse.deltax, mouse.deltay, 0);
        scene._needs_update = true;
    });

    cube.position.x = 200
    scene.camera.moveTo(0, 0, 400);
    scene.addMesh(icos);
    scene.addMesh(cube);
    scene.renderScene();

    document.getElementById("toggledraw").addEventListener('click', function(){
        scene.toggleDrawMode();
    });
    document.getElementById("togglebfcull").addEventListener('click', function(){
        scene.toggleBackfaceCulling();
    });
    document.getElementById("toggleqdraw").addEventListener('click', function(){
        scene.toggleQuickDraw();
    });
})();
