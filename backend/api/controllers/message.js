/*
 * @rpi1337
 */

const MessageService = require('../services/message');
const UserService = require('../services/user');

class MessageController {

	constructor( messageService, userService ) {
		this.messageService = messageService;
		this.userService = userService;
	}

	*getThreadsByPage( context ) {
		const userId = context.session.user.id;
		try {
			let threads = yield this.messageService.getThreadsByUserAndPage( userId, context.query.page );
			context.body = threads;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*getThreadByRecipientUsername( context ) {
		const userId = context.session.user.id;
		const recipientUsername = context.params.username;
		try {
			const recipient = yield this.userService.getUserByUsername( username );
			let messages = yield this.messageService.getThreadByUserAndRecipientAndPage( userId, recipient.id, context.query.page );
			context.body = messages;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*sendMessage( context ) {
		const userId = context.session.user.id;
		const recipientUsername = context.params.username;
		try {
			const recipient = yield this.userService.getUserByUsername( username );
			let message = yield this.messageService.createMessage( userId, recipient.id, context.request.fields.content );
			context.body = message;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			const messageService = MessageService.instance;
			this.singleton = new MessageController( messageService, userService );
		}
		return this.singleton;
	}

}

module.exports = MessageController;