/*
 * @rpi1337
 */

import NOTIFICATION_TYPE from '../config/notification-type';

class NotificationService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'MessageBusService'
		];
	}

	get dummyNotifications() {
		return [
			{
				type: NOTIFICATION_TYPE.STARTED_FOLLOWING,
				payload: {
					user: {
						id: 2,
						username: 'upiasdasdasd',
						fullname: 'Steve Blanketter',
						photos: {
							small: {
								src: '/img/avatar.jpg',
								width: 42,
								height: 42
							}
						},
						profileColor: '#9CC9B5'
					}
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.STARTED_FOLLOWING_MULTI,
				payload: {
					people: 6,
					users: 
					[
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Steve Blanketter',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}, 
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Tom Select',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}
					]
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.FRIEND_REQUEST,
				payload: {
					user: {
						id: 2,
						username: 'upiasdasdasd',
						fullname: 'Steve Blanketter',
						photos: {
							small: {
								src: '/img/avatar.jpg',
								width: 42,
								height: 42
							}
						},
						profileColor: '#9CC9B5'
					}
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.POST_COMMENT,
				payload: {
					post: {
						id: 123
					},
					user: {
						id: 2,
						username: 'upiasdasdasd',
						fullname: 'Steve Blanketter',
						photos: {
							small: {
								src: '/img/avatar.jpg',
								width: 42,
								height: 42
							}
						},
						profileColor: '#9CC9B5'
					}
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.POST_COMMENT_MULTI,
				payload: {
					post: {
						id: 123
					},
					people: 6,
					users: 
					[
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Steve Blanketter',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}, 
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Tom Select',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}
					]
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.POST_LIKE,
				payload: {
					post: {
						id: 123
					},
					user: {
						id: 2,
						username: 'upiasdasdasd',
						fullname: 'Steve Blanketter',
						photos: {
							small: {
								src: '/img/avatar.jpg',
								width: 42,
								height: 42
							}
						},
						profileColor: '#9CC9B5'
					}
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.POST_LIKE_MULTI,
				payload: {
					likes: 5,
					post: {
						id: 123
					},
					users: 
					[
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Steve Blanketter',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}, 
						{
							id: 2,
							username: 'upiasdasdasd',
							fullname: 'Tim Szall',
							photos: {
								small: {
									src: '/img/avatar.jpg',
									width: 42,
									height: 42
								}
							},
							profileColor: '#9CC9B5'
						}
					]
				},
				createdAt: (new Date()).toISOString()
			},
			{
				type: NOTIFICATION_TYPE.GROUP_INVITATION,
				payload: {
					likes: 5,
					group: {
						id: 123,
						name: 'Frontend Meetup Group'
					},
					user: {
						id: 2,
						username: 'upiasdasdasd',
						fullname: 'Steve Blanketter',
						photos: {
							small: {
								src: '/img/avatar.jpg',
								width: 42,
								height: 42
							}
						},
						profileColor: '#9CC9B5'
					}
				},
				createdAt: (new Date()).toISOString()
			}
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

	getNotificationsByPage( page ) {
		page = isNaN(page) ? 1 : page;
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( this.dummyNotifications );
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