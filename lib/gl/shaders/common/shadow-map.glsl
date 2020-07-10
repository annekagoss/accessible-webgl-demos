float distanceFromLight(vec4 position){
  return length(position.xyz/vec3(-8.,4.,4.))/20.+.6;
}

float falloff(vec4 position){
  return max(1.-distanceFromLight(position),0.);
}

float unpackDepth(vec4 rgbaDepth){
  const vec4 bitShift=vec4(1.,1./256.,1./(256.*256.),
  1./(256.*256.*256.));
  float depth=dot(rgbaDepth,bitShift);
  return depth;
}

float hardShadow(vec4 coordinates,float offset,sampler2D depthMap){
  vec3 shadowCoord=(coordinates.xyz/coordinates.w)/2.+.5;
  vec4 rgbaDepth=texture2D(
    depthMap,vec2(shadowCoord.x*(1.+offset*.0005),shadowCoord.y));
    float depth=unpackDepth(rgbaDepth);
    return(shadowCoord.z>depth+.0005)?1.:.0;
  }

  float softShadow(vec4 position,sampler2D depthMap){
    float sum=0.;
    sum+=hardShadow(position,-5.,depthMap)*.02;
    sum+=hardShadow(position,-4.,depthMap)*.05;
    sum+=hardShadow(position,-3.,depthMap)*.09;
    sum+=hardShadow(position,-2.,depthMap)*.12;
    sum+=hardShadow(position,-1.,depthMap)*.15;
    sum+=hardShadow(position,0.,depthMap)*.16;
    sum+=hardShadow(position,1.,depthMap)*.15;
    sum+=hardShadow(position,2.,depthMap)*.12;
    sum+=hardShadow(position,3.,depthMap)*.09;
    sum+=hardShadow(position,4.,depthMap)*.05;
    sum+=hardShadow(position,5.,depthMap)*.02;
    return sum;
  }

  vec3 shadow(sampler2D depthMap,vec4 positionFromLight,float strength){
    float soft=softShadow(positionFromLight,depthMap);
    float falloffShadow=soft*falloff(positionFromLight);
    return vec3(falloffShadow)*strength;
  }

  #pragma glslify:export(shadow)
