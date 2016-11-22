/*
 * @rpi1337 
 */

const TABLE_NAME = 'user';

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
				type: TYPES.STRING( 100 ),
				allowNull: false
			},
			password: {
				type: TYPES.STRING( 100 ),
				allowNull: false
			},
			phone_number: {
				type: TYPES.STRING( 20 ),
				unique: true
			},
			username: {
				type: TYPES.STRING(100),
				allowNull: false
			},
			fullname: {
				type: TYPES.STRING(100),
				allowNull: false
			},
			photos: {
				type: TYPES.JSON
			},
			birth_date: {
				type: TYPES.STRING( 10 )
			},
			is_business: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			profile_color: {
				type: TYPES.STRING(7)
			},
			about: {
				type: TYPES.TEXT
			},
			enabled: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			status: {
				type: TYPES.ENUM,
				values: [
					'SUBMITED', // record created
					'REGISTERED',
					'DEACTIVATED'
				],
				defaultValue: 'SUBMITED'
			},
			settings: {
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
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['username'], {
				indexName: 'username_unique',
				indicesType: 'UNIQUE'
			});
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['email'], {
				indexName: 'email_unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, 'username_unique' ).then(() => {
			return queryInterface.removeIndex( TABLE_NAME, 'email_unique' );
		}).then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};