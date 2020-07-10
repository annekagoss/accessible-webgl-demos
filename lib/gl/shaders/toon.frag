#ifdef GL_ES
precision mediump float;
#endif

varying vec4 vNormalDirection;
varying vec4 vPosition;
uniform mediump int uOutlinePass;

#pragma glslify:toonShading=require('./common/toon.glsl');


const vec3 eye = vec3(0, 0, 6);
const vec3 lightPosition = vec3(1, 1, 1);
const vec3 baseColor = vec3(.3);

void main() {
  if (uOutlinePass == 1){
    gl_FragColor = vec4(vec3(0.), 1.);
  } else {
    gl_FragColor = toonShading(eye, vNormalDirection, vPosition, lightPosition, baseColor);
  }
}