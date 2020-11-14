import * as React from 'react';
import styles from './footer.module.scss';

const Footer = () => (
	<div className={styles.footer}>
		<div className={styles.name}>Anneka Goss</div>
		<div className={styles.links}>
			<a href='https://github.com/annekagoss' alt='GitHub repo'>
				Code
			</a>
			<a href='https://twitter.com/anneka_gss' alt='Twitter'>
				Twitter
			</a>
		</div>
	</div>
);

export default Footer;
