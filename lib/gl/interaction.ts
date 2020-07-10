import {
	Interaction,
	Vector3,
	Vector2,
	Matrix,
	GyroscopeData,
	DragData
} from '../../types';

import {
	interpolateVectors,
	clamp,
	addVectors,
	degreesToRadians
} from './math';
import { invertMatrix, applyMatrixToVector3, lookAt } from './matrix';

interface InteractionSettings {
	gyroFriction: number;
	dragSpeed: number;
	dragFriction: number;
}

const INTERACTION_SETTINGS: InteractionSettings = {
	gyroFriction: 0.001,
	dragSpeed: 3,
	dragFriction: 0.0001
};

export const getInitialInteraction = (
	rotationFromUniforms: Vector3
): Interaction => {
	const initialRotation = {
		x: degreesToRadians(rotationFromUniforms.x),
		y: degreesToRadians(rotationFromUniforms.y),
		z: degreesToRadians(rotationFromUniforms.z)
	};
	return {
		gyroscope: {
			beta: 0,
			alpha: 0,
			enabled: false,
			decelerateTimer: 1,
			accelerateTimer: 0,
			velocity: { x: 0, y: 0, z: 0 }
		},
		drag: {
			enabled: false,
			decelerateTimer: 1,
			accelerateTimer: 0,
			position: { x: 0, y: 0 },
			velocity: { x: 0, y: 0, z: 0 },
			dragVelocity: { x: 0, y: 0 },
			isDragging: false
		},
		rotation: initialRotation,
		initialRotation
	};
};

export const updateInteraction = (interaction: Interaction): Interaction => {
	const { drag, gyroscope, initialRotation, rotation } = interaction;

	const newDrag: DragData = drag;
	const newGyroscope: GyroscopeData = gyroscope;
	let newRotation: Vector3 = initialRotation;

	if (newGyroscope.enabled) {
		newGyroscope.velocity = updateGyroVelocity(gyroscope);
		newGyroscope.accelerateTimer = updateGyroTimer(
			gyroscope.accelerateTimer
		);
		newGyroscope.decelerateTimer = updateGyroTimer(
			gyroscope.decelerateTimer
		);
		newRotation = applyGyro(newGyroscope, initialRotation);
	}
	if (newDrag.enabled) {
		newDrag.velocity = updateDragVelocity(drag);
		newDrag.accelerateTimer = updateDragTimer(drag.accelerateTimer);
		newDrag.decelerateTimer = updateDragTimer(drag.decelerateTimer);
		const sourceRotation: Vector3 = newGyroscope.enabled
			? newRotation
			: initialRotation;
		newRotation = applyDrag(newDrag, sourceRotation);
	}

	return {
		...interaction,
		drag: newDrag,
		gyroscope: newGyroscope,
		rotation: newRotation
	};
};

const applyDrag = (drag: DragData, rotation: Vector3) => ({
	x: rotation.x + drag.velocity.y,
	y: rotation.y - drag.velocity.x,
	z: rotation.z
});

const applyGyro = (gyro: GyroscopeData, rotation: Vector3) => {
	return addVectors(rotation, gyro.velocity);
};

const updateDragTimer = (timer: number): number =>
	timer < 1 ? clamp(timer + INTERACTION_SETTINGS.dragFriction, 0, 1) : timer;

const updateGyroTimer = (timer: number): number =>
	timer < 1 ? clamp(timer + INTERACTION_SETTINGS.gyroFriction, 0, 1) : timer;

const updateDragVelocity = ({
	isDragging,
	dragVelocity,
	accelerateTimer,
	decelerateTimer,
	velocity
}: DragData): Vector3 => {
	const targetVelocity: Vector3 = {
		x: dragVelocity.x * INTERACTION_SETTINGS.dragSpeed,
		y: dragVelocity.y * INTERACTION_SETTINGS.dragSpeed,
		z: 0
	};

	return interpolateVectors(velocity, targetVelocity, accelerateTimer);
};

const updateGyroVelocity = ({
	beta,
	alpha,
	enabled,
	accelerateTimer,
	decelerateTimer,
	velocity
}: GyroscopeData): Vector3 => {
	const { beta: x, alpha: y } = normalizeOrientation(alpha, beta);
	const targetVelocity: Vector3 = enabled
		? {
				x,
				y,
				z: 0
		  }
		: { x: 0, y: 0, z: 0 };

	return enabled
		? interpolateVectors(velocity, targetVelocity, accelerateTimer)
		: interpolateVectors(velocity, targetVelocity, decelerateTimer);
};

// Map mouse position from pixel coordinate to a range of -1 to 1
export const mapMouseToScreenSpace = (
	mousePos: Vector2,
	size: Vector2
): { x: number; y: number } => ({
	x: 1 - 2 * (mousePos.x / size.x),
	y: (mousePos.y / size.y) * 2 + 1
});

export const unprojectCoordinate = (
	screenSpaceCoordinate: Vector2,
	projectionMatrix: Matrix
): Vector3 => {
	const inverseProjectionMatrix: Matrix = invertMatrix(projectionMatrix);
	return {
		...applyMatrixToVector3(
			{ x: screenSpaceCoordinate.x, y: screenSpaceCoordinate.y, z: -1 },
			inverseProjectionMatrix
		),
		z: 0.5 // 0.5 places the mouse just in front of the object
	};
};

export const normalizeOrientation = (
	alpha: number,
	beta: number
): { beta: number; alpha: number } => ({
	beta: Math.sin(degreesToRadians(beta * 2)),
	alpha: Math.sin(degreesToRadians(alpha))
});

export const lookAtMouse = (
	mousePos: Vector2,
	size: Vector2,
	projectionMatrix: Matrix,
	modelViewMatrix: Matrix
): Matrix => {
	const screenSpaceTarget = mapMouseToScreenSpace(mousePos, size);
	const targetCoord: Vector3 = unprojectCoordinate(
		screenSpaceTarget,
		projectionMatrix
	);
	return lookAt(modelViewMatrix, {
		target: targetCoord,
		origin: { x: 0, y: 0, z: 0 },
		up: { x: 0, y: 1, z: 0 }
	});
};
