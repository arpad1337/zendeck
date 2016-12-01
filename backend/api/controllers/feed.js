/*
 * @rpi1337
 */

const FeedService = require( '../services/feed' );

class FeedController {

	constructor( feedService ) {
		this.feedService = feedService;
	}

	*getUserFeed( context ) {
		let userId = context.session.user.id;
		try {
			let posts = yield this.feedService.getUserFeedByIdAndPage( userId, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createPost( context ) {
		let userId = context.session.user.id;
		try {
			let post = yield this.feedService.createPost( userId, context.request.fields );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const feedService = FeedService.instance;
			this.singleton = new FeedController( feedService );
		}
		return this.singleton;
	}

}

module.exports = FeedController;