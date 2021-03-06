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
	{
		state: STATES.INVITATION,
		opts: {
			path: '/invitation/:invitationKey'
		}
	},
	{
		state: STATES.FAQ,
		opts: {
			path: '/faq',
			view: 'views/faq.tpl.html'
		}
	},
	{
		state: STATES.CONTACT,
		opts: {
			path: '/contact',
			view: 'views/contact.tpl.html'
		}
	},
	{
		state: STATES.TNC,
		opts: {
			path: '/terms',
			view: 'views/tnc.tpl.html'
		}
	},
	{
		state: STATES.PRIVACY_POLICY,
		opts: {
			path: '/privacy',
			view: 'views/privacy-policy.tpl.html'
		}
	},
	{
		state: STATES.COOKIE_POLICY,
		opts: {
			path: '/cookie',
			view: 'views/cookie-policy.tpl.html'
		}
	},
	{
		state: STATES.RULES,
		opts: {
			path: '/rules',
			view: 'views/rules.tpl.html'
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
			path: '/collection/:collectionSlug',
			view: 'views/feed/starred.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	{
		state: STATES.APPLICATION.FEED.FILTERED,
		opts: {
			path: '/filter/:filterSlug',
			view: 'views/feed/filtered.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	// GROUPS

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
		state: STATES.APPLICATION.GROUP_BY_SLUG.SELF,
		opts: {
			abstract: true,
			path: '/groups/:groupSlug',
			controller: 'GroupBySlugController',
			view: 'views/group-by-slug.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.POSTS,
		opts: {
			path: '',
			view: 'views/group-by-slug/list.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.LIKED,
		opts: {
			path: '/liked',
			view: 'views/group-by-slug/liked.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.COLLECTION,
		opts: {
			path: '/collection/:collectionSlug',
			view: 'views/group-by-slug/starred.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.MEMBERS,
		opts: {
			path: '/members',
			view: 'views/group-by-slug/members.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.FILTERED,
		opts: {
			path: '/filter/:filterSlug',
			view: 'views/group-by-slug/filtered.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},
	{
		state: STATES.APPLICATION.GROUP_BY_SLUG.INVITATION,
		opts: {
			path: '/invitation/:invitationKey',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	// NOTIFS

	{
		state: STATES.APPLICATION.NOTIFICATIONS,
		opts: {
			path: '/notifications',
			controller: 'NotificationsController',
			view: 'views/notifications.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	},

	// MESSAGES

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
		state: STATES.APPLICATION.PROFILE.FOLLOWERS,
		opts: {
			path: '/followers',
			view: 'views/profile/followers.tpl.html',
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
			path: '/collection/:collectionSlug',
			view: 'views/profile/starred.tpl.html',
			requiredStatus: USER_STATUS.SUBMITED
		}
	}
];

export default ROUTES;





