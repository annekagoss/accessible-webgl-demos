import * as React from 'react';
import cx from 'classnames';
import { UNIFORM_TYPE, UniformSetting, UniformSettings, Vector2 } from '../../../types';
import { parseUniform } from '../../utils/general';
import styles from './Inputs.module.scss';
import { any } from 'prop-types';

interface Props {
	attributes: any[];
	uniforms: React.MutableRefObject<UniformSettings>;
	fullScreen?: boolean;
}

interface UniformInputProps {
	uniform: UniformSetting;
	updateUniforms: (name: string, newValue: any) => void;
}

interface TypeInputProps {
	uniform: UniformSetting;
	updateUniforms: (name: string, newValue: any) => void;
}

const FloatInput = ({ uniform, updateUniforms }: TypeInputProps) => (
	<input
		type='number'
		placeholder={uniform.defaultValue}
		step={0.1}
		min={0}
		max={100}
		onChange={(e) => {
			updateUniforms(uniform.name, e.target.value);
		}}
	/>
);

const IntInput = ({ uniform, updateUniforms }: TypeInputProps) => (
	<input
		type='number'
		step={1}
		min={0}
		max={20}
		defaultValue={uniform.defaultValue}
		onChange={(e) => {
			updateUniforms(uniform.name, e.target.value);
		}}
	/>
);

const BoolInput = ({ uniform, updateUniforms }: TypeInputProps) => (
	<input
		type='checkbox'
		defaultChecked={uniform.defaultValue === 1}
		step={1}
		min={0}
		max={1}
		onChange={(e) => {
			updateUniforms(uniform.name, e.target.checked ? 1 : 0);
		}}
	/>
);

const RadioInput = ({ uniform, updateUniforms }: TypeInputProps) => {
	return (
		<form>
			{uniform.radioChoices.map((choice, i) => (
				<div key={i}>
					<input
						type='radio'
						value={i}
						name={uniform.name}
						onChange={() => {
							updateUniforms(uniform.name, i);
						}}
					/>
					<label>{choice}</label>
				</div>
			))}
		</form>
	);
};

const Vec2Input = ({ uniform, updateUniforms }: TypeInputProps) => {
	return (
		<div>
			<div>
				{`x: `}
				<input
					type='number'
					placeholder={uniform.defaultValue.x}
					step={0.01}
					min={-1}
					max={1}
					onChange={(e) => {
						updateUniforms(uniform.name, { x: e.target.value });
					}}
				/>
			</div>
			<div>
				{`y: `}
				<input
					type='number'
					placeholder={uniform.defaultValue.y}
					step={0.01}
					min={-1}
					max={1}
					onChange={(e) => {
						updateUniforms(uniform.name, { y: e.target.value });
					}}
				/>
			</div>
		</div>
	);
};

const Vec3Input = ({ uniform, updateUniforms }: TypeInputProps) => (
	<div>
		<div>
			{`x: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.x}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { x: e.target.value });
				}}
			/>
		</div>
		<div>
			{`y: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.y}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { y: e.target.value });
				}}
			/>
		</div>
		<div>
			{`z: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.z}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { z: e.target.value });
				}}
			/>
		</div>
	</div>
);

const Vec4Input = ({ uniform, updateUniforms }: TypeInputProps) => (
	<div>
		<div>
			{`x: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.x}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { x: e.target.value });
				}}
			/>
		</div>
		<div>
			{`y: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.y}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { y: e.target.value });
				}}
			/>
		</div>
		<div>
			{`z: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.z}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { z: e.target.value });
				}}
			/>
		</div>
		<div>
			{`w: `}
			<input
				type='number'
				placeholder={uniform.defaultValue.w}
				step={0.01}
				min={0}
				max={1}
				onChange={(e) => {
					updateUniforms(uniform.name, { w: e.target.value });
				}}
			/>
		</div>
	</div>
);

const UniformInput = ({ uniform, updateUniforms }: UniformInputProps) => {
	if (uniform.readonly) {
		if (uniform.name === 'uBackground') return <></>;
		return parseUniform(uniform.value, uniform.type);
	}
	switch (uniform.type) {
		case UNIFORM_TYPE.FLOAT_1:
			return <FloatInput uniform={uniform} updateUniforms={updateUniforms} />;
		case UNIFORM_TYPE.INT_1:
			if (uniform.isBool) return <BoolInput uniform={uniform} updateUniforms={updateUniforms} />;
			if (uniform.isRadio) return <RadioInput uniform={uniform} updateUniforms={updateUniforms} />;
			return <IntInput uniform={uniform} updateUniforms={updateUniforms} />;
		case UNIFORM_TYPE.VEC_2:
			return <Vec2Input uniform={uniform} updateUniforms={updateUniforms} />;
		case UNIFORM_TYPE.VEC_3:
			return <Vec3Input uniform={uniform} updateUniforms={updateUniforms} />;
		case UNIFORM_TYPE.VEC_4:
			return <Vec4Input uniform={uniform} updateUniforms={updateUniforms} />;
		default:
			return uniform.defaultValue;
	}
};

const Inputs = ({ uniforms, attributes, fullScreen }: Props) => {
	const [uniformsVisible, setUniformsVisible] = React.useState<boolean>(true);
	const [attributesVisible, setAttributesVisible] = React.useState<boolean>(false);

	const updateUniforms = (name, newValue) => {
		const newUniform: UniformSetting = uniforms.current[name];
		const uniformIsVector: boolean = [UNIFORM_TYPE.VEC_2, UNIFORM_TYPE.VEC_3, UNIFORM_TYPE.VEC_4].includes(newUniform.type);
		newUniform.value = uniformIsVector ? { ...newUniform.value, ...newValue } : newValue;
		uniforms.current = { ...uniforms.current, [name]: newUniform };
	};

	return (
		<div className={cx(styles.root, fullScreen && styles.fullScreen)}>
			<div className={styles.tabs}>
				<button
					className={cx(styles.tab, uniformsVisible && styles.active)}
					onClick={() => {
						if (!uniformsVisible) {
							setUniformsVisible(true);
							setAttributesVisible(false);
						}
					}}>
					Uniforms
				</button>
				<button
					className={cx(styles.tab, attributesVisible && styles.active)}
					onClick={() => {
						if (!attributesVisible) {
							setAttributesVisible(true);
							setUniformsVisible(false);
						}
					}}>
					Attributes
				</button>
			</div>
			<div className={styles.textContainer}>
				<div className={cx(styles.textBlock, uniformsVisible && styles.active)}>
					{Object.keys(uniforms.current)
						.filter((name) => name !== 'uMouse' && name !== 'uTime')
						.map((name) => (
							<div className={styles.textItem} key={name}>
								{name}: <UniformInput uniform={uniforms.current[name]} updateUniforms={updateUniforms} />
							</div>
						))}
				</div>
				<div className={cx(styles.textBlock, attributesVisible && styles.active)}>
					{attributes.map((attribute) => (
						<div className={styles.textItem} key={attribute.name}>
							{attribute.name}: {attribute.value}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Inputs;
