/*
 * @rpi1337
 */

const AWS_CONFIG = require('../config/aws');
const AWS = require('aws-sdk');
const ENV = require('../config/environment');
const fs = require('fs');

class S3Provider {

	get OBJECT_TYPES() {
		return ENV.BUCKET.TYPES;
	}

	get BASE_URL() {
		return ENV.BUCKET.BASE_URL;
	}

	get KEY() {
		return ENV.BUCKET.KEY;
	}

	get ENDPOINT() {
		return ENV.BUCKET.ENDPOINT;
	}

	constructor() {
		let config = {
			accessKeyId: AWS_CONFIG.API_KEY,
			secretAccessKey: AWS_CONFIG.API_SECRET,
			region: 'eu-west-1'
		};
		if (ENV.BUCKET.ENDPOINT) {
			config = Object.assign(config, { endpoint: ENV.BUCKET.ENDPOINT });
		} 
		this.client = new AWS.S3( config );
	}

	pubObjectFromBuffer( type, filename, body, fileType ) {
		return new Promise((resolve, reject) => {
			let tempFilename = type + '/' + filename;
			const payload = {
				Bucket: ENV.BUCKET.KEY,
				Key:  tempFilename,
				Body: body,
				ContentType: fileType
			};
			this.client.putObject(payload, (err, data) => {
				if( err ) {
					reject(err);
					return;
				}
				resolve({
					url: [ this.BASE_URL, ENV.BUCKET.KEY, type, filename ].join('/'),
					tempFilename: tempFilename,
					data: data 
				});
			});
		});	
	}

	putObject( type, filename, file ) {
		return new Promise((resolve, reject) => {
			type = type || 'temp';
			fs.readFile( file.path, (err, body) =>{
				if( err ) {
					reject( err );
					return;
				}
				this.pubObjectFromBuffer( type, filename, body, file.type ).then((data) =>{
					resolve(data);
				}).catch((e) => {
					reject(e);
				});
			});
		});
	}

	getObject( resourceKey ) {
		return new Promise((resolve, reject) => {
			this.client.getObject({
				Bucket: ENV.BUCKET.KEY,
				Key:  resourceKey
			}, (err, data) => {
				if( err ) {
					reject(err);
					return;
				}
				resolve( data );
			});
		});
	}

	static get instance() {
		if( !this.singleton ) {
			this.singleton = new S3Provider();
		}
		return this.singleton;
	}

}

module.exports = S3Provider;