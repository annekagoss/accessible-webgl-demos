import * as React from 'react';
import cx from 'classnames';
import {UniformSettings, RGBA} from '../../../types';
import {parseColorFromString, luminanceFromRGBA} from '../../utils/color';
import styles from './RasterizedForm.module.scss';

interface SourceElementProps {
	isCursorCopy?: boolean;
	text: string;
	setText?: (val: string) => void;
	buttonActive: boolean;
	setButtonActive?: (val: boolean) => void;
	inputFocused: boolean;
	setInputFocused?: (val: boolean) => void;
	contrastColor: string;
	windowWidth: number;
}

interface SourceProps {
	uniforms: React.MutableRefObject<UniformSettings>;
}

const SourceElement = React.forwardRef(
	(
		{
			buttonActive,
			setButtonActive,
			inputFocused,
			setInputFocused,
			text,
			setText,
			contrastColor,
			isCursorCopy = false,
			windowWidth,
		}: SourceElementProps,
		ref: React.RefObject<HTMLDivElement>
	) => {
		const buttonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
		const textColor: string = isCursorCopy ? 'transparent' : contrastColor;
		const buttonBorder: string = isCursorCopy
			? 'solid 8px transparent'
			: `solid 8px ${contrastColor}`;
		const contrastColorOpposite: string = contrastColor === 'white' ? 'black' : 'white';
		const hoverButtonColor: string = isCursorCopy ? 'transparent' : contrastColorOpposite;
		const buttonColor: string = buttonActive ? hoverButtonColor : textColor;
		const buttonBackground: string = buttonActive ? textColor : 'transparent';
		const inputBorder: string = inputFocused
			? `solid 8px ${textColor}`
			: 'solid 8px transparent';
		const pointerEvents = isCursorCopy ? 'all' : 'none';
		const fontSize = windowWidth < 975 ? 30 : 50;
		const horizontalBorder = windowWidth < 975 ? 60 : '17%';
		const verticalBorder = windowWidth < 975 ? 60 : '5%';
		const inputWidth = windowWidth < 975 ? 'auto' : 500;
		const titleSize = windowWidth < 975 ? 50 : 90;
		const padding = windowWidth < 975 ? '18%' : 0;

		return (
			<div
				className={cx(
					styles.canvasForeground,
					styles.sourceElement,
					isCursorCopy && styles.cursorCopy
				)}
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
					pointerEvents,
				}}
			>
				<div
					style={{
						padding,
						margin: 0,
						position: 'absolute',
						top: verticalBorder,
						bottom: verticalBorder,
						left: horizontalBorder,
						right: horizontalBorder,
						border: buttonBorder,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<form
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							maxWidth: '100%',
						}}
					>
						<label
							htmlFor={'color-field'}
							style={{
								marginBottom: 60,
								fontSize: titleSize,
								color: textColor,
								lineHeight: 1,
								fontFamily: 'Roboto, sans-serif',
								fontWeight: 'bold',
								letterSpacing: 1,
							}}
						>
							Type a color
						</label>
						<input
							type='text'
							aria-label='Type a color'
							name='color-field'
							id='color-field'
							spellCheck='false'
							style={{
								width: windowWidth < 975 ? '100%' : 'auto',
								minWidth: inputWidth,
								backgroundColor: 'transparent',
								borderTop: inputBorder,
								borderRight: inputBorder,
								borderBottom: buttonBorder,
								borderLeft: inputBorder,
								color: textColor,
								caretColor: 'transparent',
								fontSize: fontSize,
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
							onFocus={() => {
								setInputFocused && setInputFocused(true);
							}}
							onBlur={() => {
								setInputFocused && setInputFocused(false);
							}}
						/>
						<button
							ref={buttonRef}
							style={{
								background: buttonBackground,
								border: buttonBorder,
								color: buttonColor,
								fontSize: fontSize,
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								padding: '30px 40px',
								letterSpacing: 1,
							}}
							type='button'
							onClick={() => setText && setText('')}
							onMouseEnter={() => setButtonActive && setButtonActive(true)}
							onMouseLeave={() => setButtonActive && setButtonActive(false)}
						>
							Clear Color
						</button>
					</form>
				</div>
			</div>
		);
	}
);

const Source = React.forwardRef(({uniforms}: SourceProps, ref) => {
	const {sourceRef, cursorRef}: Record<string, React.RefObject<HTMLDivElement>> = ref;
	const [text, setText] = React.useState<string>('DarkGray');
	const [contrastColor, setContrastColor] = React.useState<string>('black');
	const [buttonActive, setButtonActive] = React.useState<boolean>(false);
	const [inputFocused, setInputFocused] = React.useState<boolean>(false);
	const [windowWidth, setWindowWidth] = React.useState<number>(1440);

	React.useEffect(() => {
		const color: RGBA = parseColorFromString(text);
		if (Boolean(color)) {
			uniforms.current.uColor.value = color;
			const luminance: number = luminanceFromRGBA(color, {r: 1, g: 1, b: 1});
			const contrastColor: string = luminance > 0.5 ? 'black' : 'white';
			setContrastColor(contrastColor);
		}
	}, [text]);

	React.useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	return (
		<>
			<SourceElement
				ref={sourceRef}
				text={text}
				buttonActive={buttonActive}
				inputFocused={inputFocused}
				contrastColor={contrastColor}
				windowWidth={windowWidth}
			/>
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
				windowWidth={windowWidth}
			/>
		</>
	);
});

export default Source;
