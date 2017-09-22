/**
* Author: Anthony Cohn-Richardby
* Info: Marble with physics and collision
**/
/*requires glex.js, cube.js*/

var Marble = function(position) {
	this.width = 0.5;
	this.height = 0.5;
	this.depth = 0.5;
	this.scalefactor = this.radius/2;
	this.mass 	= 0.02; //0.020kg /20g
	//x, y position on the surface of the board.
	this.position = vec2.create(position);
	this.velocity = [0.0, 0.0];
	this.lastPosition = vec2.create(this.position);
	this.lastUpdateTime = 0;
}
Marble.prototype.getPosition = function () {
	return this.position;
}
Marble.prototype.getPositionX = function () {
	return this.position[0];
}
Marble.prototype.getPositionY = function () {
	return this.position[1];
}
Marble.prototype.displace = function(displacement) {
	vec2.add(this.position, displacement, this.position);
}
Marble.prototype.setPosition = function(vec) {
	this.position = vec3.create(vec);
}
Marble.prototype.setPositionX = function(val) {
	this.position[0] = val;
}
Marble.prototype.setPositionY = function(val) {
	this.position[1] = val;
}
Marble.prototype.getCellX = function() {
	return Math.floor(this.position[0]+this.width/2); ///it's center
}
Marble.prototype.getCellY = function() {
	return Math.floor(this.position[1]+this.height/2);
}
Marble.prototype.getWidth = function() {
	return this.width;
}
Marble.prototype.getHeight = function() {
	return this.height;
}
Marble.prototype.getDepth = function() {
	//actually height, but since all the game logic is 2d i've used width/height for x, z.
	return this.depth;
}

Marble.copy = function(position) {
	return new Marble([position[0], position[1]]);
}