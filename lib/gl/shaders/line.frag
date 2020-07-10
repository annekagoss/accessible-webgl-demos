#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uThickness;
uniform int uSmooth;

float plotLine(vec2 st) {
	float leftEdge = 1.0 - st.x - (uThickness * 0.5);
	float rightEdge = st.x - (uThickness * 0.5);
	if (uSmooth == 1) return smoothstep(leftEdge, leftEdge + 0.005, 1.0 - st.y) * smoothstep(rightEdge, rightEdge + 0.005, st.y);
	return step(leftEdge, 1.0 - st.y) * step(rightEdge, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
	float value = plotLine(st);
	gl_FragColor = vec4(vec3(value), 1.0);
}