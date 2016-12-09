/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('../services/user');
const NotificationService = require('./notification');

const striptags = require('striptags');

class MessageService {
	
	constructor( databaseProvider, userService, notificationService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.notificationService = notificationService;
	}

	getThreadsByUserAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message-thread' );
		return MessageThreadModel.findAll({
			where: {
				$or: [
					{
						userId: userId
					},
					{
						recipientId: userId
					}
				]
			},
			limit: 20,
			offset: (( page - 1 ) * 20),
			order: [['id', 'DESC']]
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return Promise.all(models.map((model) => {
				return this._createThreadModelFromDBModel( userId, model.get() );
			}));
		});
	}

	_createThreadModelFromDBModel( userId, model ) {
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		let recipientId = model.userId == userId ? model.recipientId : model.userId;
		return this.userService.getUserAuthorViewById( recipientId ).then((recipient) => {
			delete model.userId;
			delete model.recipientId;
			model.recipient = recipient;
			return MessageModel.findOne({
				where: {
					threadId: model.id
				},
				order: [['id', 'DESC']]
			}).then(( message ) => {
				model.lastMessage = message.get();
				return this.userService.getUserAuthorViewById( model.lastMessage.userId );
			}).then((author) => {
				model.lastMessage.author = author;
				delete model.userId;
				return model;
			});
		});
	}

	_createMessageModelFromDBModel( model ) {
		return this.userService.getUserAuthorViewById( model.userId ).then((author) => {
			model.author = author;
			delete model.userId;
			return model;
		});
	}

	getThreadByUserAndRecipientAndPage( userId, recipientId, page ) {
		page = isNaN( page ) ? 1 : page;
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message-thread' );
		return MessageThreadModel.findOne({
			where: {
				$or: [
					{
						userId: userId,
						recipientId: recipientId
					},
					{
						userId: recipientId,
						recipientId: userId
					}
				]
			}
		}).then((thread) => {
			if( !thread ) {
				throw new Error('Not found');
			}
			thread = thread.get();
			return MessageModel.findAll({
				where: {
					threadId: thread.id
				},
				limit: 10,
				offset: (( page - 1 ) * 10),
				order: [['id', 'DESC']]
			}).then((models) => {
				if( !models ) {
					return [];
				}
				return this.touchMessages( recipientId, models[0].get('id') ).then(() => {
					return Promise.all(models.map((model) => {
						return this._createMessageModelFromDBModel( model.get() );
					}));
				});
			});
		});
	}

	touchMessages( recipientId, lastId ) {
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		return MessageModel.update({
			seen: true
		},{
			where: {
				userId: recipientId,
				id: {
					$lte: lastId
				}
			}
		});
	}

	getUnreadMessageCountByUser( userId ) {
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message-thread' );
		return MessageThreadModel.findAll({
			where: {
				$or: [
					{
						userId: userId
					},
					{
						recipientId: userId
					}
				]
			},
			attributes: ['id']
		}).then((ids) => {
			ids = ids.map(id => id.get('id'));
			console.log('iiiiiii', ids);
			return MessageModel.count({
				where: {
					threadId: ids,
					userId: {
						$ne: userId
					},
					seen: false
				}
			});
		});
	}

	createThread( userId, recipientId ) {
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message-thread' );
		return MessageThreadModel.create({
			userId: userId,
			recipientId: recipientId
		}).then( m => m.get() );
	}

	getThreadByUserAndRecipient( userId, recipientId ) {
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message-thread' );
		return MessageThreadModel.findOne({
			where: {
				$or: [
					{
						userId: userId,
						recipientId: recipientId
					},
					{
						userId: recipientId,
						recipientId: userId
					}
				]
			}
		}).then((thread) => {
			if( !thread ) {
				throw new Error('Not found');
			}
			return thread.get();
		});	
	}

	createMessage( userId, recipientId, content ) {
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		return this.getThreadByUserAndRecipient( userId, recipientId ).catch(() => {
			return this.createThread( userId, recipientId );
		}).then((thread) => {
			return MessageModel.create({
				userId: userId,
				threadId: thread.id,
				message: striptags( content )
			});
		}).then((message) => {
			this.notificationService.createNotification( recipientId, this.notificationService.NOTIFICATION_TYPE.NEW_MESSAGE, {
				user: {
					id: userId
				}
			});
			return this._createMessageModelFromDBModel( message.get() );
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const notificationService = NotificationService.instance;
			this.singleton = new MessageService( databaseProvider, userService, notificationService );
		}
		return this.singleton;
	}

}

module.exports = MessageService;