import * as React from 'react';
import styles from './Header.module.scss';
import githubIcon from '../../assets/icons/github.svg';
import Nav from '../Nav/Nav';

const Header = () => (
	<div className={styles.header}>
		<Nav />

		<a
			className={styles.icon}
			href='https://github.com/annekagoss/accessible-shader-demos'
			title='GitHub repo'
		>
			<img src={githubIcon} alt='GitHub repo' />
		</a>
	</div>
);

export default Header;
