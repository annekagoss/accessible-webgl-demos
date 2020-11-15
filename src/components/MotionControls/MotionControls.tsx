import React, {useCallback, useContext} from 'react';
import {Button} from '@material-ui/core';
import {MotionContext} from '../App';

import styles from './MotionControls.module.scss';

const MotionControls = () => {
	const [motion, setMotion] = useContext(MotionContext);

	const toggleMotion = useCallback(() => {
		setMotion(!motion);
	}, [motion]);

	return (
		<div className={styles.motionControls}>
			<Button
				aria-label='allow motion'
				onClick={toggleMotion}
				classes={{root: styles.button}}
			>
				{motion ? 'Pause Motion' : 'Resume Motion'}
			</Button>
		</div>
	);
};

export default MotionControls;
