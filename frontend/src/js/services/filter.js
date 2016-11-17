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
			promise.resolve({
				name: 'Movies',
				id: '0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf',
				tags: ['Marvel', 'DC', 'Movie', 'Comics']
			});
		}, Math.random() * 1000);
		return promise.promise;
	}

	saveSharedFilterToCollection() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve('ok');
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default FilterService;