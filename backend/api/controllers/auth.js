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
			context.throw( e.message, 403 );
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
				context.throw( e.message, 403 );
				return;
			}
			context.throw( e.message, 400 );
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