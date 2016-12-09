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
	}

	getCurrentUserRecentFriends( ) {
		return this.getCurrentUserFriendsByPage( 1 );
	}

	getCurrentUserFriendsByPage( page ) {
		page == isNaN( page ) ? 1 : page;
		return this.getFriendsByUsernameAndPage( 'me', page ).then((friends) => {
			return friends;
		});
	}

	getFriendsByUsernameAndPage( username, page ) {
		page == isNaN( page ) ? 1 : page;
		if( username == this.userService.currentUser.username ) {
			username = 'me';
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/friend?page=' + page ).then((r) => {
			return r.data;
		});
	}

	getFollowersByUsernameAndPage( username, page ) {
		page == isNaN( page ) ? 1 : page;
		if( username == this.userService.currentUser.username ) {
			username = 'me';
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/followers?page=' + page ).then((r) => {
			return r.data;
		});
	}

	addFriend( username ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me/friend', { username: username } ).then((r) => {
			return r.data;
		});
	}

	removeFriend( username ) {
		return this.$http.delete( CONFIG.API_PATH + '/user/me/friend/' + username ).then((r) => {
			return r.data;
		});
	}

}

export default FriendService;