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
	}

	openDialog( type, payload ) {
		const promise = this.$q.defer();
		const descriptor = DIALOG_DESCIPTORS[ String(type) ];
		const scope = this._createModalInstance( descriptor, promise, payload );
		this._modalQueue.push({
			descriptor: descriptor,
			scope: scope
		})
		this._openNextModal();
		return promise.promise;
	}

	_createModalInstance( descriptor, promise, payload ) {
	 	const scope = this.$rootScope.$new();
	 	if( payload ) {
	 		for( let k in payload ) {
	 			scope[k] = payload[k];
	 		}
	 	}
		scope.ok = this._validateAndSubmitFunctor( descriptor, scope, promise );
		scope.cancel = this._cancelFunctor( scope, promise );
		return scope;
	}

	_cancelFunctor( scope, promise ) {
		let self = this;
		return function() {
			promise.reject();
			scope.$element.remove();
			self._openNextModal();
		};
	}

	_validateAndSubmitFunctor( descriptor, scope, promise ) {
		let self = this;
		return function() {
			if(
				descriptor.validate && 
				typeof descriptor.validate === 'function'
			) {
				if( descriptor.validate( scope ) ) {
					promise.resolve( scope );
					scope.$element.remove();
					this._openNextModal();
				}
				return;
			}
			promise.resolve( scope );
			scope.$element.remove();
			self._openNextModal();
		};
	}

	_openNextModal() {
		if( this._modalQueue.length === 0 ) {
			return;
		}
		let model = this._modalQueue.shift();
		this.$templateRequest(model.descriptor.templateUrl).then((template) => {
			let $element = this.$compile( $(template) )( model.scope );
			let $background = $('<div class="modal-background">');
			let origiCancel = model.scope.cancel;
			model.scope.cancel = function(){
				$background.remove();
				origiCancel();
			};
			$background.bind('click', model.scope.cancel);
			$('body').append($background);
			$('body').append($element);
			model.scope.$element = $element;
		});
	}

	get DIALOG_TYPE() {
		return DIALOG_TYPE;
	}

}

export default ModalService;