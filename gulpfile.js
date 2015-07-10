/**
 * Setting up Gulp
 *
 * (I'm just assuming you already have Node installed.)
 *
 * 1. Install Gulp globally
 *
 *    $ npm install --global gulp
 *
 * 2. Install this project's node stuff:
 *
 *    $ npm install
 *
 * 3. Run `gulp` to compile stuff or `gulp watch` to start a watcher
 *
 * NOTES:
 *
 * - All source files should be in `client/`. They get output to `assets`, which
 *   should only contain built files.
 *
 * - If you have a question the first time you use this that isn't answered
 *   here, find the answer and add it to this list.
 *
 * - If you have assets that just need to be dumped in `assets`, add them to
 *   `client/lib`. (See the "lib" task below.)
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var bourbon = require('node-bourbon');
var autoprefix = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var del = require('del');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');

// Delete the assets folder
// No non-generated files allowed!
gulp.task('clean', function (cb) {
	del(['assets'], cb);
});
gulp.task('fonts', function () {
	return gulp.src('./client/fonts/**')
		.pipe(gulp.dest('./assets/fonts'));
});
gulp.task('images', function () {
	return gulp.src('./client/images/**')
		.pipe(gulp.dest('./assets/images'));
});
gulp.task('scripts', function () {
	return gulp.src('./client/scripts/**/*')
		.pipe(gulp.dest('./assets/scripts'));
});

// Hack the ability to import directories in Sass
// Find any _all.scss files and write @import statements
// for all other *.scss files in the same directory
//
// Import the whole directory with @import "somedir/all";
gulp.task('sass-includes', function (callback) {
	var all = '_all.scss';
	glob('./client/styles/**/' + all, function (error, files) {
		files.forEach(function (allFile) {
			// Add a banner to warn users
			fs.writeFileSync(allFile, '/** This is a dynamically generated file **/\n\n');

			var directory = path.dirname(allFile);
			var partials = fs.readdirSync(directory).filter(function (file) {
				return (
					// Exclude the dynamically generated file
					file !== all &&
					// Only include _*.scss files
					path.basename(file).substring(0, 1) === '_' &&
					path.extname(file) === '.scss'
				);
			});

			// Append import statements for each partial
			partials.forEach(function (partial) {
				fs.appendFileSync(allFile, '@import "' + partial + '";\n');
			});
		});
	});

	callback();
});

gulp.task('styles-misc', function () {
	return gulp.src(['./client/styles/**', '!./client/styles/**/*.scss'])
		.pipe(gulp.dest('./assets/styles'));
});

gulp.task('styles', ['sass-includes', 'styles-misc'], function () {
	return gulp.src(['./client/styles/**/*.scss', '!.client/styles/**/_*'])
		.pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: bourbon.includePaths,
			errLogToConsole: true
		}))
		.on('error', notify.onError({
			title: 'Sass Error',
			message: '<%= error.message %>'
		}))
		// This is a LOAD-BEARING minification!
		// @see https://github.com/sindresorhus/gulp-autoprefixer/issues/10#issuecomment-73187637
		.pipe(minifyCSS())
		.pipe(autoprefix()
			.on('error', notify.onError({
				title: 'Autoprefix Error',
				message: '<%= error.message %>'
			}))
		)
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./assets/styles'));
});

gulp.task('amp-watch', shell.task([
	'amp watch'
]));
gulp.task('amp-sync', shell.task([
	'amp sync'
]));

gulp.task('default', function (cb) {
	runSequence(
		[
			'fonts',
			'images',
			'styles',
			'scripts'
		],
		'amp-sync',
		cb
	);
});

gulp.task('watch', function () {
	gulp.watch('client/styles/**/!(_all).scss', ['styles']);
	gulp.watch('client/fonts/**/*', ['fonts']);
	gulp.watch('client/images/**/*', ['images']);
	gulp.watch('client/scripts/**/*', ['scripts']);
	gulp.start('amp-watch');
});
