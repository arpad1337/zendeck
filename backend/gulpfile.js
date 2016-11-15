/*
 * @rpi1337 
 */

const loggerInterface = console.log;

if( process.argv.indexOf('--silent') > -1 ) {
	console.log = console.warn = console.error = () => {};
}

const TARGET = {
	DEVELOPMENT: 'development',
	STAGING: 'staging',
	PRODUCTION: 'production'
};

const ENV = process.env.NODE_ENV || TARGET.DEVELOPMENT;

switch( ENV ) {
	case TARGET.DEVELOPMENT:
	case TARGET.STAGING:
	case TARGET.PRODUCTION: {
		console.log("Asset pipeline running in " + ENV + " mode");
		break;
	}
	default: {
		throw new Error('Unknown target, quiting');
		process.exit(1);
	}
}

let AUTHOR = (process.argv.filter(( e ) => e.indexOf('--author=') > -1 ).length > 0) ? process.argv.filter(( e ) => e.indexOf('--author=') > -1 )[0].substr( 9 ) : '@rpi1337';
if( !AUTHOR ) {
	AUTHOR = '@rpi1337';
}
let NAME = process.argv.filter(( e ) => e.indexOf('--name=') > -1 ).length > 0 ? process.argv.filter(( e ) => e.indexOf('--name=') > -1 )[0].substr( 7 ) : '';

const gulp = require('gulp');

gulp.task( 'prepare-migation-config', ( done ) => {
	const fs = require('fs');
	const config = require('./config/environment');

	const tempFileName = 'db_config_' + Date.now() + '.json';
	const target = '/tmp/' + tempFileName;

	fs.writeFile( target, JSON.stringify(config.DATABASE), ( err ) => {
		if( err ) {
			done( new Error('Config file cannot be written out'), err );
		}

		loggerInterface( target );

		done( null, target);
	});
});