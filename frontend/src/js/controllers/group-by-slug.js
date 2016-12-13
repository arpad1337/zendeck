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
			'FileUploadService'
		];
	}

	constructor( $scope, $state, feedService, friendService, userService, modalService, collectionService, groupService, fileUploadService ) {
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
		});

		// this.feedService.getGroupPostsByGroupSlugAndPage( this.currentSlug, this._page ).then((newPosts) => {
		// 	newPosts.forEach((post) => {
		// 		this.posts.push( post );
		// 	});
		// });

		this.loadCollections();

		this.groupService.getGroupStatsBySlug( this.currentSlug ).then((stats) => {
			this.stats = stats;
		});

		this.groupService.getGroupMemebersBySlugAndPage( this.currentSlug, this._membersPage ).then((members) => {
			members.forEach((member) => {
				this.members.push( member );
			});
		});

		if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.COLLECTION ) {
			this.selectCollection( this.$state.params.collectionSlug );
		}

		if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.LIKED ) {
			this.selectLiked();
		}
		
		if( this.$state.current.name === this.GROUP_BY_SLUG_STATES.POSTS ) {
			this.selectFeed();
		}
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
		return this.collectionService.getGroupCollections( this.$state.params.groupSlug ).then((collections) => {
			this._collections = collections;
			if( this.$state.params.collectionId ) {
				this.selectCollection( this.$state.params.collectionSlug );
			}
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

	addPostToCollection( collectionSlug, postId ) {
		return this.feedService.addPostToGroupCollection( this.$state.params.groupSlug, collectionSlug, postId );
	}

	// POSTS

	async selectFeed() {
		this.resetPaginator();
		let posts = await this.feedService.getGroupPostsByGroupSlugAndPage( this.$state.params.groupSlug, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
	 	if( this.posts.length == 0 ) {
			this.recommendations = await this.userService.getUserRecommendations();
		}
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
			await this.groupService.joinToGroup( this.currentSlug );
		} else {
			await this.groupService.leaveGroup( this.currentSlug );
		}
		this.profile.userIsMember = !this.profile.userIsMember;
		this.$scope.$digest();
	}

	// add friend

	async addFriend( username ) {
		let friend = this.friends.find((f) => {
			return f.username == username
		});
		if( friend ) {
			await this.friendService.removeFriend( username );
		} else {
			await this.friendService.addFriend( username );
		}
		this.friends = await this.friendService.getCurrentUserFriends( true );
	}

	async toggleAdminForUserId( id ) {
		if( this.isAdmin(id) ) {
			await this.groupService.assignAdminToGroup( this.currentSlug, id );
		} else {
			await this.groupService.removeAdminFromGroup( this.currentSlug, id );
		}
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

	}

}

export default GroupBySlugController;