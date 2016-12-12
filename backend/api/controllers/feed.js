/*
 * @rpi1337
 */

const UserService = require('../services/user');
const FeedService = require( '../services/feed' );
const CollectionService = require( '../services/collection' );
const GroupService = require( '../services/group' );

class FeedController {

	constructor( feedService, userService, collectionService, groupService ) {
		this.feedService = feedService;
		this.userService = userService;
		this.collectionService = collectionService;
		this.groupService = groupService;
	}

	*likePost( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		try {
			let liked = yield this.feedService.likePostByUserId( userId, postId );
			context.body = {
				liked: liked
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*dislikePost( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		try {
			let liked = yield this.feedService.dislikePostByUserId( userId, postId );
			context.body = {
				liked: liked
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*getUserPosts( context ) {
		const username = context.params.username;
		try {
			let user = yield this.userService.getUserByUsername( username );
			let posts = yield this.feedService.getUserPostsFeedByIdAndPage( user.id, context.query.page );
			context.body = posts;
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

	*getFriendLikedPosts( context ) {
		const userId = context.session.user.id;
		const username = context.params.username;
		try {
			let user = yield this.userService.getUserByUsername( username );
			let posts = yield this.feedService.getFriendLikedFeedByIdAndPage( userId, user.id, context.query.page );
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

	*getGroupLikedFeed( context ) {
		const userId = context.session.user.id;
		const slug = context.params.groupSlug;
		try {
			let posts = yield this.feedService.getGroupLikedFeedByIdAndPage( userId, slug, context.query.page );
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
			let posts;
			if( collection.userId === userId ) {
				posts = yield this.feedService.getUserCollectionFeedByIdAndCollectionIdAndPage( userId, collection.id, context.query.page );
			} else {
				posts = yield this.feedService.getFriendCollectionFeedByIdAndCollectionIdAndPage( userId, collection.userId, collection.id, context.query.page );
			}
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getGroupCollectionFeed( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;
		const groupSlug = context.params.groupSlug;
		try {
			let collection = yield this.collectionService.getCollectionBySlug( slug );
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isApprovedMember = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isApprovedMember ) {
				throw new Error('Unauthorized');
			}
			let posts = yield this.feedService.getGroupCollectionFeed( userId, group.id, collection.id, context.query.page );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getPostById( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		try {
			let post = yield this.feedService.getPostById( userId, postId );
			context.body = post;
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

	*createPostInGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const payload = context.request.fields;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isApprovedMember = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isApprovedMember ) {
				throw new Error('Unauthorized');
			}
			payload.groupId = group.id;
			let post = yield this.feedService.createPost( userId, payload );
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

	*addPostToCollection( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		const collectionSlug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, collectionSlug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.getCollectionBySlug( collectionSlug );
			let success = yield this.feedService.addPostToCollection( userId, postId, collection.id );
			context.body = success;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*addPostToGroupCollection( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		const groupSlug = context.params.groupSlug;
		const collectionSlug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, collectionSlug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isApprovedMember = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isApprovedMember ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.getCollectionBySlug( collectionSlug );
			let success = yield this.feedService.addPostToCollection( userId, postId, collection.id, group.id );
			context.body = success;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*removePostFromCollection( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		const collectionSlug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, slug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.getCollectionBySlug( collectionSlug );
			let success = yield this.feedService.removePostFromCollection( userId, postId, collection.id );
			context.body = success;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*removePostFromGroupCollection( context ) {
		const userId = context.session.user.id;
		const postId = context.params.postId;
		const groupSlug = context.params.groupSlug;
		const collectionSlug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, collectionSlug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isApprovedMember = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isApprovedMember ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.getCollectionBySlug( collectionSlug );
			let success = yield this.feedService.removePostFromCollection( userId, postId, collection.id, group.id );
			context.body = success;
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
			const groupService = GroupService.instance;
			this.singleton = new FeedController( feedService, userService, collectionService, groupService );
		}
		return this.singleton;
	}

}

module.exports = FeedController;