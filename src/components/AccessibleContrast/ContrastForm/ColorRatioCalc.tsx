import React, {useState, useEffect} from 'react';
import {cssColor, HSLToRGB, RGBToHSL} from '../../../utils/color';

import styles from './ColorRatioCalc.module.scss';
import {RGB} from './Colors';
import {COMPLIANCE_LEVEL} from './ComplianceLevel';

interface Props {
	foregroundColor: RGB;
	backgroundColor: RGB;
	complianceLevel: COMPLIANCE_LEVEL;
}

const minComplianceRatio = {
	[COMPLIANCE_LEVEL.AA]: 4.5,
	[COMPLIANCE_LEVEL.AAA]: 7,
};

const luminance = ({r, g, b}: RGB) => r * 0.2126 + g * 0.7152 + b * 0.0722;

const contrastRatio = (bgLum: number, fgLum: number): number => {
	const l1 = bgLum + 0.05;
	const l2 = fgLum + 0.05;
	const ratio = l1 / l2;
	if (l2 > l1) return 1 / ratio;
	return ratio;
};

const checkContrast = (bg: number, fg: number, targetRatio: number) => {
	const ratio = contrastRatio(bg, fg);
	return Math.abs(ratio) >= targetRatio;
};

const shift = (bg: RGB, fg: RGB, ratio: number, targetRatio: number): RGB => {
	const bghsl = RGBToHSL(bg);
	const fghsl = RGBToHSL(fg);
	const up = bghsl.l > fghsl.l;

	while (
		!checkContrast(bghsl.l / 100, fghsl.l / 100, targetRatio) &&
		bghsl.l <= 100 &&
		bghsl.l >= 0
	) {
		if (up) {
			bghsl.l += 1;
		} else {
			bghsl.l -= 1;
		}
	}

	return HSLToRGB(bghsl);
};

const makeColorAccessible = (bg: RGB, fg: RGB, complianceLevel: COMPLIANCE_LEVEL): RGB => {
	if (complianceLevel === COMPLIANCE_LEVEL.NONE) return bg;
	const bgLuminance = luminance(bg);
	const fgLuminance = luminance(fg);
	const ratio = contrastRatio(bgLuminance, fgLuminance);
	const targetRatio = minComplianceRatio[complianceLevel];
	if (ratio >= targetRatio) return bg;
	return shift(bg, fg, ratio, targetRatio);
};

const ColorRatioCalc = ({foregroundColor, backgroundColor, complianceLevel}: Props) => {
	const [accessibleBackgroundColor, setAccessibleBackgroundColor] = useState<RGB>(
		makeColorAccessible(backgroundColor, foregroundColor, complianceLevel)
	);

	useEffect(() => {
		setAccessibleBackgroundColor(
			makeColorAccessible(backgroundColor, foregroundColor, complianceLevel)
		);
	}, [backgroundColor, foregroundColor, complianceLevel]);

	return (
		<div className={styles.container}>
			<div className={styles.background} style={{backgroundColor: cssColor(backgroundColor)}}>
				<div
					className={styles.accessibleBackground}
					style={{backgroundColor: cssColor(accessibleBackgroundColor)}}
				/>
				<div className={styles.text} style={{color: cssColor(foregroundColor)}}>
					Test
				</div>
			</div>
		</div>
	);
};

export default ColorRatioCalc;
