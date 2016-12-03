/*
 * @rpi1337 
 */

const TABLE_NAME = 'group_member';

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
			group_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			is_admin: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			approved: {
				type: TYPES.BOOLEAN,
				defaultValue: true
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
			return queryInterface.addIndex( TABLE_NAME, ['user_id'])
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['group_id'])
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, [ 'user_id', 'group_id' ],{
				indexName: 'user_id-group_id_compound-unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['group_id']);
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, 'user_id-group_id_unique');
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};