import * as React from 'react';
import { UNIFORM_TYPE, Vector2, UniformSettings, Vector3 } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import initialMeshFragmentShader from '../../lib/gl/shaders/mesh.frag';
import initialMeshVertexShader from '../../lib/gl/shaders/mesh.vert';
import initialPhongFragmentShader from '../../lib/gl/shaders/phong.frag';
import initialPhongVertexShader from '../../lib/gl/shaders/phong.vert';
import initialFractalFragmentShader from '../../lib/gl/shaders/mandelbulb.frag';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import DepthCanvas from '../components/DepthCanvas';
import LoaderCanvas from '../components/LoaderCanvas';

import meshDiagram from '../assets/diagrams/2.0 Mesh.png';
import fileLoaderDiagram from '../assets/diagrams/2.1 File Loader.png';
import fractalDiagram from '../assets/diagrams/2.2 Fractal.png';

// FOX SKULL
import foxOBJ from '../assets/fox/fox3.obj';
import foxMTL from '../assets/fox/fox.mtl';
import foxDiffuseSource0 from '../assets/fox/fox_skull_0.jpg';
import foxDiffuseSource1 from '../assets/fox/fox_skull_1.jpg';

interface Props {
	isActive: boolean;
}

const IS_MOBILE: boolean = Boolean('ontouchstart' in window);

const BASE_MESH_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uMaterialType: {
		defaultValue: 0,
		name: 'uMaterialType',
		isBool: false,
		isRadio: true,
		radioChoices: ['Vertex Position', 'Phong', 'Wireframe'],
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
	uLightPositionA: {
		defaultValue: { x: 1.0, y: 1.0, z: 1.0 },
		name: 'uLightPositionA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 1.0, y: 1.0, z: 1.0 },
	},
	uLightColorA: {
		defaultValue: { x: 0.0, y: 0.0, z: 1.0 },
		name: 'uLightColorA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.0, y: 0.0, z: 1.0 },
	},
	uLightColorB: {
		defaultValue: { x: 0.3, y: 0.0, z: 0.6 },
		name: 'uLightColorB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.3, y: 0.0, z: 0.6 },
	},
	uLightPositionB: {
		defaultValue: { x: -1.0, y: -1.0, z: 1.0 },
		name: 'uLightPositionB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: -1.0, y: -1.0, z: 1.0 },
	},
};

const BASE_PHONG_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uMaterialType: {
		defaultValue: 0,
		name: 'uMaterialType',
		isBool: false,
		isRadio: true,
		radioChoices: ['Phong', 'Texture', 'Toon', 'Wireframe', 'Psychedelic'],
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
	uDisplacement: {
		defaultValue: 0,
		name: 'uDisplacement',
		isBool: true,
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uTranslation: {
		defaultValue: { x: 0, y: 0.3, z: 0 },
		name: 'uTranslation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0, y: 0.3, z: 0 },
	},
	uScale: {
		defaultValue: 0.0485,
		name: 'uScale',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0485,
	},
	uSpecular: {
		defaultValue: 0.6,
		name: 'uSpecular',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.6,
	},
	uLightColorA: {
		defaultValue: { x: 0.75, y: 0.75, z: 0.75 },
		name: 'uLightColorA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.75, y: 0.75, z: 0.75 },
	},
	uLightPositionA: {
		defaultValue: { x: 1.0, y: 1.0, z: 1.0 },
		name: 'uLightPositionA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 1.0, y: 1.0, z: 1.0 },
	},
	uLightColorB: {
		defaultValue: { x: 0.3, y: 0.3, z: 0.3 },
		name: 'uLightColorB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.3, y: 0.3, z: 0.3 },
	},
	uLightPositionB: {
		defaultValue: { x: -1.0, y: -1.0, z: 1.0 },
		name: 'uLightPositionB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: -1.0, y: -1.0, z: 1.0 },
	},
};

const BASE_FRACTAL_UNIFORMS = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uMouse: {
		defaultValue: { x: 0.6, y: 0.7 },
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.6, y: 0.7 },
	},
	uIterations: {
		defaultValue: IS_MOBILE ? 1 : 3,
		name: 'uIterations',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: IS_MOBILE ? 1 : 3,
	},
	uFractalColor1: {
		defaultValue: { x: 1.0, y: 0.0, z: 0.0 },
		name: 'uFractalColor1',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 1.0, y: 0.0, z: 0.0 },
	},
	uFractalColor2: {
		defaultValue: { x: 0.0, y: 1.0, z: 0.0 },
		name: 'uFractalColor2',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.0, y: 1.0, z: 0.0 },
	},
	uFractalColor3: {
		defaultValue: { x: 0.0, y: 0.0, z: 1.0 },
		name: 'uFractalColor3',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0.0, y: 0.0, z: 1.0 },
	},
};

const CUBE_MESH: Vector3[][] = [
	// Side 1
	[
		{ x: -1, y: -1, z: -1 },
		{ x: -1, y: -1, z: 1 },
		{ x: -1, y: 1, z: 1 },
	],
	[
		{ x: -1, y: -1, z: -1 },
		{ x: -1, y: 1, z: 1 },
		{ x: -1, y: 1, z: -1 },
	],
	// Side 2
	[
		{ x: 1, y: 1, z: -1 },
		{ x: -1, y: -1, z: -1 },
		{ x: -1, y: 1, z: -1 },
	],
	[
		{ x: 1, y: 1, z: -1 },
		{ x: 1, y: -1, z: -1 },
		{ x: -1, y: -1, z: -1 },
	],
	// Side 3
	[
		{ x: 1, y: -1, z: 1 },
		{ x: -1, y: -1, z: -1 },
		{ x: 1, y: -1, z: -1 },
	],
	[
		{ x: 1, y: -1, z: 1 },
		{ x: -1, y: -1, z: 1 },
		{ x: -1, y: -1, z: -1 },
	],
	// Side 4
	[
		{ x: 1, y: 1, z: 1 },
		{ x: 1, y: -1, z: -1 },
		{ x: 1, y: 1, z: -1 },
	],
	[
		{ x: 1, y: -1, z: -1 },
		{ x: 1, y: 1, z: 1 },
		{ x: 1, y: -1, z: 1 },
	],
	// Side 5
	[
		{ x: 1, y: 1, z: 1 },
		{ x: 1, y: 1, z: -1 },
		{ x: -1, y: 1, z: -1 },
	],
	[
		{ x: 1, y: 1, z: 1 },
		{ x: -1, y: 1, z: -1 },
		{ x: -1, y: 1, z: 1 },
	],
	// Side 6
	[
		{ x: -1, y: 1, z: 1 },
		{ x: -1, y: -1, z: 1 },
		{ x: 1, y: -1, z: 1 },
	],
	[
		{ x: 1, y: 1, z: 1 },
		{ x: -1, y: 1, z: 1 },
		{ x: 1, y: -1, z: 1 },
	],
];

const CUBE_ROTATION_DELTA: Vector3 = { x: 0.0, y: 0.01, z: 0 };
const OBJ_ROTATION_DELTA: Vector3 = { x: 0, y: 0.01, z: 0 };

const DepthPage = ({ isActive }: Props) => {
	const meshUniforms = React.useRef<UniformSettings>(BASE_MESH_UNIFORMS);
	const [meshFragmentShader, setMeshFragmentShader] = React.useState<string>(initialMeshFragmentShader);
	const [meshFragmentError, setMeshFragmentError] = React.useState<Error | null>();
	const [meshVertexShader, setMeshVertexShader] = React.useState<string>(initialMeshVertexShader);
	const [meshVertexError, setMeshVertexError] = React.useState<Error | null>();
	const [meshAttributes, setMeshAttributes] = React.useState<any[]>([]);

	const phongUniforms = React.useRef<UniformSettings>(BASE_PHONG_UNIFORMS);
	const [phongFragmentShader, setPhongFragmentShader] = React.useState<string>(initialPhongFragmentShader);
	const [phongFragmentError, setPhongFragmentError] = React.useState<Error | null>();
	const [phongVertexShader, setPhongVertexShader] = React.useState<string>(initialPhongVertexShader);
	const [phongVertexError, setPhongVertexError] = React.useState<Error | null>();
	const [phongAttributes, setPhongAttributes] = React.useState<any[]>([]);

	const fractalUniforms = React.useRef<UniformSettings>(BASE_FRACTAL_UNIFORMS);
	const [fractalFragmentShader, setFractalFragmentShader] = React.useState<string>(initialFractalFragmentShader);
	const [fractalFragmentError, setFractalFragmentError] = React.useState<Error | null>();
	const [fractalVertexShader, setFractalVertexShader] = React.useState<string>(baseVertexShader);
	const [fractalVertexError, setFractalVertexError] = React.useState<Error | null>();
	const [fractalAttributes, setFractalAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	const foxOBJData = {
		OBJSource: foxOBJ,
		MTLSource: foxMTL,
		textures: {
			diffuse: {
				'material_0.001': foxDiffuseSource0,
				'material_1.001': foxDiffuseSource1,
			},
		},
	};

	return (
		<div>
			<Section
				title='2.0: Mesh'
				notes={`Moving into a 3D context, we now add several steps to the initialization and updating processes. An array of vertex positions is bound to an array buffer, along with a corresponding array buffer of computer normals.
				A projection matrix and a view model matrix are now required to instantiate a camera with perspective and to place the geometry in world space.  The vertex shader then calculates phong lighting and passes it to the fragment shader for rendering.
				`}
				image={meshDiagram}
				fragmentShader={meshFragmentShader}
				setFragmentShader={setMeshFragmentShader}
				fragmentError={meshFragmentError}
				vertexShader={meshVertexShader}
				setVertexShader={setMeshVertexShader}
				vertexError={meshVertexError}
				attributes={meshAttributes}
				uniforms={meshUniforms}>
				<DepthCanvas
					fragmentShader={meshFragmentShader}
					vertexShader={meshVertexShader}
					uniforms={meshUniforms}
					setAttributes={setMeshAttributes}
					faceArray={CUBE_MESH}
					rotationDelta={CUBE_ROTATION_DELTA}
					setFragmentError={setMeshFragmentError}
					setVertexError={setMeshVertexError}
				/>
			</Section>
			<Section
				title='2.1: File Loader'
				notes={`Loading a file to WebGL requires parsing the original format to raw position, material and texture data. Textures are mapped to corresponding vertex positions with texture coordinates parsed from a MTL file.`}
				image={fileLoaderDiagram}
				fragmentShader={phongFragmentShader}
				setFragmentShader={setPhongFragmentShader}
				fragmentError={phongFragmentError}
				vertexShader={phongVertexShader}
				setVertexShader={setPhongVertexShader}
				vertexError={phongVertexError}
				attributes={phongAttributes}
				uniforms={phongUniforms}>
				<LoaderCanvas
					fragmentShader={phongFragmentShader}
					vertexShader={phongVertexShader}
					uniforms={phongUniforms}
					setAttributes={setPhongAttributes}
					OBJData={foxOBJData}
					rotationDelta={OBJ_ROTATION_DELTA}
					setFragmentError={setPhongFragmentError}
					setVertexError={setPhongVertexError}
				/>
			</Section>
			{!IS_MOBILE && (
				<Section
					title='2.2: Fractal'
					notes={`Raymarching is a powerful technique for rendering purely procedural 3D geometry, without needing to load a mesh. For each step along a ray from the camera to the geometry, an SDF slice is created and combined to form a volume.  See 0.5 for a 2D SDF example.`}
					image={fractalDiagram}
					fragmentShader={fractalFragmentShader}
					setFragmentShader={setFractalFragmentShader}
					fragmentError={fractalFragmentError}
					vertexShader={fractalVertexShader}
					setVertexShader={setFractalVertexShader}
					vertexError={fractalVertexError}
					attributes={fractalAttributes}
					uniforms={fractalUniforms}>
					<BaseCanvas
						fragmentShader={fractalFragmentShader}
						vertexShader={fractalVertexShader}
						uniforms={fractalUniforms}
						setAttributes={setFractalAttributes}
						setFragmentError={setFractalFragmentError}
						setVertexError={setFractalVertexError}
					/>
				</Section>
			)}
		</div>
	);
};

export default DepthPage;
