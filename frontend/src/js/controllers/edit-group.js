/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class EditGroupController {

	static get $inject() {
		return [
			'$state',
			'UserService',
			'GroupService'
		];
	}

	constructor( $state, userService, groupService ) {
		this.$state = $state;
		this.userService = userService;
		this.groupService = groupService;
	}

	//

	get isUserPremium() {
		return this.userService.currentUser && this.userService.currentUser.isPremium;
	}

	get groupSlug() {
		if( this.$state && this.$state.params.groupSlug ) {
			return this.$state.params.groupSlug;
		}
		return false;
	}

	saveGroup( 
		name, 
		about, 
		isPublic, 
		isModerated, 
		isOpen, 
		error, 
		ok
	) {
		if( !this.groupSlug ) {
			if( Validator.isFieldEmpty( name ) ) {
				error.name = true;
				return;
			} else {
				error.name = false;
			}
		}

		if( this.groupSlug ) {
			return this.groupService.updateGroupBySlug( this.groupSlug, {
				isPublic: isPublic === 'true',
				isModerated: isModerated === 'true',
				isOpen: isOpen === 'true'
			})
			.catch((error) => {
				error.backend = error;
				throw error;
			})
			.then(ok);
		}
		return this.groupService.createGroup({
			name: name,
			about: about,
			isPublic: isPublic === 'true',
			isModerated: isModerated === 'true',
			isOpen: isOpen === 'true'
		})
		.catch((error) => {
			error.backend = error;
			throw error;
		})
		.then(ok);
	}

}

export default EditGroupController;