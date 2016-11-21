/*
 * @rpi1337
 */

const UserService = require( './user' );
const Util = require('../../util/util');
const OTP_SECRET = require('../../config/secrets').OTP_SECRET;
const HTMLEMailFactory = require('../../util/html-email-factory');
const DatabaseProvider = require('../../providers/database');
const EmailProvider = require('../../providers/email');

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
			throw new Error('User not exists');
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
			throw new Error('User not exists');
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
						ACTION_URL: 'http://dev.zendeck.co/#/password-reset/' + signature,
						USERNAME: user.username,
						DATE: now
					});
					return this.emailProvider.sendEmail( user.email, email.subject, email.body );
				}).then(() => {
					return true;
				}).catch((e) => {
					console.log(e, e.stack);
					return false;
				});
			}
			throw new Error('User not found');
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