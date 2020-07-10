#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;

#pragma glslify:SDFHexagram = require('./common/hexagram.glsl');


mat2 matRotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec2 rotate(vec2 _st, float angle) {
  vec2 rotationCenter = vec2(.5);
  rotationCenter.x *= uResolution.x / uResolution.y;
  _st -= rotationCenter;
  _st = matRotate2d(angle) * _st;
  _st += rotationCenter;
  return _st;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  st.x *= uResolution.x / uResolution.y;

  float speedMultiplier = -.001 * uSpeed;
  st = rotate(st, uTime * speedMultiplier);

  float pentagon = abs(SDFHexagram(st, .15, uResolution)) - .01;
  float value = smoothstep(-.0025, .0025, -pentagon);
  gl_FragColor = vec4(vec3(value), 1.);
}