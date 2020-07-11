import { Vector2 } from '../../types';
import { throttle } from './helpers';
import { useEffect } from 'react';

export const useScrollPosition = (callback: (position: Vector2) => void, targetElementRef: React.RefObject<HTMLElement>) => {
	const scrollHandler = throttle(20, () => handleScroll(callback, targetElementRef));
	useEffect(() => {
		window.addEventListener('scroll', scrollHandler);
		return () => {
			window.removeEventListener('scroll', scrollHandler);
		};
	}, []);
};

const handleScroll = (callback: (position: Vector2) => void, targetElementRef: React.RefObject<HTMLElement>) => {
	if (!targetElementRef.current) return;
	const { x, y, width, height } = targetElementRef.current.getBoundingClientRect();
	callback({ x: x / width, y: y / height });
};
