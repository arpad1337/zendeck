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

	fogotPassword( usernameOrEmail ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/forgot-password', {usernameOrEmail: usernameOrEmail} ).then((r) => {
			return r.data;
		});
	}

	resetPassword( signature, password ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/reset-password', {signature: signature, password: password} ).then((r) => {
			this.getCurrentUser();
			return r.data;
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

	checkUsername( username ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(true)
		}, Math.random() * 1000);
		return promise.promise;
	}

	checkEmail( email ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(false)
		}, Math.random() * 1000);
		return promise.promise;
	}

	getUserRecommendations() {
		return this.$http.get( CONFIG.API_PATH + '/user/me/recommendation' ).then(r => r.data);
	}

	subscribeToNewsletter( name, email ) {
		return this.$http.post( CONFIG.API_PATH + '/auth/subscibe', { email: email, fullname: name } ).then( r => r.data ).catch( _ => 'ok' );
	}

}

export default UserService;