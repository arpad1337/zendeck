/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;
const Util = require('../util/util');

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const model = sequelizeModelHelper.buildModel(
	// Table name
	'feed',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		slug: {
			type: TYPES.STRING(64)
		},
		postId: {
			field: 'post_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		liked: {
			type: TYPES.BOOLEAN,
			defaultValue: false
		},
		collectionId: {
			field: 'collection_id',
			type: TYPES.INTEGER,
		},
		groupId: {
			field: 'group_id',
			type: TYPES.INTEGER
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Feed = connection.define( 'Feed', model.schema, model.settings );

module.exports = Feed;