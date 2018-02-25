var math = require('linearalgea');
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
