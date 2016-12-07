/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const model = sequelizeModelHelper.buildModel(
	'invitation',
	{
		invitationKey: {
			field: 'invitation_key',
			type: TYPES.STRING(64)
		},
		userId: {
			field: 'user_id',
			type: TYPES.INTEGER,
			allowNull: false
		},
		payload: {
			type: TYPES.JSON
		},
		type: {
			type: TYPES.ENUM,
			values: [
				'PLATFORM_INVITATION',
				'GROUP_INVITATION'
			],
			defaultValue: 'PLATFORM_INVITATION'
		},
		expiration: {
			type: TYPES.DATE
		}
	},
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Invitation = connection.define( 'Invitation', model.schema, model.settings );

module.exports = Invitation;