import './fonts.scss';

import * as React from 'react';

import Footer from './Footer/Footer';
import Header from './Header/Header';
import Loader from './Loader/Loader';
import Background from './Background/Background';
import RasterizedForm from './RasterizedForm/RasterizedForm';
import cx from 'classnames';
import {glSupported} from '../utils/general';
import styles from './app.module.scss';

const App = () => {
	const [activePageIndex, setActivePageIndex] = React.useState<number>(0);
	const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
	if (!glSupported()) return <div>'WebGL is not supported on this device.'</div>;

	React.useEffect(() => {
		setTimeout(() => {
			setIsLoaded(true);
		}, 0);
	}, []);

	return (
		<div
			className={styles.app}
			onScroll={() => {
				console.log('app');
			}}
		>
			{isLoaded && (
				<>
					<Header />
					<Nav
						activePageIndex={activePageIndex}
						setActivePageIndex={setActivePageIndex}
					/>
					<Pages activePageIndex={activePageIndex} />
					<Footer />
				</>
			)}
			{!isLoaded && <Loader />}
		</div>
	);
};

interface NavProps {
	activePageIndex: number;
	setActivePageIndex: (index: number) => void;
}

const Nav = ({activePageIndex, setActivePageIndex}: NavProps) => (
	<nav className={styles.navigation}>
		<ul>
			<div
				className={cx(styles.navItem, activePageIndex === 0 && styles.active)}
				onClick={() => {
					setActivePageIndex(0);
				}}
			>
				Auto-Enforced Contrast Ratio
			</div>
			<div
				className={cx(styles.navItem, activePageIndex === 1 && styles.active)}
				onClick={() => {
					setActivePageIndex(1);
				}}
			>
				Rasterized Form
			</div>
		</ul>
	</nav>
);

interface PagesProps {
	activePageIndex: number;
}

const Pages = ({activePageIndex}: PagesProps) => (
	<>
		{activePageIndex === 0 && <Background />}
		{activePageIndex === 1 && <RasterizedForm />}
	</>
);

export default App;
