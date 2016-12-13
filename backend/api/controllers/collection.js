/*
 * @rpi1337
 */

const CollectionService = require('../services/collection');
const GroupService = require('../services/group');

class CollectionController {
	
	constructor( collectionService, groupService ) {
		this.collectionService = collectionService;
		this.groupService = groupService;
	}

	*getCurrentUserCollections( context ) {
		const userId = context.session.user.id;
		try {
			let collections = yield this.collectionService.getUserCollections( userId );
			context.body = collections;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getUserCollections( context ) {
		const username = context.params.username;
		try {
			let collections = yield this.collectionService.getUserCollectionsByUsername( username );
			context.body = collections;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getGroupCollections( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isApprovedMember = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !group.isOpen && !isApprovedMember ) {
				throw new Error('Unauthorized');
			}
			let collections = yield this.collectionService.getGroupCollections( group.id );
			context.body = collections;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getCollectionBySlug( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;	
		try {
			let collection = yield this.collectionService.getCollectionBySlug( slug );
			if( collection.userId != userId ) {
				collection.shared = true;
			}
			context.body = collection;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*updateCollection( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, slug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.updateCollectionBySlug( slug, context.request.fields.name, context.request.fields.isPublic );
			context.body = collection;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*deleteCollection( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;
		try {
			let isUserHasRightsToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, slug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			yield this.collectionService.deleteCollectionBySlug( slug );
			context.body = {
				success: true 
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createCollection( context ) {
		const userId = context.session.user.id;
		const payload = context.request.fields;
		try {
			let collection = yield this.collectionService.createCollection( userId, payload.name, payload.isPublic, payload.parent );
			context.body = collection;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createGroupCollection( context ) {
		const userId = context.session.user.id;
		const payload = context.request.fields;
		const slug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupBySlug( slug );
			let isAdmin = yield this.groupService.isUserAdminOfGroup( userId, group.id );
			if( !isAdmin ) {
				throw new Error('Unauthorized');
			}
			let collection = yield this.collectionService.createCollection( userId, payload.name, payload.isPublic, payload.parent, group.id );
			context.body = collection;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const collectionService = CollectionService.instance;
			const groupService = GroupService.instance;
			this.singleton = new CollectionController( collectionService, groupService );
		}
		return this.singleton;
	}

}

module.exports = CollectionController;