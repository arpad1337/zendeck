/*
 * @rpi1337
 */

import NOTIFICATION_TYPE from '../config/notification-type';

class NotificationsController {

	static get $inject() {
		return [
			'$scope',
			'NotificationService',
			'GroupService',
			'FriendService'
		];
	}

	constructor( $scope, notificationService, groupService, friendService ) {
		this.$scope = $scope;
		this.notificationService = notificationService;
		this.groupService = groupService;
		this.friendService = friendService;

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

	async getMoreNotifications() {
		let page = this._page + 1;
		let notifications = await this.notificationService.getNotificationsByPage( page );
		if( notifications.length ) {
			this._page++;
		}
		notifications.forEach((notif) => {
			this.notifications.push( notif );
		});
		this.$scope.$digest();
		return notifications.length > 0;
	}

	async onNotificationAction( model ) {
		if( model.type = NOTIFICATION_TYPE.FRIEND_REQUEST ) {
			await this.friendService.addFriend( model.payload.user.username );
		}
		await this.notificationService.acceptNotification( model.id );
	}

}

export default NotificationsController;