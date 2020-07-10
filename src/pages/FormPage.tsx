import * as React from 'react';
import { BASE_UNIFORMS } from '../utils/general';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import initialBaseVertexShader from '../../lib/gl/shaders/base.vert';
import initialBaseFragmentShader from '../../lib/gl/shaders/hello-world.frag';
import initialStepFragmentShader from '../../lib/gl/shaders/step.frag';
import initialLineFragmentShader from '../../lib/gl/shaders/line.frag';
import initialRectFragmentShader from '../../lib/gl/shaders/rectangle.frag';
import initialCircleFragmentShader from '../../lib/gl/shaders/circle.frag';
import initialPolygonFragmentShader from '../../lib/gl/shaders/polygon.frag';
import { UNIFORM_TYPE, UniformSettings } from '../../types';

import helloWorldDiagram from '../assets/diagrams/0.0 Hello World.png';
import stepDiagram from '../assets/diagrams/0.1 Step.png';
import lineDiagram from '../assets/diagrams/0.2 Line.png';
import rectangleDiagram from '../assets/diagrams/0.3 Rectangle.png';
import circleDiagram from '../assets/diagrams/0.4 Circle.png';
import polygonDiagram from '../assets/diagrams/0.5 Polygon.png';

const BASE_STEP_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uThreshold: {
		defaultValue: 0.5,
		name: 'uThreshold',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.5,
	},
};

const BASE_LINE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uSmooth: {
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uThickness: {
		defaultValue: 0.02,
		name: 'uThickness',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.02,
	},
};

const BASE_RECTANGLE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uRectDimensions: {
		defaultValue: { x: 0.33, y: 0.66 },
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.33, y: 0.66 },
	},
};

const BASE_CIRCLE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uSmooth: {
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uRadius: {
		defaultValue: 0.25,
		name: 'uRadius',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.25,
	},
	uCenter: {
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uCenter',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 },
	},
};

const BASE_POLYGON_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uNumSides: {
		defaultValue: 3,
		isBool: false,
		name: 'uNumSides',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 3,
	},
	uShowSDF: {
		defaultValue: 0,
		isBool: true,
		name: 'uShowSDF',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
};

interface Props {
	isActive: boolean;
}

const FormPage = ({ isActive }: Props) => {
	const [attributes, setAttributes] = React.useState<any[]>([]);

	const baseUniforms = React.useRef<UniformSettings>(BASE_UNIFORMS);
	const [baseFragmentShader, setBaseFragmentShader] = React.useState<string>(
		initialBaseFragmentShader
	);
	const [
		baseFragmentError,
		setBaseFragmentError,
	] = React.useState<Error | null>();
	const [baseVertexShader, setBaseVertexShader] = React.useState<string>(
		initialBaseVertexShader
	);
	const [
		baseVertexError,
		setBaseVertexError,
	] = React.useState<Error | null>();

	const stepUniforms = React.useRef<UniformSettings>(BASE_STEP_UNIFORMS);
	const [stepFragmentShader, setStepFragmentShader] = React.useState<string>(
		initialStepFragmentShader
	);
	const [
		stepFragmentError,
		setStepFragmentError,
	] = React.useState<Error | null>();
	const [stepVertexShader, setStepVertexShader] = React.useState<string>(
		initialBaseVertexShader
	);
	const [
		stepVertexError,
		setStepVertexError,
	] = React.useState<Error | null>();

	const lineUniforms = React.useRef<UniformSettings>(BASE_LINE_UNIFORMS);
	const [lineFragmentShader, setLineFragmentShader] = React.useState<string>(
		initialLineFragmentShader
	);
	const [
		lineFragmentError,
		setLineFragmentError,
	] = React.useState<Error | null>();
	const [lineVertexShader, setLineVertexShader] = React.useState<string>(
		initialBaseVertexShader
	);
	const [
		lineVertexError,
		setLineVertexError,
	] = React.useState<Error | null>();

	const rectUniforms = React.useRef<UniformSettings>(BASE_RECTANGLE_UNIFORMS);
	const [rectFragmentShader, setRectFragmentShader] = React.useState<string>(
		initialRectFragmentShader
	);
	const [
		rectFragmentError,
		setRectFragmentError,
	] = React.useState<Error | null>();
	const [rectVertexShader, setRectVertexShader] = React.useState<string>(
		initialBaseVertexShader
	);
	const [
		rectVertexError,
		setRectVertexError,
	] = React.useState<Error | null>();

	const circleUniforms = React.useRef<UniformSettings>(BASE_CIRCLE_UNIFORMS);
	const [circleFragmentShader, setCircleFragmentShader] = React.useState<
		string
	>(initialCircleFragmentShader);
	const [
		circleFragmentError,
		setCircleFragmentError,
	] = React.useState<Error | null>();
	const [circleVertexShader, setCircleVertexShader] = React.useState<string>(
		initialBaseVertexShader
	);
	const [
		circleVertexError,
		setCircleVertexError,
	] = React.useState<Error | null>();

	const polygonUniforms = React.useRef<UniformSettings>(
		BASE_POLYGON_UNIFORMS
	);
	const [polygonFragmentShader, setPolygonFragmentShader] = React.useState<
		string
	>(initialPolygonFragmentShader);
	const [
		polygonFragmentError,
		setPolygonFragmentError,
	] = React.useState<Error | null>();
	const [polygonVertexShader, setPolygonVertexShader] = React.useState<
		string
	>(initialBaseVertexShader);
	const [
		polygonVertexError,
		setPolygonVertexError,
	] = React.useState<Error | null>();

	// React.useEffect(() => {
	// 	console.log('LOADED');
	// 	onLoad();
	// 	// return () => {
	// 	// 	setIsLoaded(false);
	// 	// };
	// }, []);

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title='0.0: Hello World'
				notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
			`}
				image={helloWorldDiagram}
				fragmentShader={baseFragmentShader}
				setFragmentShader={setBaseFragmentShader}
				fragmentError={baseFragmentError}
				vertexShader={baseVertexShader}
				setVertexShader={setBaseVertexShader}
				vertexError={baseVertexError}
				uniforms={baseUniforms}
				attributes={attributes}
			>
				<BaseCanvas
					fragmentShader={baseFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={baseUniforms}
					setAttributes={setAttributes}
					setFragmentError={setBaseFragmentError}
					setVertexError={setBaseVertexError}
				/>
			</Section>
			<Section
				title='0.1: Step'
				notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}
				image={stepDiagram}
				fragmentShader={stepFragmentShader}
				setFragmentShader={setStepFragmentShader}
				fragmentError={stepFragmentError}
				vertexShader={stepVertexShader}
				setVertexShader={setStepVertexShader}
				vertexError={stepVertexError}
				attributes={attributes}
				uniforms={stepUniforms}
			>
				<BaseCanvas
					fragmentShader={stepFragmentShader}
					vertexShader={stepVertexShader}
					uniforms={stepUniforms}
					setAttributes={setAttributes}
					setFragmentError={setStepFragmentError}
					setVertexError={setStepVertexError}
				/>
			</Section>
			<Section
				title='0.2: Line'
				notes={
					' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'
				}
				image={lineDiagram}
				fragmentShader={lineFragmentShader}
				setFragmentShader={setLineFragmentShader}
				fragmentError={lineFragmentError}
				vertexShader={lineVertexShader}
				setVertexShader={setLineVertexShader}
				vertexError={lineVertexError}
				attributes={attributes}
				uniforms={lineUniforms}
			>
				<BaseCanvas
					fragmentShader={lineFragmentShader}
					vertexShader={lineVertexShader}
					uniforms={lineUniforms}
					setAttributes={setAttributes}
					setFragmentError={setLineFragmentError}
					setVertexError={setLineVertexError}
				/>
			</Section>
			<Section
				title='0.3: Rectangle'
				notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}
				image={rectangleDiagram}
				fragmentShader={rectFragmentShader}
				setFragmentShader={setRectFragmentShader}
				fragmentError={rectFragmentError}
				vertexShader={rectVertexShader}
				setVertexShader={setRectVertexShader}
				vertexError={rectVertexError}
				attributes={attributes}
				uniforms={rectUniforms}
			>
				<BaseCanvas
					fragmentShader={rectFragmentShader}
					vertexShader={rectVertexShader}
					uniforms={rectUniforms}
					setAttributes={setAttributes}
					setFragmentError={setRectFragmentError}
					setVertexError={setRectVertexError}
				/>
			</Section>
			<Section
				title='0.4: Circle'
				notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}
				image={circleDiagram}
				fragmentShader={circleFragmentShader}
				setFragmentShader={setCircleFragmentShader}
				fragmentError={circleFragmentError}
				vertexShader={circleVertexShader}
				setVertexShader={setCircleVertexShader}
				vertexError={circleVertexError}
				attributes={attributes}
				uniforms={circleUniforms}
			>
				<BaseCanvas
					fragmentShader={circleFragmentShader}
					vertexShader={circleVertexShader}
					uniforms={circleUniforms}
					setAttributes={setAttributes}
					setFragmentError={setCircleFragmentError}
					setVertexError={setCircleVertexError}
				/>
			</Section>
			<Section
				title='0.5: Polygon'
				notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside the boundaries of an n-sided polygon.`}
				image={polygonDiagram}
				fragmentShader={polygonFragmentShader}
				setFragmentShader={setPolygonFragmentShader}
				fragmentError={polygonFragmentError}
				vertexShader={polygonVertexShader}
				setVertexShader={setPolygonVertexShader}
				vertexError={polygonVertexError}
				attributes={attributes}
				uniforms={polygonUniforms}
			>
				<BaseCanvas
					fragmentShader={polygonFragmentShader}
					vertexShader={polygonVertexShader}
					uniforms={polygonUniforms}
					setAttributes={setAttributes}
					setFragmentError={setPolygonFragmentError}
					setVertexError={setPolygonVertexError}
				/>
			</Section>
		</div>
	);
};

export default FormPage;
