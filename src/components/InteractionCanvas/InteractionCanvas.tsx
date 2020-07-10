import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, Vector2, Matrix, Vector3, Mesh, Buffers, MESH_TYPE, Buffer, OBJData, FBO, Interaction, LoadedShaders } from '../../../types';
import { initializeGL } from '../../hooks/gl';
import { useAnimationFrame } from '../../hooks/animation';
import { useWindowSize } from '../../hooks/resize';
import { assignProjectionMatrix, assignUniforms } from '../../../lib/gl/initialize';
import { createMat4, applyTransformation, invertMatrix, transposeMatrix, lookAt } from '../../../lib/gl/matrix';
import { degreesToRadians } from '../../../lib/gl/math';
import { useOBJLoaderWebWorker } from '../../hooks/webWorker';
import { formatAttributes, isSafari } from '../../utils/general';
import styles from './InteractionCanvas.module.scss';
import { lookAtMouse, updateInteraction, getInitialInteraction } from '../../../lib/gl/interaction';
import { useGyroscope } from '../../hooks/gyroscope';
import { useDrag } from '../../hooks/drag';
import { useMouse } from '../../hooks/mouse';
import { useUpdateShaders } from '../../hooks/updateShaders';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	OBJData: OBJData;
	setFragmentError: (error: Error | null) => void;
	setVertexError: (error: Error | null) => void;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	size: Vector2;
	buffers: Buffers;
	outlineProgram: WebGLProgram;
	program: WebGLProgram;
	outlineUniformLocations: Record<string, WebGLUniformLocation>;
	baseVertexBuffer: Buffer;
	FBOA: FBO;
	FBOB: FBO;
	pingPong: number;
	interaction: Interaction;
}

const IS_SAFARI: boolean = isSafari();
const IS_MOBILE: boolean = Boolean('ontouchstart' in window);
const ENABLE_FRAMEBUFFER: boolean = !IS_SAFARI && !IS_MOBILE;
const ENABLE_WEBWORKER: boolean = !IS_SAFARI && !IS_MOBILE;

const render = (props: RenderProps) => {
	if (!props.gl) return;
	const { gl, size, uniformLocations, outlineUniformLocations, program, outlineProgram, FBOA, FBOB } = props;

	if (!ENABLE_FRAMEBUFFER) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		draw(props);
		return;
	}

	gl.activeTexture(gl.TEXTURE7);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOA.buffer);
	gl.viewport(0, 0, FBOA.textureWidth, FBOA.textureHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);
	gl.uniform1i(uniformLocations.uOutlinePass, 1);
	draw(props);

	gl.activeTexture(gl.TEXTURE8);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOB.buffer);
	gl.uniform1i(uniformLocations.uOutlinePass, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	draw(props);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, size.x, size.y);
	gl.useProgram(outlineProgram);

	gl.activeTexture(gl.TEXTURE7);
	gl.bindTexture(gl.TEXTURE_2D, FBOA.targetTexture);
	gl.uniform1i(outlineUniformLocations.uOutline, 7);

	gl.activeTexture(gl.TEXTURE8);
	gl.bindTexture(gl.TEXTURE_2D, FBOB.targetTexture);
	gl.uniform1i(outlineUniformLocations.uSource, 8);

	gl.uniform2fv(outlineUniformLocations.uResolution, [size.x, size.y]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawOutlines(props);
};

const drawOutlines = ({ gl, outlineProgram, uniforms, outlineUniformLocations, baseVertexBuffer }: RenderProps) => {
	const vertexPosition = gl.getAttribLocation(outlineProgram, 'aBaseVertexPosition');
	gl.uniform2fv(outlineUniformLocations.uResolution, Object.values(uniforms.uResolution.value));
	gl.enableVertexAttribArray(vertexPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, baseVertexBuffer.buffer);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(vertexPosition);
};

const createModelViewMatrix = (mousePos, size, projectionMatrix, interaction, uniforms): Matrix => {
	const translation: Vector3 = uniforms.uTranslation.value;
	const scale: number = uniforms.uScale.value;
	if (interaction.gyroscope.enabled || interaction.drag.enabled) {
		const modelViewMatrix = lookAt(createMat4(), {
			target: { x: 0, y: 0, z: 0.5 },
			origin: { x: 0, y: 0, z: 0 },
			up: { x: 0, y: 1, z: 0 },
		});
		return applyTransformation(modelViewMatrix, {
			translation,
			rotation: interaction.rotation,
			scale,
		});
	} else {
		const rotation = uniforms.uRotation.value;
		const modelViewMatrix = lookAtMouse(mousePos, size, projectionMatrix, createMat4());
		return applyTransformation(modelViewMatrix, {
			translation,
			rotation: {
				x: degreesToRadians(rotation.x),
				y: degreesToRadians(rotation.y),
				z: degreesToRadians(rotation.z),
			},
			scale,
		});
	}
};

const draw = ({ gl, uniformLocations, uniforms, buffers, time, mousePos, size, program, interaction }: RenderProps): void => {
	const projectionMatrix: Matrix = assignProjectionMatrix(gl, uniformLocations, size);
	const modelViewMatrix: Matrix = createModelViewMatrix(mousePos, size, projectionMatrix, interaction, uniforms);

	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	let normalMatrix: Float32Array = invertMatrix(modelViewMatrix);
	normalMatrix = transposeMatrix(normalMatrix);
	gl.uniformMatrix4fv(uniformLocations.uNormalMatrix, false, normalMatrix);
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.barycentricBuffer.buffer);
	const barycentricLocation = gl.getAttribLocation(program, 'aBarycentric');
	gl.vertexAttribPointer(barycentricLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(barycentricLocation);

	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
};

const InteractionCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes, OBJData, setFragmentError, setVertexError }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: window.innerWidth * window.devicePixelRatio,
		y: window.innerHeight * window.devicePixelRatio * 0.75,
	});
	uniforms.current.uResolution.value = size.current;

	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * 0.5,
		y: size.current.y * -0.5,
	});
	const rotation = uniforms.current.uRotation.value;
	const interactionRef: React.MutableRefObject<Interaction> = React.useRef<Interaction>(getInitialInteraction(rotation));
	const gl = React.useRef<WebGLRenderingContext>();
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const loadedShadersRef: React.MutableRefObject<LoadedShaders> = React.useRef<LoadedShaders>({ fragmentShader: null, vertexShader: null });
	const uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const meshRef: React.MutableRefObject<Mesh> = React.useRef<Mesh>();
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null,
		barycentricBuffer: null,
	});
	// Toon outline pass
	const outlineProgramRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const outlineUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const baseVertexBufferRef: React.MutableRefObject<Buffer> = React.useRef<Buffer>();
	const FBOA: React.MutableRefObject<FBO> = React.useRef();
	const FBOB: React.MutableRefObject<FBO> = React.useRef();

	useOBJLoaderWebWorker({
		onLoadHandler: (message) => {
			meshRef.current = message;
			initializeGL({
				gl,
				uniformLocations,
				canvasRef,
				buffersRef: buffersRef,
				fragmentSource: fragmentShader,
				vertexSource: vertexShader,
				programRef,
				loadedShadersRef,
				uniforms: uniforms.current,
				size,
				mesh: meshRef.current,
				meshType: MESH_TYPE.OBJ,
				outlineProgramRef,
				outlineUniformLocations,
				baseVertexBufferRef,
				FBOA,
				FBOB,
				setAttributes: (buffers) => setAttributes(formatAttributes(buffers)),
			});
		},
		OBJData,
		useWebWorker: ENABLE_WEBWORKER,
	});

	useUpdateShaders({ gl, programRef, loadedShadersRef, uniformLocations, uniforms, fragmentShader, vertexShader, setFragmentError, setVertexError });
	useWindowSize(canvasRef, gl, uniforms.current, size);
	useGyroscope(interactionRef);
	useMouse(mousePosRef, canvasRef);
	useDrag(interactionRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number, pingPong: number) => {
		interactionRef.current = updateInteraction(interactionRef.current);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			interaction: interactionRef.current,
			size: size.current,
			buffers: buffersRef.current,
			outlineProgram: outlineProgramRef.current,
			program: programRef.current,
			outlineUniformLocations: outlineUniformLocations.current,
			baseVertexBuffer: baseVertexBufferRef.current,
			FBOA: FBOA.current,
			FBOB: FBOB.current,
			pingPong,
		});
	});

	return (
		<div className={styles.canvasContainer}>
			<div className={styles.canvasBackground}>
				<div className={cx(styles.text, !IS_MOBILE && styles.enabled)}>HOVER {IS_MOBILE ? 'OFF' : 'ON'}</div>
				<div className={cx(styles.text, IS_MOBILE && styles.enabled)}>DRAG {IS_MOBILE ? 'ON' : 'OFF'}</div>
			</div>
			<canvas ref={canvasRef} width={size.current.x} height={size.current.y} className={styles.fullScreenCanvas} role='img' />
		</div>
	);
};

export default InteractionCanvas;
