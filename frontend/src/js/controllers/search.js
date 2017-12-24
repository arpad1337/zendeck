/*
 * @rpi1337
 */

import STATES from '../config/states';

class SearchController {

	static get $inject() {
		return [
			'$state',
			'SearchService',
			'FilterService',
			'MessageBusService'
		];
	}

	constructor( $state, searchService, filterService, messageBus ) {
		this.$state = $state;
		this.searchService = searchService;
		this.filterService = filterService;
		this.messageBus = messageBus;

		this._currentSearchTerm = this.$state.params.predicate || '';
		this.opened = false;
		this._timer = null;
		this.results = [];
	}

	get isFilterAvailable() {
		return this.inGroup || (this.$state.$current.toString().indexOf('feed') == 0)
	}

	get inGroup() {
		return "groupSlug" in this.$state.params;
	}

	get currentSearchTerm() {
		return this._currentSearchTerm;
	}

	get tagsFromPredicate() {
		if( !this._currentSearchTerm ) {
			return [];
		}
		let set = new Set();
		this._currentSearchTerm.replace(/\s\s+/g,' ').split(' ').forEach(t => {
			set.add(t.trim());
		});
		return Array.from(set);
	}

	gotoFilter() {
		let model = this.filterService.createNewFilterModelWithNameAndTags( this.currentSearchTerm, this.tagsFromPredicate );
		this.messageBus.emit( this.messageBus.MESSAGES.UI_EVENTS.TEMP_FILTER_CREATED, model );
		this.opened = false;
	}

	set currentSearchTerm( newValue ) {
		this._currentSearchTerm = newValue.trim();
		if( this._currentSearchTerm.length > 0 ) {
			this.opened = true;
		}
		clearTimeout( this._timer );
		this._timer = setTimeout(() => {
			if( this._currentSearchTerm.length === 0 ) {
				this.results.length = 0;
				return;
			}
			let predicate = this._currentSearchTerm.replace('@','');
			this.searchService.searchWithPredicate( predicate ).then((results) => {
				this.results = results;
			});
		}, 500); // debounce
	}

}

export default SearchController;