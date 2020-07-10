import {BoundingBox, Face, Geometry, Mesh, Materials, PartialFace, UnpackedGeometry, Vector3, Textures} from '../../types';

export default () => {
	enum MATERIAL_KEY {
		AMBIENT = 'ka',
		DIFFUSE = 'kd',
		SPECULAR = 'ks',
		EMISSIVE = 'ke',
		REFLECTIVITY = 'ns',
		DIFFUSE_MAP = 'map_kd',
		SPECULAR_MAP = 'map_ks',
		NORMAL_MAP = 'norm',
		BUMP_MAP = 'map_bump',
		BUMP_MAP_2 = 'bump',
		ALPHA_MAP = 'map_d',
		ALPHA = 'd',
		ALPHA_2 = 'tr'
	}

	const POSITION_REGEX: RegExp = /^v\s/;
	const NORMAL_REGEX: RegExp = /^vn\s/;
	const TEXTURE_REGEX: RegExp = /^vt\s/;
	const FACE_REGEX: RegExp = /^f\s/;
	const WHITESPACE_REGEX: RegExp = /\s+/;
	const MAT_DECLARATION_REGEX: RegExp = /^newmtl\s/;
	const TEXTURE_ADDRESS_REGEX: RegExp = /^usemtl\s/;

	const loadMeshData = (OBJSource: string, MTLString: string, textures: Textures): Mesh => {
		const geometry: Geometry = loadOBJData(OBJSource);
		const materials: Materials = MTLString && loadMTLData(MTLString, textures);
		return Object.assign(geometry, {materials});
	};

	const loadOBJData = (source: string): Geometry => {
		const positions: number[] = [];
		const normals: number[] = [];
		const textures: number[] = [];
		const unpacked: UnpackedGeometry = {
			computedNormals: [],
			faces: [],
			hashIndices: {},
			indices: [],
			index: 0,
			normals: [],
			positions: [],
			textureAddresses: [],
			textures: []
		};

		const vertexCount: number = getVertexCount(source);

		if (vertexCount > 70000) {
			console.error(new Error(`OBJ file has too many vertices.  Reduce vertex count from ${vertexCount} to below 70k.`)); /* tslint:disable-line no-console */
			return;
		}

		const lines: string[] = source.split('\n');
		let textureAddress: number = -1;

		for (let i: number = 0; i < lines.length; i++) {
			const line: string = lines[i].trim();
			const elements: string[] = line.split(WHITESPACE_REGEX);
			elements.shift();

			if (POSITION_REGEX.test(line)) {
				positions.push.apply(
					positions,
					elements.map(element => parseFloat(element))
				);
			} else if (NORMAL_REGEX.test(line)) {
				normals.push.apply(normals, elements);
			} else if (TEXTURE_REGEX.test(line)) {
				textures.push.apply(
					textures,
					elements.map(element => parseFloat(element))
				);
			} else if (TEXTURE_ADDRESS_REGEX.test(line)) {
				textureAddress++;
			} else if (FACE_REGEX.test(line)) {
				let quad: boolean = false;
				const needsNormals: boolean = unpacked.normals.length === 0;

				needsNormals &&
					unpacked.faces.push({
						a: {},
						b: {},
						c: {}
					});

				for (let j: number = 0, numElements: number = elements.length; j < numElements; j++) {
					if (j === 3 && !quad) {
						j = 2;
						quad = true;
					}

					/*
            Face data structure:
            three or more vertices, each comprising of indices pointing to position, texture, and normal data
            pos1/tex1/norm1 pos2/tex2/norm2 pos3/tex3/norm3å
          */
					const vertex: string[] = elements[j].split('/');
					const vertexStartIndex: number = (parseFloat(vertex[0]) - 1) * 3;
					const x: number = positions[vertexStartIndex];
					const y: number = positions[vertexStartIndex + 1];
					const z: number = positions[vertexStartIndex + 2];

					if (needsNormals) {
						populateNormals(unpacked, j, x, y, z);
					}

					/* If this face shares a vertex with another face that has already
             been read, use the existing value. */
					if (elements[j] in unpacked.hashIndices) {
						unpacked.indices.push(unpacked.hashIndices[elements[j]]);
					} else {
						unpacked.positions.push(x);
						unpacked.positions.push(y);
						unpacked.positions.push(z);

						const textureStartIndex: number = (parseFloat(vertex[1]) - 1) * 2;
						const u: number = textures[textureStartIndex];
						const v: number = 1 - textures[textureStartIndex + 1];
						unpacked.textures.push(u);
						unpacked.textures.push(v);

						if (!needsNormals) {
							const normalStartIndex: number = (parseFloat(vertex[2]) - 1) * 3;
							const normX: number = normals[normalStartIndex];
							const normY: number = normals[normalStartIndex + 1];
							const normZ: number = normals[normalStartIndex + 2];
							unpacked.normals.push(normX);
							unpacked.normals.push(normY);
							unpacked.normals.push(normZ);
						}

						unpacked.textureAddresses.push(Math.max(textureAddress, 0));

						unpacked.hashIndices[elements[j]] = unpacked.index;
						unpacked.indices.push(unpacked.hashIndices[elements[j]]);
						unpacked.index += 1;
					}
					// Separate quad into two triangles
					if (j === 3 && quad) {
						unpacked.indices.push(unpacked.hashIndices[elements[0]]);
					}
				}
			}
		}

		if (unpacked.normals.length === 0) {
			unpacked.normals = unpacked.computedNormals;
		}

		return {
			boundingBox: computeBoundingBox(unpacked.positions),
			indices: unpacked.indices,
			normals: unpacked.normals,
			positions: unpacked.positions,
			textureAddresses: unpacked.textureAddresses,
			textures: unpacked.textures
		};
	};

	const computeBoundingBox = (positions: number[]): BoundingBox => {
		let minX: number = +Infinity;
		let minY: number = +Infinity;
		let minZ: number = +Infinity;

		let maxX: number = -Infinity;
		let maxY: number = -Infinity;
		let maxZ: number = -Infinity;

		for (let i: number = 0; i < positions.length; i += 3) {
			const x: number = positions[i];
			const y: number = positions[i + 1];
			const z: number = positions[i + 2];

			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (z < minZ) minZ = z;

			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
			if (z > maxZ) maxZ = z;
		}

		const size: Vector3 = {
			x: computeWidth(minX, maxX),
			y: computeWidth(minY, maxY),
			z: computeWidth(minZ, maxZ)
		};

		return {
			size,
			minX,
			maxX,
			minY,
			maxY,
			minZ,
			maxZ
		};
	};

	const computeWidth = (min: number, max: number): number => Math.abs(min) + max;

	const getVertexCount = (source: string): number => {
		const matches: string[] = source.match(/(f )/g);
		return Math.floor(matches.length / 2);
	};

	const populateNormals = (unpacked: UnpackedGeometry, vIndex: number, x: number, y: number, z: number) => {
		const {positions, computedNormals, faces} = unpacked;
		const lastFace: PartialFace = faces[faces.length - 1];

		if (vIndex === 0) {
			lastFace.a = {x, y, z, i: positions.length};
		} else if (vIndex === 1) {
			lastFace.b = {x, y, z, i: positions.length};
		} else if (vIndex === 2) {
			lastFace.c = {x, y, z, i: positions.length};
			const normal: Vector3 | undefined = computeFaceNormal(lastFace as Face);
			if (!normal) return;
			computedNormals[lastFace.a.i] = normal.x;
			computedNormals[lastFace.a.i + 1] = normal.y;
			computedNormals[lastFace.a.i + 2] = normal.z;
			computedNormals[lastFace.b.i] = normal.x;
			computedNormals[lastFace.b.i + 1] = normal.y;
			computedNormals[lastFace.b.i + 2] = normal.z;
			computedNormals[lastFace.c.i] = normal.x;
			computedNormals[lastFace.c.i + 1] = normal.y;
			computedNormals[lastFace.c.i + 2] = normal.z;
		}
	};

	const computeFaceNormal = (face: Face): Vector3 | undefined => {
		const {a, b, c} = face;
		const cb: Vector3 = subtractVectors(c, b);
		const ab: Vector3 = subtractVectors(a, b);
		const cross: Vector3 = crossVectors(cb, ab);
		/* We need to use === on -0 here because the recommended Object.is
      is not supported on IE. */
		if (cross.x === -0) cross.x = 0; // eslint-disable-line no-compare-neg-zero
		if (cross.y === -0) cross.y = 0; // eslint-disable-line no-compare-neg-zero
		if (cross.z === -0) cross.z = 0; // eslint-disable-line no-compare-neg-zero
		return normalizeVector(cross);
	};

	const subtractVectors = (a: Vector3, b: Vector3): Vector3 => {
		return {
			x: a.x - b.x,
			y: a.y - b.y,
			z: a.z - b.z
		};
	};

	const crossVectors = (a: Vector3, b: Vector3): Vector3 => {
		return {
			x: a.y * b.z - a.z * b.y,
			y: a.z * b.x - a.x * b.z,
			z: a.x * b.y - a.y * b.x
		};
	};

	const normalizeVector = (v: Vector3): Vector3 => {
		const magnitude = vectorMagnitude(v);
		if (magnitude === 0) return v;
		return multiplyScalar(v, 1 / magnitude);
	};

	const vectorMagnitude = ({x, y, z}: Vector3): number => {
		return Math.sqrt(x * x + y * y + z * z);
	};

	const multiplyScalar = (v: Vector3, scalar: number): Vector3 => {
		return {
			x: v.x * scalar,
			y: v.y * scalar,
			z: v.z * scalar
		};
	};

	const loadMTLData = (source: String, textures: Textures): Materials => {
		let index: number;
		let name: string;

		const materials = {
			textures: []
		};

		const lines: string[] = source.split('\n');
		for (let i: number = 0; i < lines.length; i++) {
			const line: string = lines[i].trim();
			if (line.length === 0 || line.charAt(0) === '#') continue;

			const elements: string[] = line.split(WHITESPACE_REGEX);
			elements.shift();

			if (MAT_DECLARATION_REGEX.test(line)) {
				index = Object.keys(materials).length - 1;
				name = elements[0];
				materials[index] = {
					name,
					textures: {},
					images: {}
				};
			} else {
				const key: string = line.split(' ')[0].toLowerCase();
				switch (key) {
					case MATERIAL_KEY.AMBIENT:
						materials[index].ambient = elements.map(element => parseFloat(element));
						break;
					case MATERIAL_KEY.DIFFUSE:
						materials[index].diffuse = elements.map(element => parseFloat(element));
						break;
					case MATERIAL_KEY.SPECULAR:
						materials[index].specular = elements.map(element => parseFloat(element));
						break;
					case MATERIAL_KEY.EMISSIVE:
						materials[index].emissive = elements.map(element => parseFloat(element));
						break;
					case MATERIAL_KEY.REFLECTIVITY:
						materials[index].reflectivity = parseFloat(elements[0]);
						break;
					case MATERIAL_KEY.DIFFUSE_MAP:
						materials[index].textures.diffuseMap = textures.diffuse && textures.diffuse[name];
						break;
					case MATERIAL_KEY.SPECULAR_MAP:
						console.warn('Specular maps are not yet supported.'); /* tslint:disable-line no-console */
						materials[index].textures.specularMap = elements[0];
						break;
					case MATERIAL_KEY.NORMAL_MAP:
						console.warn('Normal maps are not yet supported.'); /* tslint:disable-line no-console */
						materials[index].textures.normalMap = elements[0];
						break;
					case MATERIAL_KEY.BUMP_MAP:
						console.warn('Bump maps are not yet supported.'); /* tslint:disable-line no-console */
						materials[index].textures.bumpMap = elements[0];
						break;
					case MATERIAL_KEY.BUMP_MAP_2:
						console.warn('Bump maps are not yet supported.'); /* tslint:disable-line no-console */
						materials[index].textures.bumpMap = elements[0];
						break;
					case MATERIAL_KEY.ALPHA_MAP:
						console.warn('Alpha maps are not yet supported.'); /* tslint:disable-line no-console */
						materials[index].textures.alphaMap = elements[0];
						break;
					case MATERIAL_KEY.ALPHA: // Alpha
						materials[index].opacity = parseFloat(elements[0]);
						break;
					case MATERIAL_KEY.ALPHA_2: // Alpha
						materials[index].opacity = 1 - parseFloat(elements[0]);
						break;
					default:
						break;
				}
			}
		}

		return materials as Materials;
	};

	self.addEventListener('message', e => {
		if (!e) return;
		const {OBJSource, MTLSource, textures} = e.data;
		if (OBJSource) {
			const mesh: Mesh = loadMeshData(OBJSource, MTLSource, textures);
			postMessage(mesh, null);
			return;
		}
	});
};
