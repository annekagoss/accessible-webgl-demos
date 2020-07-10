import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, Vector2, MESH_TYPE, LoadedShaders } from '../../../types';
import { assignUniforms, InitializeProps } from '../../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../../lib/gl/settings';
import { useAnimationFrame } from '../../hooks/animation';
import { useWindowSize } from '../../hooks/resize';
import { useMouse } from '../../hooks/mouse';
import styles from './DOMRasterizationCanvas.module.scss';
import { useRasterizeToGL } from '../../hooks/rasterize';
import Source from './Source';
import { useUpdateShaders } from '../../hooks/updateShaders';

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

const render = ({ gl, uniformLocations, uniforms, time, mousePos }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const DOMRasterizationCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes, setFragmentError, setVertexError }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x * window.devicePixelRatio,
		y: uniforms.current.uResolution.value.y * window.devicePixelRatio,
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
	});

	React.useEffect(() => {
		setAttributes([{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }]);
	}, []);

	useUpdateShaders({ gl, programRef, loadedShadersRef, uniformLocations, uniforms, fragmentShader, vertexShader, setFragmentError, setVertexError });
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
			<canvas ref={canvasRef} className={styles.fullScreenCanvas} width={size.current.x} height={size.current.y} aria-label='DOM rasterization canvas' role='img' />
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

export default DOMRasterizationCanvas;
