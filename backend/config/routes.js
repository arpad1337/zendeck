/*
 * @rpi1337
 */

const ROUTES = [

	// AUTH

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

	// USER

	{
		path: '/user/me',
		controller: 'user',
		action: 'getCurrentUser',
		middlewares: ['session-check'],
		method: 'get'
	},
	{
		path: '/user/me',
		controller: 'user',
		action: 'updateProfile',
		middlewares: ['session-check'],
		method: 'post'
	},
	{
		path: '/user/me/photo',
		controller: 'user',
		action: 'updateProfilePic',
		middlewares: ['session-check'],
		method: 'post'
	},
	{
		path: '/user/me/cover',
		controller: 'user',
		action: 'updateCoverPic',
		middlewares: ['session-check'],
		method: 'post'
	},
	{
		path: '/user/me/photo',
		controller: 'user',
		action: 'deleteProfilePic',
		middlewares: ['session-check'],
		method: 'delete'
	},
	{
		path: '/user/me/cover',
		controller: 'user',
		action: 'deleteCoverPic',
		middlewares: ['session-check'],
		method: 'delete'
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
		path: '/user/me/recommendation',
		controller: 'friend',
		action: 'getFriendRecommendations',
		middlewares: ['session-check'],
		method: 'get'
	},

	// USER PUBLIC

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
	},

	// FEED

	{
		path: '/feed',
		controller: 'feed',
		action: 'getUserFeed',
		method: 'get'
	},
	{
		path: '/feed',
		controller: 'post',
		action: 'createPost',
		method: 'post'
	},

	// POST 

	{
		path: '/post/:postId/comment',
		method: 'post',
		controller: 'post',
		action: 'commentOnPost'
	}

];

module.exports = ROUTES;
