var gulp = require('gulp'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    revDel = require('rev-del'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('run-sequence').use(gulp);


gulp.task('sass', function () {
    return gulp.src([
      'scss/all.scss',
      'scss/sl-main.scss'
      ])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('sass-prod', function () {
    return gulp.src(['scss/*'])
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('css-rev', function() {
    return gulp.src([
      'assets/styles/all.min.css',
      'assets/styles/sl-main.min.css'
      ])
    .pipe(rev())
    .pipe(gulp.dest('assets/styles/'))
    .pipe(rev.manifest('rev-manifest.twig'))
    .pipe(gulp.dest('blocks/'))
    .pipe(revDel({dest: 'assets/styles/'}))
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('watch', ['sass'], function() {
  gulp.watch('scss/**/*', ['sass']);
});

gulp.task('prod-build', function() {
    return runSequence('sass-prod','css-rev');
});

gulp.task('default', ['sass']);
