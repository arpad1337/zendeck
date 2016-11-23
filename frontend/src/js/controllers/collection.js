/*
 * @rpi1337
 */

import STATES from '../config/states';

class CollectionController {

	constructor( $state, collectionService ) {
		this.collectionService = collectionService;
		this.$state = $state;
	}

	get activeState() {
		return this.$state.current.name;
	}

	get FEED_STATES() {
		return STATES.APPLICATION.FEED;
	}

	resetPaginator() {
		this.posts = this.posts || [];
		this.posts.length = 0;
		this._page = 1;
	}

	getMorePosts() {
		throw new Error('CollectionController->getMorePosts Must override!');
	}

	loadCollections() {
		this.collectionService.getUserCollections( this.username ).then((collections) => {
			this.collections = collections;
			if( this.$state.params.collectionId ) {
				this.selectCollection( this.$state.params.collectionId );
			}
		});
	}

	async selectLiked() {
		this.resetPaginator();
		let posts = await this.feedService.getLikedPostsByPage( this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async selectCollection( id ) {
		this.resetPaginator();
		let collection = this.collections.find((f) => {
			return f.id == id;
		});
		if( !collection ) {
			try {
				this._activeCollection = await this.collectionService.getCollectionById( id );
				this._activeCollection.shared = true;
				this.$scope.$digest();
			} catch( e ) {
				this.$state.go(this.FEED_STATES.POSTS);
			}
		} else {
			this._activeCollection = Object.assign( {}, collection );
		}
		let posts = await this.feedService.getPostsByCollectionIdAndPage( this._activeCollection.id, this._page );
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async saveCurrentCollection() {
		try {
			if( this._activeCollection.shared ) {
				let model = await this.openCreateCollectionDialog( this._activeCollection.name );
				this._activeCollection.name = model.name;
				let persistedModel = await this.collectionService.copySharedCollectionToCollections( this._activeCollection.id );
				delete this._activeCollection.shared;
				this._activeCollection.id = persistedModel.id;
				this.collections.push( this._activeCollection );
			} else {
				let model = await this.openCreateCollectionDialog( this._activeCollection.name );
				this._activeCollection.name = model.name;
				let persistedModel = await this.collectionService.updateCollection( this._activeCollection.id, this._activeCollection );
				let collection = this.collections.find((f) => {
					return f.id == this._activeCollection.id;
				});
				collection.name = persistedModel.name;
				this._activeCollection = persistedModel;
			}
			this.$scope.$digest(); 
		} catch( e ) {

		}
		// this.resetPaginator();
		// this.posts = await this.feedService.getPostsByCollectionIdAndPage( this._activeCollection.id, this._page );
	}

	async deleteCurrentCollection() {
		await this.collectionService.deleteCollection( this._activeCollection.id );
		this.collections = await this.collectionService.getUserCollections();
		this.resetPaginator();
		this.posts = this.feedService.getFeedByPage( this._page );
		this.$state.go( this.FEED_STATES.POSTS );
	}

	get activeCollection() {
		if( 
			this.activeState == this.FEED_STATES.COLLECTION 
			&& this._activeCollection 
			&& !this._activeCollection.shared
		) {
			return this._activeCollection.id;
		}
		return null;
	}

	get currentCollection() {
		return this._activeCollection;
	}

	openCreateCollectionDialog( name, isNew ) {
		if( !isNew ) {
			return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_COLLECTION, {
				name: name || '',
				saveButton: !!isNew
			}, this.setActiveCollectionName.bind(this) );
		}
		return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_COLLECTION, {
			name: name || '',
			saveButton: !!isNew
		}, this.setActiveCollectionName.bind(this) ).then((model) => {
			return this.createNewCollectionModelWithName( model.name );
		}).then((model) => {
			return model;
		});
	}

	setActiveCollectionName( model ) {
		if( model.name.trim().length > 3 ) {
			model.dismiss();
		}
	}

	async createNewCollectionModelWithName( name ) {
		let model = await this.collectionService.createNewCollectionModelWithName( name );
		this._activeCollection = model;
		this.$state.go( this.FEED_STATES.COLLECTION, { collectionId: model.id });
	}

}

export default CollectionController;