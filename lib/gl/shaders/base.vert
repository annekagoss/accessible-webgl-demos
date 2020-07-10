precision mediump float;

attribute vec3 aBaseVertexPosition;
void main() {
    gl_Position = vec4(aBaseVertexPosition, 1.0);
}