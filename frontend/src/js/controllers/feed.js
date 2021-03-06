/*
 * @rpi1337
 */

import STATES from '../config/states';
import CollectionController from './collection';

class FeedController extends CollectionController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'FeedService',
			'FilterService',
			'FriendService',
			'UserService',
			'ModalService',
			'CollectionService',
			'GroupService',
			'MessageBusService'
		];
	}

	constructor( 
		$scope, 
		$state, 
		feedService, 
		filterService, 
		friendService, 
		userService, 
		modalService, 
		collectionService, 
		groupService,
		messageBus
	) {
		super( $state, feedService, collectionService, modalService, 'FEED' );
		this.$scope = $scope;
		this.$state = $state;
		this._activeFilter = null;
		this.filterService = filterService;
		this.feedService = feedService;
		this.friendService = friendService;
		this.modalService = modalService;
		this.userService = userService;
		this.collectionService = collectionService;
		this.groupService = groupService;
		this.messageBus = messageBus;

		this.onTempFilter = this.onTempFilter.bind(this);

		this._initState();
	}

	_initState() {		
		this.resetPaginator();

		this.filterService.getUserFilters().then((filters) => {
			this.filters = filters;
			if( this.$state.params.filterSlug ) {
				this.selectFilter( this.$state.params.filterSlug );
			}
		});

		this.friendService.getCurrentUserRecentFriends(  ).then((friends) => {
			this.friends = friends;
		});

		this.filterService.getTrendingTags().then((trendingTags) => {
			this.trendingTags = trendingTags;
		});

		this.groups = [];
		this.groupService.getRecentGroups().then((groups) => {
			groups.forEach((group) => {
				this.groups.push( group );
			});
		});
		
		if( this.$state.current.name === this.FEED_STATES.LIKED ) {
			this.selectLiked();
		}
		
		if( this.$state.current.name === this.FEED_STATES.POSTS ) {
			this.selectFeed();
		}
		this.messageBus.on( this.messageBus.MESSAGES.UI_EVENTS.TEMP_FILTER_CREATED, this.onTempFilter );
		this.$scope.$on('$destroy', this.destructor.bind(this));
	}

	onTempFilter( filter ) {
		this.$state.go(STATES.APPLICATION.FEED.FILTERED, {filterSlug: filter.slug});
		this.selectFilter( filter.slug );
	}

	destructor() {
		this.messageBus.removeListener( this.messageBus.MESSAGES.UI_EVENTS.TEMP_FILTER_CREATED, this.onTempFilter );
	}

	async getMorePosts() {
		let newPosts = [];
		let page = this._page + 1;
		switch( this.$state.current.name ) {
			case this.FEED_STATES.POSTS: {
				newPosts = await this.feedService.getFeedByPage( page );
				break;
			}
			case this.FEED_STATES.FILTERED: {
				newPosts = await this.feedService.getPostsByFilterAndPage( this._activeFilter.tags, page );
				break;
			}
			case this.FEED_STATES.LIKED: {
				newPosts = await this.feedService.getLikedPostsByPage( page );
				break;
			}
			case this.FEED_STATES.COLLECTION: {
				newPosts = await this.feedService.getPostsByCollectionIdAndPage( this._activeCollection.id, page );
				break;
			}
		}
		if( newPosts.length ) {
			this._page++;
		}
		newPosts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
		return (newPosts.length > 0);
	}

	get activeState() {
		return this.$state.current.name;
	}

	get FEED_STATES() {
		return STATES.APPLICATION.FEED;
	}

	// collections

	onCollectionDeleted() {
		this.$state.go(this.FEED_STATES.POSTS);
		this.selectFeed();
	}

	// FILTERS

	async selectFilter( slug ) {
		this.resetPaginator();
		let filter = this.filters.find((f) => {
			return f.slug == slug;
		});
		if( !filter ) {
			try {
				this._activeFilter = await this.filterService.getFilterBySlug( slug );
				this.$scope.$digest();
			} catch( e ) {
				this.$state.go(this.FEED_STATES.POSTS);
			}
		} else {
			this._activeFilter = Object.assign( {}, filter );
			this._activeFilter.tags = filter.tags.slice(0);
		}
		let posts = await this.feedService.getPostsByFilterAndPage( this._activeFilter.tags, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async saveCurrentFilter() {
		try {
			if( this._activeFilter.shared ) {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.copySharedFilterToCollection( this._activeFilter );
				delete this._activeFilter.shared;
				this._activeFilter.id = persistedModel.id;
				this._activeFilter.slug = persistedModel.slug;
				this.filters.push( this._activeFilter );
				this.runCurrentFilter();
			} else if( this._activeFilter.temporary ) {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.createNewFilter( this._activeFilter );
				delete this._activeFilter.temporary;
				this._activeFilter.id = persistedModel.id;
				this._activeFilter.slug = persistedModel.slug;
				this.filters.push( this._activeFilter );
				this.$state.go( this.FEED_STATES.FILTERED, { filterSlug: model.slug });
				this.runCurrentFilter();
			} else {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.updateFilter( this._activeFilter.slug, this._activeFilter );
				let filter = this.filters.find((f) => {
					return f.slug == this._activeFilter.slug;
				});
				filter.name = persistedModel.name;
				if( JSON.stringify( filter.tags ) != JSON.stringify( persistedModel.tags ) ) {
					this.posts.length = 0;
					this._page = 0;
					this.getMorePosts();
				}
				filter.tags = persistedModel.tags;
				this._activeFilter = persistedModel;
				this.runCurrentFilter();
			}
			this.$scope.$digest(); 
		} catch( e ) {

		}
		// this.resetPaginator();
		// this.posts = await this.feedService.getPostsByFilterIdAndPage( this._activeFilter.id, this._page );
	}

	async runCurrentFilter() {
		this.resetPaginator();
		let posts = await this.feedService.getPostsByGroupFilterAndPage( this.currentSlug, this._activeFilter.tags, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
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
			this.resetPaginator();
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
		this.$state.go( this.FEED_STATES.FILTERED, { filterSlug: model.slug });
	}

	createTemporaryFilterWithTag( tag ) {
		let model = this.filterService.createNewFilterModelWithNameAndTags( tag, [ tag ] );
		this._activeFilter = model;
		this.$state.go( this.FEED_STATES.FILTERED, { filterSlug: model.slug });
	}

	createTemporaryFilterWithTagAndRunFilter( tag ) {
		let model = this.filterService.createNewFilterModelWithNameAndTags( tag, [ tag ] );
		this._activeFilter = model;
		this.$state.go( this.FEED_STATES.FILTERED, { filterSlug: model.slug });
		this.selectFilter( model.slug );
	}

	addTag( tag ) {
		tag = tag.trim().toLowerCase().replace(/\s\s+/g, ' ');
		if( tag.length < 3 ) {
			return;
		}
		if( this._activeFilter.tags.length <= 20 && this._activeFilter.tags.indexOf( tag ) === -1 ) {
			this._activeFilter.tags.push( tag );
			this.runCurrentFilter();
		}
	}

	removeTag( tag ) {
		tag = tag.trim().toLowerCase();
		this._activeFilter.tags.splice( this._activeFilter.tags.indexOf( tag ), 1);
		this.runCurrentFilter();
	}

	async deleteCurrentFilter() {
		await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'DELETE_FILTER'
		});
		await this.filterService.deleteFilter( this._activeFilter.slug );
		let index = this.filters.findIndex((a) => {
			return a.slug == this._activeFilter.slug
		});
		this.filters.splice( index, 1 );
		this._activeFilter = null;
		this.$state.go(this.FEED_STATES.POSTS);
		this.selectFeed();
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

	// POSTS

	async selectFeed() {
		this.resetPaginator();
		let posts = await this.feedService.getFeedByPage( this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async scrapeUrl( url ) {
		return this.feedService.scrapeUrl( url );
	}

	async commitNewPost( newPost ) {
		let model = await this.feedService.postToFeed( newPost );
		this.posts.unshift( model );
		this.$scope.$digest();
		return true;
	}

}

export default FeedController;

