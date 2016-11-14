/*
 * @rpi1337
 */

module.exports = function( Class ) {
	const dependencies = Class.$inject || null;
	if( dependencies == null || dependencies.length === 0 ) {
		return () => {
			return Class.$descriptor;
		};
	}
	return dependencies.push( () => { return Class.$descriptor; } );
};