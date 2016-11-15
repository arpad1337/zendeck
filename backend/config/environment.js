/*
 * @rpi1337 
 */

const ENVIRONMENT = {
	DEVELOPMENT: {
		DATABASE: {
			host: '127.0.0.1',
			port: 5432,
			username: 'postgres',
			password: '',
			database: 'zd_development',
			dialect: 'postgres'
		},
		CACHE: {
			protocol: 'redis',
	        host: '127.0.0.1',
	        port: 6379,
	        username: '',
	        password: '',
	        database: '0'
		},
		BUCKET: {
			url: 'http://localhost:1339'
		},
		BASE_URL: 'http://dev.zendeck.co'
	},
	STAGING: {
		DATABASE: {
			host: '127.0.0.1',
			port: 5432,
			username: 'postgres',
			password: '',
			database: 'zd_development',
			dialect: 'postgres'
		},
		CACHE: {
			protocol: 'redis',
	        host: '127.0.0.1',
	        port: 6379,
	        username: '',
	        password: '',
	        database: '0'
		},
		BUCKET: {
			url: 'http://localhost:1339'
		},
		BASE_URL: 'http://dev.zendeck.co'
	},
	PRODUCTION: {
		DATABASE: {
			host: '127.0.0.1',
			port: 5432,
			username: 'postgres',
			password: '',
			database: 'zd_development',
			dialect: 'postgres'
		},
		CACHE: {
			protocol: 'redis',
	        host: '127.0.0.1',
	        port: 6379,
	        username: '',
	        password: '',
	        database: '0'
		},
		BUCKET: {
			url: 'http://localhost:1339'
		},
		BASE_URL: 'http://dev.zendeck.co'
	}
};

let CURRENT_ENVIRONMENT;

CURRENT_ENVIRONMENT = ENVIRONMENT.DEVELOPMENT;

module.exports = CURRENT_ENVIRONMENT;