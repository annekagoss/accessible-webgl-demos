import { UNIFORM_TYPE, UniformSettings, Buffers } from '../../types';

export const BASE_UNIFORMS: UniformSettings = {
	uResolution: {
		defaultValue: {
			x: 400 * window.devicePixelRatio,
			y: 400 * window.devicePixelRatio,
		},
		name: 'uResolution',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: {
			x: 400 * window.devicePixelRatio,
			y: 400 * window.devicePixelRatio,
		},
	},
};

export const isSafari = (): boolean =>
	/constructor/i.test(window.HTMLElement) ||
	(function (p) {
		return p.toString() === '[object SafariRemoteNotification]';
	})(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)) ||
	/iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);

export const glSupported = (): boolean => {
	// Check https://github.com/AnalyticalGraphicsInc/webglreport for more detailed compatibility tests
	const supported: boolean = Boolean(window.WebGLRenderingContext || window.WebGL2RenderingContext);
	if (!supported) {
		console.warn('WebGL is not supported on this device. Skipping 3D.'); // eslint-disable-line no-console
	}
	return supported;
};

export const parseUniform = (value: any, type: UNIFORM_TYPE) => {
	switch (type) {
		case UNIFORM_TYPE.FLOAT_1:
			return value;
		case UNIFORM_TYPE.VEC_2:
			return `x: ${value.x}, y: ${value.y}`;
		case UNIFORM_TYPE.VEC_3:
			return `x: ${value.x || value.r}, y: ${value.y || value.g}, z: ${value.z || value.b}`;
		case UNIFORM_TYPE.VEC_4:
			return `x: ${value.x || value.r}, y: ${value.y || value.g}, z: ${value.z || value.b}, w: ${value.w || value.a}`;
		default:
			return value;
	}
};

export const formatAttributes = (buffers: Buffers): Record<string, string>[] => {
	if (!buffers) return [];
	return Object.keys(buffers).reduce((result, bufferName) => {
		const buffer = buffers[bufferName];
		if (!buffer || !buffer.data) return result;
		result.push({
			name: bufferName,
			value: `${buffer.data
				.slice(0, 10)
				.map((item) => Math.round(item * 100) / 100)
				.join(', ')}... (${buffer.data.length} total)`,
		});
		return result;
	}, []);
};
