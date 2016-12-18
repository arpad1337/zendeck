/*
 * @rpi1337 
 */

const TABLE_NAME = 'subscriber';

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return queryInterface.createTable( TABLE_NAME, {
			id: {
				type: TYPES.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true
			},
			email: {
				type: TYPES.STRING(256)
			},
			name: {
				type: TYPES.STRING(60)
			},
			created_at: {
				type: TYPES.DATE
			},
			updated_at: {
				type: TYPES.DATE
			}
		})
		.then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['email'], {
				indexName: 'subscriber_email_unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, 'subscriber_email_unique')
		.then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};