import { useEffect } from 'react';
import { Interaction, Vector2 } from '../../types';
import { throttle } from './helpers';

export const useDrag = (interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	useEffect(() => {
		if (!Boolean('ontouchstart' in window) || !Boolean(canvasRef.current)) return;
		interactionRef.current.drag.enabled = true;
		const touchStartHandler = (e: TouchEvent) => handleTouchStart(e, interactionRef, canvasRef);
		const touchMoveHandler = throttle(30, (e: TouchEvent) => handleTouchMove(e, interactionRef, canvasRef));
		const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e, interactionRef, canvasRef);
		canvasRef.current.addEventListener('touchstart', touchStartHandler);
		canvasRef.current.addEventListener('touchmove', touchMoveHandler);
		canvasRef.current.addEventListener('touchend', touchEndHandler);
		return () => {
			canvasRef.current.removeEventListener('touchstart', touchStartHandler);
			canvasRef.current.removeEventListener('touchmove', touchMoveHandler);
			canvasRef.current.removeEventListener('touchend', touchEndHandler);
		};
	}, []);
};

const handleTouchStart = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	interactionRef.current.drag.isDragging = true;
};

const handleTouchMove = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const { clientX: x, clientY: y } = e.touches[0];
	const newPosition: Vector2 = normalizePosition(x, y, canvasRef);
	interactionRef.current.drag.dragVelocity = {
		x: interactionRef.current.drag.position.x - newPosition.x,
		y: interactionRef.current.drag.position.y - newPosition.y
	};
};

const handleTouchEnd = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	interactionRef.current.drag.isDragging = false;
};

// Map coordinates from -1 to 1
const normalizePosition = (x, y, canvasRef): Vector2 => {
	const { left, top, width, height } = canvasRef.current.getBoundingClientRect();
	return {
		x: ((x - left) / width) * 2 - 1,
		y: ((y - top) / height) * 2 - 1
	};
};
