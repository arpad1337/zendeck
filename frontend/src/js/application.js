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

// S E R V I C E S

import UserService from './services/user';
import MessageBusService from './services/user';

// I N T E R C E P T O R S

import SessionInterceptor from './interceptors/session';

/* - - - - - - - - - - - - - - - - - - - */

// B I N D I N G S

module.controller( 'ApplicationController', ApplicationController );

module.service( 'MessageBusService', MessageBusService );
module.service( 'UserService', UserService );

module.factory('sessionInterceptor', [...SessionInterceptor.$inject, (...params) => new SessionInterceptor(...params) ]);
