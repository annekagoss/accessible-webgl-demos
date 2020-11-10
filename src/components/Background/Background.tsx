import * as React from 'react';
import {UniformSettings, Vector2, MESH_TYPE, LoadedShaders, UNIFORM_TYPE} from '../../../types';
import {assignUniforms} from '../../../lib/gl/initialize';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {useWindowSize} from '../../hooks/resize';
import {useMouse} from '../../hooks/mouse';
import {BASE_UNIFORMS} from '../../utils/general';
import vertexShader from '../../../lib/gl/shaders/base.vert';
import fragmentShader from '../../../lib/gl/shaders/gx.frag';
import AccessibleContrast from '../AccessibleContrast/AccessibleContrast';

import styles from './Background.module.scss';

interface Props {}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
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
};

const render = ({gl, uniformLocations, uniforms, time, mousePos}: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseCanvas = () => {
	const uniforms = React.useRef<UniformSettings>(INITIAL_UNIFORMS);
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x,
		y: uniforms.current.uResolution.value.y,
	});
	const initialMousePosition = uniforms.current.uMouse
		? uniforms.current.uMouse.defaultValue
		: {x: 0.5, y: 0.5};
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * initialMousePosition.x,
		y: size.current.y * -initialMousePosition.y,
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const loadedShadersRef: React.MutableRefObject<LoadedShaders> = React.useRef<LoadedShaders>({
		fragmentShader: null,
		vertexShader: null,
	});
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();

	useInitializeGL({
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
	});

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

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
		<div className={styles.canvasContainer}>
			<AccessibleContrast size={size} ref={canvasRef} />
		</div>
	);
};

export default BaseCanvas;
