import React, {forwardRef} from 'react';
import {Vector2} from '../../../types';
import ContrastForm from './ContrastForm/ContrastForm';

import styles from './AccessibleContrast.module.scss';

interface Props {
	Foreground?: React.FC;
	size: React.MutableRefObject<Vector2>;
}

const AccessibleContrast = forwardRef((props: Props, ref: React.RefObject<HTMLCanvasElement>) => {
	const {size, Foreground = ContrastForm} = props;

	console.log({styles});
	return (
		<>
			<canvas
				ref={ref}
				width={size.current.x}
				height={size.current.y}
				className={styles.fullScreenCanvas}
				role='img'
			/>
			<Foreground />
		</>
	);
});

export default AccessibleContrast;
