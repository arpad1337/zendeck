/*
 * @rpi1337
 */

class SendNewMessageController {

	static get $inject() {
		return [
			'$scope',
			'FriendService'
		];
	}

	constructor( $scope, friendService, loadDeps ) {
		this.$scope = $scope;
		this.friendService = friendService;
		this._allFriendsPage = 1;
		this.userAllFriends = [];
		this._noMoreFriends = false;
		if( !loadDeps ) {
			this._loadFriendsByPage( this._allFriendsPage );
		}
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

	itemSelected( model ) {
		console.log('recipient', model);
	}

}

export default SendNewMessageController;