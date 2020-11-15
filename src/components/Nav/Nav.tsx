import React, {useContext} from 'react';
import cx from 'classnames';
import {PageContext} from '../App';

import styles from './Nav.module.scss';

const Nav = () => {
	const [page, setPage] = useContext(PageContext);

	return (
		<ul className={styles.navigation}>
			<li>
				<a
					className={cx(styles.navItem, page === 0 && styles.active)}
					onClick={() => {
						setPage(0);
					}}
					href='#'
				>
					Auto-Enforced Contrast Ratio
				</a>
			</li>
			<li>
				<a
					className={cx(styles.navItem, page === 1 && styles.active)}
					onClick={() => {
						setPage(1);
					}}
					href='#'
				>
					Rasterized Form
				</a>
			</li>
		</ul>
	);
};

export default Nav;
