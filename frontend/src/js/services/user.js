/*
 * @rpi1337
 */

import {
	DIMENSIONS
} from '../components/profile-pic';

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
		this._loadingPromise = null;
		this._currentUser = null;
		this._userCache = {};
	}

	get currentUser() {
		return this._currentUser;
	}

	getCurrentUser() {
		if( this._currentUser != null ) {
			return this.$q.resolve( this._currentUser );
		}
		if( this._loadingPromise ) {
			return this._loadingPromise;
		}
		this._loadingPromise = this.$http.get(CONFIG.API_PATH + '/user/me').then((r) => {
			let isFirstAttempt = !this.isUserLoggedIn;
			this._currentUser = r.data;
			if( isFirstAttempt ) {
				this.messageBusService.emit( this.messageBusService.MESSAGES.USER.LOGIN, this._currentUser );
				this._loadingPromise = null;
			}
			return this._currentUser;
		});
		return this._loadingPromise;
	}

	getUserStats( username ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve({
				friends: 12,
				articles: 10,
				photos: 2,
				videos: 4,
				events: 0
			})
		}, Math.random() * 1000);
		return promise.promise;
	}

	uploadProfilePicBase64( filename, base64String ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me/photo', {
			image: base64String,
			filename: filename
		}).then((r) => {
        	let resourceUrl = r.data.success;
        	this.currentUser.photos = this.currentUser.photos || {};
        	Object.keys( DIMENSIONS ).forEach((key) => {
        		let dim = DIMENSIONS[key];
        		this.currentUser.photos[key] = {
        			width: dim.width,
        			height: dim.height,
        			src: resourceUrl
        		};
        	});
        	return resourceUrl;
		});
	}

	uploadCoverPic( photo ) {
		let data = new FormData();
		data.append( 'file', photo );
		return this.$http.post(
			CONFIG.API_PATH + '/user/me/cover', 
			data, 
			{
            	transformRequest: angular.identity,
            	headers: {'Content-Type': undefined}
        	}
        ).then((r) => {
        	let resourceUrl = r.data.success;
        	this.currentUser.photos = this.currentUser.photos || {};
        	this.currentUser.photos.cover = this.currentUser.photos.cover || {
        		width: 1200,
        		height: 400
        	};
        	this.currentUser.photos.cover.src = resourceUrl;
        	return resourceUrl;
		});
	}

	updateCurrentUserProfile( payload ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me', payload ).then((r) => {
			this._currentUser = r.data;
			return r.data;
		});
	}

	getProfileByUsername( username ) {
		if( this.currentUser && username === this.currentUser.username ) {
			return this.getCurrentUser();
		}
		if( this._userCache[ username ] ) {
			return this.$q.resolve( this._userCache[ username ] );
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username ).then((r) => {
			this._userCache[ username ] = r.data;
			return r.data;
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
			promise.resolve(true)
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