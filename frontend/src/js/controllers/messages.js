/*
 * @rpi1337
 */

import STATES from '../config/states';

class MessagesController {

	static get $inject() {
		return [
			'$scope',
			'$state',
			'UserService',
			'MessageService',
			'FriendService'
		];
	}

	constructor( $scope, $state, userService, messageService, friendService ) {
		this.$scope = $scope;
		this.$state = $state;
		this.userService = userService;
		this.messageService = messageService;
		this.friendService = friendService;

		this._initState();
	}

	_initState() {
		this._page = 1;
		this._messagesPage = 1;
		this.threads = [];
		this.messages = [];
		this._message = '';

		this._recipient = null;

		this.friendService.getCurrentUserRecentFriends(  ).then((friends) => {
			this.friends = friends;
		});

		this.messageService.getThreadsByPage( this._page ).then((threads) => {
			threads.forEach((thread) => {
				this.threads.push( thread );
			});
		});

		if( this.$state.current.name === STATES.APPLICATION.MESSAGES.THREAD ) {
			this.selectRecipient( this.$state.params.username );
			this.messageService.getThreadByUsernameAndPage( this.$state.params.username, this._messagesPage ).then((messages) => {
				messages.forEach((message) => {
					this.messages.unshift( message );
				});
			});
		}
	}

	set message( value ) {
		this._message = value
			.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ');
	}

	get message() {
		return this._message;
	}

	get currentRecipient() {
		return this._recipient;
	}

	get currentUser() {
		return this.userService.currentUser;
	}

	getMoreMessages() {
		this._messagesPage++;
		this.messageService.getThreadByUsernameAndPage( this._recipient.username, this._messagesPage ).then((messages) => {
			messages.forEach((message) => {
				this.messages.unshift( message );
			});
		});
	}

	getMoreThreads() {
		this._page++;
		this.messageService.getThreadsByPage( this._page ).then((threads) => {
			threads.forEach((thread) => {
				this.threads.push( thread );
			});
		});
	}

	selectRecipient( username ) {
		this.userService.getProfileByUsername( username ).then((profile)=> {
			this._recipient = profile;
		});
	}

	selectThread( username ) {
		this._messagesPage = 1;
		this.messages = [];

		this.selectRecipient( username );

		this.messageService.getThreadByUsernameAndPage( username, this._messagesPage ).then((messages) => {
			messages.forEach((message) => {
				this.messages.push( message );
			});
		});
	}

	sendMessage() {
		let message = this._message;
		return this.messageService.sendMessageToUser( this._recipient.username, message ).then((message) => {
			this._message = '';
			this.messages.push( message );
		});
	}

}

export default MessagesController;