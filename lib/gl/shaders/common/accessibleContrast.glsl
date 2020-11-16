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

vec3 rgbTohsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsvTorgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgbTohsp(vec3 c) {
  float p = sqrt(0.299 * pow(c.r, 2.0) + 0.587 * pow(c.g, 2.0) + 0.114 * pow(c.b, 2.0));
  float h = 0.0;
  float s = 0.0;

  if (c.r == c.g && c.r == c.b) return vec3(h, s, p);
  if (c.r >= c.g && c.r >= c.b) {   //  c.r is largest
    if (c.b >= c.g) {
      h = 6.0 / 6.0 - 1.0 / 6.0 * (c.b - c.g) / (c.r - c.g);
      s = 1.0 - c.g / c.r;
      return vec3(h, s, p); 
    }
    h = 0.0 / 6.0 + 1.0 / 6.0 * ( c.g - c.b )/( c.r - c.b ); 
    s = 1. - c.b / c.r; 
    return vec3(h, s, p);
  }
  if (c.g >= c.r && c.g >= c.b) {   //   c.g  is largest
    if (c.r >= c.b) {
      h = 2.0 / 6.0 - 1.0 / 6.0 * (c.r - c.b) / (c.g - c.b); 
      s = 1.- c.b / c.g; 
      return vec3(h, s, p);
    }
    h = 2./6.+1./6.*( c.b - c.r )/( c.g - c.r ); 
    s = 1.- c.r / c.g ; 
    return vec3(h, s, p);
  }
  //   c.b  is largest
  if ( c.g >= c.r ) {
    h = 4./6.-1./6.*( c.g - c.r )/( c.b - c.r ); 
    s = 1.- c.r / c.b;
    return vec3(h, s, p);
  }
  h = 4./6.+1./6.*( c.r - c.g )/( c.b - c.g ); 
  s = 1.- c.g / c.b ;
  return vec3(h, s, p);
}

vec3 hspTorgb(vec3 c) {
  float part;
  float h = c.x;
  float s = c.y;
  float p = c.z;
  float r = 0.0;
  float g = 0.0;
  float b = 0.0;

  float minOverMax = 1.0 - s;

  float Pr = 0.299;
  float Pg = 0.587;
  float Pb = 0.114;

  if (minOverMax > 0.0) {
    if (h < 1./6.) {   //  R>G>B
      h = 6.*( h -0./6.);
      part = 1.+h *(1./minOverMax-1.);
      b = p / sqrt(Pr/minOverMax/minOverMax+Pg*part*part+Pb);
      r = (b )/minOverMax; 
      g =(b )+h *((r)-(b )); 
      return vec3(r,g,b);
    }
    if ( h <2./6.) {   //  G>R>B
      h = 6.*(-h +2./6.); part=1.+h *(1./minOverMax-1.);
      b =p/sqrt(Pg/minOverMax/minOverMax+Pr*part*part+Pb);
      g =(b )/minOverMax; 
      r=(b )+h *((g )-(b )); 
      return vec3(r,g,b);
    }
    if ( h <3./6.) {   //  G>B>R
      h = 6.*( h -2./6.); part=1.+h *(1./minOverMax-1.);
      r=p/sqrt(Pg/minOverMax/minOverMax+Pb*part*part+Pr);
      g =(r)/minOverMax; b =(r)+h *((g )-(r)); 
      return vec3(r,g,b);
    }
    if ( h <4./6.) {   //  B>G>R
      h = 6.*(-h +4./6.); part=1.+h *(1./minOverMax-1.);
      r=p/sqrt(Pb/minOverMax/minOverMax+Pg*part*part+Pr);
      b =(r)/minOverMax; g =(r)+h *((b )-(r)); 
      return vec3(r,g,b);
    }
    if ( h <5./6.) {   //  B>R>G
      h = 6.*( h -4./6.); part=1.+h *(1./minOverMax-1.);
      g =p/sqrt(Pb/minOverMax/minOverMax+Pr*part*part+Pg);
      b =(g )/minOverMax; r=(g )+h *((b )-(g )); 
      return vec3(r,g,b);
    }
    //  R>B>G
    h = 6.*(-h +6./6.); part=1.+h *(1./minOverMax-1.);
    g =p/sqrt(Pr/minOverMax/minOverMax+Pb*part*part+Pg);
    r=(g )/minOverMax; b =(g )+h *((r)-(g ));
    return vec3(r,g,b);
  }
  else {
    if ( h <1./6.) {   //  R>G>B
      h = 6.*( h -0./6.); 
      r=sqrt(p*p/(Pr+Pg*h *h )); 
      g =(r)*h ; b =0.; 
      return vec3(r,g,b);
    }
    if ( h <2./6.) {   //  G>R>B
      h = 6.*(-h +2./6.); g =sqrt(p*p/(Pg+Pr*h *h )); r=(g )*h ; b =0.; 
      return vec3(r,g,b);
    }
    if ( h <3./6.) {   //  G>B>R
      h = 6.*( h -2./6.); g =sqrt(p*p/(Pg+Pb*h *h )); b =(g )*h ; r=0.; 
      return vec3(r,g,b);
    }
    if ( h <4./6.) {   //  B>G>R
      h = 6.*(-h +4./6.); b =sqrt(p*p/(Pb+Pg*h *h )); g =(b )*h ; r=0.; 
      return vec3(r,g,b);
    }
    if ( h <5./6.) {   //  B>R>G
      h = 6.*( h -4./6.); b =sqrt(p*p/(Pb+Pr*h *h )); r=(b )*h ; g =0.; 
      return vec3(r,g,b);
    }
    h = 6.*(-h +6./6.); r=sqrt(p*p/(Pr+Pb*h *h )); b =(r)*h ; g =0.; 
    return vec3(r,g,b);
  }
}

vec3 hslTorgb(vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

float contrastRatio(float bgl, float fgl) {
	float l1 = bgl + 0.05;
	float l2 = fgl + 0.05;
	float ratio = (l1 / l2);
	if (l2 > l1) return (1.0 / ratio);
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
		return (target * (fgl + 0.075)) + 0.05;
	}
	return ((fgl + 0.05 - (target * 0.05)) / target);
}

float applyGammaCorrection(float colorChannel) {
  if (colorChannel <= 0.03928) return colorChannel / 1.055;
  return pow((colorChannel + 0.055) / 1.055, 2.4);
}

float W3RelativeLuminance(vec3 rgb) {
  float r = applyGammaCorrection(rgb.r);
  float g = applyGammaCorrection(rgb.g);
  float b = applyGammaCorrection(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // Correction for perceptual color differences
}

vec3 shiftHSL(vec3 bg, float fgl, float targetRatio) {
  vec3 bghsl = rgbTohsl(bg);
	bool up = shouldLightenBackground(bghsl.z, fgl);
  float newLum = newLuminance(fgl, targetRatio, up);
  bghsl.z = up ? max(bghsl.z, newLum) : min(bghsl.z, newLum);
  vec3 rgb = hslTorgb(bghsl);
  return up ? min(rgb + (newLum * .5), 1.0): rgb;
}

vec3 shiftHSP(vec3 bg, float fgl, float targetRatio) {
  vec3 bghsp = rgbTohsp(bg);
	bool up = shouldLightenBackground(bghsp.z, fgl);
  float newLum = newLuminance(fgl, targetRatio, up) + .1;
  bghsp.z = up ? max(bghsp.z, newLum) : min(bghsp.z, newLum);
  vec3 rgb = hspTorgb(bghsp);
  return up ? min(rgb + (newLum * .5), 1.0): rgb;
}

vec3 shiftHSV(vec3 bg, float fgl, float targetRatio) {
  vec3 bghsv = rgbTohsv(bg);
	bool up = shouldLightenBackground(bghsv.z, fgl);
  float newLum = newLuminance(fgl, targetRatio, up);
  bghsv.z = up ? max(bghsv.z, newLum) : min(bghsv.z, newLum);
  vec3 rgb = hsvTorgb(bghsv);
 return up ? min(rgb + (newLum * .5), 1.0): rgb;
}

vec3 makeColorAccessibleHSL(vec3 bg, vec3 fg, int complianceLevel) {
  float bgl = W3RelativeLuminance(bg);
  float fgl = W3RelativeLuminance(fg);
	float ratio = contrastRatio(bgl, fgl);
	float targetRatio = minComplianceRatio(complianceLevel);
	vec3 newbg = shiftHSL(bg, fgl, targetRatio);
  return mix(newbg, bg, clamp(pow(ratio / targetRatio, 2.0), 0.0, 1.0));
}

vec3 makeColorAccessibleHSP(vec3 bg, vec3 fg, int complianceLevel) {
  float bgl = W3RelativeLuminance(bg);
  float fgl = W3RelativeLuminance(fg);
	float ratio = contrastRatio(bgl, fgl);
	float targetRatio = minComplianceRatio(complianceLevel);
	vec3 newbg = shiftHSP(bg, fgl, targetRatio);
  return mix(newbg, bg, clamp(pow(ratio / targetRatio, 2.0), 0.0, 1.0));
}

vec3 makeColorAccessibleHSV(vec3 bg, vec3 fg, int complianceLevel) {
  float bgl = W3RelativeLuminance(bg);
  float fgl = W3RelativeLuminance(fg);
	float ratio = contrastRatio(bgl, fgl);
	float targetRatio = minComplianceRatio(complianceLevel);
	vec3 newbg = shiftHSV(bg, fgl, targetRatio);
  return mix(newbg, bg, clamp(pow(ratio / targetRatio, 2.0), 0.0, 1.0));
}

vec3 makeColorAccessible(vec3 bg, vec3 fg, int complianceLevel, vec2 st) {
	if (complianceLevel == 0) return bg;
  if (st.x < ((1./3.))) return makeColorAccessibleHSL(bg, fg, complianceLevel);
  if (st.x < ((2./3.))) return makeColorAccessibleHSP(bg, fg, complianceLevel);
  return makeColorAccessibleHSV(bg, fg, complianceLevel);
  // return makeColorAccessibleHSP(bg, fg, complianceLevel);
}

#pragma glslify:export(makeColorAccessible)