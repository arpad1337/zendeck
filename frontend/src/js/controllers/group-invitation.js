/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class GroupInvitationController {

	static get $inject() {
		return [
			'$state',
			'$scope',
			'UserService',
			'FriendService',
			'GroupService',
			'ModalService'
		];
	}

	constructor( $state, $scope, userService, friendService, groupService, modalService ) {
		this.$state = $state;
		this.$scope = $scope;
		this.userService = userService;
		this.friendService = friendService;
		this.groupService = groupService;
		this.modalService = modalService;

		this._initState();
	}

	_initState() {
		this._users = new Set();
		this._allFriendsPage = 1;
		this.userAllFriends = [];
		this._noMoreFriends = false;
		this.groupService.getGroupProfileBySlug( this.$state.params.groupSlug ).then((profile) => {
			this.profile = profile;
		});
		this._loadFriendsByPage( this._allFriendsPage );
	}

	get currentSlug() {
		return this.$state.params.groupSlug;
	}

	async _loadFriendsByPage( page ) {
		let friends = await this.friendService.getCurrentUserFriendsByPage( this._allFriendsPage );
		if( !friends ) {
			this._noMoreFriends = true;
		}
		friends.forEach((friend) => {
			this.userAllFriends.push( friend );
		});
		this.$scope.$digest();
	}

	onPredicateChange( predicate ) {
		if( predicate.length == 0 ) {
			return;
		}
		return this.userService.searchUsersByPedicate( predicate ).then((results) => {
			results.forEach((user) => {
				if( !this.userAllFriends.find((u)  => {
					return u.username == user.username
				}) ) {
					this.userAllFriends.unshift( user );
				}
			});
		});
	}

	async onBottomReached(  ) {
		if( !this._noMoreFriends ) {
			this._allFriendsPage++;
			let friends = await this.friendService.getCurrentUserFriendsByPage( this._allFriendsPage );
			friends.forEach((friend) => {
				this.userAllFriends.push( friend );
			});
		}
	}

	get users() {
		return Array.from( this._users );
	}

	addUser( user ) {
		this._users.add( user );
	}

	removeUser( user ) {
		let found = this.userAllFriends.find((u) => {
			return u.fullname == user.fullname;
		});
		if( found ) {
			found.hidden = false;
		}
		this._users.delete( user );
	}

	onItemSelected( user ) {
		this._users.add( user );
		user.hidden = true;
	}

	onEnter( email ) {
		if( Validator.validateEmail( email ) ) {
			this._users.add({
				email: email,
				fullname: email
			});
		}
	}

	inviteUsers( error, ok ) {
		console.log(this.users);
		if( this.users.length === 0 ) {
			error.users = true;
			return;
		} else {
			error.users = false;
		}
		return this.groupService.inviteUsersToGroup( this.currentSlug, this.users ).then(() =>{
			ok();
			this.modalService.openDialog( this.modalService.DIALOG_TYPE.MESSAGE, {
				messageDialogTemplateKey: 'INVITATION_SENT'
			});
		}).catch(e => { 
			error.backend = e.data;
		});
	}

}

export default GroupInvitationController;