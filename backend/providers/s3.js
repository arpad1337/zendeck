/*
 * @rpi1337
 */

class S3Provider {

	constructor() {

	}

	putObject() {
		
	}

	static get instance() {
		if( !this.singleton ) {
			this.singleton = new S3Provider();
		}
		return this.singleton;
	}

}

module.exports = S3Provider;