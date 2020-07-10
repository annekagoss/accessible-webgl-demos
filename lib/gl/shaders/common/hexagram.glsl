float SDFHexagram(vec2 _st,float radius,vec2 resolution){
  _st.x-=.5*(resolution.x/resolution.y);
  _st.y-=.5;
  _st.y*=-1.;
  const vec4 k=vec4(-.5,.8660254038,.5773502692,1.7320508076);
  _st=abs(_st);
  _st-=2.*min(dot(k.xy,_st),0.)*k.xy;
  _st-=2.*min(dot(k.yx,_st),0.)*k.yx;
  _st-=vec2(clamp(_st.x,radius*k.z,radius*k.w),radius);
  return length(_st)*sign(_st.y);
}

#pragma glslify:export(SDFHexagram)
