import React from 'react';
import {ColorInput} from 'material-ui-color';
import {FormControl, FormLabel} from '@material-ui/core';

import styles from './ContrastForm.module.scss';
import './Colors.scss';

export interface RGB {
	r: number;
	g: number;
	b: number;
}

interface Props {
	color1: RGB;
	setColor1: (rgb: RGB) => void;
	color2: RGB;
	setColor2: (rgb: RGB) => void;
	color3: RGB;
	setColor3: (rgb: RGB) => void;
}

const Colors = ({color1, setColor1, color2, setColor2, color3, setColor3}: Props) => (
	<div className={styles.colors}>
		<FormControl
			classes={{
				root: styles.colorControl,
			}}
		>
			<FormLabel
				classes={{
					root: styles.label,
					focused: styles.focused,
				}}
			>
				Color 1
			</FormLabel>
			<ColorInput value={color1} format='rgb' onChange={setColor1} />
		</FormControl>
		<FormControl
			classes={{
				root: styles.colorControl,
			}}
		>
			<FormLabel
				classes={{
					root: styles.label,
					focused: styles.focused,
				}}
			>
				Color 2
			</FormLabel>
			<ColorInput value={color2} format='rgb' onChange={setColor2} />
		</FormControl>
		<FormControl
			classes={{
				root: styles.colorControl,
			}}
		>
			<FormLabel
				classes={{
					root: styles.label,
					focused: styles.focused,
				}}
			>
				Color 3
			</FormLabel>
			<ColorInput value={color3} format='rgb' onChange={setColor3} />
		</FormControl>
	</div>
);

export default Colors;
