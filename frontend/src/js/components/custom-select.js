/*
 * @rpi1337
 */

/* 
	E X A M P L E

    <custom-select
        delegate="vm",
        collection="vm.delegate.collections"
        key="id",
        value="name"
    >
        {{$parent.item.name}}
    </custom-select>
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
				rowHeight: '@?',
				placeholder: '@?',
				key: '@',
				value: '@'
			},
			transclude: true,
			templateUrl: 'partials/components/custom-select.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this,
			link: (scope, element) => {
				scope.vm.$element = element;
			}
		};
	}

	constructor() {
		this.rowHeight = this.rowHeight || this.defaultRowHeight;
		this.maxHeight = this.rowHeight;
		this.model = null;
		this._isOpened = false;
		this._predicate = '';
		this.localCollection = [];
		this.filteredCollection = Array.prototype.slice.call( this.collection );
	}

	get defaultRowHeight() {
		return 36;
	}

	get isOpened() {
		return this._isOpened;
	}

	set isOpened( value ) {
		this._isOpened = value
		if( this._isOpened ) {
			this._predicate = '';
			setTimeout(() => {
				$(this.$element.find('ul')).scrollTop(0);
			}, 0);
			let currentTop = this.getCumulativeOffset( this.$element[0] ).y;
			this.maxHeight = window.scrollY + window.innerHeight - currentTop - this.rowHeight - 20;
		}
	}

	getCumulativeOffset(obj) {
	    var left, top;
	    left = top = 0;
	    if (obj.offsetParent) {
	        do {
	            left += obj.offsetLeft;
	            top  += obj.offsetTop;
	        } while (obj = obj.offsetParent);
	    }
	    return {
	        x : left,
	        y : top
	    };
	}

	set predicate( newValue ) {
		this._predicate = newValue.trim();
		let keyword = this._predicate.toLowerCase();
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

	selectItem( key ) {
		let index = this.collection.findIndex((item) => {
			return item[ this.key ] === key;
		});
		this.model = this.collection[ index ];
		this._isOpened = false;
		this.placeholder = this.model[ this.value ];
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