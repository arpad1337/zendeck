/*
 * @rpi1337
 */

const cacheProvider = require('../providers/cache').instance;
const MAX_ATTEMPTS = 10;

module.exports = function *(next) {

	let usernameOrEmail = this.request.fields.usernameOrEmail.trim() + '_' + this.request.ip.replace(':','-');
	let currentTime = (new Date).getTime();
	let checkAttempts = {
		attempts: 1
	};
	try {
		let checkAttemptsString = yield cacheProvider.get('LOGIN_ATTEMPTS:' + usernameOrEmail);
		if( !checkAttemptsString ) {
			throw new Error('Cache miss');
		}
		checkAttempts = JSON.parse( checkAttemptsString );
	} catch( e ) {
		console.error(e);
	}

	if( checkAttempts.attempts > MAX_ATTEMPTS ) {
		let reset = 60;
		yield cacheProvider.expire('LOGIN_ATTEMPTS:' + usernameOrEmail, reset);
		let t = new Date();
		t.setSeconds( t.getSeconds() + reset );
		this.set('X-BlockedLogin-Reset', t);
		this.status = 401;
		this.body = 'Blocked';
		return;
	} 

	try {
		yield next;
		yield cacheProvider.del('LOGIN_ATTEMPTS:' + usernameOrEmail);
	} catch( e ) {
		checkAttempts.attempts++;
		yield cacheProvider.set('LOGIN_ATTEMPTS:' + usernameOrEmail, JSON.stringify(checkAttempts));
		this.throw(e);
	}

};