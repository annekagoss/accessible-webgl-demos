import * as React from 'react';

import {InitializeProps} from '../../lib/gl/initialize';
import {initializeGL} from './gl';
import {loadTextures} from '../../lib/gl/textureLoader';
import sangbleuKingdom from '../assets/fonts/sangbleuKingdom';
import {throttle} from './helpers';
import univers from '../assets/fonts/univers';

interface RasterizeToGLProps {
	sourceElementRef: React.RefObject<HTMLElement>;
	cursorElementRef: React.RefObject<HTMLImageElement>;
	imageTexturesRef: React.MutableRefObject<Record<string, string>>;
	initializeGLProps: InitializeProps;
	useDevicePixelRatio: boolean;
	reloadOnInteraction: boolean;
	reloadOnChange: any[];
}

export const useRasterizeToGL = (props: RasterizeToGLProps) => {
	React.useEffect(() => {
		if (!props.sourceElementRef || !props.sourceElementRef.current) {
			initializeGL(props.initializeGLProps);
			return;
		}
		rasterizeElementAndInitializeGL(props);
		let refreshImageOnEvent;
		let mouseUpHandler;

		if (props.reloadOnInteraction) {
			refreshImageOnEvent = throttle(30, () => refreshImage(props));
			props.cursorElementRef.current.addEventListener('mousemove', refreshImageOnEvent);
			props.cursorElementRef.current.addEventListener('keydown', refreshImageOnEvent);
			props.cursorElementRef.current.addEventListener('keyup', refreshImageOnEvent);

			mouseUpHandler = () => {
				setTimeout(() => {
					refreshImageOnEvent();
				}, 0);
			};
			props.cursorElementRef.current.addEventListener('mouseup', mouseUpHandler);
		}

		window.addEventListener('load', () => refreshImage(props));
		window.addEventListener('resize', () => refreshImage(props));
		setTimeout(() => {
			refreshImage(props);
		}, 0);
		return () => {
			if (props.reloadOnInteraction) {
				props.cursorElementRef.current.removeEventListener(
					'mousemove',
					refreshImageOnEvent
				);
				props.cursorElementRef.current.removeEventListener('keydown', refreshImageOnEvent);
				props.cursorElementRef.current.removeEventListener('keyup', refreshImageOnEvent);
				props.cursorElementRef.current.removeEventListener('mouseup', mouseUpHandler);
			}
			window.removeEventListener('load', () => refreshImage(props));
			window.removeEventListener('resize', () => refreshImage(props));
		};
	}, []);

	React.useEffect(() => {
		refreshImage(props);
	}, props.reloadOnChange);
};

const refreshImage = async ({
	sourceElementRef,
	imageTexturesRef,
	initializeGLProps,
	useDevicePixelRatio,
}: RasterizeToGLProps) => {
	const result = await rasterizeElement(sourceElementRef.current, useDevicePixelRatio);
	if (!result) return;
	const {DOMImage, size} = result;
	imageTexturesRef.current = {DOMImage};
	initializeGLProps.uniforms.uSamplerResolution0.value = size;
	loadTextures(
		initializeGLProps.gl.current,
		initializeGLProps.uniformLocations.current,
		imageTexturesRef.current
	);
};

const rasterizeElementAndInitializeGL = async ({
	sourceElementRef,
	imageTexturesRef,
	initializeGLProps,
	useDevicePixelRatio,
}: RasterizeToGLProps) => {
	const rasterResult = await rasterizeElement(sourceElementRef.current, useDevicePixelRatio);
	if (!rasterResult) return;
	const {DOMImage, size} = rasterResult;
	imageTexturesRef.current = {DOMImage};
	initializeGLProps.uniforms.uSamplerResolution0.value = size;

	initializeGLProps.imageTextures = imageTexturesRef.current;
	initializeGL(initializeGLProps);
};

const rasterizeElement = async (sourceElement: HTMLElement, useDevicePixelRatio: boolean) => {
	if (!sourceElement) return;
	const {width, height} = sourceElement.getBoundingClientRect();
	const SVGDataURI = makeSVGDataURI(sourceElement, width, height);
	const image: HTMLImageElement = await createImageFromURI(SVGDataURI);
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	context.drawImage(image, 0, 0);
	const png = canvas.toDataURL();
	const devicePixelRatio = useDevicePixelRatio ? window.devicePixelRatio : 1.0;
	return {
		DOMImage: png,
		size: {
			x: width * devicePixelRatio,
			y: height * devicePixelRatio,
		},
	};
};

const makeSVGDataURI = (node, width: number, height: number): string => {
	node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
	const serializedNode = new XMLSerializer().serializeToString(node);
	const escapedNode = escapeXhtml(serializedNode);
	return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
	<foreignObject x="0" y="0" width="100%" height="100%">
	<style type="text/css">
	${sangbleuKingdom}
	${univers}
	</style>
	${escapedNode}</foreignObject></svg>`;
};

const escapeXhtml = (s: string): string => s.replace(/#/g, '%23').replace(/\n/g, '%0A');

const createImageFromURI = (SVGDataURL: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve(image);
		image.onerror = (e) => reject(e);
		image.src = SVGDataURL;
	});
