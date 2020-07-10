import { useRef, useEffect } from 'react';
import { MAX_IDLE_TIME } from '../../lib/gl/settings';

interface UsePauseWhileOffScreenProps {
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	idleRef: React.MutableRefObject<boolean>;
	idleTimerRef: React.MutableRefObject<number>;
	requestRef: React.MutableRefObject<number>;
	animate: (timer: number) => void;
}

export const useAnimationFrame = (
	canvasRef: React.MutableRefObject<HTMLCanvasElement>,
	callback: (time: number, pingPing: number) => void
) => {
	const allowMotion: boolean = window.matchMedia(
		'(prefers-reduced-motion: no-preference)'
	).matches;

	if (!allowMotion) {
		useEffect(() => {
			console.log('callback attempt');
			setTimeout(() => {
				callback(0, 0);
			}, 1000);
		}, []);
		return;
	}

	const requestRef: React.MutableRefObject<number> = useRef<number>(0);
	const previousTimeRef: React.MutableRefObject<number> = useRef<number>(0);
	const pingPongRef: React.MutableRefObject<number> = useRef<number>(0);
	const idleRef: React.MutableRefObject<boolean> = useRef<boolean>(false);
	const idleTimerRef: React.MutableRefObject<number> = useRef<number>(0);

	const animate = (time) => {
		// Keep animation paused while idle
		if (idleRef.current) return;

		// Pause animation while idle
		if (idleTimerRef.current > MAX_IDLE_TIME) {
			cancelAnimationFrame(requestRef.current);
			idleRef.current = true;
			return;
		}

		// Run animation loop
		idleTimerRef.current++;
		if (previousTimeRef.current !== undefined)
			callback(time, pingPongRef.current);
		previousTimeRef.current = time;
		pingPongRef.current = pingPongRef.current = Math.abs(
			pingPongRef.current - 1
		);
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, []);

	usePauseWhileOffScreen({
		canvasRef,
		idleRef,
		idleTimerRef,
		requestRef,
		animate,
	});
};

const usePauseWhileOffScreen = (props: UsePauseWhileOffScreenProps) => {
	const scrollHandler = () => handleScroll(props);
	const mouseMoveHandler = () => resetIdleTimer(props);

	useEffect(() => {
		window.addEventListener('scroll', scrollHandler);
		window.addEventListener('mousemove', mouseMoveHandler);
		window.addEventListener('touchmove', mouseMoveHandler);
		window.addEventListener('keyup', mouseMoveHandler);
		return () => {
			window.removeEventListener('scroll', scrollHandler);
			window.removeEventListener('mousemove', mouseMoveHandler);
			window.removeEventListener('touchmove', mouseMoveHandler);
			window.removeEventListener('keyup', mouseMoveHandler);
		};
	}, []);
};

const handleScroll = ({
	canvasRef,
	idleRef,
	idleTimerRef,
	requestRef,
	animate,
}: UsePauseWhileOffScreenProps) => {
	if (!canvasRef.current) return;
	const { y, height } = canvasRef.current.getBoundingClientRect() as DOMRect;
	const topAboveBottom: boolean = y < window.innerHeight;
	const bottomBelowTop: boolean = y + height > 0;
	const inView: boolean = topAboveBottom && bottomBelowTop;

	if (!inView && !idleRef.current) {
		// Stop animation
		cancelAnimationFrame(requestRef.current);
		idleRef.current = true;
	} else if (inView && idleRef.current) {
		// Reset idle timer and resart animation
		idleTimerRef.current = 0;
		requestRef.current = requestAnimationFrame(animate);
		idleRef.current = false;
	}
};

const resetIdleTimer = ({
	idleRef,
	idleTimerRef,
	requestRef,
	animate,
}: UsePauseWhileOffScreenProps) => {
	if (!idleRef.current) return;
	idleTimerRef.current = 0;
	requestRef.current = requestAnimationFrame(animate);
	idleRef.current = false;
};
