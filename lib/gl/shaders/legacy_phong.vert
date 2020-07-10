precision mediump float;

attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;
attribute float aTextureAddress;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uLeftLightMatrix;
uniform mat4 uRightLightMatrix;

uniform vec3 uAmbientLightColor;
uniform vec3 uLeftLightColor;
uniform vec3 uRightLightColor;
uniform vec3 uTopLightColor;
uniform vec3 uBottomLightColor;

uniform float uReflectivity0;
uniform float uReflectivity1;
uniform float uReflectivity2;

uniform float uCustomShininess;
uniform float uContrast;

uniform float uAmbientLightIntensity;
uniform float uLeftLightIntensity;
uniform float uRightLightIntensity;
uniform float uTopLightIntensity;
uniform float uBottomLightIntensity;

uniform vec3 uLeftLightPosition;
uniform vec3 uRightLightPosition;
uniform vec3 uTopLightPosition;
uniform vec3 uBottomLightPosition;

varying vec2 vTextureCoord;
varying vec3 vLighting;
varying float vSpecular;
varying float vTextureAddress;

varying vec4 vPositionFromLeftLight;

const vec3 eye = vec3(0, 0, 6); // pass in camera position as uniform

vec4 transformNormal() {
  return uNormalMatrix * vec4(aVertexNormal, 1.);
}

vec3 calculateLighting() {
  vec3 leftDirVector = normalize(uLeftLightPosition);
  vec3 rightDirVector = normalize(uRightLightPosition);
  vec3 topDirVector = normalize(uTopLightPosition);
  vec3 bottomDirVector = normalize(uBottomLightPosition);

  vec4 transformedNormal = transformNormal();

  vec3 ambientLight = uAmbientLightColor * uAmbientLightIntensity;
  vec3 leftLight = uLeftLightColor * max(dot(transformedNormal.xyz, leftDirVector), 0.) * uLeftLightIntensity;
  vec3 rightLight = uRightLightColor * max(dot(transformedNormal.xyz, rightDirVector), 0.) * uRightLightIntensity;
  vec3 topLight = uTopLightColor * max(dot(transformedNormal.xyz, topDirVector), 0.) * uTopLightIntensity;
  vec3 bottomLight = uBottomLightColor * max(dot(transformedNormal.xyz, bottomDirVector), 0.) * uBottomLightIntensity;
  return ambientLight + leftLight + rightLight + topLight + bottomLight;
}

float calculateSpecular(vec3 lighting) {
  vec3 h = normalize(lighting + eye);
  vec4 transformedNormal = normalize(transformNormal());
  float specularIntensity = max(dot(transformedNormal.xyz, h), 0.);

  float reflectivity;
  if (vTextureAddress == 0.) {
    reflectivity = uReflectivity0;
  } else if (vTextureAddress == 1.) {
    reflectivity = uReflectivity1;
  } else {
    reflectivity = uReflectivity2;
  }

  specularIntensity = pow(specularIntensity, (reflectivity/(uCustomShininess)));
  return specularIntensity * uCustomShininess;
}

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
  vNormal = aVertexNormal;
  vLighting = calculateLighting();
  vSpecular = calculateSpecular(vLighting);
  vTextureAddress = aTextureAddress;
  vPositionFromLeftLight = uLeftLightMatrix * uModelViewMatrix * aVertexPosition;
}
