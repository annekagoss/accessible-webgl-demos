import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, RGBA } from '../../../types';
import { parseColorFromString, luminanceFromRGBA } from '../../utils/color';
import styles from './DOMRasterizationCanvas.module.scss';

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
		const buttonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
		const textColor: string = isCursorCopy ? 'transparent' : contrastColor;
		const buttonBorder: string = isCursorCopy ? 'solid 1px transparent' : `solid 1px ${contrastColor}`;
		const contrastColorOpposite: string = contrastColor === 'white' ? 'black' : 'white';
		const hoverButtonColor: string = isCursorCopy ? 'transparent' : contrastColorOpposite;
		const buttonColor: string = buttonActive ? hoverButtonColor : textColor;
		const buttonBackground: string = buttonActive ? textColor : 'transparent';
		const inputBorder: string = inputFocused ? `solid 1px ${textColor}` : 'solid 1px transparent';

		return (
			<div
				className={cx(styles.canvasForeground, styles.sourceElement, isCursorCopy && styles.cursorCopy)}
				ref={ref}
				style={{
					position: 'absolute',
					right: 0,
					left: 0,
					bottom: 0,
					top: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					margin: 0,
					padding: 0,
				}}>
				<div
					style={{
						padding: 0,
						margin: 0,
					}}>
					<form
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
						}}>
						<label
							htmlFor={'color-field'}
							style={{
								marginBottom: 80,
								fontSize: 40,
								color: textColor,
								lineHeight: 1,
								fontFamily: 'Roboto, sans-serif',
								fontWeight: 'bold',
								letterSpacing: 1,
							}}>
							type a color
						</label>
						<input
							type='text'
							id='color-field'
							style={{
								width: 200,
								backgroundColor: 'transparent',
								borderTop: inputBorder,
								borderRight: inputBorder,
								borderBottom: buttonBorder,
								borderLeft: inputBorder,
								color: textColor,
								caretColor: 'transparent',
								fontSize: 40,
								minWidth: 500,
								padding: '8px 20px',
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								marginBottom: 40,
								letterSpacing: 1,
							}}
							value={text}
							onChange={(e) => {
								if (!isCursorCopy) return;
								setText && setText(e.target.value);
							}}
							onFocus={() => setInputFocused && setInputFocused(true)}
							onBlur={() => setInputFocused && setInputFocused(false)}
						/>
						<button
							ref={buttonRef}
							style={{
								background: buttonBackground,
								border: buttonBorder,
								color: buttonColor,
								fontSize: 28,
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								padding: '10px 20px',
								letterSpacing: 1,
							}}
							type='button'
							onClick={() => setText && setText('')}
							onMouseEnter={() => setButtonActive && setButtonActive(true)}
							onMouseLeave={() => setButtonActive && setButtonActive(false)}>
							{' '}
							clear
						</button>
					</form>
				</div>
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

	React.useEffect(() => {
		const color: RGBA = parseColorFromString(text);
		if (Boolean(color)) {
			uniforms.current.uColor.value = color;
			const luminance: number = luminanceFromRGBA(color, { r: 1, g: 1, b: 1 });
			const contrastColor: string = luminance > 0.5 ? 'black' : 'white';
			setContrastColor(contrastColor);
		}
	}, [text]);
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
