import {FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from '@material-ui/core';
import React from 'react';

import styles from './ContrastForm.module.scss';

export enum COMPLIANCE_LEVEL {
	NONE = 'NONE',
	A = 'A',
	AA = 'AA',
	AAA = 'AAA',
}

interface Props {
	complianceLevel: COMPLIANCE_LEVEL;
	setComplianceLevel: (level: COMPLIANCE_LEVEL) => void;
	invertedText: boolean;
}

const ComplianceLevel = ({complianceLevel, setComplianceLevel}: Props) => {
	return (
		<FormControl component='fieldset'>
			<FormLabel
				classes={{
					root: styles.label,
					focused: styles.focused,
				}}
			>
				Contrast Requirement
			</FormLabel>
			<RadioGroup
				aria-label='text color'
				name='text-color'
				value={complianceLevel}
				onChange={(_: React.ChangeEvent<HTMLInputElement>, value: string) => {
					setComplianceLevel(COMPLIANCE_LEVEL[value]);
				}}
				classes={{
					root: styles.radioGroup,
				}}
			>
				<FormControlLabel
					value={COMPLIANCE_LEVEL.NONE}
					control={
						<Radio
							classes={{
								root: styles.radio,
								colorSecondary: styles.radio,
								checked: styles.radio,
							}}
						/>
					}
					classes={{
						root: styles.radioControl,
						label: styles.label,
					}}
					label={COMPLIANCE_LEVEL.NONE}
				/>
				<FormControlLabel
					value={COMPLIANCE_LEVEL.AA}
					control={
						<Radio
							classes={{
								root: styles.radio,
								colorSecondary: styles.radio,
								checked: styles.radio,
							}}
						/>
					}
					classes={{
						root: styles.radioControl,
						label: styles.label,
					}}
					label={COMPLIANCE_LEVEL.AA}
				/>
				<FormControlLabel
					value={COMPLIANCE_LEVEL.AAA}
					control={
						<Radio
							classes={{
								root: styles.radio,
								colorSecondary: styles.radio,
								checked: styles.radio,
							}}
						/>
					}
					classes={{
						root: styles.radioControl,
						label: styles.label,
					}}
					label={COMPLIANCE_LEVEL.AAA}
				/>
			</RadioGroup>
		</FormControl>
	);
};

export default ComplianceLevel;
