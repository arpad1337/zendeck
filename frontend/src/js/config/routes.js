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
			path: '/posts',
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
		state: STATES.APPLICATION.FEED.FILTERED,
		opts: {
			path: '/filtered/:filterId',
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
			controller: 'FeedController',
			view: 'views/notifications.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.MESSAGES,
		opts: {
			path: '/messages',
			controller: 'MessagesController',
			view: 'views/messages.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.PROFILE,
		opts: {
			path: '/:username',
			controller: 'ProfileController',
			view: 'views/profile.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	}
];

export default ROUTES;