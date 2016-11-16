/*
 * @rpi1337
 */

class PostingBoxTagComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?',
				tag: '=?'
			},
			templateUrl: 'partials/components/posting-box-tag.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this
		};
	}

	constructor() {
		if( !this.tag ) {
			this.editable = true;
			this.tag = '';
		} else {
			this.editable = false;
		}
	}

	add() {
		if( this._delegateRespondsToSelector( 'addTag' ) ) {
			this.delegate.addTag( this.tag );
			this.tag = '';
		}
	}

	remove() {
		if( this._delegateRespondsToSelector( 'removeTag' ) ) {
			this.delegate.removeTag( this.tag );
		}
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostingBoxTagComponent;