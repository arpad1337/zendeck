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
			'FriendService',
			'ModalService'
		];
	}

	constructor( $scope, $state, userService, messageService, friendService, modalService ) {
		this.$scope = $scope;
		this.$state = $state;
		this.userService = userService;
		this.messageService = messageService;
		this.friendService = friendService;
		this.modalService = modalService;

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

	openSendNewMessageModal() {
		this.modalService.openDialog( this.modalService.DIALOG_TYPE.SEND_NEW_MESSAGE, {
			error: {
				message: null,
				recipient: null,
				backend: null
			}
		}).then(() => {
			this._page = 1;
			this.messageService.getThreadsByPage( this._page ).then((threads) => {
				this.threads.length = 0;
				threads.forEach((thread) => {
					this.threads.push( thread );
				});
			});
		});
	}

	get MESSAGES_STATES() {
		return STATES.APPLICATION.MESSAGES;
	}

	get currentState() {
		return this.$state.current.name;
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

	async getMoreMessages() {
		this._messagesPage++;
		let messages = await this.messageService.getThreadByUsernameAndPage( this._recipient.username, this._messagesPage );
		messages.forEach((message) => {
			this.messages.unshift( message );
		});
		this.$scope.$digest();
		return messages.length > 0;
	}

	async getMoreThreads() {
		this._page++;
		let threads = await this.messageService.getThreadsByPage( this._page );
		threads.forEach((thread) => {
			this.threads.push( thread );
		});
		this.$scope.$digest();
		return threads.length > 0;
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
		let message = this._message.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ');
		return this.messageService.sendMessageToUser( this._recipient.username, message ).then((message) => {
			this._message = '';
			this.messages.push( message );
		});
	}

}

export default MessagesController;