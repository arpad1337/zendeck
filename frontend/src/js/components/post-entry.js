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

	// async commit() {
	// 	this.buttonEnabled = false;
	// 	try {
	// 		if( this._delegateRespondsToSelector( 'commit' ) ) {
	// 			await this.delegate.commit();
	// 		}
	// 	} catch( e ) {
	// 		console.error( e );
	// 	} finally {
	// 		this.buttonEnabled = true;
	// 	}
	// }

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

	async like() {
		console.log('LIKEING', this.entry);
	}

	async bookmark() {
		console.log('BOOKMARKING', this.entry);
	}

	async createTemporaryFilterWithTag( tag ) {

	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostEntryComponent;