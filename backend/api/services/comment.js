/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user'); 

const striptags = require('striptags');

class CommentService {
	
	static get LIMIT() {
		return 3;
	}

	constructor( databaseProvider, userService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
	}

	get postService() {
		if( !this._postService ) {
			this._postService = require('./post').instance;
		}
		return this._postService;
	}

	get notificationService() {
		if( !this._notificationService ) {
			this._notificationService = require('./notification').instance;
		}
		return this._notificationService;
	}

	getCommentsByPostIdAndPage( postId, page ) {
		page = isNaN(page) ? 1 : page;
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.findAll({
			where: {
				postId: postId
			},
			limit: CommentService.LIMIT,
			offset: (( page - 1 ) * CommentService.LIMIT) + 3,
			order: [
				['created_at', 'ASC']
			]
		}).then((models) => {
			return this._createModelsFromArray( models );
		});
	}

	_createModelsFromArray( models ) {
		return new Promise((resolve, reject) => {
			if( models ) {
				models = models.map( m => m.get() );
				let userIds = new Set();
				models.forEach((model) => {
					userIds.add( model.userId );
				});
				this.userService.getUsersByIds( Array.from( userIds ) ).then((users) => {
					let userMap = new Map();
					users.forEach(( user ) => {
						userMap.set( user.id, user );
					});
					models = models.map((model) => {
						model.author = userMap.get( model.userId );
						delete model.userId;
						return model;
					});
					resolve(models);
				}).catch(reject);
				return;
			}
			resolve([]);
		});
	}

	commentOnPost( userId, postId, content ) {
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.create({
			userId: userId,
			postId: postId,
			content: striptags(content).substr(0, 1000)
		}).then((model) => {
			model = model.get();
			return this.postService.getPostById( postId ).then((post) => {
				if( postId.userId == userId ) {
					return true;
				}
				return this.notificationService.createNotification( post.userId, this.notificationService.NOTIFICATION_TYPE.POST_COMMENT, {
					user: {
						id: userId
					},
					post: {
						id: postId
					}
				});
			}).then(() => {			
				return this.userService.getUserById( model.userId ).then((user) => {
					model.author = user;
					delete model.userId;
					return model;
				});
			});
		});
	}

	deleteComment( userId, postId, commentId ) {
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.destroy({
			where: {
				userId: userId,
				postId: postId,
				id: commentId
			}
		});
	}

	getCommentCountByPostId( postId ) {
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.count({
			where: {
				postId: postId
			}
		}).then(( count ) => {
			if(count) {
				return count;
			}
			return 0;
		});
	}

	getDistinctCommentCountByPostId( postId ) {

		let query = `SELECT count("sub"."user_id") AS "count" 
					 FROM ( 
					 	SELECT DISTINCT "user_id" 
					 	FROM "comment" AS "Comment" 
					 	WHERE ("Comment"."deleted_at" IS NULL AND 
					 		   "Comment"."post_id" = ${Number(postId)}) GROUP BY "user_id" 
					 ) as "sub"`;

		return this.databaseProvider.connection.query( query ).then((result) => {
			return result[0][0].count;
		});

		// const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		// return CommentModel.findOne({
		// 	attributes: [
		// 		[ this.databaseProvider.Sequelize.fn('count', this.databaseProvider.Sequelize.col('user_id')), 'count']
		// 	],
		// 	where: {
		// 		postId: postId
		// 	},
		// 	group: ['user_id']
		// }).then(( row ) => {
		// 	if(row) {
		// 		return row.get('count');
		// 	}
		// 	return 0;
		// });
	}

	getLastThreeCommentsByPostId( postId ) {
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.findAll({
			where: {
				postId: postId
			},
			limit: 3,
			offset: 0,
			order: [
				['created_at', 'DESC']
			]
		}).then((models) => {
			if( models && models.length > 0 ) {
				return this._createModelsFromArray( models ).then(( models ) => {
					return this.getCommentCountByPostId( postId ).then(( count ) => {
						return {
							data: models,
							count: count
						}
					});
				});			
			}
			return {
				data: [],
				count: 0
			};
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			this.singleton = new CommentService( databaseProvider, userService );
		}
		return this.singleton;
	}

}

module.exports = CommentService;