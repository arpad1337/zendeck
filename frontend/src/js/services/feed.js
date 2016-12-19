/*
 * @ri1337
 */

class FeedService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'UserService'
		]
	}

	constructor( $q, $http, userService,  ) {
		this.$q = $q;
		this.$http = $http;
		this.userService = userService;

		this._postsCache = {};
		this._groupPostsCache = {};
	}

	// get dummyPost() {
	// 	return {
	// 		id: 123,
	// 		author: {
	// 			id: 1,
	// 			username: 'rpi',
	// 			fullname: 'Ar Pi',
	// 			profileColor: '#9759B5',
	// 			photos: {
	// 				small: {
	// 					src: 'img/avatar.jpg',
	// 					width: 42,
	// 					height: 42
	// 				}
	// 			}
	// 		},
	// 		createdAt: '2016-11-16 09:09:29.811+01',
	// 		tags: ['article', 'pepsi'],
	// 		content: 'Lorem ipsum dolor sit amet loooooooooooooooong wooooords',
	// 		attachment: {
	// 			preview: '/img/avatar.jpg',
	// 			title: 'Metamind has been acquired by Salesforce',
	// 			description: 'MetaMind, a Palo Alto-based AI startup founded in July 2014, is being acquired by Salesforce. According to a new post published at the company\'s website by CEO Richard Socher -- a Stanford PhD who stu',
	// 			source: 'TechCrunch',
	// 			url: 'http://techcrunch.com'
	// 		},
	// 		inGroup: true,
	// 		group: {
	// 			name: 'Frontend Meetup Group Ipsum Shit',
	// 			id: 'DASD897DASD89FASDFHJGJKQWE564IIII98'
	// 		},
	// 		likes: 186547,
	// 		liked: true,
	// 		starred: false,
	// 		comments:{
	// 			count: 15,
	// 			data:
	// 			[

	// 				{
	// 					id: 6,
	// 					author: {
	// 						id: 1,
	// 						username: 'rpi',
	// 						fullname: 'Ar Pi',
	// 						photos: {
	// 							small: {
	// 								src: '/img/avatar.jpg',
	// 								width: 42,
	// 								height: 42
	// 							}
	// 						},
	// 						profileColor: '#9759B5'
	// 					},
	// 					content: "Lorem ipsum dolor\n\nwhat ever",
	// 					createdAt: '2016-11-21 09:12:09.811+01'
	// 				},
	// 				{
	// 					id: 6,
	// 					author: {
	// 						id: 2,
	// 						username: 'nrpi',
	// 						fullname: 'Lol',
	// 						photos: {
	// 							small: {
	// 								src: '/img/avatar.jpg',
	// 								width: 42,
	// 								height: 42
	// 							}
	// 						},
	// 						profileColor: '#2f8aaa'
	// 					},
	// 					content: 'Lorem ipsum dolor sit amet loooooooooooooooong wooooords',
	// 					createdAt: '2016-11-16 09:12:09.811+01'
	// 				},
	// 				{
	// 					id: 7,
	// 					author: {
	// 						id: 3,
	// 						username: 'zrpi',
	// 						fullname: 'Zzaza',
	// 						profileColor: '#5aaa2f',
	// 						photos: {
	// 							small: {
	// 								src: '/img/avatar.jpg',
	// 								width: 42,
	// 								height: 42
	// 							}
	// 						}
	// 					},
	// 					content: 'Lorem ipsum dolor',
	// 					createdAt: '2016-11-19 09:12:09.811+01'
	// 				}
	// 			]
	// 		}
	// 	};
	// }

	postToFeed( post ) {
		return this.$http.post( CONFIG.API_PATH + '/feed', post ).then( r => r.data );
	}

	postToGroup( slug, post ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/feed', post ).then( r => r.data );
	}

	getPostById( postId ) {
		return this.$http.get( CONFIG.API_PATH + '/post/' + postId ).then( r => r.data );
	}

	getFeedByPage( page ) {
		return this.$http.get( CONFIG.API_PATH + '/feed?page=' + page ).then( r => r.data );
	}

	getUserPostsByUsernameAndPage( username, page, force ) {
		page == isNaN( page ) ? 1 : page;
		if( !force && this._postsCache[ username ] ) {
			return this.$q.resolve( this._postsCache[ username ] );
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/feed?page=' + page ).then((r) => {
			this._postsCache[ username ] = r.data;
			return r.data;
		});
	}

	getGroupPostsByGroupSlugAndPage( groupId, page, force ) {
		page == isNaN( page ) ? 1 : page;
		if( !force && this._groupPostsCache[ groupId ] ) {
			return this.$q.resolve( this._groupPostsCache[ groupId ] );
		}
		return this.$http.get( CONFIG.API_PATH + '/group/' + groupId + '/feed?page=' + page ).then((r) => {
			this._groupPostsCache[ groupId ] = r.data;
			return r.data;
		});
	}

	getPostsByFilterAndPage( tags, page ) {
		return this.$http.post( CONFIG.API_PATH + '/filter?page=' + page, { tags: tags } ).then(( r ) => {
			return r.data;
		});
	}

	getPostsByGroupFilterAndPage( groupSlug, tags, page ) {
		return this.$http.post( CONFIG.API_PATH + '/filter?page=' + page, { tags: tags, groupSlug: groupSlug } ).then(( r ) => {
			return r.data;
		});
	}

	getPostsByCollectionSlugAndPage( collectionSlug, page ) {
		return this.$http.get( CONFIG.API_PATH + '/collection/' + collectionSlug + '/feed?page=' + page ).then( r => r.data );
	}

	getPostsByGroupCollectionSlugAndPage( groupSlug, collectionSlug, page ) {
		return this.$http.get( CONFIG.API_PATH + '/group/'+groupSlug+'/collection/' + collectionSlug + '/feed?page=' + page ).then( r => r.data );
	}

	getLikedPostsByPage( page ) {
		return this.$http.get( CONFIG.API_PATH + '/feed/liked?page=' + page ).then( r => r.data );
	}

	getFriendLikedPostsByPage( username, page ) {
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/feed/liked?page=' + page ).then( r => r.data );
	}

	getGroupLikedPostsByPage( groupSlug, page ) {
		return this.$http.get( CONFIG.API_PATH + '/group/' + groupSlug + '/feed/liked?page=' + page ).then((r) => {
			return r.data;
		});
	}

	likePost( postId ) {
		return this.$http.post( CONFIG.API_PATH + '/post/' + postId + '/like' ).then((r) => {
			return r.data;
		});
	}

	dislikePost( postId ) {
		return this.$http.delete( CONFIG.API_PATH + '/post/' + postId + '/like' ).then((r) => {
			return r.data;
		});
	}

	commentPost( postId, comment ) {
		return this.$http.post( CONFIG.API_PATH + '/post/' + postId + '/comment', { content: comment } ).then((r) => {
			return r.data;
		});
	}

	deleteComment( postId, commentId ) {
		return this.$http.delete( CONFIG.API_PATH + '/post/' + postId + '/comment/' + commentId ).then((_) => {
			return true;
		});
	}

	deletePost( postId ) {
		return this.$http.delete( CONFIG.API_PATH + '/post/' + postId ).then((_) => {
			return true;
		});
	}

	addPostToGroupCollection( groupSlug, collectionSlug, postId ) {
		return this.$http.post(CONFIG.API_PATH + '/group/' + groupSlug + '/collection/' + collectionSlug + '/feed/' +postId);
	}

	addPostToCollection( slug, postId ) {
		return this.$http.post(CONFIG.API_PATH + '/collection/' + slug + '/feed/' +postId);
	}

	getMoreCommentsForPost( postId, page ) {
		return this.$http.get( CONFIG.API_PATH + '/post/' + postId + '/comment?page=' + page ).then((r) => r.data);
	}

	scrapeUrl( url ) {
		return this.$http.post( CONFIG.API_PATH + '/scrape', {url: url} ).then( r => r.data );
		// let promise = this.$q.defer();
		// setTimeout(() => {
		// 	promise.resolve({
		// 		meta: {
		// 			preview: '/img/avatar.jpg',
		// 			title: 'Metamind has been acquired by Salesforce',
		// 			description: 'MetaMind, a Palo Alto-based AI startup founded in July 2014, is being acquired by Salesforce. According to a new post published at the company\'s website by CEO Richard Socher -- a Stanford PhD who stu',
		// 			source: 'TechCrunch',
		// 			url: 'http://techcrunch.com'
		// 		},
		// 		tags: ['article', 'techcrunch', 'startup', 'metamind', 'salesforce']
		// 	});
		// }, Math.random() * 1000);
		// return promise.promise;
	}

}

export default FeedService;