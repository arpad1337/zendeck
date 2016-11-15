/*
 * @rpi1337
 */

import Enum from '../helpers/enum';

const USER_STATUS = new Enum([
	'SUBMITED',
	'REGISTERED',
	'DEACTIVATED'
], 'USER_STATUS');

const USER_STATUS_ORDERED = USER_STATUS.keys;

export { 
	USER_STATUS,
	USER_STATUS_ORDERED
}