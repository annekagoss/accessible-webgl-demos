precision mediump float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aBarycentric;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform vec3 uLightPositionA;
uniform vec3 uLightPositionB;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;
uniform vec2 uResolution;

varying vec3 vLighting;
varying vec3 vBarycentric;
varying vec3 vVertexPosition;

#pragma glslify:calculateLighting = require('./common/lighting.glsl');

void main(){
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vec4 normalDirection = normalize(uModelViewMatrix * vec4(aVertexNormal, 1.));
  vLighting = calculateLighting(normalDirection, uLightPositionA,
  uLightPositionB, uLightColorA, uLightColorB);
  vBarycentric = aBarycentric;
  vVertexPosition = aVertexPosition.xyz * .5 + .5;
}