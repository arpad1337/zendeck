/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const Util = require('../../util/util');

class GroupService {
	
	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
	}

	getGroupViewByUser( userId, slug ) {
		return this.getGroupBySlug(slug).then((model) => {
			return this._createViewFromDBModel( model ).then((model) => {
				return this.isUserMemberOfGroup( userId, model.id ).then((yes) => {
					model.userIsMember = yes;
					return model;
				});
			});
		});
	}

	getGroupBySlug( slug ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findOne({
			where: {
				slug: slug
			}
		}).then((model) => {
			if( model ) {
				model = model.get();
			}
			return model;
		});
	}

	getGroupById( id ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findOne({
			where: {
				id: id
			}
		}).then((model) => {
			if( model ) {
				model = model.get();
			}
			return model;
		});
	}

	getGroupsByIds( ids ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findAll({
			where: {
				id: ids
			}
		}).then((models) => {
			if( models ) {
				return models.map( model => model.get() );
			}
			return [];
		});
	}

	_createViewFromDBModel( model ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findAll({
			where: {
				groupId: model.id,
				isAdmin: true
			}
		}).then((admins) => {
			if( admins ) {
				admins = admins.map(( admin ) => {
					return admin.get('userId');
				});
			}
			model.admins = admins;
			return GroupMemberModel.count({
				where: {
					groupId: model.id
				}
			});
		}).then((count) => {
			model.memberCount = count;
			return model;
		});
	}

	isUserMemberOfGroup( userId, groupId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findOne({
			where: {
				userId: userId,
				groupId: groupId
			}
		}).then((f) => !!f);
	}

	isUserAdminOfGroup( userId, groupId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findOne({
			where: {
				userId: userId,
				groupId: groupId,
				isAdmin: true
			}
		}).then((f) => !!f);
	}

	createGroup( userId, payload ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		let model = {
			userId: userId,
			slug: Util.createSHA256Hash( userId + payload.name ),
			isPublic: payload.isPublic,
			isModerated: payload.isModerated,
			isOpen: payload.isOpen,
			name: payload.name,
			about: striptags(payload.about),
			profileColor: Util.generateRandomColor()
		}
		return GroupModel.create( model ).then( model => model.get() );
	}

	updateGroupByUserAndSlug( userId, slug, payload ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			if( model.userId != userId ) {
				return this.isUserAdminOfGroup( userId, model.id );
			}
			return true;
		}).then(( isAdmin ) => {
			if( !isAdmin ) {
				throw new Error('Unauthorized');
			}
			return GroupModel.update( payload, {
				where: {
					id: groupId
				}	
			}).then(( model ) => {
				return this.getGroupViewByUser( userId, model.slug );
			});
		})
	}

	joinGroup( userId, slug ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return GroupMemberModel.create({
				groupId: model.id,
				userId: userId,
				approved: model.isOpen
			}).then(() => {
				return true;
			}).catch(() => {
				return GroupMemberModel.restore({
					where: {
						groupId: model.id,
						userId: userId
					}
				}).then(() => {
					return true;
				});
			})
		});
	}

	leaveGroup( userId, slug ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return GroupMemberModel.destroy({
				where: {
					groupId: model.id,
					userId: userId
				}
			});
		});
	}

	approveUser( slug, adminId, userId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( adminId, model.id ).then(() => {
				return GroupMemberModel.update({
					approved: true
				}, {
					where: {
						groupId: model.id
					}
				}).then( _ => true);
			});
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new GroupService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = GroupService;