/*
 * @rpi1337
 */

import CollectionController from './collection';
import STATES from '../config/states';
import Validator from '../helpers/validator';

class GroupBySlugController extends CollectionController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'FeedService',
			'FriendService',
			'UserService',
			'ModalService',
			'CollectionService',
			'GroupService',
			'FileUploadService',
			'FilterService',
			'MessageBusService'
		];
	}

	constructor( $scope, $state, feedService, friendService, userService, modalService, collectionService, groupService, fileUploadService, filterService, messageBus ) {
		super( $state, feedService, collectionService, modalService, 'GROUP_BY_SLUG' );
		this.$scope = $scope;
		this.$state = $state;
		this.feedService = feedService;
		this.friendService = friendService;
		this.modalService = modalService;
		this.userService = userService;
		this.collectionService = collectionService;
		this.groupService = groupService;
		this.fileUploadService = fileUploadService;
		this.filterService = filterService;

		this.messageBus = messageBus;

		this.onTempFilter = this.onTempFilter.bind(this);

		this.onCoverPicFileSelected = this.onCoverPicFileSelected.bind( this );

		this._initState();
	}

	get isUserAdmin() {
		return ( this.profile && (this.profile.userId == this.userService.currentUser.id || this.profile.admins.indexOf(this.userService.currentUser.id) != -1 ));
	}

	isAdmin( id ) {
		return ( this.profile && ( this.profile.admins.indexOf(id) != -1 ));
	}

	get isUserOwner() {
		return ( this.profile && this.profile.userId == this.userService.currentUser.id );
	}

	get currentSlug() {
		try {
			let slug = this.$state.params.groupSlug;
			return slug;
		} catch( _ ) {
			return '';
		}
	}

	_initState() {
		this.resetPaginator();
		this.profile = null;
		this._isEditing = false;
		this.stats = null;
		this.posts = [];
		this.members = [];
		this._membersPage = 1;
		this.groupService.getGroupProfileBySlug( this.currentSlug ).then((profile) => {
			this.profile = profile;
			this.lastProfileFields = {
				about: this.profile.about ? this.profile.about : null,
				name: this.profile.name,
				profileColor: this.profile.profileColor
			};

			if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.INVITATION ) {
				this.groupService.acceptInvitation( this.currentSlug, this.$state.params.invitationKey ).then((accepted) => {
					if( accepted ) {
						this.$state.go(this.GROUP_BY_SLUG_STATES.POSTS);
						this._initState();
					}
				});
			}
		});

		this.filterService.getGroupFilters( this.currentSlug ).then((filters) => {
			this.filters = filters;
			if( this.$state.params.filterSlug ) {
				this.selectFilter( this.$state.params.filterSlug );
			}
		});

		this.groupService.getGroupStatsBySlug( this.currentSlug ).then((stats) => {
			this.stats = stats;
		});

		this.groupService.getGroupMemebersBySlugAndPage( this.currentSlug, this._membersPage ).then((members) => {
			members.forEach((member) => {
				this.members.push( member );
			});
		});

		if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.LIKED ) {
			this.selectLiked();
		}
		
		if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.POSTS ) {
			this.selectFeed();
		}

		this.messageBus.on( this.messageBus.MESSAGES.UI_EVENTS.TEMP_FILTER_CREATED, this.onTempFilter );
		this.$scope.$on('$destroy', this.destructor.bind(this));

	}

	onTempFilter( filter ) {
		this.$state.go(STATES.APPLICATION.GROUP_BY_SLUG.FILTERED, {groupSlug: this.currentSlug, filterSlug: filter.slug});
		this.selectFilter( filter.slug );
	}

	destructor() {
		this.messageBus.removeListener( this.messageBus.MESSAGES.UI_EVENTS.TEMP_FILTER_CREATED, this.onTempFilter );
	}

	get isEditing() {
		return this._isEditing;
	}

	async toggleEditing() {
		this._isEditing = !this._isEditing;
		if( !this.isEditing ) {
			// closed
			let color = this.profile.profileColor;
			if( color != this.lastProfileFields.profileColor ) {
				this.profile.profileColor = this.lastProfileFields.profileColor;
				this.lastProfileFields.profileColor = color;
			}

			let payload = {};
			let fields = ['about', 'name', 'profileColor'];
			fields.forEach((field) => {
				if(
					this.lastProfileFields[ field ] != this.profile[field] &&
					!Validator.isFieldEmpty( this.lastProfileFields[ field ] )
				) {
					payload[field] = this.lastProfileFields[ field ]
						.trim()
						.replace(/\n\s*\n\s*\n/g, '\n\n')
						.replace(/  +/g, ' ');
				}
			});
			if( Object.keys( payload ).length > 0 ) {
				let editedProfile = await this.groupService.updateGroupBySlug( this.currentSlug, payload );
				this.profile = editedProfile;
				this.$scope.$digest();
			}
		} else {
			this.lastProfileFields = {
				about: this.profile.about ? this.profile.about : null,
				name: this.profile.name,
				profileColor: this.profile.profileColor
			};
		}
	}

	async createNewCollectionModelWithName( name, isPublic ) {
		let model = await this.collectionService.createNewGroupCollectionModelWithSlugAndName( this.currentSlug, name, isPublic );
		this._activeCollection = model;
		return model;
	}


	async getMoreMembers() {
		let members = await this.groupService.getGroupMemebersBySlugAndPage( this.currentSlug, this._membersPage );
		members.forEach((member) => {
			this.members.push( member );
		});
		this.$scope.$digest();
		return ( members.length > 0 );
	}

	async selectLiked() {
		this.resetPaginator();
		let posts = await this.feedService.getGroupLikedPostsByPage( this.currentSlug, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async getMorePosts() {
		let newPosts = [];
		this._page++;
		switch( this.$state.current.name ) {
			case this.GROUP_BY_SLUG_STATES.POSTS: {
				newPosts = await this.feedService.getGroupPostsByGroupSlugAndPage( this.currentSlug, this._page );
				break;
			}
			case this.GROUP_BY_SLUG_STATES.LIKED: {
				newPosts = await this.feedService.getGroupLikedPostsByPage( this.currentSlug, this._page );
				break;
			}
			case this.GROUP_BY_SLUG_STATES.COLLECTION: {
				newPosts = await this.feedService.getPostsByGroupCollectionSlugAndPage( this.$state.params.groupSlug, this._activeCollection.id, this._page );
				break;
			}
			case this.GROUP_BY_SLUG_STATES.FILTERED: {
				newPosts = await this.feedService.getPostsByGroupFilterAndPage( this.currentSlug, this._activeFilter.tags, this._page );
				break;
			}
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

	get GROUP_BY_SLUG_STATES() {
		return STATES.APPLICATION.GROUP_BY_SLUG;
	}

	// @override

	loadCollections() {
		return super.loadCollections().then(_ => {
			return this.collectionService.getGroupCollections( this.$state.params.groupSlug ).then((collections) => {
				collections.forEach((collection) => {
					this._collections.push({
						hidden: !this.isUserAdmin,
						shared: true,
						...collection
					});
				});
			});
		});
	}

	// @override

	createNewCollectionModelWithName( name, isPublic ) {
		return this.collectionService.createNewGroupCollectionModelWithSlugAndName( this.currentSlug, name, isPublic ).then((model) => {
			this._activeCollection = model;
			this.collections.push( model );
			return model;
		});
	}

	addPostToCollection( targetCollection, postId ) {
		if( targetCollection.groupId ) {
			return this.feedService.addPostToGroupCollection( this.$state.params.groupSlug, targetCollection.slug, postId );
		}
		return this.feedService.addPostToCollection( targetCollection.slug, postId );
	}

	onCollectionDeleted() {
		this.$state.go(this.GROUP_BY_SLUG_STATES.POSTS);
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
		let posts = await this.feedService.getPostsByGroupFilterAndPage( this.currentSlug, this._activeFilter.tags, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async runCurrentFilter() {
		this.resetPaginator();
		let posts = await this.feedService.getPostsByGroupFilterAndPage( this.currentSlug, this._activeFilter.tags, this._page );
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
				let persistedModel = await this.filterService.copySharedGroupFilterToCollection( this.currentSlug, this._activeFilter );
				delete this._activeFilter.shared;
				this._activeFilter.id = persistedModel.id;
				this._activeFilter.slug = persistedModel.slug;
				this.filters.push( this._activeFilter );
				this.runCurrentFilter();
			} else if( this._activeFilter.temporary ) {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.createNewGroupFilter( this.currentSlug, this._activeFilter );
				delete this._activeFilter.temporary;
				this._activeFilter.id = persistedModel.id;
				this._activeFilter.slug = persistedModel.slug;
				this.filters.push( this._activeFilter );
				this.$state.go( this.GROUP_BY_SLUG_STATES.FILTERED, { groupSlug: this.currentSlug, filterSlug: model.slug });
				this.runCurrentFilter();
			} else {
				let model = await this.openCreateFilterDialog( this._activeFilter.name );
				this._activeFilter.name = model.name;
				let persistedModel = await this.filterService.updateGroupFilter( this.currentSlug, this._activeFilter.slug, this._activeFilter );
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
		await this.filterService.deleteGroupFilter( this.currentSlug, this._activeFilter.slug );
		let index = this.filters.findIndex((a) => {
			return a.slug == this._activeFilter.slug
		});
		this.filters.splice( index, 1 );
		this._activeFilter = null;
		this.$state.go(this.GROUP_BY_SLUG_STATES.POSTS);
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
		let posts = await this.feedService.getGroupPostsByGroupSlugAndPage( this.$state.params.groupSlug, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async scrapeUrl( url ) {
		return this.feedService.scrapeUrl( url );
	}

	async commitNewPost( newPost ) {
		let model = await this.feedService.postToGroup( this.currentSlug, newPost );
		this.posts.unshift( model );
		this.$scope.$digest();
		return true;
	}

	// group actions

	async joinGroup() {
		if( !this.profile.userIsMember ) {
			let status = await this.groupService.joinToGroup( this.currentSlug );
			this.profile.pending = !status.approved;
			this.profile.userIsMember = status.approved;
			if( status.approved ) {
				this.selectFeed();
			}
		} else {
			await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
				confirmationDialogTemplateKey: 'LEAVE_GROUP'
			});
			await this.groupService.leaveGroup( this.currentSlug );
			this.profile.userIsMember = false;
			this.posts.length = 0;
		}
		this.$scope.$digest();
	}

	// add friend

	approveUser( user ) {
		return this.groupService.approveUser( this.currentSlug, user.id );
	}

	async kickUserFromGroup( user ) {
		await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'KICK_USER',
			user: user
		});
		await this.groupService.kickUserFromGroup( this.currentSlug, user.id );
		this._membersPage = 1;
		let members = await this.groupService.getGroupMemebersBySlugAndPage( this.currentSlug, this._membersPage );
		this.members.length = 0;
		members.forEach((member) => {
			this.members.push( member );
		});
		this.$scope.$digest();
	}

	async assignAdminToGroup( user ) {
		await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'PROMOTE_USER',
			user: user
		});
		await this.groupService.assignAdminToGroup( this.currentSlug, user.id );
		this.profile.admins.push(user.id);
	}

	async removeAdminFromGroup( user ) {
		await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'DEGRADE_USER',
			user: user
		});
		await this.groupService.removeAdminFromGroup( this.currentSlug, user.id );
		this.profile.admins.splice( this.profile.admins.indexOf( user.id ),  1 );
	}

	// settings

	openGroupSettingsDialog() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.EDIT_GROUP, {
			isPublic: String(this.profile.isPublic),
			isModerated: String(this.profile.isModerated),
			isOpen: String(this.profile.isOpen),
			error: {
				backend: false
			}
		}).then(() => {
			return this.groupService.getGroupProfileBySlug( this.currentSlug );
		}).then((profile) => {
			this.profile = profile;
			this.$state.go( STATES.APPLICATION.GROUP_BY_SLUG.POSTS, {
				groupSlug: group.slug
			});
		});
	}

	openCoverPicUploadDialog() {
		this.fileUploadService.createUploadTargetWithCallback( this.onCoverPicFileSelected );
	}

	async onCoverPicFileSelected( file ) {
		if( file ) {
			let resourceUrl = await this.groupService.uploadCoverPic( this.currentSlug, file );
			this.profile.photos = this.profile.photos || {};
        	this.profile.photos.cover = this.profile.photos.cover || {
        		width: 1200,
        		height: 400
        	};
        	this.profile.photos.cover.src = resourceUrl;
		}
	}

	// invitation

	openInvitationDialog() {
		return this.modalService.openDialog( this.modalService.DIALOG_TYPE.GROUP_INVITE, {
			error: {
				backend: null,
				emails: null
			}
		}).then(console.log.bind(this));
	}

}

export default GroupBySlugController;