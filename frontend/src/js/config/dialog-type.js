/*
 * @rpi1337
 */

import Enum from '../helpers/enum';

import Validator from '../helpers/validator';

const DIALOG_TYPE = new Enum([
	'LOGIN',
	'REGISTER',
	'LOGOUT',
	'ERROR'
], 'DIALOG_TYPE');

const DIALOG_DESCIPTORS = {};

DIALOG_DESCIPTORS[ DIALOG_TYPE.REGISTER.toString() ] = {
	templateUrl: 'partials/dialog/register.tpl.html',
	validate: (model) => {
		if( !Validator.validateEmail( model.email ) ) {
			return false;
		}

		if( !Validator.validatePasswordStrength( model.password ) ) {
			return false;
		}

		if( Validator.isFieldEmpty( model.username ) ) {
			return false
		}

		return true;
	}
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.LOGIN.toString() ] = {
	templateUrl: 'partials/dialog/login.tpl.html',
	validate: (model) => {
		if( !Validator.validatePasswordStrength( model.password ) ) {
			return false;
		}

		if( Validator.isFieldEmpty( model.userOrEmail ) ) {
			return false
		}

		return true;
	}
};

export {
	DIALOG_TYPE,
	DIALOG_DESCIPTORS
};