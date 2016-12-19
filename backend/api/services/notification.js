/*
 * @rpi1337
 */

const CacheProvider = require('../../providers/cache');
const DatabaseProvider = require('../../providers/database');

const NOTIFICATION_TYPE = require('../config/notification-type');

class NotificationService {

	constructor( cacheProvider, databaseProvider) {
		// TODO: caching
		this.cacheProvider = cacheProvider;
		this.databaseProvider = databaseProvider;
	}

	get NOTIFICATION_TYPE() {
		return NOTIFICATION_TYPE;
	}

	getUserLastNotifications( userId, lastId ) {
		let where = {
			userId: userId
		};
		if( lastId ) {
			where.id = {
				$gt: Number(lastId)
			}
		}
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.findAll({
			where: where,
			limit: 10,
			order: [['id', 'DESC']]
		}).then((models) => {
			let promises =  models.map(( model ) =>  {
				return this._createModelFromDBModel( model.get() );
			});
			return Promise.all(promises);
		});
	}

	getUserNotificationsByPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.findAll({
			where: {
				userId: userId
			},
			limit: 20,
			offset: (( page - 1 ) * 20),
			order: [['id', 'DESC']]
		}).then((models) => {
			let promises =  models.map(( model ) =>  {
				return this._createModelFromDBModel( model.get() );
			});
			return Promise.all(promises);
		});
	}

	_createModelFromDBModel( model ) {
		switch (model.type) {
			case NOTIFICATION_TYPE.STARTED_FOLLOWING:
			case NOTIFICATION_TYPE.FRIEND_REQUEST: {
				return this.userService.getUserAuthorViewById( model.payload.user.id ).then((user) => {
					model.payload.user = user;
					return this.friendService.checkFriend( model.userId, model.payload.user.id );
				}).then((isAccepted) => {
					model.payload.accepted = isAccepted;
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_COMMENT:
			case NOTIFICATION_TYPE.POST_LIKE:
			case NOTIFICATION_TYPE.PLATFORM_INVITATION_ACCEPTED:
			case NOTIFICATION_TYPE.NEW_MESSAGE: {
				// get userModel
				return this.userService.getUserAuthorViewById( model.payload.user.id ).then((user) => {
					model.payload.user = user;
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.GROUP_INVITATION:
			case NOTIFICATION_TYPE.GROUP_INVITATION_ACCEPTED: {
				return this.userService.getUserAuthorViewById( model.payload.user.id ).then((user) => {
					model.payload.user = user;
					return this.groupService.getGroupById( model.payload.group.id );
				}).then((group) => {
					model.payload.group = group;
					return model;
				})
				break;
			}
			case NOTIFICATION_TYPE.POST_COMMENT_MULTI: {
				let userIds = model.payload.users.map((user) => user.id).slice(0, 2);
				return this.userService.getUsersAuthorViewByIds( userIds ).then((users) => {
					model.payload.users = users;
					return this.commentService.getDistinctCommentCountByPostId( model.payload.post.id );
				}).then((count) => {
					model.payload.people = count
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_LIKE_MULTI: {
				let userIds = model.payload.users.map((user) => user.id).slice(0, 2);
				return this.userService.getUsersAuthorViewByIds( userIds ).then((users) => {
					model.payload.users = users;
					return this.feedService.getPostLikeCountByPostId( model.payload.post.id );
				}).then((count) => {
					model.payload.likes = count
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.STARTED_FOLLOWING_MULTI: {
				let userIds = model.payload.users.map((user) => user.id).slice(0, 2);
				return this.userService.getUsersAuthorViewByIds( userIds ).then((users) => {
					model.payload.users = users;
					return this.friendService.getNewFollowersCountbyUserId( model.payload.post.id, model.createdAt );
				}).then((count) => {
					model.payload.people = count
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.GROUP_JOIN_REQUEST:
			case NOTIFICATION_TYPE.GROUP_JOIN_REQUEST_ACCEPTED: {
				return this.userService.getUserAuthorViewById( model.payload.user.id ).then((user) => {
					model.payload.user = user;
					return this.groupService.getGroupById( model.payload.group.id );
				}).then((group) => {
					model.payload.group = group;
					return this.groupService.checkMember( group.id, model.payload.user.id );
				}).then((isAccepted) => {
					model.payload.accepted = isAccepted;
					return model;
				});
				break;
			}
			case NOTIFICATION_TYPE.GROUP_POST_REQUEST:
			case NOTIFICATION_TYPE.GROUP_POST_REQUEST_ACCEPTED: {
				return this.userService.getUserAuthorViewById( model.payload.user.id ).then((user) => {
					model.payload.user = user;
					return this.groupService.getGroupById( model.payload.group.id );
				}).then((group) => {
					model.payload.group = group;
					return this.feedService.checkPostInGroup( model.payload.post.id, group.id );
				}).then((isAccepted) => {
					model.payload.accepted = isAccepted;
					return model;
				});
				break;
			}
			default: {
				console.error('UNKNOWN:', model);
				throw new Error('Unknown notification type');
			}
		};
	}

	getLastNotifWithType( userId, type, correlationParameter ) {
		const since = new Date();
		const lastHour = since.setHours( since.getHours() - 1 );
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		let where = {
			userId: userId,
			type: type,
			createdAt: {
				$gt: lastHour
			}
		};
		if( type === NOTIFICATION_TYPE.POST_LIKE || type === NOTIFICATION_TYPE.POST_COMMENT ) {
			where.correlationId = 'POST:' + correlationParameter;
		}
		if( type === NOTIFICATION_TYPE.STARTED_FOLLOWING ) {
			where.correlationId = 'USER:' + correlationParameter;
		}
		return NotificationModel.findOne({
			where: where
		}).then((model) => {
			if( model ) {
				return model.get();
			}
			return null;
		})
	}

	deleteNotificationWithId( id ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.destroy({
			where: {
				id: id
			}
		});
	}

	_createNotification( userId, type, payload ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		let model = {
			userId: userId,
			seen: false,
			type: type,
			payload: payload
		};
		if( type === NOTIFICATION_TYPE.POST_LIKE || type === NOTIFICATION_TYPE.POST_COMMENT ) {
			model.correlationId = 'POST:' + payload.post.id;
		}
		if( type === NOTIFICATION_TYPE.STARTED_FOLLOWING ) {
			model.correlationId = 'USER:' + payload.user.id;
		}
		return NotificationModel.create(model);
	}

	_updateNotificationById( id, payload ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.update( payload, {
			where: {
				id: id
			}
		});
	}

	createNotification( userId, type, payload ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		switch( type ) {
			case NOTIFICATION_TYPE.STARTED_FOLLOWING: {
				return this.getLastNotifWithType( userId, type, payload.user.id ).then((notif) => {
					if( notif ) {
						let newPayload = {
							users: [ notif.payload.user, payload.user ]
						};
						return this.deleteNotificationWithId( notif.id ).then(() => {
							return this._createNotification( userId, NOTIFICATION_TYPE.STARTED_FOLLOWING_MULTI, newPayload );
						});
					}
					return this.getLastNotifWithType( userId, NOTIFICATION_TYPE.STARTED_FOLLOWING_MULTI ).then((notif) => {
						if( notif ) {
							if( !notif.payload.users.find((u) => { return u.id = payload.user.id; }) ) {
								notif.payload.users.unshift( payload.user );
							}
							return this._updateNotificationById( notif.id, {
								payload: notif.payload 
							});
						}
						return this._createNotification( userId, type, payload );
					});
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_COMMENT: {
				return this.getLastNotifWithType( userId, type, payload.post.id ).then((notif) => {
					if( notif ) {
						let newPayload = {
							users: [ notif.payload.user, payload.user ],
							post: {
								id: payload.post.id
							}
						};
						return this.deleteNotificationWithId( notif.id ).then(() => {
							return this._createNotification( userId, NOTIFICATION_TYPE.POST_COMMENT_MULTI, newPayload );
						});
					}
					return this.getLastNotifWithType( userId, NOTIFICATION_TYPE.POST_COMMENT_MULTI ).then((notif) => {
						if( notif ) {
							if( !notif.payload.users.find((u) => { return u.id == payload.user.id; }) ) {
								notif.payload.users.unshift( payload.user );
							}
							return this._updateNotificationById( notif.id, {
								payload: notif.payload 
							});
						}
						return this._createNotification( userId, type, payload );
					});
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_LIKE: {
				return this.getLastNotifWithType( userId, type, payload.post.id ).then((notif) => {
					if( notif ) {
						let newPayload = {
							users: [ notif.payload.user, payload.user ],
							post: {
								id: payload.post.id
							}
						};
						return this.deleteNotificationWithId( notif.id ).then(() => {
							return this._createNotification( userId, NOTIFICATION_TYPE.POST_LIKE_MULTI, newPayload );
						});
					}
					return this.getLastNotifWithType( userId, NOTIFICATION_TYPE.POST_LIKE_MULTI ).then((notif) => {
						if( notif ) {
							if( !notif.payload.users.find((u) => { return u.id = payload.user.id; }) ) {
								notif.payload.users.unshift( payload.user );
							}
							return this._updateNotificationById( notif.id, {
								payload: notif.payload
							});
						}
						return this._createNotification( userId, type, payload );
					});
				});
				break;
			}
			default: {
				return this._createNotification( userId, type, payload );
				break;
			}
		}
	}

	touchNotifications( userId, lastId ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.update({
			seen: true
		}, {
			where: {
				userId: userId,
				id: {
					$lte: Number(lastId)
				}
			}
		});
	}

	getUnreadNotificationCount( userId ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.count({
			where: {
				userId: userId,
				seen: false
			}
		});
	}

	acceptNotification( userId, notificationId ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.findOne({
			where: {
				userId: userId,
				id: notificationId
			}
		}).then((model) => {
			if( !model ) {
				throw new Error('Unknown notif');
			}
			return this._createModelFromDBModel( model.get() ).then((notification) => {
				switch( model.type ) {
					case NOTIFICATION_TYPE.FRIEND_REQUEST: {
						return this.friendService.addFriend( userId, notification.payload.user.username );
						break;
					}
					case NOTIFICATION_TYPE.GROUP_JOIN_REQUEST: {
						return this.groupService.approveUser( notification.payload.group.slug, userId, notification.payload.user.id );
						break;
					}
					case NOTIFICATION_TYPE.GROUP_INVITATION: {
						return this.groupService.joinGroup( userId, notification.payload.group.slug ).then(() => {
							return this.groupService.acceptGroupInvitation( userId, notification.payload.invitationKey ).catch((e) => {
								return false;
							});
						});
						break;
					}
				}
				return true;
			}).then((r) => !!r);
		});
	}

	// DEPS

	get feedService() {
		if( !this._feedService ) {
			// lazy load because circular dependency
			const FeedService = require('../services/feed');
			this._feedService = FeedService.instance;
		}
		return this._feedService;
	}

	get userService() {
		if( !this._userService ) {
			const UserService = require('../services/user');
			this._userService = UserService.instance;
		}
		return this._userService;
	}

	get groupService() {
		if( !this._groupService ) {
			const GroupService = require('../services/group');
			this._groupService = GroupService.instance;
		}
		return this._groupService;
	}

	get friendService() {
		if( !this._friendService ) {
			const FriendService = require('../services/friend');
			this._friendService = FriendService.instance;
		}
		return this._friendService;
	}

	get commentService() {
		if( !this._commentService ) {
			const CommentService = require('../services/comment');
			this._commentService = CommentService.instance;
		}
		return this._commentService;
	}

	static get instance() {
		if( !this.singleton ) {
			const cacheProvider = CacheProvider.instance;
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new NotificationService(
				cacheProvider,
				databaseProvider
			);
		}
		return this.singleton;
	}

}

module.exports = NotificationService;
