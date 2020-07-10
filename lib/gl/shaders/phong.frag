#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying float vSpecular;
varying vec2 vTextureCoord;
varying float vTextureAddress;
varying vec3 vBarycentric;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec4 vNormalDirection;

uniform vec2 uResolution;
uniform int uMaterialType;
uniform sampler2D uDiffuse0;
uniform sampler2D uDiffuse1;
uniform vec3 uLightColorA;
uniform mediump int uOutlinePass;
uniform float uTime;

#pragma glslify:wireframe = require('./common/wireframe.glsl');
#pragma glslify:toonShading = require('./common/toon.glsl');
#pragma glslify:psychedelic = require('./common/psychedelic.glsl');

const vec3 eye = vec3(0, 0, 6);
const vec3 lightPosition = vec3(1, 1, 1);
const vec3 baseColor = vec3(.3);

vec4 readTextures() {
  if (vTextureAddress == 0.) {
    return texture2D(uDiffuse0, vTextureCoord);
  } else if (vTextureAddress == 1.) {
    return texture2D(uDiffuse1, vTextureCoord);
  } else{
    return vec4(vec3(0.), 1.);
  }
}

vec3 phongLighting() {
  vec3 lighting = vLighting;
  return lighting + (max(vSpecular, 0.) * vLighting);
}

void main() {
  vec2 st = gl_FragCoord.xy/uResolution;

  // 0 PHONG
  if (uMaterialType == 0){
    gl_FragColor = vec4(phongLighting(), 1.);
    // 1 TEXTURE
  } else if (uMaterialType == 1){
    vec4 texelColor = readTextures();
    gl_FragColor = vec4(texelColor.xyz * phongLighting() * 1.5, texelColor.w);
  }
  // 2 TOON
  else if (uMaterialType == 2){
    if (uOutlinePass == 1){
      gl_FragColor = vec4(vec3(0.), 1.);
    } else{
      gl_FragColor = toonShading(eye, vNormalDirection, vPosition,
      lightPosition, baseColor);
    }
  }
  // 3 WIREFRAME
  else if (uMaterialType == 3){
    gl_FragColor = wireframe(vBarycentric);
  }
  // 4 PSYCHEDELIC
  else{
    gl_FragColor = vec4(psychedelic(vNormal, uTime), 1.);
  }
}