/*
 * @rpi1337
 */

import Util from '../helpers/util';

class PostingBoxComponent {

	static get MAX_CONTENT_LENGTH() {
		return 1000;
	}

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

	static get URL_PATTERN() {
		return Util.URL_PATTERN();
	}

	constructor() {
		this.newPost = this.reset();	
		this.textareaFocusout = this.textareaFocusout.bind( this );
	}

	reset() {
		this.buttonEnabled = false;
		this.linkPreview = null;
		this._urlIndex = 0;
		this._timer = false;
		this.suggestedTags = [
			'article',
			'photo',
			'video',
			'event',
			'discussion',
			'presentation'
		];
		this.charactersLeft = PostingBoxComponent.MAX_CONTENT_LENGTH;
		return {
			content: "",
			urls: [],
			tags: [],
			preview: false
		};
	}

	get content() {
		return this.newPost.content;
	}

	set content( newValue ) {
		if( PostingBoxComponent.URL_PATTERN.test( newValue ) ) {
			let urls = Util.findUrlsInText( newValue );
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
			.replace(/  +/g, ' ')
			.substr( 0, PostingBoxComponent.MAX_CONTENT_LENGTH );
		this.charactersLeft = PostingBoxComponent.MAX_CONTENT_LENGTH - this.newPost.content.length;
		this.buttonEnabled = this.newPost.content.length > 0;
	}

	addTag( tag ) {
		tag = tag.trim().toLowerCase().replace(/\s\s+/g, ' ');
		if( tag.length < 3 ) {
			return;
		}
		if( this.newPost.tags.length <= 20 && this.newPost.tags.indexOf( tag ) === -1 ) {
			this.newPost.tags.push( tag );
		}
	}

	removeTag( tag ) {
		tag = tag.trim().toLowerCase();
		this.newPost.tags.splice( this.newPost.tags.indexOf( tag ), 1);
	}

	addSuggestedTag( tag ) {
		tag = tag.trim().toLowerCase();
		this.suggestedTags.splice( this.suggestedTags.indexOf( tag ), 1);
		if( this.newPost.tags.indexOf( tag ) === -1 ) {
			this.newPost.tags.push( tag );
		}
	}

	removePreview() {
		this.linkPreview = null;
		this.newPost.preview = false;
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
				if( this.suggestedTags.indexOf( tag ) === -1 &&
					this.newPost.tags.indexOf( tag ) === -1 
				) {
					this.suggestedTags.push(tag);
				}
			});
			this.linkPreview = pageMeta;
			this.newPost.preview = url;
			this.scope.$digest();
		}
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'commitNewPost' ) ) {
				this.newPost.content = this.newPost.content
					.trim()
					.replace(/\n\s*\n\s*\n/g, '\n\n')
					.replace(/  +/g, ' ');
				let urls = Util.findUrlsInText( this.newPost.content );
				this.newPost.urls = urls;
				this.newPost.preview = this._urlIndex < (this.newPost.urls.length  ) ? this._urlIndex : false;
				await this.delegate.commitNewPost( this.newPost );
				this.newPost = this.reset();
				this.scope.$digest();
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