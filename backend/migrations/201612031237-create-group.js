/*
 * @rpi1337 
 */

const TABLE_NAME = 'group';

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
				type: TYPES.STRING(64),
				allowNull: false
			},
			user_id: {
				type: TYPES.INTEGER,
				allowNull: false,
			},
			name: {
				type: TYPES.STRING(100)
			},
			about: {
				type: TYPES.TEXT
			},
			profileColor: {
				type: TYPES.STRING(7)
			},
			photos: {
				type: TYPES.JSON
			},
			is_public: {
				type: TYPES.BOOLEAN,
				defaultValue: true
			},
			is_moderated: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			is_open: {
				type: TYPES.BOOLEAN,
				defaultValue: true
			},
			stats: {
				type: TYPES.JSON
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
			return queryInterface.addIndex( TABLE_NAME, ['slug'])
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'])
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['slug']);
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['group_id']);
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};