/*
 * @rpi1337
 */

const FilterService = require('../services/filter');
const FeedService = require('../services/feed');
const GroupService = require('../services/group');

class FilterController {

	constructor( filterService, feedService, groupService ) {
		this.filterService = filterService;
		this.feedService = feedService;
		this.groupService = groupService;
	}

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

	*getGroupFilters( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isUserApprovedMemberOfGroup = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isUserApprovedMemberOfGroup ) {
				throw new Error('Unauthorized');
			}
			let filters = yield this.filterService.getUserGroupFilters( userId, group.id );
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

	*createGroupFilter( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const payload = context.request.fields;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isUserApprovedMemberOfGroup = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isUserApprovedMemberOfGroup ) {
				throw new Error('Unauthorized');
			}
			let model = {
				name: payload.name,
				tags: payload.tags,
				groupId: group.id
			};
			let filter = yield this.filterService.createFilterModel( userId, model.name, model.tags, model.groupId );
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

	*updateGroupFilter( context ) {
		const userId = context.session.user.id;
		const slug = context.params.slug;
		const groupSlug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isUserApprovedMemberOfGroup = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isUserApprovedMemberOfGroup ) {
				throw new Error('Unauthorized');
			}
			let filter = yield this.filterService.updateFilterbySlug( userId, slug, context.request.fields );
			context.body = filter;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw(400);
		}
	}

	*deleteGroupFilter( context ) {
		const userId = context.session.user.id;
		const slug = context.params.slug;
		const groupSlug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupBySlug( groupSlug );
			let isUserApprovedMemberOfGroup = yield this.groupService.isUserApprovedMemberOfGroup( userId, group.id );
			if( !isUserApprovedMemberOfGroup ) {
				throw new Error('Unauthorized');
			}
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
		const groupSlug = context.request.fields.groupSlug || null;
		let groupId = null;
		try {
			if( groupSlug ) {
				let group = yield this.groupService.getGroupBySlug( groupSlug );
				groupId = group.id;
			}
			let isExist = yield this.filterService.isFilterExists( tags, groupId );
							console.log("\n\n" + isExist + "\n\n");

			let postIds;
			if( !isExist ) {
				postIds = yield this.filterService.createFilterWithTags( tags, groupId );
			} else {
				postIds = yield this.filterService.getFilterPostIdsByTagsAndPage( tags, groupId, context.query.page );
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
			const groupService = GroupService.instance;
			this.singleton = new FilterController( filterService, feedService, groupService );
		}
		return this.singleton;
	}

}

module.exports = FilterController;