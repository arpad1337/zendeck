/*
 * @rpi1337
 */

const UserService = require('../services/user');
const GroupService = require('../services/group');
const FilterService = require('../services/filter');
const Util = require('../../util/util');

class SearchService {

	constructor( userService, groupService ) {
		this.userService = userService;
		this.groupService = groupService;
	}

	performBulkSearch( userId, predicate ) {
		return Promise.all([
			this.userService.quickSearch( userId, predicate ),
			this.groupService.quickSearch( predicate )
		]).then((values) => {
			let results = Util.flattenArrayOfArrays( values );
			results = results.sort((rowA, rowB) => {
				let keyA = rowA.key.toLowerCase();
				let keyB = rowB.key.toLowerCase();
				if( keyA > keyB ) {
					return 1;
				}
				if( keyA < keyB ) {
					return -1;
				}
				return 0;
			});
			return results;
		});
	}

	searchUsers( userId, predicate, page ) {
		return this.userService.searchByPredicateAndPage( userId, predicate, page );
	}

	searchGroups( predicate, page ) {
		return this.groupService.searchByPredicateAndPage( predicate, page );
	}

	static get instance() {
		if( !this.singleton ) {
			const userService = UserService.instance;
			const groupService = GroupService.instance;
			this.singleton = new SearchService( userService, groupService );
		}
		return this.singleton;
	}

}

module.exports = SearchService;