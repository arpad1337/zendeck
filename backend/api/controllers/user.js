/*
 * @rpi1337
 */

const UserService = require( '../services/user' );
const FriendService = require( '../services/friend' );
const Util = require( '../../util/util' );

class UserController {

	constructor( userService, friendService, workerService, s3Provider ) {
		this.userService = userService;
		this.friendService = friendService;

	}

	*getCurrentUser( context ) {
		let id = context.session.user.id;
		try {
			let user = yield this.userService.getUserById( id );
			context.session.lastCheck = (new Date()).toISOString();
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

	*updateProfilePic( context ) {
		const userId = context.session.user.id;
		const imageBuffer = Util.decodeBase64Image( context.request.fields.image );
		const file = yield Util.createTempFileFromImageBuffer( context.request.fields.filename, imageBuffer );
		try {
			let result = yield this.userService.updateProfilePic( userId, file );
			context.body = {
				success: result
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400, e );
		}
	}

	*updateCoverPic( context ) {
		const userId = context.session.user.id;
		const file = context.request.fields.file[0];
		try {
			let result = yield this.userService.updateCoverPic( userId, file );
			context.body = {
				success: result
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400, e );
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