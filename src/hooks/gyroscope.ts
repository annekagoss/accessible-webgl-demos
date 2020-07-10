import { useEffect } from 'react';
import { Interaction } from '../../types';
import { normalizeOrientation } from '../../lib/gl/interaction';

export const useGyroscope = (
	interactionRef: React.MutableRefObject<Interaction>
) => {
	useEffect(() => {
		interactionRef.current.gyroscope.enabled =
			Boolean('ondeviceorientation' in window) &&
			Boolean('ontouchstart' in window);
		if (!interactionRef.current.gyroscope.enabled) return;

		window.addEventListener(
			'deviceorientation',
			(e: DeviceOrientationEvent) =>
				handleOrientationChange(e, interactionRef)
		);
		return () => {
			window.removeEventListener(
				'deviceorientation',
				(e: DeviceOrientationEvent) =>
					handleOrientationChange(e, interactionRef)
			);
		};
	}, []);
};

const handleOrientationChange = (
	e: DeviceOrientationEvent,
	interactionRef: React.MutableRefObject<Interaction>
) => {
	if (typeof DeviceOrientationEvent.requestPermission === 'function') {
		DeviceOrientationEvent.requestPermission()
			.then(permissionState => {
				if (permissionState === 'granted') {
					interactionRef.current.gyroscope.enabled = true;
				}
			})
			.catch(e => {
				console.error(e);
				interactionRef.current.gyroscope.enabled = false;
			});
	}

	interactionRef.current.gyroscope.beta = e.beta;
	interactionRef.current.gyroscope.alpha = e.alpha;
};
