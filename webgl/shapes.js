/*
* Author; Anthony Cohn-Richardby
* Info: Some useful shapes
*/
/*
* requires glex.js
*/
var Cube = function(gl) {
	this.halfCubeVertexBuffer = null;
	this.halfCubeNormalBuffer = null;
	
	this.initBuffer(gl);
}

Cube.prototype.draw = function(gl, glex, vertAttribP, normAttribP) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.halfCubeVertexBuffer);
	gl.vertexAttribPointer(vertAttribP, this.halfCubeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.halfCubeNormalBuffer);
	gl.vertexAttribPointer(normAttribP, this.halfCubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)
	//One half
	gl.drawArrays(gl.TRIANGLES, 0, this.halfCubeVertexBuffer.numItems);
	//Another half rotated
	glex.rotate4fv(Math.PI, [1.0, 0.0, 0.0]);
	glex.rotate4fv(Math.PI/2, [0.0, 1.0, 0.0]);
	gl.drawArrays(gl.TRIANGLES, 0, this.halfCubeVertexBuffer.numItems);
}

Cube.prototype.initBuffer = function(gl) {
	this.halfCubeVertexBuffer = gl.createBuffer();
	this.halfCubeNormalBuffer = gl.createBuffer();

	var vertices = [
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,	//tri1fac1 c
		 
		-1.0,  1.0,  1.0,
		-1.0, -1.0,  1.0,	
		 1.0, -1.0,  1.0,  //tri2fac1 c
		 
		 1.0, -1.0,  1.0,
		-1.0, -1.0, 1.0,  
		 1.0, -1.0, -1.0,  //tri1fac2 
		 
		-1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0,  
		 1.0, -1.0, -1.0,  //tri2fac2
		 
		 1.0,  1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,	//tri1fac3
		 
		-1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,	
		 1.0, -1.0, -1.0,  //tri2fac3
	];
	gl.bindBuffer(gl.ARRAY_BUFFER, this.halfCubeVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.halfCubeVertexBuffer.itemSize = 3;
	this.halfCubeVertexBuffer.numItems = 18;
	
	var normals = [
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
	];
	gl.bindBuffer(gl.ARRAY_BUFFER, this.halfCubeNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	this.halfCubeNormalBuffer.itemSize = 3;
	this.halfCubeNormalBuffer.numItems = 18;
}

Cube.drawToBuffer = function(glex, vbuffer, nbuffer) {
	var currentModelView = glex.getModelViewMatrix();
	var vertices = [
	//Face 1 Tri 1
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,	
	//Face 1 Tri 2
		-1.0,  1.0,  1.0,
		-1.0, -1.0,  1.0,	
		 1.0, -1.0,  1.0,  
	//Face 2 Tri 1
		 1.0, -1.0,  1.0,
		-1.0, -1.0, 1.0,  
		 1.0, -1.0, -1.0,   
	//Face 2 Tri 2
		-1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0,  
		 1.0, -1.0, -1.0,  
	//Face 3 Tri 1
		 1.0,  1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,	
	//Face 3 Tri 2
		-1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,	
		 1.0, -1.0, -1.0,  
	];
	var normals = [
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
	];
	
	currentModelView = glex.getModelViewMatrix();
	currentNormalMatrix = glex.getNormalMatrix();
	for(var i = 0; i < vertices.length; i += 3) {
		var transformedVert = vec3.create();
		var transformedNormal = vec3.create();
		var vertex = [vertices[i], vertices[i+1], vertices[i+2]];
		var normal = [normals[i], normals[i+1], normals[i+2]];
		mat4.multiplyVec3(currentModelView, vertex, transformedVert);
		mat3.multiplyVec3(currentNormalMatrix, normal, transformedNormal);
		//console.log(transformedVert);
		vbuffer.push(transformedVert[0]);
		vbuffer.push(transformedVert[1]);
		vbuffer.push(transformedVert[2]);
		nbuffer.push(transformedNormal[0])
		nbuffer.push(transformedNormal[1])
		nbuffer.push(transformedNormal[2])
	}
	
	glex.rotate4fv(Math.PI, [1.0, 0.0, 0.0]);
	glex.rotate4fv(Math.PI/2, [0.0, 1.0, 0.0]);
	currentModelView = glex.getModelViewMatrix();
	for(var i = 0; i < vertices.length; i += 3) {
		var transformedVert = vec3.create();
		var transformedNormal = vec3.create();
		var vertex = [vertices[i], vertices[i+1], vertices[i+2]];
		var normal = [normals[i], normals[i+1], normals[i+2]];
		mat4.multiplyVec3(currentModelView, vertex, transformedVert);
		mat3.multiplyVec3(currentNormalMatrix, normal, transformedNormal);
		//console.log(transformedVert);
		vbuffer.push(transformedVert[0]);
		vbuffer.push(transformedVert[1]);
		vbuffer.push(transformedVert[2]);
		nbuffer.push(transformedNormal[0])
		nbuffer.push(transformedNormal[1])
		nbuffer.push(transformedNormal[2])
	}
}