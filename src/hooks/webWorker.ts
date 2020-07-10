import { useEffect } from 'react';
import loadOBJWorker from '../../lib/gl/loadOBJWorker';
import WebWorker from '../../lib/gl/WebWorker';
import { loadOBJWithoutWorker } from '../../lib/gl/loadOBJ';
import { Mesh, WebWorkerLoadMessage } from '../../types';

export const useOBJLoaderWebWorker = ({ onLoadHandler, OBJData, useWebWorker = true }: WebWorkerLoadMessage) => {
	useEffect(() => {
		if (!useWebWorker) {
			const mesh = loadOBJWithoutWorker(OBJData);
			onLoadHandler(mesh);
			return;
		}

		const worker: any = new WebWorker(loadOBJWorker) as any;
		worker.addEventListener('message', (event: { data: Mesh }) => onLoadHandler(event.data));
		worker.postMessage(OBJData, undefined);
	}, []);
};
