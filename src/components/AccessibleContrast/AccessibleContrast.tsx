import React, {forwardRef, useCallback} from 'react';
import {UniformSettings, Vector2} from '../../../types';
import ContrastForm from './ContrastForm/ContrastForm';

import styles from './AccessibleContrast.module.scss';

interface Props {
	size: React.MutableRefObject<Vector2>;
	uniforms: React.MutableRefObject<UniformSettings>;
}

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
			<>
				<canvas
					ref={ref}
					width={size.current.x}
					height={size.current.y}
					className={styles.fullScreenCanvas}
					role='img'
				/>
				<ContrastForm updateUniform={updateUniform} />
			</>
		);
	}
);

export default AccessibleContrast;
