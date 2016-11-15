/*
 * @rpi1337
 */

module.exports = function *( next ) {
	let context = this;
	if( context.session && context.session.user ) {
		return yield next;
	}
	context.throw(403);
};