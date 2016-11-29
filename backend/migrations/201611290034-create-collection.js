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
			user_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			post_id: {
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
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME,  ['post_id']);
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
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME,  ['user_id', 'post_id']);
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME,  ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['post_id'])
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['parent']);
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['group_id'])
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['slug'])
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME,  ['user_id', 'post_id'])
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME )
		});
	}
};