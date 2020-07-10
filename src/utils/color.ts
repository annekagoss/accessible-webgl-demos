import { RGB, RGBA } from '../../types';
import { interpolate } from '../../lib/gl/math';

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
	a: 1.0
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
		.map(stringVal => parseInt(stringVal))
		.map(val => normalize8Bit(val));
	return { r, g, b, a: 1.0 };
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
		.map(stringVal => parseInt(stringVal))
		.map(val => normalize8Bit(val));
	return { r, g, b, a: a * 255 };
};

const CSSColorStringToRGBA = (val: string): RGBA | null => {
	const testDiv: HTMLDivElement = document.createElement('div');
	testDiv.style.color = val;
	document.body.appendChild(testDiv);
	const rgbString: string = window.getComputedStyle(testDiv).color;
	return RGBStringToRGBA(rgbString);
};

export const luminanceFromRGBA = (rgba: RGBA, backgroundColor: RGB): number => {
	const { r, g, b }: RGB = interpolateRGBColors(backgroundColor, { r: rgba.r, g: rgba.g, b: rgba.b }, rgba.a);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const interpolateRGBColors = (sourceColor: RGB, targetColor: RGB, amount: number): RGB => ({
	r: interpolate(sourceColor.r, targetColor.r, amount),
	g: interpolate(sourceColor.g, targetColor.g, amount),
	b: interpolate(sourceColor.b, targetColor.b, amount)
});
