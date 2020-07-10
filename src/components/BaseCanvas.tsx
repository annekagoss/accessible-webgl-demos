import * as React from 'react';
import {
	UniformSettings,
	Vector2,
	MESH_TYPE,
	LoadedShaders,
} from '../../types';
import {
	assignUniforms,
	loadShader,
	mapUniformSettingsToLocations,
} from '../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../lib/gl/settings';
import { useInitializeGL } from '../hooks/gl';
import { useAnimationFrame } from '../hooks/animation';
import { useWindowSize } from '../hooks/resize';
import { useMouse } from '../hooks/mouse';
import { useUpdateShaders } from '../hooks/updateShaders';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	textureSource?: string;
	setFragmentError: (error: Error | null) => void;
	setVertexError: (error: Error | null) => void;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
}

const render = ({
	gl,
	uniformLocations,
	uniforms,
	time,
	mousePos,
}: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseCanvas = ({
	fragmentShader,
	vertexShader,
	uniforms,
	setAttributes,
	setFragmentError,
	setVertexError,
}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<
		HTMLCanvasElement
	>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x,
		y: uniforms.current.uResolution.value.y,
	});
	const initialMousePosition = uniforms.current.uMouse
		? uniforms.current.uMouse.defaultValue
		: { x: 0.5, y: 0.5 };
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * initialMousePosition.x,
		y: size.current.y * -initialMousePosition.y,
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<
		WebGLProgram
	>();
	const loadedShadersRef: React.MutableRefObject<LoadedShaders> = React.useRef<
		LoadedShaders
	>({ fragmentShader: null, vertexShader: null });
	const uniformLocations = React.useRef<
		Record<string, WebGLUniformLocation>
	>();

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

	React.useEffect(() => {
		setAttributes([
			{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') },
		]);
	}, []);

	useUpdateShaders({
		gl,
		programRef,
		loadedShadersRef,
		uniformLocations,
		uniforms,
		fragmentShader,
		vertexShader,
		setFragmentError,
		setVertexError,
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
		<canvas
			ref={canvasRef}
			width={size.current.x}
			height={size.current.y}
			role='img'
		/>
	);
};

export default BaseCanvas;
