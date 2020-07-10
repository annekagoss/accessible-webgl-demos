float SDFTriangleIsosceles(vec2 triDimensions,vec2 st){
    vec2 a=st-triDimensions*clamp(dot(st,triDimensions)/
    dot(triDimensions,triDimensions),
0.,1.);
vec2 b=
st-triDimensions*vec2(clamp(st.x/triDimensions.x,0.,1.),1.);
float s=-sign(triDimensions.y);
vec2 d=min(
    vec2(dot(a,a),s*(st.x*triDimensions.y-st.y*triDimensions.x)),
    vec2(dot(b,b),s*(st.y-triDimensions.y)));
    return-sqrt(d.x)*sign(d.y);
}

#pragma glslify:export(SDFTriangleIsosceles)
