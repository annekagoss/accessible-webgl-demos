#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute float aTextureAddress;
attribute vec3 aBarycentric;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTime;
uniform vec3 uLightPositionA;
uniform vec3 uLightPositionB;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;
uniform float uSpecular;
uniform mediump int uOutlinePass;
uniform int uDisplacement;

varying vec3 vLighting;
varying float vSpecular;
varying vec2 vTextureCoord;
varying float vTextureAddress;
varying vec3 vBarycentric;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vNormalDirection;

const vec3 eye = vec3(0, 0, 6);// TODO pass in camera position as uniform

#pragma glslify:calculateLighting = require('./common/lighting.glsl');
#pragma glslify:calculateSpecular = require('./common/specular.glsl');


void main(){
  vec4 position = aVertexPosition;
  vec3 normal = aVertexNormal;

  if (uOutlinePass == 1) {
    position.xyz *= 1.025;
    normal *= 1.025;
  }

  if (uDisplacement == 1) {
    position.xy *= 1. + sin((uTime * .001) + (position.z * .5)) * .1;
    normal.xy *= 1. + sin((uTime * .001) + (normal.z * .5)) * .1;
  }

  gl_Position = uProjectionMatrix * uModelViewMatrix * position;
  vec4 normalDirection = normalize(uNormalMatrix * vec4(normal, 1.));
  vec3 lighting = calculateLighting(normalDirection, uLightPositionA, uLightPositionB, uLightColorA, uLightColorB);
  float specular = calculateSpecular(normalDirection, lighting, eye, uSpecular);
  vLighting = lighting;
  vSpecular = specular;
  vTextureCoord = aTextureCoord;
  vTextureAddress = aTextureAddress;
  vBarycentric = aBarycentric;
  vNormal = normal;

  // TOON
  vPosition = position * uModelViewMatrix;
  vNormalDirection = normalDirection;
}