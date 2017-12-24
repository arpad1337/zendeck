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
			scope.closeModal();
			self._openNextModal();
		};
	}

	_dismissFunctor( scope, promise ) {
		let self = this;
		return function() {
			promise.resolve(scope);
			scope.closeModal();
			self._openNextModal();
		};
	}

	_okFunctor( scope, promise, callback ) {
		let self = this;
		return function(args) {
			if( callback && typeof callback === 'function' ) {
				try {
					return callback(scope);
				} catch( e ) {

				}
			} else {
				promise.resolve({
					model: scope, 
					args: args 
				});
				scope.closeModal();
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
			model.scope.$element = self.$compile( $(template) )( model.scope );
			model.scope.$background = $('<div class="modal-background">');
			model.scope.lastScrollPos = $('body').scrollTop();

			model.scope.$background.height( window.innerHeight + 'px');
			$('body').append(model.scope.$background);
			$('body').append(model.scope.$element );
			model.scope.$background.bind('click', model.scope.cancel);

			let stopPropagation = function(e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			};

			model.scope.$background.bind('scroll touch', stopPropagation);
			model.scope.$element.bind('scroll', stopPropagation);
			$('body').css('overflow','hidden');
			$('body').css('position','fixed');
			$('body').css('top', -model.scope.lastScrollPos + 'px');

			model.scope.closeModal = function() {
				delete self._openedModalsHashMap[ key ];
				model.scope.$element.remove();
				model.scope.$background.remove();
				$('body').css('overflow', '');
				$('body').css('position','');
				$('body').css('top','');
				$('body').scrollTop( model.scope.lastScrollPos );
			}

			setTimeout(() => {
				model.scope.$background.addClass('show');
				model.scope.$element.addClass('show');
			}, 1);
		}).catch(() => {
			delete this._openedModalsHashMap[ key ];
		});
	}

	get DIALOG_TYPE() {
		return DIALOG_TYPE;
	}

}

export default ModalService;