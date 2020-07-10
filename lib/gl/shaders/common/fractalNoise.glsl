
#pragma glslify:simplexNoise3d=require('./simplexNoise3d.glsl');

float fractalNoise(vec2 st, float time, int fractal, float scale, int octaves) {
  st *= scale;

  if (fractal == 0) {
    return.5 + .25 * simplexNoise3d(vec3(st, time));
  }

  float fractNoise = 0.;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);// Shift scale and position eact iteration
  const int maxOctaves = 10;
  float octaveScale = 1.;

  for(int i = 0; i<maxOctaves; i++) {
    if (i <= octaves){
      octaveScale *= .5;
      fractNoise += octaveScale * simplexNoise3d(vec3(st, time));
      st = m * st;
    }
  }

  return.5 + .5 * fractNoise;// normalize
}

#pragma glslify:export(fractalNoise)
