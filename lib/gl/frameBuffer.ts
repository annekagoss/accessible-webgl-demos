import { FBO } from '../../types';

const FBOConstants = (gl: WebGLRenderingContext): Record<string, any> => ({
	level: 0,
	internalFormat: gl.RGBA,
	border: 0,
	format: gl.RGBA,
	type: gl.UNSIGNED_BYTE,
	data: null,
});

const createTargetTexture = (gl: WebGLRenderingContext, textureWidth: number, textureHeight: number, constants: Record<string, any>): WebGLTexture => {
	const { level, internalFormat, border, format, type, data } = constants;
	const targetTexture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureWidth, textureHeight, border, format, type, data as ArrayBufferView);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return targetTexture;
};

const createFrameBuffer = (gl: WebGLRenderingContext, targetTexture, textureWidth, textureHeight, level: number) => {
	const frameBuffer: WebGLFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);

	const depthBuffer: WebGLRenderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureWidth, textureHeight);

	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return { frameBuffer, depthBuffer };
};

export const initFrameBufferObject = (gl: WebGLRenderingContext, textureWidth: number, textureHeight: number): FBO => {
	const constants = FBOConstants(gl);

	const targetTexture: WebGLTexture = createTargetTexture(gl, textureWidth, textureHeight, constants);
	const { frameBuffer, depthBuffer } = createFrameBuffer(gl, targetTexture, textureWidth, textureHeight, constants.level);

	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
		console.error(new Error('Could not attach frame buffer'));
	}

	return {
		buffer: frameBuffer,
		depthBuffer,
		targetTexture,
		textureWidth,
		textureHeight,
	};
};
