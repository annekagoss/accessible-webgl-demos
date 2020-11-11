import {HSL} from '../../../../types';
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

const contrastRatio = (bgLum: number, fgLum: number): number => {
	const l1 = bgLum + 0.05;
	const l2 = fgLum + 0.05;
	const ratio = l1 / l2;
	if (l2 > l1) return 1 / ratio;
	return ratio;
};

const newLuminance = (fg: number, target: number, up: boolean): number => {
	if (up) {
		const val = target * (fg + 0.05);
		return val - 0.05;
	}
	return (fg + 0.05 - target * 0.05) / target;
};

const lightenBackground = (fgl: number, bgl: number) => {
	if (fgl === bgl) return bgl < 50;
	return bgl > fgl;
};

const shift = (bghsl: HSL, fgl: number, targetRatio: number): RGB => {
	const up = lightenBackground(fgl, bghsl.l);

	bghsl.l = newLuminance(fgl / 100, targetRatio, up) * 100;

	return HSLToRGB(bghsl);
};

const makeColorAccessible = (bg: RGB, fg: RGB, complianceLevel: COMPLIANCE_LEVEL): RGB => {
	if (complianceLevel === COMPLIANCE_LEVEL.NONE) return bg;
	const bghsl = RGBToHSL(bg);
	const fghsl = RGBToHSL(fg);
	const ratio = contrastRatio(bghsl.l, fghsl.l);
	const targetRatio = minComplianceRatio[complianceLevel];
	if (ratio >= targetRatio) return bg;
	return shift(bghsl, fghsl.l, targetRatio);
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
