#version 300 es

out vec4 out_FragColor;

in vec3 vcsNormal;
in vec3 vcsPosition;
uniform vec3 lightDirection;
uniform samplerCube skybox;


void main( void ) {
vec3 normalVec = normalize(vcsNormal);
vec3 reflected = reflect(normalize(vec3(vcsPosition)), normalVec);

//vec3 I = normalize(positionVec);
//vec3 R_old = reflect(I, normalVec);
//vec3 R = vec3(inverse(viewMatrix)*vec4(R_old, 0.0));

vec4 texColor = textureCube(skybox, reflected);

  out_FragColor = vec4(texColor.r, texColor.g, texColor.b, 1.0);
}
