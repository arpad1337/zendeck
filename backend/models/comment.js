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
	'comment',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		postId: {
			field: 'post_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		content: {
			type: TYPES.TEXT
		},
		parent: {
			type: TYPES.INTEGER
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS,
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Comment = connection.define( 'Comment', model.schema, model.settings );

module.exports = Comment;