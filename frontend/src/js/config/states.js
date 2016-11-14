/*
 * @rpi1337
 */

const STATES = {
	LANDING: 'landing',
	APPLICATION: {
		SELF: 'app',
		FEED: 'app.feed',
		GROUPS: 'app.groups',
		GROUP_BY_NAME: 'app.groupByName',
		NOTIFICATIONS: 'app.notifications',
		MESSAGES: 'app.messages',
		PROFILE: 'app.profile'	
	}
};

export default STATES;