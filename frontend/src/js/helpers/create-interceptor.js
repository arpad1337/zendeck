/*
 * @rpi1337
 */

module.exports = function( Class ) {
	return [ ...Class.$inject, (...params) => new Class(...params) ];
};