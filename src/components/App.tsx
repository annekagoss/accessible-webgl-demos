import './fonts.scss';

import React, {createContext, useContext, useState, useEffect} from 'react';

import Footer from './Footer/Footer';
import Header from './Header/Header';
import Loader from './Loader/Loader';
import Contrast from './Contrast/Contrast';
import RasterizedForm from './RasterizedForm/RasterizedForm';
import {glSupported} from '../utils/general';
import styles from './app.module.scss';

export const PageContext = createContext([]);
export const MotionContext = createContext([]);

const App = () => {
	const [page, setPage] = useState<number>(0);
	const [motion, setMotion] = useState<boolean>(true);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	if (!glSupported()) return <div>'WebGL is not supported on this device.'</div>;

	useEffect(() => {
		setTimeout(() => {
			setIsLoaded(true);
			const allowMotion: boolean = window.matchMedia(
				'(prefers-reduced-motion: no-preference)'
			).matches;
			setMotion(allowMotion);
		}, 0);
	}, []);

	return (
		<PageContext.Provider value={[page, setPage]}>
			<MotionContext.Provider value={[motion, setMotion]}>
				<div
					className={styles.app}
					onScroll={() => {
						console.log('app');
					}}
				>
					{isLoaded && (
						<>
							<Header />
							<Pages />
							<Footer />
						</>
					)}
					{!isLoaded && <Loader />}
				</div>
			</MotionContext.Provider>
		</PageContext.Provider>
	);
};

const Pages = () => {
	const [page] = useContext(PageContext);
	return (
		<>
			{page === 0 && <Contrast />}
			{page === 1 && <RasterizedForm />}
		</>
	);
};

export default App;
