#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TAU 6.28318530718

uniform vec2 uResolution;
uniform int uShowSDF;
uniform int uNumSides;

float SDFPolygon(vec2 _st) {
	_st = _st * 2. - 1.;
	_st.x *= uResolution.x / uResolution.y;
	float angle = atan(_st.x, _st.y) + PI;
	float radius = TAU / float(uNumSides);
	return cos(floor(.5 + angle / radius) * radius - angle) * length(_st);
}

void main() {
	vec2 st = gl_FragCoord.xy / uResolution;
	float polygon = SDFPolygon(st);
	float value = polygon;
	if(uShowSDF == 0) {
		value=1. - smoothstep(.4, .41, polygon);
	}
	gl_FragColor=vec4(vec3(value), 1.);
}