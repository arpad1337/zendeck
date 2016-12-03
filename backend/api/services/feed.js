/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const GroupService = require('./group'); 
const FriendService = require('./friend'); 
const PostService = require('./post');
const CollectionService = require('./collection');
const AttachmentService = require('./attachment');
const Util = require('../../util/util');

class FeedService {

	constructor( databaseProvider, collectionService, friendService, groupService, postService, attachmentService ) {
		this.databaseProvider = databaseProvider;
		this.collectionService = collectionService;
		this.friendService = friendService;
		this.groupService = groupService;
		this.postService = postService;
		this.attachmentService = attachmentService;
	}

	getUserPostsFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.postService.getPostIdsByUserIdAndPage( userId ).then((postIds) => {
			return FeedModel.findAll({
				attributes: ['postId','liked'],
				where: {
					userId: userId,
					postId: postIds
				},
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id','liked']
			}).then(this._createPostViewsFromDBModels);
		});
	}

	getUserFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			attributes: ['postId','liked'],
			where: {
				userId: userId,
				approved: true
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [[ 'post_id', 'DESC' ]],
			group: ['post_id','liked']
		}).then(this._createPostViewsFromDBModels);
	}

	getUserLikedFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			attributes: ['postId','liked'],
			where: {
				userId: userId,
				liked: true,
				approved: true
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [[ 'post_id', 'DESC' ]],
			group: ['post_id','liked']
		}).then(this._createPostViewsFromDBModels);
	}

	getGroupFeedByIdAndPage( userId, slug, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.groupService.getGroupBySlug( slug ).then((group) => {
			return Promise.all([
				this.groupService.isUserAdminOfGroup( userId, group.id ),
				this.groupService.isUserMemberOfGroup( userId, group.id )
			]).then((values) => {
				let isAdmin = values[0];
				let isMember = values[1];
				let where = {
					userId: userId,
					groupId: groupId
				};
				if( !isAdmin && !isMember && !group.isOpen ) {
					throw new Error('Unauthorized');
				}
				if( !isAdmin ) {
					where.approved = true;
				}
				return FeedModel.findAll({
					attributes: ['postId','liked'],
					where: where,
					limit: PostService.LIMIT,
					offset: (( page - 1 ) * PostService.LIMIT),
					order: [[ 'post_id', 'DESC' ]],
					group: ['post_id','liked']
				}).then(this._createPostViewsFromDBModels);
			})
		});
	}

	getUserCollectionFeedByIdAndCollectionIdAndPage( userId, collectionId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.collectionService.getCollectionIdsRecursivellyByCollectionId( collectionId ).then(( collectionIds ) => {
			return FeedModel.findAll({
				attributes: ['postId','liked'],
				where: {
					userId: userId,
					collectionId: collectionId,
					approved: true
				},
				limit: PostService.LIMIT,
				offset: (( page - 1 ) * PostService.LIMIT),
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id','liked']
			});
		}).then(this._createPostViewsFromDBModels);
	}

	_createPostViewsFromDBModels( posts ) {
		let postsMap = new Map();
		if( !posts || posts.length == 0 ) {
			return [];
		}
		let postIds = posts.map((post) => {
			postsMap.set( post.get('postId'), post );
			return post.get('postId');
		});
		return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
			return postModels.map(( model ) => {
				model.liked = postsMap.get( model.id ).get('liked');
				model.starred = !!postsMap.get( model.id ).get('collectionId');
				return model;
			});
		});
	}

	createPost( userId, payload ) {
		/*
		
			{
			    "content": "Test",
			    "urls": [],
			    "tags": [
			        "article",
			        "video"
			    ],
			    "preview": false // index,
			    "group": "slug"
			}

		 */
		 let model = {
		 	content: payload.content,
		 	urls: payload.urls,
		 	tags: payload.tags || []
		 }
		 let promise;
		 if( !isNaN(payload.preview) ) {
		 	let url = payload.urls[ payload.preview ];
		 	if( url ) {
		 		promise = this.attachmentService.getAttachmentByUrl( url ).then((attachment) => {
			 		if( attachment ) {
			 			model.attachmentId = attachment.id;
			 		} else {
			 			return this.attachmentService.scrapeUrl( url ).then(( content ) => {
			 				return this.attachmentService.createAttachment( Object.assign( content.meta, { tags: payload.tags || [] }) ).then((attachmentId) => {
			 					model.attachmentId = attachmentId;
			 				});
			 			});
			 		}
			 	});
		 	}
		 }
 		 if( payload.group ) {
 			if( promise ) {
 				promise.then( _ => {
 					return this.groupService.getGroupBySlug( payload.group ).then((group) => {
 						if( model.isModerated ) {
 							model.approved = false;
 						}
	 					model.groupId = group.id;
	 				});	
 				});
 			} else {
 				promise = this.groupService.getGroupBySlug( payload.group ).then((group) => {
 					if( model.isModerated ) {
 						model.approved = false;
 					}
 					model.groupId = group.id;
 				});
 			}
 		}

 		if( promise ) {
 			return promise.then(() => {
 				return this.postService.createPost( userId, model ).then((newModel) => {
		 			return this.addPostToFeeds( userId, newModel.id, newModel.groupId ).then(() => {
		 				return newModel;
		 			});
		 		});
 			});
 		} else {
 			return this.postService.createPost( userId, model ).then((newModel) => {
	 			return this.addPostToFeeds( userId, newModel.id, newModel.groupId ).then(() => {
	 				return newModel;
	 			});
	 		});
 		}
	}

	approvePost( userId, postId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ approved: true }, {
			where: {
				userId: userId,
				postId: postId,
				groupId: groupId
			}
		});
	}

	//

	addPostToCollection( userId, postId, collectionId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ collectionId: collectionId }, {
			where: {
				userId: userId,
				postId: postId,
				groupId: groupId
			}
		});
	}

	deleteAllFromCollection( collectionId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				collectionId: collectionId
			}
		});
	}

	removePostFromCollection( userId, postId, collectionId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ collectionId: null }, {
			where: {
				userId: userId,
				postId: postId,
				collectionId: collectionId
			}
		});
	}

	addPostToFeeds( userId, postId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		let promises = [
			this.friendService.getAllFriendIdsByUserId( userId ),
		];
		if( groupId ) {
			promises.push(
				this.groupService.getAllMembersById( groupId )
			);
		}
		return Promise.all(promises).then((userIds) => {
			userIds = Util.flattenArrayOfArrays( userIds );
			userIds.push( userId );
			let bulk = [];
			let idSet = new Set();
			userIds.forEach((id) => {
				if( idSet.has(id) ) {
					return;
				}
				idSet.add(id);
				let model = {
					userId: id,
					postId: postId,
					liked: false
				};
				if( groupId ) {
					model.groupId = groupId;
				}
				bulk.push(model);
			});
			return FeedModel.bulkCreate( bulk );
		});
	}

	deletePost( userId, postId ) {
		return this.postService.deletePost( userId, postId ).then(() => {
			return this.removePostFromFeedsById( postId );
		});
	}

	removePostFromFeedsById( postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				postId: postId
			}
		});
	}

	likePostByUserId( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({liked: true}, {
			where: {
				userId: userId,
				postId: postId
			}
		});
	}

	unlikePostByUserId( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({liked: false}, {
			where: {
				userId: userId,
				postId: postId
			}
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const collectionService = CollectionService.instance;
			const friendService = FriendService.instance;
			const groupService = GroupService.instance;
			const postService = PostService.instance;
			const attachmentService = AttachmentService.instance;
			this.singleton = new FeedService( databaseProvider, collectionService, friendService, groupService, postService, attachmentService );
		}
		return this.singleton;
	}
}

module.exports = FeedService;