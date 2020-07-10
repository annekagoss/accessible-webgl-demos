#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.2831853071

#pragma glslify:circle = require('./common/circle.glsl');
#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');


uniform vec2 uResolution;
uniform sampler2D frameBufferTexture0;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uOffset;
uniform float uAlpha;
uniform int uSmoke;

const float NOISE_SCALE = 3.;
const float NOISE_SPEED = .0005;

vec2 translateWithMouse(vec2 st) {
  vec2 mouseSt = uMouse / uResolution;
  return st + (mouseSt * -1.) + vec2(.5, -.5);
}

vec2 sampleCoordinate(vec2 st) {
  vec2 offset = st + uOffset;
  if (uSmoke == 0) {
    return offset;
  }

  float time = uTime * NOISE_SPEED;
  vec2 multiplier =
  (1. + fractalNoise(st, time, 1, NOISE_SCALE * 3., 4)) / uResolution.xy;
  offset = uOffset * 100. * multiplier;

  // Two passes of simplex noise are applied to the offset

  // Broad smoke form
  float noiseA = fractalNoise(st, time, 0, NOISE_SCALE * 2., 4);
  float angleA = noiseA * TAU + (time);
  offset += vec2(cos(angleA), sin(angleA)) * multiplier;

  // Finely detailed smoke
  float noiseB = fractalNoise(st, time, 1, NOISE_SCALE, 4);
  float angleB = noiseB * TAU + time;
  offset += vec2(cos(angleB), sin(angleB)) * multiplier / 3.;

  return st+offset;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  float frameBufferValue =
  texture2D(frameBufferTexture0, sampleCoordinate(st)).r * uAlpha;
  vec2 mouseSt = translateWithMouse(st);
  float baseShape = circle(mouseSt, vec2(.5), .125, uResolution);

  gl_FragColor = vec4(vec3(baseShape+frameBufferValue), 1.);
}