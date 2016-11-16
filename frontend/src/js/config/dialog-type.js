/*
 * @rpi1337
 */

import Enum from '../helpers/enum';

import Validator from '../helpers/validator';

const DIALOG_TYPE = new Enum([
	'LOGIN',
	'REGISTER',
	'LOGOUT',
	'ERROR',
	'SUBSCRIPTION_SUCCESFUL',
	'PREREG_SUCCESFUL'
], 'DIALOG_TYPE');

const DIALOG_DESCIPTORS = {};

DIALOG_DESCIPTORS[ DIALOG_TYPE.REGISTER.toString() ] = {
	templateUrl: 'partials/dialog/register.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.LOGIN.toString() ] = {
	templateUrl: 'partials/dialog/login.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.SUBSCRIPTION_SUCCESFUL.toString() ] = {
	templateUrl: 'partials/dialog/subscription-successful.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.PREREG_SUCCESFUL.toString() ] = {
	templateUrl: 'partials/dialog/prereg-successful.tpl.html'
};

export {
	DIALOG_TYPE,
	DIALOG_DESCIPTORS
};