import * as React from 'react';
import { InitializeProps, initializeRenderer, initializeMesh } from '../../lib/gl/initialize';
import { loadTextures } from '../../lib/gl/textureLoader';
import { updateRendererSize } from './resize';
import { Texture } from '../../types';

export const useInitializeGL = (props: InitializeProps) => {
	React.useEffect(() => {
		setTimeout(() => {
			initializeGL(props);
		}, 0);
		return () => cleanUpGL(props);
	}, []);
};

export const initializeGL = async (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const { gl, program, outlineProgram } = initializeRenderer(props);

	if (!(props.imageTextures || (props.mesh && props.mesh.materials))) {
		initializeMeshAndProgram(props, gl, program, outlineProgram);
		updateRendererSize(props.canvasRef, { current: gl }, props.uniforms, props.size);
		return;
	}
	const loadedTextures: void | Record<string, Texture> = await loadTextures(gl, props.uniformLocations.current, props.imageTextures, props.mesh && props.mesh.materials);
	if (props.texturesRef) {
		props.texturesRef.current = loadedTextures && Object.values(loadedTextures).map(({ texture }) => texture);
	}

	initializeMeshAndProgram(props, gl, program, outlineProgram);
	updateRendererSize(props.canvasRef, { current: gl }, props.uniforms, props.size);
};

const initializeMeshAndProgram = (props: InitializeProps, gl: WebGLRenderingContext, program: WebGLProgram, outlineProgram: WebGLProgram) => {
	initializeMesh(props, gl, program, outlineProgram);
	props.gl.current = gl;
	if (props.programRef) {
		props.programRef.current = program;
	}
	if (props.outlineProgramRef) {
		props.outlineProgramRef.current = outlineProgram;
	}
};

const cleanUpGL = (props: InitializeProps) => {
	const gl: WebGLRenderingContext = props.gl.current;
	if (!gl) return;
	for (let unit = 0; unit < gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS); unit++) {
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	if (props.texturesRef && props.texturesRef.current) {
		props.texturesRef.current.map((texture: WebGLTexture) => {
			gl.deleteTexture(texture);
		});
	}

	if (props.buffersRef && props.buffersRef.current) {
		Object.keys(props.buffersRef.current).map((key: string) => {
			const buffer: WebGLBuffer = props.buffersRef.current[key] && props.buffersRef.current[key].buffer;
			if (buffer) {
				gl.deleteBuffer(buffer);
			}
		});
	}

	if (props.baseVertexBufferRef && props.baseVertexBufferRef.current) {
		gl.deleteBuffer(props.baseVertexBufferRef.current.buffer);
	}

	if (props.FBOA && props.FBOA.current) {
		gl.deleteFramebuffer(props.FBOA.current.buffer);
		gl.deleteRenderbuffer(props.FBOA.current.depthBuffer);
	}

	if (props.FBOB && props.FBOB.current) {
		gl.deleteFramebuffer(props.FBOB.current.buffer);
		gl.deleteRenderbuffer(props.FBOA.current.depthBuffer);
	}

	gl.getExtension('WEBGL_lose_context').loseContext();
};
