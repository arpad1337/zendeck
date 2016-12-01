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
		this._followingPage = 1;
		this.following = [];

		this.userService.getProfileByUsername( this.$state.params.username ).then((profile) => {
			this.profile = profile;
			this.lastProfileFields = {
				about: this.profile.about ? this.profile.about : null,
				fullname: this.profile.fullname,
				birthDate: this.profile.birthDate,
				profileColor: this.profile.profileColor
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

		this.friendService.getFollowingByUsernameAndPage( this.$state.params.username, this._followingPage ).then((following) => {
			following.forEach((friend) => {
				this.following.push( friend );
			});
		});

		this.userService.getUserStats( this.$state.params.username ).then((stats) => {
			this.stats = stats;
		});
		
		this.loadCollections();
	}

	openSendNewMessageModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.SEND_NEW_MESSAGE, {
			recipient: this.profile,
			error: {
				message: null,
				recipient: null,
				backend: null
			}
		});
	}

	async getMoreFollowing() {
		this._followingPage++;
		this.friendService.getFollowingByUsernameAndPage( this.$state.params.username, this._followingPage ).then((following) => {
			following.forEach((friend) => {
				this.following.push( friend );
			});
		});
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
			let color = this.profile.profileColor;
			if( color != this.lastProfileFields.profileColor ) {
				this.profile.profileColor = this.lastProfileFields.profileColor;
				this.lastProfileFields.profileColor = color;
			}

			let payload = {};
			let fields = ['about', 'fullname', 'birthDate', 'profileColor'];
			fields.forEach((field) => {
				if(
					this.lastProfileFields[ field ] != this.profile[field] &&
					!Validator.isFieldEmpty( this.lastProfileFields[ field ] )
				) {
					if( this.lastProfileFields[ field ] instanceof Date ) {
						payload[field] = this.lastProfileFields[ field ].toISOString();
					} else {
						payload[field] = this.lastProfileFields[ field ]
							.trim()
							.replace(/\n\s*\n/g, '\n\n')
							.replace(/  +/g, ' ');
					}
				}
			});
			if( Object.keys( payload ).length > 0 ) {
				let editedProfile = await this.userService.updateCurrentUserProfile( payload );
				this.profile = editedProfile;
				this.$scope.$digest();
			}
		} else {
			this.lastProfileFields = {
				about: this.profile.about ? this.profile.about : null,
				fullname: this.profile.fullname,
				birthDate: this.profile.birthDate,
				profileColor: this.profile.profileColor
			};
		}
	}

	get isEditing() {
		return this._isEditing;
	}

	openProfilePicUploadDialog() {
		this.fileUploadService.createUploadTargetWithCallback( this.onProfilePicFileSelected );
	}

	openCoverPicUploadDialog() {
		this.fileUploadService.createUploadTargetWithCallback( this.onCoverPicFileSelected );
	}

	deleteProfilePic() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'DELETE_PROFILE_PIC'
		}).then(() => {
			this.userService.deleteProfilePic();
		});
	}

	deleteCoverPic() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'DELETE_COVER_PIC'
		}).then(() => {
			this.userService.deleteCoverPic();
		});
	}

	openProfilePicCroppingDialog( file ) {
		let reader = new FileReader();
		reader.onload = (evt) => {
			let src = evt.target.result;
			this.modalService.openDialog( this.modalService.DIALOG_TYPE.PROFILE_PIC_CROPPING, {
				image: src,
				croppedImage: ''
			}).then((model) => {
				this.userService.uploadProfilePicBase64( file.name, model.croppedImage );
			});
		};
		reader.readAsDataURL(file);
	}

	async onProfilePicFileSelected( file ) {
		if( file ) {
			this.openProfilePicCroppingDialog( file );
		}
	}

	async onCoverPicFileSelected( file ) {
		if( file ) {
			await this.userService.uploadCoverPic( file );
		}
	}

	async addFriend( username ) {
		if( this.profile.isFriend ) {
			await this.friendService.removeFriend( username );
			this.profile.isFriend = false;
		} else {
			await this.friendService.addFriend( username );
			this.profile.isFriend = true;
		}
	}

}

export default ProfileController;