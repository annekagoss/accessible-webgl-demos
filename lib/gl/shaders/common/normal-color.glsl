vec3 normalColor(vec3 normal){
  float x=(normal.x*.5)+.5;
  float y=(normal.y*.5)+.5;
  float z=(normal.z*.5)+.5;
  return vec3(x,y,z);
}

#pragma glslify:export(normalColor)
