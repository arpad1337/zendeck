/*
 * @rpi1337
 */

const ROUTES = [
	{
		path: '/auth/login',
		controller: 'auth',
		action: 'login',
		method: 'post',
		middlewares: ['rate-limiter']
	},
	{
		path: '/auth/logout',
		controller: 'auth',
		action: 'logout',
		method: 'post'
	},
	{
		path: '/auth/register',
		controller: 'auth',
		action: 'register',
		method: 'post'
	},
	{
		path: '/auth/forgot-password',
		controller: 'auth',
		action: 'forgotPassword',
		method: 'post'
	},
	{
		path: '/auth/reset-password',
		controller: 'auth',
		action: 'resetPassword',
		method: 'post'
	},
	{
		path: '/user/me',
		controller: 'user',
		action: 'getCurrentUser',
		middlewares: ['session-check'],
		method: 'get'
	},
	{
		path: '/user/me/friend',
		controller: 'friend',
		action: 'getFriendsByPage',
		middlewares: ['session-check'],
		method: 'get'
	},
	{
		path: '/user/me/friend',
		controller: 'friend',
		action: 'addFriend',
		middlewares: ['session-check'],
		method: 'post'
	},
	{
		path: '/user/me/friend/:friendUsername',
		controller: 'friend',
		action: 'removeFriend',
		middlewares: ['session-check'],
		method: 'delete'
	},
	{
		path: '/user/:username',
		controller: 'user',
		action: 'getUserByUsername',
		method: 'get'
	},
	{
		path: '/user/:username/friend',
		controller: 'friend',
		action: 'getFriendsByUsernameAndPage',
		method: 'get'
	}
];

module.exports = ROUTES;