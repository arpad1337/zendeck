/*
 * @rpi1337 
 */

const TABLE_NAME = 'user';

const Util = require('../util/util');

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
				type: TYPES.STRING( 64 ),
				allowNull: false
			},
			phone_number: {
				type: TYPES.STRING( 20 ),
				unique: true
			},
			username: {
				type: TYPES.STRING(16),
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
			terms_accepted: {
				type: TYPES.BOOLEAN,
				defaultValue: false
			},
			is_premium: {
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
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['username'], {
				indexName: 'user_username_unique',
				indicesType: 'UNIQUE'
			});
		}).then(() => {
			return queryInterface.addIndex( TABLE_NAME, ['email'], {
				indexName: 'user_email_unique',
				indicesType: 'UNIQUE'
			});
		}).then(() =>  {
			return queryInterface.bulkInsert( TABLE_NAME, [
				{
					username: 'ship',
					enabled: true,
					fullname: 'ZenDeck',
					profile_color: '#00BFFF',
					password: Util.createSHA256HashForPassword('T1tk0SKOOOOD'),
					about: 'Peace & Love',
					is_business: true,
					email: 'system@zendeck.co',
					created_at: (new Date()).toISOString(),
					updated_at: (new Date()).toISOString()
				},
				{
					username: 'rpi1337',
					enabled: true,
					fullname: 'ar.pi()',
					profile_color: '#00BFFF',
					password: Util.createSHA256HashForPassword('T1tk0SKOOOOD'),
					about: 'Senior Web Engineer at @IBM 🚀 Passionate about #SystemsDesign and #CloudNative #Backend development',
					is_business: true,
					email: 'arpad@zendeck.co',
					created_at: (new Date()).toISOString(),
					updated_at: (new Date()).toISOString()
				}
			]);
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.removeIndex( TABLE_NAME, 'user_username_unique' ).then(() => {
			return queryInterface.removeIndex( TABLE_NAME, 'user_email_unique' );
		}).then(() => {
			return queryInterface.dropTable( TABLE_NAME );
		});
	}
};