import {FormControl, FormControlLabel, Switch} from '@material-ui/core';
import React from 'react';

import styles from './ContrastForm.module.scss';

interface Props {
	invertedText: boolean;
	setInvertedText: (inverted: boolean) => void;
}

const InvertTextSwitch = ({invertedText, setInvertedText}: Props) => (
	<FormControl component='fieldset'>
		<FormControlLabel
			control={
				<Switch
					checked={invertedText}
					aria-label={'invert text'}
					color='default'
					classes={{
						thumb: styles.switchThumb,
						track: styles.switchTrack,
					}}
					onChange={(_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
						setInvertedText(checked);
					}}
				/>
			}
			label='Invert Text'
			classes={{
				root: styles.invertControl,
				label: styles.label,
			}}
		/>
	</FormControl>
);

export default InvertTextSwitch;
