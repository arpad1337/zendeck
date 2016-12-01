/*
 * @rpi1337
 */

const PostService = require('../services/post');

class PostController {

	constructor( postService ) {
		this.postService = postService;
	}

	*commentOnPost( context ) {
		let userId = context.session.user.id;
		let postId = context.params.postId;
		try {
			let post = yield this.postService.commentOnPost( userId, postId, context.request.fields.content );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const postService = PostService.instance;
			this.singleton = new PostController( postService );
		}
		return this.singleton;
	}

}

module.exports = PostController;