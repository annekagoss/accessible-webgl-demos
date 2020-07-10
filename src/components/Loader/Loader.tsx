import * as React from 'react';
import styles from './loader.module.scss';

const Loader = () => (
	<div className={styles.loaderOverlay}>
		<div className={styles.loader} />
	</div>
);

export default Loader;
