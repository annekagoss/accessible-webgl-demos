#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uRectDimensions;
uniform float uTime;
uniform vec2 uMouse;

#pragma glslify:rectangle=require('./common/rectangle.glsl');
#pragma glslify:circle=require('./common/circle.glsl');


vec2 translateInCircle(vec2 st) {
  vec2 translation = vec2(cos(uTime * .001), sin(uTime * .001));
  return st + translation * .2;
}

vec2 translateWithMouse(vec2 st) {
  vec2 mouseSt = uMouse / uResolution;
  return st + (mouseSt * -1.) + vec2(.5, -.5);
}

vec3 overlapForm(float circleRect, float mouseRect) {
  return mix(vec3(circleRect) * vec3(0, 0, 1), vec3(1, 0, 0), mouseRect);
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  vec2 circleSt = translateInCircle(st);
  vec2 mouseSt = translateWithMouse(st);
  float rect = rectangle(circleSt, uRectDimensions, uResolution);
  float c = circle(mouseSt, vec2(.5), .25, uResolution);
  vec3 color = overlapForm(rect, c);
  gl_FragColor = vec4(color, 1.);
}