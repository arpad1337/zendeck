/*
 * @rpi1337
 */

import STATES from '../config/states';

class ApplicationController {

	static get $inject() {
		return [
			'UserService',
			'MessageBusService',
			'$state'
		];
	}

	constructor( userService, messageBusService, $state ) {
		this.userService = userService;
		this.messageBusService = messageBusService;
		this.$state;

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

}

export default ApplicationController;