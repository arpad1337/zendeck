/*
 * @rpi1337
 */

class MenuController {

	static get $inject() {
		return [
			'MessageBusService',
			'MessageService',
			'NotificationService'
		];
	}

	constructor( messageBusService, messageService, notificationService ) {
		this.messageBusService = messageBusService;
		this.messageService = messageService;
		this.notificationService = notificationService;

		this._initState();
	}

	_initState() {
		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.NOTIFICATION, this._onNewNotification.bind(this) );
		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE, this._onNewMessage.bind(this) );


		this.unreadMessageCount = 0;
		this.unreadNotificationCount = 0;
		this.lastNotifications = [];

		this.messageService.getUnreadMessageCount().then((count) => {
			this.unreadMessageCount = count;
		});

		this.notificationService.getUnreadNotificationCount().then((count) => {
			this.unreadNotificationCount = count;
		});

		this.notificationService.getLastNotifications().then((notifications) => {
			notifications.forEach((notif) => {
				this.lastNotifications.push( notif );
			});
		});

		this.notificationService.startPolling();	
	}

	_onNewNotification( notification ) {
		this.unreadNotificationCount++;
		this.lastNotifications.unshift( notification );
	}

	_onNewMessage() {
		this.unreadMessageCount++;
	}

}

export default MenuController;