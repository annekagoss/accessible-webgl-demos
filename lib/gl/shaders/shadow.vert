precision mediump float;

attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uLeftLightMatrix;

void main() {
  gl_Position = uLeftLightMatrix * uModelViewMatrix * aVertexPosition;
}
