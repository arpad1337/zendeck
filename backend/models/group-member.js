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
	'group_member',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		groupId: {
			field: 'group_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		isAdmin: {
			field: 'is_admin',
			type: TYPES.BOOLEAN,
			defaultValue: false
		},
		approved: {
			type: TYPES.BOOLEAN,
			defaultValue: true
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS, // deletedAt attribute
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const GroupMember = connection.define( 'GroupMember', model.schema, model.settings );

module.exports = GroupMember;