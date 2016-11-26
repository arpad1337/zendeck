/*
 * @rpi1337
 */

class SendNewMessageController {

	static get $inject() {
		return [
			'$scope',
			'FriendService',
			'MessageService'
		];
	}

	constructor( $scope, friendService, messageService ) {
		this.$scope = $scope;
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
			error.recipient = 'Recipient not selected';
			return;
		}
		if( !message ) {
			error.message = 'Message is empty';
			return;
		}
		message = message.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ');
		try {
			let result = await this.messageService.sendMessageToUser( recipient.username, message );
			callback( result );
		} catch( e ) {
			error.backend = e.data;
		}

	}

}

export default SendNewMessageController;