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

	getCurrentUserRecentFriends( force ) {
		return this.getCurrentUserFriendsByPage( 1, force );
	}

	getCurrentUserFriendsByPage( page, force ) {
		page == isNaN( page ) ? 1 : page;
		force = force || false;
		return this.getFriendsByUsernameAndPage( 'me', page, force ).then((friends) => {
			for(var i = 0; i<50;i++){friends.push(friends[0]);}
				return friends;
		});
	}

	getFriendsByUsernameAndPage( username, page, force ) {
		page == isNaN( page ) ? 1 : page;
		force = force || false;
		if( this._friendCache[ username ] && !force ) {
			return this.$q.resolve( JSON.parse(JSON.stringify(this._friendCache[ username ])) );
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/friend?page=' + page ).then((r) => {
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