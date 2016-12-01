/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user'); 
const CommentService = require('./comment'); 
const GroupService = require('./group'); 
const AttachmentService = require('./attachment');

const striptags = require('striptags');

class PostService {
	
	constructor( databaseProvider, userService, commentService, groupService, attachmentService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.commentService = commentService;
		this.groupService = groupService;
		this.attachmentService = attachmentService;
	}

	createPost( userId, payload ) {
		const PostModel = this.databaseProvider.getModelByName('post');
		return PostModel.create({
			userId: userId,
			tags: payload.tags,
			content: striptags(payload.content),
			urls: payload.urls,
			attachmentId: payload.attachmentId,
			groupId: payload.groupId
		}).then((model) => {
			return this.getExtendedPostModelById( model.get('id') ).then((n) => {
				return n;
			});
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

				console.log("\n\n\n\n",'PPPPPP', posts, "\n\n\n\n")

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
						console.log('???');
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