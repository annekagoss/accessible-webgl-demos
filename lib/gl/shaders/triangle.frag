#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uDimensions;
uniform int uSmooth;
uniform int uShowSDF;

float SDFTriangleIsosceles(vec2 triDimensions, vec2 st) {
	vec2 a = st - triDimensions*clamp( dot(st,triDimensions)/dot(triDimensions,triDimensions), 0.0, 1.0 );
    vec2 b = st - triDimensions*vec2( clamp( st.x/triDimensions.x, 0.0, 1.0 ), 1.0 );
    float s = -sign( triDimensions.y );
    vec2 d = min( vec2( dot( a, a ), s*(st.x*triDimensions.y-st.y*triDimensions.x) ),
                  vec2( dot( b, b ), s*(st.y-triDimensions.y)  ));
    return -sqrt(d.x)*sign(d.y);
}

float triangle() {
	// Shift coordinate system to center triangle
	vec2 st = (2.0*gl_FragCoord.xy-uResolution)/uResolution.y;
	st *= .5;
	st.y = -1.0 * (st.y - (uDimensions.y*0.5));
    st.x = abs(st.x);
	
	// Ratio of width/height to side lengths
	vec2 triDimensions = uDimensions * vec2(0.5, .866025);
	float SDFTri = SDFTriangleIsosceles(triDimensions, st);
	
	if (uShowSDF == 1) {
		return SDFTri;
	}
	
	if (uSmooth == 1) {
		return smoothstep(-0.0025, 0.0025, -SDFTri);
	}
	return step(0.0, -SDFTri);
}

void main() {
	float value = triangle();
	gl_FragColor = vec4(vec3(value), 1.0);
}