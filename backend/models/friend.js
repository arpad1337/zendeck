/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const model = sequelizeModelHelper.buildModel(
	'friend',
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		friendId: {
			field: 'friend_id',
			type: TYPES.INTEGER,
			allowNull: false
		}
	},
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS,
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS
	]

);

const Friend = connection.define( 'Friend', model.schema, model.settings );

module.exports = Friend;