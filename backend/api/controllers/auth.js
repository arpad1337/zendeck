/*
 * @rpi1337
 */

const AuthService = require( '../services/auth' );

class AuthController {

	constructor( authService ) {
		this.authService = authService;
	}

	*login( context ) {
		const usernameOrEmail = context.request.fields.usernameOrEmail;
		const password = context.request.fields.password;
		try {
			let user = yield this.authService.login( usernameOrEmail, password );
			context.session.user = user;
			context.body = user;
		} catch( e ) {
			context.throw( 403, e.message );
		}
	}

	*register( context ) {
		const fields = context.request.fields;
		const email = fields.email;
		const username = fields.username;
		const password = fields.password;
		const fullname = fields.fullname;
		const isBusiness = fields.isBusiness;
		try {
			let user = yield this.authService.register( email, password, username, fullname, isBusiness );
			if( !user.enabled ) {
				throw new Error('User login disabled');
			}
			context.session.user = user;
			context.body = user;
		} catch(e) {
			if( e.message === 'User login disabled' ) {
				context.throw( 403, e.message );
				return;
			}
			context.throw( 400, e.message );
		}
	}

	*fogotPassword( context ) {
		const usernameOrEmail = context.request.fields;
		try {
			let status = this.authService.forgotPassword( usernameOrEmail );
			context.body = {
				status: status
			};
		} catch( e ) {
			this.throw( 404, e.message );
		}
	}

	*logout( context ) {
		context.session = null;
		context.body = 'ok';
	}

	static get instance() {
		if( !this.singleton ) {
			const authService = AuthService.instance;
			this.singleton = new AuthController( authService );
		}
		return this.singleton;
	}

}

module.exports = AuthController;