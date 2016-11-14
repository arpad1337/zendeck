/*
 * @rpi1337 
 */

require("babel-polyfill");

import ROUTES from './config/routes';
import USER_STATUS from './config/user-status';

const module = angular.module('ZenDeck', [
	'pascalprecht.translate',
	'ui.router',
    'ui.router.state',
]);

module.config(["$httpProvider", function($httpProvider){
    $httpProvider.interceptors.push('sessionInterceptor');
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

module.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	ROUTES.forEach((state) => {
		let route = state.opts;
		let descriptor = {
			url: route.path
		};

		if( route.nested ) {
			descriptor.views = {};
			descriptor.views[ route.nested ] = {
				controller: `${route.controller} as ctrl`,
				templateUrl: route.view
			};
		} else {
			descriptor.templateUrl = route.view;
		}

		if( route.controller && !route.nested ) {
			descriptor.controller = `${route.controller} as ctrl`;
		}

		if( route.abstract ) {
			descriptor.abstract = true;
		}

		if (route.params) {
			descriptor.params = {};
			Object.keys(route.params).forEach(function(key) {
				descriptor.params[key] = route.params[key];
			});
		}

		if (route.requiredStatus) {
			descriptor.resolve = {
				security: [
					'UserService',
					function(userService) {
						return userService.getCurrentUser().then(function(user) {
							if( route.requiredStatus ) {
								let index = USER_STATUS_ORDERED.indexOf( route.requiredStatus );
								let userIndex = USER_STATUS_ORDERED.indexOf( user.status );
								if( userIndex < index ) {
									throw new Error("User status doens't fullfill the endpoints requirements");
								}
							}
						});
						
					}
				]
			};
		}

		$stateProvider.state(state.state, descriptor);
	});

	$urlRouterProvider.otherwise('/welcome');

}]);

export default module;

