/*
 * @rpi1337
 */

class PostEntryComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				delegate: '=?',
				post: '='
			},
			templateUrl: 'partials/components/post-entry.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this
		};
	}

	constructor() {
		//this.buttonEnabled = true;
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

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

};

export default PostEntryComponent;