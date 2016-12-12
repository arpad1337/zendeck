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
	'filter',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER
		},
		slug: {
			type: TYPES.STRING(64)
		},
		name: {
			type: TYPES.STRING(60)
		},
		tags: {
			type: TYPES.JSON
		},
		groupId: {
			field: 'group_id'
			type: TYPES.INTEGER
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Filter = connection.define( 'Filter', model.schema, model.settings );

module.exports = Filter;