/*
 * @rpi1337
 */

const STATES = {
	LANDING: 'landing',
	APPLICATION: {
		FEED: {
			SELF: 'feed',
			POSTS: 'feed.posts',
			STARRED: 'feed.starred',
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
		MESSAGES: 'messages',
		PROFILE: 'profile',
		SETTINGS: 'settings'
	},
	ABOUT: 'about'
};

export default STATES;