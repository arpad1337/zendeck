/*
 * @rpi1337
 */

class MessageService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'MessageBusService'
		];
	}

	constructor( $q, $http, messageBusService ) {
		this.$q = $q;
		this.$http = $http;
		this._unreadMessageCount = 0;
		this.messageBusService = messageBusService

		this.messageBusService.on( this.messageBusService.MESSAGES.NOTIFICATIONS.NEW_MESSAGE, () => {
			this._unreadMessageCount++;
		});
	}

	getUnreadMessageCount() {
		return this.$http.get( CONFIG.API_PATH + '/message/unread' ).then((r) => {
			this._unreadMessageCount = r.data.count;
			return this._unreadMessageCount;
		});
	}

	getThreadsByPage( page ) {
		page = isNaN( page ) ? 1 : page;
		return this.$http.get( CONFIG.API_PATH + '/message/thread?page=' + page ).then((r) => {
			return r.data;
		});
	}

	getThreadByUsernameAndPage( username, page ) {
		page = isNaN( page ) ? 1 : page;
		this.messageBusService.emit( this.messageBusService.MESSAGES.NOTIFICATIONS.THREAD_VIEW );
		return this.$http.get( CONFIG.API_PATH + '/message/thread/' + username + '?page=' + page ).then((r) => {
			return r.data;
		});
	}

	sendMessageToUser( username, message ) {
		return this.$http.post( CONFIG.API_PATH + '/message/thread/' + username, { content: message }).then((r) => {
			return r.data;
		});
	}

	
	// get dummyMessage() {
	// 	return {
	// 		author: {
	// 			id: 1,
	// 			username: 'rpi',
	// 			fullname: 'Ar Pi',
	// 			photos: {
	// 				small: {
	// 					src: '/img/avatar.jpg',
	// 					width: 42,
	// 					height: 42
	// 				}
	// 			},
	// 			profileColor: '#9759B5'
	// 		},
	// 		message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate mi ut sagittis mollis. \n\nMaecenas lacinia odio nec dignissim elementum. Etiam posuere, ligula in aliquet dapibus, felis tortor feugiat lacus, viverra ullamcorper velit enim in erat. In hac habitasse platea dictumst.",
	// 		createdAt: '2016-11-21 09:12:09.811+01',
	// 		updatedAt: '2016-11-21 09:12:09.811+01'
	// 	};
	// }

	// get dummyMessage2() {
	// 	return {
	// 		author: {
	// 			id: 2,
	// 			username: 'upiasdasdasd',
	// 			fullname: 'Steve Blanketter',
	// 			photos: {
	// 				small: {
	// 					src: '/img/avatar.jpg',
	// 					width: 42,
	// 					height: 42
	// 				}
	// 			},
	// 			profileColor: '#9CC9B5'
	// 		},
	// 		message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Virra ullamcorper velit enim in erat. In hac habitasse platea dictumst.",
	// 		createdAt: '2016-11-21 09:12:09.811+01',
	// 		updatedAt: '2016-11-21 09:12:09.811+01'
	// 	};
	// }

	// get dummyThread2() {
	// 	return {
	// 		id: 6,
	// 		recipient: this.dummyMessage2.author,
	// 		messages: [
	// 			this.dummyMessage2
	// 		],
	// 		createdAt: '2016-11-21 09:12:09.811+01',
	// 		updatedAt: '2016-11-21 09:12:09.811+01'
	// 	};
	// }

	// get dummyThread() {
	// 	return {
	// 		id: 6,
	// 		recipient: {
	// 			id: 1,
	// 			username: 'rpi',
	// 			fullname: 'Ar Pi',
	// 			photos: {
	// 				small: {
	// 					src: '/img/avatar.jpg',
	// 					width: 42,
	// 					height: 42
	// 				}
	// 			},
	// 			profileColor: '#9759B5'
	// 		},
	// 		messages: [
	// 			this.dummyMessage
	// 		],
	// 		createdAt: '2016-11-21 09:12:09.811+01',
	// 		updatedAt: '2016-11-21 09:12:09.811+01'
	// 	};
	// }

	// get dummyMessages() {
	// 	return [
	// 		this.dummyMessage,
	// 		this.dummyMessage2,
	// 		this.dummyMessage
	// 	]
	// }

}

export default MessageService;