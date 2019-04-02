#version 300 es

out vec4 out_FragColor;
in vec3 vcsPosition;

uniform samplerCube skybox;

void main() {
vec4 tex = textureCube(skybox, vcsPosition);
	out_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
}
