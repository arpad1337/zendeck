/*
 * @rpi1337
 */

const DIMENSIONS = {
	xxsmall: {
		width: 30,
		height: 30,
		fontSize: 16
	},
	xsmall: {
		width: 36,
		height: 36,
		fontSize: 18
	},
	small: {
		width: 42,
		height: 42,
		fontSize: 24
	},
	xmedium: {
		width: 60,
		height: 60,
		fontSize: 36
	},
	medium: {
		width: 80,
		height: 80,
		fontSize: 48
	},
	large: {
		width: 220,
		height: 220,
		fontSize: 120
	}
};

class ProfilePicComponent {

	static get $inject() {
		return [];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				user: '=',
				size: '@',
				delegate: '=?'
			},
			templateUrl: 'partials/components/profile-pic.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: this
		};
	}

	constructor() {
		this.size = this.size || 'small';
		if( !this.DIMENSIONS[ this.size ] ) {
			throw new Error('ProfilePicComponent::constructor Unknown size: ' + this.size);
		}
		this.buttonEnabled = true;
	}

	get DIMENSIONS() {
		return DIMENSIONS;
	}

	get height() {
		let size = 'small'
		if( this.size ) {
			size = this.size;
		}
		return this.DIMENSIONS[ size ].height;
	}

	get width() {
		let size = 'small'
		if( this.size ) {
			size = this.size;
		}
		return this.DIMENSIONS[ size ].width;
	}

	get fontSize() {
		let size = 'small'
		if( this.size ) {
			size = this.size;
		}
		return this.DIMENSIONS[ size ].fontSize;
	}

	get startChar() {
		if( !this.user ) {
			return 'A';
		}
		return this.user.username.substr(0,1).toUpperCase();
	}

	async profilePicClicked() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'profilePicClicked' ) ) {
				await this.delegate.profilePicClicked( this.user );
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

export {
	DIMENSIONS,
	ProfilePicComponent
};