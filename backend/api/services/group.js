/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');

class GroupService {
	
	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
	}

	getGroupBySlug() {
		return new Promise((resolve, reject) => {
			resolve({
				id: 1
			});
		});
	}

	getGroupById( id ) {
		return new Promise((resolve, reject) => {
			resolve(true);
		});
	}

	getGroupsByIds( id ) {
		return new Promise((resolve, reject) => {
			resolve([]);
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new GroupService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = GroupService;