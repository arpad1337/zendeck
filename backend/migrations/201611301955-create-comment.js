/*
 * @rpi1337 
 */

const TABLE_NAME = 'comment';

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
			post_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			content: {
				type: TYPES.TEXT
			},
			parent: {
				type: TYPES.INTEGER
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			},
			deleted_at: {
				type: TYPES.DATE
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['post_id'])
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'])
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id']).then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['post_id'])
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};