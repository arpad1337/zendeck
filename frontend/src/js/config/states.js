/*
 * @rpi1337
 */

const STATES = {
	LANDING: 'landing',
	PASSWORD_RESET: 'password-reset',
	INVITATION: 'invitation',
	POST_VIEW: 'post',
	APPLICATION: {
		FEED: {
			SELF: 'feed',
			POSTS: 'feed.posts',
			LIKED: 'feed.liked',
			COLLECTION: 'feed.collection',
			FILTERED: 'feed.filtered'
		},
		GROUPS: {
			SELF: 'groups',
			GROUP_LIST_VIEW: 'groups.list',
			GROUP_BY_NAME: 'groups.groupByName',
			GROUP_BY_NAME_MEMBERS: 'groups.groupByName.members',
			GROUP_BY_NAME_STARRED: 'groups.groupByName.starred'
		},
		NOTIFICATIONS: 'notifications',
		MESSAGES: {
			SELF: 'messages',
			LIST: 'messages.list',
			THREAD: 'messages.thread'
		},
		PROFILE: {
			SELF: 'profile',
			POSTS: 'profile.posts',
			LIKED: 'profile.liked',
			FOLLOWERS: 'profile.followers',
			COLLECTION: 'profile.collection'
		},
		SETTINGS: {
			SELF: 'settings',
			PROFILE: 'settings.profile',
			BILLING: 'settings.billing'
		}
	},
	ABOUT: 'about',
	FAQ: 'faq',
	CONTACT: 'contact',
	TNC: 'tnc',
	PRIVACY_POLICY: 'privacyPolicy',
	COOKIE_POLICY: 'cookiePolicy'
};

export default STATES;