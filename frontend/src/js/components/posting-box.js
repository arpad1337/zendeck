/*
 * @rpi1337
 */

import Util from '../helpers/util';

class PostingBoxComponent {

	static get $inject() {
		return [
			
		];
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
			controller: this,
			link: (scope) => {
				scope.vm.scope = scope;
			}
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
			suggestedTags: [],
			preview: false
		};
		this.linkPreview = null;
		this._timer = false;	
		this.textareaFocusout = this.textareaFocusout.bind( this );
		this._urlIndex = 0;
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
						if( this._timer && this.newPost.urls.length == 1 ) {
							clearTimeout( this._timer );
							this._timer = setTimeout( this.textareaFocusout, 1000 );
						}
						match = true;
					}
					return match;
				})
				if( !alreadyEvaluated && url != null ) {
					this.newPost.urls.push( url );
					if( this.newPost.urls.length == 1 ) {
						setTimeout( this.textareaFocusout, 1000 );
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

	removePreview() {
		this.linkPreview = null;
		this._urlIndex++;
	}

	async textareaFocusout() {
		if( this._delegateRespondsToSelector( 'scrapeUrl' ) && this.linkPreview == null ) {
			if( this._urlIndex === this.newPost.urls.length ) {
				return;
			}
			let url = this.newPost.urls[ this._urlIndex ];
			console.log( 'PostingBoxComponent->textareaFocusout scraping url', url );
			let pageMeta = await this.delegate.scrapeUrl( url );
			pageMeta.tags.forEach((tag) => {
				if( this.newPost.suggestedTags.indexOf( tag ) === -1 ) {
					this.newPost.suggestedTags.push(tag);
				}
			});
			this.linkPreview = pageMeta;
			this.scope.$digest();
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
				this.newPost.urls = this.newPost.content.match( PostingBoxComponent.URL_PATERN );
				this.newPost.preview = this._urlIndex < this.newPost.urls.length ? this._urlIndex : false;
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