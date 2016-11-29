/*
 * @rpi1337 
 */

const redis = require('redis');
const promisify = require('es6-promisify');
const StoreProviderAbstract = require('../util/store-provider-abstract');

class CacheProvider extends StoreProviderAbstract {

	static get NAMESPACES() {
		return {
			THIRD_PARTY: 'THIRD_PARTY'
		};
	}

	constructor( config ) {
		super( config );
		this.client = null;
	}

	connect() {
		return new Promise((resolve, reject) => {
			if( this.client ) {
				resolve();
				return;
			}

			let config = this.config;
			let timer = setTimeout( reject, 10 * 1000 );
			let opts = {

			};
			if ( config.password ) {
				opts = Object.assign({
					password: config.password,
					auth_pass: config.password
				}, opts);
			}
			this.client = redis.createClient( config.port, config.host, opts );
			this.client.on( 'connect', this.onConnectedFunctor( resolve, reject, timer ) );
			this.client.on( 'error', this.onClientError );
			this._decorateClient();
		});
	}

	get sessionStoreConfig() {
		let config = {
            store: {
                host: this._config.host,
                port: this._config.port,
                ttl: 60 * 60 * 24
            }
        }
        if( this._config.password ) {
            config.store.options = {
                password: this._config.password,
                auth_pass: this._config.password
            }
        };
        return config;
	}

	onConnectedFunctor( callback, errorCallback, timer ) {
		let self = this;
		return function onConnected( err ) {
			clearTimeout( timer );
			if( err ) {
				errorCallback( err );
				return;
			}
			console.log('CacheProvider->onConnected Connected to cache');
			self.onConnected();
			if( callback ) {
				callback.apply( null, arguments );
			}
		};
	}

	onClientError( err ) {
        console.error('CacheProvider->onClientError Error thrown in client:', err, err.stack);
	}

	_decorateClient() {
		let c = this.client;
		this.multi = this.client.multi.bind( this.client );
		this.set = promisify(c.set.bind(c));
		this.get = promisify(c.get.bind(c));
		this.getset = promisify(c.getset.bind(c));
		this.del = promisify(c.del.bind(c));
		this.keys = promisify(c.keys.bind(c));
		this.mset = promisify(c.mset.bind(c));
		this.mget = promisify(c.mget.bind(c));
		this.incr = promisify(c.incr.bind(c));
		this.hset = promisify(c.hset.bind(c));
		this.hget = promisify(c.hget.bind(c));
		this.hmget = promisify(c.hmget.bind(c));
		this.hgetall = promisify(c.hgetall.bind(c));
		this.hmset = promisify(c.hmset.bind(c));
		this.hdel = promisify(c.hdel.bind(c));
		this.hexists = promisify(c.hexists.bind(c));
		this.lpush = promisify(c.lpush.bind(c));
		this.lpop = promisify(c.lpop.bind(c));
		this.rpush = promisify(c.rpush.bind(c));
		this.rpop = promisify(c.rpop.bind(c));
		this.lset = promisify(c.lset.bind(c));
		this.lrange = promisify(c.lrange.bind(c));
		this.ltrim = promisify(c.ltrim.bind(c));
		this.llen = promisify(c.llen.bind(c));
		this.sadd = promisify(c.sadd.bind(c));
		this.srem = promisify(c.srem.bind(c));
		this.smembers = promisify(c.smembers.bind(c));
		this.expire = promisify(c.expire.bind(c));
		this.exists = promisify(c.exists.bind(c));
	}

	disconnect() {
		return new Promise((resolve, reject) => {
			if( this._connected ) {
				this.client.quit();
			}
			resolve();			
		});
	}

	static get instance() {
		if ( !this.singleton ) {
			const CONFIG = require('../config/environment').CACHE;
			this.singleton = new CacheProvider( CONFIG );
			this.singleton.connect();
		}
		return this.singleton;
	}

};

module.exports = CacheProvider;