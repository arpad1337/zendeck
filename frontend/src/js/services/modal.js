/*
 * @rpi1337
 */

import {
	DIALOG_TYPE,
	DIALOG_DESCIPTORS
} from '../config/dialog-type';

class ModalService {

	static get $inject() {
		return [
			'$q',
			'$rootScope',
			'$templateRequest',
			'$sce',
			'$compile'
		];
	}

	constructor( $q, $rootScope, $templateRequest, $sce, $compile ) {
		this.$q = $q;
		this.$rootScope = $rootScope;
		this.$templateRequest = $templateRequest;
		this.$sce = $sce;
		this.$compile = $compile;

		this._modalQueue = [];
		this._openedModalsHashMap = {};
	}

	openDialog( type, payload, callback ) {
		const promise = this.$q.defer();
		const descriptor = DIALOG_DESCIPTORS[ String(type) ];
		const scope = this._createModalInstance( descriptor, promise, payload, callback );
		this._modalQueue.push({
			descriptor: descriptor,
			scope: scope,
			type: type
		});
		this._openNextModal();
		return promise.promise;
	}

	_createModalInstance( descriptor, promise, payload, callback ) {
	 	const scope = this.$rootScope.$new();
	 	if( payload ) {
	 		for( let k in payload ) {
	 			if( typeof payload[k] === 'function' ) {
	 				scope[k] = payload[k].bind( null, scope );
	 			} else {
	 				scope[k] = payload[k];
	 			}
	 		}
	 	}
		scope.ok = this._okFunctor( scope, promise, callback );
		scope.cancel = this._cancelFunctor( scope, promise );
		scope.dismiss = this._dismissFunctor( scope, promise );
		return scope;
	}

	_cancelFunctor( scope, promise ) {
		let self = this;
		return function() {
			promise.reject();
			scope.$element.remove();
			scope.$background.remove();
			self._openNextModal();
		};
	}

	_dismissFunctor( scope, promise ) {
		let self = this;
		return function() {
			promise.resolve(scope);
			scope.$element.remove();
			scope.$background.remove();
			self._openNextModal();
		};
	}

	_okFunctor( scope, promise, callback ) {
		let self = this;
		return function() {
			if( callback && typeof callback === 'function' ) {
				try {
					callback(scope);
				} catch( e ) {

				}
			} else {
				promise.resolve( scope );
				scope.$element.remove();
				scope.$background.remove();
				self._openNextModal();
			}
		};
	}

	_openNextModal() {
		let self = this;
		if( this._modalQueue.length === 0 ) {
			return;
		}
		let model = this._modalQueue.shift();
		let key = model.type + JSON.stringify( model.descriptor );
		if( this._openedModalsHashMap[ key ] ) {
			console.log('ModalService->_openNextModal Model type <' + model.type + '> already opened');
			return;
		}
		this._openedModalsHashMap[ key ] = true;
		self.$templateRequest(model.descriptor.templateUrl).then((template) => {
			let $element = self.$compile( $(template) )( model.scope );
			let $background = $('<div class="modal-background">');
			let origiCancel = model.scope.cancel;
			let origiOk = model.scope.ok;
			let origiDismiss = model.scope.dismiss;
			model.scope.ok = function() {
				delete self._openedModalsHashMap[ key ];
				origiOk();
			}
			model.scope.cancel = function() {
				delete self._openedModalsHashMap[ key ];
				origiCancel();
			};
			model.scope.dismiss = function() {
				delete self._openedModalsHashMap[ key ];
				origiDismiss();
			}
			$('body').append($background);
			$('body').append($element);
			$background.bind('click', model.scope.cancel);
			let stopPropagation = function(e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			};
			$background.bind('scroll', stopPropagation);
			$element.bind('scroll', stopPropagation);
			model.scope.$element = $element;
			model.scope.$background = $background;
		});
	}

	get DIALOG_TYPE() {
		return DIALOG_TYPE;
	}

}

export default ModalService;