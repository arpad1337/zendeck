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
	'post',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		tags: {
			type: TYPES.JSON
		},
		content: {
			type: TYPES.TEXT
		},
		arrachmentId: {
			field: 'attachment_id',
			type: TYPES.INTEGER
		},
		groupId: {
			field: 'group_id',
			type: TYPES.INTEGER
		},
		likes: {
			type: TYPES.INTEGER
			defaultValue: 0
		},
		comments: {
			type: TYPES.JSON
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS,
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Post = connection.define( 'Post', model.schema, model.settings );

module.exports = Post;