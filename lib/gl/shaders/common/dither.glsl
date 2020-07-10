float noise(vec2 n,float x){
  n+=x;
  return fract(sin(dot(n.xy,vec2(12.9898,78.233)))*43758.5453)*2.-1.;
}

float noisePass(vec2 uv,float n){
  float a=1.;
  float b=2.;
  float c=-12.;
  float t=1.;

  return(1./(a*4.+b*4.-c))*
  (noise(uv+vec2(-1.,-1.)*t,n)*a+
  noise(uv+vec2(0.,-1.)*t,n)*b+
  noise(uv+vec2(1.,-1.)*t,n)*a+
  noise(uv+vec2(-1.,0.)*t,n)*b+
  noise(uv+vec2(0.,0.)*t,n)*c+
  noise(uv+vec2(1.,0.)*t,n)*b+
  noise(uv+vec2(-1.,1.)*t,n)*a+
  noise(uv+vec2(0.,1.)*t,n)*b+
  noise(uv+vec2(1.,1.)*t,n)*a);
}

float createDither(vec2 uv,float n){
  float a=1.;
  float b=2.;
  float c=-2.;
  float t=1.;

  return(4./(a*4.+b*4.-c))*
  (noisePass(uv+vec2(-1.,-1.)*t,n)*a+
  noisePass(uv+vec2(0.,-1.)*t,n)*b+
  noisePass(uv+vec2(1.,-1.)*t,n)*a+
  noisePass(uv+vec2(-1.,0.)*t,n)*b+
  noisePass(uv+vec2(0.,0.)*t,n)*c+
  noisePass(uv+vec2(1.,0.)*t,n)*b+
  noisePass(uv+vec2(-1.,1.)*t,n)*a+
  noisePass(uv+vec2(0.,1.)*t,n)*b+
  noisePass(uv+vec2(1.,1.)*t,n)*a);
}

vec3 dither(vec2 uv,vec3 color,float steps){
  float ditherValue=createDither(uv,0.);
  return floor(.5+color*steps-.5+ditherValue)*(1./(steps-1.));
}

#pragma glslify:export(dither)
