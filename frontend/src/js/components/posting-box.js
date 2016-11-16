/*
 * @rpi1337
 */

import Util from '../helpers/util';

class PostingBoxComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?'
			},
			templateUrl: 'partials/components/posting-box.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this
		};
	}

	static get URL_PATERN() {
		return Util.URL_PATTERN();
	}

	constructor() {
		this.buttonEnabled = true;
		this.newPost = {
			content: "",
			urls: [],
			tags: [],
			suggestedTags: ['hello', 'moto']
		};
	}

	get content() {
		return this.newPost.content;
	}

	set content( newValue ) {
		if( PostingBoxComponent.URL_PATERN.test( newValue ) ) {
			let urls = newValue.match( PostingBoxComponent.URL_PATERN );
			urls.forEach((url) => {
				let alreadyEvaluated = this.newPost.urls.find((nurl, i) => {
					let match = url.indexOf( nurl ) === 0;
					if( 
						match &&
						this.newPost.urls[ i ] != url
					) {
						this.newPost.urls[ i ] = url;
						console.log('juhu2', url);
						match = true;
					}
					return match;
				})
				if( !alreadyEvaluated && url != null ) {
					console.log('juhu', url);
					this.newPost.urls.push( url );
					if( this.newPost.urls.length == 1 ) {
						this.textareaFocusout();
					}
				}
			});
		}
		this.newPost.content = newValue
			.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ');
	}

	addTag( tag ) {
		tag = tag.trim().toLowerCase().replace(/\s\s+/g, ' ');
		if( tag.length < 3 ) {
			return;
		}
		if( this.newPost.tags.indexOf( tag ) === -1 ) {
			this.newPost.tags.push( tag );
		}
	}

	removeTag( tag ) {
		tag = tag.trim().toLowerCase();
		this.newPost.tags.splice( this.newPost.tags.indexOf( tag ), 1);
	}

	addSuggestedTag( tag ) {
		tag = tag.trim().toLowerCase();
		this.newPost.suggestedTags.splice( this.newPost.suggestedTags.indexOf( tag ), 1);
		this.newPost.tags.push( tag );
	}

	textareaFocusout() {
		if( this._delegateRespondsToSelector( 'scrapeUrl' ) ) {
			let url = this.newPost.urls[ 0 ];
			this.delegate.scrapeUrl( url );
		}
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'commit' ) ) {
				this.newPost.content = this.newPost.content
					.trim()
					.replace(/\n\s*\n\s*\n/g, '\n\n')
					.replace(/  +/g, ' ');
				await this.delegate.commit( this.newPost );
			}
		} catch( e ) {
			console.error( e );
		} finally {
			this.buttonEnabled = true;
		}
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostingBoxComponent;