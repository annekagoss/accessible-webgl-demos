import React, {useState} from 'react';
import cx from 'classnames';

import InvertTextSwitch from './InvertTextSwitch';
import ComplianceLevel, {COMPLIANCE_LEVEL} from './ComplianceLevel';
import Colors, {Color} from './Colors';

import styles from './ContrastForm.module.scss';

const ControlForm = () => {
	const [complianceLevel, setComplianceLevel] = useState<COMPLIANCE_LEVEL>(COMPLIANCE_LEVEL.NONE);
	const [invertedText, setInvertedText] = useState<boolean>(false);
	const [color1, setColor1] = useState<Color>({r: 255, g: 162, b: 0});
	const [color2, setColor2] = useState<Color>({r: 255, g: 0, b: 0});
	const [color3, setColor3] = useState<Color>({r: 0, g: 0, b: 255});

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
		</div>
	);
};

export default ControlForm;
