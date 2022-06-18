/*
 * @rpi1337
 */

const WorkerAbstract = require('./worker-abstract');
const QueueProvider = require('../../providers/queue');
const S3Provider = require('../../providers/s3');
const gm = require('gm');

const Util = require('../../util/util');

const DIMENSIONS = {
	xxsmall: {
		width: 30,
		height: 30
	},
	xsmall: {
		width: 36,
		height: 36
	},
	small: {
		width: 42,
		height: 42
	},
	xmedium: {
		width: 60,
		height: 60
	},
	medium: {
		width: 80,
		height: 80
	},
	xlarge: {
		width: 130,
		height: 130
	},
	large: {
		width: 220,
		height: 220
	}
};

class ProfilePicSamplerWorker extends WorkerAbstract {

	constructor( workerId, queueProvider, s3Provider, params ) {
		super( workerId, queueProvider, params );
		this.s3Provider = s3Provider;
		this.onThumbnailsCreated = this.onThumbnailsCreated.bind( this );
	}

	process() {
		try {
			this.s3Provider.getObject( this.params.tempFilename ).then(( obj ) => { 
				console.log('Object:', obj);
				let promises = [];
				Object.keys(DIMENSIONS).forEach((key) => {
					const format = DIMENSIONS[key];
					let promise = new Promise((resolve, reject) => {
						gm( obj.Body )
							.resize(format.width, format.height)
							.noProfile() // removing EXIF
							.toBuffer((err, data) => {
								if (err) {
									reject(err);
									return;
								}
								resolve({
									format: key,
									buffer: data
								});
							});
					});
					promises.push(promise);
				});
				Promise.all(promises)
					.then(this.onThumbnailsCreated)
					.catch( this.onError );
			}).catch( this.onError );
		} catch (e) {
			this.onError(e);
		}
	}

	onThumbnailsCreated( thumbnails ) {
		let promises = [];
		let images = {};
		thumbnails.forEach((thumbnail) => {
			let parts = this.params.tempFilename.split('/')[1].split('_');
			let filename = [ parts[0], thumbnail.format, parts[1] ].join('_');
			let promise = this.s3Provider.pubObjectFromBuffer( 
				this.s3Provider.OBJECT_TYPES.PROFILE,
				filename,
				thumbnail.buffer,
				this.params.contentType
			);
			images[ thumbnail.format ] = {
				width: DIMENSIONS[ thumbnail.format ].width,
				height: DIMENSIONS[ thumbnail.format ].height,
				src: [ this.s3Provider.BASE_URL, this.s3Provider.KEY, this.s3Provider.OBJECT_TYPES.PROFILE, filename ].join('/')
			}
			promises.push( promise );
		});
		Promise.all( promises ).then(() => {
			this.sendComplete( images );
		});
	}

	static launchWorker( workerId, tempFilename, contentType ) {
		console.log('ProfilePicSamplerWorker::launchWorker Launching worker with params', arguments);
		const queueProvider = QueueProvider.instance;
		const s3Provider = S3Provider.instance;
		const worker = new ProfilePicSamplerWorker( workerId, queueProvider, s3Provider, {
			tempFilename: tempFilename,
			contentType: contentType
		});
		worker.listen();
		return worker;
	}

}

module.exports = {
	ProfilePicSamplerWorker: ProfilePicSamplerWorker,
	DIMENSIONS: DIMENSIONS
};

if (require.main === module) {
	try {
		const params = Util.collectRuntimeParams();
		ProfilePicSamplerWorker.launchWorker( params.workerId, params.tempFilename, params.contentType );
	} catch( e ) {
		console.error(e, e.stack);
		process.exit(1);
	}
}