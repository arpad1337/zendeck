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
	'subscriber',
	// Schema
	{
		name: {
			type: TYPES.STRING(60)
		},
		email: {
			type: TYPES.STRING(256)
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Subscriber = connection.define( 'Subscriber', model.schema, model.settings );

module.exports = Subscriber;