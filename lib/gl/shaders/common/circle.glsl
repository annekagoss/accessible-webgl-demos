float circle(vec2 st,vec2 center,float radius,vec2 resolution) {
  st.x *= resolution.x / resolution.y;
  vec2 proportionalCenter = center;
  proportionalCenter.x *= resolution.x / resolution.y;
  float dist = distance(st, proportionalCenter);
  return smoothstep(dist - .0025, dist + .0025, radius);
}

#pragma glslify:export(circle)
