/*
 * @rpi1337
 */

import STATES from '../config/states';

import Validator from '../helpers/validator';

class ApplicationController {

	static get $inject() {
		return [
			'$rootScope',
			'UserService',
			'MessageBusService',
			'$state',
			'ModalService'
		];
	}

	constructor( $rootScope, userService, messageBusService, $state, modalService ) {
		this.$rootScope = $rootScope;
		this.userService = userService;
		this.messageBusService = messageBusService;
		this.$state = $state;
		this.modalService = modalService;

		window.APP = this;

		this._initializeApplication();
	}

	_initializeApplication() {
		this.messageBusService.on( this.messageBusService.MESSAGES.USER.LOGOUT, this._onUserLoggedOut.bind(this) );
		this.messageBusService.on( this.messageBusService.MESSAGES.USER.LOGIN, this._onUserLoggedIn.bind(this) );
		this.$rootScope.$on('$stateChangeStart', () => {
			$(window).scrollTop(0);
		});
		this.$rootScope.$on('$stateChangeSuccess', (e, newState) => {
			if( newState.name === STATES.LANDING && this.isUserLoggedIn ) {
				e.preventDefault();
				this.$state.go( STATES.APPLICATION.FEED.POSTS );
				return;
			}
			if( newState.name === STATES.PASSWORD_RESET ) {
				e.preventDefault();
				let otpSignature = this.$state.params.token;
				this.openPasswordResetModal( otpSignature );
				return;
			}
			if( newState.name == STATES.POST_VIEW ) {
				e.preventDefault();
				this.openPostViewModal();
				return;
			}
		});
		this.userService.getCurrentUser();
	}

	get isUserLoggedIn() {
		return this.userService.isUserLoggedIn;
	}

	get currentUser() {
		return this.userService.currentUser;
	}

	_onUserLoggedOut() {
		setTimeout(()  => {
			this.$state.go( STATES.LANDING );
			this.$rootScope.$digest();
		}, 1);
	}

	_onUserLoggedIn() {
		if( this.$state.current.name == STATES.LANDING ) {
			setTimeout(()  => {
				this.$state.go( STATES.APPLICATION.FEED.POSTS );
				this.$rootScope.$digest();
			}, 1);
		}
	}

	gotoIndex() {
		if( this.isUserLoggedIn ) {
			this.$state.go(STATES.APPLICATION.FEED.POSTS);
			return;
		}
		this.$state.go(STATES.LANDING);
	}

	openPostViewModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.VIEW_POST, {}).finally(() => {
			this.$state.go( STATES.APPLICATION.FEED.POSTS );
		});
	}

	openPasswordResetModal( signature ) {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.PASSWORD_RESET, {
			signature: signature,
			error: {
				backend: null,
				usernameOrEmail: null
			}
		}, this.resetPassword.bind( this )).then(console.log.bind(console));
	}

	openLoginModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.LOGIN, {
			error: {
				usernameOrEmail: null,
				backend: null,
			},
			gotoForgotPassword: this.openForgotPasswordModal.bind(this)
		}, this.login.bind( this ) ).then(console.log.bind(console));
	}

	openForgotPasswordModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.FORGOT_PASSWORD, {
			error: {
				usernameOrEmail: null
			}
		}, this.fogotPassword.bind( this ) ).then(console.log.bind(console));
	}

	openRegisterModal() {
		let extension = {
			checkUsernameAvailability: this.checkUsernameAvailability.bind( this ),
			checkEmailIfRegistered: this.checkEmailIfRegistered.bind( this ),
			checkPassword: this.checkPassword.bind( this ),
			isUsernameAvailable: true,
			isEmailNotRegistered: true,
			isBusiness: false,
			termsAccepted: false,
			gotoLogin: this.openLoginModal.bind( this ),
			error: {
				password: null,
				email: null,
				username: null,
				termsAccepted: null,
				backend: null
			}
		}
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.REGISTER, extension, this.register.bind( this ) ).then(console.log.bind(console));
	}

	async checkUsernameAvailability( model ) {
		model.username = model.username.replace(/[^A-Za-z0-9_-]/g,'');
		if( model.username.trim().length > 2 ) {
			if( !model.lock ) {
				model.lock = true;
				let username = model.username;
				console.log( 'ApplicationController->checkUsernameAvailability username', username );
				model.isUsernameAvailable = await this.userService.checkUsername( username );
				model.lock = false;
				if( model.username != username ) {
					// debouncing request
					model.lock = true;
					setTimeout(() => {
						model.lock = false;
						this.checkUsernameAvailability( model )
					}, 1000);
				}
			}
		} else {
			model.lock = false;
		}
	}

	async checkEmailIfRegistered( model ) {
		model.email = model.email.trim();
		if( Validator.validateEmail( model.email ) ) {
			if( !model.lock2 ) {
				model.lock2 = true;
				let email = model.email;
				console.log( 'ApplicationController->checkEmailIfRegistered email', email );
				model.isEmailNotRegistered = await this.userService.checkEmail( email );
				model.lock2 = false;
				if( model.email != email ) {
					// debouncing request
					model.lock2 = true;
					setTimeout(() => {
						model.lock2 = false;
						this.checkEmailIfRegistered( model )
					}, 1000);
				}
			}
		} else {
			model.lock2 = false;
			model.isEmailNotRegistered = true;
		}
	}

	checkPassword( model ) {
		if( !Validator.validatePasswordStrength( model.password ) ) {
			model.error.password = true;
			return false;
		} else {
			model.error.password = null;
		}
	}

	async login( model ) {
		if( this.validateLogin( model ) ) {
			try {
			await this.userService.login( model.userOrEmail, model.password );
			model.dismiss();
			} catch( e ) {
				if( e.status === 401 ) {
					// login disabled
					model.dismiss();
					this.modalService.openDialog( this.modalService.DIALOG_TYPE.LOGIN_BLOCKED );
					return;
				}
				model.error.backend = e.data;
			}
		}
	}

	async fogotPassword( model ) {
		try {
			await this.userService.fogotPassword( model.usernameOrEmail );
			model.dismiss();
			this.modalService.openDialog( this.modalService.DIALOG_TYPE.PASSWORD_RESET_SENT );
		} catch(e) {
			model.error.backend = e.message;
		}
	}

	async resetPassword( model ) {
		try {
			console.log(model);
			await this.userService.resetPassword( model.signature, model.password );
			model.dismiss();
			this.$state.go( STATES.APPLICATION.FEED.POSTS );
		} catch(e) {
			switch( e.status ) {
				case 403: {
					model.dismiss();
					this.modalService.openDialog( this.modalService.DIALOG_TYPE.LOGIN_DISABLED );
					return;
					break;
				}
				case 400: {
					break;
				}
			}
			model.error.backend = e.data;
		}
	}

	async logout() {
		await this.userService.logout();
		await this.$state.go( STATES.LANDING );
		this.$rootScope.$digest();
	}

	async register( model ) {
		if( this.validateRegistration( model ) ) {
			try {
				await this.userService.register({
					username: model.username,
					fullname: model.fullname,
					password: model.password,
					email: model.email,
					isBusiness: (model.isBusiness == "true"),
					termsAccepted: model.termsAccepted
				});
				model.dismiss();
			} catch( e ) {
				if( e.status === 403 ) {
					// login disabled
					model.dismiss();
					this.modalService.openDialog( this.modalService.DIALOG_TYPE.PREREG_SUCCESFUL );
					return;
				}
				model.error.backend = e.data;
			}
		}
	}

	validateRegistration( model ) {
		if( !Validator.validateEmail( model.email ) ) {
			model.error.email = true;
			return false;
		} else {
			model.error.email = null;
		}

		if( !Validator.validatePasswordStrength( model.password ) ) {
			model.error.password = true;
			return false;
		} else {
			model.error.password = null;
		}

		if( !Validator.validateUsername( model.username ) ) {
			model.error.username = true;
			return false
		} else {
			model.error.username = null;
		}

		if( Validator.isFieldEmpty( model.fullname ) ) {
			model.error.fullname = true
			return false
		} else {
			model.error.fullname = null;
		}

		if( !model.termsAccepted ) {
			model.error.termsAccepted = true;
			return false;
		} else {
			model.error.termsAccepted = null;
		}

		return true;
	}

	validateLogin( model ) {
		if( Validator.isFieldEmpty( model.password ) ) {
			return false;
		}

		if( Validator.isFieldEmpty( model.userOrEmail ) ) {
			return false
		}

		return true;
	}

}

export default ApplicationController;