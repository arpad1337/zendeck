/*
 * @rpi1337 
 */

const TABLE_NAME = 'otp';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			user_id: {
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
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] );
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'] ).then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};