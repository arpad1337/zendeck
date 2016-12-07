/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('../services/user');
const NotificationService = require('./notification');

class FriendService {

	static get LIMIT() {
		return 20;
	}

	constructor( databaseProvider, userService, notificationService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.notificationService = notificationService;
	}

	touchFriendByUsername( userId, friendUsername ) {
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return this.userService.getUserByUsername( friendUsername ).then((friend) => {
			return FriendModel.update({
				updatedAt: Date.now() // it keeps recents in front
			}, {
				where: {
					userId: userId,
					friendId: friend.id
				}
			});
		}).catch(_ =>  false);
	}

	getFriendsByUsername( username, page ) {
		return this.userService.getUserByUsername( username ).then((user) => {
			return this.getFriendsByUserId( user.id, page );
		});
	}

	getAllFriendIdsByUserId( userId ) {
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return FriendModel.findAll({
			where: {
				userId: userId
			}
		}).then((friends) => {
			if( !friends ) {
				return [];
			}
			return friends.map( i => i.get('friendId') );
		});
	}

	getFriendsByUserId( userId, page ) {
		page = page || 1;
		const limit = FriendService.LIMIT;
		const offset = ( Number(page) - 1 ) * limit;
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return FriendModel.findAll({
			where: {
				userId: userId
			},
			limit: limit,
			offset: offset,
			order: [ 
				['updated_at','DESC']
			]
		}).then((friends) => {
			if( !friends ) {
				return [];
			}
			let friendIds = friends.map( i => i.get('friendId') );
			return this.userService.getUsersByIds( friendIds );
		});
	}

	addFriend( userId, friendUsername ) {
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return this.userService.getUserByUsername( friendUsername ).then((friend) => {
			return FriendModel.create({
				userId: userId,
				friendId: friend.id
			}).then(_ => {
				return true;
			}).catch(_  => {
				return FriendModel.restore({
					where: {
						userId: userId,
						friendId: friend.id,
					}
				}).then(() => {
					return FriendModel.update({
						updatedAt: Date.now()
					}, {
						where: {
							userId: userId,
							friendId: friend.id,
						}
					})
				}).then(() => {
					return true;
				});
			}).then(() => {
				if( friend.isBusiness ) {
					return this.notificationService.createNotification( friend.id, this.notificationService.NOTIFICATION_TYPE.STARTED_FOLLOWING, {
						user: {
							id: userId
						}
					});
				}
				return this.notificationService.createNotification( friend.id, this.notificationService.NOTIFICATION_TYPE.FRIEND_REQUEST, {
					user: {
						id: userId
					}
				});
			});
		}).catch(_ =>  false);
	}

	removeFriend( userId, friendUsername ) {
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return this.userService.getUserByUsername( friendUsername ).then((friend) => {
			return FriendModel.destroy({
				where: {
					userId: userId,
					friendId: friend.id
				}
			});
		});
	}

	checkFriend( userId, friendId ) {
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return FriendModel.findOne({
			where: {
				userId: userId,
				friendId: friendId
			},
			attributes: ['id']
		}).then(r => !!r);
	}

	getNewFollowersCountbyUserId( userId, from ) {
		const since = new Date(from);
		const anHour = since.setHours( since.getHours() + 1 );
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return FriendModel.count({
			where: {
				userId: userId,
				createdAt: {
					$lt: anHour.toISOString()
				}
			}
		});
	}

	getRecommendations( userId, ip ) {
		return this.getAllFriendIdsByUserId( userId ).then((friendIds) => {
			if( !friendIds ) {
				return [];
			}
			friendIds.push( userId );
			return this.userService.getRandomUsersWithExcludingIds( friendIds );
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const notificationService = NotificationService.instance;
			this.singleton = new FriendService( databaseProvider, userService, notificationService );
		}
		return this.singleton;
	}

}

module.exports = FriendService;