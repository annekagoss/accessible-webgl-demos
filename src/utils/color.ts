import {HSL, RGB, RGBA} from '../../types';
import {interpolate} from '../../lib/gl/math';

export const parseColorFromString = (string: string): RGBA | null => {
	const RGBAFromHex: RGBA | null = HexToRGBA(string);
	if (Boolean(RGBAFromHex)) return RGBAFromHex;
	const RGBAFromRGB: RGBA | null = RGBStringToRGBA(string);
	if (Boolean(RGBAFromRGB)) return RGBAFromRGB;
	const RGBAFromRGBAString: RGBA | null = RGBAStringToRGBA(string);
	if (Boolean(RGBAFromRGBAString)) return RGBAFromRGBAString;
	const RGBAFromCSSColorString: RGBA | null = CSSColorStringToRGBA(string);
	if (Boolean(RGBAFromCSSColorString)) return RGBAFromCSSColorString;
	return null;
};

const isValidHex = (val: string): boolean => {
	const matchRegex: RegExp = /^([A-Fa-f0-9]{3}){1,2}$/;
	return matchRegex.test(stripHash(val));
};

const stripHash = (hex: string): string => {
	if (hex.charAt(0) !== '#') return hex;
	return hex.substring(1);
};

const HexToRGBA = (hex: string): RGBA | null => {
	if (!isValidHex(hex)) return;
	const hexString = formatHexString(hex);
	return hexStringToRGBA(hexString);
};

const formatHexString = (hex: string) => {
	const vals: string[] = stripHash(hex).split('');
	if (vals.length === 6) return `0x${vals.join('')}`;
	const repeatedVals = [vals[0], vals[0], vals[1], vals[1], vals[2], vals[2]];
	return `0x${repeatedVals.join('')}`;
};

const hexStringToRGBA = (hex): RGBA => ({
	r: ((hex >> 16) & 255) / 255,
	g: ((hex >> 8) & 255) / 255,
	b: (hex & 255) / 255,
	a: 1.0,
});

const normalize8Bit = (int: number): number => int / 255;

const isValidRGBString = (val: string): boolean => {
	const matchRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
	return matchRegex.test(val);
};

const RGBStringToRGBA = (val: string): RGBA | null => {
	if (!isValidRGBString(val)) return;
	const matchRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
	const [r, g, b]: number[] = matchRegex
		.exec(val)
		.slice(1, 4)
		.map((stringVal) => parseInt(stringVal))
		.map((val) => normalize8Bit(val));
	return {r, g, b, a: 1.0};
};

const isValidRGBAString = (val: string): boolean => {
	const matchRegex = /rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0\.[0-9]+|[0-1])\)/;
	return matchRegex.test(val);
};

const RGBAStringToRGBA = (val: string): RGBA | null => {
	if (!isValidRGBAString(val)) return;
	const matchRegex = /rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0\.[0-9]+|[0-1])\)/;
	const [r, g, b, a]: number[] = matchRegex
		.exec(val)
		.slice(1, 5)
		.map((stringVal) => parseInt(stringVal))
		.map((val) => normalize8Bit(val));
	return {r, g, b, a: a * 255};
};

const CSSColorStringToRGBA = (val: string): RGBA | null => {
	const testDiv: HTMLDivElement = document.createElement('div');
	testDiv.style.color = val;
	document.body.appendChild(testDiv);
	const rgbString: string = window.getComputedStyle(testDiv).color;
	return RGBStringToRGBA(rgbString);
};

export const luminanceFromRGBA = (rgba: RGBA, backgroundColor: RGB): number => {
	const {r, g, b}: RGB = interpolateRGBColors(
		backgroundColor,
		{r: rgba.r, g: rgba.g, b: rgba.b},
		rgba.a
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const interpolateRGBColors = (sourceColor: RGB, targetColor: RGB, amount: number): RGB => ({
	r: interpolate(sourceColor.r, targetColor.r, amount),
	g: interpolate(sourceColor.g, targetColor.g, amount),
	b: interpolate(sourceColor.b, targetColor.b, amount),
});

export const normalizeRGB = (rgb: RGB): RGB => ({
	r: rgb.r / 255,
	g: rgb.g / 255,
	b: rgb.b / 255,
});

export const RGBToHSL = (rgb: RGB): HSL => {
	const {r, g, b} = normalizeRGB(rgb);

	// Find greatest and smallest channel values
	const cmin = Math.min(r, g, b);
	const cmax = Math.max(r, g, b);
	const delta = cmax - cmin;
	let h = 0;
	let s = 0;
	let l = 0;

	// Calculate hue
	// No difference
	if (delta === 0) h = 0;
	// Red is max
	else if (cmax === r) h = ((g - b) / delta) % 6;
	// Green is max
	else if (cmax === g) h = (b - r) / delta + 2;
	// Blue is max
	else h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	// Make negative hues positive behind 360°
	if (h < 0) h += 360;

	l = (cmax + cmin) / 2;

	// Calculate saturation
	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	// Multiply l and s by 100
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return {h, s, l};
};

export const HSLToRGB = (hsl: HSL): RGB => {
	const h = hsl.h;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0;
	let g = 0;
	let b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);
	return {r, g, b};
};

export const cssColor = ({r, g, b}: RGB) => `rgb(${r}, ${g}, ${b})`;
