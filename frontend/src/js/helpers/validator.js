/*
 * @rpi1337 
 */

const Util = require('./util');

const Validator = {

	validateEmail: ( email ) => {
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},

	validatePasswordStrength: ( password ) => {
		return /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/.test( password );
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