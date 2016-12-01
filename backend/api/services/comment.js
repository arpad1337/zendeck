/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user'); 

class CommentService {
	
	static get LIMIT() {
		return 10;
	}

	constructor( databaseProvider, userService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
	}

	getCommentsByPostIdAndPage( postId, page ) {
		page = isNaN(page) ? 1 : page;
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.findAll({
			where: {
				postId: postId
			},
			limit: CommentService.limit,
			offset: ( page - 1 ) * CommentService.LIMIT + 3,
			order: [
				['created_at', 'DESC']
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
			}
			resolve([]);
		});
	}

	commentOnPost( userId, postId, content ) {
		const CommentModel = this.databaseProvider.getModelByName( 'comment' );
		return CommentModel.create({
			userId: userId,
			postId: postId,
			content: content
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
			attributes: [
				[
					this.databaseProvider.Sequelize.fn('COUNT', this.databaseProvider.Sequelize.col('id')), 'count'
				]
			],
			where: {
				postId: postId
			}
		}).then(( r ) => {
			if(r) {
				return r.get( 'count' );
			}
			return 0;
		});
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
			if( models ) {
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