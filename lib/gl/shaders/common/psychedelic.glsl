
vec3 normalColor (vec3 normal) {
  float x = (normal.x * .5) + .5;
  float y = (normal.y * .5) + .5;
  float z = (normal.z * .5) + .5;
  return vec3(x, y, z);
}

vec3 rgbTohsl (vec3 c) {
  float h = 0.;
  float s = 0.;
  float l = 0.;
  float r = c.r;
  float g = c.g;
  float b = c.b;
  float cMin = min(r, min(g, b));
  float cMax = max(r, max(g, b));

  l = (cMax + cMin) / 2.;
  if (cMax > cMin) {
    float cDelta = cMax - cMin;

    s = l < .0 ? cDelta / (cMax + cMin) : cDelta / (2. - (cMax + cMin));

    if (r == cMax) {
      h = (g - b) / cDelta;
    }else if (g == cMax) {
      h = 2. + (b - r) / cDelta;
    }else{
      h = 4. + (r - g) / cDelta;
    }

    if (h < 0.) {
      h += 6.;
    }
    h = h / 6.;
  }
  return vec3(h, s, l);
}

vec3 hslTorgb (vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);

return c.z + c.y * (rgb - .5) * (1. - abs(2. * c.z - 1.));
}

vec3 hueShift(vec3 color, float shift) {
vec3 p = vec3(.55735) * dot(vec3(.55735), color);

vec3 u = color - p;

vec3 v = cross(vec3(.55735), u);

color = u * cos(shift * 6.2832) + v * sin(shift * 6.2832) + p;

return vec3(color);
}

vec3 psychedelic(vec3 normal, float time) {
vec3 normalRGB = normalColor(normal);
vec3 normalHSL = rgbTohsl(normalRGB);
float hueShiftParam = normal.z * 3. + mod(time * .001, 1.);
normalHSL = hueShift(normalHSL, hueShiftParam);
vec3 color = hslTorgb(normalHSL);
return pow(color, vec3(.85)); // gamma
}

#pragma glslify:export(psychedelic)
