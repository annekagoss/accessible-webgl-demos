import { Vector2 } from '../../types';
import { throttle } from './helpers';
import { useEffect } from 'react';

export const useMouse = (mousePosRef: React.MutableRefObject<Vector2>, targetRef?: React.RefObject<HTMLElement>, ignoreOffset?: boolean) => {
	useEffect(() => {
		const mouseMoveHandler = throttle(20, (e: MouseEvent) => handleMouseMove(e, mousePosRef, targetRef));
		const touchMoveHandler = throttle(20, (e: TouchEvent) => handleTouchMove(e, mousePosRef, targetRef));

		if (targetRef && targetRef.current) {
			targetRef.current.addEventListener('mousemove', mouseMoveHandler);
			targetRef.current.addEventListener('touchmove', touchMoveHandler);
		} else {
			window.addEventListener('mousemove', mouseMoveHandler);
			window.addEventListener('touchmove', touchMoveHandler);
		}

		return () => {
			if (targetRef && targetRef.current) {
				targetRef.current.removeEventListener('mousemove', mouseMoveHandler);
				targetRef.current.removeEventListener('touchmove', touchMoveHandler);
			} else {
				window.removeEventListener('mousemove', mouseMoveHandler);
				window.removeEventListener('touchmove', touchMoveHandler);
			}
		};
	}, []);
};

const handleMouseMove = (e: MouseEvent, mousePosRef: React.MutableRefObject<Vector2>, targetRef: React.RefObject<HTMLElement>, ignoreOffset?: boolean) => {
	const { left, top } = Boolean(ignoreOffset) ? targetRef.current.getBoundingClientRect() : { left: 0, top: 0 };
	mousePosRef.current = {
		x: (e.clientX - left) * window.devicePixelRatio,
		y: (e.clientY - top) * -window.devicePixelRatio,
	};
};

const handleTouchMove = (e: TouchEvent, mousePosRef: React.MutableRefObject<Vector2>, targetRef: React.RefObject<HTMLElement>) => {
	const { clientX: x, clientY: y } = e.touches[0];
	const { left, top } = targetRef.current.getBoundingClientRect();
	mousePosRef.current = {
		x: (x - left) * window.devicePixelRatio,
		y: (y - top) * -window.devicePixelRatio,
	};
};
