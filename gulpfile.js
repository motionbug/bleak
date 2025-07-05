const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const zip = require('gulp-zip');
const del = require('del');

// File paths
const paths = {
  styles: {
    src: 'assets/scss/**/*.scss',
    dest: 'assets/built/',
    main: 'assets/scss/screen.scss'
  },
  scripts: {
    src: 'assets/js/**/*.js',
    dest: 'assets/built/',
    main: 'assets/js/*.js'
  },
  images: {
    src: 'assets/images/**/*',
    dest: 'assets/built/images/'
  },
  dist: 'dist/'
};

// Clean assets
function clean() {
  return del([paths.styles.dest + '**/*', paths.images.dest + '**/*']);
}

// Process styles
function styles() {
  const plugins = [
    autoprefixer(),
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true
        }
      }]
    })
  ];

  return gulp.src(paths.styles.main)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest));
}

// Process scripts
function scripts() {
  return gulp.src(paths.scripts.main, {sourcemaps: true})
    .pipe(concat('site.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.scripts.dest, {sourcemaps: '.'}));
}

// Optimize images
function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
}

// Watch for changes
function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, images);
}

// Build theme
const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images)
);

// Package theme
function packageTheme() {
  return gulp.src([
    '**/*',
    '!node_modules/**',
    '!assets/src/**',
    '!.git/**',
    '!gulpfile.js',
    '!package.json',
    '!package-lock.json',
    '!.gitignore',
    '!.editorconfig',
    '!.eslintrc.json',
    '!.stylelintrc.json',
    '!.vscode/**',
    '!dist/**',
    '!yarn.lock',
    '!yarn-error.log',
    '!*.sublime-*',
    '!**/Thumbs.db'
  ], {dot: true})
    .pipe(zip('bleak.zip'))
    .pipe(gulp.dest(paths.dist));
}

// Export tasks
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watch = watch;
exports.build = build;
exports.zip = gulp.series(build, packageTheme);

exports.default = build;
