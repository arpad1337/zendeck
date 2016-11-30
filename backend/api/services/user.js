/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');
const Util = require('../../util/util');
const WorkerService = require( '../services/worker' );
const S3Provider = require( '../../providers/s3' );

class UserService {

	constructor( databaseProvider, workerService, s3Provider ) {
		this.databaseProvider = databaseProvider;
		this.workerService = workerService;
		this.s3Provider = s3Provider;
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

	updateUser( id, payload ) {
		const UserModel = this.databaseProvider.getModelByName( 'user' );
		return UserModel.update( payload, {
			where: {
				id: id
			}
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

	_scheduleProfilePicResizingOperation( userId, tempFilename, contentType ) {
		this.workerService.launchWorkerWithTypeAndStartParams( this.workerService.WORKER_TYPES.PROFILE_PIC_POSTPROCESS, {
			tempFilename: tempFilename,
			contentType: contentType
		}).then((photos) => {
			return this.getUserById( userId ).then((user) => {
				let userPhotos = user.photos;
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
				let userPhotos = user.photos;
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