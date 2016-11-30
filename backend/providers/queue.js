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
	}

	createQueueWithId( id ) {
		let newId = [ QueueProvider.QUEUE_NAMESPACE, id ].join(':');
		console.log('QueueProvider->createQueueWithId creating Queue', newId);
		const queue = new RedisQueue({
			id: newId,
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