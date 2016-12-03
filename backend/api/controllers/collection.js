/*
 * @rpi1337
 */

class CollectionController {
	
	constructor( collectionService ) {
		this.collectionService = collectionService;
	}

	*getCurrentUserCollections( context ) {
		let userId = context.session.user.id;
		try {
			let posts = yield this.collectionService.getUserCollections( userId );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getUserCollections( context ) {
		let username = context.params.username;
		try {
			let posts = yield this.collectionService.getUserCollectionsByUsername( username );
			context.body = posts;
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