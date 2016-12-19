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
	'collection',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		name: {
			type: TYPES.STRING(60)
		},
		isPublic: {
			field: 'is_public',
			type: TYPES.BOOLEAN,
			defaultValue: true
		},
		parent: {
			type: TYPES.INTEGER,
		},
		slug: {
			type: TYPES.STRING(64)
		},
		groupId: {
			field: 'group_id',
			type: TYPES.INTEGER
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS,
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Collection = connection.define( 'Collection', model.schema, model.settings );

module.exports = Collection;