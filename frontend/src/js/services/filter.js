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
		this._filters = new Map();
	}

	getGroupFilters( slug ) {
		return this.$http.get( CONFIG.API_PATH + '/group/' + slug + '/filter' ).then((r) => {
			return r.data;
		});
	}

	getUserFilters() {
		return this.$http.get( CONFIG.API_PATH + '/user/me/filter' ).then((r) => {
			return r.data;
		});
	}

	getFilterBySlug( slug ) {
		if( this._filters.get( slug ) ) {
			return this.$q.resolve( this._filters.get(slug) );
		}
		return this.$http.get( CONFIG.API_PATH + '/filter/' + slug ).then((r) => {
			return r.data;
		});
	}

	copySharedFilterToCollection( payload ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me/filter', {
			name: payload.name,
			tags: payload.tags
		}).then((r) => {
			this._filters.set( r.data.slug, r.data );
			return r.data;
		});
	}

	copySharedGroupFilterToCollection( slug, payload ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/filter', {
			name: payload.name,
			tags: payload.tags
		}).then((r) => {
			this._filters.set( r.data.slug, r.data );
			return r.data;
		});
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
		if( payload.tags.length == 0 ) {
			return this.$q.reject('Tags must be set');
		}
		return this.$http.post( CONFIG.API_PATH + '/user/me/filter', {
			name: payload.name,
			tags: payload.tags,
			groupId: payload.groupId || null
		}).then((r) => {
			this._filters.set( r.data.slug, r.data );
			return r.data;
		});
	}

	createNewGroupFilter( slug, payload ) {
		if( payload.tags.length == 0 ) {
			return this.$q.reject('Tags must be set');
		}
		return this.$http.post( CONFIG.API_PATH + '/group/'+slug+'/filter', {
			name: payload.name,
			tags: payload.tags,
		}).then((r) => {
			this._filters.set( r.data.slug, r.data );
			return r.data;
		});
	}

	updateFilter( slug, payload ) {
		return this.$http.post( CONFIG.API_PATH + '/user/me/filter/' + slug, {
			name: payload.name,
			tags: payload.tags
		}).then((r) => {
			return r.data;
		});
	}

	updateGroupFilter( groupSlug, slug, payload ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + groupSlug + '/filter/' + slug, {
			name: payload.name,
			tags: payload.tags
		}).then((r) => {
			return r.data;
		});
	}

	createNewFilterModelWithNameAndTags( name, tags ) {
		let model = {
			name: name.substr(0,1).toUpperCase() + name.substring(1),
			slug: 'temporary_' + ( Math.floor( Math.random() * 99999 ) ),
			tags: tags,
			temporary: true
		};
		this._filters.set( model.slug, model );
		return model;
	}


	createNewFilterModelWithName( name ) {
		let model = {
			name: name.substr(0,1).toUpperCase() + name.substring(1),
			slug: 'temporary_' + ( Math.floor( Math.random() * 99999 ) ),
			tags: [],
			temporary: true
		};
		this._filters.set( model.slug, model );
		return model;
	}


}

export default FilterService;