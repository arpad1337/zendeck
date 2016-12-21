/*
 * @rpi1337
 */

class GroupsController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'GroupService'
		];
	}

	constructor( $scope, $state, groupService ) {
		this.$scope = $scope;
		this.$state = $state;
		this.groupService = groupService;

		console.log('WHOOOOT');

		this._initState();
	}

	_initState() {
		this.profile = null;
		this.groupPage = 1;
		this.groups = [];
		this.groupService.getGroupListByPage( this._groupPage ).then((groups) => {
			groups.forEach((group) => {
				this.groups.push( group );
			});
			if( groups.length == 0 ) {
				this.groupService.getGroupRecommendations().then((recommendations) => {
					this.recommendations = recommendations;
				});
			}
		});
	}

	async getMoreGroups() {
		this._groupPage++;
		let groups = await this.groupService.getGroupListByPage( this._groupPage );
		groups.forEach((group) => {
			this.groups.push( group );
		});
		this.$scope.$digest();
		return ( groups.length > 0 );
	}

}

export default GroupsController;