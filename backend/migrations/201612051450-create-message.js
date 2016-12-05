/*
 * @rpi1337 
 */

const TABLE_NAME = 'message';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			thread_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			user_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			message: {
				type: TYPES.TEXT
			},
			seen: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['thread_id'] );
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['thread_id'])
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};