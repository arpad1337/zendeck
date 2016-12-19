/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const GroupService = require('./group'); 
const FriendService = require('./friend'); 
const PostService = require('./post');
const CollectionService = require('./collection');
const AttachmentService = require('./attachment');
const FilterService = require('./filter');
const NotificationService = require('./notification');

const Util = require('../../util/util');

class FeedService {

	constructor( databaseProvider, collectionService, friendService, groupService, postService, attachmentService, filterService ) {
		this.databaseProvider = databaseProvider;
		this.collectionService = collectionService;
		this.friendService = friendService;
		this.groupService = groupService;
		this.postService = postService;
		this.attachmentService = attachmentService;
		this.filterService = filterService;

		this._createPostViewsFromDBModels = this._createPostViewsFromDBModels.bind( this );
	}

	get notificationService() {
		if( !this._notificationService) {
			this._notificationService = NotificationService.instance;
		}
		return this._notificationService;
	}

	getUserPostsFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.postService.getPostIdsByUserIdAndPage( userId ).then((postIds) => {
			return FeedModel.findAll({
				attributes: ['postId','liked', 'collectionId'],
				where: {
					userId: userId,
					postId: postIds
				},
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id','liked', 'collection_id']
			}).then(this._createPostViewsFromDBModels);
		});
	}

	getCurrentUserPostsFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.postService.getPostIdsByCurrentUserIdAndPage( userId ).then((postIds) => {
			return FeedModel.findAll({
				attributes: ['postId','liked', 'collectionId'],
				where: {
					userId: userId,
					postId: postIds
				},
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id','liked', 'collection_id']
			}).then(this._createPostViewsFromDBModels);
		});
	}

	getUserFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			attributes: ['postId','liked', 'collectionId'],
			where: {
				userId: userId,
				approved: true
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [[ 'post_id', 'DESC' ]],
			group: ['post_id','liked', 'collection_id']
		}).then(this._createPostViewsFromDBModels);
	}

	getUserLikedFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			attributes: ['postId','liked', 'collectionId'],
			where: {
				userId: userId,
				liked: true,
				approved: true
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [[ 'post_id', 'DESC' ]],
			group: ['post_id','liked', 'collection_id']
		}).then(this._createPostViewsFromDBModels);
	}

	getFriendLikedFeedByIdAndPage( userId, friendId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			attributes: ['postId','liked', 'collectionId'],
			where: {
				userId: friendId,
				liked: true,
				approved: true
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [[ 'post_id', 'DESC' ]],
			group: ['post_id','liked', 'collection_id']
		}).then((posts) => {
			if( !posts || posts.length == 0 ) {
				return [];
			}
			let postIds = posts.map((post) => {
				return post.get('postId');
			});
			return FeedModel.findAll({
				where: {
					userId: userId,
					postId: postIds
				}
			}).then((sharedPosts) => {
				let sharedPostMap = new Map();
				sharedPosts.forEach((post) => {
					sharedPostMap.set( post.get('postId'), post );
				});
				return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
					return postModels.map(( model ) => {
						if( sharedPostMap.get(model.id) ) {
							model.liked = sharedPostMap.get( model.id ).get('liked');
							model.starred = !!sharedPostMap.get( model.id ).get('collectionId');
						} else {
							model.liked = false;
							model.starred = false;
						}
						return model;
					});
				});
			});
		});;
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
				if( !isAdmin && !isMember && !group.isOpen ) {
					throw new Error('Unauthorized');
				}
				let where = {
					userId: userId
				};
				if( !isAdmin ) {
					where.approved = true;
				}
				return this.postService.getPostIdsByGroupIdAndPage( group.id, page ).then((ids) => {
					where.postId = ids;
					return FeedModel.findAll({
						attributes: ['postId','liked', 'collectionId'],
						where: where,
						order: [[ 'post_id', 'DESC' ]],
						group: ['post_id','liked', 'collection_id']
					}).then(this._createPostViewsFromDBModels);
				});
			})
		});
	}

	getGroupLikedFeedByIdAndPage( userId, slug, page ) {
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
					//userId: userId,
					groupId: group.id,
					liked: true
				};
				if( !isAdmin && !isMember && !group.isOpen ) {
					throw new Error('Unauthorized');
				}
				if( !isAdmin ) {
					where.approved = true;
				}
				return FeedModel.findAll({
					attributes: ['postId','liked', 'collection_id'],
					where: where,
					limit: PostService.LIMIT,
					offset: (( page - 1 ) * PostService.LIMIT),
					order: [[ 'post_id', 'DESC' ]],
					group: ['post_id','liked', 'collection_id']
				}).then(this._createPostViewsFromDBModels);
			})
		});
	}

	getUserCollectionFeedByIdAndCollectionIdAndPage( userId, collectionId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.collectionService.getCollectionIdsRecursivellyByCollectionId( collectionId ).then(( collectionIds ) => {
			console.log("\n\n\n", collectionIds);
			console.log("\n\n\n");

			return FeedModel.findAll({
				attributes: ['postId', 'collectionId'],
				where: {
					//userId: userId,
					collectionId: collectionIds,
					approved: true
				},
				limit: PostService.LIMIT,
				offset: (( page - 1 ) * PostService.LIMIT),
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id', 'collection_id']
			});
		}).then((posts) => {
			if( !posts || posts.length == 0 ) {
				return [];
			}
			let postIds = posts.map((post) => {
				return post.get('postId');
			});
			return FeedModel.findAll({
				where: {
					userId: userId,
					postId: postIds
				}
			}).then((sharedPosts) => {
				let sharedPostMap = new Map();
				sharedPosts.forEach((post) => {
					sharedPostMap.set( post.get('postId'), post );
				});
				return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
					return postModels.map(( model ) => {
						if( sharedPostMap.get(model.id) ) {
							model.liked = sharedPostMap.get( model.id ).get('liked');
							model.starred = !!sharedPostMap.get( model.id ).get('collectionId');
						} else {
							model.liked = false;
							model.starred = false;
						}
						return model;
					});
				});
			});
		});
	}

	getGroupCollectionFeed( userId, groupId, collectionId, page ) {
		page = isNaN( page ) ? 1 : page;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.collectionService.getCollectionIdsRecursivellyByCollectionId( collectionId ).then(( collectionIds ) => {
			return FeedModel.findAll({
				attributes: ['postId', 'collectionId'],
				where: {
					groupId: groupId,
					collectionId: collectionIds,
					approved: true
				},
				limit: PostService.LIMIT,
				offset: (( page - 1 ) * PostService.LIMIT),
				order: [[ 'post_id', 'DESC' ]],
				group: ['post_id', 'collection_id']
			});
		}).then((posts) => {
			if( !posts || posts.length == 0 ) {
				return [];
			}
			let postIds = posts.map((post) => {
				return post.get('postId');
			});
			return FeedModel.findAll({
				where: {
					userId: userId,
					postId: postIds
				}
			}).then((sharedPosts) => {
				let sharedPostMap = new Map();
				sharedPosts.forEach((post) => {
					sharedPostMap.set( post.get('postId'), post );
				});
				return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
					return postModels.map(( model ) => {
						if( sharedPostMap.get(model.id) ) {
							model.liked = sharedPostMap.get( model.id ).get('liked');
							model.starred = !!sharedPostMap.get( model.id ).get('collectionId');
						} else {
							model.liked = false;
							model.starred = false;
						}
						return model;
					});
				});
			});
		});
	}

	// getFriendCollectionFeedByIdAndCollectionIdAndPage( userId, friendId, collectionId, page ) {
	// 	page = isNaN( page ) ? 1 : page;
	// 	const FeedModel = this.databaseProvider.getModelByName( 'feed' );
	// 	return this.collectionService.getCollectionIdsRecursivellyByCollectionId( collectionId ).then(( collectionIds ) => {
	// 		return FeedModel.findAll({
	// 			attributes: ['postId','liked', 'collectionId'],
	// 			where: {
	// 				userId: friendId,
	// 				collectionId: collectionIds,
	// 				approved: true
	// 			},
	// 			limit: PostService.LIMIT,
	// 			offset: (( page - 1 ) * PostService.LIMIT),
	// 			order: [[ 'post_id', 'DESC' ]],
	// 			group: ['post_id','liked', 'collection_id']
	// 		});
	// 	}).then((posts) => {
	// 		if( !posts || posts.length == 0 ) {
	// 			return [];
	// 		}
	// 		let postIds = posts.map((post) => {
	// 			return post.get('postId');
	// 		});
	// 		return FeedModel.findAll({
	// 			where: {
	// 				userId: userId,
	// 				postId: postIds
	// 			}
	// 		}).then((sharedPosts) => {
	// 			let sharedPostMap = new Map();
	// 			sharedPosts.forEach((post) => {
	// 				sharedPostMap.set( post.get('postId'), post );
	// 			});
	// 			return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
	// 				return postModels.map(( model ) => {
	// 					if( sharedPostMap.get(model.id) ) {
	// 						model.liked = sharedPostMap.get( model.id ).get('liked');
	// 						model.starred = !!sharedPostMap.get( model.id ).get('collectionId');
	// 					} else {
	// 						model.liked = false;
	// 						model.starred = false;
	// 					}
	// 					return model;
	// 				});
	// 			});
	// 		});
	// 	});
	// }

	getUserPostsByUserAndFilteredPostIds( userId, postIds ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findAll({
			userId: userId,
			postId: postIds
		}).then((postsInFeed) => {
			postsInFeed = postsInFeed || [];
			let postsInFeedMap = new Map();
			postsInFeed.forEach((post) => {
				post = post.get();
				postsInFeedMap.set( post.id, post );
			});
			return this.postService.getPostsByPostIds( postIds ).then((postModels) => {
				return postModels.map(( model ) => {
					let postModel = postsInFeedMap.get( model.id );
					if( postModel ) {
						model.liked = postModel.liked;
						model.starred = !!postModel.collectionId;
					} else {
						model.liked = false;
						model.starred = false;
					}
					return model;
				});
			});
		});
	}

	getPostById( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return Promise.all([
			this.postService.getExtendedPostModelById( postId ),
			FeedModel.findOne({
				where: {
					userId: userId,
					postId: postId
				}
			})
		]).then((values) => {
			let post = values[0];
			if( values[1] ) {
				post.liked = values[1].liked;
				post.starred = !!values[1].collectionId;
			}
			return post;
		});
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
		if( payload.groupId ) {
			model.groupId = payload.groupId
		}

 		if( promise ) {
 			return promise.then(() => {
 				return this.postService.createPost( userId, model ).then((newModel) => {
		 			return this.addPostToFeeds( userId, newModel.id, payload.groupId ).then(() => {
		 				this.filterService.storeTagsByPostId( newModel.id, newModel.tags, payload.groupId );
		 				return newModel;
		 			});
		 		});
 			});
 		} else {
 			return this.postService.createPost( userId, model ).then((newModel) => {
	 			return this.addPostToFeeds( userId, newModel.id, payload.groupId ).then(() => {
	 				this.filterService.storeTagsByPostId( newModel.id, newModel.tags, payload.groupId );
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

	addPostToCollection( userId, postId, collectionId, groupId ) {
		let where = {
			postId: postId
		};
		if( !groupId ) {
			where.userId = userId;
		} else {
			where.groupId = groupId;
		}
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ collectionId: collectionId }, {
			where: where
		}).then((_) => true);
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
		if( groupId ) {
			return Promise.all([
				this.groupService.getGroupById( groupId ),
				this.groupService.isUserMemberOfGroup( userId, groupId )
			]).then((values) => {
				let group = values[0];
				let isMember = values[1];
				let promises = [];
				if( group.isOpen && isMember ) {
					promises.push(
						this.friendService.getAllFriendIdsByUserId( userId )
					);
				}
				promises.push(
					this.groupService.getAllMembersById( groupId )
				);
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
							authorId: userId,
							userId: id,
							postId: postId,
							liked: false,
						};
						if( groupId ) {
							model.groupId = groupId;
						}
						bulk.push(model);
					});
					return FeedModel.bulkCreate( bulk );
				});
			});
		}
		let promises = [];
		promises.push(
			this.friendService.getAllFriendIdsByUserId( userId )
		);
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
					authorId: userId,
					userId: id,
					postId: postId,
					liked: false,
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
		return this.postService.getPostById( postId ).then((post) => {
			const FeedModel = this.databaseProvider.getModelByName( 'feed' );
			return FeedModel.findOne({
				where: {
					userId: userId,
					postId: postId
				}
			}).then((model) => {
				if( model ) {
					return FeedModel.update({
						liked: true
					}, {
						where: {
							userId: userId,
							postId: postId
						}
					});
				} else {
					return FeedModel.create({
						liked: true,
						userId: userId,
						postId: postId,
						authorId: post.userId
					});
				}
			}).then((model) => {
				this.postService.likePost( postId );
				if( post.userId !== userId ) {
					this.notificationService.createNotification( post.userId, this.notificationService.NOTIFICATION_TYPE.POST_LIKE, {
						user: {
							id: userId
						},
						post: {
							id: postId
						}
					});
				}
				return model;
			});
		});
	}

	dislikePostByUserId( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({liked: false}, {
			where: {
				userId: userId,
				postId: postId
			}
		}).then((_) => {
			this.postService.dislikePost( postId );
			return _;
		});
	}

	getPostLikeCountByPostId( postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.count({
			where: {
				postId: postId,
				liked: true
			}
		});
	}

	checkPostInGroup( postId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.findOne({
			where: {
				groupId: groupId,
				postId: postId,
				approved: true
			}
		}).then((r) => !!r);
	}

	userFollowOther( userId, otherId ) {
		return new Promise((resolve, reject) => {	
			const FeedModel = this.databaseProvider.getModelByName( 'feed' );
			return this.postService.getPostIdsByUserId(otherId).then((ids) => {
				let buffer = [];
				ids.forEach((id, index) => {
					buffer.push({
						userId: userId,
						postId: id,
						authorId: otherId
					});
					if( index === PostService.LIMIT - 1 ) {
						FeedModel.bulkCreate( buffer.splice(0, PostService.LIMIT) ).then(resolve);
					}
				});
				if( ids.length < PostService.LIMIT ) {
					resolve();
				}
				return FeedModel.bulkCreate( buffer );
			}).catch(reject);
		});
	}

	userUnfollowOther( userId, otherId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				userId: userId,
				authorId: otherId
			}
		});
	}

	userJoinToGroup( userId, groupId ) {
		return new Promise((resolve, reject) => {	
			const FeedModel = this.databaseProvider.getModelByName( 'feed' );
			return this.postService.getPostIdsAndAuthorByGroupId(groupId).then((ids) => {
				let buffer = [];
				ids.forEach((id, index) => {
					buffer.push({
						userId: userId,
						postId: id.id,
						groupId: groupId,
						authorId: id.userId
					});
					if( index === PostService.LIMIT - 1 ) {
						FeedModel.bulkCreate( buffer.splice(0, PostService.LIMIT) ).then(resolve);
					}
				});
				if( ids.length < PostService.LIMIT ) {
					resolve();
				}
				return FeedModel.bulkCreate( buffer );
			});
		});
	}

	userLeaveGroup( userId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				userId: userId,
				groupId: groupId
			}
		});
	}

	createCollectionWithParent( userId, newCollectionId) {
		return new Promise((resolve, reject) => {
			return this.collectionService.getCollectionIdsRecursivellyByCollectionId( newCollectionId ).then((collectionIds) => {
				const FeedModel = this.databaseProvider.getModelByName( 'feed' );
				return FeedModel.findAll({
					where: {
						userId: {
							$ne: userId
						},
						collectionId: collectionIds
					},
					attributes: ['postId','authorId','groupId'],
					group: ['postId','authorId','groupId'],
					limit: PostService.HISTORY_LIMIT,
					raw: true
				}).then((ids) => {
					let postIds = ids.map( i => i.postId );
					return FeedModel.destroy({
						where: {
							postId: postIds,
							userId: userId
						},
						force: true
					}).then(() => {
						let buffer = [];
						ids.forEach((id, index) => {
							buffer.push({
								userId: userId,
								postId: id.postId,
								groupId: id.groupId,
								authorId: id.authorId,
								collectionId: newCollectionId,
								approved: true
							});
							if( index === PostService.LIMIT - 1 ) {
								FeedModel.bulkCreate( buffer.splice(0, PostService.LIMIT) ).then(resolve);
							}
						});
						if( ids.length < PostService.LIMIT ) {
							resolve();
						}
						return FeedModel.bulkCreate( buffer );
					})
				});
			});
		});
	}

	deleteCollectionBySlug( slug ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.collectionService.getCollectionBySlug( slug ).then((collection) => {
			return FeedModel.update({
				collectionId: null
			},{
				where: {
					collectionId: collection.id
				}
			});
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
			const filterService = FilterService.instance;
			this.singleton = new FeedService( 
				databaseProvider, 
				collectionService, 
				friendService, 
				groupService, 
				postService, 
				attachmentService, 
				filterService
			);
		}
		return this.singleton;
	}
}

module.exports = FeedService;
