/*
 * @rpi1337
 */

const FriendService = require('../services/friend');
const UserService = require('../services/user');
const FeedService = require('../services/feed');

class FriendController {

	constructor( friendService, feedService, userService ) {
		this.userService = userService;
		this.friendService = friendService;
		this.feedService = feedService;
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

	*getFollowersByPage( context ) {
		const page = context.query.page || 1;
		const userId = context.session.user.id;
		try {
			let friends = yield this.friendService.getFollowersByUserId( userId, page );
			context.body = friends;
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	*getFollowersByUsernameAndPage( context ) {
		const username = context.params.username;
		const page = context.query.page || 1;
		try {
			let friends = yield this.friendService.getFollowersByUsername( username, page );
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
			let friend = yield this.userService.getUserByUsername( friendUsername );
			this.feedService.userFollowOther( userId, friend.id );
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
			let friend = yield this.userService.getUserByUsername( friendUsername );
			this.feedService.userUnfollowOther( userId, friend.id );
			context.body = {
				success: success
			};
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	*getFriendRecommendations( context ) {
		try {
			let users = yield this.friendService.getRecommendations( context.session.user.id, context.request.ip ); // todo: IP based recommendation
			context.body = users;
		} catch( e ) {
			context.throw(400, e.message);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const friendService = FriendService.instance;
			const feedService = FeedService.instance;
			const userService = UserService.instance;
			this.singleton = new FriendController( friendService, feedService, userService );
		}
		return this.singleton;
	}

}

module.exports = FriendController;