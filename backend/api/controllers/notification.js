/*
 * @rpi1337
 */

const NotificationService = require('../services/notification');

class NotificationController {

	constructor( notificationService ) {
		this.notificationService = notificationService;
	}

	*getLastNotifications( context ) {
		const userId = context.session.user.id;
		const lastId = context.query.lastId;
		try {
			let models = yield this.notificationService.getUserLastNotifications( userId, lastId );
			context.body = models;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*getNotificationByPage( context ) {
		const userId = context.session.user.id;
		try {
			let models = yield this.notificationService.getUserNotificationsByPage( userId, context.query.page );
			context.body = models;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*touchNotifications( context ) {
		const userId = context.session.user.id;
		const lastId = context.query.lastId;
		try {
			let model = yield this.notificationService.touchNotifications( userId, lastId );
			context.body = model;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*getUnreadNotificationCount( context ) {
		const userId = context.session.user.id;
		try {
			let count = yield this.notificationService.getUnreadNotificationCount( userId );
			context.body = {
				count: count
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*acceptNotification( context ) {
		const userId = context.session.user.id;
		const notificationId = context.params.notificationId;
		try {
			let result = yield this.notificationService.acceptNotification( userId, notificationId );
			context.body = {
				success: true
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const notificationService = NotificationService.instance;
			this.singleton = new NotificationController( notificationService );
		}
		return this.singleton;
	}

}

module.exports = NotificationController;