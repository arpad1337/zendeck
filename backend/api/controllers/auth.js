/*
 * @rpi1337
 */

const AuthService = require( '../services/auth' );
const CollectionService = require( '../services/collection' );

class AuthController {

	constructor( authService, collectionService ) {
		this.authService = authService;
		this.collectionService = collectionService;
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
		const termsAccepted = fields.termsAccepted;
		try {
			let user = yield this.authService.register( email, password, username, fullname, isBusiness, termsAccepted );
			yield this.collectionService.createCollection( user.id, 'Favorites', true );
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

	*forgotPassword( context ) {
		const usernameOrEmail = context.request.fields.usernameOrEmail;
		try {
			let status = yield this.authService.forgotPassword( usernameOrEmail );
			context.body = {
				status: status
			};
		} catch( e ) {
			console.error(e.message, e.stack);
			context.throw( 404, e.message );
		}
	}

	*resetPassword( context ) {
		const signature = context.request.fields.signature;
		const password = context.request.fields.password;
		try {
			let user = yield this.authService.resetPassword( signature, password );
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

	*logout( context ) {
		context.session = null;
		context.body = 'ok';
	}

	static get instance() {
		if( !this.singleton ) {
			const authService = AuthService.instance;
			const collectionService = CollectionService.instance;
			this.singleton = new AuthController( authService, collectionService );
		}
		return this.singleton;
	}

}

module.exports = AuthController;