/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');

class MessageService {
	
	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
	}

	getThreadsByUserAndPage( userId, recipientId, page ) {

	}

	getThreadByUserAndRecipientAndPage( userId, recipientId, page ) {
		page = isNaN( page ) ? 1 : page;
		const MessageThreadModel = this.databaseProvider.getModelByName( 'message' );
		return MessageThreadModel.findAll({
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
			},
			attributes: ['id'],
			limit: 20,
			offset: (( page - 1 ) * 20)
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return Promise.all(models.map((model) => {
				return this._createThreadModelFromDBModel( model.get() );
			}));
		})
	}

	_createThreadModelFromDBModel( model ) {
		return new Promise((resolve, reject) => {
			resolve(model);
		});
	}

	createMessage( userId, recipientId, content ) {

	}

	viewMessage( userId, messageId ) {

	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new MessageService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = MessageService;