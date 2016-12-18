/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');

const Util = require('../../util/util');
const WorkerService = require( '../services/worker' );
const S3Provider = require( '../../providers/s3' );

const striptags = require('striptags');

class UserService {

	static get allowedFields() {
		return [
			'password',
			'fullname',
			'isBusiness',
			'profileColor',
			'about'
		]
	}

	constructor( databaseProvider, workerService, s3Provider ) {
		this.databaseProvider = databaseProvider;
		this.workerService = workerService;
		this.s3Provider = s3Provider;
	}

	quickSearch( userId, predicate ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				$or: [{
					username: {
						$iLike: predicate + '%'
					}
				},{
					fullname: {
						$iLike: predicate + '%'
					}
				},{
					email: {
						$iLike: predicate + '%'
					}
				}],
				id: {
					$ne: userId
				}
			},
			limit: 10
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return models.map((model) => {
				return {
					key: model.get('username'),
					type: 'user',
					data: model.getAuthorView()
				};
			});
		});
	}

	searchByPredicateAndPage( userId, predicate, page ) {
		page = isNaN( page ) ? 1 : page;
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				$or: [{
					username: {
						$iLike: predicate + '%'
					}
				},{
					fullname: {
						$iLike: predicate + '%'
					}
				},
				{
					email: {
						$iLike: predicate + '%'
					}
				}],
				id: {
					$ne: userId
				}
			},
			limit: 20,
			offset: ((page - 1) * 20)
		}).then((models) => {
			if( !models ) {
				return [];
			}
			return models.map( (model) => model.getAuthorView() );
		});
	}

	searchUserByKeyword( usernameOrEmail ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		usernameOrEmail = String(usernameOrEmail).trim();
		return UserModel.findOne({
			where: {
				$or: [
					{
						username: usernameOrEmail
					},
					{
						email: usernameOrEmail
					}
				]
			}
		}).then( (model) => {
			if( model ) {
				return model.get();
			}
			throw new Error('User not found');
		});
	}

	getUserByEmail( email ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findOne({
			where: {
				email: email.trim()
			}
		}).then( model => model.getPublicView() );
	}

	getUserById( id ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		id = Number( id );
		return UserModel.findOne({
			where: {
				id: id
			}
		}).then( model => model.getPublicView() );
	}

	getFullUserById( id ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		id = Number( id );
		return UserModel.findOne({
			where: {
				id: id
			}
		}).then( model => model.get() );
	}

	getUserAuthorViewById( id ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		id = Number( id );
		return UserModel.findOne({
			where: {
				id: id
			}
		}).then( model => model.getAuthorView() );
	}

	getUserByUsername( username ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findOne({
			where: {
				username: username,
				enabled: true,
				$or: [{
					status: 'SUBMITED'
				}, {
					status: 'REGISTERED'
				}]
			}
		}).then( model => model.getPublicView() );
	}

	getUserAuthorViewByUsername( username ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		id = Number( id );
		return UserModel.findOne({
			where: {
				username: username,
				enabled: true,
				$or: [{
					status: 'SUBMITED'
				}, {
					status: 'REGISTERED'
				}]
			}
		}).then( model => model.getAuthorView() );
	}

	getUsersAuthorViewByIds( ids ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				id: ids,
				enabled: true,
				$or: [{
					status: 'SUBMITED'
				}, {
					status: 'REGISTERED'
				}]
			}
		}).then( models => {
			return models.map( model => model.getAuthorView() );
		});
	}

	getUsersByIds( ids ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				id: ids,
				enabled: true,
				$or: [{
					status: 'SUBMITED'
				}, {
					status: 'REGISTERED'
				}]
			}
		}).then( models => {
			return models.map( model => model.getPublicView() );
		});
	}

	getUsersByEmails( emails ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				email: emails,
				enabled: true,
				$or: [{
					status: 'SUBMITED'
				}, {
					status: 'REGISTERED'
				}]
			}
		}).then( models => {
			return models.map( model => model.getPublicView() );
		});
	}

	createUser( payload ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.create({
			username: payload.username,
			email: payload.email,
			password: payload.password,
			fullname: payload.fullname,
			isBusiness: payload.isBusiness,
			termsAccepted: payload.termsAccepted,
			profileColor: Util.generateRandomColor()
		});
	}

	updateProfile( id, fields ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		let fieldKeys = Object.keys( fields );
		let updateable = Util.findCommonElements( [ UserService.allowedFields, fieldKeys ] );
		let payload = {};
		updateable.forEach((key) => {
			if( key == 'password' ) {
				payload[ key ] = Util.createSHA256HashForPassword( fields.password );
			} else {
				payload[ key ] = Util.trim( fields[ key ] );
			}
		});
		return this.updateUser( id, payload );

	}

	updateUser( id, payload ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		if( payload.about ) {
			payload.about = striptags( payload.about );
		}
		return UserModel.update( payload, {
			where: {
				id: id
			}
		}).then(() => {
			return this.getUserById( id );
		});
	}

	updateProfilePic( userId, file ) {
		const fileExtension = file.name.split('.').pop();
		const newFileName = Util.createSHA256Hash( [userId, file.name].join('_') ) + '_' + Date.now() + '.' + fileExtension;
		return this.s3Provider.putObject( this.s3Provider.OBJECT_TYPES.TEMP, newFileName, file ).then((response) => {
			this._scheduleProfilePicResizingOperation( userId, response.tempFilename, file.type );
			return response.url;
		});
	}

	updateCoverPic( userId, file ) {
		const fileExtension = file.name.split('.').pop();
		const newFileName = Util.createSHA256Hash( [userId, file.name].join('_') ) + '_' + Date.now() + '.' + fileExtension;
		return this.s3Provider.putObject( this.s3Provider.OBJECT_TYPES.TEMP, newFileName, file ).then((response) => {
			this._scheduleCoverPicResizingOperation( userId, response.tempFilename, file.type );
			return response.url;
		});
	}

	deleteCoverPic( userId ) {
		return this.getUserById( userId ).then((user) => {
			let newPhotos = user.photos;
			delete newPhotos.cover;
			return this.updateUser( userId, {
				photos: newPhotos
			})
		});
	}

	deleteProfilePic( userId ) {
		return this.getUserById( userId ).then((user) => {
			let newPhotos = {
				cover: user.photos.cover
			};
			return this.updateUser( userId, {
				photos: newPhotos
			})
		});
	}

	_scheduleProfilePicResizingOperation( userId, tempFilename, contentType ) {
		this.workerService.launchWorkerWithTypeAndStartParams( this.workerService.WORKER_TYPES.PROFILE_PIC_POSTPROCESS, {
			tempFilename: tempFilename,
			contentType: contentType
		}).then((photos) => {
			return this.getUserById( userId ).then((user) => {
				let userPhotos = user.photos || {};
				Object.keys( photos ).forEach((key) => {
					userPhotos[key] = photos[ key ];
				});
				return this.updateUser(userId, {
					photos: userPhotos
				});
			});
		}).catch((e) => {
			console.error(e, e.stack);
		});
	}

	_scheduleCoverPicResizingOperation( userId, tempFilename, contentType ) {
		this.workerService.launchWorkerWithTypeAndStartParams( this.workerService.WORKER_TYPES.COVER_PIC_POSTPROCESS, {
			tempFilename: tempFilename,
			contentType: contentType
		}).then((photo) => {
			return this.getUserById( userId ).then((user) => {
				let userPhotos = user.photos || {};
				userPhotos.cover = photo;
				return this.updateUser(userId, {
					photos: userPhotos
				});
			});
		}).catch((e) => {
			console.error(e, e.stack);
		});
	}

	getRandomUsersWithExcludingIds( ids ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.findAll({
			where: {
				id: {
					$notIn: ids
				}
			},
			order: [
			    ['updated_at', 'DESC'],
			    ['created_at', 'DESC']
			],
			limit: 10
		}).then( models => {
			return models.map( model => model.getPublicView() );
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const workerService = WorkerService.instance;
			const s3Provider = S3Provider.instance;
			this.singleton = new UserService( databaseProvider, workerService, s3Provider );
		}
		return this.singleton;
	}

};

module.exports = UserService;