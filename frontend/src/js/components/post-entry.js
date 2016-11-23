/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class PostEntryComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?',
				entry: '=',
				currentUser: '='
			},
			templateUrl: 'partials/components/post-entry.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor() {
		this.buttonEnabled = true;
		this._comment = '';
		this.targetCollection = -1;
		this.hideTooltip = true;
	}

	openBookmarkTooltip() {
		this.hideTooltip = !this.hideTooltip;
	}

	set comment( value ) {
		this._comment = value
			.trim()
			.replace(/\n\s*\n/g, '\n')
			.replace(/  +/g, ' ');
	}

	get comment() {
		return this._comment;
	}

	async comment() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'commentOnPost' ) && !Validator.isFieldEmpty(this._comment) ) {
				await this.delegate.commentOnPost( this.entry.id, this._comment );
				this._comment = '';
			}
		} catch( e ) {
			console.error( e );
		} finally {
			this.buttonEnabled = true;
		}
	}

	async deleteComment( commentId ) {
		if( this._delegateRespondsToSelector( 'deleteComment' ) ) {
			await this.delegate.deleteComment( commentId );
			let index = -1;
			this.entry.comments.data.forEach((c, i) => {
				if( c.id == commentId ) {
					index = i;
				}
			});
			this.entry.comments.data.splice( index, 1 );
		}
	}

	async deletePost() {
		if( this._delegateRespondsToSelector( 'deletePost' ) ) {
			await this.delegate.deletePost( this.entry.id );
		}
	}

	async like() {
		console.log('LIKEING', this.entry);
		this.entry.liked = !this.entry.liked;
	}

	async bookmark() {
		console.log('BOOKMARKING', this.entry);
	}

	async saveToCollection() {
		console.log('selected collection:', this.targetCollection);
		this.entry.starred = !this.entry.starred;
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostEntryComponent;