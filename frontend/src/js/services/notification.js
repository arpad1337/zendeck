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

	constructor( $q, $http, messageBusService ) {
		this.$q = $q;
		this.$http = $http;
		this.messageBusService = messageBusService;
		this._notifications = [];
		this._notifById = new Map();
		this.lastId = 0;
	}

	getLastNotifications( lastId ) {
		lastId = isNaN( lastId ) ? 0 :lastId;
		this.lastId = lastId;
		return this.$http.get( CONFIG.API_PATH + '/notification/recent' ).then((r) => {
			let notifications = r.data;
			notifications.forEach((notif) => {
				if( this._notifById.get( notif.id ) ) {
					return;
				}
				this._notifById.set( notif.id, notif );
				this._notifications.push( notif );
				if( notif.id > this.lastId) {
					this.lastId = notif.id;
				}
			});
			return this._notifications;
		});
	}

	getNotificationsByPage( page ) {
		page = isNaN(page) ? 1 : page;
		return this.$http.get( CONFIG.API_PATH + '/notification?page=' + page).then((r) => {
			return r.data;
		});
	}

	startPolling() {
		this._timer = setInterval(() => {
			try {
				this.$http.get( CONFIG.API_PATH + '/notification/recent?lastId=' + this.lastId ).then((r) => {
					let notifications = r.data;
					notifications = notifications.sort((a, b) => {
						return a.id - b.id;
					});
					notifications.forEach((notif) => {
						if( this._notifById.get( notif.id ) ) {
							return;
						}
						this._notifById.set( notif.id, notif );
						this._notifications.unshift( notif );
						if( notif.id > this.lastId) {
							this.lastId = notif.id;
						}
						if( notif.type == NOTIFICATION_TYPE.NEW_MESSAGE ) {
							this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE );
						}
						this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.NOTIFICATION, notif );
					});
				});
			} catch( e ) {
				// baszok rá
			}
		}, 10000);
	}

	stopPolling() {
		clearInterval( this._timer );
	}

	touchNotifications() {
		return this.$http.post(CONFIG.API_PATH + '/notification?lastId=' + this.lastId).then((r) => {
			return r.data;
		});
	}

	getUnreadNotificationCount() {
		return this.$http.get( CONFIG.API_PATH + '/notification/unread' ).then((r) => {
			return r.data.count;
		});
	}

	acceptNotification( id ) {
		return this.$http.post( CONFIG.API_PATH + '/notification/' + id ).then( r => r.data );
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

}

export default NotificationService;