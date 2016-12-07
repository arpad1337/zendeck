/*
 * @rpi1337
 */

const SearchService = require('../services/search');

class SearchController {

	constructor( searchService ) {
		this.searchService = searchService;
	}

	*performBulkSearch( context ) {
		const predicate = context.params.predicate;
		try {
			let results = yield this.searchService.performBulkSearch( predicate );
			context.body = results;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( e );
		}
	}

	*performSearchByTopic( context ) {
		const predicate = context.params.predicate;
		const topic = context.params.topic;
		try {
			let results;
			switch( topic ) {
				case 'user': {
					results = yield this.searchService.searchUsers( predicate, context.query.page );
					break;
				}
				case 'group': {
					results = yield this.searchService.searchGroups( predicate, context.query.page );
					break;
				}
				default: {
					throw new Error('unknown topic')
				}
			}
			context.body = results;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( e );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const searchService = SearchService.instance;
			this.singleton = new SearchController( searchService );
		}
		return this.singleton;
	}

}

module.exports = SearchController;