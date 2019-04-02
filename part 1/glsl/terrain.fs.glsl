#version 300 es

out vec4 out_FragColor;

in vec3 vcsNormal;
in vec3 vcsPosition;
in vec2 vcsTexcoord;
in vec4 positionFromLight;

uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightDirection;

uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform sampler2D aoMap;
uniform sampler2D shadowMap;

float getShadowMapDepth(vec2 texCoord)
{
	vec4 v = texture2D(shadowMap, texCoord);
	const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0 * 256.0), 1.0/(256.0*256.0*256.0));
	return dot(v, bitShift);
}

void main() {
	// TANGENT SPACE NORMAL ?
	vec3 Nt = normalize(texture(normalMap, vcsTexcoord).xyz * 2.0 - 1.0);

	// PRE-CALCS ?
	vec3 Ni = normalize(vcsNormal);
	vec3 up = vec3(0.0, 1.0, 0.0);
	vec3 Tangent = normalize(cross(Ni,up));
	vec3 BiTangent = normalize(cross(Ni,Tangent));
	mat3 TBN = mat3(Tangent, BiTangent, Ni);

	vec3 L_org = normalize(vec3(viewMatrix * vec4(lightDirection, 0.0)));

	vec3 V_org = normalize(-vcsPosition);

	vec3 L = normalize(transpose(TBN)*L_org);
	vec3 V = normalize(transpose(TBN)*V_org);
	vec3 H = normalize((V + L) * 0.5);

	//AMBIENT
	vec3 light_AMB = ambientColor * kAmbient*(texture(aoMap,vcsTexcoord).xyz);

	//DIFFUSE
	vec3 diffuse = kDiffuse * lightColor*(texture(colorMap,vcsTexcoord).xyz);
	vec3 light_DFF = diffuse * max(0.0, dot(Nt, L));

	//SPECULAR
	vec3 specular = kSpecular * lightColor;
	vec3 light_SPC = specular * pow(max(0.0, dot(H, Nt)), shininess);

	// SHADOW
	vec2 shadowTex = vec2(positionFromLight.x/positionFromLight.w, positionFromLight.y/positionFromLight.w);

	float hasShadow = getShadowMapDepth(shadowTex);
	float error = 0.0001;
	float visibility = 1.0;
	if (hasShadow < positionFromLight.z/positionFromLight.w - error) {
		visibility = 0.2;
	}

	//TOTAL
	vec3 TOTAL = light_AMB + visibility*light_DFF  + visibility*light_SPC;

	out_FragColor = vec4(TOTAL, 1.0);
	//out_FragColor= texture(texture2D, vcsTexcoord);
	//texture2D(u_texture, v_texcoord);
}
