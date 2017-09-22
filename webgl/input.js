/*author: Anthony Cohn-Richardby
* info	: WebGL puzzle game, input stuff
*/

var Input = function() {
	//Arrow keys
	this.left 	= false;
	this.right 	= false;
	this.up		= false;
	this.down	= false;
	
	this.trackMouse = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.mouseDX = 0;
	this.mouseDY = 0;
	//Ev listeners
	document.addEventListener('keydown', function(e) {
		//Set key to true
		this.setKey(e, true);
	}.bind(this)); 
	document.addEventListener('keyup', function(e) {
		this.setKey(e, false);
	}.bind(this));
	document.addEventListener('mousedown', function(e) {
		this.trackMouse = true;
	}.bind(this));
	document.addEventListener('mouseup', function(e) {
		this.trackMouse = false;
	}.bind(this));
	document.addEventListener('mousemove', this.trackMouseEvent.bind(this));
}

//Set the appropriate key
Input.prototype.setKey = function(e, value){
	var which = e.which;
	switch(which){
		//Ignore backspace and space
		case 8:
		case 32:
			e.preventDefault();
			break;
		//Left
		case 37:
			this.left = value;
			break;
		//Up
		case 38:
			this.up = value;
			break;
		//Right
		case 39:
			this.right = value;
			break;
		//Down
		case 40:
			this.down = value;
			break;
	}
}

Input.prototype.trackMouseEvent = function(e) {
	//Only update dx/dy if mouse is clicked
	if(this.trackMouse == true) {
		if(this.lastMouseX == null || this.lastMouseY == null) {
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;
		}
		this.mouseDX += e.clientX - this.lastMouseX;
		this.mouseDY += e.clientY - this.lastMouseY;
	}
	//Always update the last position
	this.lastMouseX = e.clientX;
	this.lastMouseY = e.clientY;
}
Input.prototype.getMouseDX = function() {
	//Resets on check
	var tempMouseDX = this.mouseDX;
	this.mouseDX = 0;
	return tempMouseDX;
}
Input.prototype.getMouseDY = function() {
	//Resets on check
	var tempMouseDY = this.mouseDY;
	this.mouseDY = 0;
	return tempMouseDY;
}