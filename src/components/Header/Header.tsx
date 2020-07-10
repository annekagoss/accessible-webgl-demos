import * as React from 'react';
import styles from './header.module.scss';
import githubIcon from '../../assets/icons/github.svg';

const Header = () => (
	<div className={styles.header}>
		<a href='https://github.com/annekagoss/shader-demos' alt='GitHub repo'>
			<img src={githubIcon} />
		</a>
	</div>
);

export default Header;
