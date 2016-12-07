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

	/*
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
				type: NOTIFICATION_TYPE.FRIEND_REQUEST,
				payload: {
					accepted: true,
					user: {
						id: 3,
						username: 'oiu',
						fullname: 'No Way',
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
			},
			{
				type: NOTIFICATION_TYPE.GROUP_INVITATION_ACCEPTED,
				payload: {
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
			},
			{
				type: NOTIFICATION_TYPE.PLATFORM_INVITATION_ACCEPTED,
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
				type: NOTIFICATION_TYPE.NEW_MESSAGE,
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
			}
		];
	}

	*/

	constructor( $q, $http, messageBusService ) {
		this.$q = $q;
		this.$http = $http;
		this.messageBusService = messageBusService;
		this._notifications = [];
		this._unreadNotifications = 0;
	}

	getLastNotifications( lastId ) {
		lastId = isNaN( lastId ) ? 0 :lastId;
		return this.$http.get( CONFIG.API_PATH + '/notifications/recent?lastId=' + lastId ).then((r) => {
			let notifications = r.data;
			if( this._notifications.length == 0 ) {
				notifications.forEach((notif) => {
					if( notif.type === NOTIFICATION_TYPE.NEW_MESSAGE ) {
						this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE );
					}
					this._notifications.push( notif );
					if( notif.seen == false ) {
						this._unreadNotifications++;
					}
				});
			} else {
				notifications.forEach((notif) => {
					if( notif.type === NOTIFICATION_TYPE.NEW_MESSAGE ) {
						this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE );
					}
					this._notifications.unshift( notif );
					this._unreadNotifications++;
				});
			}
			return r.data;
		});
	}

	getNotificationsByPage( page ) {
		page = isNaN(page) ? 1 : page;
		return this.$http.get( CONFIG.API_PATH + '/notifications?page=' + page).then((r) => {
			return r.data;
		});
	}

	startPolling() {
		setTimeout(() => {
			try {
				this.getLastNotifications( this._notifications[0].id );
			} catch( e ) {
				// baszok rá
			}
		}, 3000);
	}

	getUnreadNotificationCount() {
		return this._unreadNotifications;
	}

	acceptNotification( model ) {
		
	}

}

export default NotificationService;