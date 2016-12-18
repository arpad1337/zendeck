/*
 * @rpi1337
 */

class SearchService {

	static get $inject() {
		return [
			'$http'
		];
	}

	constructor( $http ) {
		this.$http = $http;
	}

	searchWithPredicate( predicate ) {
		return this.$http.post( CONFIG.API_PATH + '/search', { predicate: predicate } ).then( r => r.data );
	}

}

export default SearchService;