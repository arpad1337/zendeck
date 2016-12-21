/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const NotificationService = require('./notification');
const UserService = require('./user'); 
const CommentService = require('./comment'); 
const GroupService = require('./group'); 
const AttachmentService = require('./attachment');

const striptags = require('striptags');

class PostService {
	
	static get LIMIT() {
		return 20;
	}

	static get HISTORY_LIMIT() {
		return 500;
	}

	constructor( databaseProvider, userService, commentService, groupService, attachmentService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.commentService = commentService;
		this.groupService = groupService;
		this.attachmentService = attachmentService;
	}

	get notificationService() {
		if( !this._notificationService ) {
			this._notificationService = NotificationService.instance;
		}
		return this._notificationService;
	}

	getPostById( id ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findOne({
			where: {
				id: id
			}
		}).then((model) => {
			if( !model ) {
				return null;
			}
			return model.get();
		})
	}

	getCommentsForPost( postId, page ) {
		return this.commentService.getCommentsByPostIdAndPage( postId, page );
	}

	commentOnPost( userId, postId, content ) {
		return this.commentService.commentOnPost( userId, postId, content );
	}

	deleteCommentOnPost( userId, postId, commentId ) {
		return this.commentService.deleteComment( userId, postId, commentId );
	}

	createPost( userId, payload ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.create({
			userId: userId,
			tags: payload.tags,
			content: striptags(payload.content).substr(0, 1000),
			urls: payload.urls,
			attachmentId: payload.attachmentId,
			groupId: payload.groupId
		}).then((model) => {
			return this.getExtendedPostModelById( model.get('id') ).then((n) => {
				this.userService.incrementStats( userId, model.get('tags') );
				if( payload.groupId ) {
					this.groupService.incrementStats( payload.groupId, model.get('tags') );
				}
				if( n.inGroup && n.group.isModerated ) {
					return this.notificationService.createNotification( n.group.userId, this.notificationService.NOTIFICATION_TYPE.GROUP_POST_REQUEST, {
						user: {
							id: userId
						},
						group: {
							id: n.group.id
						}
					}).then(() => {
						return n;
					});
				}
				return n;
			});
		});
	}

	deletePost( userId, postId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.destroy({
			where: {
				userId: userId,
				id: postId
			}
		});
	}

	getPostIdsByGroupIdAndPage( groupId, page ) {
		page = isNaN( page ) ? 1 : page;
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				groupId: groupId
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [['created_at', 'DESC']]
		}).then(( models ) => {
			if( models ) {
				return models.map(( m ) => m.get('id'));
			}
			return [];
		});
	}

	getPostIdsByUserIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				userId: userId,
				groupId: null,
			},
			limit: PostService.LIMIT,
			offset: (( page - 1 ) * PostService.LIMIT),
			order: [['created_at', 'DESC']]
		}).then(( models ) => {
			if( models ) {
				return models.map(( m ) => m.get('id'));
			}
			return [];
		});
	}

	getPostIdsByUserId( userId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				userId: userId,
				groupId: null
			},
			attributes: ['id','userId'],
			limit: PostService.HISTORY_LIMIT,
			offset: 0,
			raw: true,
			order: [['created_at', 'DESC']]
		}).then(( models ) => {
			if( models ) {
				return models.map(m => m.id);
			}
			return [];
		});
	}

	getPostIdsByCurrentUserIdAndPage( userId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				userId: userId
			},
			attributes: ['id','userId'],
			limit: PostService.HISTORY_LIMIT,
			offset: 0,
			raw: true,
			order: [['created_at', 'DESC']]
		}).then(( models ) => {
			if( models ) {
				return models.map(m => m.id);
			}
			return [];
		});
	}

	getPostIdsAndAuthorByGroupId( groupId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				groupId: groupId
			},
			attributes: ['id','userId'],
			limit: PostService.HISTORY_LIMIT,
			offset: 0,
			raw: true,
			order: [['created_at', 'DESC']]
		}).then(( models ) => {
			if( models ) {
				return models;
			}
			return [];
		});
	}

	getExtendedPostModelById( id ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findOne({
			where: {
				id: id
			}
		}).then((model) => {
			model = model.get();
			return this.userService.getUserById( model.userId ).then((user) => {
				model.author = user;
				delete model.userId;
				if( model.groupId ) {
					return this.groupService.getGroupById( model.groupId ).then((group) => {
						model.inGroup = true;
						model.group = group;
						delete model.groupId;
						return model;
					});
				}
				return model;
			}).then(() => {
				if( model.attachmentId ) {
					return this.attachmentService.getAttachmentById( model.attachmentId ).then((attachment) => {
						model.attachment = attachment;
						delete model.attachmentId;
						return model;
					});
				}
				return model;
			}).then(() => {
				return model;
			});
		}).then((model) => {
			return model;
		});
	}

	getPostsByPostIds( ids ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.findAll({
			where: {
				id: ids
			},
			order: [['id', 'DESC']]
		}).then((posts) => {
			if( posts && posts.length > 0 ) {
				posts = posts.map(m => m.get());
				let users = new Map();
				let groups = new Map();
				let attachments = new Map();
				let userIds = new Set();
				let groupIds = new Set();
				let attachmentIds = new Set();
				let commentPromises = [];
				posts.forEach(( post ) => {
					userIds.add( post.userId );
					if( post.groupId ) {
						groupIds.add( post.groupId );
					}
					if( post.attachmentId ) {
						attachmentIds.add( post.attachmentId );
					}
					commentPromises.push( this.commentService.getLastThreeCommentsByPostId( post.id ) );
				});

				// TODO: bulk select

				let userPromise = this.userService.getUsersAuthorViewByIds( Array.from( userIds ) );
				let groupPromise = this.groupService.getGroupsByIds( Array.from( groupIds ) );
				let attachmentPromise = this.attachmentService.getAttachmentsByIds( Array.from( attachmentIds ) );

				//

				let promises = [ userPromise, groupPromise, attachmentPromise ];

				return Promise.all( promises ).then((values) => {
					let userModels = values[0];
					let groupModels = values[1];
					let attachmentModels = values[2];
					userModels.forEach((model) => {
						users.set( model.id, model );
					});
					groupModels.forEach((model) => {
						groups.set( model.id, model );
					});
					attachmentModels.forEach((model) => {
						attachments.set( model.id, model );
					});
					return Promise.all(commentPromises);
				}).then((comments) => {
					return posts.map((post, index) => {
						post.author = users.get( post.userId );
						delete post.userId;
						if( post.groupId ) {
							post.group = groups.get( post.groupId );
							post.inGroup = true;
						}
						delete post.groupId;
						if( post.attachmentId ) {
							post.attachment = attachments.get( post.attachmentId );
						}
						delete post.attachmentId;
						post.comments = comments[ index ];
						return post;
					});
				});
			}
			return [];
		});
	}

	likePost( postId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return this.getPostById( postId ).then((post) => {
			return PostModel.update({likes: post.likes + 1}, {
				where: {
					id: postId
				}
			});
		});
	}

	dislikePost( postId ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return this.getPostById( postId ).then((post) => {
			return PostModel.update({likes: post.likes - 1}, {
				where: {
					id: postId
				}
			});
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const commentService = CommentService.instance;
			const groupService = GroupService.instance;
			const attachmentService = AttachmentService.instance;
			this.singleton = new PostService( databaseProvider, userService, commentService, groupService, attachmentService );
		}
		return this.singleton;
	}

}

module.exports = PostService;