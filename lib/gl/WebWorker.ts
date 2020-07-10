export default class WebWorker {
	constructor(worker: Function) {
		const code: string = worker.toString();
		const blob: Blob = new Blob(['(' + code + ')()']);
		return new Worker(URL.createObjectURL(blob));
	}
}
