/*
 * @rpi1337
 */

const UserService = require( '../services/user' );

class UserController {

	constructor( userService ) {
		this.userService = userService;
	}

	*getCurrentUser( context ) {
		let id = context.session.user.id;
		try {
			console.log(this);
			let user = yield this.userService.getUserById( id );
			context.body = user;
		} catch( e ) {
			context.throw( 401 );
		}
	}

	*getUserByUsername( context ) {
		let username = context.params.username;
		username = String( username ).trim();
		try {
			let user = yield this.userService.getUserByUsername( username );
			context.body = user;
		} catch( e ) {
			this.throw( 404 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			this.singleton = new UserController( userService );
		}
		return this.singleton;
	}

}

module.exports = UserController;