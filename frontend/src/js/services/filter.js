/*
 * @rpi1337
 */

class FilterService {

	static get $inject() {
		return [
			'$q',
			'$http'
		];
	}

	constructor( $q, $http ) {
		this.$q = $q;
		this.$http = $http;
		this._filters = {
			'0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf':
			{
				name: 'Movies',
				id: '0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf',
				tags: ['Marvel', 'DC', 'Movie', 'Comics']
			}
		};
	}

	getUserFilters() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([
				{
					name: 'Jobs',
					id: 'wAU2Fn2kib6bJKK75aoHXcFl01AEWYyl2SB1GdS9qUjcqWlfZucrVqDYbtf9pket',
					tags: ['JavaScipt', 'Frontend', 'Seattle']
				}
			]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	getFilterById( id ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			if( this._filters[ id ] ) {
				promise.resolve(this._filters[ id ]);
			} else {
				promise.reject('Not found');
			}
		}, Math.random() * 1000);
		return promise.promise;
	}

	copySharedFilterToCollection( payload ) {
		payload.id = 'test_' + (Math.floor( Math.random() * 999999999 ));
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( Object.assing({}, filter ));
		}, Math.random() * 1000);
		return promise.promise;
	}

	getTrendingTags() {
		let trendingTags = [
			{
				name: 'article',
				postCount: '183123786'
			},
			{
				name: 'pepsi',
				postCount: '7623786'
			}
		];
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve(trendingTags);
		}, Math.random() * 1000);
		return promise.promise;
	}

	createNewFilter( payload ) {
		payload.id = 'test_' + (Math.floor( Math.random() * 999999999 ));
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( payload );
		}, Math.random() * 1000);
		return promise.promise;
	}

	updateFilter( id, payload ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( payload );
		}, Math.random() * 1000);
		return promise.promise;
	}

	createNewFilterModelWithNameAndTags( name, tags ) {
		let model = {
			name: name.substr(0,1).toUpperCase() + name.substring(1),
			id: 'temporary_' + ( Math.floor( Math.random() * 99999 ) ),
			tags: tags,
			temporary: true
		};
		return model;
	}

	createNewFilterModelWithName( name ) {
		
		let model = {
			name: name.substr(0,1).toUpperCase() + name.substring(1),
			id: 'temporary_' + ( Math.floor( Math.random() * 99999 ) ),
			tags: [],
			temporary: true
		};
		return model;
	}

}

export default FilterService;