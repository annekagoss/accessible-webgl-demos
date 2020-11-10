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
uniform float uTextColor;
uniform float uComplianceLevel;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');

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

vec3 rgbTohsl(vec3 c) {
  float h = 0.;
  float s = 0.;
  float l = 0.;
  float r = c.r;
  float g = c.g;
  float b = c.b;
  float cMin = min(r, min(g, b));
  float cMax = max(r, max(g, b));

  l = (cMax + cMin) / 2.;
  if (cMax > cMin){
    float cDelta = cMax-cMin;

    s = l < .0 ? cDelta / (cMax + cMin) : cDelta / (2. - (cMax + cMin));

    if (r == cMax) {
      h = (g - b) / cDelta;
    } else if (g == cMax) {
      h = 2. + (b - r) / cDelta;
    } else {
      h = 4. + (r - g) / cDelta;
    }

    if (h < 0.){
      h += 6.;
    }
    h = h / 6.;
  }
  return vec3(h, s, l);
}

float luminance(vec3 color) {
    return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

float perceivedLuminance(vec3 color) {
    return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
}

// vec3

// vec3 makeColorAccessible(vec3 color) {

//     float luminance = percievedLuminance(color);

// }


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

    // vec3 accessibleCircleColor = makeColorAccessible(circleColor);

	gl_FragColor = vec4(circleColor, 1.);
}