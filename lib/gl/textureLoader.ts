import { Materials, Texture, Material } from '../../types';
import { MAX_SUPPORTED_MATERIAL_TEXTURES } from './settings';

interface LoadedImage {
	name: string;
	type: string;
	image: HTMLImageElement;
}

export const loadTextures = async (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, images?: Record<string, string>, materials?: Materials) => {
	if (images && images !== {}) {
		return loadImageTextures(gl, images).then((loadedTextures: Record<string, Texture>) => {
			bindTextures(gl, uniformLocations, loadedTextures);
			return loadedTextures;
		});
	}

	if (materials && materials !== {}) {
		return loadMaterialTextures(gl, materials).then((loadedMaterials: Materials): void => {
			materials = loadedMaterials;
			bindMaterials(gl, uniformLocations, materials);
		});
	}
};

export const loadImageTextures = async (gl: WebGLRenderingContext, images: Record<string, string>): Promise<Record<string, Texture>> => {
	const promises: Promise<LoadedImage>[] = Object.keys(images).map(name => initTexture(name, 'diffuse', images[name]));

	return Promise.all(promises).then(loadedImages => {
		const loadedTextures: Record<string, Texture> = {};
		loadedImages.forEach(({ name, image }: LoadedImage) => {
			if (image && image.src) {
				loadedTextures[name] = createTexture(gl, image);
			}
		});
		return loadedTextures;
	});
};

export const loadMaterialTextures = (gl: WebGLRenderingContext, materials: Materials): Promise<Materials> => {
	let promises: Promise<LoadedImage>[] = [];
	Object.keys(materials).forEach(name => {
		const { textures } = materials[name];
		if (textures && textures !== {}) {
			const matPromises: Promise<LoadedImage>[] = Object.keys(textures)
				.filter(type => !!textures[type])
				.map(type => initTexture(name, type, textures[type]));
			promises = promises.concat(matPromises);
		}
	});

	return Promise.all(promises).then(loadedImages => {
		const loadedMaterials: Materials = materials;
		loadedImages.forEach(({ name, type, image }: LoadedImage) => {
			if (image && image.src) {
				const boundTexture: WebGLTexture = createTexture(gl, image);
				loadedMaterials[name].textures[type] = boundTexture;
			}
		});
		delete loadedMaterials.textures;
		return loadedMaterials;
	});
};

const initTexture = async (name: string, type: string, source: string): Promise<LoadedImage> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve({ name, type, image });
		image.onerror = e => reject(e);
		image.src = source;
	});

const isPowerOf2 = value => (value & (value - 1)) === 0;

export const createTexture = (gl, image): Texture => {
	const level = 0;
	const internalFormat = gl.RGBA;
	const sourceFormat = gl.RGBA;
	const sourceType = gl.UNSIGNED_BYTE;
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, sourceFormat, sourceType, image);
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	return {
		texture,
		textureSize: { x: image.width, y: image.height }
	};
};

export const bindMaterials = (gl, uniformLocations: Record<string, WebGLUniformLocation>, materials: Materials) => {
	Object.keys(materials).forEach((name, i) => {
		if (i <= MAX_SUPPORTED_MATERIAL_TEXTURES) {
			const mat: Material = materials[name];
			if (mat.textures && mat.textures.diffuseMap) {
				gl.activeTexture(gl[`TEXTURE${i}`] as number);
				gl.bindTexture(gl.TEXTURE_2D, mat.textures.diffuseMap.texture);
				gl.uniform1i(uniformLocations[`uDiffuse${i}`], i);
			}
		}
	});
};

export const bindTextures = (gl, uniformLocations: Record<string, WebGLUniformLocation>, textures: Record<string, Texture>) => {
	Object.keys(textures).forEach((name, i) => {
		if (i <= MAX_SUPPORTED_MATERIAL_TEXTURES) {
			const texture: WebGLTexture = textures[name].texture;
			gl.activeTexture(gl[`TEXTURE${i}`] as number);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(uniformLocations[`uDiffuse${i}`], i);
		}
	});
};
