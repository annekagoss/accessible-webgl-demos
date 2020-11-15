import React, {forwardRef, useCallback, useMemo} from 'react';
import {UniformSettings, Vector2} from '../../../types';
import ContrastForm from './ContrastForm/ContrastForm';

import styles from './AccessibleContrast.module.scss';
import MotionControls from '../MotionControls/MotionControls';

interface Props {
	size: React.MutableRefObject<Vector2>;
	uniforms: React.MutableRefObject<UniformSettings>;
}

const ARIA_LABEL =
	'An animated graphic of three colors softly blurred together and moving slowly. Use the controls to make the contrast between the colors and the text comply with accessibility standards.';

const AccessibleContrast = forwardRef(
	({size, uniforms}: Props, ref: React.RefObject<HTMLCanvasElement>) => {
		const updateUniform = useCallback(
			(name: string, value: any) => {
				uniforms.current = {
					...uniforms.current,
					[name]: {
						...uniforms.current[name],
						value,
					},
				};
			},
			[uniforms]
		);

		return (
			<div tabIndex={0} aria-label={ARIA_LABEL}>
				<canvas
					ref={ref}
					width={size.current.x}
					height={size.current.y}
					className={styles.fullScreenCanvas}
					role='img'
				/>
				<ContrastForm updateUniform={updateUniform} />
				<MotionControls />
			</div>
		);
	}
);

export default AccessibleContrast;
