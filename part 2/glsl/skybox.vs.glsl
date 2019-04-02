#version 300 es
out vec3 vcsPosition;

void main() {

	vcsPosition = vec3(modelViewMatrix * vec4(position, 1.0));
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
