/*
 * @rpi1337
 */

class CollectionService {

	static get $inject() {
		return [
			'$q',
			'$http'
		];
	}

	/*

		TODO: is public

	*/

	constructor( $q, $http ) {
		this.$q = $q;
		this.$http = $http;
		this._collections = {
			'0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf':
			{
				name: 'Videos',
				isPublic: true,
				shared: true,
				id: '0353arT45Q0r8L1CmKeT3oq10w665fZym655c6MGEqM7bxQ45872P2Z746ss7zyf'
			}
		};
	}

	getUserCollections() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([
				{
					name: 'Tech stuff',
					isPublic: true,
					id: 'wAU2Fn2kib6bJKK75aoHXcFl01AEWYyl2SB1GdS9qUjcqWlfZucrVqDYbtf9pket'
				}
			]);
		}, Math.random() * 1000);
		return promise.promise;
	}

	getCollectionById( id ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			if( this._collections[ id ] ) {
				promise.resolve(this._collections[ id ]);
			} else {
				promise.reject('Not found');
			}
		}, Math.random() * 1000);
		return promise.promise;
	}

	copySharedCollectionToCollections( collection ) {
		let payload = {};
		payload.id = collection.id;
		payload.name = collection.name;
		payload.isPublic = collection.isPublic;
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( Object.assign({}, payload ));
		}, Math.random() * 1000);
		return promise.promise;
	}

	updateCollection( id, payload ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( payload );
		}, Math.random() * 1000);
		return promise.promise;
	}

	createNewCollectionModelWithName( name, isPublic ) {
		let model = {
			name: name.substr(0,1).toUpperCase() + name.substring(1),
			isPublic: isPublic,
			id: 'new_' + ( Math.floor( Math.random() * 99999 ) )
		};
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve( model );
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default CollectionService;