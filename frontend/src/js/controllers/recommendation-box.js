/*
 * @rpi1337
 */

class RecommendationBoxController {

	static get $inject() {
		return [
			'$scope',
			'UserService',
			'FriendService'
		];
	}

	constructor( $scope, userService, friendService ) {
		this.$scope = $scope;
		this.userService = userService;
		this.friendService = friendService;

		this._initState();
	}

	async _initState() {
		this.recommendations = await this.userService.getUserRecommendations();
		this.$scope.$digest();
	}

	async addFriend( username ) {
		let friend = await this.friendService.addFriend( username );
		return friend;
	}

	async removeFriend( username ) {
		let friend = await this.friendService.removeFriend( username );
		return friend;
	}
}

export default RecommendationBoxController;