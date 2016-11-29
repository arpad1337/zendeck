/*
 * @rpi1337
 */

const CacheProvider = require('./cache');
const RedisQueue = require('../util/redis-queue');

class QueueProvider {

	static get QUEUE_NAMESPACE() {
		return 'QUEUES';
	}

	constructor( cacheProvider ) {
		this.cacheProvider = cacheProvider;
		this.onMessage = this.onMessage.bind(this);
	}

	createQueueWithIdAndStartParams( id, params ) {
		const queue = new Queue({
			id: [ QueueProvider.QUEUE_NAMESPACE, id ].join(':'),
			queueProvider: this.cacheProvider
		});
		return queue;
	}

	deleteQueueByPrefix( id ) {
		return this.cacheProvider.del( [ QueueProvider.QUEUE_NAMESPACE, id ].join(':') );
	}

	static get instance() {
		if( !this.singleton ) {
			const cacheProvider = CacheProvider.instance;
			this.singleton = new QueueProvider( cacheProvider );
		}
		return this.singleton;
	}

}

module.exports = QueueProvider;