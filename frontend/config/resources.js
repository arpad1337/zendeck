/*
 * @rpi1337
 */


const CONFIG = {
	API_PATH: 'http://zendeck.local/api'
};

module.exports = function( env ) {
	console.log('Getting environment <' + env + '> configuration');
	return CONFIG;
};