import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import initialRasterizationFragmentShader from '../../lib/gl/shaders/dom.frag';
import initialRasterizationVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import DOMRasterizationCanvas from '../components/DOMRasterizationCanvas/DOMRasterizationCanvas';

import domRasterizationDiagram from '../assets/diagrams/5.0 Dom Rasterization.png';

interface Props {
	isActive: boolean;
}

const BASE_RASTERIZATION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uSamplerResolution0: {
		defaultValue: { x: 0, y: 0 },
		name: 'uSamplerResolution0',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
	uColor: {
		defaultValue: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
		name: 'uColor',
		readonly: true,
		type: UNIFORM_TYPE.VEC_4,
		value: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
	},
	uDownSampleFidelity: {
		defaultValue: 2.0,
		name: 'uDownSampleFidelity',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 2.0,
	},
};

const DOMRasterizationPage = ({ isActive }: Props) => {
	const [attributes, setAttributes] = React.useState<any[]>([]);
	const rasterizationUniforms = React.useRef<UniformSettings>(BASE_RASTERIZATION_UNIFORMS);
	const [rasterizationFragmentShader, setRasterizationFragmentShader] = React.useState<string>(initialRasterizationFragmentShader);
	const [rasterizationFragmentError, setRasterizationFragmentError] = React.useState<Error | null>();
	const [rasterizationVertexShader, setRasterizationVertexShader] = React.useState<string>(initialRasterizationVertexShader);
	const [rasterizationVertexError, setRasterizationVertexError] = React.useState<Error | null>();

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title=''
				notes={`It's possible to maintain accessibility in rasterized DOM elements. Keep a copy of the original dom element with transparent content, but full cursor events, focus states and user selection.`}
				image={domRasterizationDiagram}
				fullScreen={true}
				fragmentShader={rasterizationFragmentShader}
				setFragmentShader={setRasterizationFragmentShader}
				fragmentError={rasterizationFragmentError}
				vertexShader={rasterizationVertexShader}
				setVertexShader={setRasterizationVertexShader}
				vertexError={rasterizationVertexError}
				attributes={attributes}
				uniforms={rasterizationUniforms}>
				<DOMRasterizationCanvas
					fragmentShader={rasterizationFragmentShader}
					vertexShader={rasterizationVertexShader}
					uniforms={rasterizationUniforms}
					setAttributes={setAttributes}
					setFragmentError={setRasterizationFragmentError}
					setVertexError={setRasterizationVertexError}
				/>
			</Section>
		</div>
	);
};

export default DOMRasterizationPage;
