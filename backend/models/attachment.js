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
	'attachment',
	// Schema
	{
		preview: {
			types: TYPES.STRING(256)
		},
		title: {
			types: TYPES.STRING(60)
		},
		description: {
			type: TYPES.TEXT
		},
		source: {
			type: TYPES.STRING(40)
		},
		url: {
			types: TYPES.STRING(256)
		},
		tags: {
			TYPES.TEXT
		}
	},
	// Traits
	[
		sequelizeModelHelper.TIMESTAMPS_SETTINGS
	]
);

const Attachment = connection.define( 'Attachment', model.schema, model.settings );

module.exports = Attachment;