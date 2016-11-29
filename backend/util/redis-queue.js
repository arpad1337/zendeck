/*
 * @rpi1337
 */

const assert = require('assert');
const EventEmitter = require('events').EventEmitter;

class RedisQueue extends EventEmitter {

	constructor( opts ) {
		assert( opts, 'RedisQueue::constructor opts not defined');
		assert( opts.id, 'RedisQueue::constructor opts.id not defined');
		assert( opts.queueInterface, 'RedisQueue::constructor opts.queueProvider not defined');
		this._queueId = opts.id;
		this.queueProvider = opts.queueProvider;
		this.limit = opts.limit || 10;
		this._timer = null;
		this._stopped = false;
	}

	listen() {
		this._timer = setTimeout( this._onPoll , 200);
	}

	stop() {
		clearTimeout( this._timer );
		this._stopped = true;
	}

	_onPoll() {
		this.queueProvider
			.multi()
			.lrange(this.queueId, 0, this.limit - 1)
			.ltrim(this.queueId, this.limit, -1)
			.exec( this._onPop );
	}

	_onPop( err, result ) {
		if( err ) {
			console.error( 'RedisQueue->_onPop Error:', err );
			return;
		}
		if( this._stopped ) {
			return;
		}
		if( result[0].length === 0 ) {
			this.listen();
			return;
		}
		result[0].forEach((message) => {
			this.onMessage( message );
		});
		this.listen();
	}

	get queueId() {
		return this._queueId;
	}

	onMessage( message ) {
		try {
			message = JSON.parse( message );
		} catch( e ) {
			console.error(e, e.stack);
		}
		this.emit( message.type, message.payload );
	}

	emit( type, message ) {
		super.emit( 'message', type, message );
	}

	sendMessage( type, payload ) {
		this.queueProvider.lpush( this.queueId, JSON.stringify({
			type: type,
			payload: payload
		}));
	}

	_delegateRespondsToSelector( selector ) {
		return this.delegate && typeof this.delegate[ selector ] === 'function';
	}

}

module.exports = RedisQueue;