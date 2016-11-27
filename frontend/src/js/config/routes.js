/*
 * @rpi1337
 */

import STATES from './states';
import {
	USER_STATUS
} from './user-status';

const ROUTES = [
	{
		state: STATES.LANDING,
		opts: {
			path: '/',
			controller: 'LandingController',
			view: 'views/landing.tpl.html'
		}
	},
	{
		state: STATES.ABOUT,
		opts: {
			path: '/about',
			view: 'views/about.tpl.html'
		}
	},
	{
		state: STATES.PASSWORD_RESET,
		opts: {
			path: '/password-reset/:token'
		}
	},
	{
		state: STATES.POST_VIEW,
		opts: {
			path: '/post/:postId'
		}
	},

	// FEED

	{
		state: STATES.APPLICATION.FEED.SELF,
		opts: {
			abstract: true,
			path: '/feed',
			view: 'views/feed.tpl.html',
			controller: 'FeedController',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.FEED.POSTS,
		opts: {
			path: '',
			view: 'views/feed/list.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.FEED.LIKED,
		opts: {
			path: '/liked',
			view: 'views/feed/liked.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.FEED.COLLECTION,
		opts: {
			path: '/collection/:collectionId',
			view: 'views/feed/starred.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.FEED.FILTERED,
		opts: {
			path: '/filter/:filterId',
			view: 'views/feed/filtered.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	// GROUPS

	// {
	// 	state: STATES.APPLICATION.GROUPS,
	// 	opts: {
	// 		path: '/groups',
	// 		controller: 'GroupsController',
	// 		view: 'views/groups.tpl.html',
	// 		requiredStatus: USER_STATUS.SUBMITED
	// 	}
	// },
	// {
	// 	state: STATES.APPLICATION.GROUP_BY_NAME,
	// 	opts: {
	// 		path: '/groups/:groupName',
	// 		controller: 'GroupByNameController',
	// 		view: 'views/group-by-name.tpl.html',
	// 		requiredStatus: USER_STATUS.SUBMITED
	// 	}
	// },
	{
		state: STATES.APPLICATION.NOTIFICATIONS,
		opts: {
			path: '/notifications',
			controller: 'NotificationsController',
			view: 'views/notifications.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.MESSAGES.SELF,
		opts: {
			abstract: true,
			path: '/messages',
			controller: 'MessagesController',
			view: 'views/messages.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.MESSAGES.LIST,
		opts: {
			path: '',
			view: 'views/messages/list.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.MESSAGES.THREAD,
		opts: {
			path: '/:username',
			view: 'views/messages/thread.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	// PROFILE

	{
		state: STATES.APPLICATION.PROFILE.SELF,
		opts: {
			abstract: true,
			path: '/:username',
			controller: 'ProfileController',
			view: 'views/profile.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.PROFILE.POSTS,
		opts: {
			path: '',
			view: 'views/profile/list.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.PROFILE.CONNECTIONS,
		opts: {
			path: '/connections',
			view: 'views/profile/connections.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.PROFILE.FOLLOWING,
		opts: {
			path: '/following',
			view: 'views/profile/following.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.PROFILE.LIKED,
		opts: {
			path: '/likes',
			view: 'views/profile/liked.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.PROFILE.COLLECTION,
		opts: {
			path: '/collection/:collectionId',
			view: 'views/profile/starred.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	}
];

export default ROUTES;





