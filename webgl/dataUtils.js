/**
* Author: Anthony Cohn-Richardby
* Info: Some utilities relating to data types
**/

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

function lineSegmenetPlaneIntersection(lineseg, plane) {
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
