#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDiffuse0;
uniform vec2 uSamplerResolution0;
uniform float uTime;
uniform vec4 uColor;
uniform float uDownSampleFidelity;
uniform vec2 uScrollOffset;
uniform vec2 uMouse;

const float SCALE = 5.;
const float SPEED = .00025;
const float MAX_SHIFT_AMT = .0055;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');
#pragma glslify:circle = require('./common/circle.glsl');

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

vec2 translateWithMouse(vec2 st) {
  vec2 mouseSt = uMouse / uResolution;
  return st + (mouseSt * -1.) + vec2(.5, -.5);
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  
  vec2 mouseSt = translateWithMouse(st);
  vec2 downsampledMouseSt = downsample(mouseSt, 100.0);
  
  float noiseC = circle(mouseSt, vec2(.5), .3, uResolution, 0.1);
  float noiseScale = mix(2., 2.1, noiseC);
  float noise = fractalNoise(st, uTime * SPEED, 1, noiseScale, 4);
  float outerNoiseC = mix(noise, 0.0, circle(mouseSt, vec2(.5), .25, uResolution, 0.1));
  outerNoiseC *= circle(mouseSt, vec2(.5), .33, uResolution, 0.1);
  outerNoiseC *= outerNoiseC;
//   mouseSt = mix(mouseSt, noise, 1.0 - circle(mouseSt, vec2(.5), .125, uResolution, 0.1));
float c = outerNoiseC + circle(mouseSt, vec2(.5), .4, uResolution, 0.1);

  vec2 imageSt = gl_FragCoord.xy / uSamplerResolution0;
  
  imageSt.y = (uResolution.y / uSamplerResolution0.y) - imageSt.y - uScrollOffset.y;
  vec2 imageSt1 = imageSt;
  
  if (imageSt1.y < .1) {
	  imageSt1.y = .1;
  }
  
  if (imageSt1.x < .1) {
	  imageSt1.x = .1;
  }
  
  if (imageSt1.x > .8) {
	  imageSt1.x = .8;
  }
  if (imageSt1.y > .8) {
	  imageSt1.y = .8;
  }

	float noiseAmt = mix(10.0, 1.0, c);
	vec2 noiseCoordinate = (imageSt * 2.0) - 1.0;
	noiseCoordinate *= noise * noiseAmt + .5;
	noiseCoordinate = (noiseCoordinate * 0.5) + 1.0;
	
  imageSt = mix(imageSt, noiseCoordinate, .05);
  
	vec2 noiseCoordinate1 = (imageSt1 * 2.0) - 1.0;
	noiseCoordinate1 *= noise * noiseAmt + .5;
	noiseCoordinate1 = (noiseCoordinate1 * 0.5) + 1.0;
	
  imageSt1 = mix(imageSt1, noiseCoordinate1, .05);

  float backgroundLuminance = luminance(uColor, vec3(1.));
  float shift = MAX_SHIFT_AMT * noise * (1.0 - c);
  imageSt = mix(imageSt1, imageSt, c);
  vec4 image = colorShift(uDiffuse0, shift, imageSt, 1.0);
	gl_FragColor = image;
}