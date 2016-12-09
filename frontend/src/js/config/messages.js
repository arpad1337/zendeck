/*
 * @rpi1337 
 */

import Enum from '../helpers/enum';

const USER_MESSAGES = new Enum([
	"LOGIN",
	"LOGOUT"
],'USER_MESSAGES');

const NOTIFICATIONS = new Enum([
	'NOTIFICATION',
	'NEW_MESSAGE',
	'THREAD_VIEW'
], 'NOTIFICATIONS')

export default {
	USER: USER_MESSAGES,
	NOTIFICATIONS: NOTIFICATIONS
};