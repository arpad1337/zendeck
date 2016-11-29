/*
 * @rpi1337 
 */

const TABLE_NAME = 'filter';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			slug: {
				type: TYPES.STRING(64)
			}
			user_id: {
				types: TYPES.INTEGER
			},
			name: {
				types: TYPES.STRING(60)
			},
			tags: {
				TYPES.TEXT
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] )
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'])
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};