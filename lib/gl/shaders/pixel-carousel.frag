#ifdef GL_ES
precision mediump float;
#endif

#define blur.8
#define TAU 6.28318530718

uniform vec2 uResolution;
uniform float uTransitionProgress;
uniform sampler2D uDiffuse0;
uniform sampler2D uDiffuse1;
uniform int uDirection;
uniform float uTime;
uniform vec2 uSlideResolution;

const float SPEED = .00115;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');

float transitionAmount() {
	if (uTransitionProgress < (1.0/3.0)) return uTransitionProgress * 3.0;
	if (uTransitionProgress < (2.0/3.0)) return 1.0;
	return 1.0 - ((uTransitionProgress - (2.0/3.0)) * 3.0);
}

vec2 applyNoise(vec2 st, float noise) {
	vec2 centeredCoordinate = st - 0.5;
	centeredCoordinate *= noise;
	return (centeredCoordinate + 0.5);
}

vec3 noiseTransition(vec2 imageSt) {
	float noise = fractalNoise(gl_FragCoord.xy / uResolution, uTime * SPEED, 1, 2., 8);
	noise = clamp(noise * 2.0, 0.0, 1.0);
	return vec3(mix(imageSt, applyNoise(imageSt, noise), .6), noise);
}

float transitionWipe(vec2 st, float amount) {
	return sin((st.y * TAU) + (amount * TAU));
}

float interpolate(float start, float end, float t) {
  return start * (1. - t) + end * t;
}

vec4 noiseCarousel() {
	vec2 st = gl_FragCoord.xy / uResolution;
	vec2 imageSt = gl_FragCoord.xy / uSlideResolution;
	imageSt.y = 1.0 - imageSt.y;
	imageSt.x -= 0.5;
	
   float transitionAmount = transitionAmount();
  
  float bulge = transitionWipe(imageSt, uTransitionProgress * 1.1) * 0.4 * transitionAmount;
  if (imageSt.x < 0.5) {
	  imageSt.x = mix(imageSt.x, imageSt.x + bulge, abs(imageSt.x - 0.5));
  } else {
	  imageSt.x = mix(imageSt.x, imageSt.x - bulge, abs(imageSt.x - 0.5));
  }
  
  float noise = fractalNoise(st, uTime * SPEED, 1, 2., 4);
  float brightestNoise = min(pow(noise * 8.0, 8.), 1.);
  float darkestNoise = pow(noise * .5, 2.);
  float midNoise = pow(noise * 2.0, 2.);
  vec2 effectSt = mix(imageSt, applyNoise(imageSt, midNoise), ((bulge * 0.5) + 0.5) * .8);

  float distortion = midNoise * transitionAmount;
	
  vec2 fromSampler = mix(imageSt, effectSt, distortion);	
  vec2 toSampler = mix(imageSt, effectSt, distortion);
  vec4 fromSlide = texture2D(uDiffuse0, fromSampler);
  vec4 toSlide = texture2D(uDiffuse1, toSampler);
	float combinedNoise = mix(darkestNoise, brightestNoise, max(min(bulge, 1.0), 0.0));
   vec4 combinedImages = mix(fromSlide, toSlide, combinedNoise);
	
  if (uTransitionProgress < (1.0/3.0)) {
	 return mix(fromSlide, combinedImages, uTransitionProgress * 3.0);
  } else if (uTransitionProgress < (2.0/3.0)) {
	  return combinedImages;
  } else {
	  return mix(combinedImages, toSlide, (uTransitionProgress - (2.0/3.0)) * 3.0);
  }
}

vec2 downsample(vec2 st, float fidelity) {
  return floor(st * fidelity) / fidelity;
}

vec4 pixelCarousel() {
	vec2 st = gl_FragCoord.xy / uResolution;
	vec2 imageSt = st;
	imageSt.y = 1.0 - imageSt.y;

	float transitionAmount = transitionAmount();
	
	 float resolution = mix(900.0, 14.0, sqrt(sqrt(transitionAmount)));
   imageSt = downsample(mix(imageSt, imageSt * vec2(1.05, 1.1), transitionAmount), resolution);
    imageSt.x *= uResolution.x/uSlideResolution.x;
	imageSt.x -= 0.5;
   
   float noise = fractalNoise(imageSt, uTime * SPEED, 1, 2., 8);
	noise = clamp(noise * 2.0, 0.0, 1.0);
	imageSt = mix(
		imageSt,
		mix(imageSt, applyNoise(imageSt, noise), .6),
		transitionAmount
	);	
	
	  float bulge = transitionWipe(imageSt, uTransitionProgress) * 0.3 * transitionAmount;
  if (imageSt.x < 0.5) {
	  imageSt.x = mix(imageSt.x, imageSt.x + bulge, abs(imageSt.x - 0.5));
  } else {
	  imageSt.x = mix(imageSt.x, imageSt.x - bulge, abs(imageSt.x - 0.5));
  }

  
  vec4 fromSlide = texture2D(uDiffuse0, imageSt);
  vec4 toSlide = texture2D(uDiffuse1, imageSt);
  
   vec4 combinedImages = mix(fromSlide, toSlide, uTransitionProgress);
	
  if (uTransitionProgress < (1.0/3.0)) {
	 return mix(fromSlide, combinedImages, uTransitionProgress * 3.0);
  } else if (uTransitionProgress < (2.0/3.0)) {
	  return combinedImages;
  } else {
	  return mix(combinedImages, toSlide, (uTransitionProgress - (2.0/3.0)) * 3.0);
  }
}


void main() {
	// gl_FragColor = noiseCarousel();
	gl_FragColor = pixelCarousel();
}