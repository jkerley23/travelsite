var gulp = require('gulp');
var revDel = require('rev-del');
var runSequence = require('run-sequence').use(gulp);
var fs = require('fs');
var merge = require('merge-stream');
var webpack = require('webpack-stream');
var tapDiff = require('tap-diff');
var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('sass', function() {
  return gulp.src([
    'scss/all.scss',
    'scss/sl-main.scss'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('sass-prod', function() {
  return gulp.src(['scss/*'])
    .pipe($.sass({outputStyle: 'compressed'}).on('error', $.sass.logError))
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('css-rev', function() {
  return gulp.src([
    'assets/styles/all.min.css',
    'assets/styles/sl-main.min.css'
  ])
    .pipe($.rev())
    .pipe(gulp.dest('assets/styles/'))
    .pipe($.rev.manifest('rev-manifest.twig'))
    .pipe(gulp.dest('blocks/'))
    .pipe(revDel({dest: 'assets/styles/'}))
    .pipe(gulp.dest('assets/styles/'));
});

gulp.task('watch', ['sass'], function() {
  gulp.watch('scss/**/*', ['sass']);
});

gulp.task('prod-build', function() {
  return runSequence('sass-prod', 'css-rev');
});

gulp.task('watch-plugins', ['test', 'bundle-plugin-js'], function() {
  // FIXME:The tests stop running when a JS Error occurs.

  gulp.watch(['./cms-plugins/**/*.js', '!./cms-plugins/**/bundle.js'], ['test', 'bundle-plugin-js'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type); // eslint-disable-line no-console
    });
});

gulp.task('bundle-plugin-js', function() {
  // TODO: Remove add-mq-location hardcoding. Iterate like in build-plugin-final.

  return gulp.src('./cms-plugins/add-mq-location/src/add-mq-location.js')
    .pipe(webpack(Object.assign(
      require('./cms-plugins/add-mq-location/webpack.config.js'),
      {devtool: 'source-map'}
    )))
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulp.dest('./cms-plugins/add-mq-location/build/js-bundle'));
});

gulp.task('build-plugin-final', ['bundle-plugin-js'], function() {
  var pluginsPath = './cms-plugins/';

  var folderNames = fs
    .readdirSync(pluginsPath)
    .filter(function(folderName) {
      return folderName[0] !== '.'; // Filter out OSX system files. TODO: Extend for other OS types
    });

  var htmlMinOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    html5: true,
    processConditionalComments: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
  };

  // We ignore the next line because gulp-load-plugins names it this way - it has no way of knowing to capitalize it.
  var markers = new $.markers([ // eslint-disable-line new-cap
    {
      tag: 'blogsmith-header',
      re: /<!-- @BEGIN:blogsmith-header title="(.*)" -->[\s\S.]*<!-- @END:blogsmith-header -->/,
      replace: function(context, match, title) {
        return '<blogsmith:box><blogsmith:title>' + title + '</blogsmith:title><blogsmith:body>';
      }
    },
    {
      tag: 'blogsmith-footer',
      re: /<!-- @BEGIN:blogsmith-footer -->[\s\S.]*<!-- @END:blogsmith-footer -->/,
      replace: '</blogsmith:body></blogsmith:box>'
    }
  ]);

  var tasks = folderNames.map(function(folderName) {
    var path = pluginsPath + folderName + '/';

    return gulp.src(path + 'src/*.html')
      .pipe($.inlineSource())
      .pipe(markers.replaceMarkers())
      .pipe($.htmlmin(htmlMinOptions))
      // Added here instead of the Markers replacement because comments get stripped out during minification
      .pipe($.header('<!-- For the source, see Stash: MapQuest/TravelSite cms-plugins folder. -->\n'))
      .pipe(gulp.dest(path + '/build/dist/'));
  });

  return merge(tasks);
});

gulp.task('test', function() {
  // TODO: Add parachute tests
  return gulp.src(['./test-helpers/**/*.spec.js', './cms-plugins/**/*.spec.js'])
    .pipe($.tape({
      reporter: tapDiff()
    }));
});

gulp.task('default', ['sass']);
