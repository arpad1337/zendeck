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
		this.$rootScope.$on('$stateChangeSuccess', (e, newState) => {
			if( newState.name === STATES.LANDING && this.isUserLoggedIn ) {
				e.preventDefault();
				this.$state.go( STATES.APPLICATION.FEED.POSTS );
			}
		})
		this.userService.getCurrentUser();
	}

	get isUserLoggedIn() {
		return this.userService.isUserLoggedIn;
	}

	get currentUser() {
		return this.userService.currentUser;
	}

	_onUserLoggedOut() {
		this.$state.go( STATES.LANDING );
	}

	_onUserLoggedIn() {
		if( this.$state.current.name == STATES.LANDING ) {
			this.$state.go( STATES.APPLICATION.FEED.POSTS );
		}
	}

	gotoIndex() {
		if( this.isUserLoggedIn ) {
			this.$state.go(STATES.APPLICATION.FEED.POSTS);
			return;
		}
		this.$state.go(STATES.LANDING);
	}

	openLoginModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.LOGIN, {}, this.login.bind( this ) ).then(console.log.bind(console));
	}

	openRegisterModal() {
		let extension = {
			checkUsernameAvailability: this.checkUsernameAvailability.bind( this ),
			isUsernameAvailable: true
		}
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.REGISTER, extension, this.register.bind( this ) ).then(console.log.bind(console));
	}

	async checkUsernameAvailability( model ) {
		model.username = model.username.replace(/[^A-Za-z0-9]/g,'');
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
		}
	}

	async login( model ) {
		console.log(model);
		if( this.validateLogin( model ) ) {
			await this.userService.login( model.userOrEmail, model.password );
			model.dismiss();
		}
	}

	async logout() {
		await this.userService.logout();
		await this.$state.go( STATES.LANDING );
		this.$rootScope.$digest();
	}

	async register( model ) {
		if( this.validateRegistration( model ) ) {
			await this.userService.register({
				username: model.username,
				fullname: model.fullname,
				password: model.password,
				email: model.email,
				isBusiness: model.isBusiness || false
			});
			model.dismiss();
		}
	}

	validateRegistration( model ) {
		if( !Validator.validateEmail( model.email ) ) {
			return false;
		}

		// if( !Validator.validatePasswordStrength( model.password ) ) {
		// 	return false;
		// }

		if( Validator.isFieldEmpty( model.username ) ) {
			return false
		}

		return true;
	}

	validateLogin( model ) {
		// if( !Validator.validatePasswordStrength( model.password ) ) {
		// 	return false;
		// }

		if( Validator.isFieldEmpty( model.userOrEmail ) ) {
			return false
		}

		return true;
	}

}

export default ApplicationController;