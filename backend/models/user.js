/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;
const Util = require('../util/util');

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const HiddenFieldsAndComputedPropsTrait = {
    instanceMethods: {
        getPublicView: function( prop ) {
            var json = sequelizeModelHelper.PATCHED_GETTER.call( this, prop );
            if( !prop ) {
            	delete json.password;
            	delete json.phoneNumber;
            	delete json.email;
            	delete json.settings;
            }
            return json;
        }
    }
};

const model = sequelizeModelHelper.buildModel(
	// Table name
	'user',
	// Schema
	{
		email: {
			type: TYPES.STRING( 100 ),
			allowNull: false,
			unique: true
		},
		password: {
			type: TYPES.STRING( 100 ),
			allowNull: false
		},
		phoneNumber: {
			type: TYPES.STRING( 20 ),
			field: 'phone_number'
		},
		username: {
			type: TYPES.STRING(100),
			allowNull: false,
			unique: true
		},
		fullname: {
			type: TYPES.STRING(100),
			allowNull: false
		},
		photos: {
			type: TYPES.JSON
		},
		birthDate: {
			field: 'birth_date',
			type: TYPES.STRING(10)
		},
		isBusiness: {
			field: 'is_business',
			type: TYPES.BOOLEAN,
			defaultValue: false
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
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS, // deletedAt attribute
		sequelizeModelHelper.TIMESTAMPS_SETTINGS, // createdAt / updatedAt,
		HiddenFieldsAndComputedPropsTrait
	]
);

const User = connection.define( 'User', model.schema, model.settings );

module.exports = User;
