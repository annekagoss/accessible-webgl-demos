import React, {useState, useEffect} from 'react';
import cx from 'classnames';

import InvertTextSwitch from './InvertTextSwitch';
import ComplianceLevel, {COMPLIANCE_LEVEL} from './ComplianceLevel';
import Colors, {RGB} from './Colors';

import styles from './ContrastForm.module.scss';
import ColorRatioCalc from './ColorRatioCalc';
import {normalizeRGB} from '../../../utils/color';

interface Props {
	updateUniform: (name: string, value: any) => void;
}

const mapComplianceLevelToInt = {
	[COMPLIANCE_LEVEL.NONE]: 0,
	[COMPLIANCE_LEVEL.AA]: 1,
	[COMPLIANCE_LEVEL.AAA]: 2,
};

const ControlForm = ({updateUniform}: Props) => {
	const [complianceLevel, setComplianceLevel] = useState<COMPLIANCE_LEVEL>(COMPLIANCE_LEVEL.AAA);
	const [invertedText, setInvertedText] = useState<boolean>(false);
	const [color1, setColor1] = useState<RGB>({r: 255, g: 162, b: 0});
	const [color2, setColor2] = useState<RGB>({r: 255, g: 0, b: 0});
	const [color3, setColor3] = useState<RGB>({r: 0, g: 0, b: 255});

	useEffect(() => {
		if (invertedText) {
			document.querySelector('#root').classList.add('inverted');
		} else {
			document.querySelector('#root').classList.remove('inverted');
		}
		updateUniform('uTextColor', invertedText ? {x: 1, y: 1, z: 1} : {x: 0, y: 0, z: 0});
	}, [invertedText]);
	useEffect(() => {
		updateUniform('uComplianceLevel', mapComplianceLevelToInt[complianceLevel]);
	}, [complianceLevel]);
	useEffect(() => {
		updateUniform('uColor1', normalizeRGB(color1));
	}, [color1]);
	useEffect(() => {
		updateUniform('uColor2', normalizeRGB(color2));
	}, [color2]);
	useEffect(() => {
		updateUniform('uColor3', normalizeRGB(color3));
	}, [color3]);

	return (
		<div className={cx(styles.container, invertedText && styles.inverted)}>
			<ComplianceLevel
				complianceLevel={complianceLevel}
				setComplianceLevel={setComplianceLevel}
				invertedText={invertedText}
			/>
			<InvertTextSwitch invertedText={invertedText} setInvertedText={setInvertedText} />
			<Colors
				color1={color1}
				setColor1={setColor1}
				color2={color2}
				setColor2={setColor2}
				color3={color3}
				setColor3={setColor3}
			/>
			{/* <ColorRatioCalc
				foregroundColor={invertedText ? {r: 255, g: 255, b: 255} : {r: 0, g: 0, b: 0}}
				backgroundColor={color1}
				complianceLevel={complianceLevel}
			/> */}
		</div>
	);
};

export default ControlForm;
