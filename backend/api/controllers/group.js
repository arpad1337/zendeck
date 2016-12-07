/*
 * @rpi1337
 */

const GroupService = require('../services/group');
const CollectionService = require('../services/collection');

class GroupController {

	constructor( groupService, collectionService ) {
		this.groupService = groupService;
		this.collectionService = collectionService;
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
			let groups = yield this.groupService.getGroupViewsByUserAndPage( userId, page );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*createGroup( context ) {
		const userId = context.session.user.id;
		const payload = context.request.fields;
		try {
			let payload = {
				name: payload.name,
				isPublic: payload.isPublic, // todo: isUserPremium
				isModerated: payload.isModerated, // todo: isUserPremium
				isOpen: payload.isOpen, 
				about: payload.about
			};
			let group = yield this.groupService.createGroup( userId, payload );
			yield this.collectionService.createCollection( userId, 'Favorites', true, null, group.id );
			context.body = group;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*updateGroupCover( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const file = context.request.fields.file[0];
		try {
			let success = yield this.groupService.updateCoverPic( userId, groupSlug, file );
			context.body = {
				success: success
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*updateGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const payload = context.request.fields;
		try {
			let result = yield this.groupService.updateGroupProfileBySlug( userId, groupSlug, payload );
			context.body = result;
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*deleteGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			let success = yield this.groupService.deleteGroupBySlug( userId, groupSlug );
			context.body = {
				success: success
			};
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	// MEMBER ACTIONS

	*inviteMembersToGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const emails = context.request.fields.emails;
		try {
			context.body = yield this.groupService.inviteUsersToGroup( userId, groupSlug, emails );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*acceptInvitation( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const invitationKey = context.params.invitationKey;
		try {
			context.body = yield this.groupService.acceptGroupInvitation( userId, groupSlug, invitationKey );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*joinGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			context.body = yield this.groupService.joinGroup( userId, groupSlug );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*leaveGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			context.body = yield this.groupService.leaveGroup( userId, groupSlug );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*approveUser( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const memberId = context.params.userId;
		try {
			context.body = yield this.groupService.approveUser( groupSlug, userId, memberId );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*promoteUserToAdmin( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const memberId = context.params.userId;
		try {
			context.body = yield this.groupService.promoteUserToAdmin( groupSlug, userId, memberId );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*degradeUserFromAdmin( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const memberId = context.params.userId;
		try {
			context.body = yield this.groupService.degradeUserFromAdmin( groupSlug, userId, memberId );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*kickUserFromGroup( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		const memberId = context.params.userId;
		try {
			context.body = yield this.groupService.kickUserFromGroup( groupSlug, userId, memberId );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	*getGroupMembersByPage( context ) {
		const userId = context.session.user.id;
		const groupSlug = context.params.groupSlug;
		try {
			context.body = yield this.groupService.getGroupMembersByPage( groupSlug, userId, context.query.page );
		} catch( e ) {
			console.error(e, e.stack);
			context.throw( 400 );
		}
	}

	static get instance() {
		if( !this.singleton ) {
			const groupService = GroupService.instance;
			const collectionService = CollectionService.instance;
			this.singleton = new GroupController( groupService, collectionService );
		}
		return this.singleton;
	}

}

module.exports = GroupController;