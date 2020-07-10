vec4 toonShading(
    vec3 eye,
    vec4 normalDirection,
    vec4 vertexPosition,
    vec3 lightPosition,
    vec3 baseColor
) {
  vec3 viewDirection = normalize(eye - vertexPosition.xyz);
  vec3 lightDirection = normalize(lightPosition);
  float lambert = dot(normalDirection.xyz, lightDirection);
  float halfLambert = .5 * lambert + .5;
  float toon = .5 * smoothstep(.5, .51, lambert) + .5 + .5 * smoothstep(.5, .51, halfLambert) + .5;
  float outline = smoothstep(.2, .21, normalDirection.z);
  vec3 fragmentColor = outline * toon * baseColor;

  bool lightSourceOnRightSide = pow(max(0., dot(reflect( - lightDirection, normalDirection.xyz), viewDirection)), 10.) > .8;
  if (lambert > 0. && lightSourceOnRightSide){
    fragmentColor = vec3(1);
  }

  return vec4(fragmentColor, 1.);
}

#pragma glslify:export(toonShading)
