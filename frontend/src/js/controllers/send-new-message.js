/*
 * @rpi1337
 */

class SendNewMessageController {

	static get $inject() {
		return [
			'$scope',
			'UserService',
			'FriendService',
			'MessageService'
		];
	}

	constructor( $scope, userService, friendService, messageService ) {
		this.$scope = $scope;
		this.userService = userService;
		this.friendService = friendService;
		this.messageService = messageService;
		this._allFriendsPage = 1;
		this.userAllFriends = [];
		this._noMoreFriends = false;
		this._loadFriendsByPage( this._allFriendsPage );
	}

	async _loadFriendsByPage( page ) {
		let friends = await this.friendService.getCurrentUserFriendsByPage( this._allFriendsPage );
		if( !friends ) {
			this._noMoreFriends = true;
		}
		friends.forEach((friend) => {
			this.userAllFriends.push( friend );
		});
		this.$scope.$digest();
	}

	onPredicateChange( predicate ) {
		if( predicate.length == 0 ) {
			return;
		}
		return this.userService.searchUsersByPedicate( predicate ).then((results) => {
			results.forEach((user) => {
				if( !this.userAllFriends.find((u)  => {
					return u.username == user.username
				}) ) {
					this.userAllFriends.unshift( user );
				}
			});
		});
	}

	async onBottomReached(  ) {
		if( !this._noMoreFriends ) {
			this._allFriendsPage++;
			let friends = await this.friendService.getCurrentUserFriendsByPage( this._allFriendsPage );
			friends.forEach((friend) => {
				this.userAllFriends.push( friend );
			});
		}
	}

	async sendMessage( recipient, message, error, callback ) {
		if(!recipient) {
			error.recipient = true;
			return;
		} else {
			error.recipient = false;
		}
		if( !message ) {
			error.message = true;
			return;
		} else {
			error.message = false;
		}
		message = message.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ');
		try {
			let result = await this.messageService.sendMessageToUser( recipient.username, message );
			callback( result );
		} catch( e ) {
			error.backend = e.data || e.message;
		} finally {
			this.$scope.$digest();
		}
	}

}

export default SendNewMessageController;