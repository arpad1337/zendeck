/*
 * @rpi1337
 */

class NotificationService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'MessageBusService'
		];
	}

	constructor( $q, $http, messageBusService ) {
		this.$q = $q;
		this.$http = $http;
		this.messageBusService = messageBusService;
	}

	getLastNotifications() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	startPolling() {
		setTimeout(() => {
			this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE );
		}, 3000);
	}

	getUnreadNotificationCount() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(12);
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default NotificationService;