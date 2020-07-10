import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import initialTransitionFragmentShader from '../../lib/gl/shaders/transition.frag';
import initialTransitionVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import TransitionCanvas from '../components/TransitionCanvas/TransitionCanvas';

import transitionDiagram from '../assets/diagrams/4.0 Transition.png';

import slideImage1 from '../assets/slides/purple-desert-1.jpg';
import slideImage2 from '../assets/slides/red-cave-1.jpg';
import slideImage3 from '../assets/slides/red-boulder-1.jpg';
import slideImage4 from '../assets/slides/purple-desert-2.jpg';
import slideImage5 from '../assets/slides/red-boulder-2.jpg';

interface Props {
	isActive: boolean;
}

const BASE_TRANSITION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uDirection: {
		defaultValue: 1,
		name: 'uDirection',
		readonly: true,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uTransitionProgress: {
		defaultValue: 0.0,
		name: 'uTransitionProgress',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0,
	},
};

const TransitionPage = ({ isActive }: Props) => {
	const [attributes, setAttributes] = React.useState<any[]>([]);
	const transitionUniforms = React.useRef<UniformSettings>(BASE_TRANSITION_UNIFORMS);
	const [transitionFragmentShader, setTransitionFragmentShader] = React.useState<string>(initialTransitionFragmentShader);
	const [transitionFragmentError, setTransitionFragmentError] = React.useState<Error | null>();
	const [transitionVertexShader, setTransitionVertexShader] = React.useState<string>(initialTransitionVertexShader);
	const [transitionVertexError, setTransitionVertexError] = React.useState<Error | null>();

	if (!isActive) return <></>;

	const slideImages: Record<string, string> = {
		slideImage1,
		slideImage2,
		slideImage3,
		slideImage4,
		slideImage5,
	};
	return (
		<div>
			<Section
				title=''
				notes={`An inifite carousel with an arbitrary number of slides can be made by swapping out the texture data of two texture samplers.`}
				image={transitionDiagram}
				fullScreen={true}
				fragmentShader={transitionFragmentShader}
				setFragmentShader={setTransitionFragmentShader}
				fragmentError={transitionFragmentError}
				vertexShader={transitionVertexShader}
				setVertexShader={setTransitionVertexShader}
				vertexError={transitionVertexError}
				attributes={attributes}
				uniforms={transitionUniforms}>
				<TransitionCanvas
					fragmentShader={transitionFragmentShader}
					vertexShader={transitionVertexShader}
					uniforms={transitionUniforms}
					setAttributes={setAttributes}
					slideImages={slideImages}
					setFragmentError={setTransitionFragmentError}
					setVertexError={setTransitionVertexError}
				/>
			</Section>
		</div>
	);
};

export default TransitionPage;
