var gulp       = require('gulp');
var uglify     = require('gulp-uglify');
var rename     = require('gulp-rename');
var eslint     = require('gulp-eslint');
var replace    = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('gulp-browserify');
var tape       = require('gulp-tape');

// path

var path = {
  src : {
    js       : 'src/oVali.js',
    test     : 'test/**/*.js'
  },
  build : {
    src      : 'build/',
    srcFile  : 'build/oVali.js',
    test     : 'build/test'
  },
  release : {
    main    : 'release/',
    minFile : 'release/oVali-min.js'
  },
  docs  : {
    main: 'docs/'
  }
};

// Error

function onError(e) {
  console.error(e);
  this.emit('end');
}

// Build JS

gulp.task('build-js', function(){
  return gulp.src(path.src.js)
//             .pipe(eslint())
//             .pipe(eslint.formatEach())
             .pipe(browserify({
               standalone: 'oVali',
               read: false
             }))
             .on('error', onError)
             .pipe(gulp.dest(path.build.src));
});

// Release JS

gulp.task('release-js', ['test'], function(){
  return gulp.src(path.build.srcFile)
             .on('error', onError)
             .pipe(gulp.dest(path.release.main))
             .pipe(sourcemaps.init())
             .pipe(uglify().on('error', function(e){
                console.log(e);
             }))
             .pipe(rename({
                 suffix: "-min"
              }))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest(path.release.main));
});

gulp.task('docs', ['release-js'], function () {
  gulp.src(path.release.minFile)
      .pipe(gulp.dest(path.docs.main));
});

// Test

gulp.task('test', ['build'], function() {
  return gulp.src(path.src.test)
    .pipe(eslint())
    .pipe(eslint.formatEach())
    //.pipe(eslint.failAfterError())
    .on('error', onError)
    .pipe(tape({
      nyc: true,
      bail: true
    }));
});

// ALL

gulp.task('default', ['build']);

gulp.task('build', ['build-js']);

gulp.task('release', ['docs']);