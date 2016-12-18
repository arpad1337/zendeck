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

const UI_EVENTS = new Enum([
	'TEMP_FILTER_CREATED'
], 'UI_EVENTS');

export default {
	USER: USER_MESSAGES,
	NOTIFICATIONS: NOTIFICATIONS,
	UI_EVENTS: UI_EVENTS
};