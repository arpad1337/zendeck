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

};

module.exports = Util;