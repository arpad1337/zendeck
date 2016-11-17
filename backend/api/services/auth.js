/*
 * @rpi1337
 */

const UserService = require( './user' );
const Util = require('../../util/util');
const OTP_SECRET = require('../../config/secrets').OTP_SECRET;

class AuthService {

	constructor( userService, emailProvider ) {
		this.userService = userService;
		this.emailProvider = emailProvider;
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

	forgotPassword( usernameOrEmail ) {
		return this.searchUserByKeyword( usernameOrEmail ).then((user) => {
			if( user ) {
				const OTPModel = this.databaseProvider.getModelByName( 'otp' );
				const OTP = Math.floor( Math.random() * (1000000 - 1) );
				const signature = Util.createSignatureForKey( OTP, OTP_SECRET );
				const now = new Date();
				return OTPModel.create({
					userId: user.id,
					pincode: signature,
					expiration: ( now.setSeconds( now.getSeconds() + 60 * 5 ) ),
					type: 'PASSWORD_RESET'
				}).then(() => {
					return this.emailProvider.sendForgotPasswordEmail( user.fullname, user.email, OTP );
				}).then(() => {
					return true;
				}).catch(() => {
					return false;
				});
			}
			throw new Error('User not found');
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			const emailProvider = { // mock for now
				sendForgotPasswordEmail: () => {
					console.log( arguments );
					return Promise.resolve(true);
				}
			}
			this.singleton = new AuthService( userService, emailProvider );
		}
		return this.singleton;
	}

}

module.exports = AuthService;