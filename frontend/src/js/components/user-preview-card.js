/*
 * @rpi1337
 */

class UserPreviewCardComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				user: '=',
				delegate: '=?'
			},
			templateUrl: 'partials/components/user-preview-card.tpl.html',
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
		this.isFriend = false;
	}

	async addFriend() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'addFriend' ) ) {
				await this.delegate.addFriend( this.user.username );
				this.isFriend = !this.isFriend;
				this.scope.$digest();
			}
		} catch( e ) {
			console.error( e );
		} finally {
			this.buttonEnabled = true;
		}
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default UserPreviewCardComponent;