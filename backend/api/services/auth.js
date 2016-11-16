/*
 * @rpi1337
 */

const UserService = require( './user' );
const Util = require('../../util/util');

class AuthService {

	constructor( userService ) {
		this.userService = userService;
	}

	login( usernameOrEmail, password ) {
		return this.userService.searchUserByKeyword( usernameOrEmail ).then((user) => {
			if( user &&
				user.password == Util.createSHA256Hash( password ) &&
				user.enabled
			) {				
				return this.userService.getUserById( user.id );
			}
			throw new Error('User not exists');
		});
	}

	register( email, password, username, fullname, isBusiness ) {
		return this.userService.createUser({
			email: email,
			password: Util.createSHA256Hash( password ),
			username: username,
			fullname: fullname,
			isBusiness: isBusiness
		}).then((user) => {
			if( user ) {
				return this.userService.getUserById( user.id );
			}
			throw new Error('User not exists');
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			this.singleton = new AuthService( userService );
		}
		return this.singleton;
	}

}

module.exports = AuthService;