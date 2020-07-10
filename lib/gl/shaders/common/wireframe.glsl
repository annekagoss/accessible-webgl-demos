const float wireframeThickness = .005;
const vec3 wireframeColor = vec3(0.);

/*
Adapted from Stylized Wireframe Rendering in WebGL
Matt DesLauriers
https://github.com/mattdesl/webgl-wireframes
https://www.pressreader.com/australia/net-magazine/20171005/282853666142801
*/
float antiAliasStep(float threshold, float dist) {
  return smoothstep(threshold - .001, threshold+.001, dist);
}

vec4 wireframe(vec3 vBarycentric) {
  float barycentricSDF = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
  float edge = 1. - smoothstep(wireframeThickness - .01, wireframeThickness + .01, barycentricSDF);
  return vec4(wireframeColor, edge);
}

#pragma glslify:export(wireframe)
