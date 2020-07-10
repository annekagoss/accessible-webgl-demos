precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vLighting;
varying float vSpecular;
varying float vTextureAddress;

varying vec4 vPositionFromLeftLight;

uniform float uHasTexture;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

uniform float uShadowStrength;

uniform vec3 uDiffuseColor0;
uniform vec3 uEmissiveColor0;
uniform vec3 uSpecularColor0;
uniform float uReflectivity0;
uniform float uOpacity0;

uniform vec3 uDiffuseColor1;
uniform vec3 uEmissiveColor1;
uniform vec3 uSpecularColor1;
uniform float uReflectivity1;
uniform float uOpacity1;

uniform vec3 uDiffuseColor2;
uniform vec3 uEmissiveColor2;
uniform vec3 uSpecularColor2;
uniform float uReflectivity2;
uniform float uOpacity2;

uniform int uDepthEnabled;
uniform sampler2D uDepthMap;

uniform vec3 uLeftLightColor;
uniform vec3 uRightLightColor;
uniform vec3 uTopLightColor;
uniform vec3 uBottomLightColor;

#pragma glslify:shadow=require('./common/shadow-map.glsl');


vec4 readTextures(){
  if(vTextureAddress==0.){
    if(uHasTexture==1.){
      return texture2D(uSampler0,vTextureCoord);
    }else{
      return vec4(uDiffuseColor0,1.);
    }
  }else if(vTextureAddress==1.){
    if(uHasTexture==1.){
      return texture2D(uSampler1,vTextureCoord);
    }else{
      return vec4(uDiffuseColor1,1.);
    }
  }else{
    return vec4(uDiffuseColor2,1.);
  }
}

void main(){
  vec4 texelColor=readTextures();
  vec3 specularColor;
  float opacity;

  if(vTextureAddress==0.){
    specularColor=uSpecularColor0;
    opacity=uOpacity0;
  }else if(vTextureAddress==1.){
    specularColor=uSpecularColor1;
    opacity=uOpacity1;
  }else{
    specularColor=uSpecularColor2;
    opacity=uOpacity2;
  }

  vec3 lightedColor;
  if(uDepthEnabled==1){
    vec3 shadowColor=
    shadow(uDepthMap,vPositionFromLeftLight,uShadowStrength);
    lightedColor=(texelColor.xyz-shadowColor)*
    (vLighting+(vSpecular*specularColor));
  }else{
    lightedColor=texelColor.xyz*(vLighting+(vSpecular*specularColor));
  }

  gl_FragColor=vec4(lightedColor,opacity*texelColor.w);
}
