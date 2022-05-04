const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');


// Sass Task
function scssTask(){
  return src('src/scss/style.scss', { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(dest('dist/assets/css/', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src('src/js/common.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist/assets/js/', { sourcemaps: '.', allowEmpty: true, }));
}

function nunjucksTask() {
    return src('src/pages/**/*.+(html|njk)')
    .pipe(nunjucksRender({
        path: ['src/templates']
    }))
    .pipe(dest('dist'));
}

// Browsersync Tasks
function browsersyncServe(cb){
  browsersync.init({
    server: {
      baseDir: './dist'
    }
  });
  cb();
}

function browsersyncReload(cb){
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask(){
  watch('*.html', series(browsersyncReload));
  watch('./src/pages/**/*.+(html|njk)', series(nunjucksTask, browsersyncReload));
  watch('./src/templates/**/*.+(html|njk)', series(nunjucksTask, browsersyncReload));
  watch(['src/scss/**/*.scss', 'src/js/**/*.js'], series(scssTask, jsTask, browsersyncReload));
}

// Default Gulp task
exports.default = series(
  scssTask,
  jsTask,
  browsersyncServe,
  browsersyncReload,
  watchTask,
  nunjucksTask
);