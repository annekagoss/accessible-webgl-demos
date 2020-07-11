import * as React from 'react';

import { RGBA, UniformSettings } from '../../../types';
import { luminanceFromRGBA, parseColorFromString } from '../../utils/color';

import cx from 'classnames';
import sangbleuKingdom from 'src/assets/fonts/sangbleuKingdom';
import styles from './MovingText.module.scss';

interface SourceElementProps {
	isCursorCopy?: boolean;
	text: string;
	setText?: (val: string) => void;
	buttonActive: boolean;
	setButtonActive?: (val: boolean) => void;
	inputFocused: boolean;
	setInputFocused?: (val: boolean) => void;
	contrastColor: string;
}

interface SourceProps {
	uniforms: React.MutableRefObject<UniformSettings>;
}

const SourceElement = React.forwardRef(
	({ buttonActive, setButtonActive, inputFocused, setInputFocused, text, setText, contrastColor, isCursorCopy = false }: SourceElementProps, ref: React.RefObject<HTMLDivElement>) => {
		const textColor: string = isCursorCopy ? 'transparent' : contrastColor;

		return (
			<div
				className={cx(styles.canvasForeground, styles.sourceElement, isCursorCopy && styles.cursorCopy)}
				ref={ref}
				onScroll={() => {
					console.log('source');
				}}
				style={{
					position: 'absolute',
					right: 0,
					left: 0,
					top: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '40px',
					color: textColor,
					fontFamily: 'SangBleu Kingdom',
					letterSpacing: 1,
					fontWeight: 'normal',
					lineHeight: 1,
					fontSize: 120,
					textTransform: 'uppercase',
					textAlign: 'left',
					wordBreak: 'break-all',
				}}>
				1. Earth was not: nor globes of attraction The will of the Immortal expanded Or contracted his all flexible senses. Death was not, but eternal life sprung
			</div>
		);
	}
);

const Source = React.forwardRef(({ uniforms }: SourceProps, ref) => {
	const { sourceRef, cursorRef }: Record<string, React.RefObject<HTMLDivElement>> = ref;
	const [text, setText] = React.useState<string>('orange');
	const [contrastColor, setContrastColor] = React.useState<string>('black');
	const [buttonActive, setButtonActive] = React.useState<boolean>(false);
	const [inputFocused, setInputFocused] = React.useState<boolean>(false);

	// React.useEffect(() => {
	// 	const color: RGBA = parseColorFromString(text);
	// 	if (Boolean(color)) {
	// 		uniforms.current.uColor.value = color;
	// 		const luminance: number = luminanceFromRGBA(color, { r: 1, g: 1, b: 1 });
	// 		const contrastColor: string = luminance > 0.5 ? 'black' : 'white';
	// 		setContrastColor(contrastColor);
	// 	}
	// }, [text]);
	return (
		<>
			<SourceElement ref={sourceRef} text={text} buttonActive={buttonActive} inputFocused={inputFocused} contrastColor={contrastColor} />
			<SourceElement
				ref={cursorRef}
				isCursorCopy={true}
				text={text}
				setText={setText}
				buttonActive={buttonActive}
				setButtonActive={setButtonActive}
				inputFocused={inputFocused}
				setInputFocused={setInputFocused}
				contrastColor={contrastColor}
			/>
		</>
	);
});

export default Source;
