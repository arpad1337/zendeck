/*
 * @rpi1337
 */

const cp = require('child_process');
const Enum = require('../helpers/enum');
const Util = require('../../utl/util');

const QueueProvider = require('../../providers/queue');

class WorkerService {

	static get WORKER_TYPES() {
		return {
			'PROFILE_PIC_POSTPROCESS': 'profile-pic-sampler.js',
			'COVER_PIC_POSTPROCESS': 'cover-resize.js',
			'CREATE_FILTER': 'create-filter.js'
		}
	}

	static get COMMANDS() {
		return {
			LAUNCHED: 'launched',
			START: 'start',
			STARTED: 'start',
			MESSAGE: 'message',
			FINISHED: 'finished'
			ERROR: 'error',
			TERMINATE: 'terminate'
		}
	}

	consrtuctor( processProvider, queueProvider ) {
		this._workers = new Map();
		this.queueProvider = queueProvider;
		this.processProvider = processProvider;
		this.execArgv = process.execArgv.map((arg) => {
			if (arg.startsWith('--debug-brk')) {
				return '--debug-brk';
			} else {
				return arg;
			}
		});
	}

	listen() {
		let self = this;
		process.on('SIGINT', () => {
			self._signalHandler(2);
		});
		process.on('SIGTERM', () => {
			self._signalHandler(15);
		});
	}

	launchWorkerWithTypeAndStartParams( type, params ) {
		return new Promise((resolve, reject) => {
			const workerId = Util.createSHA256Hash( type + Date.now() + JSON.stringify( params ));
			const workerRequestQueue = this.queueProvider.createQueueWithIdAndStartParams( [ workerId, 'REQUEST' ].join(':') );
			const workerResponseQueue = this.queueProvider.createQueueWithIdAndStartParams( [ workerId, 'RESPONSE' ].join(':') );
			let worker;
			workerResponseQueue.on('message', ( type, payload ) => {
				switch( type ) {
					case WorkerService.COMMANDS.LAUNCHED: {
						workerRequestQueue.sendMessage( WorkerService.COMMANDS.START );
						break;
					}
					case WorkerService.COMMANDS.FINISHED: {
						resolve( payload );
						workerRequestQueue.sendMessage( WorkerService.COMMANDS.TERMINATE );
						break;
					}
					case WorkerService.COMMANDS.ERROR: {
						reject( payload );
						workerRequestQueue.sendMessage( WorkerService.COMMANDS.TERMINATE );
						setTimeout(() => {
							worker.kill();
						}, 1000);
						break;
					}
					default: {
						console.log('WorkerService->launchWorkerWithTypeAndStartParams Got response:', type, payload);
					}
				}
			});

			workerResponseQueue.listen();

			const launchParams = Util.buildLaunchParamsFromObject( workerId, params );
			worker = this.processProvider.fork( path.resolve( __dirname, '../workers/' + this.WORKER_TYPES[ type ] ), launchParams, {
				execArgv: this.execArgv
			});

			this._workers.set( workerId, worker );

			worker.on('error', (err) => {
				reject( err );
				workerResponseQueue.stop();
				this.queueProvider.deleteQueueByPrefix( workerId );
			});

			worker.on('exit', (code, signal) => {
				reject( code );
				workerResponseQueue.stop();
				this.queueProvider.deleteQueueByPrefix( workerId );
			});
		});
	}

	_signalHandler(sigNum) {
		sigNum = Number(sigNum);
		switch (sigNum) {
			case 2:
			case 15:
				{
					this._workers.forEach((process, key) => {
						process.kill();
						this._workers.delete( key );
					});
					break;
				}
			default:
				break;
		}
		let code = (128 + sigNum);
		console.log('Process about to terminate with code: ' + code);
		process.exit(code);
	}

	static get instance() {
		if( !this.singleton ) {
			const queueProvider = QueueProvider.instance;
			const processProvider = cp;
			this.singleton = new WorkerService( processProvider, queueProvider );
			this.singleton.listen();
		}
		return this.singleton;
	}

}

module.exports = WorkerService;