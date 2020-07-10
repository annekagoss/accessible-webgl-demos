#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying vec3 vBarycentric;
varying vec3 vVertexPosition;

uniform vec2 uResolution;
uniform int uMaterialType;

#pragma glslify:wireframe = require('./common/wireframe.glsl');

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  if (uMaterialType == 0) {
    gl_FragColor = vec4(vVertexPosition, 1.);
    return;
  } else if (uMaterialType == 1) {
    gl_FragColor = vec4(vLighting * 1.5, 1.);
  } else {
    gl_FragColor = wireframe(vBarycentric);
  }
}