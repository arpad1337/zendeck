/*
 * @rpi1337
 */

class ModalButtonComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				callback: '&',
				className: '=?'
			},
			templateUrl: 'partials/components/modal-button.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this,
			link: (scope) => {
				scope.vm.scope = scope;
			}
		};
	}

	constructor() {
		this.buttonEnabled = true;
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			await this.callback();
		} catch( e ) {
			console.error( e );
		}
		this.buttonEnabled = true;
		this.scope.$digest();
	}

};

export default ModalButtonComponent;