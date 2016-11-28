/*
 * @rpi1337
 */

class GroupCardComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				size: '@?',
				model: '='
			},
			templateUrl: 'partials/components/group-card.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor() {
		this.size = this.size || 'normal'
	}

}

export default GroupCardComponent;