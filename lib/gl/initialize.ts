import { Buffer, Buffers, FBO, Mesh, Matrix, Vector2, FaceArray, UniformSetting, UniformSettings, MESH_TYPE, UNIFORM_TYPE, LoadedShaders } from '../../types';
import { degreesToRadians } from './math';
import { createMat4, applyPerspective, lookAt } from './matrix';
import { NEAR_CLIPPING, FAR_CLIPPING, FIELD_OF_VIEW } from './settings';
import outlineFragmentSource from '../../lib/gl/shaders/outline.frag';
import outlineVertexSource from '../../lib/gl/shaders/base.vert';
import { initBaseMeshBuffers, initMeshBuffersFromFaceArray, initBuffers } from './buffers';
import { initFrameBufferObject } from './frameBuffer';

export interface InitializeProps {
	gl: React.MutableRefObject<WebGLRenderingContext>;
	programRef?: React.MutableRefObject<WebGLProgram>;
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	outlineUniformLocations?: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSettings;
	size: React.MutableRefObject<Vector2>;
	FBOA?: React.MutableRefObject<FBO>;
	FBOB?: React.MutableRefObject<FBO>;
	faceArray?: FaceArray;
	buffersRef?: React.MutableRefObject<Buffers>;
	mesh?: Mesh;
	meshType: MESH_TYPE;
	shouldUseDepth?: boolean;
	supportsDepthRef?: React.MutableRefObject<boolean>;
	outlineProgramRef?: React.MutableRefObject<WebGLProgram>;
	baseVertexBufferRef?: React.MutableRefObject<Buffer>;
	imageTextures?: Record<string, string>;
	texturesRef?: React.MutableRefObject<WebGLTexture[]>;
	loadedShadersRef?: React.MutableRefObject<LoadedShaders>;
	setAttributes?: (buffers: Buffers) => void;
}

export const initializeRenderer = ({ uniformLocations, canvasRef, fragmentSource, vertexSource, uniforms, size, FBOA, FBOB, outlineUniformLocations, loadedShadersRef }: InitializeProps) => {
	if (!canvasRef.current) return;
	const gl: WebGLRenderingContext = (canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext) || (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

	gl.clearColor(0, 0, 0, 0);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, size.current.x, size.current.y);
	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE); // Prevents culling for wireframes

	const { program, loadedShaders } = initShaderProgram(gl, vertexSource, fragmentSource);
	loadedShadersRef.current = loadedShaders;
	gl.useProgram(program);

	const usePingPongBuffers: boolean = Boolean(FBOA && FBOB);

	uniformLocations.current = createUniformLocations(gl, program, uniforms, usePingPongBuffers);

	if (usePingPongBuffers) {
		const FBOSize: Vector2 = uniforms.uResolution.value;
		FBOA.current = initFrameBufferObject(gl, FBOSize.x, FBOSize.y);
		FBOB.current = initFrameBufferObject(gl, FBOSize.x, FBOSize.y);
	}
	let outlineProgram;
	if (outlineUniformLocations) {
		outlineProgram = initializeOutlineProgram(gl, outlineUniformLocations);
	}

	return { gl, program, outlineProgram };
};

export const createUniformLocations = (gl: WebGLRenderingContext, program: WebGLProgram, uniforms: UniformSettings, usePingPongBuffers: boolean): Record<string, WebGLUniformLocation> => ({
	...mapUniformSettingsToLocations(uniforms, gl, program, usePingPongBuffers),
	uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
	uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
	uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
	uDisplacement: gl.getUniformLocation(program, 'uDisplacement'),
	uOutlinePass: gl.getUniformLocation(program, 'uOutlinePass'),
	uDiffuse0: gl.getUniformLocation(program, 'uDiffuse0'),
	uDiffuse1: gl.getUniformLocation(program, 'uDiffuse1'),
	uDiffuse2: gl.getUniformLocation(program, 'uDiffuse2'),
	uDiffuse3: gl.getUniformLocation(program, 'uDiffuse3'),
	uDiffuse4: gl.getUniformLocation(program, 'uDiffuse4'),
});

const initShaderProgram = (gl: WebGLRenderingContext, vertSource: string, fragSource: string) => {
	const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vertSource);
	const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fragSource);
	const program: WebGLProgram = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.warn('Unabled to initialize the shader program: ' + gl.getProgramInfoLog(program)); /* tslint:disable-line no-console */
	}
	return { program, loadedShaders: { fragmentShader, vertexShader } };
};

const initializeOutlineProgram = (gl: WebGLRenderingContext, outlineUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>) => {
	const { program } = initShaderProgram(gl, outlineVertexSource, outlineFragmentSource);
	outlineUniformLocations.current = {
		uSource: gl.getUniformLocation(program, 'uSource'),
		uOutline: gl.getUniformLocation(program, 'uOutline'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
	};
	return program;
};

export const mapUniformSettingsToLocations = (settings: UniformSettings, gl: WebGLRenderingContext, program: WebGLProgram, useFrameBuffer: boolean): Record<string, WebGLUniformLocation> => {
	const locations: Record<string, WebGLUniformLocation> = useFrameBuffer
		? {
				frameBufferTexture0: gl.getUniformLocation(program, 'frameBufferTexture0'),
		  }
		: {};
	return Object.keys(settings).reduce((result, name) => {
		result[name] = gl.getUniformLocation(program, name);
		return result;
	}, locations);
};

export const initializeMesh = (
	{ faceArray, buffersRef, meshType, mesh, baseVertexBufferRef, setAttributes }: InitializeProps,
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	outlineProgram: WebGLProgram
) => {
	switch (meshType) {
		case MESH_TYPE.BASE_TRIANGLES:
			initBaseMeshBuffers(gl, program);
			break;
		case MESH_TYPE.FACE_ARRAY:
			if (!faceArray) return;
			buffersRef.current = initMeshBuffersFromFaceArray(gl, program, faceArray, true);
			setAttributes && setAttributes(buffersRef.current);
			break;
		case MESH_TYPE.OBJ:
			if (outlineProgram) {
				gl.useProgram(outlineProgram);
				baseVertexBufferRef.current = initBaseMeshBuffers(gl, outlineProgram);
			}
			gl.useProgram(program);
			buffersRef.current = initBuffers(gl, program, mesh, true);
			setAttributes && setAttributes(buffersRef.current);
			break;
		default:
			initBaseMeshBuffers(gl, program);
	}
};

export const loadShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
	const shader: WebGLShader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const errorMessage = 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader);
		console.warn('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)); /* tslint:disable-line no-console */
		gl.deleteShader(shader);
		throw new Error(errorMessage);
		return;
	}
	return shader;
};

export const assignProjectionMatrix = (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, size: Vector2): Matrix => {
	if (!size) return;
	let projectionMatrix: Matrix = applyPerspective({
		sourceMatrix: createMat4(),
		fieldOfView: degreesToRadians(FIELD_OF_VIEW),
		aspect: size.x / size.y,
		near: NEAR_CLIPPING,
		far: FAR_CLIPPING,
	});
	projectionMatrix = lookAt(projectionMatrix, {
		target: { x: 0, y: 0, z: 0 },
		origin: { x: 0, y: 0, z: 6 },
		up: { x: 0, y: 1, z: 0 },
	});

	gl.uniformMatrix4fv(uniformLocations.uProjectionMatrix, false, projectionMatrix);

	return projectionMatrix;
};

// Initialize texture to be displayed while webworker loads OBJ
export function initPlaceholderTexture(gl: WebGLRenderingContext): WebGLTexture {
	const texture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	return texture;
}

export const assignUniforms = (uniforms: UniformSettings, uniformLocations: Record<string, WebGLUniformLocation>, gl: WebGLRenderingContext, time: number, mousePos?: Vector2) => {
	Object.keys(uniforms).forEach((name: string) => {
		const uniform: UniformSetting = uniforms[name];
		switch (uniform.type) {
			case UNIFORM_TYPE.FLOAT_1:
				if (uniform.name === 'uTime') {
					uniform.value = time;
				}
				gl.uniform1f(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.INT_1:
				gl.uniform1i(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.VEC_2:
				if (uniform.name === 'uMouse') {
					uniform.value = Object.values(mousePos);
				}
				gl.uniform2fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			case UNIFORM_TYPE.VEC_3:
				gl.uniform3fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			case UNIFORM_TYPE.VEC_4:
				gl.uniform4fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			default:
				break;
		}
	});
};
