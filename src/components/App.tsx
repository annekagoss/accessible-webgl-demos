import './fonts.scss';

import * as React from 'react';

import Footer from './Footer/Footer';
import Header from './Header/Header';
import Loader from './Loader/Loader';
import MovingText from './MovingText/MovingText';
import PixelCarousel from './PixelCarousel/PixelCarousel';
import cx from 'classnames';
import { glSupported } from '../utils/general';
import styles from './app.module.scss';

const App = () => {
	const [activePageIndex, setActivePageIndex] = React.useState<number>(1);
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
			}}>
			{isLoaded && (
				<>
					{/* <Header />
					<Nav activePageIndex={activePageIndex} setActivePageIndex={setActivePageIndex} /> */}
					<Pages activePageIndex={activePageIndex} />
					{/* <Footer /> */}
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

const Nav = ({ activePageIndex, setActivePageIndex }: NavProps) => (
	<nav className={styles.navigation}>
		<ul>
			<div
				className={cx(styles.navItem, activePageIndex === 0 && styles.active)}
				onClick={() => {
					setActivePageIndex(0);
				}}>
				Moving Text
			</div>
		</ul>
	</nav>
);

interface PagesProps {
	activePageIndex: number;
}

const Pages = ({ activePageIndex }: PagesProps) => (
	<>
		{activePageIndex === 0 && <MovingText />}
		{activePageIndex === 1 && <PixelCarousel />}
	</>
);

export default App;
