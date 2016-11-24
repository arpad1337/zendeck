/*
 * @rpi1337
 */

import Validator from '../helpers/validator';
import CollectionController from './collection';
import STATES from '../config/states';

class ProfileController extends CollectionController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'UserService',
			'FriendService',
			'FeedService',
			'FileUploadService',
			'CollectionService',
			'ModalService'
		];
	}

	constructor( $scope, $state, userService, friendService, feedService, fileUploadService, collectionService, modalService ) {
		super( $state, feedService, collectionService, modalService, 'PROFILE' );
		this.$state = $state;
		this.$scope = $scope;
		this.userService = userService;
		this.feedService = feedService;
		this.fileUploadService = fileUploadService;
		this.friendService = friendService;

		this.onProfilePicFileSelected = this.onProfilePicFileSelected.bind( this );
		this.onCoverPicFileSelected = this.onCoverPicFileSelected.bind( this );

		this._initState();
	}

	get PROFILE_STATES() {
		return STATES.APPLICATION.PROFILE;
	}

	resetPaginator() {
		super.resetPaginator();
		this._friendsPage = 1;
	}

	_initState() {
		this.username = this.$state.params.username;

		this._isEditing = false;
		this._page = 1;
		this._friendsPage = 1;
		this.posts = [];
		this.friends = [];
		this.stats = null;

		this.userService.getProfileByUsername( this.$state.params.username ).then((profile) => {
			this.profile = profile;
			this.lastProfileFields = {
				about: this.profile.about,
				fullname: this.profile.fullname,
				birthDate: this.profile.birthDate
			};
		});

		this.feedService.getUserPostsByUsernameAndPage( this.$state.params.username, this._page ).then(( posts ) => {
			posts.forEach((post) => {
				this.posts.push( post );
			});
		});

		this.friendService.getFriendsByUsernameAndPage( this.$state.params.username, this._friendsPage ).then((friends) => {
			friends.forEach((friend) => {
				this.friends.push( friend );
			});
		});

		this.userService.getUserStats( this.$state.params.username ).then((stats) => {
			this.stats = stats;
		});
		
		this.loadCollections();
	}

	async getMoreFriends() {
		this._friendsPage++;
		let friends = await this.friendService.getFriendsByUsernameAndPage( this.$state.params.username, this._friendsPage );
		friends.forEach((friend) => {
			this.friends.push( friend );
		});
		this.$scope.$digest();
	}

	async selectFeed() {
		this.resetPaginator();
		let posts = await this.feedService.getFeedByPage( this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async getMorePosts() {
		this._page++;
		let newPosts = await this.feedService.getUserPostsByUsernameAndPage( this.$state.params.username, this._page );
		newPosts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
		return (newPosts.length > 0);
	}

	async toggleEditing() {
		this._isEditing = !this._isEditing;
		if( !this.isEditing ) {
			// closed
			let payload = {};
			let fields = ['about', 'fullname', 'birthDate', 'profileColor'];
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
				await this.userService.updateCurrentUserProfile( payload );
			}
		}
	}

	get isEditing() {
		return this._isEditing;
	}

	openProfilePicUploadDialog() {
		this.fileUploadService.createUploadTargetWithCallback( this.onProfilePicFileSelected );
	}

	openCoverPicUploadDialog() {

	}

	deleteProfilePic() {

	}

	async onProfilePicFileSelected( file ) {
		if( file ) {
			await this.userService.uploadProfilePic( file );
		}
	}

	async onCoverPicFileSelected( file ) {
		if( file ) {
			await this.userService.uploadCoverPic( file );
		}
	}

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

}

export default ProfileController;