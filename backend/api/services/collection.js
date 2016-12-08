/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user');
const GroupService = require('./group');
const Util = require('../../util/util');

class CollectionService {
	
	constructor( databaseProvider, userService, groupService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.groupService = groupService;
	}

	isUserHasRightsToCollection( userId, slug ) {
		return this.getCollectionBySlug( slug ).then((collection) => {
			if( collection.userId == userId ) {
				return true;
			}
			if( collection.groupId ) {
				return this.groupService.isUserAdminOfGroup( userId, collection.groupId );
			}
			return false;
		});
	}

	getUserCollectionsByUsername( username ) {
		return this.userService.getUserByUsername( username ).then((user) => {
			return this.getUserPublicCollections( user.id );
		});
	}

	getUserCollections( userId ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findAll({
			where: {
				userId: userId
			}
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			return collections.map( c =>  c.get() );
		});
	}

	getUserPublicCollections( userId ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findAll({
			where: {
				userId: userId,
				isPublic: true
			}
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			return collections.map( c =>  c.get() );
		});
	}

	getGroupCollections( groupId ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findAll({
			where: {
				groupId: groupId
			}
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			return collections.map( c =>  c.get() );
		});
	}

	getCollectionBySlug( slug ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findOne({
			where: {
				slug: slug
			}
		}).then((collection) => {
			return collection.get();
		});
	}

	getChildrenCollectionsBySlug() {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return this.getCollectionBySlug( slug ).then((collection) => {
			return CollectionModel.findAll({
				where: {
					parent: collection.id
				}
			});
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			return collections.map( c => c.get() );
		});
	}

	createCollection( userId, name, isPublic, parent, groupId ) {
		let model = {
			userId: userId,
			slug: Util.createSHA256Hash( userId + name ),
			name: name,
			isPublic: isPublic,
			parent: parent ? parent : null,
			groupId: groupId ? groupId : null
		};
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.create( model );
	}

	updateCollectionBySlug( slug, name, isPublic ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return this.getCollectionBySlug( slug ).then((collection) => {
			return CollectionModel.update({
				name: name,
				isPublic: isPublic
			}, {
				where: {
					id: collection.id
				}
			});
		});
	}

	deleteCollectionBySlug( slug ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return Promise.all([
			this.getCollectionBySlug( slug ),
			this.getChildrenCollectionsBySlug( slug )
		]).then((values) => {
			let collection = values[0];
			let collections = values[1];
			collections = collections.map( c => c.id );
			return CollectionModel.update({
				parent: collection.parent
			}, {
				where: {
					id: collections
				}
			}).then(() => {
				return CollectionModel.destroy({
					where: {
						id: collection.id
					}
				});
			});
		});
	}

	getCollectionIdsRecursivellyByCollectionId( collectionId, accumulator ) {
		accumulator = accumulator || [];
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findOne({
			where: {
				id: collectionId
			}
		}).then((collection) => {
			accumulator.push( collectionId );
			if( collection.get('parent') ) {
				return this.getCollectionIdsRecursivellyByCollectionId( collection.get('parent'), accumulator );
			}
			return accumulator;
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const groupService = GroupService.instance;
			this.singleton = new CollectionService( databaseProvider, userService, groupService );
		}
		return this.singleton;
	}

}

module.exports = CollectionService;