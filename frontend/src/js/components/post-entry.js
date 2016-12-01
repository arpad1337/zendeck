/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class PostEntryComponent {

	static get $inject() {
		return [
			'UserService',
			'ModalService'
		];
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
		this._comment = '';
		this.targetCollection = -1;
		this.hideTooltip = true;
		this.userService = userService;
		this.modalService = modalService;
	}

	get processedContent() {
		let content = this.entry.content;
		content = content.replace(/\n+/g, "<br>");
		return content;
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
		this._comment = value
			.trim()
			.replace(/\n\s*\n/g, '\n')
			.replace(/  +/g, ' ');
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
				this._comment = '';
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