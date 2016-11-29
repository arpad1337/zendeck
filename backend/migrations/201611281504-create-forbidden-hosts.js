/*
 * @rpi1337 
 */

const TABLE_NAME = 'forbidden_hosts';

const path = require('path');
const fs = require('fs');
const readline = require('readline');

module.exports = {
	up: ( queryInterface, TYPES ) => {
		return new Promise((resolve, reject) => {
			let lineReader = readline.createInterface({
				input: fs.createReadStream( path.resolve( __dirname, './forbidden-hosts.txt' ) )
			});

			let hostBuffer = [];
			let keys = new Set();

			lineReader.on('line', (line) => {
				try {
					line = line.trim();
					if( line.charAt(0) != '#' || line.trim().length === 0 ) {
						line = line.split(' ');
						if( line[1] && !keys.has( line[1] ) ) {
							keys.add( line[1] );
							hostBuffer.push({
								hostname: line[1] 
							});
						}
					}
				} catch( e ) {

				}
			});

			lineReader.on('close', (_) => {
				queryInterface.createTable( TABLE_NAME, {
					hostname: {
						type: TYPES.STRING( 256 ),
						primaryKey: true,
						allowNull: false
					}
				})
				.then(() => {
					return queryInterface.bulkInsert( TABLE_NAME, hostBuffer );
				}).then(() => {
					resolve();
				});
			});
		});
	},
	down: ( queryInterface, TYPES ) => {
		return queryInterface.dropTable( TABLE_NAME );
	}
};