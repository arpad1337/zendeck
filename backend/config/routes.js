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
		path: '/user/me',
		controller: 'user',
		action: 'getCurrentUser',
		middlewares: ['session-check'],
		method: 'get'
	},
	{
		path: '/user/:username',
		controller: 'user',
		action: 'getUserByUsername',
		method: 'get'
	}
];

module.exports = ROUTES;