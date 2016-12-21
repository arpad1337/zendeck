/*
 * @rpi1337
 */

class GroupService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'FeedService',
			'UserService'
		];
	}

	get dummyGroup() {
		return {
			id: 1,
			slug: 'jhadsd87785dasdasHJGgdas67dasd',
			userId: 1,
			admins: [2,3],
			name: 'Frontend Meetup Budapest',
			about: 'Lorem ipsum dolor sit amet',
			profileColor: 'red',
			photos: null, // { cover }
			isPublic: true,
			isModerated: false, // TODO
			isOpen: true, // TODO,
			memberCount: 128,
			userIsMember: true,
			createdAt: (new Date()).toISOString()
		}
	}

	constructor( $q, $http, feedService, userService ) {
		this.$q = $q;
		this.$http = $http;
		this.feedService = feedService;
		this.userService = userService;

		this._groupListCache = [];
		this._groupProfileCache = {};
	}

	createGroup( payload ) {
		return this.$http.post( CONFIG.API_PATH + '/group', payload ).then((r) => {
			return r.data;
		});
	}

	assignAdminToGroup( slug, userId ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/admin/' + userId ).then( r => r.data );
	}

	removeAdminFromGroup( slug, userId ) {
		return this.$http.delete( CONFIG.API_PATH + '/group/' + slug + '/admin/' + userId ).then( r => r.data );
	}

	approveUser( slug, userId ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/member/' + userId ).then( r => r.data );
	}

	kickUserFromGroup( slug, userId ) {
		return this.$http.delete( CONFIG.API_PATH + '/group/' + slug + '/member/' + userId ).then( r => r.data );
	}

	joinToGroup( slug ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/member' ).then( r => r.data );
	}

	leaveGroup( slug ) {
		return this.$http.delete( CONFIG.API_PATH + '/group/' + slug + '/member' ).then( r => r.data );
	}

	updateGroupBySlug( groupSlug, payload ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + groupSlug, payload ).then((r) => {
			return r.data;
		});
	}

	uploadCoverPic( slug, photo ) {
		let data = new FormData();
		data.append( 'file', photo );
		return this.$http.post(
			CONFIG.API_PATH + '/group/'+slug+'/cover', 
			data, 
			{
            	transformRequest: angular.identity,
            	headers: {'Content-Type': undefined}
        	}
        ).then((r) => {
        	let resourceUrl = r.data.success;
        	return resourceUrl;
		});
	}

	getGroupMemebersBySlugAndPage( slug, page ) {
		return this.$http.get( CONFIG.API_PATH + '/group/' + slug + '/member?page=' + page ).then((r) => {
			return r.data;
		});
	}

	// getGroupStatsBySlug( slug ) {
	// 	let promise = this.$q.defer();
	// 	setTimeout(() => {
	// 		promise.resolve({
	// 			members: 12,
	// 			articles: 10,
	// 			photos: 2,
	// 			videos: 4,
	// 			events: 0
	// 		})
	// 	}, Math.random() * 1000);
	// 	return promise.promise;
	// }

	getGroupListByPage( page, force ) {
		return this.$http.get( CONFIG.API_PATH + '/user/me/group?page=' + page ).then((r) => {
			return r.data;
		});
	}

	getRecentGroups() {
		return this.$http.get( CONFIG.API_PATH + '/user/me/group?page=' + "1" ).then((r) => {
			return r.data;
		});
	}

	getGroupProfileBySlug( slug ) {
		return this.$http.get( CONFIG.API_PATH + '/group/' + slug ).then((r) => {
			return r.data;
		});
	}

	inviteUsersToGroup( slug, users ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/invitation', {
			users: users
		}).then((r) => r.data);
	}

	acceptInvitation( slug, key ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/invitation/' + key ).then((r)=>r.data);
	}

	approvePost( slug, postId ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/feed/' + postId ).then((r)=>r.data);
	}

}

export default GroupService;