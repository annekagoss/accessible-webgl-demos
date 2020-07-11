import * as React from 'react';

import { InitializeProps, assignUniforms } from '../../../lib/gl/initialize';
import { LoadedShaders, MESH_TYPE, UNIFORM_TYPE, UniformSettings, Vector2 } from '../../../types';

import { BASE_UNIFORMS } from '../../utils/general';
import Source from './Source';
import cx from 'classnames';
import fragmentShader from '../../../lib/gl/shaders/moving-text.frag';
import styles from './MovingText.module.scss';
import { useAnimationFrame } from '../../hooks/animation';
import { useMouse } from '../../hooks/mouse';
import { useRasterizeToGL } from '../../hooks/rasterize';
import { useScrollPosition } from '../../hooks/scrollPosition';
import { useWindowSize } from '../../hooks/resize';
import vertexShader from '../../../lib/gl/shaders/base.vert';

const INITIAL_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uSamplerResolution0: {
		defaultValue: { x: 0, y: 0 },
		name: 'uSamplerResolution0',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
	uSamplerResolution1: {
		defaultValue: { x: 0, y: 0 },
		name: 'uSamplerResolution1',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
	uColor: {
		defaultValue: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
		name: 'uColor',
		readonly: true,
		type: UNIFORM_TYPE.VEC_4,
		value: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
	},
	uDownSampleFidelity: {
		defaultValue: 2.0,
		name: 'uDownSampleFidelity',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 2.0,
	},
	uScrollOffset: {
		defaultValue: { x: 0, y: 0 },
		name: 'uScrollOffset',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
	uMouse: {
		defaultValue: { x: 0, y: 0 },
		name: 'uMouse',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
};

interface Props {}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
}

const render = ({ gl, uniformLocations, uniforms, time, mousePos }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const MovingText = () => {
	const uniforms = React.useRef<UniformSettings>(INITIAL_UNIFORMS);
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: window.innerWidth * window.devicePixelRatio,
		y: window.innerHeight * window.devicePixelRatio,
	});
	const initialMousePosition = uniforms.current.uMouse ? uniforms.current.uMouse.defaultValue : { x: 0.5, y: 0.5 };
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * initialMousePosition.x,
		y: size.current.y * -initialMousePosition.y,
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const loadedShadersRef: React.MutableRefObject<LoadedShaders> = React.useRef<LoadedShaders>({ fragmentShader: null, vertexShader: null });
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const imageTexturesRef: React.MutableRefObject<Record<string, string>> = React.useRef<Record<string, string>>({});
	const texturesRef: React.MutableRefObject<WebGLTexture[]> = React.useRef<WebGLTexture[]>([]);
	const sourceElementRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>();
	const cursorElementRef: React.RefObject<HTMLImageElement> = React.useRef<HTMLImageElement>();
	const scrollRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>();
	const scrollPositionRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({ x: 0, y: 0 });
	const allowMotion: boolean = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
	if (!allowMotion)
		return (
			<div className={cx(styles.noMotion, styles.fullScreenCanvas)}>
				<Source
					ref={{
						sourceRef: sourceElementRef,
						cursorRef: cursorElementRef,
					}}
					uniforms={uniforms}
				/>
			</div>
		);

	const initializeGLProps: InitializeProps = {
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		programRef,
		loadedShadersRef,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES,
		imageTextures: imageTexturesRef.current,
		texturesRef,
	};
	useRasterizeToGL({
		sourceElementRef,
		cursorElementRef,
		imageTexturesRef,
		initializeGLProps,
		useDevicePixelRatio: false,
		reloadOnInteraction: false,
		reloadOnChange: [],
	});

	useWindowSize(canvasRef, gl, uniforms.current, size, true);
	useMouse(mousePosRef, scrollRef, true);
	useScrollPosition(({ x, y }: Vector2) => {
		uniforms.current.uScrollOffset.value = { x, y: y * 0.9 + 0.01 };
	}, scrollRef);

	useAnimationFrame(canvasRef, (time: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
		});
	});

	return (
		<div
			className={styles.canvasContainer}
			ref={scrollRef}
			onScroll={() => {
				console.log('canvasContainer');
			}}>
			<canvas
				ref={canvasRef}
				className={styles.fullScreenCanvas}
				width={size.current.x}
				height={size.current.y}
				aria-label='DOM rasterization canvas'
				role='img'
				onScroll={() => {
					console.log('canvas');
				}}
			/>
			<Source
				ref={{
					sourceRef: sourceElementRef,
					cursorRef: cursorElementRef,
				}}
				uniforms={uniforms}
			/>
		</div>
	);
};

export default MovingText;
