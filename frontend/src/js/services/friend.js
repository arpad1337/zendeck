/*
 * @rpi1337
 */

class FriendService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'UserService'
		];
	}

	constructor( $q, $http, userService ) {
		this.$q = $q;
		this.$http = $http;
		this.userService = userService;
		this._friendCache = {};
	}

	getCurrentUserFriends( force ) {
		force = force || false;
		return this.getFriendsByUsername( 'me', force );
	}

	getFriendsByUsername( username, force ) {
		if( this._friendCache[ username ] && !force ) {
			return this.$q.resolve( this._friendCache[ username ] );
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/friend' ).then((r) => {
			this._friendCache[ username ] = r.data;
			return r.data;
		});
	}

	addFriend( username ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me/friend', { username: username } ).then((r) => {
			this.getFriendsByUsername( this.userService.currentUser.username );
			return r.data;
		});
	}

	removeFriend( username ) {
		return this.$http.delete( CONFIG.API_PATH + '/user/me/friend/' + username ).then((r) => {
			this.getFriendsByUsername( this.userService.currentUser.username );
			return r.data;
		});
	}

}

export default FriendService;