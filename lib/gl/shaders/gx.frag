#ifdef GL_ES
precision mediump float;
#endif

#define CENTER vec2(0.5)
#define BACKGROUND vec3(1.0)
#define CIRCLE_COLOR_1 vec3(1.0, 0.6353, 0.0)
#define CIRCLE_COLOR_2 vec3(1, 0, 0)
#define CIRCLE_COLOR_3 vec3(0, 0, 1)

#define SPEED 0.0003
#define SCALE .75
#define BLUR_RADIUS 0.3

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uTextColor;
uniform int uComplianceLevel;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');
#pragma glslify:makeColorAccessible = require('./common/accessibleContrast.glsl');

float circle(vec2 st, float radius) {
	st.x *= uResolution.x / uResolution.y;
	vec2 proportionalCenter = CENTER;
	proportionalCenter.x *= uResolution.x / uResolution.y;
	float dist = distance(st, proportionalCenter);
	return smoothstep(dist - BLUR_RADIUS, dist + BLUR_RADIUS, radius);
}

vec2 applyNoise(vec2 st, float noise) {
	vec2 centeredCoordinate = st - 0.5;
	centeredCoordinate *= noise;
	return (centeredCoordinate + 0.5);
}

vec2 noiseCoord(vec2 st, float noise) {
    vec2 noiseSt = applyNoise(st + vec2(0, 0.5), noise);
    return mix(st, noiseSt, .5);
}

void main() {
	vec2 st = gl_FragCoord.xy / uResolution;
    float noise = fractalNoise(st, uTime * SPEED, 1, SCALE, 1);

    vec2 st1 = noiseCoord(st + vec2(0, 0), noise);

    vec2 st2 = noiseCoord(st + vec2(0, .6), noise);
    vec2 st3 = noiseCoord(st + vec2(0, .75), noise);

	float c1 = circle(st1, 0.5);
    float c2 = circle(st2, 0.5);
    float c3 = circle(st3, 0.5);

    vec3 circleColor = mix(BACKGROUND, uColor1, c1);
    circleColor = mix(circleColor, uColor2, c2);
    circleColor = mix(circleColor, uColor3, c3);

    circleColor = makeColorAccessible(circleColor, uTextColor, uComplianceLevel);

	gl_FragColor = vec4(circleColor, 1.);
}