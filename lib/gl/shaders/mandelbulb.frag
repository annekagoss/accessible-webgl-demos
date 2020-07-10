#ifdef GL_ES
precision mediump float;
#endif

// Based on this example from Inigo Iquilez
// https://www.shadertoy.com/view/ltfSWn

#define ANTI_ALIAS_PASSES 1// make ANTI_ALIAS_PASSES 1 for slow machines or 3 for fast machines
#define CAMERA_DISTANCE 2.1
#define TARGET vec3(0.)

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform mediump int uIterations;
uniform vec3 uFractalColor1;
uniform vec3 uFractalColor2;
uniform vec3 uFractalColor3;

const vec3 lightPosition1 = vec3(.577, .577, -.577);
const vec3 lightPosition2 = vec3(-.707, 0., .707);

float circle(vec2 st, float radius, vec2 resolution) {
	st.x *= resolution.x / resolution.y;
	vec2 proportionalCenter = vec2(.5);
	proportionalCenter.x *= resolution.x / resolution.y;
	float dist = distance(st, proportionalCenter);
	return smoothstep(dist - .125, dist + .125, radius);
}

vec2 translateWithMouse(vec2 st) {
	vec2 mouseSt = uMouse / uResolution;
	return st + (mouseSt *- 1.) + vec2(.5, -.5);
}

float circle() {
	vec2 st = gl_FragCoord.xy / uResolution;
	vec2 mouseSt = translateWithMouse(st);
	return circle(mouseSt, .375, uResolution);
}

float map (vec3 rayPosition, out vec4 surfaceColor)
{
	vec3 _rayPosition = rayPosition;
	float raySqMagnitude = dot(_rayPosition, _rayPosition);
	vec4 _surfaceColor = vec4(abs(_rayPosition), raySqMagnitude);
	vec2 st = gl_FragCoord.xy / uResolution;
	vec2 mouse = translateWithMouse(st) * 10.;
	float dz = 1.;
	float size = 8.;
	float time = uTime * .001;

	// Fractal form
	for (int i = 0; i < 6; i++)
	{
		if (i > uIterations) break;

		// Extract polar coordinates
		float r = length(_rayPosition);
		float b =- size * acos((_rayPosition.y / r)) + time + mouse.y;
		float a = size * atan(_rayPosition.x, _rayPosition.z) - time + mouse.x;

		// Scale and rotate the point
		dz = size * pow(sqrt(raySqMagnitude), 7.) * dz;

		// Convert back to cartesian coordinat
		vec3 fractal = pow(r, size) * vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a));
		vec3 distortedFractal = pow(r, 9.) * vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a));
		_rayPosition = mix(rayPosition + distortedFractal, rayPosition + fractal, circle());
		_surfaceColor = min(_surfaceColor, vec4(abs(_rayPosition), raySqMagnitude));

		raySqMagnitude = dot(_rayPosition, _rayPosition);
		if (raySqMagnitude > 256.)
		break;
	}
	surfaceColor = vec4(raySqMagnitude, _surfaceColor.yzw);
	return .25 * log(raySqMagnitude) * sqrt(raySqMagnitude) / dz;
}

// Raymarching bounding sphere
vec2 sphere(vec4 sphereCoordinates, vec3 rayOrigin, vec3 rayDirection)
{
	vec3 oc = rayOrigin - sphereCoordinates.xyz;
	float b = dot(oc, rayDirection);
	float c = dot(oc, oc) - sphereCoordinates.w * sphereCoordinates.w;
	float h = b * b - c;
	if (h < 0.) return vec2(-1.);
	h = sqrt(h);
	return -b + vec2(-h, h);
}

float intersect(vec3 rayOrigin, vec3 rayDirection, out vec4 surfaceColor, float pixelDensity)
{
	float resolvedDistanceField =- 1.;

	// bounding sphere
	vec2 boundingSphere = sphere(vec4(0., 0., 0., 1.25), rayOrigin, rayDirection);
	if (boundingSphere.y < 0.) return-1.; // Bounding sphere not in view

	// raymarch fractal distance field
	vec4 tempSurfaceColor;

	float distanceField = boundingSphere.x;
	for(int i = 0; i < 70; i++)
	{
		vec3 rayPosition = rayOrigin + rayDirection * distanceField;
		float minDistance = .25 * pixelDensity * distanceField;
		float tempDistanceField = map(rayPosition, tempSurfaceColor);
		if (distanceField > boundingSphere.y || tempDistanceField < minDistance) break;
		distanceField += tempDistanceField;
	}

	if (distanceField < boundingSphere.y)
	{
		surfaceColor = tempSurfaceColor;
		resolvedDistanceField = distanceField;
	}

	return resolvedDistanceField;
}

float softshadow(vec3 rayOrigin, vec3 rayDirection, float strength)
{
	float lighting = 1.;
	float t = 0.;
	for(int i = 0;i < 32;i++)
	{
		vec4 kk;
		// Raymarch again from the position back to the light
		float distanceField = map(rayOrigin + rayDirection * t, kk);
		lighting = min(lighting, strength * distanceField / t);

		// If there is an obstacle,  don't add light value
		if (lighting < .001)break;
		t += clamp(distanceField, .01, .2);
	}
	return clamp(lighting, 0., 1.);
}

vec3 calcNormal(vec3 pos, float t, float px)
{
	vec4 tmp;
	vec2 e = vec2(1., -1.) * .5773 * .25 * px;
	return normalize(e.xyy * map(pos+e.xyy, tmp)+
	    e.yyx * map(pos+e.yyx, tmp)+
	    e.yxy * map(pos+e.yxy, tmp)+
	    e.xxx * map(pos+e.xxx, tmp));
}

vec3 render(vec2 fragCoord, mat4 cameraMatrix)
{
	// ray setup
	const float zoom = 1.5;

	vec2 screenSpace = (2. * fragCoord-uResolution.xy) / uResolution.y;
	float pixelDepth = 2. / (uResolution.y * zoom);

	vec3 rayOrigin = vec3(cameraMatrix[0].w, cameraMatrix[1].w, cameraMatrix[2].w);
	vec3 rayDirection = normalize((cameraMatrix * vec4(screenSpace, zoom, 0.)).xyz);

	// intersect fractal
	vec4 surfaceColor;
	float distanceField = intersect(rayOrigin, rayDirection, surfaceColor, pixelDepth);

	// sky
	if (distanceField < 0.) return vec3(1.);

	// fractal
	vec3 color = vec3(.01);
	color = mix(color, uFractalColor1, clamp(surfaceColor.y, 0., 1.));
	color = mix(color, uFractalColor2, clamp(surfaceColor.z * surfaceColor.z, 0., 1.));
	color = mix(color, uFractalColor3, clamp(pow(surfaceColor.w, 6.), 0., 1.));
	color *= .5;

	// lighting terms
	vec3 position = rayOrigin+distanceField*rayDirection;
	vec3 normal = calcNormal(position, distanceField, pixelDepth);
	vec3 specularDirection = normalize(lightPosition1 - rayDirection);
	float ambientOcclusion = clamp(.05 * log(surfaceColor.x), 0., 1.);
	float fac = clamp(1. + dot(rayDirection, normal), 0., 1.);

	// sun
	float shadow = softshadow(position + .001 * normal, lightPosition1, 32.);
	float diffuse1 = clamp(dot(lightPosition1, normal), 0., 1.) * shadow;
	float specular = pow(clamp(dot(normal, specularDirection), 0., 1.), 32.) * diffuse1 * (.04 + .96 * pow(clamp(1. - dot(specularDirection, lightPosition1), 0., 1.), 5.));
	// bounce
	float diffuse2 = clamp(.5 + .5 * dot(lightPosition2, normal), 0., 1.) * ambientOcclusion;
	// sky
	float diffuse3 = (.7 + .3 * normal.y) * (.2 + .8 * ambientOcclusion);

	vec3 lighting = vec3(0.);
	lighting += 7. * vec3(1.10, 1.10, 1.10) * diffuse1;
	lighting += 4. * vec3(.25, .25, .25) * diffuse2;
	lighting += 1.5 * vec3(.20, .20, .20) * diffuse3;
	lighting += 2.5 * vec3(.30, .30, .30) * (.05+.95 * ambientOcclusion); // ambient
	lighting += 4. * fac * ambientOcclusion; // fake SSS
	color *= lighting;
	color += specular * 15.;

	// gamma
	return sqrt(color);
}

mat4 createCameraMatrix(vec3 cameraPosition, float cameraRollAngle) {
	vec3 cp = vec3(sin(cameraRollAngle), cos(cameraRollAngle), 0.);
	vec3 cw = normalize(TARGET - cameraPosition);
	vec3 cu = normalize(cross(cw, cp));
	vec3 cv = cross(cu, cw);
	return mat4(cu, cameraPosition.x, cv, cameraPosition.y, cw, cameraPosition.z, 0., 0., 0., 1.);
}

void main() {
	float time = uTime * .0001;

	// camera
	vec3 cameraPosition = CAMERA_DISTANCE * vec3(1., 0., 0.);
	float cameraRollAngle = .5 * cos(time * .1);// Camera rotation perpendicular to view angle
	mat4 cameraMatrix = createCameraMatrix(cameraPosition, cameraRollAngle);

	// render
	#if ANTI_ALIAS_PASSES < 2
	vec3 color=render(gl_FragCoord.xy, cameraMatrix);
	#else
	vec3 color = vec3(0.);
	for(int j = 0; j < ANTI_ALIAS_PASSES; j++)
	for(int i = 0; i < ANTI_ALIAS_PASSES; i++)
	{
		color += render(gl_FragCoord.xy + (vec2(i, j)/float(ANTI_ALIAS_PASSES)), cameraMatrix);
	}
	color /= float(ANTI_ALIAS_PASSES * ANTI_ALIAS_PASSES);
	#endif

	gl_FragColor=vec4(color, 1.);
}