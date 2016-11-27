/*
 * @rpi1337
 */

import NOTIFICATION_TYPE from '../config/notification-type';

class NotificationViewComponent {

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				model: '=',
				delegate: '=?'
			},
			templateUrl: 'partials/components/notification-view.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this
		};
	}

	constructor() {
		this.buttonEnabled = true;
		this.actionSuccessful = false;
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			if( this._delegateRespondsToSelector( 'onNotificationAction' ) ) {
				await this.delegate.onNotificationAction( this.model );
			}
			this.actionSuccessful = true;
		} catch( e ) {
			console.error( e );
			this.buttonEnabled = true;
		}
	}

	get TYPES() {
		return NOTIFICATION_TYPE;
	}

	_delegateRespondsToSelector( selector ) {
		return (
			this.delegate &&
			typeof this.delegate[ selector ] === 'function'
		);
	}

}

export default NotificationViewComponent;