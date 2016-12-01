/*
 * @rpi1337
 */

import Util from '../helpers/util';
import Validator from '../helpers/validator';

class PostEntryComponent {

	static get $inject() {
		return [
			'UserService',
			'ModalService'
		];
	}

	static get MAX_CONTENT_LENGTH() {
		return 1000;
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?',
				entry: '='
			},
			templateUrl: 'partials/components/post-entry.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor( userService, modalService ) {
		this.buttonEnabled = true;
		this.reset();
		this.targetCollection = -1;
		this.hideTooltip = true;
		this.userService = userService;
		this.modalService = modalService;
	}

	reset() {
		this.charactersLeft = PostEntryComponent.MAX_CONTENT_LENGTH;
		this._comment = '';
	}

	get shareableUrl() {
		let base = '';
		if( window ) {
			base = window.location.origin;
		}
		return base + '/post/' + this.entry.id;
	}

	set shareableUrl( _ ) {

	}

	get currentUser() {
		let user = ( this.userService ) ? this.userService.currentUser : null;
		return user;
	}

	openBookmarkTooltip() {
		this.hideTooltip = !this.hideTooltip;
	}

	set comment( value ) {
		value = value
			.trim()
			.replace(/\n\s*\n/g, '\n')
			.replace(/  +/g, ' ');
		this._comment = value.substr(0, PostEntryComponent.MAX_CONTENT_LENGTH);
		this.charactersLeft = PostEntryComponent.MAX_CONTENT_LENGTH - this._comment.length;
	}

	get comment() {
		return this._comment;
	}

	async sendComment() {
		this.buttonEnabled = false;
		try {
			if( 
				this._delegateRespondsToSelector( 'commentPost' ) && 
				!Validator.isFieldEmpty(this._comment) 
			) {
				let record = await this.delegate.commentPost( this.entry.id, this._comment );
				this.reset();
				this.entry.comments.data.push( record );
			}
		} catch( e ) {
			console.error( e );
		} finally {
			this.buttonEnabled = true;
		}
	}

	async deleteComment( commentId ) {
		if( this._delegateRespondsToSelector( 'deleteComment' ) ) {
			try {
				await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
					confirmationDialogTemplateKey: 'DELETE_COMMENT'
				});
				await this.delegate.deleteComment( this.entry.id, commentId );
				let index = this.entry.comments.data.findIndex((c) => {
					return (c.id == commentId);
				});
				this.entry.comments.data.splice( index, 1 );
			} catch( e ) {
				console.error(e);
			}
		}
	}

	async deletePost() {
		try {
			if( this._delegateRespondsToSelector( 'deletePost' ) ) {
				await this.modalService.openDialog( this.modalService.DIALOG_TYPE.CONFIRMATION, {
					confirmationDialogTemplateKey: 'DELETE_POST'
				});
				await this.delegate.deletePost( this.entry.id );
			}
		} catch( e ) {
			console.log(e, e.stack);
		}
	}

	async like() {
		if( this._delegateRespondsToSelector( 'likePost' ) ) {
			await this.delegate.likePost( this.entry.id );
		}
		this.entry.liked = !this.entry.liked;
	}

	async saveToCollection() {
		console.log('selected collection:', this.targetCollection);
		if( this.targetCollection === -1 || this.targetCollection == '' ) {
			return;
		}
		this.entry.starred = !this.entry.starred;
	}

	// customSelect delegate
	onItemSelected( model ) {
		this.targetCollection = model;
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostEntryComponent;