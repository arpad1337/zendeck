/*
 * @rpi1337
 */

class MessageService {

	static get $inject() {
		return [
			'$q',
			'$http'
		];
	}

	constructor( $q, $http ) {
		this.$q = $q;
		this.$http = $http;
	}

	get dummyMessage() {
		return {
			author: {
				id: 1,
				username: 'rpi',
				fullname: 'Ar Pi',
				photos: {
					small: {
						src: '/img/avatar.jpg',
						width: 42,
						height: 42
					}
				},
				profileColor: '#9759B5'
			},
			message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate mi ut sagittis mollis. \n\nMaecenas lacinia odio nec dignissim elementum. Etiam posuere, ligula in aliquet dapibus, felis tortor feugiat lacus, viverra ullamcorper velit enim in erat. In hac habitasse platea dictumst.",
			createdAt: '2016-11-21 09:12:09.811+01',
			updatedAt: '2016-11-21 09:12:09.811+01'
		};
	}

	get dummyMessage2() {
		return {
			author: {
				id: 2,
				username: 'upiasdasdasd',
				fullname: 'Steve Blanketter',
				photos: {
					small: {
						src: '/img/avatar.jpg',
						width: 42,
						height: 42
					}
				},
				profileColor: '#9CC9B5'
			},
			message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Virra ullamcorper velit enim in erat. In hac habitasse platea dictumst.",
			createdAt: '2016-11-21 09:12:09.811+01',
			updatedAt: '2016-11-21 09:12:09.811+01'
		};
	}

	get dummyThread2() {
		return {
			id: 6,
			recipient: this.dummyMessage2.author,
			messages: [
				this.dummyMessage2
			],
			createdAt: '2016-11-21 09:12:09.811+01',
			updatedAt: '2016-11-21 09:12:09.811+01'
		};
	}

	get dummyThread() {
		return {
			id: 6,
			recipient: {
				id: 1,
				username: 'rpi',
				fullname: 'Ar Pi',
				photos: {
					small: {
						src: '/img/avatar.jpg',
						width: 42,
						height: 42
					}
				},
				profileColor: '#9759B5'
			},
			messages: [
				this.dummyMessage
			],
			createdAt: '2016-11-21 09:12:09.811+01',
			updatedAt: '2016-11-21 09:12:09.811+01'
		};
	}

	get dummyMessages() {
		return [
			this.dummyMessage,
			this.dummyMessage2,
			this.dummyMessage
		]
	}

	getThreadsByPage( page ) {
		page = isNaN( page ) ? 1 : page;
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([ this.dummyThread, this.dummyThread2 ]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	getThreadByUsernameAndPage( username, page ) {
		page = isNaN( page ) ? 1 : page;
		page = isNaN( page ) ? 1 : page;
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(this.dummyMessages);
		}, Math.random() * 1000);
		return promise.promise;
	}

	sendMessageToUser( username, message ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve({
				message: message,
				createdAt: (new Date()).toISOString()
			});
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default MessageService;