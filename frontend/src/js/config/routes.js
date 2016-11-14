/*
 * @rpi1337
 */

import STATES from './states';
import USER_STATUS from './user-status';

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
		state: STATES.APPLICATION.SELF,
		opts: {
			abstract: true,
			view: 'views/application-frame.tpl.html'
		}
	},
	{
		state: STATES.APPLICATION.FEED,
		opts: {
			path: '/feed',
			controller: 'FeedController',
			view: 'views/feed.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUPS,
		opts: {
			path: '/groups',
			controller: 'GroupsController',
			view: 'views/groups.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_NAME,
		opts: {
			path: '/groups/:groupName',
			controller: 'GroupByNameController',
			view: 'views/group-by-name.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
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
			path: '/:userName',
			controller: 'ProfileController',
			view: 'views/profile.tpl.html'
		}
	}
];

export default ROUTES;