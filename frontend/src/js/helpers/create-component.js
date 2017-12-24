/*
 * @rpi1337
 */

module.exports = function( Class ) {
	return () => {
		return Class.$descriptor;
	};
};