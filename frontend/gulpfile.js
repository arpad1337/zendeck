"use strict";
/*
 * @rpi1337 
 * Zendeck asset pipeline
 */

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

// CONFIGURATION

Error.stackTraceLimit = 200;

// DEPS
// 
const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-minify-css');
const bower = require('gulp-bower');
const sourcemaps = require("gulp-sourcemaps");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const browserify = require('browserify');
const es = require('event-stream');
const mainBowerFiles = require('main-bower-files');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const jsonminify = require('gulp-jsonminify');
const mergeJSON = require('gulp-merge-json');

// HELPERS

const TASKS = [];
const WATCHES = [];

const SRC_FOLDER = './src';
const BUILD_FOLDER = './build';
const DISTRIBUTION_FOLDER = './dist';

const BOWER_FOLDER = './bower_components';

function registerTask( taskName, dependenciesOrCallback, callbackOrNothing ) {
	TASKS.push( taskName );
	return gulp.task( taskName, dependenciesOrCallback, callbackOrNothing );
}

function createRecursivePatchSpecForLinker( sourcePath, extension ) {
	return [ 
		[ sourcePath, extension ].join('/*'),
		[ sourcePath, extension ].join('/**/*'),
	];
}

// TASKS

registerTask('build-scss', () => {
	const sourcePath = [ SRC_FOLDER, 'scss' ].join('/');
	const extension = '.scss';
	const searchPaths = createRecursivePatchSpecForLinker( sourcePath, extension );

	WATCHES.push({ 
		taskName: 'build-scss',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe( sass() )
		.pipe( 
			gulp.dest( 
				[ 
					BUILD_FOLDER, 
					'css'
				].join('/')
			) 
		)
		.pipe( minifyCSS() )
		.pipe( gulp.dest(
				[
					DISTRIBUTION_FOLDER,
					'css'
				].join('/')
			) 
		);
});

registerTask('bower-prune', () => {
	return bower({ cmd: 'prune' });
});

registerTask('bower-install', ['bower-prune'], () => {
	return bower({ cmd: 'install' });
})

registerTask('build-vendor', () => {
	//const bowerFolders = createRecursivePatchSpecForLinker( BOWER_FOLDER, '.js' );
	const bowerFiles = mainBowerFiles().filter((file) => { return file.indexOf('.js', file.length - 3) !== -1; });
	const staticLibraries = createRecursivePatchSpecForLinker( [ SRC_FOLDER, 'js', 'lib' ].join('/'), '.js' );
	const searchPaths = bowerFiles.concat( staticLibraries );

	WATCHES.push({
		taskName: 'build-vendor',
		paths: searchPaths
	});

	let build = gulp
		.src( searchPaths )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'vendor.js' ) )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest(
				[
					BUILD_FOLDER,
					'js'
				].join('/')
			)
		);
	let dist = gulp
		.src( searchPaths )
		.pipe( concat( 'vendor.js' ) )
		.pipe( uglify().on('error', console.log) )
		.pipe( gulp.dest(
				[
					DISTRIBUTION_FOLDER,
					'js'
				].join('/')
			)
		);

	return es.concat( build, dist );
});

registerTask('copy-languages', () => {
	const languages = [ 'en' ];

	const languageFilesFolder = [ SRC_FOLDER, 'static', 'languages' ].join( '/' );
	const searchPaths = createRecursivePatchSpecForLinker( languageFilesFolder );

	WATCHES.push({
		taskName: 'copy-languages',
		paths: searchPaths
	});

	let streams = [];

	languages.forEach((language) => {
		let stream = gulp
			.src( [ SRC_FOLDER, 'static', 'languages', '**/locale-' + language + '.json' ].join( '/' ) )
			.pipe( jsonminify() )
			.pipe( mergeJSON( 'locale-' + language + '.json' ) )
			.pipe( jsonminify() )
			.pipe( gulp.dest( BUILD_FOLDER + '/languages' ) )
			.pipe( gulp.dest( DISTRIBUTION_FOLDER + '/languages' ) );
		streams.push( stream );
	});

	return es.concat.apply( es, streams );
});

registerTask('copy-static', () => {
	const imageFilesFolder = [ SRC_FOLDER, 'img', '*.*' ].join('/');
	const staticFilesFolder = [ SRC_FOLDER, 'static', '*', '*' ].join( '/' );
	const partialFilesFolder = [ SRC_FOLDER, 'static', 'partials', '*.*' ].join( '/' );
	const viewFilesFolder = [ SRC_FOLDER, 'static', 'views', '*.*' ].join( '/' );
	const languageFilesFolder = [ SRC_FOLDER, 'static', 'languages', '*.*' ].join( '/' );
	const searchPaths = [staticFilesFolder].concat( '!' + partialFilesFolder ).concat( '!' + viewFilesFolder ).concat( '!' + imageFilesFolder ).concat( '!' + languageFilesFolder );

	WATCHES.push({
		taskName: 'copy-static',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe( gulp.dest( BUILD_FOLDER ) )
		.pipe( gulp.dest( DISTRIBUTION_FOLDER ) );
});

registerTask('copy-images', () => {
	const imageFilesFolder = [ SRC_FOLDER, 'img', '*.*' ].join('/');
	const searchPaths = [ imageFilesFolder ];

	WATCHES.push({
		taskName: 'copy-images',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
		.pipe( gulp.dest( BUILD_FOLDER + '/img' ) )
		.pipe( gulp.dest( DISTRIBUTION_FOLDER + '/img' ) );
});

registerTask('build-index', () => {
	const staticFilesFolder = [ SRC_FOLDER, 'static', 'index.html' ].join( '/' );
	const searchPaths = [ staticFilesFolder ];

	WATCHES.push({
		taskName: 'build-index',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe(replace(/{{__CONFIG__}}/g, JSON.stringify( require('./config/resources')( ENV ), null, '\t' ) ) )
		.pipe(replace(/{{__ENV__}}/g, ENV ))
		.pipe(replace(/{{__VERSION__}}/g, ( Math.floor( Math.random() * 999999999 ) ) ))
		.pipe( gulp.dest( BUILD_FOLDER ) )
		.pipe( htmlmin({ collapseWhitespace: true }) )
		.pipe( gulp.dest( DISTRIBUTION_FOLDER ) );
});

registerTask('build-partials', () => {
	const partialFilesFolder = [ SRC_FOLDER, 'static', 'partials' ].join( '/' );
	const searchPaths = createRecursivePatchSpecForLinker( partialFilesFolder, 'html' );

	WATCHES.push({
		taskName: 'build-partials',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe( gulp.dest(
				[
					BUILD_FOLDER,
					'partials'
				].join('/')
			)
		)
		.pipe( htmlmin({ collapseWhitespace: true }) )
		.pipe( gulp.dest(
				[
					DISTRIBUTION_FOLDER,
					'partials'
				].join('/')
			)
		);
});

registerTask('build-views', () => {
	const viewFilesFolder = [ SRC_FOLDER, 'static', 'views' ].join( '/' );
	const searchPaths = createRecursivePatchSpecForLinker( viewFilesFolder, 'html' );

	WATCHES.push({
		taskName: 'build-views',
		paths: searchPaths
	});

	return gulp
		.src( searchPaths )
		.pipe( gulp.dest(
				[
					BUILD_FOLDER,
					'views'
				].join('/')
			)
		)
		.pipe( htmlmin({ collapseWhitespace: true }) )
		.pipe( gulp.dest(
				[
					DISTRIBUTION_FOLDER,
					'views'
				].join('/')
			)
		);
});

registerTask('build-app', () => {
	const appFolder = [ SRC_FOLDER, 'js' ].join( '/' );
	const appSearchPaths = createRecursivePatchSpecForLinker( appFolder, '.js' );
	const searchPaths = appSearchPaths.concat( '!' + [ SRC_FOLDER, 'js', 'lib' ].join( '/' ) );

	const BABEL_CONFIG = { presets: ["es2015", "stage-2"], plugins: ["syntax-async-functions", "transform-regenerator", "transform-es2015-parameters"] };

	WATCHES.push({
		taskName: 'build-app',
		paths: searchPaths
	});

	let build = browserify({
            entries: [ SRC_FOLDER, 'js', 'application.js'].join('/'),
            debug: true
        })
        .transform(
            babelify.configure(BABEL_CONFIG)
        )
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe( sourcemaps.init({
            loadMaps: true
        }) )
        .pipe( sourcemaps.write('./') )
        .pipe( gulp.dest(
				[
					BUILD_FOLDER,
					'js'
				].join('/')
			)
		);

	let dist = browserify({
            entries: [ SRC_FOLDER, 'js', 'application.js'].join('/'),
            debug: true
        })
        .transform(
            babelify.configure(BABEL_CONFIG)
        )
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
		.pipe( uglify().on('error', console.log) )
		.pipe( gulp.dest(
				[
					DISTRIBUTION_FOLDER,
					'js'
				].join('/')
			)
		);
	return es.concat( build, dist );
})

// WATCHER

if( ENV == TARGET.DEVELOPMENT ) {
	registerTask('watch', () => {
		WATCHES.forEach(( task ) => {
			gulp.watch( task.paths, [ task.taskName ] );
		});
	});
}

// BOOTSTRAP

gulp.task( 'default', TASKS );

