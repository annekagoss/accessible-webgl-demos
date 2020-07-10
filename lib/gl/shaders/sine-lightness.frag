#ifdef GL_ES
precision mediump float;
#endif

uniform float uTime;

void main(){
    float timeSineVal = (sin(uTime*.005)*.5)+ .5;
    gl_FragColor = vec4(vec3(timeSineVal,timeSineVal,timeSineVal),1);
}