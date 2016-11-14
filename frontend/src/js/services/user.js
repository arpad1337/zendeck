/*
 * @rpi1337
 */

class UserService {

	static get $inject() {
		return [
			"$http",
			"MessageBusService"
		];
	}

	constructor( $http, messageBusService ) {
		this.$http = $http;
		this.messageBusService = messageBusService;
		this._currentUser = null;
	}

	get currentUser() {
		return this._currentUser;
	}

	getCurrentUser() {
		return this.$http.get(CONFIG.API_PATH + '/user/me').then((r) => {
			let isFirstAttempt = this.isUserLoggedIn;
			this._currentUser = r.data;
			if( isFirstAttempt ) {
				this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGIN, this._currentUser );
			}
		});
	}

	isUserLoggedIn() {
		return ( this._currentUser != null );
	}

	login( userNameOrEmail, password ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/login' ).then((r) => {
			this._currentUser = r.data;
			this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGIN, this._currentUser );
		});
	}

	logout() {
		return this.$http.post( CONFIG.API_PATH + '/auth/logout' ).then((r) => {
			this._currentUser = null;
			this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGOUT );
		});
	}

}

export default UserService;