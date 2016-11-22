/*
 * @ri1337
 */

class FeedService {

	static get $inject() {
		return [
			'$q',
			'$http'
		]
	}

	constructor( $q, $http ) {
		this.$q = $q;
		this.$http = $http;

		this._postsCache = {};
	}

	get dummyPost() {
		return {
			id: 123,
			author: {
				id: 1,
				username: 'rpi',
				fullname: 'Ar Pi',
				profileColor: '#9759B5',
				photos: {
					small: {
						src: 'img/avatar.jpg',
						width: 42,
						height: 42
					}
				}
			},
			createdAt: '2016-11-16 09:09:29.811+01',
			tags: ['article', 'pepsi'],
			content: 'Lorem ipsum dolor sit amet loooooooooooooooong wooooords',
			attachment: {
				preview: 'img/avatar.jpg',
				title: 'Lorem ipsum dolor',
				description: 'Lorem ipsum dolor sit amet',
				source: 'example.com',
				url: 'http://tnw.co/asd123'
			},
			inGroup: true,
			group: {
				name: 'Frontend Meetup Group Ipsum Shit',
				id: 'DASD897DASD89FASDFHJGJKQWE564IIII98'
			},
			likes: 186547,
			liked: true,
			starred: false,
			comments:{
				count: 15,
				data:
				[

					{
						author: {
							id: 1,
							username: 'rpi',
							fullname: 'Ar Pi',
							photos: {
								small: {
									src: 'img/avatar.jpg',
									width: 42,
									height: 42
								}
							}
						},
						content: "Lorem ipsum dolor\n\nwhat ever",
						createdAt: '2016-11-21 09:12:09.811+01'
					},
					{
						author: {
							id: 1,
							username: 'rpi',
							fullname: 'Ar Pi',
							photos: {
								small: {
									src: 'img/avatar.jpg',
									width: 42,
									height: 42
								}
							}
						},
						content: 'Lorem ipsum dolor sit amet loooooooooooooooong wooooords',
						createdAt: '2016-11-16 09:12:09.811+01'
					},
					{
						author: {
							id: 1,
							username: 'rpi',
							fullname: 'Ar Pi',
							photos: {
								small: {
									src: 'img/avatar.jpg',
									width: 42,
									height: 42
								}
							}
						},
						content: 'Lorem ipsum dolor',
						createdAt: '2016-11-19 09:12:09.811+01'
					}
				]
			}
		};
	}

	getFeedByPage( page ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([ this.dummyPost ])
		}, Math.random() * 1000);
		return promise.promise;
	}

	getUserPosts( username, force ) {
		if( !force && this._postsCache[ username ] ) {
			return this.$q.resolve( this._postsCache[ username ] );
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/post' ).then((r) => {
			this._postsCache[ username ] = r.data;
			return r.data;
		});
	}

	scrapeUrl( url ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve({
				title: 'Metamind has been acquired by Salesforce',
				shortContent: 'MetaMind, a Palo Alto-based AI startup founded in July 2014, is being acquired by Salesforce. According to a new post published at the company\'s website by CEO Richard Socher -- a Stanford PhD who stu',
				picture: {
					large: 'img/avatar.jpg'
				},
				medium: 'TechCrunch',
				author: 'John Doe',
				tags: ['article', 'techcrunch', 'startup', 'metamind', 'salesforce']
			});
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default FeedService;