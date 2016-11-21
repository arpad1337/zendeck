/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');

class UserService {

	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
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
		return UserModel.find({
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
			termsAccepted: payload.termsAccepted
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

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new UserService( databaseProvider );
		}
		return this.singleton;
	}

};

module.exports = UserService;