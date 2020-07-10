#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uThreshold;

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
	float value = step(uThreshold, st.x);
	gl_FragColor = vec4(vec3(value), 1.0);
}