const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const connect = require('gulp-connect');
const sass = require('gulp-sass')(require('sass'));
const clean = require('gulp-clean-css');
const order = require('gulp-order');
const pug = require('gulp-pug');
const webpack = require('webpack-stream');
const del = require('del');

require('dotenv').config()

const production = ((list) => {
  const args = list.slice(3);

  if (args.length > 0) {
    return args[0] === '--production';
  }

  return false;
})(process.argv);


const paths = {
  dist: './public/',
  src: './src',
};

function cleanDist() {
  return del(paths.dist);
}

function copyImages() {
  return gulp.src(paths.src + '/images/**/*')
    .pipe(gulp.dest(paths.dist + '/images/'));
}

function copyFonts() {
  return gulp.src(paths.src + '/fonts/**/*')
    .pipe(gulp.dest(paths.dist + '/fonts/'));
}

function stylesProcess() {
  return gulp.src(paths.src + '/styles/app.scss')
    .pipe(plumber(function (error) {
      console.error(error.message);
      this.emit('end');
    }))
    .pipe(sass())
    .pipe(clean())
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest(paths.dist));
}

function scriptsProcess() {
  return gulp.src(paths.src + '/scripts/**/*')
    .pipe(plumber((error) => {
      console.error(error.message);
      this.emit('end');
    }))
    .pipe(webpack({
      config: require('./webpack.config.js'),
    }))
    .pipe(uglify())
    .pipe(order([
      'scripts/data/*.js',
      'scripts/*.js'
    ], { base: paths.src }))
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(paths.dist));
}

function htmlProcess() {
  const data = {}

  data.rooturl = process.env.ROOTURL || '';
  data.baseurl = process.env.BASEURL || '';
  data.version = '?v=' + Math.random().toString(16).substring(2, 15);

  return gulp.src(paths.src + '/views/index.pug')
    .pipe(plumber())
    .pipe(pug({
      basedir: __dirname,
      data: data,
    }))
    .pipe(concat('index.html'))
    .pipe(gulp.dest(paths.dist))
}

gulp.task('watchFiles', function(done) {
  gulp.watch(
    paths.src + '/**/*',
    gulp.series(stylesProcess, scriptsProcess, htmlProcess)
  );

  gulp.watch(
    paths.src + '/images/**/*',
    gulp.series(copyImages)
  );

  gulp.watch(
    paths.src + '/fonts/**/*',
    gulp.series(copyFonts)
  );

  done();
})

gulp.task('connectServer', function(done) {
  connect.server({
    root: './public',
  });

  done();
});

// Build static files and watch changes by default.
const buildFiles = gulp.series(
  cleanDist, copyImages, copyFonts, stylesProcess, scriptsProcess, htmlProcess
);

// Watch file changes
const watchServer = gulp.series(
  buildFiles, 'connectServer', 'watchFiles',
);

exports.build = buildFiles;
exports.default = watchServer;
