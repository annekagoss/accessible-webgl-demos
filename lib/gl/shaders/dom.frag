#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDiffuse0;
uniform vec2 uSamplerResolution0;
uniform float uTime;
uniform vec4 uColor;
uniform float uDownSampleFidelity;

const float SCALE = 5.;
const float SPEED = .00025;
const float MAX_SHIFT_AMT = .005;
const float GRADIENT_STEPS = 15.;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');

vec4 colorShift(sampler2D sampler, float shift, vec2 st, float backgroundLuminance) {
  vec4 unshifted = texture2D(sampler, st);

  if (backgroundLuminance > .5) {
    float ra = texture2D(sampler, st - vec2(shift, 0.)).a;
    float ba = texture2D(sampler, st+vec2(shift, 0.)).a;
    float a = max(max(ra, ba), unshifted.a);
    vec3 left = vec3(ra - unshifted.a, 0, unshifted.b);
    vec3 right = vec3(unshifted.r, 0, ba - unshifted.a);
    return vec4(left + right, a);
  }

  float r = texture2D(sampler, st-vec2(shift, 0.)).r;
  float b = texture2D(sampler, st + vec2(shift, 0.)).b;
  return vec4(r, unshifted.g, b, unshifted.a);
}

float luminance(vec4 color, vec3 background) {
  vec3 rgb = mix(background, color.rgb, color.a);
  return .2126 * rgb.r + .7152 * rgb.g + .0722 * rgb.b;
}

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

vec3 hslTorgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);

  return c.z + c.y * (rgb - .5) * (1. - abs(2. * c.z - 1.));
}

vec2 downsample(vec2 st, float fidelity) {
  return floor(st * fidelity) / fidelity;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  st = downsample(st, uDownSampleFidelity * 100.);
  float noise = fractalNoise(st, uTime * SPEED, 1, SCALE, 4);

  vec2 imageSt = gl_FragCoord.xy / uSamplerResolution0;
  imageSt.y = (uResolution.y / uSamplerResolution0.y) - imageSt.y;
  imageSt = downsample(imageSt, uDownSampleFidelity * 500.);
  imageSt = mix(imageSt, imageSt * noise + .2, .05);

  float backgroundLuminance = luminance(uColor, vec3(1.));
  float shift = MAX_SHIFT_AMT * noise;
  vec4 image = colorShift(uDiffuse0, shift, imageSt, backgroundLuminance);

  vec2 gradientSt = mix(st, st * noise, .1);
  vec3 HSLColor = rgbTohsl(uColor.rgb);
  vec3 darkHSL = vec3(1. - HSLColor.x, HSLColor.y, min(HSLColor.z, .25));
  vec3 lightHSL = vec3(HSLColor.x, HSLColor.y, max(HSLColor.z, .75));
  vec4 colorGradient = vec4(
    mix(hslTorgb(darkHSL), hslTorgb(lightHSL), floor(gradientSt.y * GRADIENT_STEPS) * (1. / GRADIENT_STEPS)),
    uColor.a
  );

  vec4 color;
  if (backgroundLuminance > .5) {
    color = mix(colorGradient, vec4(image.rgb, 1.), image.a);
  } else {
    color = colorGradient + image;
  }

  gl_FragColor = color;
}