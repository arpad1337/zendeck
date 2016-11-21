/*
 * @rpi1337
 */

const UserService = require( './user' );
const Util = require('../../util/util');
const OTP_SECRET = require('../../config/secrets').OTP_SECRET;
const HTMLEMailFactory = require('../../util/html-email-factory');
const DatabaseProvider = require('../../providers/database');
const EmailProvider = require('../../providers/email');

const ENV = require('../../config/environment');

class AuthService {

	constructor( databaseProvider, userService, emailProvider ) {
		this.databaseProvider = databaseProvider;
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
			throw new Error('Password mismatch');
		});
	}

	register( email, password, username, fullname, isBusiness, termsAccepted ) {
		if( !termsAccepted ) {
			throw new Error('Terms and conditions not accepted');
		}
		return this.userService.createUser({
			email: email,
			password: Util.createSHA256Hash( password ),
			username: username,
			fullname: fullname,
			isBusiness: isBusiness,
			termsAccepted: termsAccepted
		}).then((user) => {
			if( user ) {
				return this.userService.getUserById( user.id );
			}
			throw new Error('User doesn\'t exists');
		});
	}

	forgotPassword( usernameOrEmail ) {
		return this.userService.searchUserByKeyword( usernameOrEmail ).then((user) => {
			if( user ) {
				const OTPModel = this.databaseProvider.getModelByName( 'otp' );
				const OTP = Math.floor( Math.random() * (1000000 - 1) );
				const signature = Util.createSignatureForKey( OTP, OTP_SECRET );
				const now = new Date();
				const later = new Date();
				return OTPModel.create({
					userId: user.id,
					pincode: signature,
					expiration: ( later.setSeconds( now.getSeconds() + 60 * 5 ) ),
					type: 'PASSWORD_RESET'
				}).then(() => {
					const email = HTMLEMailFactory.createPasswordResetEmail({
						ACTION_URL: ENV.BASE_URL + '/#/password-reset/' + signature,
						USERNAME: user.username.toUpperCase(),
						DATE: now
					});
					return this.emailProvider.sendEmail( user.email, email.subject, email.body );
				}).then(() => {
					return true;
				}).catch((e) => {
					return false;
				});
			}
			throw new Error('User not found');
		});
	}

	resetPassword( signature, password ) {
		const OTPModel = this.databaseProvider.getModelByName( 'otp' );
		return OTPModel.findOne({
			where: {
				pincode: signature
			}
		}).then((OTP) => {
			if(!OTP) {
				throw new Error('Token mismatch');
			}
			OTP = OTP.get();
			const now = new Date();
			if( OTP.expiration < now ) {
				return OTPModel.destroy({
					where: {
						id: OTP.id
					}
				}).then( _ => {
					throw new Error('OTP expired');
				});
			}
			return this.userService.getUserById( OTP.userId ).then((user) => {
				return Promise.all([
					this.userService.updateUser( user.id, {
						password: Util.createSHA256Hash( password )
					}),
					OTPModel.destroy({
						where: {
							id: OTP.id
						}
					})
				]).then( _ => {
					return user;
				});
			});
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			const userService = UserService.instance;
			const emailProvider = EmailProvider.instance;
			this.singleton = new AuthService( databaseProvider, userService, emailProvider );
		}
		return this.singleton;
	}

}

module.exports = AuthService;