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
			KEY: 'zendeck-production',
			BASE_URL: 'https://s3-eu-west-1.amazonaws.com',
			//ENDPOINT: 'http://localhost:9090/zendeck-production',
			TYPES: {
				TEMP: 'temp',
				COVER: 'cover',
				PROFILE: 'profile',
				GROUP: 'group',
				FILE: 'file'
			}

		},
		BASE_URL: 'http://zendeck.local'
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
			KEY: 'zendeck-production',
			BASE_URL: 'https://s3-eu-west-1.amazonaws.com',
			TYPES: {
				TEMP: 'temp',
				COVER: 'cover',
				PROFILE: 'profile',
				GROUP: 'group',
				FILE: 'file'
			}
		},
		BASE_URL: 'http://staging.zendeck.co'
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
			KEY: 'zendeck-production',
			BASE_URL: 'https://s3-eu-west-1.amazonaws.com',
			TYPES: {
				TEMP: 'temp',
				COVER: 'cover',
				PROFILE: 'profile',
				GROUP: 'group',
				FILE: 'file'
			}
		},
		BASE_URL: 'http://zendeck.co'
	}
};

let CURRENT_ENVIRONMENT;

CURRENT_ENVIRONMENT = ENVIRONMENT.DEVELOPMENT;

module.exports = CURRENT_ENVIRONMENT;