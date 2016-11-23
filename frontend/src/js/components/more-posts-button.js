/*
 * @rpi1337
 */

class MorePostsButtonComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				callback: '&'
			},
			templateUrl: 'partials/components/more-posts-button.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor() {
		this.buttonEnabled = true;
		this.hidden = false;
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			let result = await this.callback();
			if( !result ) {
				this.hidden = true;
			}
		} catch( e ) {
			console.error( e );
		} finally {
			this.buttonEnabled = true;
		}
	}

};

export default MorePostsButtonComponent;