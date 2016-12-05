/*
 * @rpi1337 
 */

const TABLE_NAME = 'notification';

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
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] )
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['type'] )
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['type'])
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};