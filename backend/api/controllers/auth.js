/*
 * @rpi1337
 */

const AuthService = require( '../services/auth' );
const CollectionService = require( '../services/collection' );
const MessageService = require('../services/message');

class AuthController {

	constructor( authService, collectionService, messageService ) {
		this.authService = authService;
		this.collectionService = collectionService;
		this.messageService = messageService;
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

	*checkUsernameAvailability( context ) {
		const username = context.request.fields.username;
		context.body = yield this.authService.checkUsernameAvailability( username );
	}

	*checkEmailAvailability( context ) {
		const email = context.request.fields.email;
		context.body = yield this.authService.checkEmailAvailability( email );
	}

	*register( context ) {
		const fields = context.request.fields;
		const email = fields.email;
		const username = fields.username;
		const password = fields.password;
		const fullname = fields.fullname;
		const isBusiness = fields.isBusiness;
		const termsAccepted = fields.termsAccepted;
		const invitationKey = fields.invitationKey;
		try {
			let user = yield this.authService.register( email, password, username, fullname, isBusiness, termsAccepted );
			yield this.collectionService.createCollection( user.id, 'Favorites', true );
			if( invitationKey ) {
				yield this.authService.acceptInvitation( user.id, invitationKey );
				user.enabled = true;
			}
			let system = yield this.authService.getSystemUser();
			yield this.messageService.createMessage( system.id, user.id, 'Welcome at ZenDeck! Hope you will have a good time using the platform.\n\nBest\nZenDeck Team');
			if( !user.enabled ) {
				throw new Error('User login disabled');
			}
			context.session.user = user;
			context.body = user;
		} catch(e) {
			console.error(e, e.stack);
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

	*inviteUsers( context ) {
		const userId = context.session.user.id;
		const users = context.request.fields.users;
		try {
			let success = yield this.authService.inviteUsers( userId, users );
			context.body = {
				success: success
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(e);
		}
	}

	*sendFeedback( context ) {
		const sender = context.session.user.id;
		const content = context.request.fields.content;
		try {
			let success = yield this.authService.sendFeedback( sender, content );
			context.body = {
				success: success
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(e);
		}
	}

	*subscribe( context ) {
		const name = context.request.fields.name;
		const email = context.request.fields.email;
		try {
			context.body = yield this.authService.subscribe( name, email );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(e);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const authService = AuthService.instance;
			const collectionService = CollectionService.instance;
			const messageService = MessageService.instance;
			this.singleton = new AuthController( authService, collectionService, messageService );
		}
		return this.singleton;
	}

}

module.exports = AuthController;