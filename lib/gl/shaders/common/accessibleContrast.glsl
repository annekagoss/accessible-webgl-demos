vec3 rgbTohsl(vec3 c) {
  float h = 0.;
  float s = 0.;
  float l = 0.;
  float r = c.r;
  float g = c.g;
  float b = c.b;
  float cMin = min(r, min(g, b));
  float cMax = max(r, max(g, b));

  l = (cMax + cMin) / 2.;
  if (cMax > cMin){
    float cDelta = cMax-cMin;

    s = l < .0 ? cDelta / (cMax + cMin) : cDelta / (2. - (cMax + cMin));

    if (r == cMax) {
      h = (g - b) / cDelta;
    } else if (g == cMax) {
      h = 2. + (b - r) / cDelta;
    } else {
      h = 4. + (r - g) / cDelta;
    }

    if (h < 0.){
      h += 6.;
    }
    h = h / 6.;
  }
  return vec3(h, s, l);
}

vec3 hslTorgb(vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

float contrastRatio(float bgl, float fgl) {
	float l1 = bgl + 0.05;
	float l2 = fgl + 0.05;
	float ratio = l1 / l2;
	if (l2 > l1) return 1.0 / ratio;
	return ratio;
}

float minComplianceRatio(int level) {
	if (level == 1) return 4.5;
	return 7.0;
}

bool shouldLightenBackground(float bgl, float fgl) {
	if (fgl == bgl) return bgl < 0.5;
	return bgl > fgl;
}

float newLuminance(float fgl, float target, bool up) {
	if (up) {
		return (target * (fgl + 0.05)) - 0.05;
	}
	return (fgl + 0.05 - target * 0.05) / target;
}

vec3 shift(vec3 bghsl, float fgl, float targetRatio) {
	bool up = shouldLightenBackground(bghsl.z, fgl);
	bghsl.z = newLuminance(fgl, targetRatio, up);
	return hslTorgb(bghsl);
}

vec3 makeColorAccessible(vec3 bg, vec3 fg, int complianceLevel) {
	if (complianceLevel == 0) return bg;
	vec3 bghsl = rgbTohsl(bg);
	vec3 fghsl = rgbTohsl(fg);
	float ratio = contrastRatio(bghsl.z, fghsl.z);
	float targetRatio = minComplianceRatio(complianceLevel);
	if (ratio >= targetRatio) return bg;
	vec3 newColor = shift(bghsl, fghsl.z, targetRatio);
	float shiftAmount = clamp((1.0 - ratio/targetRatio) * 2.0, 0.0, 1.0);
	return mix(bg, newColor, shiftAmount);
}

#pragma glslify:export(makeColorAccessible)