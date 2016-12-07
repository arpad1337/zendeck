/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const UserService = require('./user');
const NotificationService = require('./notification');
const InvitationService = require('./invitation');

const WorkerService = require( '../services/worker' );
const S3Provider = require( '../../providers/s3' );

const Util = require('../../util/util');
const striptags = require('striptags');

const HTMLEMailFactory = require('../../util/html-email-factory');
const EmailProvider = require('../../providers/email');
const ENV = require('../../config/environment');

class GroupService {
	
	static get allowedFields() {
		return [
			'name',
			'isOpen',
			'isModerated',
			'isPublic',
			'profileColor',
			'about'
		]
	}

	constructor( databaseProvider, userService, workerService, s3Provider, notificationService, emailProvider, invitationService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.workerService = workerService;
		this.s3Provider = s3Provider;
		this.notificationService = notificationService;
		this.emailProvider = emailProvider;
		this.invitationService = invitationService;
	}

	quickSearch( predicate ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findAll({
			where: {
				name: {
					$like: predicate + '%'
				}
			},
			limit: 10
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return models.map((model) => {
				return {
					key: model.name,
					type: 'group',
					data: model.get()
				}
			});
		})
	}

	searchByPredicateAndPage( predicate, page ) {
		page = isNaN( page ) ? 1 : page;
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return GroupModel.findAll({
			where: {
				name: {
					$like: predicate + '%'
				},
				isPublic: true
			},
			limit: 20,
			offset: ((page - 1) * 20)
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return Promise.all( models.map( (model) => this._createViewFromDBModel( model ) ) );
		})
	}

	inviteUsersToGroup( userId, groupSlug, emails ) {
		return this.userService.getUsersByEmails( emails ).then((users) => {
			let userIds = users.map((user) => {
				return user.id;
			});
			return this.getGroupBySlug( groupSlug ).then((group) => {
				return this.isUserApprovedMemberOfGroup( userId, group.id ).then((isApproved) => {
					if( !isApproved ) {
						throw new Error('Unauthorized');
					}
					return this.invitationService.createInvitation( userId, 'GROUP_INVITATION', {
						group: {
							id: group.id
						},
						emails: emails
					}).then((invitationKey) => {
						const email = HTMLEMailFactory.createGroupInvitationEmail({
							ACTION_URL: ENV.BASE_URL + '/groups/' + groupSlug + '/invitation/' + invitationKey,
							USERNAME: user.username,
							FULLNAME: user.fullname,
							GROUPNAME: group.name
						});
						return this.emailProvider.sendEmail( emails, email.subject, email.body );
					}).then(() => {
						return true;
					}).catch((e) => {
						return false;
					}).then(() => {
						return Promise.all( userIds.map((id) => {
							return this.notificationService.createNotification( id, this.notificationService.NOTIFICATION_TYPE.GROUP_INVITATION, {
								user: {
									id: userId
								},
								group: {
									id: group.id
								}
							});
						}));
					});
				});
			});
		});
	}

	acceptGroupInvitation( userId, invitationKey ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.invitationService.resolveInvitation( invitationKey ).then((invitation) => {
			if( invitation ) {
				return this.userService.getUserById( userId ).then((user) => {
					if( invitation.payload.emails.indexOf( user.email ) === -1 ) {
						throw new Error('Unauthorized');
					}
					return GroupMemberModel.update({
						approved: true
					}, {
						where: {
							userId: userId,
							groupId: invitation.payload.group.id
						}
					}).then( _ => {
						return this.notificationService.createNotification( invitation.userId, this.notificationService.NOTIFICATION_TYPE.GROUP_INVITATION_ACCEPTED, {
							user: {
								id: userId
							},
							group: {
								id: invitation.payload.group.id
							}
						});
					});
				});
			}
		});
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

	getGroupViewsByUserAndPage( userId, page ) {
		page = isNaN( page ) ? 1 : page;
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findAll({
			where: {
				userId: userId
			},
			attributes: ['groupId'],
			group: ['group_id'],
			limit: 20,
			offset: ((page - 1) * 20)
		}).then((groups) => {
			if( !groups ) {
				return [];
			}
			groups = groups.map( group => group.get('groupId'));
			return this.getGroupsByIds( groups ).then((models) => {
				return Promise.all( models.map((model) => {
					return this._createViewFromDBModel( model );
				}));
			});
		})

		// return this.getGroupBySlug(slug).then((model) => {
		// 	return this._createViewFromDBModel( model ).then((model) => {
		// 		return this.isUserMemberOfGroup( userId, model.id ).then((yes) => {
		// 			model.userIsMember = yes;
		// 			return model;
		// 		});
		// 	});
		// });
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

	isUserApprovedMemberOfGroup( userId, groupId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findOne({
			where: {
				userId: userId,
				groupId: groupId,
				approved: true
			}
		}).then((f) => !!f);
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
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		let model = {
			userId: userId,
			slug: Util.createSHA256Hash( userId + payload.name ),
			isPublic: payload.isPublic,
			isModerated: payload.isModerated || false,
			isOpen: payload.isOpen || true,
			name: payload.name,
			about: striptags(payload.about),
			profileColor: Util.generateRandomColor()
		}
		return GroupModel.create( model ).then((model) => {
			return GroupMemberModel.create({
				groupId: model.id,
				userId: userId,
				approved: true
			}).then(() => {
				return this._createViewFromDBModel( model );
			});
		});
	}

	updateGroupByUserAndSlug( userId, slug, payload ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( userId, model.id ).then(( isAdmin ) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupModel.update( payload, {
					where: {
						id: model.id
					}	
				}).then(( model ) => {
					return this.getGroupViewByUser( userId, model.slug );
				});
			});
		});
	}

	updateGroupProfileBySlug( userId, slug, payload ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( userId, model.id ).then(( isAdmin ) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				let fieldKeys = Object.keys( fields );
				let updateable = Util.findCommonElements( [ GroupService.allowedFields, fieldKeys ] );
				let payload = {};
				updateable.forEach((key) => {
					if( key == 'about' ) {
						payload.about = striptags( payload.about );
					} else {
						payload[ key ] = Util.trim( fields[ key ] );
					}
				});
				return GroupModel.update( payload, {
					where: {
						id: model.id
					}	
				}).then(( model ) => {
					return this.getGroupViewByUser( userId, model.slug );
				});
			});
		});
	}

	updateGroupByUserAndId( userId, id, payload ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupById(id).then((model) => {
			return this.isUserAdminOfGroup( userId, model.id ).then(( isAdmin ) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return GroupModel.update( payload, {
					where: {
						id: model.id
					}	
				}).then(( model ) => {
					return this.getGroupViewByUser( userId, model.slug );
				});
			});
		});
	}

	updateCoverPic( userId, slug, file ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( userId, model.id ).then(( isAdmin ) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				const fileExtension = file.name.split('.').pop();
				const newFileName = Util.createSHA256Hash( [userId, file.name].join('_') ) + '_' + Date.now() + '.' + fileExtension;
				return this.s3Provider.putObject( this.s3Provider.OBJECT_TYPES.TEMP, newFileName, file ).then((response) => {
					this._scheduleCoverPicResizingOperation( userId, response.tempFilename, file.type );
					return response.url;
				});
			});
		});
	}

	deleteGroupBySlug( userId, slug ) {
		const GroupModel = this.databaseProvider.getModelByName( 'group' );
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return this.getGroupBySlug(slug).then((model) => {
			return this.isUserAdminOfGroup( userId, model.id ).then(( isAdmin ) => {
				if( !isAdmin ) {
					throw new Error('Unauthorized');
				}
				return Promise.all([
					GroupModel.destroy({
						where: {
							id: model.id
						}
					}),
					GroupMemberModel.destroy({
						where: {
							groupId: model.id
						}
					})
				]).then( _ => true );
			});
		});
	}

	// MEMBER ACTIONS

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
			}).then(() => {
				if( !model.isOpen ) {
					return this.notificationService.createNotification( model.userId, this.notificationService.NOTIFICATION_TYPE.GROUP_JOIN_REQUEST, {
						user: {
							id: userId
						},
						group: {
							id: model.id
						}
					});
				}
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
				let membersMap = new Map();
				let ids = new Set();
				members.forEach(( m ) => {
					ids.add( m.get('userId') );
					membersMap.set( m.get('userId'), m.get() );
				});
				return this.userService.getUsersAuthorViewByIds( ids ).then((profiles) => {
					profiles = profiles.map(( profile ) => {
						profile.isAdmin = membersMap.get(profile.id).isAdmin;
						profile.approved = membersMap.get(profile.id).approved;
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
				groupId: groupId
			},
			attributes: ['userId']
		}).then((ids) => {
			if( !ids ) {
				return [];
			}
			return ids.map(id => id.get('userId'));
		})
	}

	checkMember( groupId, memberId ) {
		const GroupMemberModel = this.databaseProvider.getModelByName( 'group' );
		return GroupMemberModel.findOne({
			where: {
				groupId: groupId,
				userId: userId,
				approved: true
			}
		}).then((r) => !!r);
	}

	// POSTPROCESSES

	// TODO: file upload & encryption

	_scheduleCoverPicResizingOperation( userId, groupId, tempFilename, contentType ) {
		this.workerService.launchWorkerWithTypeAndStartParams( this.workerService.WORKER_TYPES.COVER_PIC_POSTPROCESS, {
			tempFilename: tempFilename,
			contentType: contentType
		}).then((photo) => {
			return this.getGroupById( groupId ).then((group) => {
				let groupPhotos = group.photos || {};
				groupPhotos.cover = photo;
				return this.updateGroupByUserAndId(userId, groupId, {
					photos: groupPhotos
				});
			});
		}).catch((e) => {
			console.error(e, e.stack);
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const notificationService = NotificationService.instance;
			const workerService = WorkerService.instance;
			const s3Provider = S3Provider.instance;
			const emailProvider = EmailProvider.instance;
			const invitationService = InvitationService.instance;
			this.singleton = new GroupService( databaseProvider, userService, workerService, s3Provider, notificationService, emailProvider, invitationService );
		}
		return this.singleton;
	}

}

module.exports = GroupService;