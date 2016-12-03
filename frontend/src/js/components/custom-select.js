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
				model: '=?',
				key: '@',
				value: '@',
				selectFirst: '@?'
			},
			transclude: {
				item: 'customSelectItem',
				selected: '?customSelectSelected'
			},
			templateUrl: 'partials/components/custom-select.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this,
			link: (scope, element, attrs) => {
				scope.vm.$element = element;
				scope.vm._bindEvents();
			}
		};
	}

	constructor() {
		this.rowHeight = this.rowHeight || this.defaultRowHeight;
		this.maxHeight = this.rowHeight;
		this.model = this.model || null;
		this._isOpened = false;
		this._predicate = '';
		this.localCollection = [];
		this._bottomReachedEventSent = false;
		this.filteredCollection = Array.prototype.slice.call( this.collection );
		if( this.selectFirst ) {
			this.selectItem( this.filteredCollection[0][this.key] );
		}
	}

	_bindEvents() {
		let target = $(this.$element.find('ul'));
		let timer = false;;
		let handler = this.onScroll.bind( this, target );
		$(target).bind( 'scroll', () => {
			clearTimeout( timer );
			timer = setTimeout( handler, 200 );
		});
	}

	async onScroll( target ) {
		let offset = target[0].scrollHeight - 
					 target[0].scrollTop -
					 target.innerHeight();

		if( offset < 70 && !this._bottomReachedEventSent ) {
			console.log('BOTTOM reached!!!');
			this._bottomReachedEventSent = true;
			if( this._delegateRespondsToSelector( 'onBottomReached' )) {
				await this.delegate.onBottomReached();
				this._runFilter();
			}
			this._bottomReachedEventSent = false;
		}
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
			this._runFilter();
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
		if( this._delegateRespondsToSelector('onPredicateChange') ) {
			this.delegate.onPredicateChange( this._predicate );
		}
		this._runFilter();
	}

	_runFilter() {
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
		if( this._delegateRespondsToSelector('onItemSelected') ) {
			this.delegate.onItemSelected( this.model );
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