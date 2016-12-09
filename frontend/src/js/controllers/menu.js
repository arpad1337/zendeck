/*
 * @rpi1337
 */

class MenuController {

	static get $inject() {
		return [
			'$scope',
			'MessageBusService',
			'MessageService',
			'NotificationService',
			'FriendService'
		];
	}

	constructor( $scope, messageBusService, messageService, notificationService, friendService ) {
		this.$scope = $scope;
		this.messageBusService = messageBusService;
		this.messageService = messageService;
		this.notificationService = notificationService;
		this.friendService = friendService;

		this._onNewNotification = this._onNewNotification.bind( this );
		this._onNewMessage = this._onNewMessage.bind( this );
		this._onThreadView = this._onThreadView.bind( this );
		this._initState = this._initState.bind( this );
		this._onLogout = this._onLogout.bind( this );

		this.messageBusService.on( this.messageBusService.MESSAGES.USER.LOGOUT, this._onLogout);
		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.NOTIFICATION, this._onNewNotification );
		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE, this._onNewMessage );
		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.THREAD_VIEW, this._onThreadView );

		this._initState();

		this.$scope.$on('$destroy', this.destructor.bind(this));
	}

	_initState() {
		this.unreadMessageCount = 0;
		this.unreadNotificationCount = 0;
		this.lastNotifications = [];

		this.messageService.getUnreadMessageCount().then((count) => {
			this.unreadMessageCount = count;
		});

		this.notificationService.getLastNotifications().then((notifications) => {
			notifications.forEach((notif) => {
				this.lastNotifications.push( notif );
			});
		});

		this.notificationService.getUnreadNotificationCount().then((count) => {
			this.unreadNotificationCount = count;
		});


		this.notificationService.startPolling();

		this.$scope.$on('$destroy', this.destructor.bind(this));
	}

	touchNotifs() {
		try {
			this.notificationService.touchNotifications().then(() => {
				this.unreadNotificationCount = 0;
			}); 
		} catch( e ) {

		}
	}

	destructor() {
		this.messageBusService.removeListener( this.messageBusService.MESSAGES.NOTIFICATIONS.NOTIFICATION, this._onNewNotification );
		this.messageBusService.removeListener( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE, this._onNewMessage );
		this.messageBusService.removeListener( this.messageBusService.MESSAGES.NOTIFICATIONS.THREAD_VIEW, this._onThreadView );
		this.messageBusService.removeListener( this.messageBusService.MESSAGES.USER.LOGIN, this._initState );
		this.messageBusService.removeListener( this.messageBusService.MESSAGES.USER.LOGOUT, this._onLogout );
	}

	async onNotificationAction( model ) {
		if( model.type = NOTIFICATION_TYPE.FRIEND_REQUEST ) {
			await this.friendService.addFriend( model.payload.user.username );
		}
		await this.notificationService.acceptNotification( model.id );
	}

	_onThreadView() {
		this.messageService.getUnreadMessageCount().then((count) => {
			this.unreadMessageCount = count;
		});
	}

	_onNewNotification( notification ) {
		this.unreadNotificationCount++;
		this.lastNotifications.unshift( notification );
	}

	_onNewMessage() {
		this.unreadMessageCount++;
	}

	_onLogout() {
		this.notificationService.stopPolling();
	}

}

export default MenuController;