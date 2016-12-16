/*
 * @rpi1337
 */

const cp = require('child_process');
const path = require('path');

const Util = require('../../util/util');
const WORKER_COMMANDS = require('../config/worker-commands');
const QueueProvider = require('../../providers/queue');

class WorkerService {

	get WORKER_TYPES() {
		return {
			'PROFILE_PIC_POSTPROCESS': 'profile-pic-sampler.js',
			'COVER_PIC_POSTPROCESS': 'cover-pic-sampler.js',
			'CREATE_FILTER': 'create-filter.js'
		}
	}

	constructor( processProvider, queueProvider ) {
		this._workers = new Map();
		this.queueProvider = queueProvider;
		this.processProvider = processProvider;
		this._signalHandler = this._signalHandler.bind( this );
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

	launchWorkerWithTypeAndStartParams( workerFile, params ) {
		console.log('WorkerService->launchWorkerWithTypeAndStartParams launching worker', workerFile, params);
		return new Promise((resolve, reject) => {
			const workerId = Util.createSHA256Hash( workerFile + Date.now() + JSON.stringify( params ));
			const workerRequestQueue = this.queueProvider.createQueueWithId( [ workerId, 'REQUEST' ].join(':') );
			const workerResponseQueue = this.queueProvider.createQueueWithId( [ workerId, 'RESPONSE' ].join(':') );
			let worker;
			workerResponseQueue.on('message', ( message ) => {
				console.log('WorkerService->launchWorkerWithTypeAndStartParams got message:', message);
				switch( message.type ) {
					case WORKER_COMMANDS.LAUNCHED: {
						clearTimeout( worker.terminationTimer );
						workerRequestQueue.sendMessage( WORKER_COMMANDS.START );
						break;
					}
					case WORKER_COMMANDS.FINISHED: {
						resolve( message.payload );
						workerRequestQueue.sendMessage( WORKER_COMMANDS.TERMINATE );
						break;
					}
					case WORKER_COMMANDS.ERROR: {
						reject( payload );
						workerRequestQueue.sendMessage( WORKER_COMMANDS.TERMINATE );
						this._scheduleWorkerTermination( worker );
						break;
					}
					default: {
						console.log('WorkerService->launchWorkerWithTypeAndStartParams Got response:', type, payload);
					}
				}
			});

			workerResponseQueue.listen();

			const launchParams = Util.buildLaunchParamsFromObject( workerId, params );
			worker = this.processProvider.fork( path.resolve( __dirname, '../workers/' + workerFile ), launchParams, {
				execArgv: this.execArgv
			});

			worker.id = workerId;
			this._scheduleWorkerTermination( worker );

			this._workers.set( workerId, worker );

			worker.on('error', (err) => {
				console.log('WorkerService->launchWorkerWithTypeAndStartParams error', err);
				reject( err );
				workerResponseQueue.stop();
				this.queueProvider.deleteQueueByPrefix( workerId );
				this._workers.delete( worker.id );
			});

			worker.on('exit', (code, signal) => {
				console.log('WorkerService->launchWorkerWithTypeAndStartParams exit', code);
				reject( code );
				workerResponseQueue.stop();
				this.queueProvider.deleteQueueByPrefix( workerId );
				this._workers.delete( worker.id );
			});
		});
	}

	_scheduleWorkerTermination( worker ) {
		worker.terminationTimer = setTimeout(() => {
			try {
				worker.kill();
			} catch( e ) {

			} finally {
				console.log( 'WorkerService->_scheduleWorkerTermination worker [' + worker.id + '] terminated' );
				this.queueProvider.deleteQueueByPrefix( worker.id );
				this._workers.delete( worker.id );
			}
		}, 10000);
	}

	_signalHandler(sigNum) {
		sigNum = Number(sigNum);
		switch (sigNum) {
			case 2:
			case 15:
				{
					this._workers.forEach((worker, key) => {
						console.log( 'WorkerService->_signalHandler worker [' + worker.id + '] terminated' );
						worker.kill();
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