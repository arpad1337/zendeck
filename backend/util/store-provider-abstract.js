/*
 * @rpi1337 
 */

class StoreProviderAbstract {
	constructor( config ) {
		this._config = config;
		this._connected = false;
	}

	get config() {
		return this._config;
	}

	get connected() {
		return this._connected;
	}

	onConnected() {
		this._connected = true;
	}

	connect() {
		throw new Error('StoreProviderAbstract->connect Must override');
	}

	disconnect() {
		throw new Error('StoreProviderAbstract->disconnect Must override');
	}
}

module.exports = StoreProviderAbstract;