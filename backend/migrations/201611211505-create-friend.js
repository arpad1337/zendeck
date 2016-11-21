/*
 * @rpi1337 
 */

const TABLE_NAME = 'friend';

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
			friend_id: {
				type: TYPES.INTEGER,
				allowNull: false
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
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id', 'friend_id'], {
				indexName: 'friend_compound_unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, 'friend_compound_unique' ).then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};