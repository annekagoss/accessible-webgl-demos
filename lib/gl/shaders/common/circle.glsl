float circle(vec2 st,vec2 center,float radius,vec2 resolution, float sharpness) {
  st.x *= resolution.x / resolution.y;
  vec2 proportionalCenter = center;
  proportionalCenter.x *= resolution.x / resolution.y;
  float dist = distance(st, proportionalCenter);
  return smoothstep(dist - sharpness, dist + sharpness, radius);
}

#pragma glslify:export(circle)
