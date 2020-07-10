import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import initialInteractionVertexShader from '../../lib/gl/shaders/phong.vert';
import initialInteractionFragmentShader from '../../lib/gl/shaders/toon.frag';
import Section from '../components/Section/Section';
import InteractionCanvas from '../components/InteractionCanvas/InteractionCanvas';

import interactionDiagram from '../assets/diagrams/3.0 Interaction.png';

// FOX SKULL
import foxOBJ from '../assets/fox/fox3.obj';
import foxMTL from '../assets/fox/fox.mtl';
import foxDiffuseSource0 from '../assets/fox/fox_skull_0.jpg';
import foxDiffuseSource1 from '../assets/fox/fox_skull_1.jpg';

interface Props {
	isActive: boolean;
}

const BASE_INTERACTION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uTranslation: {
		defaultValue: { x: 0, y: 0, z: 0 },
		name: 'uTranslation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0, y: 0, z: 0 },
	},
	uRotation: {
		defaultValue: { x: 14.9, y: 180 + 50.7, z: 28.8 },
		name: 'uRotation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 14.9, y: 180 + 50.7, z: 28.8 },
	},
	uScale: {
		defaultValue: 0.0485,
		name: 'uScale',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0485,
	},
};

const InteractionPage = ({ isActive }: Props) => {
	const [attributes, setAttributes] = React.useState<any[]>([]);
	const interactionUniforms = React.useRef<UniformSettings>(BASE_INTERACTION_UNIFORMS);
	const [interactionFragmentShader, setInteractionFragmentShader] = React.useState<string>(initialInteractionFragmentShader);
	const [interactionFragmentError, setInteractionFragmentError] = React.useState<Error | null>();
	const [interactionVertexShader, setInteractionVertexShader] = React.useState<string>(initialInteractionVertexShader);
	const [interactionVertexError, setInteractionVertexError] = React.useState<Error | null>();

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
				title=''
				notes={`It's important not to assume that users will be on a device that supports the interaction you've coded. Mouse position can be swapped with touch drag events depending on the device type that has loaded the page
				Gyroscope orientation events are also interesting in combination with WebGL, but privacy restrictions for orientation events are growing stricter and opt-in flows may detract from the effect of the graphics.`}
				image={interactionDiagram}
				fullScreen={true}
				fragmentShader={interactionFragmentShader}
				setFragmentShader={setInteractionFragmentShader}
				fragmentError={interactionFragmentError}
				vertexShader={interactionVertexShader}
				setVertexShader={setInteractionVertexShader}
				vertexError={interactionVertexError}
				attributes={attributes}
				uniforms={interactionUniforms}>
				<InteractionCanvas
					fragmentShader={interactionFragmentShader}
					vertexShader={interactionVertexShader}
					uniforms={interactionUniforms}
					setAttributes={setAttributes}
					OBJData={foxOBJData}
					setFragmentError={setInteractionFragmentError}
					setVertexError={setInteractionVertexError}
				/>
			</Section>
		</div>
	);
};

export default InteractionPage;
