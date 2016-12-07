/*
 * @rpi1337
 */

const FilterService = require('../services/filter');
const FeedService = require('../services/feed');

class FilterController {

	*getUserFilters( context ) {
		const userId = context.session.user.id;
		try {
			let filters = yield this.filterService.getUserFilters( userId );
			context.body = filters;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*createFilter( context ) {
		const userId = context.session.user.id;
		const payload = context.request.fields;
		try {
			let model = {
				name: payload.name,
				tags: payload.tags
			};
			let filter = yield this.filterService.createFilterModel( userId, model.name, model.tags );
			context.body = filter;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*updateFilter( context ) {
		const userId = context.session.user.id;
		const slug = context.params.slug;
		try {
			let filter = yield this.filterService.updateFilterbySlug( userId, slug, context.request.fields );
			context.body = filter;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*deleteFilter( context ) {
		const userId = context.session.user.id;
		const slug = context.params.slug;
		try {
			let success = yield this.filterService.deleteFilterBySlug( userId, slug );
			context.body = {
				success: success
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*getFilterBySlug( context ) {
		const userId = context.session.user.id;
		const slug = context.params.slug;
		try {
			let filter = yield this.filterService.getFilterModelBySlug( slug );
			if( filter.userId != userId ) {
				filter.shared = true;
			}
			context.body = filter;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*runFilter( context ) {
		const userId = context.session.user.id;
		const tags = context.request.fields.tags;
		try {
			let isExist = yield this.filterService.isFilterExists( tags );
			let postIds;
			if( !isExist ) {
				postIds = yield this.filterService.createFilterWithTags( tags );
			} else {
				postIds = yield this.filterService.getFilterPostIdsByTagsAndPage( tags, context.query.page );
			}
			let posts = yield this.feedService.getUserPostsByUserAndFilteredPostIds( userId, postIds );
			context.body = posts;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const filterService = FilterService.instance;
			const feedService = FeedService.instance;
			this.singleton = new FilterController( filterService, feedService );
		}
		return this.singleton;
	}

}

module.exports = FilterController;