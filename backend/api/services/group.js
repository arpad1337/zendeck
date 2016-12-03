/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user');
const Util = require('../../util/util');

class GroupService {
	
	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
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
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findOne({
			where: {
				userId: userId,
				groupId: groupId
			},
			attributes: ['id']
		}).then((model) => {
			if( !model ) {
				return GroupMemberModel.findOne({
					where: {
						userId: userId,
						groupId: groupId,
						isAdmin: true
					}
				}).then((f) => !!f);
			}
			return true;
		})
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
			return this.isUserAdminOfGroup( userId, model.id );
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
		});
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
			return this.isUserAdminOfGroup( adminId, model.id ).then((isAdmin) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupMemberModel.update({
					approved: true
				}, {
					where: {
						userId: userId,
						groupId: model.id
					}
				}).then( _ => true);
			});
		});
	}

	kickUserFromGroup( slug, adminId, userId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( adminId, model.id ).then((isAdmin) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupMemberModel.update({
					approved: false
				}, {
					where: {
						userId: userId,
						groupId: model.id
					}
				}).then( _ => true);
			});
		});
	}

	promoteUserToAdmin( slug, adminId, userId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( adminId, model.id ).then((isAdmin) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupMemberModel.update({
					isAdmin: true
				}, {
					where: {
						userId: userId,
						groupId: model.id
					}
				}).then( _ => true);
			});
		});
	}

	degradeUserFromAdmin( slug, adminId, userId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( adminId, model.id ).then((isAdmin) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupMemberModel.update({
					isAdmin: false
				}, {
					where: {
						userId: userId,
						groupId: model.id
					}
				}).then( _ => true);
			});
		});
	}

	getGroupMembersByPage( slug, userId, page ) {
		page = isNaN( page ) ? 1 : 0;
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( adminId, model.id ).then((isAdmin) => {
				if( !isAdmin ) {
					if( !model.isOpen || !model.isPublic ) {
						throw new Error('Unauthorized');
					}
					return GroupMemberModel.findAll({
						where: {
							groupId: model.id
						},
						limit: 20,
						offset: (( page - 1 ) * 20)
					});
				}
				return GroupMemberModel.findAll({
					where: {
						approved: true,
						groupId: model.id
					},
					limit: 20,
					offset: (( page - 1 ) * 20)
				});
			}).then((members) => {
				let members = new Map();
				let ids = new Set();
				members.forEach(( m ) => {
					ids.add( m.get('userId') );
					members.set( m.get('userId'), m.get() );
				});
				return this.userService.getUsersAuthorViewByIds( ids ).then((profiles) => {
					profiles = profiles.map(( profile ) => {
						profile.isAdmin = members.get(profile.id).isAdmin;
						profile.approved = members.get(profile.id).approved;
						return profile;
					});
					return profiles;
				});
			});
		});
	}

	getAllMembersById( groupId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findAll({
			where: {
				id: groupId
			},
			attributes: ['userId']
		}).then((ids) => {
			if( !ids ) {
				return [];
			}
			return ids.map(id => id.get('userId'));
		})
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			this.singleton = new GroupService( databaseProvider, userService );
		}
		return this.singleton;
	}

}

module.exports = GroupService;