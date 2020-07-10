import {subtractVectors, normalizeVector, crossVectors} from './math';
import {Axis, LookAtOptions, PerspectiveOptions, Transformation, Vector3, Matrix} from '../../types';

const EPSILON: number = 0.000001;

export const createMat4 = (): Matrix => {
	const matrix: Matrix = new Float32Array(16);
	matrix[0] = 1;
	matrix[1] = 0;
	matrix[2] = 0;
	matrix[3] = 0;
	matrix[4] = 0;
	matrix[5] = 1;
	matrix[6] = 0;
	matrix[7] = 0;
	matrix[8] = 0;
	matrix[9] = 0;
	matrix[10] = 1;
	matrix[11] = 0;
	matrix[12] = 0;
	matrix[13] = 0;
	matrix[14] = 0;
	matrix[15] = 1;
	return matrix;
};

export const applyPerspective = ({sourceMatrix, fieldOfView, aspect, near, far}: PerspectiveOptions): Matrix => {
	const matrix: Matrix = sourceMatrix.slice();
	const f: number = 1.0 / Math.tan(fieldOfView / 2);
	matrix[0] = f / aspect;
	matrix[1] = 0;
	matrix[2] = 0;
	matrix[3] = 0;
	matrix[4] = 0;
	matrix[5] = f;
	matrix[6] = 0;
	matrix[7] = 0;
	matrix[8] = 0;
	matrix[9] = 0;
	matrix[11] = -1;
	matrix[12] = 0;
	matrix[13] = 0;
	matrix[15] = 1;
	if (far != null && far !== Infinity) {
		const nf: number = 1 / (near - far);
		matrix[10] = (far + near) * nf;
		matrix[14] = -1;
	} else {
		matrix[10] = -1;
		matrix[14] = -2 * near;
	}
	return matrix;
};

export const applyTransformation = (sourceMatrix: Matrix, {translation, rotation, scale}: Transformation): Matrix => {
	let matrix = sourceMatrix.slice();
	matrix = applyTranslation(matrix, translation);
	matrix = applyRotation(matrix, rotation);
	matrix = applyScale(matrix, scale);
	return matrix;
};

export const invertMatrix = (sourceMatrix: Matrix): Matrix => {
	const matrix: Matrix = sourceMatrix.slice();

	const a00: number = sourceMatrix[0];
	const a01: number = sourceMatrix[1];
	const a02: number = sourceMatrix[2];
	const a03: number = sourceMatrix[3];

	const a10: number = sourceMatrix[4];
	const a11: number = sourceMatrix[5];
	const a12: number = sourceMatrix[6];
	const a13: number = sourceMatrix[7];

	const a20: number = sourceMatrix[8];
	const a21: number = sourceMatrix[9];
	const a22: number = sourceMatrix[10];
	const a23: number = sourceMatrix[11];

	const a30: number = sourceMatrix[12];
	const a31: number = sourceMatrix[13];
	const a32: number = sourceMatrix[14];
	const a33: number = sourceMatrix[15];

	const b00: number = a00 * a11 - a01 * a10;
	const b01: number = a00 * a12 - a02 * a10;
	const b02: number = a00 * a13 - a03 * a10;
	const b03: number = a01 * a12 - a02 * a11;
	const b04: number = a01 * a13 - a03 * a11;
	const b05: number = a02 * a13 - a03 * a12;
	const b06: number = a20 * a31 - a21 * a30;
	const b07: number = a20 * a32 - a22 * a30;
	const b08: number = a20 * a33 - a23 * a30;
	const b09: number = a21 * a32 - a22 * a31;
	const b10: number = a21 * a33 - a23 * a31;
	const b11: number = a22 * a33 - a23 * a32;

	let det: number = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	if (!det) return sourceMatrix;
	det = 1.0 / det;

	matrix[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	matrix[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	matrix[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	matrix[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	matrix[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	matrix[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	matrix[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	matrix[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	matrix[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	matrix[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	matrix[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	matrix[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	matrix[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	matrix[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	matrix[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	matrix[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	return matrix;
};

export const transposeMatrix = (sourceMatrix: Matrix): Matrix => {
	const matrix: Matrix = sourceMatrix.slice();

	matrix[1] = sourceMatrix[4];
	matrix[2] = sourceMatrix[8];
	matrix[3] = sourceMatrix[12];
	matrix[4] = sourceMatrix[1];
	matrix[6] = sourceMatrix[9];
	matrix[7] = sourceMatrix[13];
	matrix[8] = sourceMatrix[2];
	matrix[9] = sourceMatrix[6];
	matrix[11] = sourceMatrix[14];
	matrix[12] = sourceMatrix[3];
	matrix[13] = sourceMatrix[7];
	matrix[14] = sourceMatrix[11];

	return matrix;
};

export const applyTranslation = (sourceMatrix: Matrix, translation: Vector3): Matrix => {
	const {x, y, z} = translation;
	const matrix: Matrix = sourceMatrix.slice();
	matrix[12] = sourceMatrix[0] * x + sourceMatrix[4] * y + sourceMatrix[8] * z + sourceMatrix[12];
	matrix[13] = sourceMatrix[1] * x + sourceMatrix[5] * y + sourceMatrix[9] * z + sourceMatrix[13];
	matrix[14] = sourceMatrix[2] * x + sourceMatrix[6] * y + sourceMatrix[10] * z + sourceMatrix[14];
	matrix[15] = sourceMatrix[3] * x + sourceMatrix[7] * y + sourceMatrix[11] * z + sourceMatrix[15];
	return matrix;
};

export const applyRotation = (sourceMatrix: Matrix, rotation: Vector3): Matrix => {
	const {x, y, z} = rotation;
	let matrix: Matrix = sourceMatrix.slice();
	matrix = rotateAlongAxis(matrix, x, 'x');
	matrix = rotateAlongAxis(matrix, y, 'y');
	matrix = rotateAlongAxis(matrix, z, 'z');
	return matrix;
};

const applyScale = (sourceMatrix: Matrix, scale: number): Matrix => {
	const matrix: Matrix = sourceMatrix.slice();
	matrix[0] *= scale;
	matrix[1] *= scale;
	matrix[2] *= scale;
	matrix[3] *= scale;
	matrix[4] *= scale;
	matrix[5] *= scale;
	matrix[6] *= scale;
	matrix[7] *= scale;
	matrix[8] *= scale;
	matrix[9] *= scale;
	matrix[10] *= scale;
	matrix[11] *= scale;
	return matrix;
};

const rotateAlongAxis = (sourceMatrix: Matrix, angle: number, axis: Axis) => {
	let x: number;
	let y: number;
	let z: number;

	switch (axis) {
		case 'x':
			[x, y, z] = [1, 0, 0];
			break;
		case 'y':
			[x, y, z] = [0, 1, 0];
			break;
		case 'z':
			[x, y, z] = [0, 0, 1];
			break;
		default:
			return sourceMatrix;
	}

	const matrix: Matrix = sourceMatrix.slice();
	const length: number = 1 / Math.sqrt(x * x + y * y + z * z);
	x *= length;
	y *= length;
	z *= length;

	const sine: number = Math.sin(angle);
	const cosine: number = Math.cos(angle);
	const t: number = 1 - cosine;

	const a00: number = sourceMatrix[0];
	const a01: number = sourceMatrix[1];
	const a02: number = sourceMatrix[2];
	const a03: number = sourceMatrix[3];

	const a10: number = sourceMatrix[4];
	const a11: number = sourceMatrix[5];
	const a12: number = sourceMatrix[6];
	const a13: number = sourceMatrix[7];

	const a20: number = sourceMatrix[8];
	const a21: number = sourceMatrix[9];
	const a22: number = sourceMatrix[10];
	const a23: number = sourceMatrix[11];

	const b00: number = x * x * t + cosine;
	const b01: number = y * x * t + z * sine;
	const b02: number = z * x * t - y * sine;

	const b10: number = x * y * t - z * sine;
	const b11: number = y * y * t + cosine;
	const b12: number = z * y * t + x * sine;

	const b20: number = x * z * t + y * sine;
	const b21: number = y * z * t - x * sine;
	const b22: number = z * z * t + cosine;

	matrix[0] = a00 * b00 + a10 * b01 + a20 * b02;
	matrix[1] = a01 * b00 + a11 * b01 + a21 * b02;
	matrix[2] = a02 * b00 + a12 * b01 + a22 * b02;
	matrix[3] = a03 * b00 + a13 * b01 + a23 * b02;
	matrix[4] = a00 * b10 + a10 * b11 + a20 * b12;
	matrix[5] = a01 * b10 + a11 * b11 + a21 * b12;
	matrix[6] = a02 * b10 + a12 * b11 + a22 * b12;
	matrix[7] = a03 * b10 + a13 * b11 + a23 * b12;
	matrix[8] = a00 * b20 + a10 * b21 + a20 * b22;
	matrix[9] = a01 * b20 + a11 * b21 + a21 * b22;
	matrix[10] = a02 * b20 + a12 * b21 + a22 * b22;
	matrix[11] = a03 * b20 + a13 * b21 + a23 * b22;

	return matrix;
};

export const lookAt = (sourceMatrix: Matrix, {target, origin, up}: LookAtOptions): Matrix => {
	const matrix: Matrix = sourceMatrix.slice();

	const distance: Vector3 = subtractVectors(origin, target);
	if (Math.abs(distance.x) < EPSILON && Math.abs(distance.y) < EPSILON && Math.abs(distance.z) < EPSILON) {
		return matrix;
	}

	const z: Vector3 = normalizeVector(distance);
	const x: Vector3 = normalizeVector(crossVectors(up, z));
	const y: Vector3 = normalizeVector(crossVectors(z, x));

	matrix[0] = x.x;
	matrix[1] = y.x;
	matrix[2] = z.x;
	matrix[3] = 0;

	matrix[4] = x.y;
	matrix[5] = y.y;
	matrix[6] = z.y;
	matrix[7] = 0;

	matrix[8] = x.z;
	matrix[9] = y.z;
	matrix[10] = z.z;
	matrix[11] = 0;

	matrix[12] = -(x.x * origin.x + x.y * origin.y + x.z * origin.z);
	matrix[13] = -(y.x * origin.x + y.y * origin.y + y.z * origin.z);
	matrix[14] = -(z.x * origin.x + z.y * origin.y + z.z * origin.z);
	matrix[15] = 1;

	return concat(sourceMatrix, matrix);
};

export const concat = (a: Matrix, b: Matrix): Matrix => {
	const matrix: Matrix = createMat4();
	const a00: number = a[0];
	const a01: number = a[1];
	const a02: number = a[2];
	const a03: number = a[3];
	const a10: number = a[4];
	const a11: number = a[5];
	const a12: number = a[6];
	const a13: number = a[7];
	const a20: number = a[8];
	const a21: number = a[9];
	const a22: number = a[10];
	const a23: number = a[11];
	const a30: number = a[12];
	const a31: number = a[13];
	const a32: number = a[14];
	const a33: number = a[15];

	// Cache only the current line of the second matrix
	let b0: number = b[0];
	let b1: number = b[1];
	let b2: number = b[2];
	let b3: number = b[3];
	matrix[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	matrix[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	matrix[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	matrix[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];

	matrix[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	matrix[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	matrix[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	matrix[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	matrix[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	matrix[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	matrix[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	matrix[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	matrix[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	matrix[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	matrix[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	matrix[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return matrix;
};

export const applyMatrixToVector3 = ({x, y, z}: Vector3, sourceMatrix: Matrix): Vector3 => {
	const matrix: Matrix = sourceMatrix.slice();
	const w = 1 / (matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]);
	return {
		x: (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) * w,
		y: (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) * w,
		z: (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) * w
	};
};
