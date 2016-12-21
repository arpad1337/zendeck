/*
 * @rpi1337 
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;
const Util = require('../util/util');

const sequelizeModelHelper = require('../util/sequelize-model-helper');

const model = sequelizeModelHelper.buildModel(
	// Table name
	'group',
	// Schema
	{
		slug: {
			type: TYPES.STRING(64),
			allowNull: false
		},
		userId: {
			field: 'user_id',
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
		isPublic: {
			field: 'is_public', // searchable
			type: TYPES.BOOLEAN,
			defaultValue: true
		},
		isModerated: {
			field: 'is_moderated',
			type: TYPES.BOOLEAN,
			defaultValue: false
		},
		isOpen: {
			field: 'is_open', // anyone can join
			type: TYPES.BOOLEAN,
			defaultValue: true
		},
		stats: {
			type: TYPES.JSON
		}
	},
	// Traits
	[
		sequelizeModelHelper.PARANOID_MODEL_SETTINGS, // deletedAt attribute
		sequelizeModelHelper.TIMESTAMPS_SETTINGS // createdAt / updatedAt,
	]
);

const Group = connection.define( 'Group', model.schema, model.settings );

module.exports = Group;
