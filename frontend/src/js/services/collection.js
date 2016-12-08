/*
 * @rpi1337
 */

class CollectionService {

	static get $inject() {
		return [
			'$q',
			'$http',
			'UserService'
		];
	}

	/*

		TODO: is public

	*/

	constructor( $q, $http, userService ) {
		this.$q = $q;
		this.$http = $http;
		this.userService = userService;
		// this._collections = {
		// 	'0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf':
		// 	{
		// 		parent: false,
		// 		name: 'Videos',
		// 		isPublic: true,
		// 		shared: true,
		// 		id: '0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf'
		// 	}
		// };
	}

	getGroupCollections() {
		return this.$http.get(CONFIG.API_PATH + '/group/:groupSlug/collection').then((r) => {
			return r.data;
		});
	}

	getUserCollections( username ) {
		if( !username || username == this.userService.currentUser.username ) {
			username = 'me';
		}
		return this.$http.get( CONFIG.API_PATH + '/user/' + username + '/collection' ).then((r) => {
			return r.data;
		});
	}

	getGroupCollections( slug ) {
		return this.$http.get( CONFIG.API_PATH + '/group/' + slug + '/collection' ).then((r) => {
			return r.data;
		});
	}

	getCollectionBySlug( slug ) {
		return this.$http.get( CONFIG.API_PATH + '/collection/' + slug ).then((r) => {
			return r.data;
		});
	}

	copySharedCollectionToCollections( collection ) {
		return this.$http.post( CONFIG.API_PATH + '/collection', {
			name: collection.name,
			isPublic: collection.isPublic,
			parent: collection.id
		}).then((r) => {
			return r.data;
		});
	}

	updateCollection( slug, payload ) {
		return this.$http.post( CONFIG.API_PATH + '/collection/' + slug, {
			name: payload.name,
			isPublic: payload.isPublic
		}).then((r) => {
			return r.data;
		});
	}

	createNewCollectionModelWithName( name, isPublic ) {
		return this.$http.post( CONFIG.API_PATH + '/collection', {
			name: collection.name,
			isPublic: collection.isPublic
		}).then((r) => {
			return r.data;
		});
	}

	createNewGroupCollectionModelWithSlugAndName( slug, name, isPublic ) {
		return this.$http.post( CONFIG.API_PATH + '/group/' + slug + '/collection', {
			name: collection.name,
			isPublic: collection.isPublic
		}).then((r) => {
			return r.data;
		});
	}

}

export default CollectionService;