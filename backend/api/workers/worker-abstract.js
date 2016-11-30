/*
 * @rpi1337
 */

const WORKER_COMMANDS = require('../config/worker-commands');

class WorkerAbstract {

	static get WORKER_COMMANDS() {
		return WORKER_COMMANDS;
	}

	constructor( workerId, queueProvider, params ) {
		this.workerId;
		this.queueProvider = queueProvider;
		this.requestQueue = this.queueProvider.createQueueWithId( [ workerId, 'REQUEST' ].join(':') );
		this.responseQueue = this.queueProvider.createQueueWithId( [ workerId, 'RESPONSE' ].join(':') );
		this.params = params;
		this._isTerminated = false;
		this.onFinished = this.onFinished.bind( this );
		this.onError = this.onError.bind( this );
	}

	listen() {
		this.requestQueue.on( 'message', this.onMessage.bind( this ) );
		this.requestQueue.listen();
		this.sendMessage( WORKER_COMMANDS.LAUNCHED );
	}

	onMessage( message ) {
		console.log('WorkerAbstract->onMessage got message:', message);
		switch( message.type ) {
			case WORKER_COMMANDS.START: {
				try {
					this.process();
				} catch( e ) {
					this.onError( e );
				}
				break;
			}
			case WORKER_COMMANDS.TERMINATE: {
				this.terminate();
				break;
			}
		}
	}

	process() {
		throw new Error('WorkerAbstract->process must override');
	}

	sendComplete( payload ) {
		this.onFinished( payload );
	}

	onFinished( payload ) {
		this.responseQueue.sendMessage( WORKER_COMMANDS.FINISHED, payload );
	}

	onError( e ) {
		this.sendMessage( WORKER_COMMANDS.ERROR, {
			error: {
				message: e.message,
				stack: e.stack ? e.stack: null
			}
		});
		this._exit(1);
	}

	sendMessage( type, payload ) {
		console.log('WorkerAbstract->sendMessage', type, payload);
		this.responseQueue.sendMessage( type, payload );
	}

	terminate() {
		this._isTerminated = true;
		this._exit();
	}

	_exit( code ) {
		code = isNaN( code ) ? 0 : code;
		process.exit( code );
	}

	static launchWorker( workerId, queueProvider ) {
		throw new Error('WorkerAbstract::launchWorker must override');
		/*
			const worker = new WorkerAbstract( workerId, queueProvider );
			worker.listen();
			return worker;
		*/
	}

}

module.exports = WorkerAbstract;