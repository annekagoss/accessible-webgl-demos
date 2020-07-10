import { computeBarycentricCoords, computeFaceNormals } from './math';
import { Mesh, Buffers, Buffer, FaceArray, Vector3 } from '../../types';
import { BASE_TRIANGLE_MESH } from './settings';

interface BufferInput {
	gl: WebGLRenderingContext;
	type: number;
	data: number[];
	itemSize: number;
}

const initVertexBuffer = (gl: WebGLRenderingContext, program: WebGLProgram, positions: number[]): Buffer => {
	const vertexBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: positions,
		itemSize: 3,
	});
	const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);
	return { ...vertexBuffer, data: positions };
};

const initNormalBuffer = (gl: WebGLRenderingContext, program: WebGLProgram, normals: number[]): Buffer => {
	const normalBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: normals,
		itemSize: 3,
	});
	const vertexNormal = gl.getAttribLocation(program, 'aVertexNormal');
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);
	return { ...normalBuffer, data: normals };
};

const initTextureBuffer = (gl: WebGLRenderingContext, program: WebGLProgram, textures: number[]): Buffer => {
	const textureBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: textures,
		itemSize: 2,
	});
	const textureCoord = gl.getAttribLocation(program, 'aTextureCoord');
	gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoord);
	return { ...textureBuffer, data: textures };
};

const initTextureAddressBuffer = (gl: WebGLRenderingContext, program: WebGLProgram, textureAddresses: number[]): Buffer => {
	const textureAddressBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: textureAddresses,
		itemSize: 1,
	});
	const textureAddress = gl.getAttribLocation(program, 'aTextureAddress');
	gl.vertexAttribPointer(textureAddress, 1, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureAddress);
	return { ...textureAddressBuffer, data: textureAddresses };
};

const initBarycentricBuffer = (gl: WebGLRenderingContext, program: WebGLProgram, numFaces: number, useBarycentric: boolean): Buffer => {
	if (!useBarycentric) return;

	const barycentric = computeBarycentricCoords(numFaces);
	const barycentricBuffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: barycentric,
		itemSize: 3,
	});
	const barycentricLocation = gl.getAttribLocation(program, 'aBarycentric');
	gl.vertexAttribPointer(barycentricLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(barycentricLocation);
	return { ...barycentricBuffer, data: barycentric };
};

export const initBuffers = (gl: WebGLRenderingContext, program: WebGLProgram, loadedMesh: Mesh, useBarycentric: boolean): Buffers => {
	const { positions, normals, textures, textureAddresses, indices }: Mesh = loadedMesh;

	const indexBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ELEMENT_ARRAY_BUFFER,
		data: indices,
		itemSize: 1,
	});

	return {
		indexBuffer: { ...indexBuffer, data: indices },
		normalBuffer: initNormalBuffer(gl, program, normals),
		textureAddressBuffer: initTextureAddressBuffer(gl, program, textureAddresses),
		textureBuffer: initTextureBuffer(gl, program, textures),
		vertexBuffer: initVertexBuffer(gl, program, positions),
		barycentricBuffer: initBarycentricBuffer(gl, program, Math.round(positions.length / 3), useBarycentric),
	};
};

export const buildBuffer = ({ gl, type, data, itemSize }: BufferInput): Buffer => {
	const buffer: WebGLBuffer = gl.createBuffer();
	const ArrayView: Float32ArrayConstructor | Uint16ArrayConstructor = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
	gl.bindBuffer(type, buffer);
	gl.bufferData(type, new ArrayView(data), gl.STATIC_DRAW);
	const numItems: number = data.length / itemSize;
	return {
		buffer,
		data,
		itemSize,
		numItems,
	};
};

export const initMeshBuffersFromFaceArray = (gl: WebGLRenderingContext, program: WebGLProgram, faceArray: FaceArray, useBarycentric: boolean) => {
	const vertices = faceArray.flat();
	const positions: number[] = vertices.map((coordinate: Vector3) => Object.values(coordinate)).flat();

	return {
		vertexBuffer: initVertexBuffer(gl, program, positions),
		normalBuffer: initNormalBuffer(gl, program, computeFaceNormals(faceArray)),
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null,
		barycentricBuffer: initBarycentricBuffer(gl, program, faceArray.length, useBarycentric),
	};
};

// Mesh made of two triangles that acts as a projection screen for fragment shaders
export const initBaseMeshBuffers = (gl: WebGLRenderingContext, program: WebGLProgram) => {
	const buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: BASE_TRIANGLE_MESH,
		itemSize: 3,
	});
	const vertexPosition = gl.getAttribLocation(program, 'aBaseVertexPosition');
	gl.enableVertexAttribArray(vertexPosition);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	return buffer;
};
