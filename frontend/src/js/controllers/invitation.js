/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class InvitationController {

	static get $inject() {
		return [
			'$state',
			'$scope',
			'UserService',
			'FriendService',
			'ModalService'
		];
	}

	constructor( $state, $scope, userService, friendService, modalService ) {
		this.$state = $state;
		this.$scope = $scope;
		this.userService = userService;
		this.friendService = friendService;
		this.modalService = modalService;

		this._users = new Set();
	}

	get users() {
		return Array.from( this._users );
	}

	removeUser( user ) {
		this._users.delete( user );
	}

	onEnter( email ) {
		if( Validator.validateEmail( email ) ) {
			this._users.add({
				email: email.trim(),
				fullname: email.trim()
			});
		}
	}

	inviteUsers( error, ok ) {
		if( this.users.length === 0 ) {
			error.users = true;
			return;
		} else {
			error.users = false;
		}
		return this.userService.inviteUsers( this.users ).then(() =>{
			ok();
			this.done();
		}).catch(e => { 
			error.backend = e.data;
		});
	}

	done() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.MESSAGE, {
			messageDialogTemplateKey: 'INVITATION_SENT'
		});
	}

}

export default InvitationController;
