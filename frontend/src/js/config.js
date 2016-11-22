/*
 * @rpi1337 
 */

require("babel-polyfill");

import ROUTES from './config/routes';
import {
	USER_STATUS,
	USER_STATUS_ORDERED
} from './config/user-status';

const module = angular.module('ZenDeck', [
	'pascalprecht.translate',
	'ui.router',
    'ui.router.state',
    'monospaced.elastic',
    'angular-loading-bar',
    '720kb.tooltips',
    'yaru22.angular-timeago'
]);

module.config(["$httpProvider", function($httpProvider){
    $httpProvider.interceptors.push('sessionInterceptor');
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

module.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
}]);

module.config(['tooltipsConfProvider', function configConf(tooltipsConfProvider) {
  tooltipsConfProvider.configure({
    'smart':true,
    'size':'large',
    'speed': 'slow',
    'tooltipTemplateUrlCache': true,
    'side': 'bottom'
  });
}])

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
								let userIndex = USER_STATUS_ORDERED.indexOf( USER_STATUS[ user.status ] );
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

	$urlRouterProvider.otherwise('/');

}]);

module.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/locale-',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('en');
}]);

module.directive('enterPress', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enterPress);
                });

                event.preventDefault();
            }
        });
    };
});

module.filter("htmlSafe", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    };
}]);

module.filter("shrinkContent", function() {
	return function(val) {
		return val.trim()
			.replace(/\n\s*\n/g, '\n')
			.replace(/  +/g, ' ');
	}
});

module.filter('pretifyNumber', function(){
	return function( value ) {
		const stringValue = String( value );
		if( stringValue.length > 9 ) {
			return stringValue.substr( 0, stringValue.length - 9 ) +'b';
		}
		else if( stringValue.length > 6 ) {
			return stringValue.substr( 0, stringValue.length - 6 ) +'m';
		}
		else if( stringValue.length > 3) {
			return stringValue.substr( 0, stringValue.length - 3 ) +'k';
		}
	};
});

export default module;

