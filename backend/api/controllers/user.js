/*
 * @rpi1337
 */

const UserService = require( '../services/user' );
const FriendService = require( '../services/friend' );

class UserController {

	constructor( userService, friendService ) {
		this.userService = userService;
		this.friendService = friendService;
	}

	*getCurrentUser( context ) {
		let id = context.session.user.id;
		try {
			let user = yield this.userService.getUserById( id );
			context.body = user;
		} catch( e ) {
			context.session = null;
			context.throw( 401 );
		}
	}

	*getUserByUsername( context ) {
		let username = context.params.username;
		username = String( username ).trim();
		try {
			let user = yield this.userService.getUserByUsername( username );
			if( context.session && context.session.user && context.session.user.id ) {
				this.friendService.touchFriendByUsername( context.session.user.id, username );
			}
			context.body = user;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 404 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			const friendService = FriendService.instance;
			this.singleton = new UserController( userService, friendService );
		}
		return this.singleton;
	}

}

module.exports = UserController;