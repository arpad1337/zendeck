/*
 * @rpi1337
 */

import STOPWORDS from '../config/stopwords';

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
			this._tag = '';
		} else {
			this.editable = false;
		}
	}

	set tag( newValue ) {
		this._tag = newValue.trim();
	}

	get tag() {
		return this._tag;
	}

	add() {
		if( STOPWORDS.EN.indexOf( this.tag ) > -1 ) {
			return;
		}
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