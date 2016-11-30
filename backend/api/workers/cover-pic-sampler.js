/*
 * @rpi1337
 */

const WorkerAbstract = require('./worker-abstract');
const QueueProvider = require('../../providers/queue');
const S3Provider = require('../../providers/s3');
const gm = require('gm');

const Util = require('../../util/util');

class CoverPicSamplerWorker extends WorkerAbstract {

	constructor( workerId, queueProvider, s3Provider, params ) {
		super( workerId, queueProvider, params );
		this.s3Provider = s3Provider;
		this.onThumbnailCreated = this.onThumbnailCreated.bind( this );
	}

	process() {
		try {
			this.s3Provider.getObject( this.params.tempFilename ).then(( obj ) => { 
				console.log('Object:', obj);
				let format = {
					width: 1200,
					height: 400
				};
				let promise = new Promise((resolve, reject) => {
					gm( obj.Body )
						.resize(format.width, null)
						.noProfile() // removing EXIF
						.toBuffer((err, data) => {
							if (err) {
								reject(err);
								return;
							}
							resolve({
								format: format,
								buffer: data
							});
						});
				});
				promise
					.then(this.onThumbnailCreated)
					.catch( this.onError );
			}).catch( this.onError );
		} catch (e) {
			this.onError(e);
		}
	}

	onThumbnailCreated( thumbnail ) {
		let promises = [];
		let parts = this.params.tempFilename.split('/')[1].split('_');
		let filename = [ parts[0], 'cover', parts[1] ].join('_');
		let promise = this.s3Provider.pubObjectFromBuffer( 
			this.s3Provider.OBJECT_TYPES.PROFILE,
			filename,
			thumbnail.buffer,
			this.params.contentType
		);
		let image = {
			width: thumbnail.format.width,
			height: thumbnail.format.height,
			src: [ this.s3Provider.BASE_URL, this.s3Provider.OBJECT_TYPES.PROFILE, filename ].join('/')
		};
		promise.then(() => {
			this.sendComplete( image );
		});
	}

	static launchWorker( workerId, tempFilename, contentType ) {
		console.log('CoverPicSamplerWorker::launchWorker Launching worker with params', arguments);
		const queueProvider = QueueProvider.instance;
		const s3Provider = S3Provider.instance;
		const worker = new CoverPicSamplerWorker( workerId, queueProvider, s3Provider, {
			tempFilename: tempFilename,
			contentType: contentType
		});
		worker.listen();
		return worker;
	}

}

module.exports = {
	CoverPicSamplerWorker: CoverPicSamplerWorker
};

if (require.main === module) {
	try {
		const params = Util.collectRuntimeParams();
		CoverPicSamplerWorker.launchWorker( params.workerId, params.tempFilename, params.contentType );
	} catch( e ) {
		console.error(e, e.stack);
		process.exit(1);
	}
}