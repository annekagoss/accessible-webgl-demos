import { Vector3 } from '../../types';

export const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const interpolate = (v0: number, v1: number, t: number): number => v0 * (1 - t) + v1 * t;

export const interpolateVectors = (sourceVector: Vector3, targetVector: Vector3, amount: number): Vector3 => ({
	x: interpolate(sourceVector.x, targetVector.x, amount),
	y: interpolate(sourceVector.y, targetVector.y, amount),
	z: interpolate(sourceVector.z, targetVector.z, amount)
});

export const addVectors = (a: Vector3, b: Vector3): Vector3 => ({
	x: a.x + b.x,
	y: a.y + b.y,
	z: a.z + b.z
});

export const subtractVectors = (a: Vector3, b: Vector3): Vector3 => ({
	x: a.x - b.x,
	y: a.y - b.y,
	z: a.z - b.z
});

export const multiplyScalar = (v: Vector3, scalar: number): Vector3 => ({
	x: v.x * scalar,
	y: v.y * scalar,
	z: v.z * scalar
});

export const crossVectors = (a: Vector3, b: Vector3): Vector3 => ({
	x: a.y * b.z - a.z * b.y,
	y: a.z * b.x - a.x * b.z,
	z: a.x * b.y - a.y * b.x
});

export const normalizeVector = (v: Vector3): Vector3 => {
	const magnitude: number = vectorMagnitude(v);
	if (magnitude === 0) return v;
	return multiplyScalar(v, 1 / magnitude);
};

export const vectorMagnitude = ({ x, y, z }: Vector3): number => Math.sqrt(x * x + y * y + z * z);

const computeFaceNormal = (face: Vector3[]): Vector3 => {
	const [a, b, c] = face;
	const cb: Vector3 = subtractVectors(c, b);
	const ab: Vector3 = subtractVectors(a, b);
	const cross: Vector3 = crossVectors(cb, ab);
	/* We need to use === on -0 here because the recommended Object.is
      is not supported on IE. */
	if (cross.x === -0) cross.x = 0; // eslint-disable-line no-compare-neg-zero
	if (cross.y === -0) cross.y = 0; // eslint-disable-line no-compare-neg-zero
	if (cross.z === -0) cross.z = 0; // eslint-disable-line no-compare-neg-zero
	return normalizeVector(cross);
};

export const computeFaceNormals = (mesh: Vector3[][]): number[] =>
	mesh.reduce((result, face) => {
		const normal: Vector3 = computeFaceNormal(face);
		result = result.concat([normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z]);
		return result;
	}, [] as number[]);

export const computeBarycentricCoords = (numFaces: number): number[] => {
	const coords: number[] = [];
	for (let i = 0; i < numFaces; i++) {
		if (i % 2 === 0) {
			coords.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
		} else {
			coords.push(0, 1, 0, 0, 0, 1, 1, 0, 0);
		}
	}
	return coords;
};
