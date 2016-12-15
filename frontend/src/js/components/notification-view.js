/*
 * @rpi1337
 */

import NOTIFICATION_TYPE from '../config/notification-type';

class NotificationViewComponent {

	static get $inject() {
		return [
			'NotificationService'
		];
	}

	static get $descriptor() {
		return {
			restrict: 'E',
			scope: {
				model: '='
			},
			templateUrl: 'partials/components/notification-view.tpl.html',
			bindToController: true,
			controllerAs: 'vm',
			transclude: true,
			controller: this,
			link: ( scope ) => {
				scope.vm.scope = scope;
			}
		};
	}

	constructor( notificationService ) {
		this.notificationService = notificationService;
		this.buttonEnabled =  'accepted' in this.model.payload ? !this.model.payload.accepted : true;
	}

	async commit() {
		this.buttonEnabled = false;
		try {
			await this.notificationService.acceptNotification( this.model.id );
			this.model.payload.accepted = true;
		} catch( e ) {
			console.error( e );
			this.buttonEnabled = true;
		} finally {
			this.scope.$digest();
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