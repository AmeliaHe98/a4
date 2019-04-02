#version 300 es

out vec4 out_FragColor;


in vec3 Normal_V;
in vec3 Position_V;
uniform vec3 lightDirection;
uniform samplerCube skybox;


void main( ) {
vec3 normalVec = normalize(Normal_V);
vec3 reflected = reflect(normalize(vec3(Position_V)), normalVec);


vec4 texColor = textureCube(skybox, reflected);

  out_FragColor = vec4(texColor.r, texColor.g, texColor.b, 1.0);
}
