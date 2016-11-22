/*
 * @rpi1337
 */

import STATES from '../config/states';

class FeedController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'FeedService',
			'FilterService',
			'FriendService',
			'UserService',
			'ModalService'
		];
	}

	constructor( $scope, $state, feedService, filterService, friendService, userService, modalService ) {
		this.$scope = $scope;
		this.$state = $state;
		this._activeFilter = null;
		this.filterService = filterService;
		this.feedService = feedService;
		this.friendService = friendService;
		this.modalService = modalService;
		this.userService = userService;

		this._initState();

		window.feeeed = this;
	}

	async _initState() {
		this._page = 1;
		this.filters = await this.filterService.getUserFilters();
		if( this.$state.params.filterId ) {
			this.selectFilter( this.$state.params.filterId );
		}
		this.friends = await this.friendService.getCurrentUserFriends(  );
		this.trendingTags = await this.filterService.getTrendingTags();
		this.posts = await this.feedService.getFeedByPage( this._page );
		if( this.posts.length == 0 ) {
			this.recommendations = await this.userService.getUserRecommendations();
		}
		this.groups = [];
		this.$scope.$digest();
	}

	async selectFilter( id ) {
		let filter = this.filters.find((f) => {
			return f.id == id;
		});
		if( !filter ) {
			try {
				this._activeFilter = await this.filterService.getFilterById( id );
				this._activeFilter.shared = true;
				this.$scope.$digest();
			} catch( e ) {
				this.$state.go(this.FEED_STATES.POSTS);
			}
		} else {
			this._activeFilter = Object.assign( {}, filter );
			this._activeFilter.tags = filter.tags.slice(0);
		}
	}

	async saveCurrentFilter() {
		try {
			if( this._activeFilter.shared ) {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.copySharedFilterToCollection( this._activeFilter.id );
				delete this._activeFilter.shared;
				this._activeFilter.id = persistedModel.id;
				this.filters.push( this._activeFilter );
			} else if( this._activeFilter.temporary ) {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.createNewFilter( this._activeFilter );
				delete this._activeFilter.temporary;
				this._activeFilter.id = persistedModel.id;
				this.filters.push( this._activeFilter );
			} else {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.updateFilter( this._activeFilter.id, this._activeFilter );
				let filter = this.filters.find((f) => {
					return f.id == this._activeFilter.id;
				});
				filter.name = persistedModel.name;
				filter.tags = persistedModel.tags;
				this._activeFilter = persistedModel;
			}
			this.$scope.$digest(); 
		} catch( e ) {

		}
	}

	async deleteCurrentFilter() {
		await this.filterService.deleteFilter( this._activeFilter.id );
		this.filters = await this.filterService.getUserFilters();
		this.$state.go( this.FEED_STATES.POSTS );
	}

	openCreateFilterDialog( name ) {
		if( name ) {
			return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_FILTER, {
				name: name || '',
				saveButton: true
			}, this.setActiveFilterName.bind(this) );
		}
		return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_FILTER, {
			name: name || ''
		}, this.setActiveFilterName.bind(this) ).then((model) => {
			this.createNewFilterModelWithName( model.name );
		});
	}

	setActiveFilterName( model ) {
		if( model.name.trim().length > 3 ) {
			model.dismiss();
		}
	}

	createNewFilterModelWithName( name ) {
		let model = this.filterService.createNewFilterModelWithName( name );
		this._activeFilter = model;
		this.$state.go( this.FEED_STATES.FILTERED, { filterId: model.id });
	}

	createTemporaryFilterWithTag( tag ) {
		let model = this.filterService.createNewFilterModelWithNameAndTags( tag, [ tag ] );
		this._activeFilter = model;
		this.$state.go( this.FEED_STATES.FILTERED, { filterId: model.id });
	}

	addTag( tag ) {
		tag = tag.trim().toLowerCase().replace(/\s\s+/g, ' ');
		if( tag.length < 3 ) {
			return;
		}
		if( this._activeFilter.tags.length <= 20 && this._activeFilter.tags.indexOf( tag ) === -1 ) {
			this._activeFilter.tags.push( tag );
		}
	}

	removeTag( tag ) {
		tag = tag.trim().toLowerCase();
		this._activeFilter.tags.splice( this._activeFilter.tags.indexOf( tag ), 1);
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

	// POST

	async scrapeUrl( url ) {
		return this.feedService.scrapeUrl( url );
	}

	get activeState() {
		return this.$state.current.name;
	}

	get FEED_STATES() {
		return STATES.APPLICATION.FEED;
	}

	// RECOMMENDATIONS

	async addFriend( username ) {
		let friend = this.friends.find((f) => {
			return f.username == username
		});
		if( friend ) {
			await this.friendService.removeFriend( username );
		} else {
			await this.friendService.addFriend( username );
		}
		this.friends = await this.friendService.getCurrentUserFriends();
	}


}

export default FeedController;

