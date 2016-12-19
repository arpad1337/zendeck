/*
 * @rpi1337
 */

const databaseProvider = require('../providers/database').instance;
const TYPES = databaseProvider.Sequelize;
const connection = databaseProvider.connection;

const ForbiddenHosts = connection.define('forbidden_hosts', {
	hostname: {
		primaryKey: true,
		type: TYPES.STRING(256),
		allowNull: false
	}
});

module.exports = ForbiddenHosts;