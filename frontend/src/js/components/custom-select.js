/*
 * @rpi1337
 */

class CustomSelectComponent {

	static get $inject() {
		return [
			
		];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?',
				collection: '=',
				key: '@',
				value: '@'
			},
			templateUrl: 'partials/components/custom-select.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor() {
		this.model = null;
		this.isOpened = false;
		this._predicate = '';
		this.localCollection = [];
		this.filteredCollection = Array.prototype.slice.call( this.collection );
	}

	set predicate( newValue ) {
		this._predicate = newValue.trim();
		let keyword = this._predicate.toLowerCase();
		this.model = null;
		this.filteredCollection.length = 0;
		this.collection.forEach((item) => {
			if( item[ this.value ].toLowerCase().indexOf( keyword ) === 0 ) {
				this.filteredCollection.push( item );
			}
		});
	}

	get predicate() {
		return this._predicate;
	}

	selectItem( selectedItem ) {
		let key = selectedItem[ this.key ];
		let index = this.collection.findIndex((item) => {
			return item[ this.key ] === key;
		});
		this.model = this.collection[ index ];
		this.isOpened = false;
		this.predicate = '';
		if( this._delegateRespondsToSelector('itemSelected') ) {
			this.delegate.itemSelected( this.model );
		}
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

}

export default CustomSelectComponent;