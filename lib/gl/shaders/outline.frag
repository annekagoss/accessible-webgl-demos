#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uSource;
uniform sampler2D uOutline;

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  vec4 outline = texture2D(uOutline, st);
  vec4 source = texture2D(uSource, st);
  vec4 color = mix(outline, source, source.w);
  gl_FragColor = color;
}