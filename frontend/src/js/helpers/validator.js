/*
 * @rpi1337 
 */

const Util = require('./util');

const Validator = {

	validateEmail: ( email ) => {
		let re = /\S+@\S+\.\S+/;
		return re.test(email);
	},

	validatePasswordStrength: ( password ) => {
		return /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/.test( password );
	},

	validateUsername: ( username ) => {
		return /^[A-Za-z0-9_-]{3,16}$/.test( username );
	},

	isFieldEmpty: ( value ) => {
		return ( Util.trim( value ).length === 0 );
	},

	validatePasswordToken: ( token ) => {
		token = String(token).trim();
		const len = 64;
		return (
			token && 
			/[a-z0-9]/g.test( token.toLowerCase() ) && 
			token.length === len
		);
	}

};

module.exports = Validator;