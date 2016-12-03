/*
 * @rpi1337
 */

const CollectionService = require('../services/collection');

class CollectionController {
	
	constructor( collectionService ) {
		this.collectionService = collectionService;
	}

	*getCurrentUserCollections( context ) {
		let userId = context.session.user.id;
		try {
			let collections = yield this.collectionService.getUserCollections( userId );
			context.body = collections;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getUserCollections( context ) {
		let username = context.params.username;
		try {
			let collections = yield this.collectionService.getUserCollectionsByUsername( username );
			context.body = collections;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*updateCollection( context ) {
		const userId = context.session.user.id;
		const slug = context.params.collectionSlug;
		try {
			let userHasRightToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, slug );
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
			let userHasRightToCollection = yield this.collectionService.isUserHasRightsToCollection( userId, slug );
			if( !isUserHasRightsToCollection ) {
				throw new Error('Unauthorized');
			}
			yield this.collectionService.deleteCollectionBySlug( slug );
			context.body = true;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const collectionService = CollectionService.instance;
			this.singleton = new CollectionController( collectionService );
		}
		return this.singleton;
	}

}

module.exports = CollectionController;