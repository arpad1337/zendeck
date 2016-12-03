/*
 * @rpi1337
 */

const UserService = require('../services/user');
const FeedService = require( '../services/feed' );
const CollectionService = require( '../services/collection' );

class FeedController {

	constructor( feedService, userService, collectionService ) {
		this.feedService = feedService;
		this.userService = userService;
		this.collectionService = collectionService;
	}

	*getUserPosts( context ) {
		const username = context.params.username;
		try {
			let user = yield this.userService.getUserByUsername( username );
			let posts = yield this.feedService.getUserPostsFeedByIdAndPage( userId, context.query.page );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getUserFeed( context ) {
		const userId = context.session.user.id;
		try {
			let posts = yield this.feedService.getUserFeedByIdAndPage( userId, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getLikedFeed( context ) {
		const userId = context.session.user.id;
		try {
			let posts = yield this.feedService.getUserLikedFeedByIdAndPage( userId, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getGroupFeed( context ) {
		const userId = context.session.user.id;
		const slug = context.params.groupSlug;
		try {
			let posts = yield this.feedService.getGroupFeedByIdAndPage( userId, slug, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getCollectionFeed( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;
		try {
			let collection = yield this.collectionService.getCollectionBySlug( slug );
			let posts = yield this.feedService.getUserCollectionFeedByIdAndCollectionIdAndPage( userId, collection.id, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createPost( context ) {
		const userId = context.session.user.id;
		try {
			let post = yield this.feedService.createPost( userId, context.request.fields );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*deletePost( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		try {
			let post = yield this.feedService.deletePost( userId, postId );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const feedService = FeedService.instance;
			const userService = UserService.instance;
			const collectionService = CollectionService.instance;
			this.singleton = new FeedController( feedService, userService, collectionService );
		}
		return this.singleton;
	}

}

module.exports = FeedController;