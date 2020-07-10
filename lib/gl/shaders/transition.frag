#ifdef GL_ES
precision mediump float;
#endif

#define blur.8

uniform vec2 uResolution;
uniform float uTransitionProgress;
uniform sampler2D uDiffuse0;
uniform sampler2D uDiffuse1;
uniform int uDirection;
uniform float uTime;

const float SPEED = .00025;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');

float interpolate(float start, float end, float t) {
  return start * (1. - t) + end * t;
}

float transitionWipe(vec2 st) {
  float transition = st.x + interpolate(-1. - blur, 1. + blur, uTransitionProgress);
  return smoothstep(transition-blur, transition + blur, st.y);
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  float noise = fractalNoise(st, uTime * SPEED, 1, 6., 6);
  float transition = transitionWipe(st);
  st.y = 1. - st.y;
  vec2 fromSampler = mix(st, st * noise, 1. - transition);
  vec2 toSampler = mix(st, st * noise, transition);
  vec4 fromSlide = texture2D(uDiffuse0, fromSampler);
  vec4 toSlide = texture2D(uDiffuse1, toSampler);
  gl_FragColor = mix(toSlide, fromSlide, transition);
}