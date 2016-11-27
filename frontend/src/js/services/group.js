/*
 * @rpi1337
 */

class GroupService {

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

	getRecentGroups() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([]);
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default GroupService;