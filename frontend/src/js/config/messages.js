/*
 * @rpi1337 
 */

import Enum from '../helpers/enum';

const USER_MESSAGES = new Enum([
	"LOGIN",
	"LOGOUT"
],'USER_MESSAGES');

export default {
	USER: USER_MESSAGES
};