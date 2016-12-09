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
	'notification',
	// Schema
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		seen: {
			type: TYPES.BOOLEAN,
			defaultValue: false
		},
		type: {
			type: TYPES.STRING(40)
		},
		payload: {
			type: TYPES.JSON
		},
		correlationId: {
			field: 'correlation_id',
			type: TYPES.STRING(40)
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Notification = connection.define( 'Notification', model.schema, model.settings );

module.exports = Notification;