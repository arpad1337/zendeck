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
	'message',
	// Schema
	{
		threadId: {
			field: 'thread_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		message: {
			type: TYPES.TEXT
		},
		seen: {
			type: TYPES.BOOLEAN,
			defaultValue: false
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Message = connection.define( 'Message', model.schema, model.settings );

module.exports = Message;