/*
 * @rpi1337
 */

const GroupService = require('../services/group');

class GroupController {

	constructor( groupService ) {
		this.groupService = groupService;
	}

	*getGroupViewBySlug( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			let group = yield this.groupService.getGroupViewByUser( userId, groupSlug );
			context.body = group;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getGroupsOfUser( context ) {
		const userId = context.session.user.id;
		const page = context.query.page;
		try {

		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createGroup( context ) {
		const userId = context.session.user.id;
		try {

		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const groupService = GroupService.instance;
			this.singleton = new GroupController( groupService );
		}
		return this.singleton;
	}

}

module.exports = GroupController;