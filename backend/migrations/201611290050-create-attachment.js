/*
 * @rpi1337 
 */

const TABLE_NAME = 'attachment';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			preview: {
				type: TYPES.STRING(256)
			},
			title: {
				type: TYPES.STRING(256)
			},
			description: {
				type: TYPES.TEXT
			},
			source: {
				type: TYPES.STRING(40)
			},
			url: {
				type: TYPES.STRING(256)
			},
			tags: {
				type: TYPES.JSONB
			},
			blob: {
				type: TYPES.JSONB
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['url'], {
				indexName: 'attachment_url_unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, 'attachment_url_unique')
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};