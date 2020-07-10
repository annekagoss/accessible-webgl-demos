import * as React from 'react';
import styles from './footer.module.scss';

const Footer = () => (
	<div className={styles.footer}>
		<div className={styles.name}>Anneka Goss</div>
		<div className={styles.links}>
			<a
				href='https://github.com/annekagoss/shader-demos'
				alt='GitHub repo'
			>
				code
			</a>
			<a href='https://twitter.com/anneka_gss' alt='Twitter'>
				twitter
			</a>
		</div>
	</div>
);

export default Footer;
