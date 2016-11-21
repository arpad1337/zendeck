/*
 * @rpi1337 
 * This is the main entrypoint of the application, responsible for angular bootstrap
 */

// Module configuration

import module from './config';

// H E L P E R S

import createComponent from './helpers/create-component';

// C O N T R O L L E R S

import ApplicationController from './controllers/application'; 
import LandingController from './controllers/landing'; 
import SearchController from './controllers/search'; 
import FeedController from './controllers/feed'; 

// S E R V I C E S

import UserService from './services/user';
import MessageBusService from './services/message-bus';
import ModalService from './services/modal';
import FilterService from './services/filter';
import FeedService from './services/feed';
import FriendService from './services/friend';

// C O M P O N E N T S

import PostingBoxComponent from './components/posting-box';
import PostingBoxTagComponent from './components/posting-box-tag';
import ModalButtonComponent from './components/modal-button';

// I N T E R C E P T O R S

import SessionInterceptor from './interceptors/session';

/* - - - - - - - - - - - - - - - - - - - */

// B I N D I N G S

module.controller( 'ApplicationController', ApplicationController );
module.controller( 'LandingController', LandingController );
module.controller( 'SearchController', SearchController );
module.controller( 'FeedController', FeedController );

module.service( 'MessageBusService', MessageBusService );
module.service( 'UserService', UserService );
module.service( 'ModalService', ModalService );
module.service( 'FilterService', FilterService );
module.service( 'FeedService', FeedService );
module.service( 'FriendService', FriendService );

module.directive( 'postingBox', createComponent( PostingBoxComponent ) );
module.directive( 'postingBoxTag', createComponent( PostingBoxTagComponent ) );
module.directive( 'modalButton', createComponent( ModalButtonComponent ) );

module.factory('sessionInterceptor', [...SessionInterceptor.$inject, (...params) => new SessionInterceptor(...params) ]);
