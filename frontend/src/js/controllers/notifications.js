/*
 * @rpi1337
 */

class NotificationsController {

	static get $inject() {
		return [
			'NotificationService',
			'GroupService'
		];
	}

	constructor( notificationService, groupService ) {
		this.notificationService = notificationService;
		this.groupService = groupService;

		this._initState();
	}

	_initState() {
		this.groups = [];
		this.groupService.getRecentGroups().then((groups) => {
			groups.forEach((group) => {
				this.groups.push( group );
			});
		});
		this._page = 1;
		this.notifications = [];
		this.notificationService.getNotificationsByPage( this._page ).then((notifications) => {
			notifications.forEach((notif) => {
				this.notifications.push( notif );
			})
		});
	}

	getMoreNotifications() {
		this._page++;
		this.notificationService.getNotificationsByPage( this._page ).then((notifications) => {
			notifications.forEach((notif) => {
				this.notifications.push( notif );
			})
		});
	}

}

export default NotificationsController;