/*
 * @rpi1337
 */

class MoreButtonComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				callback: '&',
				className: '@?'
			},
			templateUrl: 'partials/components/more-button.tpl.html',
			bindToController: true,
			transclude: true,
			controllerAs: 'vm',
			controller: this,
			link: (scope) => {
				scope.vm.scope = scope;
			}
		};
	}

	constructor() {
		this.buttonEnabled = true;
		this.hidden = false;
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			let result = await this.callback();
			if( !result ) {
				this.hidden = true;
			}
		} catch( e ) {
			console.error( e );
		}
		this.buttonEnabled = true;
		this.scope.$digest();
	}

};

export default MoreButtonComponent;