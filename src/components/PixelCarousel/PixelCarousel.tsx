import * as React from 'react';

import { LoadedShaders, MESH_TYPE, UNIFORM_TYPE, UniformSettings, Vector2 } from '../../../types';

import { BASE_UNIFORMS } from '../../utils/general';
import { assignUniforms } from '../../../lib/gl/initialize';
import initialFragmentShader from '../../../lib/gl/shaders/pixel-carousel.frag';
import initialVertexShader from '../../../lib/gl/shaders/base.vert';
import slideImage1 from '../../assets/products/grape.png';
import slideImage2 from '../../assets/products/glacier-cherry.png';
import slideImage3 from '../../assets/products/glacier.png';
import slideImage4 from '../../assets/products/green-apple.png';
import slideImage5 from '../../assets/products/mango.png';
import slideImage6 from '../../assets/products/strawberry-watermelon.png';
import slideImage7 from '../../assets/products/strawberry.png';
import slideImage8 from '../../assets/products/orange.png';
import styles from './PixelCarousel.module.scss';
import { updateTransitionProgress } from '../../utils/transition';
import { useAnimationFrame } from '../../hooks/animation';
import { useInitializeGL } from '../../hooks/gl';
import { useMouse } from '../../hooks/mouse';
import { useWindowSize } from '../../hooks/resize';

const slideImages = { slideImage1, slideImage2, slideImage3, slideImage4, slideImage5, slideImage6 };

const SLIDE_SIZE = {
	x: 804 * 0.5,
	y: 1700 * 0.5 - 40,
};

interface Props {}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
	transitionProgress: number;
}

const INITIAL_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uDirection: {
		defaultValue: 1,
		name: 'uDirection',
		readonly: true,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uTransitionProgress: {
		defaultValue: 0.0,
		name: 'uTransitionProgress',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0,
	},
	uSlideResolution: {
		defaultValue: SLIDE_SIZE,
		name: 'uSlideResolution',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: SLIDE_SIZE,
	},
};

const render = ({ gl, uniformLocations, uniforms, time, mousePos }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const PixelCarousel = () => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const uniforms: React.MutableRefObject<UniformSettings> = React.useRef<UniformSettings>(INITIAL_UNIFORMS);
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: SLIDE_SIZE.x * 2.0 * window.devicePixelRatio,
		y: SLIDE_SIZE.y * window.devicePixelRatio,
	});
	uniforms.current.uResolution.value = size.current;
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * 0.5,
		y: size.current.y * -0.5,
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const loadedShadersRef: React.MutableRefObject<LoadedShaders> = React.useRef<LoadedShaders>({ fragmentShader: null, vertexShader: null });
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const transitionTimeRef: React.MutableRefObject<number> = React.useRef<number>(0);
	const transitionDirectionRef: React.MutableRefObject<number> = React.useRef<number>(1);
	const slideIndexRef: React.MutableRefObject<number> = React.useRef<number>(0);
	const isTransitioningRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const transitionProgressRef: React.MutableRefObject<number> = React.useRef<number>(0);
	const texturesRef: React.MutableRefObject<WebGLTexture[]> = React.useRef<WebGLTexture[]>([]);

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: initialFragmentShader,
		vertexSource: initialVertexShader,
		programRef,
		loadedShadersRef,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES,
		imageTextures: slideImages,
		texturesRef,
	});

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number) => {
		updateTransitionProgress({
			gl,
			uniformLocations,
			transitionTimeRef,
			slideIndexRef,
			isTransitioningRef,
			transitionProgressRef,
			transitionDirectionRef,
			texturesRef,
		});
		uniforms.current.uTransitionProgress.value = transitionProgressRef.current;
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			transitionProgress: transitionProgressRef.current,
		});
	});

	return (
		<div className={styles.canvasContainer}>
			<canvas ref={canvasRef} width={size.current.x} height={size.current.y} className={styles.fullScreenCanvas} role='img' />
			<div className={styles.canvasForeground}>
				<button
					className={styles.button}
					onClick={() => {
						if (isTransitioningRef.current) return;
						isTransitioningRef.current = true;
						transitionProgressRef.current = 0;
						transitionTimeRef.current = 0;
						transitionDirectionRef.current = -1;
						uniforms.current.uDirection.value = -1;
					}}>
					{'<'}
				</button>
				<button
					className={styles.button}
					onClick={() => {
						if (isTransitioningRef.current) return;
						isTransitioningRef.current = true;
						transitionDirectionRef.current = 1;
						uniforms.current.uDirection.value = 1;
					}}>
					{'>'}
				</button>
			</div>
		</div>
	);
};

export default PixelCarousel;
