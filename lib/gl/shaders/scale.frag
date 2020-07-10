#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.2831853071

uniform vec2 uResolution;
uniform vec2 uMaxScale;
uniform float uTime;

const float SPEED = .001;

#pragma glslify:SDFPentagon = require('./common/pentagon.glsl');


mat2 matScale(vec2 scale) {
    return mat2(scale.x, 0., 0., scale.y);
}

vec2 scale(vec2 _st, vec2 scale) {
  _st -= vec2(.5);
  _st = matScale(1. / scale) * _st;
  _st += vec2(.5);
  return _st;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  float sineScalar = sin(TAU + (uTime*SPEED)) * .5 + .5;
  st = scale(st, uMaxScale * sineScalar);
  float pentagon = abs(SDFPentagon(st, .25, uResolution))-.01;
  float value = smoothstep(-.0025, .0025, -pentagon);
  gl_FragColor = vec4(vec3(value), 1.);
}