/*
 * @rpi1337
 */

const UserService = require( './user' );
const NotificationService = require('./notification');
const InvitationService = require('./invitation');

const Util = require('../../util/util');
const OTP_SECRET = require('../../config/secrets').OTP_SECRET;
const HTMLEMailFactory = require('../../util/html-email-factory');
const DatabaseProvider = require('../../providers/database');
const EmailProvider = require('../../providers/email');

const ENV = require('../../config/environment');

class AuthService {

	constructor( databaseProvider, userService, emailProvider, invitationService ) {
		this.databaseProvider = databaseProvider;
		this.userService = userService;
		this.emailProvider = emailProvider;
		this.invitationService = invitationService;
	}

	get notificationService() {
		if( !this._notificationService ) {
			this._notificationService = NotificationService.instance;
		}
		return this._notificationService;
	}

	getSystemUser() {
		return this.userService.getUserByUsername('system');
	}

	login( usernameOrEmail, password ) {
		return this.userService.searchUserByKeyword( usernameOrEmail ).then((user) => {
			if( user &&
				user.password == Util.createSHA256HashForPassword( password ) &&
				user.enabled
			) {				
				return this.userService.getUserById( user.id );
			}
			throw new Error('Password mismatch');
		});
	}

	checkUsernameAvailability( username ) {
		return this.userService.getUserByUsername( username ).then( _ => {
			return true;
		}).catch(() => {
			return false;
		});
	}

	checkEmailAvailability( email ) {
		return this.userService.getUserByEmail( email ).then( _ => {
			return true;
		}).catch(() => {
			return false;
		});
	}

	register( email, password, username, fullname, isBusiness, termsAccepted ) {
		if( !termsAccepted ) {
			throw new Error('Terms and conditions not accepted');
		}
		return this.userService.createUser({
			email: email,
			password: Util.createSHA256HashForPassword( password ),
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

	inviteUsers( userId, emails ) {
		return this.userService.getUserById( userId ).then((user) => {
			return this.invitationService.createInvitation( userId, 'PLATFORM_INVITATION' ).then((invitationKey) => {
					const email = HTMLEMailFactory.createPlatformInvitationEmail({
						ACTION_URL: ENV.BASE_URL + '/invitation/' + invitationKey,
						USERNAME: user.username,
						FULLNAME: user.fullname
					});
					return this.emailProvider.sendEmail( emails, email.subject, email.body );
				}).then(() => {
					return true;
				}).catch((e) => {
					return false;
				});
		});
	}

	sendFeedback( userId, content ) {
		return this.userService.getUserById( userId ).then((user) => {
			let body = ` User: ${user.fullname} <small>${user.username}</small> - ${user.email} has sent feedback:

				${content}
			`;
			return this.emailProvider.sendEmail( 'arpad@zendeck.co', '[ZenDeck] User feedback', body);
		});
	}

	acceptInvitation( userId, invitationKey ) {
		return this.invitationService.resolveInvitation( invitationKey ).then((invitation) => {
			if( invitation ) {
				return this.notificationService.createNotification( invitation.userId, this.notificationService.NOTIFICATION_TYPE.PLATFORM_INVITATION_ACCEPTED, {
					user: {
						id: userId
					}
				}).then(() => {
					return this.userService.updateUser( userId, {enabled: true} );
				});
			}
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
						ACTION_URL: ENV.BASE_URL + '/password-reset/' + signature,
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
			const invitationService = InvitationService.instance;
			this.singleton = new AuthService( databaseProvider, userService, emailProvider, invitationService );
		}
		return this.singleton;
	}

}

module.exports = AuthService;