/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const Util = require('../../util/util');

class FeedService {

	static get LIMIT() {
		return 20;
	}

	constructor( databaseProvider, collectionService, friendService, groupService ) {
		this.databaseProvider = databaseProvider;
		this.collectionService = collectionService;
		this.friendService = friendService;
		this.groupService = groupService;
	}

	getUserFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : 0;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.find({
			where: {
				userId: userId
			},
			limit: FeedService.LIMIT,
			offset: (( page - 1 ) * FeedModel.LIMIT),
			order: [ 'created_at', 'DESC' ]
			group: 'post_id'
		});
	}

	getUserLikedFeedByIdAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : 0;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.find({
			where: {
				userId: userId,
				liked: true
			},
			limit: FeedService.LIMIT,
			offset: (( page - 1 ) * FeedModel.LIMIT),
			order: [ 'created_at', 'DESC' ]
			group: 'post_id'
		});
	}

	getUserCollectionFeedByIdAndCollectionIdAndPage( userId, collectionId, page ) {
		page = isNaN( page ) ? 1 : 0;
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return this.collectionService.getCollectionIdsRecursivellyByCollectionId( collectionId ).then(( collectionIds ) => {
			return FeedModel.find({
				where: {
					userId: userId,
					collectionId: collectionIds
				},
				limit: FeedService.LIMIT,
				offset: (( page - 1 ) * FeedModel.LIMIT),
				order: [ 'created_at', 'DESC' ]
				group: 'post_id'
			});
		});
	}

	addPostToCollection( userId, postId, collectionId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ collectionId: collectionId }, {
			where: {
				userId: userId,
				postId: postId
			}
		});
	}

	deleteAllFromCollection( collectionId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				collectionId: collectionId
			}
		});
	}

	removePostFromCollection( userId, postId, collectionId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({ collectionId: null }, {
			where: {
				userId: userId,
				postId: postId,
				collectionId: collectionId
			}
		});
	}

	addPostToFeeds( userId, postId, groupId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		let promises = [
			this.friendService.getAllFriendIdsByUserId( userId ),
		];
		if( groupId ) {
			promises.push(
				this.groupService.getAllMembersById( groupId )
			);
		}
		return Promise.all(promises).then((userIds) => {
			userIds = Util.flattenArrayOfArrays( userIds );
			let bulk = [];
			let idMap = {};
			userIds.forEach((id) => {
				if( idMap[id] ) {
					return;
				}
				idMap[ id ] = true;
				let model = {
					userId: id,
					postId: postId,
					liked: false
				};
				if( groupId ) {
					model.groupId = groupId;
				}
				bulk.push(model);
			});
			return FeedModel.bulkCreate( bulk );
		});
	}

	removePostFromFeedsById( postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.destroy({
			where: {
				postId: postId
			}
		});
	}

	likePostByUserId( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({liked: true}, {
			where: {
				userId: userId
				postId: postId
			}
		});
	}

	unlikePostByUserId( userId, postId ) {
		const FeedModel = this.databaseProvider.getModelByName( 'feed' );
		return FeedModel.update({liked: false}, {
			where: {
				userId: userId
				postId: postId
			}
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new FeedService( databaseProvider );
		}
		return this.singleton;
	}
}

module.exports = FeedService;