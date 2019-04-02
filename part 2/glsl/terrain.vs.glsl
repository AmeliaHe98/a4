#version 300 es

																																																																																																								out vec3 vcsNormal;
out vec3 vcsPosition;
out vec2 vcsTexcoord;
out vec4 positionFromLight;

//UNIFORM VAR
// Inverse world matrix used to render the scene from the light POV
uniform mat4 lightViewMatrixUniform;
// Projection matrix used to render the scene from the light POV
uniform mat4 lightProjectMatrixUniform;

void main() {
	// viewing coordinate system
	vcsNormal = normalMatrix * normal;
	vcsPosition = vec3(modelViewMatrix * vec4(position, 1.0));
	vcsTexcoord = uv;
	// translates coordinates from [-1, 1] to [0, 1]
	mat4 biasMatrix = mat4(0.5, 0.0, 0.0, 0.0,
					       0.0, 0.5, 0.0, 0.0,
					       0.0, 0.0, 0.5, 0.0,
					       0.5, 0.5, 0.5, 1.0);

	// texture coordinates
	positionFromLight = biasMatrix * lightProjectMatrixUniform * lightViewMatrixUniform * modelMatrix * vec4(position, 1.0);

	//positionFromLight = lightProjectMatrixUniform * lightViewMatrixUniform * modelMatrix * vec4(position, 1.0);


  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
