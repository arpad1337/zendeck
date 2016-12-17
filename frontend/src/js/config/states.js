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
		GROUPS: 'groups',
		GROUP_BY_SLUG: {
			SELF: 'groupBySlug',
			POSTS: 'groupBySlug.posts',
			LIKED: 'groupBySlug.liked',
			MEMBERS: 'groupBySlug.members',
			JOIN_REQUESTS: 'groupBySlug.joinRequests',
			COLLECTION: 'groupBySlug.collection',
			FILTERED: 'groupBySlug.filtered',
			INVITATION: 'groupBySlug.invitation'
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
			CONNECTIONS: 'profile.connections',
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