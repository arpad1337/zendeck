/*
 * @rpi1337
 */

import STATES from '../config/states';

class PostController {

	static get $inject() {
		return [
			'FeedService',
			'ModalService',
			'$state'
		];
	}

	constructor( feedService, modalService, $state ) {
		this.feedService = feedService;
		this.modalService = modalService;
		this.posts = [];

		if( $state && $state.current.name === STATES.POST_VIEW ) {
			this.$state = $state;
			this._loadPost();
		}
	}

	_loadPost() {
		let postId = this.$state.params.postId;
		this.feedService.getPostById( postId ).then((post) => {
			this.posts.push( post );
		});
	}

	likePost( postId ) {
		return this.feedService.likePost( postId );
	}

	commentPost( entryId, comment ) {
		return this.feedService.commentPost( entryId, comment );
	}

	deleteComment( postId, commentId ) {
		return this.feedService.deleteComment( postId, commentId );
	}

	deletePost( postId ) {
		return this.feedService.deletePost( postId ).then(() => {
			let index = -1;
			this.posts.forEach((c, i) => {
				if( c.id == postId ) {
					index = i;
				}
			});
			this.posts.splice( index, 1 );
			return true;
		});
	}

}

export default PostController;