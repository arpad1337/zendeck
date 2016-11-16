/*
 * @rpi1337
 */

import STATES from '../config/states';

class FeedController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'FilterService'
		];
	}

	constructor( $scope, $state, filterService ) {
		this.$scope = $scope;
		this.$state = $state;
		this._activeFilter = null;
		this.filterService = filterService;

		this._initState();

		window.feeeed = this;
	}

	async _initState() {
		this.filters = await this.filterService.getUserFilters();
		if( this.$state.params.filterId ) {
			this.selectFilter( this.$state.params.filterId );
		}
		this.$scope.$digest();
	}

	async selectFilter( id ) {
		let filter = this.filters.find((f) => {
			return f.id == id;
		});
		if( !filter ) {
			this._activeFilter = await this.filterService.getFilterById( id );
			this._activeFilter.shared = true;
			this.$scope.$digest();
		} else {
			this._activeFilter = filter;
		}
	}

	async saveSharedFilterToCollection() {
		try {
			await this.filterService.saveSharedFilterToCollection( this._activeFilter.id );
			delete this._activeFilter.shared;
			this.filters.push( this._activeFilter );
			this.$scope.$digest();
		} catch( e ) {

		}
	}

	async scrapeUrl( url ) {
		console.log( url );
	}

	get activeFilter() {
		if( 
			this.activeState == this.FEED_STATES.FILTERED 
			&& this._activeFilter 
			&& !this._activeFilter.shared
		) {
			return this._activeFilter.id;
		}
		return null;
	}

	get currentFilter() {
		return this._activeFilter;
	}

	get activeState() {
		return this.$state.current.name;
	}

	get FEED_STATES() {
		return STATES.APPLICATION.FEED;
	}

}

export default FeedController;