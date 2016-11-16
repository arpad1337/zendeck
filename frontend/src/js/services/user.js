/*
 * @rpi1337
 */

class UserService {

	static get $inject() {
		return [
			"$q",
			"$http",
			"MessageBusService"
		];
	}

	constructor( $q, $http, messageBusService ) {
		this.$q = $q;
		this.$http = $http;
		this.messageBusService = messageBusService;
		this._currentUser = null;
	}

	get currentUser() {
		return this._currentUser;
	}

	getCurrentUser() {
		if( this._currentUser != null ) {
			return this.$q.resolve( this._currentUser );
		}
		return this.$http.get(CONFIG.API_PATH + '/user/me').then((r) => {
			let isFirstAttempt = !this.isUserLoggedIn;
			this._currentUser = r.data;
			if( isFirstAttempt ) {
				this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGIN, this._currentUser );
			}
			return this._currentUser;
		});
	}

	get isUserLoggedIn() {
		return ( this._currentUser != null );
	}

	login( usernameOrEmail, password ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/login', {
			usernameOrEmail: usernameOrEmail,
			password: password
		}).then((r) => {
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

	register( payload ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/register', payload ).then((r) => {
			this._currentUser = r.data;
			this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGIN );
		});
	}

	checkUsername() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(true)
		}, Math.random() * 1000);
		return promise.promise;
	}

	subscribeToNewsletter( email ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/subscibe', { email: email } ).then( r => r.data ).catch( _ => 'ok' );
	}

}

export default UserService;