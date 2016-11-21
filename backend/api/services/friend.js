/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('../services/user');

class FriendService {

	static get LIMIT() {
		return 20;
	}

	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
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

	getFriendsByUserId( userId, page ) {
		const limit = FriendService.LIMIT;
		const offset = ( Number(page) - 1 ) * limit;
		const FriendModel = this.databaseProvider.getModelByName( 'friend' );
		return FriendModel.find({
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
			let friendIds = friends.map( i => i.get('id') );
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
					return true;
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

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			this.singleton = new FriendService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = FriendService;