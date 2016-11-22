/*
 * @rpi1337
 */

const util = require('../../util/util');

class SamplerWorker {

	constructor( workerId, fullPath ) {
		this.workerId = workerId;
		this.fullPath = fullPath;
	}

	listen() {

	}

	static launchWorker( workerId, fullPath ) {
		const worker = new SamplerWorker( workerId, fullPath );
		worker.listen();
		return worker;
	}

}

module.exports = {
	SamplerWorker: SamplerWorker
}

if (require.main === module) {
	const params = util.collectRuntimeParams();
	SamplerWorker.launchWorker(params.workerId, params.fullPath);
}