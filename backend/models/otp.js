/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const model = sequelizeModelHelper.buildModel(
	'otp',
	{
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		pincode: {
			type: TYPES.STRING(128) // ONLY A HASH
		},
		type: {
			type: TYPES.ENUM,
			values: [
				'PASSWORD_RESET',
				'TWO_FACTOR_AUTH'
			],
			defaultValue: 'PASSWORD_RESET'
		},
		expiration: {
			type: TYPES.DATE
		}
	},
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const OTP = connection.define( 'OTP', model.schema, model.settings );

module.exports = OTP;