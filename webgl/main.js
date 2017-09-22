/*author: Anthony Cohn-Richardby
* info	: WebGL puzzle game
*/
/*requires input.js*/
/*requires glex.js*/
var fps = 60;
var maxBoardRotation = Math.PI/16; 

var state = {
	camXRotation: 0.0,
	camYRotation: 0.0,
	camXPosition: 0.0,
	camYPosition: 0.0,
	time: 0,
	level: 0,
};

var PLAYING = 0;
var LEVEL_CHANGE = 1;
var gamestate;

function start() {
	//Set up all gl stuffs
	var canvas = document.getElementById("canvas");
	var gl = initGL(canvas);
	var glex = new GLEx(gl);

	//Set up input stuffs
	var input = new Input(canvas);
	initBuffers(gl);
	var board = new Board(gl, glex, 5, 5);
	
	board.setWinHandler(function() {
		console.log("win");
		var width = board.getWidth();
		var height = board.getHeight();
		board.newLevel(gl, glex, width*2, height*2);
		state.time = 0;
		gamestate = LEVEL_CHANGE;
	});
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	initScene(gl, glex);
	
	var time = 0;
	var interval = 1000/fps;
	
	gamestate = PLAYING;
	setInterval(function() {
		updateState(state, board, input, fps);
		drawScene(gl, glex, state, board);
	}, interval);
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL");
	}
	
	return gl;
}

var axesVertexBuffer;
function initBuffers(gl) {
	//Axes to indicate world coordinate system
	axesVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, axesVertexBuffer);
	vertices = [
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 1.0
	];
	//Allocate server memory, clear memory associated with currently bound obj
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function initScene(gl, glex) {
	glex.color3fv(GLEx.MATERIAL_COLOR, [1.0, 1.0, 1.0]);
	glex.color3fv(GLEx.AMBIENT_COLOR, [0.1, 0.1, 0.1]);
	glex.color3fv(GLEx.LIGHT_COLOR, [1.0, 1.0, 1.0]);
	glex.color3fv(GLEx.POSITION, [5.0, 5.0, 5.0]);
	glex.enable(GLEx.LIGHTING);
}
function drawScene(gl, glex, state, board) {
	switch(gamestate) {
		case PLAYING:
			//Set viewport
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			//Clear both color buffer and depth buffer, leave stencil
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			//fov, ratio, near clip, far clip
			glex.setViewFrustrum(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
			//fix perspective
			glex.setActive(GLEx.PERSPECTIVE);
			  //glex.translate3fv([state.camXPosition, state.camYPosition-15.0, 0.0]);
			 // glex.translate3fv([-board.width/2, 0.0, -5-board.height/2])
			  glex.translate3fv([-state.camXPosition, state.camZPosition, -state.camYPosition]);
			  glex.rotate4fv(state.camXRotation, [1.0, 0.0, 0.0]);
			  glex.rotate4fv(state.camYRotation, [0.0, 1.0, 0.0]);
			  //glex.translate3fv([-5.0, 5.0, -5.0]);
			  glex.rotate4fv(Math.PI/2, [1.0, 0.0, 0.0]);
			glex.setActive(GLEx.TRANSFORM);
			
			glex.loadIdentity();
			var shaderProgram = glex.getProgram();
			glex.setTimeUniform(state.time);
			//console.log(state.time);

			/**board**/
			glex.pushMatrix();
			  //move it to centre
			  glex.translate3fv([-board.width/2, 0.0, -board.height/2]);
			  glex.custom(board.getMatrix());
			  board.draw(gl, glex, shaderProgram.vertexPosition, shaderProgram.vertexNormal);
			 //board.drawFromBuffer(gl, glex, shaderProgram.vertexPosition, shaderProgram.vertexNormal);
			glex.popMatrix();
			break;
		case LEVEL_CHANGE:
			//wait 1 seconds before resuming
			if(state.time == fps*1) {
				gamestate = PLAYING;
			}
			break;
	}
	

	/**AXES**/
		/*
	glex.pushMatrix()
		glex.disable(GLEx.LIGHTING);
		glex.loadIdentity();
		glex.scale3fv([20.0, 20.0, 20.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, axesVertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPosition, 3, gl.FLOAT, false, 0, 0);
		gl.lineWidth(20);
		//red x axis
		glex.color3fv(GLEx.MATERIAL, [1.0, 0.0, 0.0]);
		gl.drawArrays(gl.LINES, 0, 2);
		//green y axis
		glex.color3fv(GLEx.MATERIAL, [0.0, 1.0, 0.0]);
		gl.drawArrays(gl.LINES, 2, 2);
		//blue z axis
		glex.color3fv(GLEx.MATERIAL, [0.0, 0.0, 1.0]);
		gl.drawArrays(gl.LINES, 4, 2);
		//reset it back
		glex.color3fv(GLEx.MATERIAL, [1.0, 1.0, 1.0]);
		glex.enable(GLEx.LIGHTING);
	glex.popMatrix();
	*/
}

function updateState(state, board, input, fps) {
	++state.time;

	if(input.right && board.zRotation > -maxBoardRotation) {
		board.rotateZ(-0.5/fps);
	}
	else if(input.left && board.zRotation < maxBoardRotation) {
		board.rotateZ(0.5/fps);
	}
	if(input.up && board.xRotation > -maxBoardRotation) {
		board.rotateX(-0.5/fps);
	}
	else if(input.down && board.xRotation < maxBoardRotation) {
		board.rotateX(+0.5/fps);
	}
	
	var mouseDX = input.getMouseDX();
	var mouseDY = input.getMouseDY();
	state.camXRotation += (mouseDY/400)*Math.PI;
	state.camYRotation += (mouseDX/600)*Math.PI;	
	board.update(fps);
	state.camXPosition = board.marble.getPositionX() - board.width/2;
	state.camZPosition = board.marble.getPositionY() - board.height/2;
	
	//Cam y position get from plane line intersection
	var line = {};
	line.point = [state.camXPosition, 100, state.camZPosition];
	line.direction = [0.0, -1.0, 0.0]; //Straight down
	var plane = board.getPlane();
	var intersection = linePlaneIntersection(line, plane);
	state.camYPosition = intersection[1] + 10; //50*vec3.length([board.marble.velocity[0], 0, board.marble.velocity[1]]);
	//console.log(state.camYPosition);
}

//plane has point, normal
//line has point, direction
function linePlaneIntersection(line, plane) {	
	var pointDistance = vec3.create();
	vec3.subtract(plane.point, line.point, pointDistance);
	var pointDistDotNormal = vec3.dot(pointDistance, plane.normal);
	
	var directionDotNormal = vec3.dot(line.direction, plane.normal);
	var magnitude = pointDistDotNormal/directionDotNormal;
	
	var intersection = [
		line.point[0] + magnitude*line.direction[0],
		line.point[1] + magnitude*line.direction[1],
		line.point[2] + magnitude*line.direction[2]
	];
	
	return intersection;
}