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
	'PREREG_SUCCESFUL',
	'LOGIN_BLOCKED',
	'FORGOT_PASSWORD',
	'PASSWORD_RESET_SENT',
	'PASSWORD_RESET',
	'LOGIN_DISABLED',
	'CREATE_FILTER',
	'CREATE_COLLECTION',
	'DELETE_POST_CONFIRMATION',
	'DELETE_COMMENT_CONFIRMATION'
], 'DIALOG_TYPE');

const DIALOG_DESCIPTORS = {};

DIALOG_DESCIPTORS[ DIALOG_TYPE.REGISTER.toString() ] = {
	templateUrl: '/partials/dialog/register.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.LOGIN.toString() ] = {
	templateUrl: '/partials/dialog/login.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.SUBSCRIPTION_SUCCESFUL.toString() ] = {
	templateUrl: '/partials/dialog/subscription-successful.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.PREREG_SUCCESFUL.toString() ] = {
	templateUrl: '/partials/dialog/prereg-successful.tpl.html'
};

DIALOG_DESCIPTORS[ DIALOG_TYPE.LOGIN_BLOCKED.toString() ] = {
	templateUrl: '/partials/dialog/login-blocked.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.FORGOT_PASSWORD.toString() ] = {
	templateUrl: '/partials/dialog/forgot-password.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.PASSWORD_RESET.toString() ] = {
	templateUrl: '/partials/dialog/password-reset.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.PASSWORD_RESET_SENT.toString() ] = {
	templateUrl: '/partials/dialog/password-reset-sent.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.LOGIN_DISABLED.toString() ] = {
	templateUrl: '/partials/dialog/login-disabled.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.CREATE_FILTER.toString() ] = {
	templateUrl: '/partials/dialog/create-filter.tpl.html'
}

DIALOG_DESCIPTORS[ DIALOG_TYPE.CREATE_COLLECTION.toString() ] = {
	templateUrl: '/partials/dialog/create-collection.tpl.html'
}

export {
	DIALOG_TYPE,
	DIALOG_DESCIPTORS
};