vec3 calculateLighting(
    vec4 normalDirection,
    vec3 lightPositionA,
    vec3 lightPositionB,
    vec3 lightColorA,
    vec3 lightColorB
) {
  vec3 a = lightColorA * max(dot(normalDirection.xyz, normalize(lightPositionA)), 0.);
  vec3 b = lightColorB * max(dot(normalDirection.xyz, normalize(lightPositionB)), 0.);
  return a + b;
}

#pragma glslify:export(calculateLighting)
