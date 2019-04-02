#version 300 es

out vec3 Normal_V;
out vec3 Position_V;
uniform samplerCube skybox;
uniform vec3 reflectivePosition;
uniform float reflectiveRotationAngle;

void main() {
Normal_V = normalMatrix * normal;
Position_V = vec3(modelViewMatrix * vec4(position, 1.0));

	mat4 scaleMatrix = mat4(0.45, 0.0, 0.0, 0.0,
						0.0, 0.45, 0.0, 0.0,
						0.0, 0.0, 0.45, 0.0,
						0.0, 0.0, 0.0,  1.0);

	mat4 translationMatrix = mat4(1.0, 0.0, 0.0, 0.0,
											0.0, 1.0, 0.0, 0.0,
											0.0, 0.0, 1.0, 0.0,
											0.0, 0.0, 0.0, 1.0);

	float s = sin(reflectiveRotationAngle);
	float c = cos(reflectiveRotationAngle);

	mat4 xRotationMatrix = mat4(1.0, 0.0, 0.0, 0.0,
								0.0, c,    -s, 0.0,
								0.0, s,     c, 0.0,
								0.0, 0.0, 0.0, 1.0);
			mat4 yRotationMatrix = mat4(  c, 0.0,  -s, 0.0,
								0.0, 1.0, 0.0, 0.0,
									s, 0.0,   c, 0.0,
								0.0, 0.0, 0.0, 1.0);

	mat4 rotationMatrix = yRotationMatrix;

	mat4 translationInverseMatrix = mat4(1.0, 0.0, 0.0, 0.0,
										 0.0, 1.0, 0.0, 0.0,
										 0.0, 0.0, 1.0, 0.0,
										 0.0, 0.0, 0.0, 1.0);

vec4 newPosition = translationMatrix * rotationMatrix * translationInverseMatrix * (vec4(position, 1.0) + vec4(reflectivePosition, 0.0));

	gl_Position = projectionMatrix * modelViewMatrix *  newPosition;
}
