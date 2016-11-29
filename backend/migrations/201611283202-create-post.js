/*
 * @rpi1337 
 */

const TABLE_NAME = 'post';

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
			tags: {
				type: TYPES.JSON
			},
			content: {
				type: TYPES.TEXT
			},
			attachment_id: {
				type: TYPES.INTEGER
			},
			group_id: {
				type: TYPES.INTEGER
			},
			likes: {
				type: TYPES.INTEGER,
				defaultValue: 0
			},
			comments: {
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
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['attachment_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['group_id'] );
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'] )
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['attachment_id'] );
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['group_id'] );
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};