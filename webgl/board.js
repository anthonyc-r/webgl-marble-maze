/*
* Author:Anthony Cohn-Richardby
* Info: Object representing the puzzle board
*/
/*
* Requires glex.js, shapes.js, marble.js
*/
/**
*
* ==========CELL==========
*
**/
var Cell = function() {	
	this.walls = [];
	
	this.content = null;
}
/**
* CONSTANTS
**/
//MUST BE 0-3 IN THIS ORDER - CRITICAL
Cell.POS_X = 0;
Cell.POS_Y = 1;
Cell.NEG_X = 2;
Cell.NEG_Y = 3;

Cell.GOAL = 4;

/**
* ==============================
* ==========BOARD==========
* ==============================
**/
var Board = function(gl, glex, width, height) {
	this.width = width;
	this.height = height;
	this.cells = [];
	this.matrix = mat4.create();
	mat4.identity(this.matrix);
	this.goal = [];
	this.xRotation = 0;
	this.zRotation = 0;
	this.vertexBuffer = null;
	this.normalBuffer = null;
	this.initBoard();
	this.initBoardGeometry(gl, glex);
	//graphics stuff
	this.cube = new Cube(gl);
	this.marble = new Marble([0.25, 0.25]); //TODO not robust...
}
Board.prototype.newLevel = function(gl, glex, width, height) {
	this.width = width;
	this.height = height;
	this.cells = [];
	this.matrix = mat4.create();
	mat4.identity(this.matrix);
	this.goal = [];
	this.xRotation = 0;
	this.zRotation = 0;
	this.vertexBuffer = null;
	this.normalBuffer = null;
	this.initBoard();
	this.initBoardGeometry(gl, glex);
	//graphics stuff
	this.cube = new Cube(gl);
	this.marble = new Marble([0.25, 0.25]); //TODO not robust...
}
Board.prototype.update = function(fps) {
	//x and y position upon the board changes based upon normal
	var normal = this.getPlane().normal;
	var speed = 0.2/fps;

	this.marble.velocity[0] += speed*normal[0];
	this.marble.velocity[1] += speed*normal[2];
	var velocity = this.marble.velocity;
	//console.log(marble.velocity);
	//construct potential new marble
	var marble = this.marble;
	var marbleOldPosition = [marble.position[0], marble.position[1]];
	var potentialMarble = new Marble([marble.getPositionX(), marble.getPositionY()]);
	potentialMarble.displace(velocity);
	
	/**
	PERFORM COLLISION Check
	**/
	//get an array of all walls that it could possibly collide with, 12 in total (possible further narrowing can be easily done TODO)
	var wallcheck = [];
	var cellX = potentialMarble.getCellX();
	var cellY = potentialMarble.getCellY();
	
	var incell = this.cells[cellX][cellY];
	
	var posxPosy = this.cells[cellX+1] && this.cells[cellX+1][cellY+1]? this.cells[cellX+1][cellY+1] : null;
	var posxNegy = this.cells[cellX+1] && this.cells[cellX+1][cellY-1]? this.cells[cellX+1][cellY-1] : null;
	var negxPosy = this.cells[cellX-1] && this.cells[cellX-1][cellY+1]? this.cells[cellX-1][cellY+1] : null;
	var negxNegy = this.cells[cellX-1] && this.cells[cellX-1][cellY-1]? this.cells[cellX-1][cellY-1] : null;
	
	//4 inner walls
	if(topush = incell.walls[Cell.POS_X])
		wallcheck.push(topush);
	if(topush = incell.walls[Cell.POS_Y])	
		wallcheck.push(topush);
	if(topush = incell.walls[Cell.NEG_X])
		wallcheck.push(topush);
	if(topush = incell.walls[Cell.NEG_Y])
		wallcheck.push(topush);
	//two walls from each of the 4 diagonal cells
	if(posxPosy) {
		if(topush = posxPosy.walls[Cell.NEG_X])
			wallcheck.push(topush);
		if(topush = posxPosy.walls[Cell.NEG_Y])
			wallcheck.push(topush);
	}
	if(posxNegy) {
		if(topush = posxNegy.walls[Cell.NEG_X])
			wallcheck.push(topush);
		if(topush = posxNegy.walls[Cell.POS_Y])
			wallcheck.push(topush);
	}
	if(negxPosy) {
		if(topush = negxPosy.walls[Cell.POS_X])
			wallcheck.push(topush);
		if(topush = negxPosy.walls[Cell.NEG_Y])
			wallcheck.push(topush);
	}
	if(negxNegy) {
		if(topush = negxNegy.walls[Cell.POS_X])
			wallcheck.push(topush);
		if(topush = negxNegy.walls[Cell.POS_Y])
			wallcheck.push(topush);
	}
	
	//check collisions
	var marbleX = potentialMarble.getPositionX();
	var marbleY = potentialMarble.getPositionY();
	var marbleWidth = potentialMarble.getWidth();
	var marbleHeight = potentialMarble.getHeight();
	

	var component = Board.NO_COMPONENT;
	for(var i = 0; i < wallcheck.length; ++i) {
		var wall = wallcheck[i];
		var x1 = wall.x - (marbleX+marbleWidth);
		var x2 = marbleX - (wall.x + wall.width);
		var y1 = wall.y - (marbleY+marbleHeight);
		var y2 = marbleY - (wall.y + wall.height);
		
		if(x1 < 0 && x2 < 0 && y1 < 0 && y2 < 0) {
			//Collision has occurred need to decided whether it's x or y comp
			var smallestx = Math.max(x1, x2);
			var smallesty = Math.max(y1, y2);
			
			if(smallestx > smallesty) {
				component = Board.X_COMPONENT;
			}
			else {
				component = Board.Y_COMPONENT;
			}
			//console.log("collision1");
			break;
		}
	}
	
	//update v
	if(component == Board.X_COMPONENT) {
		this.marble.velocity[0] = -0.3*this.marble.velocity[0]; //inconsistent use of get/set | unsure on the matter || fix
		this.marble.position[0] += this.marble.velocity[0];
	}
	else if(component == Board.Y_COMPONENT) {
		this.marble.velocity[1] = -0.3*this.marble.velocity[1];
		this.marble.position[1] += this.marble.velocity[1];
	}
	else if(component == Board.NO_COMPONENT) {
		//update both
		this.marble.setPosition(potentialMarble.getPosition());
	}
	else {
		//error
		console.log("error in collision detection");
	}
		
	if(this.marble.getCellX() == this.goal[0] && this.marble.getCellY() == this.goal[1]){
		if(this.winHandler){
			console.log("win");
			this.winHandler();
		}
		else{
			alert("Win");
		}
	}
}

//Changeable
Board.CELL_WIDTH = 1;
Board.CELL_HEIGHT = 1;
Board.WALL_WIDTH = 0.1;

//DO NOT CHANGE
Board.X_COMPONENT = 1;
Board.Y_COMPONENT = 2;
Board.NO_COMPONENT = 3;

Board.createWall = function(x, y, direction) {
	var wall = {};
	wall.x = Board.CELL_WIDTH*x;
	wall.y = Board.CELL_HEIGHT*y;
	
	switch(direction) {
		case Cell.POS_X:
			wall.x += Board.CELL_WIDTH;
		case Cell.NEG_X:
			wall.width = Board.WALL_WIDTH;
			wall.height = Board.CELL_HEIGHT;
			break;
			
		case Cell.POS_Y:
			wall.y += Board.CELL_HEIGHT;
		case Cell.NEG_Y:
			wall.width = Board.CELL_WIDTH;
			wall.height = Board.WALL_WIDTH;
			break;
		
		default:
			console.log("ERROR invalid direction passed to createWall")
	}
	
	return wall;
}


Board.prototype.initBoard = function(glex) {
	//Defined the goal as some random cell within x|y=halfway+-1/4width|height
	this.goal[0] = Math.floor((Math.random()*0.5*this.width - 0.25*this.width) + this.width/2);
	this.goal[1] = Math.floor((Math.random()*0.5*this.height - 0.25*this.height) + this.height/2);
	
	//console.log(this.goal);
	//Create every cell first...
	for(var i = 0; i<this.width; ++i) {
		this.cells[i] = [];
		for(var j = 0; j<this.height; ++j) {
			this.cells[i][j] = new Cell();
		}
	}

	//Set goal
	this.cells[this.goal[0], this.goal[1]].content = Cell.GOAL;

	/**
	*
	* TODO: Implement a good maze creation algorithm
	*
	**/
	//Set up walls
	//Set all outer cells to have no walls but the outermost wall
	//Set inner cells to have a random number of walls (no need for adjacent cells to point to the same Wall at this stage)
	var centre = vec2.create([this.width / 2, this.height / 2]);
	for(var i = 0; i<this.width; ++i) {
		for(var j = 0; j<this.height; ++j) {
			var currentCell = this.cells[i][j];			
			var distanceFromCentre = vec2.dist(centre, [i, j]);
			//f(distance) = number of closed walls
			//only if border wall...
			if(i == 0 || i == this.width - 1 || j == 0 || j == this.height - 1){
				//at x=0, only do wall NEG_X
				if(i == 0){
					currentCell.walls[Cell.NEG_X] = Board.createWall(i, j, Cell.NEG_X);
				}
				//at x=width only do POS_X
				else if(i == this.width - 1) {
					currentCell.walls[Cell.POS_X] = Board.createWall(i, j, Cell.POS_X);
				}
				
				//at y = 0 only do NEG_Y
				if(j == 0) {
					currentCell.walls[Cell.NEG_Y] = Board.createWall(i, j, Cell.NEG_Y);
				}
				//at y = height do POS_Y
				else if(j == this.height - 1) {
					currentCell.walls[Cell.POS_Y] = Board.createWall(i, j, Cell.POS_Y);
				}
			}
			else {
				var n = (-4.0 / Math.max(this.width, this.height)) * distanceFromCentre + 4;
				//cap var at 1
				n = Math.max(n, 1);
				//set up to n walls
				//n = Math.round(Math.random()*n);
				//n = 4-n;
				//chosen to set already (represent POS_X, POS_Y...)
				var set = [];
				for(var k = 0; k < n; ++k) {
					var toSet;
					do{
						toSet = Math.floor(Math.random()*4);
					}while(set.indexOf(toSet) != -1);
					//Set the wall
					currentCell.walls[toSet] = Board.createWall(i, j, toSet);
				}				
			}
		}
	}
	
	//Generate a path. Random walk from the goal outward (null = no Wall = path : no need to null both ways since Wall pairs will be reduced to the least meaningful)
	var currentX = this.goal[0];
	var currentY = this.goal[1];
	var direction;
	while(!(currentX == 0 || currentX == this.width-1 || currentY == 0 || currentY == this.height-1)) {
		direction = Math.floor(Math.random()*4);
		switch(direction) {
			case Cell.POS_X:
				this.cells[currentX][currentY].walls[Cell.POS_X] = null;
				++currentX;
				break;
			case Cell.POS_Y:
				this.cells[currentX][currentY].walls[Cell.POS_Y] = null;
				++currentY;
				break;
			case Cell.NEG_X:
				this.cells[currentX][currentY].walls[Cell.NEG_X] = null;
				--currentX;
				break;
			case Cell.NEG_Y:
				this.cells[currentX][currentY].walls[Cell.NEG_Y] = null;
				--currentY;
				break;
		}
	}
	
	//Pass 3
	//Set all walls to either null if one of the pair is null, or merge to ref same if not
	for(var i = 0; i<this.width; ++i) {
		for(var j = 0; j<this.height; ++j) {
			var currentCell = this.cells[i][j];
			//for each of 4 possible walls
			for(var n = 0; n<4; ++n) {
				switch(n) {
					case Cell.POS_X:
						if(i+2 > this.width)
							break;
						if(this.cells[i+1][j].walls[Cell.NEG_X] && this.cells[i][j].walls[Cell.POS_X]) {
							this.cells[i+1][j].walls[Cell.NEG_X] = this.cells[i][j].walls[Cell.POS_X];
						}
						else {
							this.cells[i+1][j].walls[Cell.NEG_X] = null;
							this.cells[i][j].walls[Cell.POS_X] = null;
						}
						break;
						
					case Cell.POS_Y:
						if(j+2 > this.height )
							break;
						if(this.cells[i][j+1].walls[Cell.NEG_Y] && this.cells[i][j].walls[Cell.POS_Y]) {
							this.cells[i][j+1].walls[Cell.NEG_Y] = this.cells[i][j].walls[Cell.POS_Y];
						}
						else {
							this.cells[i][j+1].walls[Cell.NEG_Y] = null;
							this.cells[i][j].walls[Cell.POS_Y] = null;
						}
						break;
						
					case Cell.NEG_X:
						if(i-2 < this.width)
							break;
						if(this.cells[i-1][j].walls[Cell.POS_X] && this.cells[i][j].walls[Cell.NEG_X]) {
							this.cells[i-1][j].walls[Cell.POS_X] = this.cells[i][j].walls[Cell.NEG_X];
						}
						else {
							this.cells[i-1][j].walls[Cell.POS_X] = null;
							this.cells[i][j].walls[Cell.NEG_X] = null;
						}
						break;
						
					case Cell.NEG_Y:
						if(j-2 < this.height)
							break;
						if(this.cells[i][j-1].walls[Cell.POS_Y] && this.cells[i][j].walls[Cell.NEG_Y]) {
							this.cells[i][j-1].walls[Cell.POS_Y] = this.cells[i][j].walls[Cell.NEG_Y];
						}
						else {
							this.cells[i][j-1].walls[Cell.POS_Y] = null;
							this.cells[i][j].walls[Cell.NEG_Y] = null;
						}
						break;
				}
			}
		}
	}
	//console.log("Board init");
	brd = this;
	//Should have a randomly generated maze such that Wall values are consistent
	//Between neighbours
}

Board.prototype.setWinHandler = function(fn) {
	this.winHandler = fn;
}

Board.prototype.getMatrix = function() {
	mat4.identity(this.matrix);
	mat4.rotate(this.matrix, this.xRotation, [1.0, 0.0, 0.0]);
	mat4.rotate(this.matrix, this.zRotation, [0.0, 0.0, 1.0]);
	return this.matrix;
}
Board.prototype.rotateX = function(rad) {
	this.xRotation += rad;
	//mat4.rotate(this.matrix, rad, [1.0, 0.0, 0.0]);
}
Board.prototype.rotateY = function(rad) {
	//mat4.rotate(this.matrix, rad, [0.0, 1.0, 0.0]);
}
Board.prototype.rotateZ = function(rad) {
	this.zRotation += rad;
	//mat4.rotate(this.matrix, rad, [0.0, 0.0, 1.0]);
}
Board.prototype.getXRotation = function() {
	return this.xRotation;
}
Board.prototype.getZRotation = function() {
	return this.zRotation;
}
Board.prototype.getWidth = function() {
	return this.width;
}
Board.prototype.getHeight = function() {
	return this.height;
}
/*
* plane data structure
*/
Board.prototype.getPlane = function() {
	//Assumes plane exists over x=0.0, and x= 1.0
	var p1 = [0.0, 0.0, 1.0];
	var p2 = [1.0, 0.0, 0.0];
	var n = vec3.create();

	mat4.multiplyVec3(this.matrix, p1, p1);
	mat4.multiplyVec3(this.matrix, p2, p2);

	vec3.cross(p1, p2, n);
	
	var plane = {};
	plane.point = p1;
	plane.normal = n;
	
	return plane;
}

/**
*
* ==========Graphics==========
*
**/
Board.prototype.draw = function(gl, glex, vertAttribP, normalAttribP) {
	//Board
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(vertAttribP, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.vertexAttribPointer(normalAttribP, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
	
	//Marble
	glex.disable(GLEx.LIGHTING);
	glex.color3fv(GLEx.MATERIAL, [1.0, 1.0, 1.0]);
	glex.pushMatrix();
	  //to initial position
	  glex.translate3fv([this.marble.getPositionX(), 0.0, this.marble.getPositionY()]);
	  //to size of hitbox
	  glex.scale3fv([this.marble.getWidth(), this.marble.getDepth(), this.marble.getHeight()]);
	  //to unit
	  glex.scale3fv([0.5, 0.5, 0.5]);
	  //to origin
	  glex.translate3fv([1, 1, 1]);
	  this.cube.draw(gl, glex, vertAttribP, normalAttribP);
	glex.popMatrix();
	
	//Goal
	glex.pushMatrix();
	  glex.color3fv(GLEx.MATERIAL, [1.0, 0.0, 0.0]);
	  glex.translate3fv([this.goal[0], 0.0, this.goal[1]]);
	  //Onto 0,0
	  glex.translate3fv([0.5, 0.5, 0.5]);
	  glex.scale3fv([0.25, 0.25, 0.25]);
	  this.cube.draw(gl, glex, vertAttribP, normalAttribP);
	glex.popMatrix();
	glex.enable(GLEx.LIGHTING);
}

Board.prototype.initBoardGeometry = function(gl, glex) {
	var vertsNorms = this.drawToBuffer(glex);
	var vertices = vertsNorms[0];
	var normals = vertsNorms[1];
	
	this.vertexBuffer = gl.createBuffer();	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.numItems = vertices.length/3;

	this.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	this.normalBuffer.itemSize = 3;
	this.normalBuffer.numItems = vertices.length/3;
}
//To buffer
Board.prototype.drawToBuffer = function(glex) {
	var vbuffer = [];
	var nbuffer = [];
	
	var unitsPerCell = 1;
	//base
	glex.pushMatrix();
	  glex.scale3fv([this.width/2, 0.05, this.height/2]);
	  glex.translate3fv([1.0, 1.0, 1.0]);
	  Cube.drawToBuffer(glex, vbuffer, nbuffer);
	glex.popMatrix();
	//Now all walls...
	for(var i = 0; i < this.width; ++i) {
		for(var j = 0; j < this.height; ++j) {
			//console.log(i);
			//Draw posx and posy walls for every one (if they exist)
			var currentCell = this.cells[i][j];
			if(currentCell.walls[Cell.POS_X]) {
				this.drawWallToBuffer(currentCell.walls[Cell.POS_X], glex, vbuffer, nbuffer);
			}
			if(currentCell.walls[Cell.POS_Y]) {
				this.drawWallToBuffer(currentCell.walls[Cell.POS_Y], glex, vbuffer, nbuffer);
			}
		}
	}
	//Drawing only north and east walls so no repeats, leaves out x=0 walls and z = walls
	//Do all NEG_X x = 0 walls
	for(var i = 0; i < this.width; ++i) {
		var currentCell = this.cells[0][i];
		if(currentCell.walls[Cell.NEG_X]) {
			this.drawWallToBuffer(currentCell.walls[Cell.NEG_X], glex, vbuffer, nbuffer);
		}
	}
	//do all NEG_Y y = 0 walls
	for(var i = 0; i < this.width; ++i) {
		var currentCell = this.cells[i][0];
		if(currentCell.walls[Cell.NEG_Y]) {
			this.drawWallToBuffer(currentCell.walls[Cell.NEG_Y], glex, vbuffer, nbuffer);
		}
	}
	
	return [vbuffer, nbuffer];
}
Board.prototype.drawWallToBuffer = function(wall, glex, vbuffer, nbuffer) {
	glex.pushMatrix();
	  //BAM
	  //translate to wall location
	  glex.translate3fv([wall.x, 0.0, wall.y]);
	  //scale to wall dimensions
	  glex.scale3fv([wall.width, 1.0, wall.height]);
	  //make unit cube
	  glex.scale3fv([0.5, 0.5, 0.5]);
	  //bottom corner to origin
	  glex.translate3fv([1.0, 1.0, 1.0]);
	  Cube.drawToBuffer(glex, vbuffer, nbuffer);
	glex.popMatrix();
}
//From buffer
Board.prototype.drawFromBuffer = function(gl, glex, vertAttribP, normAttribP) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(vertAttribP, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.vertexAttribPointer(normAttribP, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
}
