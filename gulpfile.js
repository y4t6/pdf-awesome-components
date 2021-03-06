/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  include = require('gulp-include'),
  browserSync = require('browser-sync');

/*
 * Directories here
 */
var paths = {
  public: './public/',
  sass: './dev/sass/',
  css: './public/css/',
  data: './dev/data/'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */
gulp.task('pug', function () {
  return gulp.src('./dev/pages/*.pug')
    .pipe(data(function (file) {
    //  return require(paths.data + path.basename(file.path) + '.json');
    }))
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest(paths.public));
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'pug'], function () {
  browserSync({
    server: {
      baseDir: paths.public
    },
    notify: false
  });
});

/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '**/*.scss')
    .pipe(sass({
      includePaths: [paths.sass],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});
gulp.task('img', function() {
  return gulp.src('./dev/img/**/*')
     .pipe(gulp.dest('./public/img/'))
      .pipe(browserSync.reload({
        stream: true
      }));
});

gulp.task('js', function() {
  return gulp.src('./dev/js/app.js')
    .pipe(include())
      .on('error', console.log)
    .pipe(gulp.dest('./public/js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('component-sass', function () {
  return gulp.src('./dev/components/' + '**/*.scss')
    .pipe(sass({
      includePaths: ['./dev/components/'],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest('./public/components/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
gulp.task('component-pug', function () {
  return gulp.src('./dev/components/**/!(_)*.pug')
    .pipe(data(function (file) {
      //return require(paths.data + path.basename(file.path) + '.json');
    }))
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest('./public/components/'));
});


/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('./dev/**/*.pug', ['rebuild', 'component-pug']);
  gulp.watch('./dev/img/**/*', ['img']);
  gulp.watch('./dev/**/*.js', ['js']);
  gulp.watch('./dev/**/*.scss', ['rebuild','sass', 'component-sass']);
});

// Build task compile sass and pug.
gulp.task('build', ['sass', 'pug', 'img', 'js', 'component-pug', 'component-sass']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch', 'component-pug', 'img', 'component-sass', 'js']);
