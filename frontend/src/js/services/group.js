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
			createdBy: 1,
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

	createGroupWithNameAndOptions( name, options ) {

	}

	assignAdminToGroup( userId ) {

	}

	removeAdminFromGroup( userId ) {

	}

	updateGroupProfileBySlug( groupSlug, payload ) {
		return this.dummyGroup;
	}

	getGroupMemebersBySlugAndPage( slug, page ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([ this.userService.currentUser ])
		}, Math.random() * 1000);
		return promise.promise;
	}

	getGroupStatsBySlug( slug ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve({
				members: 12,
				articles: 10,
				photos: 2,
				videos: 4,
				events: 0
			})
		}, Math.random() * 1000);
		return promise.promise;
	}

	getGroupListByPage( page, force ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([ this.dummyGroup ]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	getRecentGroups() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([ this.dummyGroup ]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	getGroupProfileBySlug( slug ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(this.dummyGroup);
		}, Math.random() * 1000);
		return promise.promise;
	}



}

export default GroupService;