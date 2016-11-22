/*
 * @rpi1337
 */

const crypto = require('crypto');
const PASSWORD_SALT = require('../config/secrets').PASSWORD_SALT;

const Util = {

	createSHA256Hash: ( key ) => {
		return crypto.createHmac( 'sha256', PASSWORD_SALT ).update( key ).digest( 'hex' );
	},

	createSignatureForKey: ( key, secret ) => {
		if( !secret ) {
			throw new Error( 'Util::createSignatureForKey secret is undefined' );
		}
		return crypto.createHash( 'sha256' ).update( key + secret ).digest( 'hex' );
	},

	generateRandomColor: () => {
		var letters = '456789ABC';
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 9)];
	    }
	    return color;
	}

};

module.exports = Util;