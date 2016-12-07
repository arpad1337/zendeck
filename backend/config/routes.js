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
	{
		path: '/user/:username/posts',
		controller: 'feed',
		action: 'getUserPosts',
		method: 'get'
	},

	// FEED

	{
		path: '/feed',
		controller: 'feed',
		action: 'getUserFeed',
		middlewares: ['session-check'],
		method: 'get'
	},
	{
		path: '/feed',
		controller: 'feed',
		action: 'createPost',
		middlewares: ['session-check'],
		method: 'post'
	},

	// FILTERS 

	{
		path: '/user/me/filter',
		method: 'get',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'getUserFilters',
	},
	{
		path: '/user/me/filter',
		method: 'post',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'createFilter',
	},
	{
		path: '/user/me/filter/:slug',
		method: 'post',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'updateFilter',
	},
	{
		path: '/user/me/filter/:slug',
		method: 'delete',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'deleteFilter',
	},
	{
		path: '/filter/:slug',
		method: 'get',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'getFilterBySlug'
	},
	{
		path: '/filter',
		method: 'post',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'runFilter'
	},

	// POST 

	{
		path: '/post/:postId/comment',
		method: 'post',
		controller: 'post',
		middlewares: ['session-check'],
		action: 'commentOnPost'
	},
	{
		path: '/post/:postId/comment/:commentId',
		method: 'delete',
		controller: 'post',
		middlewares: ['session-check'],
		action: 'deleteComment'
	},
	{
		path: '/post/:postId',
		method: 'delete',
		controller: 'feed',
		middlewares: ['session-check'],
		action: 'deletePost'
	},

	// COLLECTION

	{
		path: '/user/me/collection',
		method: 'get',
		controller: 'collection',
		middlewares: ['session-check'],
		action: 'getCurrentUserCollections'
	},
	{
		path: '/user/:username/collection',
		method: 'get',
		controller: 'collection',
		action: 'getUserCollections'
	},
	{
		path: '/collection',
		method: 'post',
		controller: 'collection',
		action: 'createCollection',
		middlewares: ['session-check']
	},
	{
		path: '/collection/:collectionSlug',
		method: 'post',
		controller: 'collection',
		action: 'updateCollection',
		middlewares: ['session-check']
	},
	{
		path: '/collection/:collectionSlug/feed',
		method: 'get',
		controller: 'feed',
		action: 'getCollectionFeed',
		middlewares: ['session-check']
	},
	{
		path: '/collection/:collectionSlug/feed/:postId',
		method: 'post',
		controller: 'feed',
		action: 'addPostToCollection',
		middlewares: ['session-check']
	},
	{
		path: '/collection/:collectionSlug/feed/:postId',
		method: 'delete',
		controller: 'feed',
		action: 'removePostFromCollection',
		middlewares: ['session-check']
	},

	// GROUPS

	{
		path: '/group',
		method: 'post',
		controller: 'group',
		action: 'createGroup',
		middlewares: ['session-check']
	},
	{
		path: '/user/me/group',
		method: 'get',
		controller: 'group',
		action: 'getGroupsOfUser',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug',
		method: 'delete',
		controller: 'group',
		action: 'deleteGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug',
		method: 'post',
		controller: 'group',
		action: 'delete',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/cover',
		method: 'post',
		controller: 'group',
		action: 'updateGroupCover',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/feed',
		method: 'get',
		controller: 'feed',
		action: 'getGroupFeed',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/feed',
		method: 'post',
		controller: 'feed',
		action: 'createPostInGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection',
		method: 'get',
		controller: 'collection',
		action: 'getGroupCollections',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection',
		method: 'post',
		controller: 'collection',
		action: 'createGroupCollection',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection/:collectionSlug/post/:postId',
		method: 'post',
		controller: 'feed',
		action: 'addPostToGroupCollection',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection/:collectionSlug/post/:postId',
		method: 'delete',
		controller: 'feed',
		action: 'removePostFromGroupCollection',
		middlewares: ['session-check']
	},

	// GROUP MEMBERS

	{
		path: '/group/:groupSlug/members',
		method: 'get',
		controller: 'group',
		action: 'getGroupMembersByPage',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/members',
		method: 'post',
		controller: 'group',
		action: 'joinGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/members',
		method: 'delete',
		controller: 'group',
		action: 'leaveGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/members/:userId',
		method: 'post',
		controller: 'group',
		action: 'approveUser',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/admin/:userId',
		method: 'post',
		controller: 'group',
		action: 'promoteUserToAdmin',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/admin/:userId',
		method: 'delete',
		controller: 'group',
		action: 'degradeUserFromAdmin',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/members/:userId',
		method: 'delete',
		controller: 'group',
		action: 'kickUserFromGroup',
		middlewares: ['session-check']
	},

	// NOTIFICATIONS

	{
		path: '/notification/recent',
		method: 'get',
		controller: 'notification',
		action: 'getLastNotifications',
		middlewares: ['session-check']
	},
	{
		path: '/notification',
		method: 'get',
		controller: 'notification',
		action: 'getNotificationByPage',
		middlewares: ['session-check']
	},
	{
		path: '/notification/:notificationId',
		method: 'post',
		controller: 'notification',
		action: 'touchNotification',
		middlewares: ['session-check']
	},

	// MESSAGES

	{
		path: '/message',
		method: 'get',
		controller: 'message',
		action: 'getThreadsByPage',
		middlewares: ['session-check']
	},
	{
		path: '/message/:username',
		method: 'get',
		controller: 'message',
		action: 'getThreadByRecipientUsername',
		middlewares: ['session-check']
	},
	{
		path: '/message/:username',
		method: 'post',
		controller: 'message',
		action: 'sendMessage',
		middlewares: ['session-check']
	},

	// SEARCH

	{
		path: '/search/:predicate',
		method: 'post',
		controller: 'search',
		action: 'performBulkSearch',
		middlewares: ['session-check']
	},
	{
		path: '/search/:predicate/:topic',
		method: 'post',
		controller: 'search',
		action: 'performSearchByTopic',
		middlewares: ['session-check']
	}


];

module.exports = ROUTES;
