/*
 * @rpi1337 
 * This is the main entrypoint of the application, responsible for angular bootstrap
 */

// Module configuration

import module from './config';

// H E L P E R S

import createComponent from './helpers/create-component';
import createInterceptor from './helpers/create-interceptor';

// C O N T R O L L E R S

import ApplicationController from './controllers/application'; 
import LandingController from './controllers/landing'; 
import SearchController from './controllers/search'; 
import FeedController from './controllers/feed'; 
import ProfileController from './controllers/profile'; 
import CollectionController from './controllers/collection'; 
import PostController from './controllers/post'; 
import MessagesController from './controllers/messages';
import SendNewMessageController from './controllers/send-new-message';
import MenuController from './controllers/menu';
import NotificationsController from './controllers/notifications';
import GroupsController from './controllers/groups';
import GroupBySlugController from './controllers/group-by-slug';
import RecommendationBoxController from './controllers/recommendation-box';
import EditGroupController from './controllers/edit-group';
import InvitationController from './controllers/invitation';
import GroupInvitationController from './controllers/group-invitation';
import FeedbackController from './controllers/feedback';

// S E R V I C E S

import UserService from './services/user';
import MessageBusService from './services/message-bus';
import ModalService from './services/modal';
import FilterService from './services/filter';
import FeedService from './services/feed';
import FriendService from './services/friend';
import FileUploadService from './services/file-upload';
import CollectionService from './services/collection';
import MessageService from './services/message';
import NotificationService from './services/notification';
import GroupService from './services/group';
import SearchService from './services/search';

// C O M P O N E N T S

import PostingBoxComponent from './components/posting-box';
import PostEntryComponent from './components/post-entry';
import PostingBoxTagComponent from './components/posting-box-tag';
import ModalButtonComponent from './components/modal-button';
import UserPreviewCardComponent from './components/user-preview-card';
import MoreButtonComponent from './components/more-button';
import NotificationViewComponent from './components/notification-view';
import CustomSelectComponent from './components/custom-select';
import GroupCardComponent from './components/group-card';
import {
	ProfilePicComponent
} from './components/profile-pic';

// I N T E R C E P T O R S

import SessionInterceptor from './interceptors/session';

/* - - - - - - - - - - - - - - - - - - - */

// B I N D I N G S

module.controller( 'ApplicationController', ApplicationController );
module.controller( 'LandingController', LandingController );
module.controller( 'SearchController', SearchController );
module.controller( 'FeedController', FeedController );
module.controller( 'ProfileController', ProfileController );
module.controller( 'CollectionController', CollectionController );
module.controller( 'PostController', PostController );
module.controller( 'MessagesController', MessagesController );
module.controller( 'SendNewMessageController', SendNewMessageController );
module.controller( 'MenuController', MenuController );
module.controller( 'NotificationsController', NotificationsController );
module.controller( 'GroupsController', GroupsController );
module.controller( 'GroupBySlugController', GroupBySlugController );
module.controller( 'RecommendationBoxController', RecommendationBoxController );
module.controller( 'EditGroupController', EditGroupController );
module.controller( 'InvitationController', InvitationController );
module.controller( 'GroupInvitationController', GroupInvitationController );
module.controller( 'FeedbackController', FeedbackController );

module.service( 'MessageBusService', MessageBusService );
module.service( 'UserService', UserService );
module.service( 'ModalService', ModalService );
module.service( 'FilterService', FilterService );
module.service( 'FeedService', FeedService );
module.service( 'FriendService', FriendService );
module.service( 'FileUploadService', FileUploadService );
module.service( 'CollectionService', CollectionService );
module.service( 'MessageService', MessageService );
module.service( 'NotificationService', NotificationService );
module.service( 'GroupService', GroupService );
module.service( 'SearchService', SearchService );

module.directive( 'postingBox', createComponent( PostingBoxComponent ) );
module.directive( 'postEntry', createComponent( PostEntryComponent ) );
module.directive( 'postingBoxTag', createComponent( PostingBoxTagComponent ) );
module.directive( 'modalButton', createComponent( ModalButtonComponent ) );
module.directive( 'userPreviewCard', createComponent( UserPreviewCardComponent ) );
module.directive( 'profilePic', createComponent( ProfilePicComponent ) );
module.directive( 'moreButton', createComponent( MoreButtonComponent ) );
module.directive( 'customSelect', createComponent( CustomSelectComponent ) );
module.directive( 'notificationView', createComponent( NotificationViewComponent ) );
module.directive( 'groupCard', createComponent( GroupCardComponent ) );

module.factory('sessionInterceptor', createInterceptor( SessionInterceptor ));
