/*
 * @rpi1337 
 */

const TABLE_NAME = 'collection';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME,  {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: TYPES.STRING(60)
			},
			user_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			is_public: {
				type: TYPES.BOOLEAN,
				defaultValue: true
			},
			parent: {
				type: TYPES.INTEGER,
			},
			slug: {
				type: TYPES.STRING(64)
			},
			group_id: {
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
			return queryInterface.addIndex( TABLE_NAME,  ['user_id']);
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME,  ['parent']);
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME,  ['group_id']);
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME,  ['slug']);
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME,  ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['parent'])
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['group_id'])
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['slug'])
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME )
		});
	}
};