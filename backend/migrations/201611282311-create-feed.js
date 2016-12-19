/*
 * @rpi1337 
 */

const TABLE_NAME = 'feed';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			author_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			user_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			post_id: {
				type: TYPES.INTEGER,
				allowNull: false
			},
			liked: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			collection_id: {
				type: TYPES.INTEGER,
			},
			group_id: {
				type: TYPES.INTEGER
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
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['author_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['group_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['collection_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['post_id'] );
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['user_id', 'post_id'], {
				indexName: 'user_id-post_id_compound-unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, ['user_id'] )
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['post_id'] );
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['author_id'] );
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['group_id'] );
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, ['collection_id'] );
		})
		.then(() => {
			return queryInterface.removeIndex( TABLE_NAME, 'user_id-post_id_compound-unique' );
		})
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};