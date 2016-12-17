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
	{
		path: '/auth/invite',
		controller: 'auth',
		method: 'post',
		middlewares: ['session-check'],
		action: 'inviteUsers'
	},
	{
		path: '/auth/check/username',
		controller: 'auth',
		method: 'post',
		action: 'checkUsernameAvailability'
	},
	{
		path: '/auth/check/email',
		controller: 'auth',
		method: 'post',
		action: 'checkEmailAvailability'
	},
	{
		path: '/auth/feedback',
		controller: 'auth',
		method: 'post',
		action: 'sendFeedback',
		middlewares: ['session-check']
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
		path: '/user/me/followers',
		controller: 'friend',
		action: 'getFollowersByPage',
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
		method: 'get',
		middlewares: ['session-check']
	},
	{
		path: '/user/:username/friend',
		controller: 'friend',
		action: 'getFriendsByUsernameAndPage',
		method: 'get',
		middlewares: ['session-check']
	},
	{
		path: '/user/:username/followers',
		controller: 'friend',
		action: 'getFollowersByUsernameAndPage',
		method: 'get',
		middlewares: ['session-check']
	},
	{
		path: '/user/:username/feed',
		controller: 'feed',
		action: 'getUserPosts',
		method: 'get',
		middlewares: ['session-check']
	},
	{
		path: '/user/:username/feed/liked',
		controller: 'feed',
		action: 'getFriendLikedPosts',
		method: 'get',
		middlewares: ['session-check']
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
		path: '/feed/liked',
		controller: 'feed',
		action: 'getLikedFeed',
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
		action: 'getUserFilters'
	},
	{
		path: '/user/me/filter',
		method: 'post',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'createFilter'
	},
	{
		path: '/user/me/filter/:slug',
		method: 'post',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'updateFilter'
	},
	{
		path: '/user/me/filter/:slug',
		method: 'delete',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'deleteFilter'
	},
	{
		path: '/group/:groupSlug/filter',
		method: 'get',
		controller: 'filter',
		action: 'getGroupFilters',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/filter',
		method: 'post',
		controller: 'filter',
		action: 'createGroupFilter',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/filter/:slug',
		method: 'post',
		controller: 'filter',
		action: 'updateGroupFilter',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/filter/:slug',
		method: 'delete',
		controller: 'filter',
		middlewares: ['session-check'],
		action: 'deleteGroupFilter'
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
		method: 'get',
		controller: 'post',
		middlewares: ['session-check'],
		action: 'getCommentsForPost'
	},
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
		method: 'get',
		controller: 'feed',
		middlewares: ['session-check'],
		action: 'getPostById'
	},
	{
		path: '/post/:postId',
		method: 'delete',
		controller: 'feed',
		middlewares: ['session-check'],
		action: 'deletePost'
	},
	{
		path: '/post/:postId/like',
		method: 'post',
		controller: 'feed',
		middlewares: ['session-check'],
		action: 'likePost'
	},
	{
		path: '/post/:postId/like',
		method: 'delete',
		controller: 'feed',
		middlewares: ['session-check'],
		action: 'dislikePost'
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
		path: '/collection/:collectionSlug',
		method: 'get',
		controller: 'collection',
		action: 'getCollectionBySlug',
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
		method: 'get',
		controller: 'group',
		action: 'getGroupViewBySlug',
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
		action: 'updateGroup',
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
		path: '/group/:groupSlug/feed/liked',
		method: 'get',
		controller: 'feed',
		action: 'getGroupLikedFeed',
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
		path: '/group/:groupSlug/collection/:collectionSlug/feed',
		method: 'get',
		controller: 'feed',
		action: 'getGroupCollectionFeed',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection/:collectionSlug/feed/:postId',
		method: 'post',
		controller: 'feed',
		action: 'addPostToGroupCollection',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/collection/:collectionSlug/feed/:postId',
		method: 'delete',
		controller: 'feed',
		action: 'removePostFromGroupCollection',
		middlewares: ['session-check']
	},

	// GROUP MEMBERS

	{
		path: '/group/:groupSlug/invitation',
		method: 'post',
		controller: 'group',
		action: 'inviteMembersToGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/invitation/:invitationKey',
		method: 'post',
		controller: 'group',
		action: 'acceptInvitation',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/member',
		method: 'get',
		controller: 'group',
		action: 'getGroupMembersByPage',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/member',
		method: 'post',
		controller: 'group',
		action: 'joinGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/member',
		method: 'delete',
		controller: 'group',
		action: 'leaveGroup',
		middlewares: ['session-check']
	},
	{
		path: '/group/:groupSlug/member/:userId',
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
		path: '/group/:groupSlug/member/:userId',
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
		path: '/notification/unread',
		method: 'get',
		controller: 'notification',
		action: 'getUnreadNotificationCount',
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
		path: '/notification',
		method: 'post',
		controller: 'notification',
		action: 'touchNotifications',
		middlewares: ['session-check']
	},
	{
		path: '/notification/:notificationId',
		method: 'post',
		controller: 'notification',
		action: 'acceptNotification',
		middlewares: ['session-check']
	},

	// MESSAGES

	{
		path: '/message/unread',
		method: 'get',
		controller: 'message',
		action: 'getUnreadMessageCount',
		middlewares: ['session-check']
	},
	{
		path: '/message/thread',
		method: 'get',
		controller: 'message',
		action: 'getThreadsByPage',
		middlewares: ['session-check']
	},
	{
		path: '/message/thread/:username',
		method: 'get',
		controller: 'message',
		action: 'getThreadByRecipientUsername',
		middlewares: ['session-check']
	},
	{
		path: '/message/thread/:username',
		method: 'post',
		controller: 'message',
		action: 'sendMessage',
		middlewares: ['session-check']
	},

	// getUnreadMessageCount

	// SEARCH

	{
		path: '/search/',
		method: 'post',
		controller: 'search',
		action: 'performBulkSearch',
		middlewares: ['session-check']
	},
	{
		path: '/search/:topic',
		method: 'post',
		controller: 'search',
		action: 'performSearchByTopic',
		middlewares: ['session-check']
	}


];

module.exports = ROUTES;
