/*
 * @rpi1337
 */

import Enum from '../helpers/enum';

const USER_STATUS = new Enum([
	'SUBMITED',
	'REGISTERED',
	'DEACTIVATED'
], 'USER_STATUS');

export default USER_STATUS;