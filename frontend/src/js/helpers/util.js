/*
 * @rpi1337 
 */

const Util = {

	trim: ( string ) => {
		if( !string ) {
			return '';
		}
		return String(string).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ +/g,' ');
	}

};

module.exports = Util;