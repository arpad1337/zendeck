/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class ProfileController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'UserService',
			'FeedService',
			'FileUploadService'
		];
	}

	constructor( $scope, $state, userService, feedService, fileUploadService ) {
		this.$state = $state;
		this.$scope = $scope;
		this.userService = userService;
		this.feedService = feedService;
		this.fileUploadService = fileUploadService;

		this.onProfilePicFileSelected = this.onProfilePicFileSelected.bind( this );
		this.onCoverPicFileSelected = this.onCoverPicFileSelected.bind( this );

		this._initState();
	}

	_initState() {
		this._isEditing = false;
		this.userService.getProfileByUsername( this.$state.params.username ).then((profile) => {
			this.profile = profile;
			this.lastProfileFields = {
				about: this.profile.about,
				fullname: this.profile.fullname,
				birthDate: this.profile.birthDate
			};
		});
		this.feedService.getUserPosts( this.$state.params.username ).then(( posts ) => {
			this.posts = posts;
		});
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

}

export default ProfileController;