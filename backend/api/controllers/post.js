/*
 * @rpi1337
 */

const PostService = require('../services/post');
const AttachmentService = require('../services/attachment');

class PostController {

	constructor( postService, attachmentService ) {
		this.postService = postService;
		this.attachmentService = attachmentService;
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

	*deleteComment( context ) {
		let userId = context.session.user.id;
		let postId = context.params.postId;
		let commentId = context.params.commentId;
		try {
			let post = yield this.postService.deleteCommentOnPost( userId, postId, commentId );
			context.body = post;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getCommentsForPost( context ) {
		let userId = context.session.user.id;
		let postId = context.params.postId;
		try {
			let comments = yield this.postService.getCommentsForPost( postId, context.query.page );
			context.body = comments;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*scrapeUrl( context ) {
		try {
			let data = yield this.attachmentService.scrapeUrl( context.request.fields.url );
			context.body = data;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const postService = PostService.instance;
			const attachmentService = AttachmentService.instance;
			this.singleton = new PostController( postService, attachmentService );
		}
		return this.singleton;
	}

}

module.exports = PostController;