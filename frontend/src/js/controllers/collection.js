/*
 * @rpi1337
 */

import STATES from '../config/states';
import Validator from '../helpers/validator';
import PostController from './post';

class CollectionController extends PostController {

	static get $inject() {
		return [
			'$state',
			'FeedService',
			'CollectionService',
			'ModalService'
		];
	}

	constructor( $state, feedService, collectionService, modalService, STATE_KEY ) {
		super( feedService, modalService, $state );
		this.feedService = feedService;
		this.collectionService = collectionService;
		this.modalService = modalService;
		this.$state = $state;
		this.STATE_KEY = STATE_KEY || 'FEED';

		this._loading = false;

		this.checkActiveCollectionName = this.checkActiveCollectionName.bind(this);
	}

	get activeState() {
		return this.$state.current.name;
	}

	get FEED_STATES() {
		let key = (this.STATE_KEY || 'FEED');
		return STATES.APPLICATION[ key ];
	}

	resetPaginator() {
		this.posts = this.posts || [];
		this.posts.length = 0;
		this._page = 1;
	}

	getMorePosts() {
		throw new Error('CollectionController->getMorePosts Must override!');
	}

	loadCollections( ) {
		return this.collectionService.getUserCollections( this.$state.params.username ).then((collections) => {
			this._collections = collections;
		});
	}

	get collections() {
		if( !this._collections && !this._loading) {
			this._loading = true;
			this.loadCollections().then(_ => {
				if( this.$state.params.collectionSlug ) {
					this.selectCollection( this.$state.params.collectionSlug );
				}
			}).catch(_ => {
				this._collections = [];
			}).finally(() => {
				this._loading = false;
			});
		}
		return this._collections;
	}

	async selectLiked() {
		this.resetPaginator();
		let posts;
		if( this.$state.params.username ) {
			posts = await this.feedService.getFriendLikedPostsByPage( this.$state.params.username, this._page );
		} else {
			if( this.$state.params.groupSlug ) {
				posts = await this.feedService.getGroupLikedPostsByPage( this.$state.params.groupSlug, this._page );
			} else {
				posts = await this.feedService.getLikedPostsByPage( this._page );
			}
		}
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async selectCollection( slug ) {
		this.resetPaginator();
		let collection;
		if( this.collections ) {
			collection = this.collections.find((f) => {
				return f.slug == slug;
			});
		}
		if( !collection ) {
			try {
				this._activeCollection = await this.collectionService.getCollectionBySlug( slug );
				this.$scope.$digest();
			} catch( e ) {
				this.$state.go(this.FEED_STATES.POSTS);
			}
		} else {
			this._activeCollection = Object.assign( {}, collection );
		}
		let posts;
		if( !this.$state.params.groupSlug ) {
			posts = await this.feedService.getPostsByCollectionSlugAndPage( this._activeCollection.slug, this._page );
		} else {
			posts = await this.feedService.getPostsByGroupCollectionSlugAndPage( this.$state.params.groupSlug, this._activeCollection.slug, this._page );
		}
		posts.forEach((post) => {
			this.posts.push( post );
		});
		this.$scope.$digest();
	}

	async saveCurrentCollection() {
		try {
			if( this._activeCollection.shared ) {
				let model = await this.openCreateCollectionDialog( this._activeCollection.name, this._activeCollection.isPublic );
				this._activeCollection.name = model.name;
				this._activeCollection.isPublic = model.isPublic == "true";
				let persistedModel = await this.collectionService.copySharedCollectionToCollections( this._activeCollection );
				delete this._activeCollection.shared;
				this._activeCollection.id = persistedModel.id;
				this._activeCollection.slug = persistedModel.slug;
				this.collections.push( this._activeCollection );
			} else {
				let model = await this.openCreateCollectionDialog( this._activeCollection.name, this._activeCollection.isPublic );
				this._activeCollection.name = model.name;
				this._activeCollection.isPublic = model.isPublic == "true";
				let persistedModel = await this.collectionService.updateCollection( this._activeCollection.slug, this._activeCollection );
				let collection = this.collections.find((f) => {
					return f.slug == this._activeCollection.slug;
				});
				collection.name = persistedModel.name;
				collection.isPublic = persistedModel.isPublic;
				this._activeCollection = persistedModel;
			}
			this.$scope.$digest(); 
		} catch( e ) {
			console.error(e);
		}
	}

	async deleteCurrentCollection() {
		await this.collectionService.deleteCollection( this._activeCollection.id );
		this.collections = await this.collectionService.getUserCollections();
		this.resetPaginator();
		let newPosts = await this.feedService.getFeedByPage( this._page );
		newPosts.forEach((post) => {
			this.posts.push( post );
		});
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

	openCreateCollectionDialog( name, isPublic ) {
		if( isPublic == null ) {
			isPublic = true;
		}
		let isNew = Validator.isFieldEmpty( name );
		if( !isNew ) {
			return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_COLLECTION, {
				name: name,
				isPublic: String(isPublic),
				saveButton: true
			}, this.checkActiveCollectionName );
		}
		return this.modalService.openDialog( this.modalService.DIALOG_TYPE.CREATE_COLLECTION, {
			name: '',
			isPublic: 'true',
			saveButton: false
		}, this.checkActiveCollectionName ).then((model) => {
			return this.createNewCollectionModelWithName( model.name, model.isPublic );
		});
	}

	checkActiveCollectionName( model ) {
		if( model.name.trim().length > 0 ) {
			model.dismiss();
		}
	}

	createNewCollectionModelWithName( name, isPublic ) {
		return this.collectionService.createNewCollectionModelWithName( name, isPublic ).then((model) => {
			this._activeCollection = model;
			this.collections.push( model );
			return model;
		});
	}

	addPostToCollection( collection, postId ) {
		return this.feedService.addPostToCollection( collection.slug, postId );
	}

	async deleteCurrentCollection() {
		await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
			confirmationDialogTemplateKey: 'DELETE_COLLECTION'
		});
		await this.collectionService.deleteCollection( this._activeCollection.slug );
		let index = this.collections.findIndex((a) => {
			return a.slug == this._activeCollection.slug
		});
		this.collections.splice( index, 1 );
		this._activeCollection = null;
		this.onCollectionDeleted();
	}

	onCollectionDeleted() {
		throw new Error('Must ovveride');
	}

}

export default CollectionController;