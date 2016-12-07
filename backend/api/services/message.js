/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('../services/user');

const striptags = require('striptags');

class MessageService {
	
	constructor( databaseProvider, userService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
	}

	getThreadsByUserAndPage( userId, recipientId, page ) {

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
		return this.userService.getUserAuthorViewById( recipientId ).then((resipient) => {
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
				limit: 20,
				offset: (( page - 1 ) * 20),
				order: [['id', 'DESC']]
			}).then((models) => {
				if( !models ) {
					return [];
				}
				return Promise.all(models.map((model) => {
					return this._createMessageModelFromDBModel( userId, model.get() );
				}));
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

	createMessage( userId, recipientId, content ) {
		const MessageModel = this.databaseProvider.getModelByName( 'message' );
		return this.getThreadByUserAndRecipient( userId, recipientId ).catch(() => {
			return this.createThread( userId, recipientId );
		}).then((thread) => {
			return MessageModel.create({
				userId: userId,
				threadId: thread.id,
				content: striptags( content )
			});
		}).then((message) => {
			return this._createMessageModelFromDBModel( message );
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			this.singleton = new MessageService( databaseProvider, userService );
		}
		return this.singleton;
	}

}

module.exports = MessageService;