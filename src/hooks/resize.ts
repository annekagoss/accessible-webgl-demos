import { FBO, UniformSettings, Vector2 } from '../../types';

import { useEffect } from 'react';

export const useWindowSize = (
	canvas: React.MutableRefObject<HTMLCanvasElement>,
	gl: React.MutableRefObject<WebGLRenderingContext>,
	uniforms: UniformSettings,
	size: React.MutableRefObject<Vector2>,
	isFullScreen?: boolean
) => {
	console.log(isFullScreen);
	const handleResize = () => updateRendererSize(canvas, gl, uniforms, size, isFullScreen);
	useEffect(() => {
		setTimeout(() => {
			handleResize();
		}, 0);

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
};

export const updateRendererSize = (
	canvas: React.MutableRefObject<HTMLCanvasElement>,
	gl: React.MutableRefObject<WebGLRenderingContext>,
	uniforms: UniformSettings,
	size: React.MutableRefObject<Vector2>,
	isFullScreen?: boolean
) => {
	if (!canvas.current || !gl.current) return;
	const { width, height } = isFullScreen ? { width: window.innerWidth, height: window.innerHeight } : canvas.current.getBoundingClientRect();

	size.current = {
		x: width * window.devicePixelRatio,
		y: height * window.devicePixelRatio,
	};
	console.log(size.current.y, height, isFullScreen);
	canvas.current.width = size.current.x;
	canvas.current.height = size.current.y;
	uniforms.uResolution.value = size.current;
	gl.current.viewport(0, 0, size.current.x, size.current.y);
};
