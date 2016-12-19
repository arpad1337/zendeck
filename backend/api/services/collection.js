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
				userId: userId,
				groupId: null
			}
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			let collectionParentSet = new Set();
			collections = collections.map( c => {
				if(c.get('parent')) {
					collectionParentSet.add( c.get('parent') );
				}
				return c.get();
			});
			if( collectionParentSet.size > 0 ) {
				return this.getCollectionsByIds( Array.from( collectionParentSet ) ).then((parents) => {
					let parentsMap = new Map();
					parents.forEach((parent) => {
						parentsMap.set( parent.id, parent );
					});
					collections = collections.map( c => {
						if(c.parent) {
							c.parent = parentsMap.get( c.parent );
						}
						return c;
					});
					return collections;
				});
			}
			return collections;
		});
	}

	getUserPublicCollections( userId ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findAll({
			where: {
				userId: userId,
				isPublic: true,
				groupId: null
			}
		}).then((collections) => {
			if( !collections ) {
				return [];
			}
			let collectionParentSet = new Set();
			collections = collections.map( c => {
				if(c.get('parent')) {
					collectionParentSet.add( c.get('parent') );
				}
				return c.get();
			});
			if( collectionParentSet.size > 0 ) {
				return this.getCollectionsByIds( Array.from( collectionParentSet ) ).then((parents) => {
					let parentsMap = new Map();
					parents.forEach((parent) => {
						parentsMap.set( parent.id, parent );
					});
					collections = collections.map( c => {
						if(c.parent) {
							c.parent = parentsMap.get( c.parent );
						}
						return c;
					});
					return collections;
				});
			}
			return collections;
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

	getCollectionById( id ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findOne({
			where: {
				id: id
			}
		}).then((collection) => {
			return collection.get();
		});
	}

	getCollectionsByIds( ids ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findAll({
			where: {
				id: ids
			}
		}).then((collections) => {
			return collections.map( collection => collection.get() );
		});
	}

	getCollectionBySlug( slug ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findOne({
			where: {
				slug: slug
			}
		}).then((collection) => {
			collection = collection.get();
			if( collection.parent ) {
				return CollectionModel.findOne({
					where: {
						id: collection.parent
					}
				}).then((parent) => {
					collection.parent = parent.get();
					return collection;
				});
			}
			return collection;
		});
	}

	getChildrenCollectionsBySlug( slug ) {
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
			name: name.charAt(0).toUpperCase() + name.substr(1,name.length),
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
		}).then(() => {
			return CollectionModel.findOne({
				where: {
					id: collection.id
				}
			}).then((c) => c.get());
		});
	}

	deleteCollectionBySlug( slug ) {
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.destroy({
			where: {
				id: collection.id
			}
		});
		// return Promise.all([
		// 	this.getCollectionBySlug( slug ),
		// 	this.getChildrenCollectionsBySlug( slug )
		// ]).then((values) => {
		// 	let collection = values[0];
		// 	let collections = values[1];
		// 	collections = collections.map( c => c.id );
		// 	return CollectionModel.update({
		// 		parent: collection.parent
		// 	}, {
		// 		where: {
		// 			id: collections
		// 		}
		// 	}).then(() => {
		// 		return CollectionModel.destroy({
		// 			where: {
		// 				id: collection.id
		// 			}
		// 		});
		// 	});
		// });
	}

	getCollectionIdsRecursivellyByCollectionId( collectionId, accumulator ) {
		accumulator = accumulator || [];
		const CollectionModel = this.databaseProvider.getModelByName( 'collection' );
		return CollectionModel.findOne({
			where: {
				id: collectionId
			},
			paranoid: true
		}).then((collection) => {
			accumulator.push(collectionId);
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