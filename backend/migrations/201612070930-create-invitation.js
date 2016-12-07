/*
 * @rpi1337 
 */

const TABLE_NAME = 'invitation';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			invitation_key: {
				type: TYPES.STRING(64)
			},
			user_id: {
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
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] );
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['invitation_key'] );
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'] ).then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['invitation_key'] )
		}).then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};