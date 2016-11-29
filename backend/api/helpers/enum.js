/*
 * @rpi1337 
 */

class Enum {
	
	static get counter() {
		if( !this._counter ) {
			this._counter = 1;
		}
		return this._counter;
	}

	static set counter( value ) {
		this._counter = value;
	}

	constructor( keys, namespace ) {
		if( !Array.isArray(keys) ) {
			throw new Error('Enum::constructor Keys is invalid');
		}
		this._keys = [];
		keys.forEach((key) => {
			this[ key ] = Enum.counter;
			this._keys.push( key );
			Enum.counter = Enum.counter + 1;
		});
	}

	get keys() {
		return this._keys;
	}

	get namespace() {
		return this._namespace;
	}

};

module.exports = Enum;