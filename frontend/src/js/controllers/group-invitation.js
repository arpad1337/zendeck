/*
 * @rpi1337
 */

import InvitationController from './invitation';
import Validator from '../helpers/validator';

class GroupInvitationController extends InvitationController {

	static get $inject() {
		let parentDeps = InvitationController.$inject;
		return parentDeps.concat([
			'GroupService'
		]);
	}

	constructor() {
		super( ...arguments );
		this.groupService = arguments[ arguments.length -1 ];

		this._initState();
	}

	_initState() {
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

	onItemSelected( user ) {
		this._users.add( user );
		user.hidden = true;
	}

	// @override
	removeUser( user ) {
		let found = this.userAllFriends.find((u) => {
			return u.fullname == user.fullname;
		});
		if( found ) {
			found.hidden = false;
		}
		super.removeUser(user);
	}

	// @override
	inviteUsers( error, ok ) {
		if( this.users.length === 0 ) {
			error.users = true;
			return;
		} else {
			error.users = false;
		}
		return this.groupService.inviteUsersToGroup( this.currentSlug, this.users ).then(() =>{
			ok();
			this.done();
		}).catch(e => { 
			error.backend = e.data;
		});
	}

}

export default GroupInvitationController;