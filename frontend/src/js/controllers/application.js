/*
 * @rpi1337
 */

import STATES from '../config/states';

class ApplicationController {

	static get $inject() {
		return [
			'UserService',
			'MessageBusService',
			'$state',
			'ModalService'
		];
	}

	constructor( userService, messageBusService, $state, modalService ) {
		this.userService = userService;
		this.messageBusService = messageBusService;
		this.$state;
		this.modalService = modalService;
		window.modal = modalService;

		this._initializeApplication();
	}

	_initializeApplication() {
		this.messageBusService.on( this.messageBusService.MESSAGES.USER.LOGOUT, this._onUserLoggedOut );
		this.userService.getCurrentUser();
	}

	get isUserLoggedIn() {
		return this.userService.isUserLoggedIn;
	}

	_onUserLoggedOut() {
		this.$state.go( STATES.LANDING );
	}

	openLoginModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.LOGIN ).then(console.log.bind(console));
	}

	openRegisterModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.REGISTER ).then(console.log.bind(console));
	}

}

export default ApplicationController;