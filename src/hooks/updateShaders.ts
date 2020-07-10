import * as React from 'react';
import { loadShader, mapUniformSettingsToLocations, createUniformLocations } from '../../lib/gl/initialize';
import { LoadedShaders, UniformSettings, FBO } from '../../types';

interface Props {
	gl: React.MutableRefObject<WebGLRenderingContext>;
	programRef: React.MutableRefObject<WebGLProgram>;
	loadedShadersRef: React.MutableRefObject<LoadedShaders>;
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	uniforms: React.MutableRefObject<UniformSettings>;
	fragmentShader: string;
	setFragmentError: (error: Error | null) => void;
	vertexShader: string;
	setVertexError: (error: Error | null) => void;
	FBOA?: React.MutableRefObject<FBO>;
	FBOB?: React.MutableRefObject<FBO>;
}

export const useUpdateShaders = (props: Props) => {
	const { gl, programRef, loadedShadersRef, uniformLocations, uniforms, fragmentShader, setFragmentError, vertexShader, setVertexError, FBOA, FBOB } = props;
	const usePingPongBuffers: boolean = Boolean(FBOA && FBOB);

	React.useEffect(() => {
		if (!gl.current) return;
		gl.current.detachShader(programRef.current, loadedShadersRef.current.fragmentShader);

		const newFragmentShader: WebGLShader | null = tryLoadFragmentShader(gl, fragmentShader, setFragmentError);
		if (!newFragmentShader) return;

		loadedShadersRef.current.fragmentShader = newFragmentShader;
		gl.current.useProgram(programRef.current);
		gl.current.attachShader(programRef.current, newFragmentShader);
		gl.current.linkProgram(programRef.current);

		uniformLocations.current = createUniformLocations(gl.current, programRef.current, uniforms.current, usePingPongBuffers);
		if (!gl.current.getProgramParameter(programRef.current, gl.current.LINK_STATUS)) {
			console.warn('Unabled to initialize the shader program: ' + gl.current.getProgramInfoLog(programRef.current)); /* tslint:disable-line no-console */
		}
	}, [fragmentShader]);

	React.useEffect(() => {
		if (!gl.current) return;
		gl.current.detachShader(programRef.current, loadedShadersRef.current.vertexShader);

		const newVertexShader: WebGLShader | null = tryLoadVertexShader(gl, vertexShader, setVertexError);
		if (!newVertexShader) return;

		loadedShadersRef.current.vertexShader = newVertexShader;
		gl.current.useProgram(programRef.current);
		gl.current.attachShader(programRef.current, newVertexShader);
		gl.current.linkProgram(programRef.current);

		uniformLocations.current = createUniformLocations(gl.current, programRef.current, uniforms.current, usePingPongBuffers);
		if (!gl.current.getProgramParameter(programRef.current, gl.current.LINK_STATUS)) {
			console.warn('Unabled to initialize the shader program: ' + gl.current.getProgramInfoLog(programRef.current)); /* tslint:disable-line no-console */
		}
	}, [vertexShader]);
};

const tryLoadFragmentShader = (gl: React.MutableRefObject<WebGLRenderingContext>, fragmentShader: string, setFragmentError: (error: Error | null) => void) => {
	try {
		setFragmentError(null);
		return loadShader(gl.current, gl.current.FRAGMENT_SHADER, fragmentShader);
	} catch (e) {
		setFragmentError(e);
	}
	return;
};

const tryLoadVertexShader = (gl: React.MutableRefObject<WebGLRenderingContext>, vertexShader: string, setVertexError: (error: Error | null) => void) => {
	try {
		setVertexError(null);
		return loadShader(gl.current, gl.current.VERTEX_SHADER, vertexShader);
	} catch (e) {
		setVertexError(e);
	}
	return;
};
