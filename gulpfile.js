/* -------------------------------------------------- */
/* IMPORT MODULES */
/* -------------------------------------------------- */
// External
var gulp = require('gulp');
var sass = require('gulp-sass');

// Internal
const ENV = require( './koal-env' );
const CONFIG = require ( './config/config' ); 


/* -------------------------------------------------- */
/* DECLARE TASKS */
/* -------------------------------------------------- */
gulp.task( 'default', [ 'sass', 'watch' ], function() {
	console.log( 'INSIDE TASK: `default`' );
} );


gulp.task( 'sass', function() {
	console.log( 'INSIDE TASK: `sass`' );

	return gulp.src( ENV.PATHS.THEMES.PATH + CONFIG.template + '/scss/styles.scss' )
		.pipe( sass( { outputStyle: 'expanded' } ) )
		.pipe( gulp.dest( './public/css/' ) );
} );


gulp.task( 'watch', function() {
	console.log( 'INSIDE TASK: `watch`' );

	gulp.watch( ENV.PATHS.THEMES.PATH + CONFIG.template + '/scss/**/*.scss', [ 'sass' ] );
} );
