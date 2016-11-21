/*
 * @rpi1337
 */

const FriendService = require('../services/friend');

class FriendController {

	constructor( friendService ) {
		this.friendService = friendService;
	}

	*getFriendsByPage( context ) {
		const page = context.query.page || 1;
		const userId = context.session.user.id;
		try {
			let friends = yield this.friendService.getFriendsByUserId( userId, page );
			context.body = friends;
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	*getFriendsByUsernameAndPage( context ) {
		const username = context.params.username;
		const page = context.query.page || 1;
		try {
			let friends = yield this.friendService.getFriendsByUsername( username, page );
			context.body = friends;
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	*addFriend( context ) {
		const userId = context.session.user.id;
		const friendUsername = context.request.fields.username;
		try {
			let success = yield this.friendService.addFriend( userId, friendUsername );
			context.body = {
				success: success
			};
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	*removeFriend( context ) {
		const userId = context.session.user.id;
		const friendUsername = context.params.friendUsername;
		try {
			let success = yield this.friendService.removeFriend( userId, friendUsername );
			context.body = {
				success: success
			};
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const friendService = FriendService.instance;
			this.singleton = new FriendController( friendService );
		}
		return this.singleton;
	}

}

module.exports = FriendController;