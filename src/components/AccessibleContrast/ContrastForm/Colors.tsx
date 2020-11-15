import React, {useState, useCallback} from 'react';
import {Color, ColorInput} from 'material-ui-color';
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

const Colors = ({color1, setColor1, color2, setColor2, color3, setColor3}: Props) => {
	const [ariaMessage, setAriaMessage] = useState<string | null>(null);

	const handleFocus = useCallback(
		(colorName: string, getColor: () => RGB) => (e) => {
			e.stopPropagation();
			const color = getColor();
			setAriaMessage(
				`${colorName} input.  Currently set to red: ${color.r}, green: ${color.g}, blue: ${color.b}.  Typing in red field.`
			);
		},
		[]
	);

	const handleColorChange = useCallback(
		(colorName: string, setColor: (rgb: RGB) => void) => (color) => {
			setAriaMessage(
				`${colorName} set to red: ${color.r}, green: ${color.g}, blue: ${color.b}`
			);
			setColor(color);
		},
		[]
	);

	return (
		<div className={styles.colors}>
			<FormControl
				classes={{
					root: styles.colorControl,
				}}
				onFocus={handleFocus('Color 1', () => color1)}
			>
				<FormLabel
					classes={{
						root: styles.colorLabel,
						focused: styles.focused,
					}}
				>
					Color 1
				</FormLabel>
				<ColorInput
					value={color1}
					format='rgb'
					onChange={handleColorChange('Color 1', setColor1)}
				/>
			</FormControl>
			<FormControl
				classes={{
					root: styles.colorControl,
				}}
				onFocus={handleFocus('Color 2', () => color2)}
			>
				<FormLabel
					classes={{
						root: styles.colorLabel,
						focused: styles.focused,
					}}
				>
					Color 2
				</FormLabel>
				<ColorInput
					value={color2}
					format='rgb'
					onChange={handleColorChange('Color 2', setColor2)}
				/>
			</FormControl>
			<FormControl
				classes={{
					root: styles.colorControl,
				}}
				onFocus={handleFocus('Color 3', () => color3)}
			>
				<FormLabel
					classes={{
						root: styles.colorLabel,
						focused: styles.focused,
					}}
				>
					Color 3
				</FormLabel>
				<ColorInput
					value={color3}
					format='rgb'
					onChange={handleColorChange('Color 3', setColor3)}
				/>
			</FormControl>
			<div role='region' className={styles.hidden} aria-live='polite'>
				{ariaMessage}
			</div>
		</div>
	);
};

export default Colors;
