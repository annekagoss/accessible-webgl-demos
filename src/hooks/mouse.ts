import { Vector2 } from '../../types';
import { useEffect } from 'react';
import { throttle } from './helpers';

export const useMouse = (
	mousePosRef: React.MutableRefObject<Vector2>,
	canvasRef: React.RefObject<HTMLCanvasElement>
) => {
	useEffect(() => {
		const mouseMoveHandler = throttle(20, (e: MouseEvent) =>
			handleMouseMove(e, mousePosRef, canvasRef)
		);
		const touchMoveHandler = throttle(20, (e: TouchEvent) =>
			handleTouchMove(e, mousePosRef, canvasRef)
		);
		canvasRef.current.addEventListener('mousemove', mouseMoveHandler);
		canvasRef.current.addEventListener('touchmove', touchMoveHandler);
		return () => {
			canvasRef.current.removeEventListener(
				'mousemove',
				mouseMoveHandler
			);
			canvasRef.current.removeEventListener(
				'touchmove',
				touchMoveHandler
			);
		};
	}, []);
};

const handleMouseMove = (
	e: MouseEvent,
	mousePosRef: React.MutableRefObject<Vector2>,
	canvasRef: React.RefObject<HTMLCanvasElement>
) => {
	const { left, top } = canvasRef.current.getBoundingClientRect();
	mousePosRef.current = {
		x: (e.clientX - left) * window.devicePixelRatio,
		y: (e.clientY - top) * -window.devicePixelRatio
	};
};

const handleTouchMove = (
	e: TouchEvent,
	mousePosRef: React.MutableRefObject<Vector2>,
	canvasRef: React.RefObject<HTMLCanvasElement>
) => {
	const { clientX: x, clientY: y } = e.touches[0];
	const { left, top } = canvasRef.current.getBoundingClientRect();
	mousePosRef.current = {
		x: (x - left) * window.devicePixelRatio,
		y: (y - top) * -window.devicePixelRatio
	};
};
