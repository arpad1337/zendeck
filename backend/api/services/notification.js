/*
 * @rpi1337
 */

const CacheProvider = require('../../providers/cache');
const DatabaseProvider = require('../../providers/database');
const UserService = require('../services/user');
const GroupService = require('../services/group');
const FriendService = require('../services/friend');
const CommentService = require('../services/comment');
const FeedService = require('../services/feed');

const NOTIFICATION_TYPE = require('../config/notification-type');

class NotificationService {

	constructor( cacheProvider, databaseProvider, userService, groupService, friendService, commentService, feedService) {
		// TODO: caching
		this.cacheProvider = cacheProvider;
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.groupService = groupService;
		this.friendService = friendService;
		this.commentService = commentService;
		this.feedService = feedService;
	}

	get NOTIFICATION_TYPE() {
		return NOTIFICATION_TYPE;
	}

	getUserLastNotifications( userId ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.findAll({
			where: {
				userId: userId
			},
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
					model.group = group;
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
			case NOTIFICATION_TYPE.GROUP_JOIN_REQUEST: {
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
			case NOTIFICATION_TYPE.GROUP_POST_REQUEST: {
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
				throw new Error('Unknown notification type');
			}
		};
	}

	getLastNotifWithType( userId, type ) {
		const since = new Date();
		const lastHour = since.setHours( since.getHours() - 1 );
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.findOne({
			where: {
				userId: userId,
				type: type,
				createdAt: {
					$gt: lastHour.toISOString()
				}
			}
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
		return NotificationModel.create({
			userId: userId,
			seen: false,
			type: type,
			payload: payload
		});
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
			case NOTIFICATION_TYPE.STARTED_FOLLOWING:
				return this.getLastNotifWithType( userId, type ).then((notif) => {
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
							notif.payload.users.unshift( payload.user );
							return this._updateNotificationById( id, {
								payload: notif.payload 
							});
						}
						return this._createNotification( userId, type, payload );
					});
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_COMMENT: {
				return this.getLastNotifWithType( userId, type ).then((notif) => {
					if( notif ) {
						let newPayload = {
							users: [ notif.payload.user, payload.user ]
						};
						return this.deleteNotificationWithId( notif.id ).then(() => {
							return this._createNotification( userId, NOTIFICATION_TYPE.POST_COMMENT_MULTI, newPayload );
						});
					}
					return this.getLastNotifWithType( userId, NOTIFICATION_TYPE.POST_COMMENT_MULTI ).then((notif) => {
						if( notif ) {
							notif.payload.users.unshift( payload.user );
							return this._updateNotificationById( id, {
								payload: notif.payload 
							});
						}
						return this._createNotification( userId, type, payload );
					});
				});
				break;
			}
			case NOTIFICATION_TYPE.POST_LIKE: {
				return this.getLastNotifWithType( userId, type ).then((notif) => {
					if( notif ) {
						let newPayload = {
							users: [ notif.payload.user, payload.user ]
						};
						return this.deleteNotificationWithId( notif.id ).then(() => {
							return this._createNotification( userId, NOTIFICATION_TYPE.POST_LIKE_MULTI, newPayload );
						});
					}
					return this.getLastNotifWithType( userId, NOTIFICATION_TYPE.POST_LIKE_MULTI ).then((notif) => {
						if( notif ) {
							notif.payload.users.unshift( payload.user );
							return this._updateNotificationById( id, {
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

	touchNotification( userId, notificationId ) {
		const NotificationModel = this.databaseProvider.getModelByName( 'notification' );
		return NotificationModel.update({
			seen: true
		}, {
			where: {
				userId: userId,
				id: notificationId
			}
		}).then( this._createModelFromDBModel );
	}

	static get instance() {
		if( !this.singleton ) {
			const cacheProvider = CacheProvider.instance;
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const groupService = GroupService.instance;
			const friendService = FriendService.instance;
			const commentService = CommentService.instance;
			const feedService = FeedService.instance;
			this.singleton = new NotificationService(
				cacheProvider,
				databaseProvider, 
				userService, 
				groupService, 
				friendService, 
				commentService,
				feedService
			);
		}
		return this.singleton;
	}

}

module.exports = NotificationService;